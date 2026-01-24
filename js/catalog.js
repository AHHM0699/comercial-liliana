/**
 * CATÁLOGO PÚBLICO - COMERCIAL LILIANA
 *
 * Este archivo maneja toda la lógica del catálogo público:
 * - Carga de productos y categorías
 * - Filtrado y búsqueda
 * - Carruseles de imágenes
 * - Interacciones con WhatsApp
 */

// ========== VARIABLES GLOBALES ==========
let allGroups = [];
let allCategories = [];
let allProducts = [];
let displayedProducts = [];
let currentFilters = {
  search: '',
  categoryId: null,
  categoryGroup: null,
  orderBy: 'categoria_id',
  orderDirection: 'asc',
  offset: 0,
  limit: CONFIG.PRODUCTS_PER_PAGE
};

// Carruseles activos
const activeCarousels = new Map();

// Observer global para carruseles
let carouselObserver = null;

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Iniciando Catálogo Comercial Liliana...');

  // Inicializar componentes
  initPromoBanner();
  initSearchBar();
  initWhatsAppButtons();
  initGlobalCarouselListeners();

  // Cargar datos
  loadCategories();
  // loadProducts(); // Ya no se cargan productos en la pantalla principal - usar modales
});

// ========== BANNER PROMOCIONAL ANIMADO ==========
function initPromoBanner() {
  const banner = document.getElementById('promoBanner');
  const textElement = document.getElementById('promoText');
  let currentIndex = 0;

  // Rotar mensajes
  setInterval(() => {
    // Verificar si debe ser aleatorio o secuencial
    const messagesConfig = window.MESSAGES_CONFIG;
    const isRandomized = messagesConfig?.randomize?.header !== false;

    if (isRandomized) {
      // Seleccionar mensaje aleatorio
      currentIndex = Math.floor(Math.random() * CONFIG.PROMO_MESSAGES.length);
    } else {
      // Seleccionar mensaje secuencial
      currentIndex = (currentIndex + 1) % CONFIG.PROMO_MESSAGES.length;
    }

    textElement.textContent = CONFIG.PROMO_MESSAGES[currentIndex];
    textElement.classList.remove('animate-slideInUp');
    void textElement.offsetWidth; // Force reflow
    textElement.classList.add('animate-slideInUp');
  }, CONFIG.PROMO_BANNER_INTERVAL);

  // Hacer clickeable el banner
  banner.addEventListener('click', () => {
    openWhatsApp('¡Hola! Quisiera información sobre las ofertas disponibles.');
  });
}

// ========== BARRA DE BÚSQUEDA ==========
function initSearchBar() {
  const searchInput = document.getElementById('searchInput');
  let searchTimeout;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);

    // Esperar 500ms después de que el usuario deje de escribir
    searchTimeout = setTimeout(() => {
      currentFilters.search = e.target.value.trim();
      currentFilters.offset = 0;
      displayedProducts = [];
      loadProducts();
    }, 500);
  });
}

// ========== BOTONES DE WHATSAPP ==========
function initWhatsAppButtons() {
  const ctaBtn = document.getElementById('ctaWhatsappBtn');
  const floatBtn = document.getElementById('whatsappFloat');

  const defaultMessage = '¡Hola! Me gustaría ver su catálogo de productos.';

  ctaBtn.addEventListener('click', () => {
    openWhatsApp('¡Hola! Estoy buscando algo especial. ¿Podrían ayudarme?');
  });

  floatBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openWhatsApp(defaultMessage);
  });
}

/**
 * Abre WhatsApp con un mensaje predefinido
 */
