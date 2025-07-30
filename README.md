# 🌐 Web Analyzer

Un analizador web profesional que proporciona métricas avanzadas de rendimiento, SEO, seguridad y accesibilidad para sitios web.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Funcionalidades](#-funcionalidades)
- [API Endpoints](#-api-endpoints)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)

## ✨ Características

### 🔍 Análisis Completo
- **Métricas de Rendimiento**: Tiempo de respuesta, tamaño de contenido, compresión GZIP
- **Análisis SEO**: Meta tags, headings, Open Graph, Twitter Cards
- **Seguridad**: HTTPS, headers de seguridad, SSL grade
- **Accesibilidad**: Alt text, ARIA labels, HTML semántico
- **Código HTML**: Líneas de código y caracteres (independiente de repeticiones)

### 📊 Visualización Avanzada
- **Gráficos Interactivos**: Tiempo de respuesta, distribución de velocidades
- **Histogramas**: Distribución de frecuencias de tiempos
- **Gráficos de Código HTML**: Líneas y caracteres por URL
- **Exportación PNG**: Todos los gráficos exportables
- **Estadísticas en Tiempo Real**: Métricas agregadas y promedios

### 🎨 Interfaz Profesional
- **Diseño Responsivo**: Funciona en desktop, tablet y móvil
- **Cards Desplegables**: Información organizada y accesible
- **Scroll Horizontal**: Para múltiples repeticiones
- **Navegación Intuitiva**: Entre análisis y visualización

## 🚀 Instalación

### Prerrequisitos

#### 1. Instalar Python (macOS)
```bash
# Instalar Homebrew si no lo tienes
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Python
brew install python

# Verificar instalación
python3 --version
```

#### 2. Instalar Git (si no lo tienes)
```bash
brew install git
```

### Configuración del Proyecto

#### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd web_analyzer
```

#### 2. Crear Entorno Virtual
```bash
# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
source venv/bin/activate
```

#### 3. Instalar Dependencias
```bash
# Instalar requirements
pip install -r requirements.txt
```

#### 4. Verificar Instalación
```bash
# Verificar que todas las dependencias estén instaladas
pip list
```

## 🎯 Uso

### 1. Ejecutar la Aplicación
```bash
# Activar entorno virtual (si no está activado)
source venv/bin/activate

# Ejecutar la aplicación
python app.py
```

### 2. Acceder a la Aplicación
- **URL Principal**: `http://127.0.0.1:5001`
- **Vista de Visualización**: `http://127.0.0.1:5001/visualizar`

### 3. Realizar Análisis
1. **Seleccionar archivo JSON** con URLs a analizar
2. **Configurar repeticiones** (1-100 por URL)
3. **Iniciar análisis** y monitorear progreso
4. **Ver resultados** en cards desplegables
5. **Exportar datos** en JSON o CSV

### 4. Visualizar Gráficos
1. **Navegar a "Visualizar"**
2. **Subir archivo JSON** con resultados
3. **Generar gráficos** automáticamente
4. **Exportar gráficos** en PNG

## 🔧 Funcionalidades Detalladas

### Análisis de URLs

#### Métricas de Rendimiento
- **Tiempo de respuesta**: Milisegundos de carga
- **Tamaño de contenido**: KB transferidos
- **Ratio de compresión**: Eficiencia de compresión
- **Recursos externos**: Imágenes, scripts, CSS
- **GZIP habilitado**: Compresión del servidor
- **Redirects**: Número de redirecciones

#### Métricas SEO
- **Meta descripción**: Presencia y contenido
- **Meta keywords**: Palabras clave
- **URL canónica**: URL canónica definida
- **Headings**: H1, H2, H3 count
- **Open Graph**: Tags de redes sociales
- **Twitter Cards**: Metadatos de Twitter

#### Métricas de Seguridad
- **HTTPS**: Protocolo seguro
- **Headers de seguridad**: X-Frame-Options, CSP, etc.
- **SSL Grade**: Calificación SSL
- **Protección XSS**: Headers de protección
- **Content Security Policy**: Políticas de seguridad

#### Métricas de Accesibilidad
- **Alt text**: Texto alternativo en imágenes
- **Labels de formularios**: Etiquetas accesibles
- **ARIA labels**: Atributos de accesibilidad
- **HTML semántico**: Elementos semánticos
- **Contraste de colores**: Problemas de contraste

#### Código HTML (Independiente de Repeticiones)
- **Líneas de código**: Número de líneas HTML
- **Caracteres**: Total de caracteres del código
- **Solo primera repetición**: Datos únicos por URL

### Visualización de Datos

#### Gráficos Disponibles
1. **Tiempo de Respuesta**: Línea temporal por URL
2. **Histograma**: Distribución de frecuencias
3. **Distribución de Velocidades**: Gráfico de dona
4. **Distribución de Tamaños**: Gráfico de barras
5. **Líneas de Código HTML**: Barras por URL
6. **Caracteres HTML**: Barras por URL

#### Estadísticas Generadas
- **Total de análisis**: Número de requests
- **Tiempo promedio**: Promedio de respuesta
- **Tiempo mínimo/máximo**: Rangos de rendimiento
- **Distribución de velocidades**: Porcentajes por categoría
- **Métricas HTML**: Promedios de líneas y caracteres

## 🔌 API Endpoints

### Rutas Principales
- `GET /` - Página principal del analizador
- `GET /visualizar` - Vista de visualización de gráficos
- `POST /analizar-inicio` - Iniciar análisis de URLs
- `GET /progreso/<task_id>` - Consultar progreso del análisis
- `POST /procesar-resultados` - Procesar JSON para gráficos

### Parámetros de Entrada

#### Análisis de URLs
```json
{
  "urls": [
    {
      "url": "https://ejemplo.com",
      "repeticiones": 3
    }
  ]
}
```

#### Respuesta de Progreso
```json
{
  "status": "processing|done",
  "progress": 75,
  "result": {
    "https://ejemplo.com": [
      {
        "load_time_ms": 1250,
        "speed_rating": "BUENO",
        "html_lines": 1500,
        "html_chars": 45000
      }
    ]
  }
}
```

## 📁 Estructura del Proyecto

```
web_analyzer/
├── app.py                 # Aplicación principal Flask
├── analyzer.py            # Lógica de análisis de URLs
├── requirements.txt       # Dependencias Python
├── README.md             # Documentación del proyecto
├── static/
│   └── script.js         # JavaScript del frontend
├── templates/
│   ├── index.html        # Página principal
│   └── visualizar.html   # Vista de visualización
├── jsons/                # Archivos JSON de ejemplo
│   ├── prod_urls.json
│   ├── uat_urls.json
│   └── uat_urls_v2.json
└── venv/                 # Entorno virtual (generado)
```

## 🛠 Tecnologías Utilizadas

### Backend
- **Python 3.8+**: Lenguaje principal
- **Flask**: Framework web
- **requests**: Cliente HTTP
- **BeautifulSoup4**: Parsing HTML
- **ProcessPoolExecutor**: Procesamiento paralelo

### Frontend
- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos y responsivos
- **JavaScript ES6+**: Interactividad
- **Chart.js**: Gráficos interactivos
- **Font Awesome**: Iconos
- **Google Fonts**: Tipografía

### Características Técnicas
- **Procesamiento paralelo**: Análisis concurrente de URLs
- **Progreso en tiempo real**: Actualizaciones asíncronas
- **Exportación de datos**: JSON y CSV
- **Exportación de gráficos**: PNG de alta calidad
- **Responsive design**: Adaptable a todos los dispositivos

## 📊 Ejemplos de Uso

### Archivo JSON de Entrada
```json
[
  "https://www.google.com",
  "https://www.github.com",
  "https://www.stackoverflow.com"
]
```

### Configuración de Análisis
- **Repeticiones**: 3 por URL
- **Timeout**: 30 segundos por request
- **User-Agent**: Navegador realista
- **Headers**: Configuración completa

### Resultados Esperados
- **Tiempo de análisis**: 1-5 minutos para 10 URLs
- **Métricas por URL**: 25+ métricas diferentes
- **Gráficos generados**: 6 tipos de visualizaciones
- **Exportaciones**: JSON, CSV, PNG

## 🔍 Troubleshooting

### Problemas Comunes

#### Error: "python: command not found"
```bash
# Instalar Python con Homebrew
brew install python

# Verificar PATH
echo $PATH
```

#### Error: "ModuleNotFoundError"
```bash
# Activar entorno virtual
source venv/bin/activate

# Reinstalar dependencias
pip install -r requirements.txt
```

#### Error: "Address already in use"
```bash
# Terminar proceso Flask
pkill -f "python app.py"

# O cambiar puerto en app.py
app.run(debug=True, port=5002)
```

#### Error: "Permission denied"
```bash
# Dar permisos de ejecución
chmod +x app.py

# O ejecutar con python3
python3 app.py
```

## 📈 Métricas de Rendimiento

### Clasificación de Velocidad
- **EXCELENTE**: < 1 segundo
- **BUENO**: 1-2 segundos
- **REGULAR**: 2-3 segundos
- **LENTO**: 3-5 segundos
- **MUY LENTO**: > 5 segundos

### Factores de Análisis
- **Tiempo de respuesta**: 40% del score
- **Tamaño de contenido**: 30% del score
- **Recursos externos**: 30% del score

## 🤝 Contribuciones

### Cómo Contribuir
1. **Fork** el repositorio
2. **Crear** una rama para tu feature
3. **Commit** tus cambios
4. **Push** a la rama
5. **Crear** un Pull Request

### Estándares de Código
- **Python**: PEP 8
- **JavaScript**: ESLint
- **HTML/CSS**: Validación W3C
- **Documentación**: Docstrings completos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

### Contacto
- **Issues**: GitHub Issues
- **Documentación**: README.md
- **Ejemplos**: Carpeta `jsons/`

### Recursos Adicionales
- **Flask Documentation**: https://flask.palletsprojects.com/
- **Chart.js Documentation**: https://www.chartjs.org/
- **BeautifulSoup Documentation**: https://www.crummy.com/software/BeautifulSoup/

---

**Web Analyzer Pro** - Análisis web profesional y visualización avanzada de métricas de rendimiento, SEO, seguridad y accesibilidad. 