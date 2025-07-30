let resultadosGlobales = {};
let urlsPreview = [];

function previewData() {
  const fileInput = document.getElementById('fileInput');
  
  if (fileInput.files.length === 0) {
    document.getElementById('previewSection').style.display = 'none';
    return;
  }

  const reader = new FileReader();
  
  reader.onload = function (e) {
    try {
      const urls = JSON.parse(e.target.result);
      
      if (!Array.isArray(urls) || urls.length === 0) {
        throw new Error('El archivo debe contener un array de URLs');
      }

      urlsPreview = urls;
      mostrarVistaPrevia(urls);
      
    } catch (error) {
      console.error('Error parsing JSON:', error);
      mostrarNotificacion('Error al leer el archivo JSON: ' + error.message, 'error');
      document.getElementById('previewSection').style.display = 'none';
    }
  };

  reader.onerror = function() {
    mostrarNotificacion('Error al leer el archivo', 'error');
    document.getElementById('previewSection').style.display = 'none';
  };

  reader.readAsText(fileInput.files[0]);
}

function mostrarVistaPrevia(urls) {
  const previewSection = document.getElementById('previewSection');
  const previewStats = document.getElementById('previewStats');
  const previewTable = document.getElementById('previewTable');
  
  // Mostrar estadísticas
  previewStats.innerHTML = `
    <div class="stat-card">
      <div class="stat-number">${urls.length}</div>
      <div class="stat-label">URLs a analizar</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${document.getElementById('repeticiones').value}</div>
      <div class="stat-label">Repeticiones por URL</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${urls.length * parseInt(document.getElementById('repeticiones').value)}</div>
      <div class="stat-label">Total de análisis</div>
    </div>
  `;

  // Crear tabla de vista previa
  previewTable.innerHTML = '';
  
  const header = document.createElement('tr');
  ['#', 'URL', 'Dominio', 'Protocolo'].forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    header.appendChild(th);
  });
  previewTable.appendChild(header);

  urls.forEach((url, index) => {
    const row = document.createElement('tr');
    
    // Número
    const numCell = document.createElement('td');
    numCell.textContent = index + 1;
    row.appendChild(numCell);
    
    // URL
    const urlCell = document.createElement('td');
    urlCell.textContent = url;
    urlCell.style.maxWidth = '300px';
    urlCell.style.overflow = 'hidden';
    urlCell.style.textOverflow = 'ellipsis';
    urlCell.style.whiteSpace = 'nowrap';
    row.appendChild(urlCell);
    
    // Dominio
    const domainCell = document.createElement('td');
    try {
      const domain = new URL(url).hostname;
      domainCell.textContent = domain;
    } catch (e) {
      domainCell.textContent = 'URL inválida';
      domainCell.style.color = '#dc2626';
    }
    row.appendChild(domainCell);
    
    // Protocolo
    const protocolCell = document.createElement('td');
    try {
      const protocol = new URL(url).protocol.replace(':', '');
      const badge = document.createElement('span');
      badge.className = `status-badge ${protocol === 'https' ? 'status-success' : 'status-warning'}`;
      badge.textContent = protocol.toUpperCase();
      protocolCell.appendChild(badge);
    } catch (e) {
      protocolCell.textContent = 'N/A';
    }
    row.appendChild(protocolCell);
    
    previewTable.appendChild(row);
  });

  previewSection.style.display = 'block';
}