function openWhatsApp(message) {
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodedMessage}`;
  window.open(url, '_blank');
}

// ========== LISTENERS GLOBALES DE CARRUSEL ==========
function initGlobalCarouselListeners() {
  // Usar event delegation para manejar todos los clicks en flechas y dots
  document.addEventListener('click', (e) => {
    // Flechas de navegación
    if (e.target.closest('.carousel-arrow')) {
      e.stopPropagation();
      const arrow = e.target.closest('.carousel-arrow');
      const carouselId = arrow.dataset.carouselId;
      const direction = arrow.dataset.direction;
      navigateCarousel(carouselId, direction);
    }

    // Dots de navegación
    if (e.target.closest('.carousel-dot')) {
      e.stopPropagation();
      const dot = e.target.closest('.carousel-dot');
      const carouselId = dot.dataset.carouselId;
      const slideIndex = parseInt(dot.dataset.slide);
      goToSlide(carouselId, slideIndex);
    }

    // Botones de consulta
    if (e.target.closest('.product-consult-btn')) {
      const btn = e.target.closest('.product-consult-btn');
      const name = btn.dataset.productName;
      const price = btn.dataset.productPrice;
      const hasDiscount = btn.dataset.hasDiscount === 'true';
      const originalPrice = btn.dataset.originalPrice;

      let message = `¡Hola! Me interesa este producto:\n\n📦 ${name}\n`;

      if (hasDiscount) {
        message += `💰 Precio de lista: ${originalPrice}\n🎁 Precio rebajado: ${price}\n\n¿Cuál sería el precio final con descuento? ¿Está disponible?`;
      } else {
        message += `💰 Precio: ${price}\n\nLo vi en su catálogo web. ¿Está disponible?`;
      }

      openWhatsApp(message);
    }
  });
}

// ========== CARGAR GRUPOS Y CATEGORÍAS ==========
async function loadCategories() {
  // Cargar grupos primero
  const groupsResult = await getGroups();
  if (groupsResult.success) {
    allGroups = groupsResult.data;
    console.log('✅ Grupos cargados:', allGroups);
  } else {
    console.error('❌ Error cargando grupos');
  }

  // Cargar categorías
  const result = await getCategories();

  if (result.success) {
    allCategories = result.data;
    console.log('✅ Categorías cargadas:', allCategories);
    renderCategoryGroups();
  } else {
    console.error('Error al cargar categorías:', result.error);
  }
}

// ========== RENDERIZAR GRUPOS DE CATEGORÍAS ==========
function renderCategoryGroups() {
  const container = document.getElementById('categoryGroupsGrid');

  if (!allGroups || allGroups.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 2rem;">No hay grupos disponibles</p>';
    return;
  }

  // Ordenar grupos por campo 'orden'
  console.log('🔢 Ordenando grupos. Valores de orden:', allGroups.map(g => ({ nombre: g.nombre, orden: g.orden })));
  const sortedGroups = [...allGroups].sort((a, b) => (a.orden || 0) - (b.orden || 0));
  console.log('✅ Grupos ordenados:', sortedGroups.map(g => ({ nombre: g.nombre, orden: g.orden })));

  container.innerHTML = sortedGroups.map(group => {
    return `
      <div class="group-card" data-group="${group.id}">
        <div class="group-carousel" data-carousel-group="${group.id}">
          <div class="group-carousel-track" id="groupCarousel-${group.id}">
            <!-- Se llenará con imágenes aleatorias -->
          </div>
        </div>
        <div class="group-card-content">
          <div class="group-icon">${group.icono || '📦'}</div>
          <h3 class="group-name">${group.nombre}</h3>
          <p class="group-count" id="groupCount-${group.id}">Explorando...</p>
        </div>
      </div>
    `;
  }).join('');

  // Agregar event listeners
  document.querySelectorAll('.group-card').forEach(card => {
    card.addEventListener('click', () => {
      const groupId = parseInt(card.dataset.group);
      openGroupModal(groupId);
    });
  });

  // Cargar imágenes aleatorias para cada grupo
  loadGroupCarousels();
}

// ========== CARGAR CARRUSELES DE GRUPOS ==========
async function loadGroupCarousels() {
  for (const group of allGroups) {
    const result = await getRandomProductsByGroup(group.id, 5);

    if (result.success && result.data.length > 0) {
      const carouselTrack = document.getElementById(`groupCarousel-${group.id}`);
      const products = result.data;

      // Renderizar imágenes
      carouselTrack.innerHTML = products.map(product => {
        const imageUrl = product.imagenes && product.imagenes.length > 0
          ? product.imagenes[0]
          : 'https://via.placeholder.com/400x300?text=Sin+Imagen';

        return `
          <div class="group-carousel-slide">
            <img src="${imageUrl}" alt="${product.nombre}" class="group-carousel-image" loading="lazy">
          </div>
        `;
      }).join('');

      // Actualizar contador
      const countElement = document.getElementById(`groupCount-${group.id}`);
      if (countElement) {
        countElement.textContent = `${products.length}+ productos`;
      }

      // Iniciar carrusel automático
      startGroupCarousel(group.id, products.length);
    }
  }
}

// ========== INICIAR CARRUSEL DE GRUPO ==========
function startGroupCarousel(groupKey, totalSlides) {
  if (totalSlides <= 1) return;

  let currentSlide = 0;
  const track = document.getElementById(`groupCarousel-${groupKey}`);

  const interval = setInterval(() => {
    currentSlide = (currentSlide + 1) % totalSlides;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
  }, CONFIG.CAROUSEL_INTERVAL);

  // Guardar referencia para limpiar después si es necesario
  activeCarousels.set(`group-${groupKey}`, interval);
}

// ========== FILTRAR POR GRUPO ==========
function filterByGroup(groupKey) {
  currentFilters.categoryGroup = groupKey;
  currentFilters.categoryId = null;
  currentFilters.offset = 0;
  displayedProducts = [];

  // Mostrar subcategorías del grupo
  showSubcategories(groupKey);

  // Cargar productos
  loadProducts();

  // Scroll suave a productos
  document.getElementById('productsGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ========== MOSTRAR SUBCATEGORÍAS ==========
function showSubcategories(groupKey) {
  const container = document.getElementById('subcategoryFilters');
  const chipsContainer = document.getElementById('subcategoryChips');

  // Filtrar categorías del grupo
  const groupCategories = allCategories.filter(cat => cat.grupo === groupKey);

  if (groupCategories.length === 0) {
    container.style.display = 'none';
    return;
  }

  // Renderizar chips
  chipsContainer.innerHTML = `
    <div class="chip active" data-category-id="all">
      <span class="chip-icon">📋</span>
      <span>Todas</span>
    </div>
    ${groupCategories.map(cat => `
      <div class="chip" data-category-id="${cat.id}">
        <span class="chip-icon">${cat.icono || '📦'}</span>
        <span>${cat.nombre}</span>
      </div>
    `).join('')}
  `;

  container.style.display = 'block';

  // Agregar event listeners
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      // Remover clase active de todos
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));

      // Agregar clase active al seleccionado
      chip.classList.add('active');

      // Filtrar
      const categoryId = chip.dataset.categoryId;
      if (categoryId === 'all') {
        currentFilters.categoryId = null;
      } else {
        currentFilters.categoryId = categoryId;
      }

      currentFilters.offset = 0;
      displayedProducts = [];
      loadProducts();
    });
  });
}

// ========== CARGAR PRODUCTOS ==========
async function loadProducts() {
  showLoading();

  const result = await getProducts(currentFilters);

  if (result.success) {
    displayedProducts = [...displayedProducts, ...result.data];
    renderProducts(result.data);
    updateProductsCount();

    // Mostrar botón "Ver más" si hay más productos
    if (result.data.length === currentFilters.limit) {
      showLoadMoreButton();
    } else {
      hideLoadMoreButton();
    }
  } else {
    console.error('Error al cargar productos:', result.error);
    showEmptyState();
  }

  hideLoading();
}

// ========== RENDERIZAR PRODUCTOS ==========
function renderProducts(products) {
  const grid = document.getElementById('productsGrid');

  if (products.length === 0 && displayedProducts.length === 0) {
    grid.innerHTML = '';
    showEmptyState();
    return;
  }

  hideEmptyState();

  // Agregar nuevos productos
  const newProductsHTML = products.map(product => createProductCard(product)).join('');

  if (currentFilters.offset === 0) {
    grid.innerHTML = newProductsHTML;
  } else {
    grid.innerHTML += newProductsHTML;
  }

  // Usar setTimeout para asegurar que el DOM se haya actualizado
  setTimeout(() => {
    initProductCarousels();
    initProductCarouselsAutoplay();

    if (typeof makeProductsClickable === 'function') {
      makeProductsClickable();
    }
  }, 100);
}

// ========== CREAR TARJETA DE PRODUCTO ==========
function createProductCard(product) {
  const images = product.imagenes || [];
  const price = formatPrice(product.precio);
  const categoryName = product.categoria?.nombre || 'Sin categoría';

  // Calcular descuento si hay precio original
  const hasDiscount = product.precio_original && parseFloat(product.precio_original) > parseFloat(product.precio);
  let discountPercentage = 0;
  let originalPrice = '';

  if (hasDiscount) {
    const original = parseFloat(product.precio_original);
    const current = parseFloat(product.precio);
    discountPercentage = Math.round(((original - current) / original) * 100);
    originalPrice = formatPrice(product.precio_original);
  }

  return `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-carousel" data-carousel-id="${product.id}">
        <div class="product-carousel-track" id="carousel-${product.id}">
          ${images.length > 0
            ? images.map((img, index) => `
                <div class="product-carousel-slide">
                  <img
                    src="${img}"
                    alt="${product.nombre} - Imagen ${index + 1}"
                    class="product-image"
                    loading="lazy"
                  >
                </div>
              `).join('')
            : `
                <div class="product-carousel-slide">
                  <img
                    src="https://via.placeholder.com/400x300?text=Sin+Imagen"
                    alt="${product.nombre}"
                    class="product-image"
                    loading="lazy"
                  >
                </div>
              `
          }
        </div>

        ${images.length > 1 ? `
          <button class="carousel-arrow prev" data-carousel-id="${product.id}" data-direction="prev" aria-label="Imagen anterior">
            ◀
          </button>
          <button class="carousel-arrow next" data-carousel-id="${product.id}" data-direction="next" aria-label="Imagen siguiente">
            ▶
          </button>

          <div class="carousel-dots" id="dots-${product.id}">
            ${images.map((_, index) => `
              <button
                class="carousel-dot ${index === 0 ? 'active' : ''}"
                data-carousel-id="${product.id}"
                data-slide="${index}"
                aria-label="Ir a imagen ${index + 1}"
              ></button>
            `).join('')}
          </div>
        ` : ''}

        ${product.es_oferta || hasDiscount ? `
          <span class="product-badge">${hasDiscount ? `¡${discountPercentage}% OFF!` : '¡OFERTA!'}</span>
        ` : ''}
      </div>

      <div class="product-content">
        <h3 class="product-name">${product.nombre}</h3>
        ${hasDiscount ? `
          <div class="product-pricing">
            <p class="product-price-original">${originalPrice}</p>
            <p class="product-price-discount">${price}</p>
            <p class="product-price-note">💬 ¡Consulta por el precio final!</p>
          </div>
        ` : `
          <p class="product-price">${price}</p>
        `}
        ${product.descripcion ? `
          <p class="product-description">${product.descripcion}</p>
        ` : ''}
        <button
          class="btn btn-whatsapp product-consult-btn"
          data-product-id="${product.id}"
          data-product-name="${product.nombre}"
          data-product-price="${price}"
          data-has-discount="${hasDiscount}"
          data-original-price="${hasDiscount ? originalPrice : ''}"
        >
          📱 Consultar
        </button>
      </div>
    </div>
  `;
}

// ========== FORMATEAR PRECIO ==========
function formatPrice(price) {
  return `S/ ${parseFloat(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

// ========== INICIALIZAR CARRUSELES DE PRODUCTOS ==========
function initProductCarousels() {
  // Los event listeners ya están configurados globalmente
  // Esta función ya no es necesaria pero se mantiene para compatibilidad
  console.log('✅ Event listeners de carrusel ya configurados globalmente');
}

// ========== NAVEGAR CARRUSEL ==========
function navigateCarousel(carouselId, direction) {
  const track = document.getElementById(`carousel-${carouselId}`);
  if (!track) return;

  const slides = track.querySelectorAll('.product-carousel-slide');
  const totalSlides = slides.length;

  if (totalSlides <= 1) return;

  // Obtener slide actual desde el transform
  const currentTransform = track.style.transform || 'translateX(0%)';
  const match = currentTransform.match(/-?\d+/);
  const currentSlide = match ? Math.abs(parseInt(match[0])) / 100 : 0;

  let newSlide;
  if (direction === 'next') {
    newSlide = (currentSlide + 1) % totalSlides;
  } else {
    newSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  }

  goToSlide(carouselId, newSlide);
}

// ========== IR A SLIDE ESPECÍFICO ==========
function goToSlide(carouselId, slideIndex) {
  const track = document.getElementById(`carousel-${carouselId}`);
  if (!track) return;

  const dots = document.querySelectorAll(`#dots-${carouselId} .carousel-dot`);

  // Mover carrusel
  track.style.transform = `translateX(-${slideIndex * 100}%)`;

  // Actualizar dots
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === slideIndex);
  });

  // Reiniciar autoplay desde el nuevo slide
  pauseCarousel(carouselId);

  // Iniciar autoplay manteniendo el slide actual
  const slides = track.querySelectorAll('.product-carousel-slide');
  if (slides.length > 1) {
    if (activeCarousels.has(carouselId)) {
      clearInterval(activeCarousels.get(carouselId));
    }

    let currentSlide = slideIndex;
    const interval = setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
      track.style.transform = `translateX(-${currentSlide * 100}%)`;

      // Actualizar dots
      const dots = document.querySelectorAll(`#dots-${carouselId} .carousel-dot`);
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
      });
    }, CONFIG.CAROUSEL_INTERVAL);

    activeCarousels.set(carouselId, interval);
  }
}

