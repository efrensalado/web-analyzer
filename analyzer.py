import requests
import time
from bs4 import BeautifulSoup
import re
from urllib.parse import urlparse
import ssl
import socket
from datetime import datetime

def analizar_url(url, repeticion=1):
    """
    Analiza una URL y retorna métricas de rendimiento, SEO, seguridad y accesibilidad.
    """
    start_time = time.time()
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, timeout=30, headers=headers)
        total_time = time.time() - start_time
        
        # Parsear el HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Métricas básicas
        content_size = len(response.content)
        text_size = len(soup.get_text())
        title = soup.title.string if soup.title else "Sin título"
        num_tags = len(soup.find_all())
        
        # Clasificar velocidad
        speed_rating = clasificar_velocidad(total_time)
        
        # Métricas de rendimiento
        performance_metrics = calcular_metricas_rendimiento(soup, response)
        
        # Métricas de SEO
        seo_metrics = calcular_metricas_seo(soup)
        
        # Métricas de seguridad
        security_metrics = calcular_metricas_seguridad(response)
        
        # Métricas de accesibilidad
        accessibility_metrics = calcular_metricas_accesibilidad(soup)
        
        # Información del servidor
        server_info = obtener_info_servidor(response)
        
        # Contar líneas de código HTML y caracteres (solo en la primera repetición)
        html_lines = 0
        html_chars = 0
        if repeticion == 1:
            html_content = str(soup)
            html_lines = len(html_content.split('\n'))
            html_chars = len(html_content)
        
        resultado = {
            'status': response.status_code,
            'response_time': round(total_time, 3),
            'size_bytes': content_size,
            'char_count': text_size,
            'title': title,
            'num_tags': num_tags,
            'error': None,
            'speed_rating': speed_rating,
            'load_time_ms': round(total_time * 1000, 0),
            'size_kb': round(content_size / 1024, 2),
            'compression_ratio': performance_metrics['compression_ratio'],
            'image_count': performance_metrics['image_count'],
            'script_count': performance_metrics['script_count'],
            'css_count': performance_metrics['css_count'],
            'external_resources': performance_metrics['external_resources'],
            'inline_styles': performance_metrics['inline_styles'],
            'inline_scripts': performance_metrics['inline_scripts'],
            'gzip_enabled': performance_metrics['gzip_enabled'],
            'redirect_count': performance_metrics['redirect_count'],
            'meta_description': seo_metrics['meta_description'],
            'meta_keywords': seo_metrics['meta_keywords'],
            'h1_count': seo_metrics['h1_count'],
            'h2_count': seo_metrics['h2_count'],
            'h3_count': seo_metrics['h3_count'],
            'canonical_url': seo_metrics['canonical_url'],
            'robots_meta': seo_metrics['robots_meta'],
            'og_tags': seo_metrics['og_tags'],
            'twitter_cards': seo_metrics['twitter_cards'],
            'https_enabled': security_metrics['https_enabled'],
            'security_headers': security_metrics['security_headers'],
            'ssl_grade': security_metrics['ssl_grade'],
            'xss_protection': security_metrics['xss_protection'],
            'content_security_policy': security_metrics['content_security_policy'],
            'alt_text_images': accessibility_metrics['alt_text_images'],
            'form_labels': accessibility_metrics['form_labels'],
            'aria_labels': accessibility_metrics['aria_labels'],
            'semantic_html': accessibility_metrics['semantic_html'],
            'color_contrast_issues': accessibility_metrics['color_contrast_issues'],
            'server': server_info['server'],
            'content_type': server_info['content_type'],
            'cache_headers': server_info['cache_headers'],
            'last_modified': server_info['last_modified'],
            'etag': server_info['etag'],
            'html_lines': html_lines,
            'html_chars': html_chars
        }
        
        return resultado
        
    except requests.exceptions.Timeout:
        return {
            'status': 0,
            'response_time': 30,
            'size_bytes': 0,
            'char_count': 0,
            'title': "Timeout",
            'num_tags': 0,
            'error': 'Timeout - La solicitud tardó más de 30 segundos',
            'speed_rating': 'MUY LENTO',
            'load_time_ms': 30000,
            'size_kb': 0,
            'compression_ratio': 0,
            'image_count': 0,
            'script_count': 0,
            'css_count': 0,
            'external_resources': 0,
            'inline_styles': 0,
            'inline_scripts': 0,
            'gzip_enabled': False,
            'redirect_count': 0,
            'meta_description': '',
            'meta_keywords': '',
            'h1_count': 0,
            'h2_count': 0,
            'h3_count': 0,
            'canonical_url': '',
            'robots_meta': '',
            'og_tags': 0,
            'twitter_cards': 0,
            'https_enabled': False,
            'security_headers': 0,
            'ssl_grade': 'F',
            'xss_protection': False,
            'content_security_policy': False,
            'alt_text_images': 0,
            'form_labels': 0,
            'aria_labels': 0,
            'semantic_html': False,
            'color_contrast_issues': 0,
            'server': '',
            'content_type': '',
            'cache_headers': 0,
            'last_modified': '',
            'etag': '',
            'html_lines': 0,
            'html_chars': 0
        }
        
    except Exception as e:
        return {
            'status': 0,
            'response_time': 0,
            'size_bytes': 0,
            'char_count': 0,
            'title': "Error",
            'num_tags': 0,
            'error': str(e),
            'speed_rating': 'ERROR',
            'load_time_ms': 0,
            'size_kb': 0,
            'compression_ratio': 0,
            'image_count': 0,
            'script_count': 0,
            'css_count': 0,
            'external_resources': 0,
            'inline_styles': 0,
            'inline_scripts': 0,
            'gzip_enabled': False,
            'redirect_count': 0,
            'meta_description': '',
            'meta_keywords': '',
            'h1_count': 0,
            'h2_count': 0,
            'h3_count': 0,
            'canonical_url': '',
            'robots_meta': '',
            'og_tags': 0,
            'twitter_cards': 0,
            'https_enabled': False,
            'security_headers': 0,
            'ssl_grade': 'F',
            'xss_protection': False,
            'content_security_policy': False,
            'alt_text_images': 0,
            'form_labels': 0,
            'aria_labels': 0,
            'semantic_html': False,
            'color_contrast_issues': 0,
            'server': '',
            'content_type': '',
            'cache_headers': 0,
            'last_modified': '',
            'etag': '',
            'html_lines': 0,
            'html_chars': 0
        }

