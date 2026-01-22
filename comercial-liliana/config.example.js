/**
 * PLANTILLA DE CONFIGURACIÓN - COMERCIAL LILIANA
 *
 * INSTRUCCIONES:
 * 1. Copia este archivo y renómbralo a "config.js"
 * 2. Completa todos los valores según tus servicios configurados
 * 3. NO subas config.js a GitHub (está en .gitignore)
 */

const CONFIG = {
  // ========== SUPABASE ==========
  // Obtén estas credenciales de: https://app.supabase.com/project/_/settings/api
  SUPABASE_URL: 'https://tu-proyecto.supabase.co',
  SUPABASE_ANON_KEY: 'tu-clave-anonima-aqui-es-muy-larga',

  // ========== CLOUDFLARE R2 ==========
  // URL pública de tu bucket R2
  R2_PUBLIC_URL: 'https://pub-xxxxxxxxxxxxxxxx.r2.dev',

  // Nombre de tu bucket
  R2_BUCKET_NAME: 'comercial-liliana-images',

  // URL del Worker para subir imágenes (ver r2-worker.js)
  R2_WORKER_URL: 'https://upload-images.tu-cuenta.workers.dev',

  // ========== WHATSAPP ==========
  // Número de WhatsApp con código de país (sin signos + ni espacios)
  WHATSAPP_NUMBER: '51934634196',

  // ========== CONFIGURACIÓN GENERAL ==========
  // Número de productos por página
  PRODUCTS_PER_PAGE: 12,

  // Intervalo de rotación del carrusel en milisegundos
  CAROUSEL_INTERVAL: 3000,

  // Mensajes rotativos del banner promocional
  PROMO_MESSAGES: [
    '¡Pregunta por nuestras OFERTAS especiales! 🎉',
    '¡Descuentos exclusivos en muebles! 💰',
    '¡Escríbenos por WhatsApp y cotiza! 📱',
    'Nuevos productos cada semana 🆕'
  ],

  // Intervalo de cambio de mensaje del banner (ms)
  PROMO_BANNER_INTERVAL: 4000,

  // ========== COMPRESIÓN DE IMÁGENES ==========
  IMAGE_COMPRESSION: {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8,
    outputFormat: 'webp'
  },

  // ========== GRUPOS DE CATEGORÍAS ==========
  CATEGORY_GROUPS: {
    dormitorio: {
      name: 'Dormitorio',
      icon: '🛏️',
      color: '#6B9DC2'
    },
    sala_comedor: {
      name: 'Sala y Comedor',
      icon: '🏠',
      color: '#2C4A6B'
    },
    organizacion: {
      name: 'Organización',
      icon: '🗄️',
      color: '#D4A96A'
    }
  }
};

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