// ========== INICIAR AUTOPLAY DEL CARRUSEL ==========
function startCarouselAutoplay(carouselId) {
  const track = document.getElementById(`carousel-${carouselId}`);
  if (!track) {
    console.log('❌ No se encontró track para:', carouselId);
    return;
  }

  const slides = track.querySelectorAll('.product-carousel-slide');
  if (slides.length <= 1) {
    console.log('⚠️ No hay suficientes slides:', slides.length);
    return;
  }

  // Si ya existe un interval, limpiarlo
  if (activeCarousels.has(carouselId)) {
    clearInterval(activeCarousels.get(carouselId));
  }

  console.log('🎬 Iniciando autoplay para', carouselId, 'con', slides.length, 'slides');

  let currentSlide = 0;
  const interval = setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Actualizar dots
    const dots = document.querySelectorAll(`#dots-${carouselId} .carousel-dot`);
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlide);
    });

    console.log('📸 Slide actual:', currentSlide, 'de', slides.length);
  }, CONFIG.CAROUSEL_INTERVAL);

  activeCarousels.set(carouselId, interval);
  console.log('✅ Interval creado y guardado para', carouselId);
}

// ========== PAUSAR CARRUSEL ==========
function pauseCarousel(carouselId) {
  if (activeCarousels.has(carouselId)) {
    clearInterval(activeCarousels.get(carouselId));
    activeCarousels.delete(carouselId);
  }
}

