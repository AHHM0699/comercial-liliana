/**
 * STORAGE - CLOUDFLARE R2 - COMERCIAL LILIANA
 *
 * Este módulo maneja la subida y gestión de imágenes en Cloudflare R2
 * a través de un Worker configurado.
 */

/**
 * Sube una imagen a Cloudflare R2
 * @param {File|Blob} file - Archivo de imagen
 * @param {Function} onProgress - Callback de progreso (opcional)
 * @returns {Promise<Object>} URL de la imagen subida
 */
async function uploadImage(file, onProgress = null) {
  try {
    console.log(`📤 Subiendo imagen: ${file.name || 'blob'}`);

    // Crear FormData
    const formData = new FormData();
    formData.append('file', file, file.name || 'image.webp');

    // Configurar XMLHttpRequest para seguimiento de progreso
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Evento de progreso
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });

      // Evento de carga completada
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);

            if (response.success) {
              console.log(`✅ Imagen subida: ${response.url}`);
              resolve({
                success: true,
                url: response.url,
                filename: response.filename || file.name
              });
            } else {
              throw new Error(response.error || 'Error desconocido al subir imagen');
            }
          } catch (error) {
            reject(new Error('Error al procesar respuesta del servidor'));
          }
        } else {
          reject(new Error(`Error HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      });

      // Evento de error
      xhr.addEventListener('error', () => {
        reject(new Error('Error de red al subir la imagen'));
      });

      // Evento de cancelación
      xhr.addEventListener('abort', () => {
        reject(new Error('Subida cancelada'));
      });

      // Enviar petición
      xhr.open('POST', CONFIG.R2_WORKER_URL);
      xhr.send(formData);
    });
  } catch (error) {
    console.error('❌ Error al subir imagen:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Sube múltiples imágenes a R2
 * @param {Array<File|Blob>} files - Array de archivos
 * @param {Function} onProgress - Callback de progreso global (opcional)
 * @returns {Promise<Array<Object>>} Array de resultados
 */
async function uploadMultipleImages(files, onProgress = null) {
  const results = [];
  const total = files.length;

  console.log(`📦 Subiendo ${total} imágenes...`);

  for (let i = 0; i < total; i++) {
    try {
      const result = await uploadImage(files[i], (percent) => {
        if (onProgress) {
          // Progreso global: (imágenes completadas + progreso actual) / total
          const globalProgress = ((i + percent / 100) / total) * 100;
          onProgress(globalProgress, i + 1, total);
        }
      });

      results.push({
        success: result.success,
        url: result.url,
        filename: result.filename,
        index: i
      });
    } catch (error) {
      console.error(`❌ Error al subir imagen ${i + 1}:`, error);
      results.push({
        success: false,
        error: error.message,
        index: i
      });
    }
  }

  const successful = results.filter(r => r.success).length;
  console.log(`✅ ${successful}/${total} imágenes subidas correctamente`);

  return results;
}

/**
 * Elimina una imagen de R2
 * @param {string} imageUrl - URL completa de la imagen
 * @returns {Promise<Object>} Resultado de la operación
 */
async function deleteImage(imageUrl) {
  try {
    console.log(`🗑️ Eliminando imagen: ${imageUrl}`);

    const response = await fetch(CONFIG.R2_WORKER_URL, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: imageUrl })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Imagen eliminada correctamente');
      return { success: true };
    } else {
      throw new Error(data.error || 'Error al eliminar imagen');
    }
  } catch (error) {
    console.error('❌ Error al eliminar imagen:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Elimina múltiples imágenes de R2
 * @param {Array<string>} imageUrls - Array de URLs de imágenes
 * @returns {Promise<Array<Object>>} Array de resultados
 */
async function deleteMultipleImages(imageUrls) {
  const results = [];

  console.log(`🗑️ Eliminando ${imageUrls.length} imágenes...`);

  for (const url of imageUrls) {
    const result = await deleteImage(url);
    results.push({
      url: url,
      success: result.success,
      error: result.error
    });
  }

  const successful = results.filter(r => r.success).length;
  console.log(`✅ ${successful}/${imageUrls.length} imágenes eliminadas`);

  return results;
}

/**
 * Obtiene la URL completa de una imagen desde R2
 * @param {string} filename - Nombre del archivo
 * @returns {string} URL completa
 */
function getImageURL(filename) {
  if (!filename) return '';

  // Si ya es una URL completa, devolverla tal cual
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }

  // Si no, construir la URL
  return `${CONFIG.R2_PUBLIC_URL}/${filename}`;
}

/**
 * Extrae el nombre de archivo de una URL de R2
 * @param {string} url - URL completa
 * @returns {string} Nombre del archivo
 */
function extractFilenameFromURL(url) {
  if (!url) return '';

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return pathname.substring(pathname.lastIndexOf('/') + 1);
  } catch (error) {
    // Si no es una URL válida, asumir que es solo el nombre del archivo
    return url;
  }
}

/**
 * Verifica si una URL de imagen es accesible
 * @param {string} url - URL de la imagen
 * @returns {Promise<boolean>} true si la imagen es accesible
 */
async function checkImageExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error al verificar imagen:', error);
    return false;
  }
}

/**
 * Prepara y sube una imagen (comprimir + subir)
 * @param {File} file - Archivo original
 * @param {Function} onProgress - Callback de progreso (opcional)
 * @returns {Promise<Object>} Resultado con URL de la imagen
 */
async function prepareAndUploadImage(file, onProgress = null) {
  try {
    // Paso 1: Validar y comprimir (50% del progreso)
    if (onProgress) onProgress(0, 'Comprimiendo imagen...');

    const prepared = await prepareImageForUpload(file);

    if (!prepared.success) {
      throw new Error(prepared.error);
    }

    if (onProgress) onProgress(50, 'Subiendo imagen...');

    // Paso 2: Subir a R2 (50% del progreso restante)
    const uploadResult = await uploadImage(prepared.file, (uploadPercent) => {
      if (onProgress) {
        const totalProgress = 50 + (uploadPercent / 2);
        onProgress(totalProgress, 'Subiendo imagen...');
      }
    });

    if (!uploadResult.success) {
      throw new Error(uploadResult.error);
    }

    if (onProgress) onProgress(100, 'Completado');

    // Limpiar URL de previsualización
    revokePreviewURL(prepared.previewURL);

    return {
      success: true,
      url: uploadResult.url,
      filename: uploadResult.filename,
      originalSize: file.size,
      compressedSize: prepared.size
    };
  } catch (error) {
    console.error('❌ Error en prepareAndUploadImage:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Prepara y sube múltiples imágenes
 * @param {FileList|Array<File>} files - Lista de archivos
 * @param {Function} onProgress - Callback de progreso (opcional)
 * @returns {Promise<Array<Object>>} Array de resultados
 */
async function prepareAndUploadMultipleImages(files, onProgress = null) {
  const results = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const file = files[i];

    const result = await prepareAndUploadImage(file, (progress, message) => {
      if (onProgress) {
        onProgress(i + 1, total, progress, message);
      }
    });

    results.push({
      ...result,
      originalName: file.name,
      index: i
    });
  }

  return results;
}

/**
 * Obtiene un thumbnail optimizado de una URL
 * (Útil si implementas transformaciones en Cloudflare)
 * @param {string} url - URL de la imagen original
 * @param {number} width - Ancho del thumbnail
 * @param {number} height - Alto del thumbnail
 * @returns {string} URL del thumbnail
 */
function getThumbnailURL(url, width = 150, height = 150) {
  // Por ahora devuelve la URL original
  // Si configuras Cloudflare Image Resizing, puedes agregar parámetros
  // Ejemplo: return `${url}?width=${width}&height=${height}&fit=cover`;
  return url;
}

/**
 * Optimiza una URL de imagen para carga
 * @param {string} url - URL original
 * @param {Object} options - Opciones de optimización
 * @returns {string} URL optimizada
 */
function optimizeImageURL(url, options = {}) {
  if (!url) return '';

  // Configuración por defecto
  const opts = {
    width: options.width,
    height: options.height,
    quality: options.quality || 80,
    format: options.format || 'auto'
  };

  // Si Cloudflare Image Resizing está configurado, agregar parámetros
  // Por ahora, devolver la URL original
  return url;
}

/**
 * Valida la configuración de R2
 * @returns {boolean} true si la configuración es válida
 */
function validateR2Config() {
  const errors = [];

  if (!CONFIG.R2_WORKER_URL || CONFIG.R2_WORKER_URL.includes('tu-')) {
    errors.push('R2_WORKER_URL no está configurado');
  }

  if (!CONFIG.R2_PUBLIC_URL || CONFIG.R2_PUBLIC_URL.includes('tu-')) {
    errors.push('R2_PUBLIC_URL no está configurado');
  }

  if (!CONFIG.R2_BUCKET_NAME) {
    errors.push('R2_BUCKET_NAME no está configurado');
  }

  if (errors.length > 0) {
    console.error('❌ Errores de configuración de R2:', errors);
    return false;
  }

  console.log('✅ Configuración de R2 válida');
  return true;
}

// Validar configuración al cargar
if (typeof CONFIG !== 'undefined') {
  validateR2Config();
}
