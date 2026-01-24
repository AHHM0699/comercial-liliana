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

  // Cargar datos
  loadCategories();
  loadProducts();
});

// ========== BANNER PROMOCIONAL ANIMADO ==========
function initPromoBanner() {
  const banner = document.getElementById('promoBanner');
  const textElement = document.getElementById('promoText');
  let currentIndex = 0;

  // Rotar mensajes
  setInterval(() => {
    currentIndex = (currentIndex + 1) % CONFIG.PROMO_MESSAGES.length;
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

// ========== CARGAR CATEGORÍAS ==========
async function loadCategories() {
  const result = await getCategories();

  if (result.success) {
    allCategories = result.data;
    renderCategoryGroups();
  } else {
    console.error('Error al cargar categorías:', result.error);
  }
}

// ========== RENDERIZAR GRUPOS DE CATEGORÍAS ==========
function renderCategoryGroups() {
  const container = document.getElementById('categoryGroupsGrid');
  const groups = CONFIG.CATEGORY_GROUPS;

  container.innerHTML = Object.entries(groups).map(([groupKey, groupInfo]) => {
    return `
      <div class="group-card" data-group="${groupKey}">
        <div class="group-carousel" data-carousel-group="${groupKey}">
          <div class="group-carousel-track" id="groupCarousel-${groupKey}">
            <!-- Se llenará con imágenes aleatorias -->
          </div>
        </div>
        <div class="group-card-content">
          <div class="group-icon">${groupInfo.icon}</div>
          <h3 class="group-name">${groupInfo.name}</h3>
          <p class="group-count" id="groupCount-${groupKey}">Explorando...</p>
        </div>
      </div>
    `;
  }).join('');

  // Agregar event listeners
  document.querySelectorAll('.group-card').forEach(card => {
    card.addEventListener('click', () => {
      const group = card.dataset.group;
      filterByGroup(group);
    });
  });

  // Cargar imágenes aleatorias para cada grupo
  loadGroupCarousels();
}

// ========== CARGAR CARRUSELES DE GRUPOS ==========
async function loadGroupCarousels() {
  for (const [groupKey] of Object.entries(CONFIG.CATEGORY_GROUPS)) {
    const result = await getRandomProductsByGroup(groupKey, 5);

    if (result.success && result.data.length > 0) {
      const carouselTrack = document.getElementById(`groupCarousel-${groupKey}`);
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
      const countElement = document.getElementById(`groupCount-${groupKey}`);
      if (countElement) {
        countElement.textContent = `${products.length}+ productos`;
      }

      // Iniciar carrusel automático
      startGroupCarousel(groupKey, products.length);
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

  // Inicializar carruseles de productos
  initProductCarousels();

  // Inicializar autoplay para nuevos carruseles
  initProductCarouselsAutoplay();

  // Hacer productos clicables para abrir modal
  if (typeof makeProductsClickable === 'function') {
    makeProductsClickable();
  }
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
  console.log('🎨 Inicializando carruseles de productos...');

  // Botones de consultar
  const consultBtns = document.querySelectorAll('.product-consult-btn');
  console.log('📱 Botones de consulta encontrados:', consultBtns.length);

  consultBtns.forEach(btn => {
    btn.addEventListener('click', () => {
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
    });
  });

  // Flechas de navegación
  const arrows = document.querySelectorAll('.carousel-arrow');
  console.log('⬅️➡️ Flechas de navegación encontradas:', arrows.length);

  arrows.forEach(arrow => {
    arrow.addEventListener('click', (e) => {
      e.stopPropagation();
      const carouselId = arrow.dataset.carouselId;
      const direction = arrow.dataset.direction;
      console.log('🖱️ Click en flecha:', direction, 'carousel:', carouselId);
      navigateCarousel(carouselId, direction);
    });
  });

  // Dots de navegación
  const dots = document.querySelectorAll('.carousel-dot');
  console.log('⚫ Dots de navegación encontrados:', dots.length);

  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const carouselId = dot.dataset.carouselId;
      const slideIndex = parseInt(dot.dataset.slide);
      console.log('🖱️ Click en dot:', slideIndex, 'carousel:', carouselId);
      goToSlide(carouselId, slideIndex);
    });
  });
}

// ========== NAVEGAR CARRUSEL ==========
function navigateCarousel(carouselId, direction) {
  console.log('🔄 Navegando carousel:', carouselId, 'direccion:', direction);

  const track = document.getElementById(`carousel-${carouselId}`);
  if (!track) {
    console.log('❌ Track no encontrado:', carouselId);
    return;
  }

  const slides = track.querySelectorAll('.product-carousel-slide');
  const totalSlides = slides.length;

  console.log('📊 Total slides:', totalSlides);

  if (totalSlides <= 1) return;

  // Obtener slide actual desde el transform
  const currentTransform = track.style.transform || 'translateX(0%)';
  const match = currentTransform.match(/-?\d+/);
  const currentSlide = match ? Math.abs(parseInt(match[0])) / 100 : 0;

  console.log('📍 Slide actual:', currentSlide, 'transform:', currentTransform);

  let newSlide;
  if (direction === 'next') {
    newSlide = (currentSlide + 1) % totalSlides;
  } else {
    newSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  }

  console.log('➡️ Nuevo slide:', newSlide);

  goToSlide(carouselId, newSlide);
}

// ========== IR A SLIDE ESPECÍFICO ==========
function goToSlide(carouselId, slideIndex) {
  console.log('🎯 Ir a slide:', slideIndex, 'carousel:', carouselId);

  const track = document.getElementById(`carousel-${carouselId}`);
  if (!track) {
    console.log('❌ Track no encontrado para goToSlide:', carouselId);
    return;
  }

  const dots = document.querySelectorAll(`#dots-${carouselId} .carousel-dot`);

  // Mover carrusel
  track.style.transform = `translateX(-${slideIndex * 100}%)`;
  console.log('✅ Transform aplicado:', track.style.transform);

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
    console.log('❌ Track no encontrado para carousel:', carouselId);
    return;
  }

  const slides = track.querySelectorAll('.product-carousel-slide');
  if (slides.length <= 1) {
    console.log('⚠️ Carousel tiene <=1 slide:', carouselId, 'slides:', slides.length);
    return;
  }

  // Si ya existe un interval, limpiarlo
  if (activeCarousels.has(carouselId)) {
    clearInterval(activeCarousels.get(carouselId));
  }

  console.log('✅ Iniciando carousel autoplay:', carouselId, 'slides:', slides.length);

  let currentSlide = 0;
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

// ========== PAUSAR CARRUSEL ==========
function pauseCarousel(carouselId) {
  if (activeCarousels.has(carouselId)) {
    console.log('⏸️ Pausando carousel:', carouselId);
    clearInterval(activeCarousels.get(carouselId));
    activeCarousels.delete(carouselId);
  }
}

// ========== INICIALIZAR AUTOPLAY PARA CARRUSELES DE PRODUCTOS ==========
function initProductCarouselsAutoplay() {
  console.log('🎬 Inicializando autoplay de carruseles de productos...');

  // Iniciar autoplay directamente para todos los carruseles visibles
  document.querySelectorAll('.product-carousel').forEach(carousel => {
    const carouselId = carousel.dataset.carouselId;
    if (carouselId) {
      const track = document.getElementById(`carousel-${carouselId}`);
      const slides = track ? track.querySelectorAll('.product-carousel-slide') : [];

      console.log('🔍 Procesando carousel:', carouselId, 'slides:', slides.length);

      if (slides.length > 1) {
        startCarouselAutoplay(carouselId);
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
const motivationalMessages = [
  "💰 Consulta por nuestros descuentos especiales",
  "🎁 ¡Tenemos ofertas increíbles para ti!",
  "📦 Pregunta por disponibilidad y envío",
  "⭐ Muebles de calidad al mejor precio",
  "💬 ¿Tienes dudas? ¡Escríbenos ahora!",
  "🏠 Renueva tu hogar con nuestros productos",
  "✨ Consulta por el precio final con descuento",
  "🚚 Envíos a todo Piura - Consulta por envío gratuito",
  "💯 Productos de la mejor calidad",
  "🎉 ¡Ofertas por tiempo limitado!",
  "📱 Contáctanos para más información",
  "🛋️ Encuentra el mueble perfecto para tu hogar",
  "🆓 Compras mayores a S/500: envío gratuito al Bajo Piura"
];

let messageInterval = null;
let currentMessageTimeout = null;

function showMotivationalMessage() {
  const messageContainer = document.getElementById('whatsappMessages');
  const messageText = document.getElementById('whatsappMessageText');

  if (!messageContainer || !messageText) return;

  // Seleccionar mensaje aleatorio
  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  // Mostrar mensaje
  messageText.textContent = randomMessage;
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
