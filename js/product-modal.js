/**
 * MODAL DE PRODUCTO - COMERCIAL LILIANA
 * Maneja la visualización completa de productos con zoom de imágenes
 */

let currentModalProduct = null;
let currentModalImageIndex = 0;
let isZoomed = false;
let zoomX = 0;
let zoomY = 0;

// ========== ABRIR MODAL ==========
function openProductModal(product) {
  currentModalProduct = product;
  currentModalImageIndex = 0;
  isZoomed = false;

  const modal = document.getElementById('productModal');
  const modalName = document.getElementById('modalProductName');
  const modalCategory = document.getElementById('modalProductCategory');
  const modalPrice = document.getElementById('modalProductPrice');
  const modalDescription = document.getElementById('modalProductDescription');
  const modalWhatsappBtn = document.getElementById('modalWhatsappBtn');

  // Llenar información
  modalName.textContent = product.nombre;
  modalCategory.textContent = product.categoria?.nombre || 'Sin categoría';
  modalPrice.textContent = formatPrice(product.precio);
  modalDescription.textContent = product.descripcion || 'Sin descripción disponible';

  // Configurar botón de WhatsApp
  modalWhatsappBtn.onclick = () => {
    const message = `¡Hola! Me interesa este producto:\n\n📦 ${product.nombre}\n💰 Precio: ${formatPrice(product.precio)}\n\nLo vi en su catálogo web. ¿Está disponible?`;
    openWhatsApp(message);
  };

  // Renderizar carrusel de imágenes
  renderModalCarousel(product.imagenes || []);

  // Cargar productos recomendados
  loadRecommendedProducts(product);

  // Mostrar modal
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden'; // Prevenir scroll del body
}

// ========== CERRAR MODAL ==========
function closeProductModal() {
  const modal = document.getElementById('productModal');
  modal.style.display = 'none';
  document.body.style.overflow = ''; // Restaurar scroll
  currentModalProduct = null;
  isZoomed = false;
}

// ========== RENDERIZAR CARRUSEL DEL MODAL ==========
function renderModalCarousel(images) {
  const carousel = document.getElementById('modalCarousel');
  const thumbnails = document.getElementById('modalThumbnails');

  if (images.length === 0) {
    carousel.innerHTML = `
      <img src="https://via.placeholder.com/600x800?text=Sin+Imagen"
           alt="Sin imagen"
           class="modal-carousel-image">
    `;
    thumbnails.innerHTML = '';
    return;
  }

  // Renderizar imagen principal
  carousel.innerHTML = `
    <img src="${images[0]}"
         alt="${currentModalProduct.nombre}"
         class="modal-carousel-image"
         id="modalMainImage">
    ${images.length > 1 ? `
      <button class="modal-carousel-prev" id="modalPrevBtn">◀</button>
      <button class="modal-carousel-next" id="modalNextBtn">▶</button>
    ` : ''}
  `;

  // Renderizar miniaturas
  thumbnails.innerHTML = images.map((img, index) => `
    <div class="modal-thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
      <img src="${img}" alt="Miniatura ${index + 1}">
    </div>
  `).join('');

  // Eventos
  initModalCarouselEvents(images);
  initZoomEvents();
}

// ========== INICIALIZAR EVENTOS DEL CARRUSEL ==========
function initModalCarouselEvents(images) {
  if (images.length <= 1) return;

  const prevBtn = document.getElementById('modalPrevBtn');
  const nextBtn = document.getElementById('modalNextBtn');
  const thumbnails = document.querySelectorAll('.modal-thumbnail');

  // Botones de navegación
  prevBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    navigateModalCarousel(-1, images);
  });

  nextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    navigateModalCarousel(1, images);
  });

  // Miniaturas
  thumbnails.forEach((thumb, index) => {
    thumb.addEventListener('click', () => {
      currentModalImageIndex = index;
      updateModalImage(images);
    });
  });

  // Teclado
  document.addEventListener('keydown', handleModalKeyboard);
}

