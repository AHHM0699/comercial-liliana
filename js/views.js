/**
 * VIEWS.JS - Renderizado de vistas de la SPA
 * Cada función renderiza una vista específica de la aplicación
 */

// ========== VISTA HOME ==========
function renderHomeView() {
  console.log('🏠 Renderizando vista HOME');

  const container = document.getElementById('home-groups-grid');
  if (!container) return;

  if (!allGroups || allGroups.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 2rem;">No hay grupos disponibles</p>';
    return;
  }

  // Ordenar por el campo 'orden'
  const sortedGroups = [...allGroups].sort((a, b) => (a.orden || 0) - (b.orden || 0));

  container.innerHTML = sortedGroups.map(group => {
    return `
      <div class="group-card" onclick="navigate('/grupo?id=${group.id}')">
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

  // Cargar imágenes aleatorias para cada grupo
  loadGroupCarousels();
}

// ========== VISTA GRUPO ==========
async function renderGroupView(groupId) {
  console.log('📂 Renderizando vista GRUPO:', groupId);

  const container = document.getElementById('group-categories-grid');
  const titleElement = document.getElementById('group-view-title');
  const backBtn = document.getElementById('group-back-btn');

  if (!container || !titleElement) return;

  // Configurar botón de regresar
  if (backBtn) {
    backBtn.onclick = () => navigate('/');
  }

  // Buscar grupo por ID
  const group = allGroups.find(g => g.id === groupId);
  if (!group) {
    console.error('❌ Grupo no encontrado:', groupId);
    container.innerHTML = '<p style="text-align: center; padding: 2rem;">Grupo no encontrado</p>';
    return;
  }

  console.log('✅ Grupo encontrado:', group);

  // Actualizar título
  titleElement.textContent = `${group.icono || '📦'} ${group.nombre}`;

  // Obtener categorías del grupo
  const categoriesOfGroup = allCategories.filter(cat => cat.grupo_id === groupId);

  console.log('📂 Categorías del grupo:', categoriesOfGroup.length, categoriesOfGroup);

  if (categoriesOfGroup.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 2rem;">No hay categorías en este grupo</p>';
    return;
  }

  // Ordenar alfabéticamente
  const sortedCategories = categoriesOfGroup.sort((a, b) => a.nombre.localeCompare(b.nombre));

  // Renderizar categorías
  container.innerHTML = sortedCategories.map(category => {
    const carouselId = `cat-carousel-${category.id}`;
    return `
      <div class="category-card" onclick="navigate('/categoria?id=${category.id}&grupo=${groupId}')">
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

  // Cargar productos aleatorios para cada categoría
  for (const category of sortedCategories) {
    await loadCategoryCarouselForView(category.id);
  }
}

// ========== VISTA CATEGORÍA ==========
async function renderCategoryView(categoryId, groupId) {
  console.log('🗂️ Renderizando vista CATEGORÍA:', categoryId);

  const container = document.getElementById('category-products-grid');
  const titleElement = document.getElementById('category-view-title');
  const backBtn = document.getElementById('category-back-btn');

  if (!container || !titleElement) return;

  // Configurar botón de regresar
  if (backBtn) {
    backBtn.onclick = () => {
      if (groupId) {
        navigate(`/grupo?id=${groupId}`);
      } else {
        navigate('/');
      }
    };
  }

  // Obtener nombre de la categoría
  const category = allCategories.find(cat => cat.id === categoryId || cat.id === parseInt(categoryId));
  if (category) {
    titleElement.textContent = category.nombre;
  }

  // Mostrar loading
  container.innerHTML = '<div style="text-align: center; padding: 3rem;"><div class="spinner"></div><p>Cargando productos...</p></div>';

  // Obtener todos los productos de la categoría
  const { data: products, error } = await supabaseClient
    .from('productos')
    .select('*')
    .eq('categoria_id', categoryId)
    .eq('activo', true);

  if (error || !products || products.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 2rem;">No hay productos en esta categoría</p>';
    return;
  }

  // Ordenar por precio (menor a mayor)
  products.sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio));

  // Renderizar productos
  container.innerHTML = products.map(product => {
    const images = product.imagenes || [];
    const hasDiscount = product.precio_original && parseFloat(product.precio_original) > parseFloat(product.precio);
    let discountPercentage = 0;

    if (hasDiscount) {
      const original = parseFloat(product.precio_original);
      const current = parseFloat(product.precio);
      discountPercentage = Math.round(((original - current) / original) * 100);
    }

    const carouselId = `prod-carousel-${product.id}`;
    const navPath = `/producto?id=${product.id}&categoria=${categoryId}${groupId ? `&grupo=${groupId}` : ''}`;

    return `
      <div class="category-product-card" onclick="navigate('${navPath}')">
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
}

// ========== VISTA PRODUCTO ==========
async function renderProductView(productId, categoryId, groupId) {
  console.log('📦 Renderizando vista PRODUCTO:', productId);

  const backBtn = document.getElementById('product-back-btn');

  // Configurar botón de regresar
  if (backBtn) {
    backBtn.onclick = () => {
      if (categoryId) {
        navigate(`/categoria?id=${categoryId}${groupId ? `&grupo=${groupId}` : ''}`);
      } else if (groupId) {
        navigate(`/grupo?id=${groupId}`);
      } else {
        navigate('/');
      }
    };
  }

  // Obtener producto completo con categoría
  const { data: product, error } = await supabaseClient
    .from('productos')
    .select(`
      *,
      categoria:categorias(*)
    `)
    .eq('id', productId)
    .single();

  if (error || !product) {
    console.error('Error al cargar producto:', error);
    document.getElementById('product-view-container').innerHTML =
      '<p style="text-align: center; padding: 2rem;">Producto no encontrado</p>';
    return;
  }

  // Renderizar el producto
  renderProductDetails(product);
}

// ========== FUNCIONES AUXILIARES ==========

async function loadCategoryCarouselForView(categoryId) {
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

// Exportar funciones globalmente
window.renderHomeView = renderHomeView;
window.renderGroupView = renderGroupView;
window.renderCategoryView = renderCategoryView;
window.renderProductView = renderProductView;
