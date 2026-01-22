/**
 * COMPRESOR DE IMÁGENES - COMERCIAL LILIANA
 *
 * Este módulo comprime y redimensiona imágenes antes de subirlas
 * para optimizar el almacenamiento y la carga del sitio web.
 */

/**
 * Comprime una imagen manteniendo la calidad visual
 * @param {File} file - Archivo de imagen original
 * @param {Object} options - Opciones de compresión (opcional)
 * @returns {Promise<Blob>} Imagen comprimida como Blob
 */
async function compressImage(file, options = {}) {
  // Configuración por defecto
  const config = {
    maxWidth: options.maxWidth || CONFIG.IMAGE_COMPRESSION.maxWidth || 1200,
    maxHeight: options.maxHeight || CONFIG.IMAGE_COMPRESSION.maxHeight || 1200,
    quality: options.quality || CONFIG.IMAGE_COMPRESSION.quality || 0.8,
    outputFormat: options.outputFormat || CONFIG.IMAGE_COMPRESSION.outputFormat || 'webp'
  };

  return new Promise((resolve, reject) => {
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo no es una imagen válida'));
      return;
    }

    console.log(`📷 Comprimiendo imagen: ${file.name} (${formatFileSize(file.size)})`);

    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Error al leer el archivo'));

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => reject(new Error('Error al cargar la imagen'));

      img.onload = () => {
        try {
          // Calcular nuevas dimensiones manteniendo proporción
          let width = img.width;
          let height = img.height;

          if (width > config.maxWidth || height > config.maxHeight) {
            const aspectRatio = width / height;

            if (width > height) {
              width = config.maxWidth;
              height = width / aspectRatio;
            } else {
              height = config.maxHeight;
              width = height * aspectRatio;
            }

            // Asegurar que no exceda los límites
            if (width > config.maxWidth) {
              width = config.maxWidth;
              height = width / aspectRatio;
            }
            if (height > config.maxHeight) {
              height = config.maxHeight;
              width = height * aspectRatio;
            }
          }

          // Redondear dimensiones
          width = Math.round(width);
          height = Math.round(height);

          console.log(`📐 Dimensiones: ${img.width}x${img.height} → ${width}x${height}`);

          // Crear canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');

          // Configurar mejor calidad de renderizado
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Dibujar imagen redimensionada
          ctx.drawImage(img, 0, 0, width, height);

          // Determinar tipo MIME de salida
          let mimeType = 'image/jpeg';
          if (config.outputFormat === 'webp') {
            mimeType = 'image/webp';
          } else if (config.outputFormat === 'png') {
            mimeType = 'image/png';
          }

          // Convertir canvas a blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Error al generar la imagen comprimida'));
                return;
              }

              const originalSize = file.size;
              const compressedSize = blob.size;
              const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);

              console.log(`✅ Imagen comprimida: ${formatFileSize(compressedSize)} (${reduction}% menos)`);

              resolve(blob);
            },
            mimeType,
            config.quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Comprime múltiples imágenes
 * @param {FileList|Array<File>} files - Lista de archivos
 * @param {Object} options - Opciones de compresión
 * @param {Function} onProgress - Callback de progreso (opcional)
 * @returns {Promise<Array<Blob>>} Array de imágenes comprimidas
 */
async function compressMultipleImages(files, options = {}, onProgress = null) {
  const results = [];
  const total = files.length;

  console.log(`📦 Comprimiendo ${total} imágenes...`);

  for (let i = 0; i < total; i++) {
    try {
      const compressedBlob = await compressImage(files[i], options);
      results.push({
        success: true,
        blob: compressedBlob,
        originalName: files[i].name,
        index: i
      });

      if (onProgress) {
        onProgress(i + 1, total);
      }
    } catch (error) {
      console.error(`❌ Error al comprimir ${files[i].name}:`, error);
      results.push({
        success: false,
        error: error.message,
        originalName: files[i].name,
        index: i
      });
    }
  }

  const successful = results.filter(r => r.success).length;
  console.log(`✅ ${successful}/${total} imágenes comprimidas correctamente`);

  return results;
}

/**
 * Genera una URL de previsualización desde un Blob o File
 * @param {Blob|File} blob - Imagen
 * @returns {string} URL de previsualización
 */
function createPreviewURL(blob) {
  return URL.createObjectURL(blob);
}

/**
 * Libera memoria de una URL de previsualización
 * @param {string} url - URL creada con createPreviewURL
 */
function revokePreviewURL(url) {
  URL.revokeObjectURL(url);
}

/**
 * Valida que un archivo sea una imagen y no exceda el tamaño máximo
 * @param {File} file - Archivo a validar
 * @param {number} maxSizeMB - Tamaño máximo en MB (opcional, por defecto 10MB)
 * @returns {Object} Objeto con resultado de validación
 */
function validateImageFile(file, maxSizeMB = 10) {
  const errors = [];

  // Validar tipo
  if (!file.type.startsWith('image/')) {
    errors.push('El archivo no es una imagen');
  }

  // Validar tamaño
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    errors.push(`La imagen excede el tamaño máximo de ${maxSizeMB}MB`);
  }

  // Validar formato soportado
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!supportedFormats.includes(file.type)) {
    errors.push('Formato de imagen no soportado. Use JPG, PNG, WebP o GIF');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Redimensiona una imagen para crear un thumbnail
 * @param {File|Blob} file - Archivo de imagen
 * @param {number} size - Tamaño del lado más largo (cuadrado)
 * @returns {Promise<Blob>} Thumbnail generado
 */
async function createThumbnail(file, size = 150) {
  return compressImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    outputFormat: 'jpeg'
  });
}