def calcular_metricas_rendimiento(soup, response):
    """Calcula métricas relacionadas con el rendimiento del sitio"""
    
    # Contar recursos
    images = soup.find_all('img')
    scripts = soup.find_all('script')
    css_links = soup.find_all('link', rel='stylesheet')
    
    # Contar recursos externos
    external_resources = 0
    for img in images:
        if img.get('src') and (img['src'].startswith('http') or img['src'].startswith('//')):
            external_resources += 1
    
    for script in scripts:
        if script.get('src') and (script['src'].startswith('http') or script['src'].startswith('//')):
            external_resources += 1
    
    # Contar estilos y scripts inline
    inline_styles = len(soup.find_all('style'))
    inline_scripts = len([s for s in scripts if not s.get('src')])
    
    # Calcular ratio de compresión (estimado)
    text_size = len(soup.get_text())
    compression_ratio = round((text_size / len(response.content)) * 100, 2) if len(response.content) > 0 else 0
    
    return {
        'compression_ratio': compression_ratio,
        'image_count': len(images),
        'script_count': len(scripts),
        'css_count': len(css_links),
        'external_resources': external_resources,
        'inline_styles': inline_styles,
        'inline_scripts': inline_scripts,
        'gzip_enabled': 'gzip' in response.headers.get('Content-Encoding', '').lower(),
        'redirect_count': len(response.history)
    }

def calcular_metricas_seo(soup):
    """Calcula métricas relacionadas con SEO"""
    
    # Meta tags
    meta_description = soup.find('meta', attrs={'name': 'description'})
    meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
    canonical = soup.find('link', attrs={'rel': 'canonical'})
    robots = soup.find('meta', attrs={'name': 'robots'})
    
    # Open Graph tags
    og_tags = len(soup.find_all('meta', attrs={'property': re.compile(r'^og:')}))
    
    # Twitter Card tags
    twitter_cards = len(soup.find_all('meta', attrs={'name': re.compile(r'^twitter:')}))
    
    # Headings
    h1_count = len(soup.find_all('h1'))
    h2_count = len(soup.find_all('h2'))
    h3_count = len(soup.find_all('h3'))
    
    return {
        'meta_description': meta_description.get('content') if meta_description else None,
        'meta_keywords': meta_keywords.get('content') if meta_keywords else None,
        'canonical_url': canonical.get('href') if canonical else None,
        'robots_meta': robots.get('content') if robots else None,
        'og_tags': og_tags,
        'twitter_cards': twitter_cards,
        'h1_count': h1_count,
        'h2_count': h2_count,
        'h3_count': h3_count
    }

