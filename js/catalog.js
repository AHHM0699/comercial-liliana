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

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Iniciando Catálogo Comercial Liliana...');

  // Inicializar componentes
  initPromoBanner();
  initSearchBar();
  initWhatsAppButtons();
  initIntersectionObserver();

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
  const headerBtn = document.getElementById('headerWhatsappBtn');
  const ctaBtn = document.getElementById('ctaWhatsappBtn');
  const floatBtn = document.getElementById('whatsappFloat');

  const defaultMessage = '¡Hola! Me gustaría ver su catálogo de productos.';

  headerBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openWhatsApp(defaultMessage);
  });

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

        ${product.es_oferta ? `
          <span class="product-badge">¡OFERTA!</span>
        ` : ''}
      </div>

      <div class="product-content">
        <h3 class="product-name">${product.nombre}</h3>
        <p class="product-price">${price}</p>
        ${product.descripcion ? `
          <p class="product-description">${product.descripcion}</p>
        ` : ''}
        <button
          class="btn btn-whatsapp product-consult-btn"
          data-product-id="${product.id}"
          data-product-name="${product.nombre}"
          data-product-price="${price}"
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
  // Botones de consultar
  document.querySelectorAll('.product-consult-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.productName;
      const price = btn.dataset.productPrice;

      const message = `¡Hola! Me interesa este producto:\n\n📦 ${name}\n💰 Precio: ${price}\n\nLo vi en su catálogo web. ¿Está disponible?`;
      openWhatsApp(message);
    });
  });

  // Flechas de navegación
  document.querySelectorAll('.carousel-arrow').forEach(arrow => {
    arrow.addEventListener('click', (e) => {
      e.stopPropagation();
      const carouselId = arrow.dataset.carouselId;
      const direction = arrow.dataset.direction;
      navigateCarousel(carouselId, direction);
    });
  });

  // Dots de navegación
  document.querySelectorAll('.carousel-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const carouselId = dot.dataset.carouselId;
      const slideIndex = parseInt(dot.dataset.slide);
      goToSlide(carouselId, slideIndex);
    });
  });
}

// ========== NAVEGAR CARRUSEL ==========
function navigateCarousel(carouselId, direction) {
  const track = document.getElementById(`carousel-${carouselId}`);
  const slides = track.querySelectorAll('.product-carousel-slide');
  const totalSlides = slides.length;

  if (totalSlides <= 1) return;

  // Obtener slide actual
  const currentTransform = track.style.transform || 'translateX(0%)';
  const currentSlide = parseInt(currentTransform.match(/-?\d+/) || [0]) / 100;

  let newSlide;
  if (direction === 'next') {
    newSlide = (Math.abs(currentSlide) + 1) % totalSlides;
  } else {
    newSlide = (Math.abs(currentSlide) - 1 + totalSlides) % totalSlides;
  }

  goToSlide(carouselId, newSlide);
}

// ========== IR A SLIDE ESPECÍFICO ==========
function goToSlide(carouselId, slideIndex) {
  const track = document.getElementById(`carousel-${carouselId}`);
  const dots = document.querySelectorAll(`#dots-${carouselId} .carousel-dot`);

  // Mover carrusel
  track.style.transform = `translateX(-${slideIndex * 100}%)`;

  // Actualizar dots
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === slideIndex);
  });

  // Pausar y reiniciar autoplay
  pauseCarousel(carouselId);
  startCarouselAutoplay(carouselId);
}

// ========== INTERSECTION OBSERVER (AUTOPLAY) ==========
function initIntersectionObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const carouselId = entry.target.dataset.carouselId;

      if (entry.isIntersecting) {
        startCarouselAutoplay(carouselId);
      } else {
        pauseCarousel(carouselId);
      }
    });
  }, {
    threshold: 0.5
  });

  // Observar todos los carruseles
  document.querySelectorAll('.product-carousel').forEach(carousel => {
    observer.observe(carousel);
  });
}

// ========== INICIAR AUTOPLAY DEL CARRUSEL ==========
function startCarouselAutoplay(carouselId) {
  const track = document.getElementById(`carousel-${carouselId}`);
  if (!track) return;

  const slides = track.querySelectorAll('.product-carousel-slide');
  if (slides.length <= 1) return;

  // Si ya existe un interval, limpiarlo
  if (activeCarousels.has(carouselId)) {
    clearInterval(activeCarousels.get(carouselId));
  }

  const interval = setInterval(() => {
    navigateCarousel(carouselId, 'next');
  }, CONFIG.CAROUSEL_INTERVAL);

  activeCarousels.set(carouselId, interval);
}

// ========== PAUSAR CARRUSEL ==========
function pauseCarousel(carouselId) {
  if (activeCarousels.has(carouselId)) {
    clearInterval(activeCarousels.get(carouselId));
    activeCarousels.delete(carouselId);
  }
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

// ========== LIMPIAR AL SALIR ==========
window.addEventListener('beforeunload', () => {
  // Limpiar todos los intervals
  activeCarousels.forEach((interval) => clearInterval(interval));
  activeCarousels.clear();
});