/**
 * Convierte un File a base64
 * @param {File} file - Archivo
 * @returns {Promise<string>} String en base64
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convierte un Blob a File
 * @param {Blob} blob - Blob
 * @param {string} filename - Nombre del archivo
 * @returns {File} File object
 */
function blobToFile(blob, filename) {
  return new File([blob], filename, {
    type: blob.type,
    lastModified: Date.now()
  });
}

/**
 * Formatea el tamaño de archivo en formato legible
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Genera un nombre único para un archivo
 * @param {string} originalName - Nombre original
 * @returns {string} Nombre único con timestamp
 */
function generateUniqueFilename(originalName) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop().toLowerCase();
  const baseName = originalName.split('.').slice(0, -1).join('.');

  // Limpiar nombre base (solo letras, números y guiones)
  const cleanBaseName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 30);

  return `${cleanBaseName}-${timestamp}-${random}.${extension}`;
}

/**
 * Procesa una imagen para subida (comprimir + generar nombre único)
 * @param {File} file - Archivo original
 * @returns {Promise<Object>} Objeto con blob comprimido y nombre único
 */
async function prepareImageForUpload(file) {
  try {
    // Validar archivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Comprimir
    const compressedBlob = await compressImage(file);

    // Generar nombre único
    const uniqueName = generateUniqueFilename(file.name);

    // Convertir a File con nuevo nombre
    const compressedFile = blobToFile(compressedBlob, uniqueName);

    return {
      success: true,
      file: compressedFile,
      originalName: file.name,
      size: compressedFile.size,
      previewURL: createPreviewURL(compressedBlob)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Detecta si el navegador soporta WebP
 * @returns {Promise<boolean>} true si soporta WebP
 */
function supportsWebP() {
  return new Promise((resolve) => {
    const webP = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    const img = new Image();
    img.onload = () => resolve(img.width === 2);
    img.onerror = () => resolve(false);
    img.src = webP;
  });
}

// Detectar soporte de WebP al cargar
let webpSupported = false;
supportsWebP().then(supported => {
  webpSupported = supported;
  console.log(`WebP ${supported ? '✅ soportado' : '❌ no soportado'}`);
});