// ========== INICIALIZAR AUTOPLAY PARA CARRUSELES DE PRODUCTOS ==========
function initProductCarouselsAutoplay() {
  const carousels = document.querySelectorAll('.product-carousel');
  console.log(`🎬 Inicializando ${carousels.length} carruseles de productos...`);

  carousels.forEach((carousel, index) => {
    const carouselId = carousel.dataset.carouselId;
    if (carouselId && !activeCarousels.has(carouselId)) {
      const track = document.getElementById(`carousel-${carouselId}`);
      const slides = track ? track.querySelectorAll('.product-carousel-slide') : [];

      console.log(`  Carrusel #${index + 1} (ID: ${carouselId}): ${slides.length} slides`);

      if (slides.length > 1) {
        startCarouselAutoplay(carouselId);
        console.log(`  ✅ Autoplay iniciado para carousel ${carouselId}`);
      }
    }
  });
}

// ========== BOTÓN "VER MÁS" ==========
function showLoadMoreButton() {
  const container = document.getElementById('loadMoreContainer');
  const btn = document.getElementById('loadMoreBtn');

  container.style.display = 'block';

  btn.onclick = () => {
    currentFilters.offset += currentFilters.limit;
    loadProducts();
  };
}

function hideLoadMoreButton() {
  document.getElementById('loadMoreContainer').style.display = 'none';
}