function enviar() {
  const fileInput = document.getElementById('fileInput');
  const repeticiones = parseInt(document.getElementById('repeticiones').value);
  
  if (fileInput.files.length === 0) {
    mostrarNotificacion('Por favor selecciona un archivo JSON', 'error');
    return;
  }

  if (repeticiones < 1 || repeticiones > 100) {
    mostrarNotificacion('Las repeticiones deben estar entre 1 y 100', 'error');
    return;
  }

  // Mostrar estado de carga
  document.getElementById('analyzeBtn').disabled = true;
  document.getElementById('analyzeBtn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
  document.getElementById('progressSection').style.display = 'block';
  document.getElementById('loading').classList.add('show');
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('resultsCard').style.display = 'none';
  document.getElementById('previewSection').style.display = 'none';

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const urls = JSON.parse(e.target.result);
      
      if (!Array.isArray(urls) || urls.length === 0) {
        throw new Error('El archivo debe contener un array de URLs');
      }

      const payload = {
        urls: urls.map(url => ({ url, repeticiones }))
      };

      fetch('/analizar-inicio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => {
        if (!res.ok) {
          throw new Error('Error en el servidor');
        }
        return res.json();
      })
      .then(data => {
        const taskId = data.task_id;
        consultarProgreso(taskId);
      })
      .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion('Error al iniciar el análisis: ' + error.message, 'error');
        resetearInterfaz();
      });
    } catch (error) {
      console.error('Error parsing JSON:', error);
      mostrarNotificacion('Error al leer el archivo JSON: ' + error.message, 'error');
      resetearInterfaz();
    }
  };

  reader.onerror = function() {
    mostrarNotificacion('Error al leer el archivo', 'error');
    resetearInterfaz();
  };

  reader.readAsText(fileInput.files[0]);
}

function consultarProgreso(taskId) {
  const intervalo = setInterval(() => {
    fetch(`/progreso/${taskId}`)
      .then(res => res.json())
      .then(data => {
        const progreso = data.progress;
        actualizarBarra(progreso);

        if (data.status === 'done') {
          clearInterval(intervalo);
          resultadosGlobales = data.result;
          mostrarResultadosTabla(resultadosGlobales);
          resetearInterfaz();
          habilitarBotonesExportacion();
          mostrarNotificacion('Análisis completado exitosamente', 'success');
        }
      })
      .catch(error => {
        console.error('Error consultando progreso:', error);
        clearInterval(intervalo);
        mostrarNotificacion('Error al consultar el progreso', 'error');
        resetearInterfaz();
      });
  }, 1000);
}

function actualizarBarra(valor) {
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  
  progressBar.style.width = valor + '%';
  progressText.textContent = valor + '% completado';
}