// ========== NAVEGAR EN EL CARRUSEL ==========
function navigateModalCarousel(direction, images) {
  if (isZoomed) {
    resetZoom();
  }

  currentModalImageIndex += direction;

  if (currentModalImageIndex < 0) {
    currentModalImageIndex = images.length - 1;
  } else if (currentModalImageIndex >= images.length) {
    currentModalImageIndex = 0;
  }

  updateModalImage(images);
}

// ========== ACTUALIZAR IMAGEN DEL MODAL ==========
function updateModalImage(images) {
  const mainImage = document.getElementById('modalMainImage');
  const thumbnails = document.querySelectorAll('.modal-thumbnail');

  // Actualizar imagen principal
  mainImage.src = images[currentModalImageIndex];

  // Actualizar miniaturas activas
  thumbnails.forEach((thumb, index) => {
    thumb.classList.toggle('active', index === currentModalImageIndex);
  });
}

// ========== EVENTOS DE TECLADO ==========
function handleModalKeyboard(e) {
  const modal = document.getElementById('productModal');
  if (modal.style.display !== 'flex') return;

  switch(e.key) {
    case 'Escape':
      closeProductModal();
      break;
    case 'ArrowLeft':
      if (currentModalProduct?.imagenes?.length > 1) {
        navigateModalCarousel(-1, currentModalProduct.imagenes);
      }
      break;
    case 'ArrowRight':
      if (currentModalProduct?.imagenes?.length > 1) {
        navigateModalCarousel(1, currentModalProduct.imagenes);
      }
      break;
  }
}

// ========== INICIALIZAR EVENTOS DE ZOOM ==========
function initZoomEvents() {
  const carousel = document.getElementById('modalCarousel');
  const mainImage = document.getElementById('modalMainImage');

  if (!mainImage) return;

  carousel.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') return;

    if (!isZoomed) {
      enableZoom();
    } else {
      resetZoom();
    }
  });

  // Zoom con movimiento del mouse
  carousel.addEventListener('mousemove', (e) => {
    if (!isZoomed) return;

    const rect = carousel.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    mainImage.style.transformOrigin = `${x}% ${y}%`;
  });

  // Zoom con touch (móvil)
  let touchStartDistance = 0;

  carousel.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      touchStartDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
    }
  });

  carousel.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && touchStartDistance > 0) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const touchDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      if (touchDistance > touchStartDistance * 1.2 && !isZoomed) {
        enableZoom();
      } else if (touchDistance < touchStartDistance * 0.8 && isZoomed) {
        resetZoom();
      }
    }
  });
}

// ========== ACTIVAR ZOOM ==========
function enableZoom() {
  const mainImage = document.getElementById('modalMainImage');
  const carousel = document.getElementById('modalCarousel');

  if (!mainImage) return;

  isZoomed = true;
  mainImage.classList.add('zoomed');
  carousel.classList.add('zoomed');
}

// ========== RESETEAR ZOOM ==========
function resetZoom() {
  const mainImage = document.getElementById('modalMainImage');
  const carousel = document.getElementById('modalCarousel');

  if (!mainImage) return;

  isZoomed = false;
  mainImage.classList.remove('zoomed');
  carousel.classList.remove('zoomed');
  mainImage.style.transformOrigin = 'center';
}

// ========== EVENTOS DE CIERRE ==========
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('productModal');
  const closeBtn = document.getElementById('closeProductModal');
  const overlay = modal?.querySelector('.product-modal-overlay');

  closeBtn?.addEventListener('click', closeProductModal);
  overlay?.addEventListener('click', closeProductModal);

  // Prevenir cierre al hacer clic en el contenido
  modal?.querySelector('.product-modal-content')?.addEventListener('click', (e) => {
    e.stopPropagation();
  });
});

// ========== HACER PRODUCTOS CLICABLES ==========
// Esta función se llamará desde catalog.js después de renderizar productos
function makeProductsClickable() {
  document.querySelectorAll('.product-card').forEach(card => {
    // Remover listeners anteriores
    const newCard = card.cloneNode(true);
    card.parentNode.replaceChild(newCard, card);

    newCard.addEventListener('click', async (e) => {
      // Ignorar clics en botones y controles del carrusel
      if (e.target.closest('.btn, .carousel-arrow, .carousel-dot')) {
        return;
      }

      const productId = newCard.dataset.productId;

      // Obtener datos completos del producto
      const { data: product, error } = await supabaseClient
        .from('productos')
        .select(`
          *,
          categoria:categorias(*)
        `)
        .eq('id', productId)
        .single();

      if (error) {
        console.error('Error al cargar producto:', error);
        return;
      }

      openProductModal(product);
    });

    // Hacer el cursor pointer en toda la tarjeta
    newCard.style.cursor = 'pointer';
  });
}