// ========== ACTUALIZAR CONTADOR DE PRODUCTOS ==========
function updateProductsCount() {
  const countElement = document.getElementById('productsCount');
  const total = displayedProducts.length;

  if (total === 0) {
    countElement.textContent = 'No se encontraron productos';
  } else if (total === 1) {
    countElement.textContent = 'Mostrando 1 producto';
  } else {
    countElement.textContent = `Mostrando ${total} productos`;
  }
}

// ========== ESTADOS DE CARGA ==========
function showLoading() {
  document.getElementById('loadingSpinner').style.display = 'flex';
}

function hideLoading() {
  document.getElementById('loadingSpinner').style.display = 'none';
}

function showEmptyState() {
  document.getElementById('emptyState').style.display = 'block';
}

function hideEmptyState() {
  document.getElementById('emptyState').style.display = 'none';
}

// ========== BOTÓN VOLVER ARRIBA ==========
const scrollTopBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    scrollTopBtn.style.display = 'flex';
  } else {
    scrollTopBtn.style.display = 'none';
  }
});

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// ========== MENSAJES FLOTANTES MOTIVACIONALES ==========
let motivationalMessages = [
  "💰 ¡Consulta por descuentos especiales!",
  "🎁 ¡Tenemos ofertas increíbles para ti!",
  "🆓 Envío GRATIS en compras +S/500 al Bajo Piura",
  "🎁 Obsequios en compras +S/1000 ¡Pregunta!",
  "⭐ Muebles de calidad al mejor precio",
  "💬 ¿Tienes dudas? ¡Escríbenos ahora!",
  "🏠 Renueva tu hogar con nuestros productos",
  "✨ Consulta por el precio final con descuento",
  "🚚 Envíos a todo Piura - Consulta por envío gratuito",
  "💯 Productos de la mejor calidad",
  "🎉 ¡Ofertas por tiempo limitado!",
  "📱 Contáctanos para más información",
  "🛋️ Encuentra el mueble perfecto para tu hogar",
  "🏷️ Descuentos por compra al por mayor",
  "💎 Productos premium con beneficios exclusivos",
  "🎊 ¡Pregunta por nuestras promociones!",
  "⭐ Consulta por financiamiento disponible",
  "📦 Pregunta por disponibilidad inmediata",
  "🚀 ¡Aprovecha las ofertas del día!",
  "💝 Regalo especial en compras grandes"
];

// Cargar mensajes personalizados desde localStorage si existen
(function() {
  try {
    const savedConfig = localStorage.getItem('comercial_liliana_messages_config');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      if (parsed.mainMessages && parsed.mainMessages.length > 0) {
        motivationalMessages = parsed.mainMessages;
        console.log('✅ Mensajes del botón principal cargados desde admin');
      }
    }
  } catch (e) {
    console.error('Error cargando mensajes del botón:', e);
  }
})();

let messageInterval = null;
let currentMessageTimeout = null;
let currentMainMessageIndex = 0;