def calcular_metricas_seguridad(response):
    """Calcula métricas relacionadas con la seguridad"""
    
    # Verificar HTTPS
    https_enabled = response.url.startswith('https://')
    
    # Headers de seguridad
    headers = response.headers
    security_headers = {
        'X-Frame-Options': headers.get('X-Frame-Options'),
        'X-Content-Type-Options': headers.get('X-Content-Type-Options'),
        'X-XSS-Protection': headers.get('X-XSS-Protection'),
        'Strict-Transport-Security': headers.get('Strict-Transport-Security'),
        'Content-Security-Policy': headers.get('Content-Security-Policy'),
        'Referrer-Policy': headers.get('Referrer-Policy')
    }
    
    # Contar headers de seguridad presentes
    security_headers_count = sum(1 for v in security_headers.values() if v is not None)
    
    # Evaluar SSL (simplificado)
    ssl_grade = 'A' if https_enabled else 'F'
    
    return {
        'https_enabled': https_enabled,
        'security_headers': security_headers_count,
        'ssl_grade': ssl_grade,
        'xss_protection': headers.get('X-XSS-Protection') is not None,
        'content_security_policy': headers.get('Content-Security-Policy') is not None
    }

def calcular_metricas_accesibilidad(soup):
    """Calcula métricas relacionadas con la accesibilidad"""
    
    # Imágenes con alt text
    images = soup.find_all('img')
    images_with_alt = len([img for img in images if img.get('alt')])
    alt_text_ratio = round((images_with_alt / len(images)) * 100, 1) if images else 0
    
    # Formularios con labels
    forms = soup.find_all('form')
    form_labels = len(soup.find_all('label'))
    
    # ARIA labels
    aria_labels = len(soup.find_all(attrs={'aria-label': True}))
    
    # HTML semántico
    semantic_elements = len(soup.find_all(['nav', 'main', 'article', 'section', 'aside', 'header', 'footer']))
    
    # Problemas de contraste (simplificado - solo verificar si hay colores inline)
    inline_colors = len(soup.find_all(style=re.compile(r'color:')))
    
    return {
        'alt_text_images': f"{images_with_alt}/{len(images)} ({alt_text_ratio}%)",
        'form_labels': form_labels,
        'aria_labels': aria_labels,
        'semantic_html': semantic_elements,
        'color_contrast_issues': inline_colors
    }

def clasificar_velocidad(load_time):
    """Clasifica la velocidad del sitio web"""
    
    # Factores de clasificación
    time_score = 0
    
    # Puntuación por tiempo de carga
    if load_time < 1:
        time_score = 100
    elif load_time < 2:
        time_score = 80
    elif load_time < 3:
        time_score = 60
    elif load_time < 5:
        time_score = 40
    else:
        time_score = 20
    
    # Puntuación final
    final_score = time_score
    
    if final_score >= 90:
        return 'EXCELENTE'
    elif final_score >= 70:
        return 'BUENO'
    elif final_score >= 50:
        return 'REGULAR'
    elif final_score >= 30:
        return 'LENTO'
    else:
        return 'MUY LENTO'

def obtener_info_servidor(response):
    """Obtiene información del servidor y headers de cache"""
    server_info = {
        'server': response.headers.get('Server', 'Unknown'),
        'content_type': response.headers.get('Content-Type', 'Unknown'),
        'cache_headers': verificar_cache_headers(response.headers),
        'last_modified': response.headers.get('Last-Modified'),
        'etag': response.headers.get('ETag')
    }
    return server_info

def verificar_cache_headers(headers):
    """Verifica headers de cache"""
    cache_headers = []
    
    if headers.get('Cache-Control'):
        cache_headers.append('Cache-Control')
    if headers.get('Expires'):
        cache_headers.append('Expires')
    if headers.get('ETag'):
        cache_headers.append('ETag')
    if headers.get('Last-Modified'):
        cache_headers.append('Last-Modified')
    
    return len(cache_headers)