// ========== PRODUCTOS RECOMENDADOS ==========
async function loadRecommendedProducts(currentProduct) {
  const container = document.getElementById('recommendedProducts');
  const grid = document.getElementById('recommendedGrid');

  if (!currentProduct || !currentProduct.categoria_id) {
    container.style.display = 'none';
    return;
  }

  try {
    // Obtener productos de la misma categoría
    const { data: products, error } = await supabaseClient
      .from('productos')
      .select('*')
      .eq('categoria_id', currentProduct.categoria_id)
      .eq('activo', true)
      .neq('id', currentProduct.id)
      .limit(50);

    if (error || !products || products.length === 0) {
      container.style.display = 'none';
      return;
    }

    const currentPrice = parseFloat(currentProduct.precio);

    // Clasificar productos por precio
    const cheaper = products.filter(p => parseFloat(p.precio) < currentPrice).sort((a, b) => parseFloat(b.precio) - parseFloat(a.precio));
    const moreExpensive = products.filter(p => parseFloat(p.precio) > currentPrice).sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio));
    const similar = products.filter(p => {
      const price = parseFloat(p.precio);
      const diff = Math.abs(price - currentPrice) / currentPrice;
      return diff <= 0.15 && price !== currentPrice;
    });

    const recommended = [];

    // Agregar más barato
    if (cheaper.length > 0) {
      recommended.push(cheaper[0]);
    } else {
      // Si no hay más barato, buscar dentro del rango 50%
      const fallback = products.filter(p => parseFloat(p.precio) >= currentPrice * 0.5 && parseFloat(p.precio) < currentPrice);
      if (fallback.length > 0) recommended.push(fallback[0]);
    }

    // Agregar similar
    if (similar.length > 0) {
      const randomSimilar = similar[Math.floor(Math.random() * similar.length)];
      if (!recommended.find(p => p.id === randomSimilar.id)) {
        recommended.push(randomSimilar);
      }
    }

    // Agregar más caro
    if (moreExpensive.length > 0) {
      recommended.push(moreExpensive[0]);
    } else {
      // Si no hay más caro, buscar dentro del rango 50%
      const fallback = products.filter(p => parseFloat(p.precio) > currentPrice && parseFloat(p.precio) <= currentPrice * 1.5);
      if (fallback.length > 0) recommended.push(fallback[0]);
    }

    // Si aún no tenemos 3, llenar con productos aleatorios de la categoría
    while (recommended.length < 3 && products.length > recommended.length) {
      const random = products[Math.floor(Math.random() * products.length)];
      if (!recommended.find(p => p.id === random.id)) {
        recommended.push(random);
      }
    }

    // Si no hay productos recomendados, ocultar
    if (recommended.length === 0) {
      container.style.display = 'none';
      return;
    }

    // Renderizar productos recomendados
    grid.innerHTML = recommended.map(product => {
      const mainImage = product.imagenes && product.imagenes.length > 0
        ? product.imagenes[0]
        : 'https://via.placeholder.com/300x300?text=Sin+Imagen';

      return `
        <div class="recommended-item" data-product-id="${product.id}">
          <img src="${mainImage}" alt="${product.nombre}" class="recommended-image">
          <div class="recommended-info">
            <p class="recommended-name">${product.nombre}</p>
            <p class="recommended-price">${formatPrice(product.precio)}</p>
          </div>
        </div>
      `;
    }).join('');

    container.style.display = 'block';

    // Hacer items clicables
    document.querySelectorAll('.recommended-item').forEach(item => {
      item.addEventListener('click', async () => {
        const productId = item.dataset.productId;

        // Cargar producto completo
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

  } catch (error) {
    console.error('Error al cargar productos recomendados:', error);
    container.style.display = 'none';
  }
}