function showMotivationalMessage() {
  const messageContainer = document.getElementById('whatsappMessages');
  const messageText = document.getElementById('whatsappMessageText');

  if (!messageContainer || !messageText) return;

  // Verificar si debe ser aleatorio o secuencial
  let message;
  const messagesConfig = window.MESSAGES_CONFIG;
  const isRandomized = messagesConfig?.randomize?.main !== false;

  if (isRandomized) {
    // Seleccionar mensaje aleatorio
    message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  } else {
    // Seleccionar mensaje secuencial
    message = motivationalMessages[currentMainMessageIndex];
    currentMainMessageIndex = (currentMainMessageIndex + 1) % motivationalMessages.length;
  }

  // Mostrar mensaje
  messageText.textContent = message;
  messageContainer.style.display = 'block';
  messageContainer.style.animation = 'slideInFromRight 0.5s ease-out';

  // Ocultar después de 5 segundos
  currentMessageTimeout = setTimeout(() => {
    messageContainer.style.animation = 'fadeOut 0.5s ease-out';
    setTimeout(() => {
      messageContainer.style.display = 'none';
    }, 500);
  }, 5000);
}

function initMotivationalMessages() {
  // Mostrar primer mensaje después de 10 segundos
  setTimeout(() => {
    showMotivationalMessage();

    // Luego mostrar cada 20-30 segundos aleatoriamente
    messageInterval = setInterval(() => {
      const randomDelay = 20000 + Math.random() * 10000; // 20-30 segundos
      setTimeout(showMotivationalMessage, randomDelay);
    }, 30000);
  }, 10000);
}

// Iniciar mensajes motivacionales cuando se carga la página
window.addEventListener('load', initMotivationalMessages);

// ========== LIMPIAR AL SALIR ==========
window.addEventListener('beforeunload', () => {
  // Limpiar todos los intervals
  activeCarousels.forEach((interval) => clearInterval(interval));
  activeCarousels.clear();

  // Limpiar mensajes motivacionales
  if (messageInterval) clearInterval(messageInterval);
  if (currentMessageTimeout) clearTimeout(currentMessageTimeout);
});

// ========================================================================
// NUEVO SISTEMA DE MODALES: GRUPO → CATEGORÍA → PRODUCTO
// ========================================================================

let currentModalGroup = null;
let currentModalCategory = null;
const categoryCarouselIntervals = new Map();

// ========== ABRIR MODAL DE GRUPO ==========
async function openGroupModal(groupId) {
  currentModalGroup = groupId;
  const modal = document.getElementById('groupModal');
  const title = document.getElementById('groupModalTitle');
  const grid = document.getElementById('categoriesModalGrid');

  console.log('🔍 Abriendo modal de grupo ID:', groupId);

  // Buscar grupo por ID
  const group = allGroups.find(g => g.id === groupId);
  if (!group) {
    console.error('❌ Grupo no encontrado:', groupId);
    grid.innerHTML = '<p style="text-align: center; padding: 2rem;">Grupo no encontrado</p>';
    return;
  }

  console.log('✅ Grupo encontrado:', group);

  // Actualizar título
  title.textContent = `${group.icono || '📦'} ${group.nombre}`;

  // Obtener categorías del grupo - filtrar por grupo_id
  const categoriesOfGroup = allCategories.filter(cat => cat.grupo_id === groupId);

  console.log('📂 Categorías del grupo:', categoriesOfGroup.length, categoriesOfGroup);

  if (categoriesOfGroup.length === 0) {
    grid.innerHTML = '<p style="text-align: center; padding: 2rem;">No hay categorías en este grupo</p>';
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    return;
  }

  // Ordenar categorías alfabéticamente
  const sortedCategories = categoriesOfGroup.sort((a, b) => a.nombre.localeCompare(b.nombre));

  // Renderizar categorías con carruseles
  grid.innerHTML = sortedCategories.map(category => {
    const carouselId = `cat-carousel-${category.id}`;
    return `
      <div class="category-card" data-category-id="${category.id}">
        <div class="category-carousel-container">
          <div class="category-carousel-track" id="${carouselId}">
            <div class="category-carousel-slide">
              <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--gris-medio);">
                Cargando...
              </div>
            </div>
          </div>
        </div>
        <div class="category-card-content">
          <h3 class="category-card-name">${category.nombre}</h3>
          <p class="category-card-count" id="cat-count-${category.id}">Explorando...</p>
        </div>
      </div>
    `;
  }).join('');

  // Mostrar modal
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Cargar productos aleatorios para cada categoría
  for (const category of sortedCategories) {
    loadCategoryCarousel(category.id);
  }

  // Event listeners para categorías
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const categoryId = card.dataset.categoryId;
      openCategoryModal(categoryId);
    });
  });
}