function mostrarResultadosTabla(data) {
  const div = document.getElementById('tablaResultados');
  const resultsCard = document.getElementById('resultsCard');
  const resultsStats = document.getElementById('resultsStats');
  
  div.innerHTML = '';

  if (Object.keys(data).length === 0) {
    div.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>No se encontraron resultados</h3></div>';
    resultsCard.style.display = 'block';
    return;
  }

  // Calcular estadísticas
  const stats = calcularEstadisticas(data);
  
  // Mostrar estadísticas
  resultsStats.innerHTML = `
    <div class="stat-card">
      <div class="stat-number">${stats.totalUrls}</div>
      <div class="stat-label">URLs analizadas</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${stats.totalRequests}</div>
      <div class="stat-label">Total de requests</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${stats.successRate}%</div>
      <div class="stat-label">Tasa de éxito</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${stats.avgResponseTime}ms</div>
      <div class="stat-label">Tiempo promedio</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${stats.avgSpeedRating}</div>
      <div class="stat-label">Velocidad promedio</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${stats.httpsPercentage}%</div>
      <div class="stat-label">HTTPS habilitado</div>
    </div>
  `;

  // Crear cards desplegables para cada URL
  for (const url in data) {
    const urlCard = document.createElement('div');
    urlCard.className = 'url-card';
    
    // Header del card con información básica
    const urlHeader = document.createElement('div');
    urlHeader.className = 'url-header';
    urlHeader.onclick = () => toggleUrlCard(urlCard);
    
    const urlTitle = document.createElement('h4');
    urlTitle.className = 'url-title';
    urlTitle.textContent = url;
    
    const urlBadges = document.createElement('div');
    urlBadges.className = 'url-badges';
    
    const firstResult = data[url][0];
    if (firstResult.speed_rating) {
      const speedBadge = document.createElement('span');
      speedBadge.className = `status-badge speed-${firstResult.speed_rating.toLowerCase().replace(' ', '-')}`;
      speedBadge.textContent = firstResult.speed_rating;
      urlBadges.appendChild(speedBadge);
    }
    
    if (firstResult.status) {
      const statusBadge = document.createElement('span');
      statusBadge.className = `status-badge ${firstResult.status >= 200 && firstResult.status < 300 ? 'status-success' : 'status-error'}`;
      statusBadge.textContent = firstResult.status;
      urlBadges.appendChild(statusBadge);
    }
    
    const toggleIcon = document.createElement('i');
    toggleIcon.className = 'fas fa-chevron-down toggle-icon';
    
    urlHeader.appendChild(urlTitle);
    urlHeader.appendChild(urlBadges);
    urlHeader.appendChild(toggleIcon);
    urlCard.appendChild(urlHeader);
    
    // Contenido desplegable
    const urlContent = document.createElement('div');
    urlContent.className = 'url-content';
    
    // Crear cards para cada repetición
    data[url].forEach((result, index) => {
      const repetitionCard = document.createElement('div');
      repetitionCard.className = 'repetition-card';
      
      const repetitionHeader = document.createElement('div');
      repetitionHeader.className = 'repetition-header';
      
      const repetitionTitle = document.createElement('h5');
      repetitionTitle.className = 'repetition-title';
      repetitionTitle.textContent = `Repetición ${index + 1}`;
      
      const repetitionToggle = document.createElement('button');
      repetitionToggle.className = 'repetition-toggle';
      repetitionToggle.innerHTML = '<i class="fas fa-chevron-down"></i>';
      repetitionToggle.onclick = () => toggleRepetitionCard(repetitionContent, repetitionToggle);
      
      repetitionHeader.appendChild(repetitionTitle);
      repetitionHeader.appendChild(repetitionToggle);
      repetitionCard.appendChild(repetitionHeader);
      
      // Contenido de la repetición
      const repetitionContent = document.createElement('div');
      repetitionContent.className = 'repetition-content';
      
      // Contenedor con scroll horizontal para las métricas
      const metricsContainer = document.createElement('div');
      metricsContainer.className = 'metrics-container';
      
      const metricsGrid = document.createElement('div');
      metricsGrid.className = 'metrics-grid';
      
      // Métricas básicas
      const basicMetrics = crearSeccionMetricas('Métricas Básicas', {
        'Status': result.status || 'N/A',
        'Tiempo de carga': result.load_time_ms ? `${result.load_time_ms}ms` : 'N/A',
        'Tamaño': result.size_kb ? `${result.size_kb} KB` : 'N/A',
        'Compresión': result.compression_ratio ? `${result.compression_ratio}%` : 'N/A',
        'GZIP': result.gzip_enabled ? 'Sí' : 'No',
        'Redirects': result.redirect_count || 0
      });
      metricsGrid.appendChild(basicMetrics);
      
      // Métricas de rendimiento
      const performanceMetrics = crearSeccionMetricas('Rendimiento', {
        'Imágenes': result.image_count || 0,
        'Scripts': result.script_count || 0,
        'CSS': result.css_count || 0,
        'Recursos externos': result.external_resources || 0,
        'Estilos inline': result.inline_styles || 0,
        'Scripts inline': result.inline_scripts || 0
      });
      metricsGrid.appendChild(performanceMetrics);
      
      // Métricas de SEO
      const seoMetrics = crearSeccionMetricas('SEO', {
        'Meta descripción': result.meta_description ? 'Sí' : 'No',
        'Meta keywords': result.meta_keywords ? 'Sí' : 'No',
        'URL canónica': result.canonical_url ? 'Sí' : 'No',
        'H1': result.h1_count || 0,
        'H2': result.h2_count || 0,
        'H3': result.h3_count || 0,
        'Open Graph': result.og_tags || 0,
        'Twitter Cards': result.twitter_cards || 0
      });
      metricsGrid.appendChild(seoMetrics);
      
      // Métricas de seguridad
      const securityMetrics = crearSeccionMetricas('Seguridad', {
        'HTTPS': result.https_enabled ? 'Sí' : 'No',
        'Headers de seguridad': result.security_headers || 0,
        'Grado SSL': result.ssl_grade || 'N/A',
        'Protección XSS': result.xss_protection ? 'Sí' : 'No',
        'CSP': result.content_security_policy ? 'Sí' : 'No'
      });
      metricsGrid.appendChild(securityMetrics);
      
      // Métricas de accesibilidad
      const accessibilityMetrics = crearSeccionMetricas('Accesibilidad', {
        'Alt text imágenes': result.alt_text_images || 'N/A',
        'Labels de formularios': result.form_labels || 0,
        'ARIA labels': result.aria_labels || 0,
        'HTML semántico': result.semantic_html || 0,
        'Problemas de contraste': result.color_contrast_issues || 0
      });
      metricsGrid.appendChild(accessibilityMetrics);
      
      // Información adicional
      const additionalMetrics = crearSeccionMetricas('Información Adicional', {
        'Servidor': result.server || 'N/A',
        'Tipo de contenido': result.content_type || 'N/A',
        'Headers de cache': result.cache_headers || 0,
        'Última modificación': result.last_modified || 'N/A',
        'ETag': result.etag ? 'Sí' : 'No'
      });
      metricsGrid.appendChild(additionalMetrics);
      
      // Agregar métricas de HTML si están disponibles
      if (result.html_lines && result.html_lines > 0) {
        const htmlMetrics = crearSeccionMetricas('Código HTML', {
          'Líneas de código': result.html_lines || 0,
          'Caracteres': result.html_chars ? result.html_chars.toLocaleString() : 0
        });
        metricsGrid.appendChild(htmlMetrics);
      }
      
      metricsContainer.appendChild(metricsGrid);
      repetitionContent.appendChild(metricsContainer);
      repetitionCard.appendChild(repetitionContent);
      urlContent.appendChild(repetitionCard);
    });
    
    urlCard.appendChild(urlContent);
    div.appendChild(urlCard);
  }

  resultsCard.style.display = 'block';
}

