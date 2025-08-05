from flask import Flask, render_template, request, jsonify
from analyzer import analizar_url
import uuid
from concurrent.futures import ProcessPoolExecutor, as_completed
import threading
import os
import json

app = Flask(__name__)
tasks = {}  # {"task_id": {"status": "processing", "progress": 0-100, "result": {}}


def ejecutar_analisis(task_id, payload):
    total = sum(url['repeticiones'] for url in payload['urls'])
    completados = 0
    resultados = {}

    with ProcessPoolExecutor() as executor:
        future_map = {}
        for item in payload['urls']:
            url = item['url']
            repeticiones = item['repeticiones']
            for _ in range(repeticiones):
                future = executor.submit(analizar_url, url, 1)
                future_map[future] = url

        for future in as_completed(future_map):
            url = future_map[future]
            resultado = future.result()  # Ahora retorna un solo resultado, no una lista
            if url not in resultados:
                resultados[url] = []
            resultados[url].append(resultado)
            completados += 1
            tasks[task_id]['progress'] = int((completados / total) * 100)

    tasks[task_id]['status'] = 'done'
    tasks[task_id]['result'] = resultados


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analizar-inicio', methods=['POST'])
def analizar_inicio():
    data = request.get_json()
    task_id = str(uuid.uuid4())
    tasks[task_id] = {'status': 'processing', 'progress': 0, 'result': {}}

    thread = threading.Thread(target=ejecutar_analisis, args=(task_id, data))
    thread.start()

    return jsonify({'task_id': task_id})

@app.route('/progreso/<task_id>')
def progreso(task_id):
    task = tasks.get(task_id)
    if not task:
        return jsonify({'error': 'ID no válido'}), 404
    return jsonify(task)

@app.route('/visualizar')
def visualizar():
    return render_template('visualizar.html')

@app.route('/tiempo-respuesta')
def tiempo_respuesta():
    return render_template('tiempo_respuesta.html')

@app.route('/procesar-resultados', methods=['POST'])
def procesar_resultados():
    try:
        # Obtener el archivo JSON subido
        if 'file' not in request.files:
            return jsonify({'error': 'No se proporcionó archivo'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No se seleccionó archivo'}), 400
        
        # Leer y parsear el JSON
        content = file.read().decode('utf-8')
        data = json.loads(content)
        
        # Procesar los datos para gráficos
        resultados_procesados = procesar_datos_para_graficos(data)
        
        return jsonify(resultados_procesados)
        
    except json.JSONDecodeError:
        return jsonify({'error': 'Archivo JSON inválido'}), 400
    except Exception as e:
        return jsonify({'error': f'Error procesando archivo: {str(e)}'}), 500

@app.route('/procesar-tiempo-respuesta', methods=['POST'])
def procesar_tiempo_respuesta():
    try:
        data = request.get_json()
        
        if not data or 'resultados' not in data:
            return jsonify({'success': False, 'error': 'Datos inválidos'})
        
        # Extraer solo los datos de tiempo de respuesta
        tiempo_respuesta_data = []
        
        for url, resultados in data['resultados'].items():
            for resultado in resultados:
                tiempo_respuesta_data.append({
                    'url': url,
                    'tiempo_respuesta': resultado.get('load_time_ms', 0)
                })
        
        return jsonify({
            'success': True,
            'data': tiempo_respuesta_data
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

def procesar_datos_para_graficos(data):
    """Procesa los datos JSON para generar información para gráficos"""
    
    # Datos para gráfico de tiempo de respuesta
    tiempos_respuesta = []
    urls_analizadas = []
    velocidades = []
    tamanos = []
    
    # Datos para líneas de código HTML (solo primera repetición)
    html_lines_data = []
    html_chars_data = []
    urls_html_data = []
    
    for url, resultados in data.items():
        for i, resultado in enumerate(resultados):
            if resultado.get('load_time_ms'):
                tiempos_respuesta.append(resultado['load_time_ms'])
                urls_analizadas.append(url)
                velocidades.append(resultado.get('speed_rating', 'N/A'))
                tamanos.append(resultado.get('size_kb', 0))
            
            # Solo tomar datos de líneas de código de la primera repetición
            if i == 0 and resultado.get('html_lines', 0) > 0:
                html_lines_data.append(resultado['html_lines'])
                html_chars_data.append(resultado['html_chars'])
                urls_html_data.append(url)
    
    # Estadísticas
    if tiempos_respuesta:
        tiempo_promedio = sum(tiempos_respuesta) / len(tiempos_respuesta)
        tiempo_min = min(tiempos_respuesta)
        tiempo_max = max(tiempos_respuesta)
        
        # Distribución de velocidades
        distribucion_velocidad = {}
        for velocidad in velocidades:
            if velocidad != 'N/A':
                distribucion_velocidad[velocidad] = distribucion_velocidad.get(velocidad, 0) + 1
        
        # Distribución de tamaños
        tamanos_por_rango = {
            '0-100 KB': 0,
            '100-500 KB': 0,
            '500-1000 KB': 0,
            '1000+ KB': 0
        }
        
        for tamano in tamanos:
            if tamano <= 100:
                tamanos_por_rango['0-100 KB'] += 1
            elif tamano <= 500:
                tamanos_por_rango['100-500 KB'] += 1
            elif tamano <= 1000:
                tamanos_por_rango['500-1000 KB'] += 1
            else:
                tamanos_por_rango['1000+ KB'] += 1
        
        # Estadísticas de líneas de código HTML
        html_stats = {}
        if html_lines_data:
            html_stats = {
                'total_urls_html': len(html_lines_data),
                'promedio_lineas': round(sum(html_lines_data) / len(html_lines_data), 0),
                'min_lineas': min(html_lines_data),
                'max_lineas': max(html_lines_data),
                'promedio_caracteres': round(sum(html_chars_data) / len(html_chars_data), 0),
                'min_caracteres': min(html_chars_data),
                'max_caracteres': max(html_chars_data)
            }
        
        return {
            'tiempos_respuesta': tiempos_respuesta,
            'urls_analizadas': urls_analizadas,
            'velocidades': velocidades,
            'tamanos': tamanos,
            'html_lines_data': html_lines_data,
            'html_chars_data': html_chars_data,
            'urls_html_data': urls_html_data,
            'estadisticas': {
                'promedio': round(tiempo_promedio, 2),
                'minimo': tiempo_min,
                'maximo': tiempo_max,
                'total_analisis': len(tiempos_respuesta)
            },
            'html_stats': html_stats,
            'distribucion_velocidad': distribucion_velocidad,
            'distribucion_tamanos': tamanos_por_rango
        }
    else:
        return {
            'error': 'No hay datos válidos para procesar'
        }


if __name__ == '__main__':
    print(f"Directorio actual: {os.getcwd()}")
    print(f"Templates existe: {os.path.exists('templates')}")
    print(f"Static existe: {os.path.exists('static')}")
    app.run(debug=True, port=5001)