// ========== CARGAR CARRUSEL DE UNA CATEGORÍA EN EL MODAL DE GRUPO ==========
async function loadCategoryCarousel(categoryId) {
  const result = await getRandomProductsByCategory(categoryId, 5);

  if (!result.success || result.data.length === 0) {
    const track = document.getElementById(`cat-carousel-${categoryId}`);
    if (track) {
      track.innerHTML = `
        <div class="category-carousel-slide">
          <img src="https://via.placeholder.com/300x250?text=Sin+Productos" alt="Sin productos">
        </div>
      `;
    }
    return;
  }

  const products = result.data;
  const track = document.getElementById(`cat-carousel-${categoryId}`);

  if (!track) return;

  // Renderizar slides
  track.innerHTML = products.map(product => {
    const imageUrl = product.imagenes && product.imagenes.length > 0
      ? product.imagenes[0]
      : 'https://via.placeholder.com/300x250?text=Sin+Imagen';

    return `
      <div class="category-carousel-slide">
        <img src="${imageUrl}" alt="${product.nombre}" loading="lazy">
      </div>
    `;
  }).join('');

  // Actualizar contador
  const countElement = document.getElementById(`cat-count-${categoryId}`);
  if (countElement) {
    countElement.textContent = `${products.length}+ productos`;
  }

  // Iniciar autoplay si hay más de 1 producto
  if (products.length > 1) {
    startCategoryCarouselAutoplay(categoryId, products.length);
  }
}

// ========== AUTOPLAY PARA CARRUSELES DE CATEGORÍAS ==========
function startCategoryCarouselAutoplay(categoryId, totalSlides) {
  // Limpiar interval existente
  if (categoryCarouselIntervals.has(categoryId)) {
    clearInterval(categoryCarouselIntervals.get(categoryId));
  }

  let currentSlide = 0;
  const track = document.getElementById(`cat-carousel-${categoryId}`);

  if (!track) return;

  const interval = setInterval(() => {
    currentSlide = (currentSlide + 1) % totalSlides;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
  }, CONFIG.CAROUSEL_INTERVAL);

  categoryCarouselIntervals.set(categoryId, interval);
}

// ========== ABRIR MODAL DE CATEGORÍA ==========
async function openCategoryModal(categoryId) {
  currentModalCategory = categoryId;
  const modal = document.getElementById('categoryModal');
  const title = document.getElementById('categoryModalTitle');
  const grid = document.getElementById('categoryProductsGrid');

  // Obtener nombre de la categoría
  const category = allCategories.find(cat => cat.id === parseInt(categoryId));
  if (category) {
    title.textContent = category.nombre;
  }

  // Mostrar loading
  grid.innerHTML = '<div style="text-align: center; padding: 3rem;"><div class="spinner"></div><p>Cargando productos...</p></div>';

  // Mostrar modal
  modal.style.display = 'flex';

  // Obtener todos los productos de la categoría
  const { data: products, error } = await supabaseClient
    .from('productos')
    .select('*')
    .eq('categoria_id', categoryId)
    .eq('activo', true);

  if (error || !products || products.length === 0) {
    grid.innerHTML = '<p style="text-align: center; padding: 2rem;">No hay productos en esta categoría</p>';
    return;
  }

  // Ordenar por precio (menor a mayor)
  products.sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio));

  // Renderizar productos
  grid.innerHTML = products.map(product => {
    const images = product.imagenes || [];
    const hasDiscount = product.precio_original && parseFloat(product.precio_original) > parseFloat(product.precio);
    let discountPercentage = 0;

    if (hasDiscount) {
      const original = parseFloat(product.precio_original);
      const current = parseFloat(product.precio);
      discountPercentage = Math.round(((original - current) / original) * 100);
    }

    const carouselId = `prod-carousel-${product.id}`;

    return `
      <div class="category-product-card" data-product-id="${product.id}">
        <div class="category-product-carousel">
          <div class="category-product-carousel-track" id="${carouselId}">
            ${images.length > 0
              ? images.map((img, index) => `
                  <div class="category-product-carousel-slide">
                    <img src="${img}" alt="${product.nombre} - ${index + 1}" loading="lazy">
                  </div>
                `).join('')
              : `
                  <div class="category-product-carousel-slide">
                    <img src="https://via.placeholder.com/300x400?text=Sin+Imagen" alt="${product.nombre}">
                  </div>
                `
            }
          </div>
          ${product.es_oferta || hasDiscount ? `
            <span class="category-product-badge">
              ${hasDiscount ? `¡${discountPercentage}% OFF!` : '¡OFERTA!'}
            </span>
          ` : ''}
        </div>
        <div class="category-product-info">
          <h3 class="category-product-name">${product.nombre}</h3>
          ${hasDiscount ? `
            <p class="category-product-price-original">${formatPrice(product.precio_original)}</p>
            <p class="category-product-price-discount">${formatPrice(product.precio)}</p>
          ` : `
            <p class="category-product-price">${formatPrice(product.precio)}</p>
          `}
        </div>
      </div>
    `;
  }).join('');

  // Iniciar autoplay para productos con múltiples imágenes
  products.forEach(product => {
    const images = product.imagenes || [];
    if (images.length > 1) {
      startProductCarouselInCategory(product.id, images.length);
    }
  });

  // Event listeners para productos
  document.querySelectorAll('.category-product-card').forEach(card => {
    card.addEventListener('click', async () => {
      const productId = card.dataset.productId;

      // Obtener producto completo con categoría
      const { data: product, error } = await supabaseClient
        .from('productos')
        .select(`
          *,
          categoria:categorias(*)
        `)
        .eq('id', productId)
        .single();

      if (!error && product) {
        openProductModal(product);
      }
    });
  });
}

