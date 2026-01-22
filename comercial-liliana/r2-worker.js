/**
 * CLOUDFLARE WORKER - UPLOAD IMÁGENES A R2
 * Comercial Liliana
 *
 * Este Worker maneja la subida y eliminación de imágenes en Cloudflare R2
 *
 * CONFIGURACIÓN REQUERIDA:
 * 1. Crear un Worker en Cloudflare Dashboard
 * 2. Copiar y pegar este código
 * 3. Configurar el binding R2 (nombre: IMAGES_BUCKET)
 * 4. Configurar las variables de entorno (ver abajo)
 */

// ========== CONFIGURACIÓN ==========
// Estas variables deben configurarse en el Worker (Settings > Variables)
// ALLOWED_ORIGINS: Dominios permitidos para CORS (separados por coma)
// Ejemplo: "https://usuario.github.io,http://localhost:8080"

// ========== CORS HEADERS ==========
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Se sobrescribirá con el origen permitido
  'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

/**
 * Verifica si el origen está permitido
 */
function isOriginAllowed(origin, env) {
  // Si no hay configuración de orígenes, permitir todos (desarrollo)
  if (!env.ALLOWED_ORIGINS) {
    return true;
  }

  const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
  return allowedOrigins.includes(origin) || allowedOrigins.includes('*');
}

/**
 * Genera un nombre único para el archivo
 */
function generateUniqueFilename(originalName) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop().toLowerCase();

  // Limpiar nombre original
  const baseName = originalName
    .split('.')
    .slice(0, -1)
    .join('.')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 30);

  return `productos/${timestamp}-${random}-${baseName}.${extension}`;
}

/**
 * Maneja la subida de archivos
 */
async function handleUpload(request, env) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: 'No se proporcionó ningún archivo' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Tipo de archivo no permitido' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ success: false, error: 'El archivo excede el tamaño máximo de 10MB' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Generar nombre único
    const filename = generateUniqueFilename(file.name);

    // Subir a R2
    await env.IMAGES_BUCKET.put(filename, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Construir URL pública
    const publicUrl = `${env.R2_PUBLIC_URL || 'https://pub-XXXXX.r2.dev'}/${filename}`;

    console.log(`✅ Imagen subida: ${filename}`);

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        filename: filename,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('❌ Error al subir imagen:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor: ' + error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
}

/**
 * Maneja la eliminación de archivos
 */
async function handleDelete(request, env) {
  try {
    const body = await request.json();
    const imageUrl = body.url;

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'No se proporcionó URL de imagen' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Extraer nombre del archivo de la URL
    const filename = imageUrl.split('/').pop();

    // Verificar que el archivo existe
    const object = await env.IMAGES_BUCKET.get(filename);

    if (!object) {
      return new Response(
        JSON.stringify({ success: false, error: 'Imagen no encontrada' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Eliminar de R2
    await env.IMAGES_BUCKET.delete(filename);

    console.log(`✅ Imagen eliminada: ${filename}`);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('❌ Error al eliminar imagen:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor: ' + error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
}

/**
 * Maneja peticiones OPTIONS (CORS preflight)
 */
function handleOptions(request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Worker principal
 */
export default {
  async fetch(request, env) {
    // Obtener origen de la petición
    const origin = request.headers.get('Origin');

    // Verificar origen permitido
    if (origin && !isOriginAllowed(origin, env)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Origen no permitido' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Actualizar CORS headers con el origen específico
    if (origin) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
    }

    // Manejar preflight CORS
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    // Manejar subida de imágenes
    if (request.method === 'POST') {
      return handleUpload(request, env);
    }

    // Manejar eliminación de imágenes
    if (request.method === 'DELETE') {
      return handleDelete(request, env);
    }

    // Método no permitido
    return new Response(
      JSON.stringify({ success: false, error: 'Método no permitido' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  },
};

/**
 * ============================================
 * INSTRUCCIONES DE CONFIGURACIÓN
 * ============================================
 *
 * 1. CREAR BUCKET R2:
 *    - Ve a Cloudflare Dashboard > R2
 *    - Crea un nuevo bucket llamado "comercial-liliana-images"
 *    - Configura acceso público para lectura
 *
 * 2. CREAR WORKER:
 *    - Ve a Workers & Pages
 *    - Create Application > Create Worker
 *    - Nombra el worker: "upload-images"
 *    - Copia y pega este código en el editor
 *
 * 3. CONFIGURAR BINDING R2:
 *    - En el Worker, ve a Settings > Variables
 *    - En "R2 Bucket Bindings", agrega:
 *      Variable name: IMAGES_BUCKET
 *      R2 bucket: comercial-liliana-images
 *
 * 4. CONFIGURAR VARIABLES DE ENTORNO:
 *    - En Settings > Variables > Environment Variables
 *    - Agrega:
 *      Variable name: R2_PUBLIC_URL
 *      Value: https://pub-XXXXXX.r2.dev (tu URL pública de R2)
 *
 *      Variable name: ALLOWED_ORIGINS
 *      Value: https://tu-usuario.github.io,http://localhost:8080
 *
 * 5. ACTIVAR ACCESO PÚBLICO EN R2:
 *    - Ve a tu bucket en R2
 *    - Settings > Public Access
 *    - Habilita "Allow Access" y copia la URL pública
 *
 * 6. CONFIGURAR CORS EN R2 (si es necesario):
 *    - En el bucket, ve a Settings > CORS policy
 *    - Agrega una política:
 *      {
 *        "AllowedOrigins": ["*"],
 *        "AllowedMethods": ["GET", "HEAD"],
 *        "AllowedHeaders": ["*"],
 *        "MaxAgeSeconds": 3600
 *      }
 *
 * 7. DEPLOY:
 *    - Guarda y despliega el Worker
 *    - Copia la URL del Worker (ej: https://upload-images.tu-cuenta.workers.dev)
 *    - Pega esta URL en js/config.js en R2_WORKER_URL
 *
 * 8. PROBAR:
 *    - Intenta subir una imagen desde el panel de administración
 *    - Verifica que la imagen se muestre correctamente
 *
 * ============================================
 */