function crearSeccionMetricas(titulo, metricas) {
  const seccion = document.createElement('div');
  seccion.className = 'metric-section';
  
  const tituloElement = document.createElement('h5');
  tituloElement.textContent = titulo;
  seccion.appendChild(tituloElement);
  
  Object.entries(metricas).forEach(([label, value]) => {
    const fila = document.createElement('div');
    fila.className = 'metric-row';
    
    const labelElement = document.createElement('span');
    labelElement.className = 'metric-label';
    labelElement.textContent = label + ':';
    
    const valueElement = document.createElement('span');
    valueElement.className = 'metric-value';
    valueElement.textContent = value;
    
    fila.appendChild(labelElement);
    fila.appendChild(valueElement);
    seccion.appendChild(fila);
  });
  
  return seccion;
}

function toggleUrlCard(urlCard) {
  const content = urlCard.querySelector('.url-content');
  const icon = urlCard.querySelector('.toggle-icon');
  
  if (content.classList.contains('expanded')) {
    content.classList.remove('expanded');
    icon.classList.remove('rotated');
  } else {
    content.classList.add('expanded');
    icon.classList.add('rotated');
  }
}

function toggleRepetitionCard(content, toggle) {
  const icon = toggle.querySelector('i');
  
  if (content.classList.contains('expanded')) {
    content.classList.remove('expanded');
    icon.className = 'fas fa-chevron-down';
  } else {
    content.classList.add('expanded');
    icon.className = 'fas fa-chevron-up';
  }
}