// ========== AUTOPLAY PARA CARRUSELES DE PRODUCTOS EN MODAL DE CATEGORÍA ==========
function startProductCarouselInCategory(productId, totalSlides) {
  const carouselId = `prod-carousel-${productId}`;
  let currentSlide = 0;
  const track = document.getElementById(carouselId);

  if (!track) return;

  const interval = setInterval(() => {
    currentSlide = (currentSlide + 1) % totalSlides;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
  }, CONFIG.CAROUSEL_INTERVAL);

  // Guardar en el mismo Map para limpiar después
  categoryCarouselIntervals.set(carouselId, interval);
}

// ========== CERRAR MODAL DE GRUPO ==========
function closeGroupModal() {
  const modal = document.getElementById('groupModal');
  modal.style.display = 'none';
  document.body.style.overflow = '';
  currentModalGroup = null;

  // Limpiar todos los intervals de carruseles de categorías
  categoryCarouselIntervals.forEach(interval => clearInterval(interval));
  categoryCarouselIntervals.clear();
}

// ========== CERRAR MODAL DE CATEGORÍA ==========
function closeCategoryModal() {
  const modal = document.getElementById('categoryModal');
  modal.style.display = 'none';
  currentModalCategory = null;

  // Limpiar intervals de productos
  categoryCarouselIntervals.forEach(interval => clearInterval(interval));
  categoryCarouselIntervals.clear();

  // Restaurar overflow solo si no hay otro modal abierto
  const groupModal = document.getElementById('groupModal');
  if (groupModal.style.display === 'none') {
    document.body.style.overflow = '';
  }
}

// ========== VOLVER AL MODAL DE CATEGORÍA DESDE PRODUCTO ==========
function backToCategoryModal() {
  const productModal = document.getElementById('productModal');
  const categoryModal = document.getElementById('categoryModal');

  productModal.style.display = 'none';
  categoryModal.style.display = 'flex';
}

// ========== EVENT LISTENERS PARA BOTONES DE NAVEGACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
  // Botón cerrar modal de grupo
  document.getElementById('closeGroupModal')?.addEventListener('click', closeGroupModal);
  document.querySelector('#groupModal .group-modal-overlay')?.addEventListener('click', closeGroupModal);

  // Botón cerrar modal de categoría
  document.getElementById('closeCategoryModal')?.addEventListener('click', () => {
    closeCategoryModal();
    // Si el modal de grupo estaba abierto, mostrarlo de nuevo
    if (currentModalGroup) {
      const groupModal = document.getElementById('groupModal');
      groupModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  });

  document.querySelector('#categoryModal .category-modal-overlay')?.addEventListener('click', () => {
    closeCategoryModal();
    if (currentModalGroup) {
      const groupModal = document.getElementById('groupModal');
      groupModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  });

  // Botón volver desde categoría a grupo
  document.getElementById('backToCategoryFromProducts')?.addEventListener('click', () => {
    closeCategoryModal();
    if (currentModalGroup) {
      const groupModal = document.getElementById('groupModal');
      groupModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  });

  // Botón volver desde producto a categoría
  document.getElementById('backToProducts')?.addEventListener('click', backToCategoryModal);

  // Modificar el close del modal de producto para manejar navegación
  const originalCloseProductModal = window.closeProductModal;
  window.closeProductModal = function() {
    originalCloseProductModal();

    // Si venimos del modal de categoría, mostrarlo
    if (currentModalCategory) {
      const backBtn = document.getElementById('backToProducts');
      backBtn.style.display = 'flex';
      openCategoryModal(currentModalCategory);
    } else {
      const backBtn = document.getElementById('backToProducts');
      backBtn.style.display = 'none';
    }
  };
});
