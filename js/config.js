/**
 * ARCHIVO DE CONFIGURACIÓN - COMERCIAL LILIANA
 *
 * IMPORTANTE: Completa este archivo con tus credenciales reales
 * NO subas este archivo a GitHub si contiene información sensible
 */

const CONFIG = {
  // ========== SUPABASE ==========
  // Obtén estas credenciales de: https://app.supabase.com/project/_/settings/api
  SUPABASE_URL: 'https://cwjnnmugptgexjdfapwu.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3am5ubXVncHRnZXhqZGZhcHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMTY5OTksImV4cCI6MjA4NDY5Mjk5OX0.okPfypJcnS9mKsH5olj937b8wKS79jXSG8yqO41lV3M',

  // ========== CLOUDFLARE R2 ==========
  // URL pública de tu bucket R2
  R2_PUBLIC_URL: 'https://pub-4fd8c987119d4406a1aed35f80595b94.r2.dev',

  // Nombre de tu bucket
  R2_BUCKET_NAME: 'comercial-liliana-images',

  // URL del Worker para subir imágenes (ver r2-worker.js)
  R2_WORKER_URL: 'https://upload-images.huidobroabdon.workers.dev',

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