function calcularEstadisticas(data) {
  let totalUrls = Object.keys(data).length;
  let totalRequests = 0;
  let successfulRequests = 0;
  let totalResponseTime = 0;
  let responseTimeCount = 0;
  let speedRatings = [];
  let httpsCount = 0;

  for (const url in data) {
    data[url].forEach(result => {
      totalRequests++;
      if (result.status && result.status >= 200 && result.status < 300) {
        successfulRequests++;
      }
      if (result.response_time) {
        totalResponseTime += result.response_time;
        responseTimeCount++;
      }
      if (result.speed_rating) {
        speedRatings.push(result.speed_rating);
      }
      if (result.https_enabled) {
        httpsCount++;
      }
    });
  }

  // Calcular velocidad promedio
  const speedRatingCounts = {};
  speedRatings.forEach(rating => {
    speedRatingCounts[rating] = (speedRatingCounts[rating] || 0) + 1;
  });
  
  const avgSpeedRating = Object.keys(speedRatingCounts).length > 0 
    ? Object.entries(speedRatingCounts).sort((a, b) => b[1] - a[1])[0][0]
    : 'N/A';

  return {
    totalUrls,
    totalRequests,
    successRate: totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 100) : 0,
    avgResponseTime: responseTimeCount > 0 ? Math.round((totalResponseTime / responseTimeCount) * 1000) : 0,
    avgSpeedRating,
    httpsPercentage: totalRequests > 0 ? Math.round((httpsCount / totalRequests) * 100) : 0
  };
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function exportarJSON() {
  if (Object.keys(resultadosGlobales).length === 0) {
    mostrarNotificacion('No hay resultados para exportar', 'error');
    return;
  }
  
  const blob = new Blob([JSON.stringify(resultadosGlobales, null, 2)], { type: 'application/json' });
  descargarArchivo(blob, 'resultados.json');
  mostrarNotificacion('Archivo JSON exportado exitosamente', 'success');
}

function exportarCSV() {
  if (Object.keys(resultadosGlobales).length === 0) {
    mostrarNotificacion('No hay resultados para exportar', 'error');
    return;
  }
  
  const headers = [
    "URL", "Repetición", "Status", "Tiempo (ms)", "Tamaño (KB)", "Velocidad", 
    "Imágenes", "Scripts", "CSS", "HTTPS", "Headers Seguridad", "SSL Grade",
    "Meta Description", "H1", "H2", "H3", "Alt Text", "ARIA Labels"
  ];
  
  const filas = [headers];
  
  for (const url in resultadosGlobales) {
    resultadosGlobales[url].forEach((r, idx) => {
      filas.push([
        url, 
        idx + 1,
        r.status ?? '',
        r.load_time_ms ?? '',
        r.size_kb ?? '',
        r.speed_rating ?? '',
        r.image_count ?? '',
        r.script_count ?? '',
        r.css_count ?? '',
        r.https_enabled ? 'Sí' : 'No',
        r.security_headers ?? '',
        r.ssl_grade ?? '',
        r.meta_description ? 'Sí' : 'No',
        r.h1_count ?? '',
        r.h2_count ?? '',
        r.h3_count ?? '',
        r.alt_text_images ?? '',
        r.aria_labels ?? ''
      ]);
    });
  }

  const contenidoCSV = filas.map(fila => fila.join(',')).join('\n');
  const blob = new Blob([contenidoCSV], { type: 'text/csv' });
  descargarArchivo(blob, 'resultados.csv');
  mostrarNotificacion('Archivo CSV exportado exitosamente', 'success');
}

function descargarArchivo(blob, nombreArchivo) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  a.click();
  URL.revokeObjectURL(url);
}

function resetearInterfaz() {
  document.getElementById('analyzeBtn').disabled = false;
  document.getElementById('analyzeBtn').innerHTML = '<i class="fas fa-play"></i> Iniciar Análisis';
  document.getElementById('loading').classList.remove('show');
}

function habilitarBotonesExportacion() {
  document.getElementById('exportJsonBtn').disabled = false;
  document.getElementById('exportCsvBtn').disabled = false;
}

function mostrarNotificacion(mensaje, tipo) {
  // Crear notificación temporal
  const notificacion = document.createElement('div');
  notificacion.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    z-index: 1000;
    animation: slideIn 0.3s ease;
    ${tipo === 'error' ? 'background: #dc2626;' : 'background: #059669;'}
  `;
  notificacion.textContent = mensaje;
  
  document.body.appendChild(notificacion);
  
  // Remover después de 3 segundos
  setTimeout(() => {
    notificacion.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(notificacion);
    }, 300);
  }, 3000);
}

// Agregar estilos para las animaciones de notificación
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);
