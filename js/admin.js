/**
 * PANEL DE ADMINISTRACIÓN - COMERCIAL LILIANA
 *
 * Este archivo maneja toda la lógica del panel de administración:
 * - Autenticación
 * - Gestión de productos (CRUD)
 * - Gestión de categorías (CRUD)
 * - Subida de imágenes
 */

// ========== VARIABLES GLOBALES ==========
let currentUser = null;
let allCategories = [];
let allProducts = [];
let currentEditingProduct = null;
let currentEditingCategory = null;
let productImages = []; // Array de objetos {url, file, isNew}
let confirmCallback = null;

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔧 Iniciando Panel de Administración...');

  // Verificar sesión
  checkSession();

  // Inicializar event listeners
  initLoginForm();
  initLogoutButton();
  initNavigation();
  initModals();
  initProductForm();
  initCategoryForm();
});

// ========== VERIFICAR SESIÓN ==========
async function checkSession() {
  showLoading();

  const user = await getCurrentUser();

  if (user) {
    currentUser = user;
    showAdminPanel();
    loadInitialData();
  } else {
    showLoginScreen();
  }

  hideLoading();
}

// ========== MOSTRAR/OCULTAR PANTALLAS ==========
function showLoginScreen() {
  document.getElementById('loginContainer').style.display = 'flex';
  document.getElementById('adminPanel').style.display = 'none';
}

function showAdminPanel() {
  document.getElementById('loginContainer').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  document.getElementById('userEmail').textContent = currentUser.email;
}

// ========== FORMULARIO DE LOGIN ==========
function initLoginForm() {
  const form = document.getElementById('loginForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    errorDiv.style.display = 'none';

    showLoading();

    const result = await signIn(email, password);

    hideLoading();

    if (result.success) {
      currentUser = result.user;
      showAdminPanel();
      loadInitialData();
    } else {
      errorDiv.textContent = 'Error: ' + (result.error || 'Credenciales inválidas');
      errorDiv.style.display = 'block';
    }
  });
}

// ========== BOTÓN DE CERRAR SESIÓN ==========
function initLogoutButton() {
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    if (confirm('¿Seguro que deseas cerrar sesión?')) {
      showLoading();
      await signOut();
      hideLoading();
      showLoginScreen();
      currentUser = null;
    }
  });
}

// ========== NAVEGACIÓN ENTRE SECCIONES ==========
function initNavigation() {
  document.querySelectorAll('.admin-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;

      // Actualizar botones activos
      document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Mostrar sección correspondiente
      document.getElementById('productsSection').style.display = 'none';
      document.getElementById('categoriesSection').style.display = 'none';
      document.getElementById('groupsSection').style.display = 'none';
      document.getElementById('messagesSection').style.display = 'none';

      if (section === 'products') {
        document.getElementById('productsSection').style.display = 'block';
      } else if (section === 'categories') {
        document.getElementById('categoriesSection').style.display = 'block';
      } else if (section === 'groups') {
        document.getElementById('groupsSection').style.display = 'block';
        loadGroups();
      } else if (section === 'messages') {
        document.getElementById('messagesSection').style.display = 'block';
        initMessagesSection();
      }
    });
  });
}

// ========== CARGAR DATOS INICIALES ==========
async function loadInitialData() {
  await loadCategories();
  await loadProducts();
}

// ========== CARGAR CATEGORÍAS ==========
async function loadCategories() {
  const result = await getCategories();

  if (result.success) {
    allCategories = result.data;
    populateCategorySelects();
    renderCategoriesGrid();
  }
}

// ========== POPULAR SELECTS DE CATEGORÍAS ==========
function populateCategorySelects() {
  const productCategorySelect = document.getElementById('productCategory');
  const filterSelect = document.getElementById('categoryFilterSelect');

  const options = allCategories.map(cat =>
    `<option value="${cat.id}">${cat.icono || ''} ${cat.nombre}</option>`
  ).join('');

  productCategorySelect.innerHTML = '<option value="">Seleccionar categoría</option>' + options;
  filterSelect.innerHTML = '<option value="">Todas las categorías</option>' + options;
}

// ========== RENDERIZAR GRID DE CATEGORÍAS ==========
function renderCategoriesGrid() {
  const grid = document.getElementById('categoriesGrid');

  if (allCategories.length === 0) {
    grid.innerHTML = '<p style="text-align: center; padding: 2rem;">No hay categorías registradas</p>';
    return;
  }

  grid.innerHTML = allCategories.map(cat => {
    const groupInfo = CONFIG.CATEGORY_GROUPS[cat.grupo] || { name: cat.grupo, icon: '📦' };

    return `
      <div class="category-card">
        <div class="category-card-header">
          <div class="category-icon-large">${cat.icono || '📦'}</div>
          <div class="category-card-actions">
            <button class="action-btn action-btn-edit" onclick="editCategory('${cat.id}')" title="Editar">
              ✏️
            </button>
            <button class="action-btn action-btn-delete" onclick="confirmDeleteCategory('${cat.id}')" title="Eliminar">
              🗑️
            </button>
          </div>
        </div>
        <h3 class="category-name-large">${cat.nombre}</h3>
        <span class="category-group-badge">${groupInfo.icon} ${groupInfo.name}</span>
        <p class="category-products-count" id="catCount-${cat.id}">Cargando productos...</p>
      </div>
    `;
  }).join('');

  // Contar productos por categoría
  allCategories.forEach(cat => {
    countProductsByCategory(cat.id);
  });
}

// ========== CONTAR PRODUCTOS POR CATEGORÍA ==========
async function countProductsByCategory(categoryId) {
  const result = await getProducts({ categoryId, limit: 1000 });
  const count = result.success ? result.data.length : 0;
  const element = document.getElementById(`catCount-${categoryId}`);
  if (element) {
    element.textContent = `${count} producto${count !== 1 ? 's' : ''}`;
  }
}

// ========== CARGAR PRODUCTOS ==========
async function loadProducts() {
  const tbody = document.getElementById('productsTableBody');
  tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;"><div class="spinner"></div></td></tr>';

  const search = document.getElementById('productSearchInput').value;
  const categoryId = document.getElementById('categoryFilterSelect').value;

  const result = await getProducts({
    search,
    categoryId: categoryId || null,
    orderBy: 'nombre',
    orderDirection: 'asc',
    limit: 100
  });

  if (result.success) {
    allProducts = result.data;
    renderProductsTable();
  } else {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Error al cargar productos</td></tr>';
  }
}

// ========== RENDERIZAR TABLA DE PRODUCTOS ==========
function renderProductsTable() {
  const tbody = document.getElementById('productsTableBody');

  if (allProducts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No hay productos registrados</td></tr>';
    return;
  }

  tbody.innerHTML = allProducts.map(product => {
    const image = product.imagenes && product.imagenes.length > 0
      ? product.imagenes[0]
      : 'https://via.placeholder.com/60?text=Sin+Imagen';

    const categoryName = product.categoria?.nombre || 'Sin categoría';
    const price = formatPrice(product.precio);

    return `
      <tr>
        <td>
          <img src="${image}" alt="${product.nombre}" class="product-table-image">
        </td>
        <td>
          <div class="product-table-name">${product.nombre}</div>
          ${product.es_oferta ? '<span class="badge badge-oferta">OFERTA</span>' : ''}
        </td>
        <td class="product-table-price">${price}</td>
        <td>
          <span class="product-table-category">${categoryName}</span>
        </td>
        <td>
          <div class="product-table-actions">
            <button class="action-btn action-btn-edit" onclick="editProduct('${product.id}')" title="Editar">
              ✏️
            </button>
            <button class="action-btn action-btn-delete" onclick="confirmDeleteProduct('${product.id}')" title="Eliminar">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ========== FORMATEAR PRECIO ==========
function formatPrice(price) {
  return `S/ ${parseFloat(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

// ========== FILTROS DE PRODUCTOS ==========
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('productSearchInput');
  const filterSelect = document.getElementById('categoryFilterSelect');

  let searchTimeout;

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => loadProducts(), 500);
    });
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', () => loadProducts());
  }
});

// ========== MODALES ==========
function initModals() {
  // Botón nuevo producto
  document.getElementById('newProductBtn').addEventListener('click', () => {
    openProductModal();
  });

  // Botón nueva categoría
  document.getElementById('newCategoryBtn').addEventListener('click', () => {
    openCategoryModal();
  });

  // Cerrar modales
  document.getElementById('closeProductModal').addEventListener('click', closeProductModal);
  document.getElementById('cancelProductBtn').addEventListener('click', closeProductModal);

  document.getElementById('closeCategoryModal').addEventListener('click', closeCategoryModal);
  document.getElementById('cancelCategoryBtn').addEventListener('click', closeCategoryModal);

  document.getElementById('closeConfirmModal').addEventListener('click', closeConfirmModal);
  document.getElementById('cancelConfirmBtn').addEventListener('click', closeConfirmModal);

  // Cerrar modal al hacer click fuera
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.style.display = 'none';
      }
    });
  });
}

// ========== MODAL DE PRODUCTO ==========
function openProductModal(productId = null) {
  const modal = document.getElementById('productModal');
  const title = document.getElementById('productModalTitle');
  const form = document.getElementById('productForm');

  form.reset();
  productImages = [];
  renderImagesPreviews();

  // Limpiar vista previa
  const previewContainer = document.getElementById('productPreview');
  if (previewContainer) {
    previewContainer.innerHTML = `
      <div class="product-card product-preview-card">
        <div class="product-carousel">
          <div class="product-carousel-slide">
            <img src="https://via.placeholder.com/300x250?text=Sin+Imagen" alt="Vista previa" class="product-image">
          </div>
        </div>
        <div class="product-content">
          <h3 class="product-name">Nombre del producto</h3>
          <p class="product-price">S/ 0.00</p>
          <button class="btn btn-whatsapp product-consult-btn">
            📱 Consultar
          </button>
        </div>
      </div>
    `;
  }

  if (productId) {
    title.textContent = 'Editar Producto';
    loadProductData(productId);
  } else {
    title.textContent = 'Nuevo Producto';
    currentEditingProduct = null;
  }

  modal.style.display = 'flex';
}

function closeProductModal() {
  document.getElementById('productModal').style.display = 'none';
  currentEditingProduct = null;
  productImages = [];
}

async function loadProductData(productId) {
  showLoading();

  const result = await getProductById(productId);

  if (result.success) {
    const product = result.data;
    currentEditingProduct = product;

    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.nombre;
    document.getElementById('productPrice').value = product.precio;
    document.getElementById('productOriginalPrice').value = product.precio_original || '';
    document.getElementById('productCategory').value = product.categoria_id;
    document.getElementById('productDescription').value = product.descripcion || '';
    document.getElementById('productIsOffer').checked = product.es_oferta;

    // Cargar mensajes personalizados si existen
    const customMessages = product.mensajes_personalizados || [];
    document.getElementById('productCustomMessages').value = customMessages.join('\n');

    // Cargar imágenes existentes
    productImages = (product.imagenes || []).map(url => ({
      url,
      isNew: false
    }));

    renderImagesPreviews();
    updateProductPreview();
  }

  hideLoading();
}

// ========== FORMULARIO DE PRODUCTO ==========
function initProductForm() {
  const captureBtn = document.getElementById('capturePhotoBtn');
  const selectBtn = document.getElementById('selectFilesBtn');
  const cameraInput = document.getElementById('cameraInput');
  const imageInput = document.getElementById('imageInput');
  const saveBtn = document.getElementById('saveProductBtn');

  // Tomar foto
  captureBtn.addEventListener('click', () => {
    cameraInput.click();
  });

  // Seleccionar archivos
  selectBtn.addEventListener('click', () => {
    imageInput.click();
  });

  // Procesar imágenes capturadas
  cameraInput.addEventListener('change', handleImageSelection);
  imageInput.addEventListener('change', handleImageSelection);

  // Guardar producto
  saveBtn.addEventListener('click', saveProduct);

  // Actualizar preview al cambiar campos
  ['productName', 'productPrice', 'productOriginalPrice', 'productDescription', 'productIsOffer'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', updateProductPreview);
      element.addEventListener('change', updateProductPreview);
    }
  });
}

// ========== MANEJAR SELECCIÓN DE IMÁGENES ==========
async function handleImageSelection(e) {
  const files = Array.from(e.target.files);

  if (files.length === 0) return;

  showLoading();

  for (const file of files) {
    try {
      // Comprimir imagen
      const compressed = await compressImage(file);

      // Crear URL de preview
      const previewURL = createPreviewURL(compressed);

      productImages.push({
        url: previewURL,
        file: blobToFile(compressed, file.name),
        isNew: true
      });
    } catch (error) {
      console.error('Error al procesar imagen:', error);
      alert('Error al procesar imagen: ' + error.message);
    }
  }

  renderImagesPreviews();
  updateProductPreview();

  // Limpiar inputs
  e.target.value = '';

  hideLoading();
}

// ========== RENDERIZAR PREVIEWS DE IMÁGENES ==========
function renderImagesPreviews() {
  const grid = document.getElementById('imagesPreviewGrid');

  grid.innerHTML = productImages.map((img, index) => `
    <div class="image-preview-item has-image"
         draggable="true"
         data-index="${index}"
         ondragstart="handleDragStart(event, ${index})"
         ondragover="handleDragOver(event)"
         ondrop="handleDrop(event, ${index})"
         ondragend="handleDragEnd(event)">
      <div class="image-drag-handle" title="Arrastra para reordenar">⋮⋮</div>
      <img src="${img.url}" alt="Preview ${index + 1}" class="image-preview">
      <button
        type="button"
        class="image-remove-btn"
        onclick="removeImage(${index})"
        title="Eliminar imagen"
      >
        ✕
      </button>
    </div>
  `).join('') + `
    <div class="image-preview-item">
      <button type="button" class="image-add-btn" onclick="document.getElementById('imageInput').click()">
        <span class="image-add-icon">+</span>
        <span class="image-add-text">Agregar</span>
      </button>
    </div>
  `;
}

// ========== ELIMINAR IMAGEN ==========
function removeImage(index) {
  const img = productImages[index];

  // Si es una preview, revocar URL
  if (img.isNew) {
    revokePreviewURL(img.url);
  }

  productImages.splice(index, 1);
  renderImagesPreviews();
  updateProductPreview();
}

// ========== DRAG AND DROP PARA REORDENAR IMÁGENES ==========
let draggedIndex = null;

function handleDragStart(event, index) {
  draggedIndex = index;
  event.target.classList.add('dragging');
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/html', event.target.innerHTML);
}

function handleDragOver(event) {
  if (event.preventDefault) {
    event.preventDefault();
  }
  event.dataTransfer.dropEffect = 'move';

  const target = event.target.closest('.image-preview-item.has-image');
  if (target && draggedIndex !== null) {
    target.classList.add('drag-over');
  }

  return false;
}

function handleDrop(event, dropIndex) {
  if (event.stopPropagation) {
    event.stopPropagation();
  }

  event.preventDefault();

  const target = event.target.closest('.image-preview-item.has-image');
  if (target) {
    target.classList.remove('drag-over');
  }

  if (draggedIndex !== null && draggedIndex !== dropIndex) {
    // Reordenar array
    const draggedImage = productImages[draggedIndex];
    productImages.splice(draggedIndex, 1);
    productImages.splice(dropIndex, 0, draggedImage);

    // Re-renderizar
    renderImagesPreviews();
    updateProductPreview();
  }

  return false;
}

function handleDragEnd(event) {
  event.target.classList.remove('dragging');

  // Limpiar todas las clases drag-over
  document.querySelectorAll('.image-preview-item').forEach(item => {
    item.classList.remove('drag-over');
  });

  draggedIndex = null;
}

// ========== ACTUALIZAR PREVIEW DEL PRODUCTO ==========
function updateProductPreview() {
  const previewContainer = document.getElementById('productPreview');

  const name = document.getElementById('productName').value || 'Nombre del producto';
  const price = document.getElementById('productPrice').value || '0';
  const originalPrice = document.getElementById('productOriginalPrice').value || '';
  const description = document.getElementById('productDescription').value || '';
  const isOffer = document.getElementById('productIsOffer').checked;

  const formattedPrice = formatPrice(price);
  const hasDiscount = originalPrice && parseFloat(originalPrice) > parseFloat(price);

  let discountPercentage = 0;
  let formattedOriginalPrice = '';

  if (hasDiscount) {
    const original = parseFloat(originalPrice);
    const current = parseFloat(price);
    discountPercentage = Math.round(((original - current) / original) * 100);
    formattedOriginalPrice = formatPrice(originalPrice);
  }

  const firstImage = productImages.length > 0
    ? productImages[0].url
    : 'https://via.placeholder.com/300x250?text=Sin+Imagen';

  previewContainer.innerHTML = `
    <div class="product-card product-preview-card">
      <div class="product-carousel">
        <div class="product-carousel-slide">
          <img src="${firstImage}" alt="${name}" class="product-image">
        </div>
        ${isOffer || hasDiscount ? `<span class="product-badge">${hasDiscount ? `¡${discountPercentage}% OFF!` : '¡OFERTA!'}</span>` : ''}
      </div>
      <div class="product-content">
        <h3 class="product-name">${name}</h3>
        ${hasDiscount ? `
          <div class="product-pricing">
            <p class="product-price-original">${formattedOriginalPrice}</p>
            <p class="product-price-discount">${formattedPrice}</p>
            <p class="product-price-note">💬 ¡Consulta por el precio final!</p>
          </div>
        ` : `
          <p class="product-price">${formattedPrice}</p>
        `}
        ${description ? `<p class="product-description">${description}</p>` : ''}
        <button class="btn btn-whatsapp product-consult-btn">
          📱 Consultar
        </button>
      </div>
    </div>
  `;
}

// ========== GUARDAR PRODUCTO ==========
async function saveProduct() {
  const form = document.getElementById('productForm');

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  if (productImages.length === 0) {
    alert('Debes agregar al menos una imagen');
    return;
  }

  showLoading();

  try {
    // Subir imágenes nuevas
    const imageUrls = [];

    for (const img of productImages) {
      if (img.isNew) {
        // Subir imagen nueva
        const result = await uploadImage(img.file);
        if (result.success) {
          imageUrls.push(result.url);
          revokePreviewURL(img.url); // Limpiar preview
        } else {
          throw new Error('Error al subir imagen: ' + result.error);
        }
      } else {
        // Mantener URL existente
        imageUrls.push(img.url);
      }
    }

    // Preparar datos del producto
    const originalPriceValue = document.getElementById('productOriginalPrice').value;

    // Procesar mensajes personalizados
    const customMessagesText = document.getElementById('productCustomMessages').value.trim();
    const customMessages = customMessagesText
      ? customMessagesText.split('\n').map(msg => msg.trim()).filter(msg => msg.length > 0)
      : null;

    const productData = {
      nombre: document.getElementById('productName').value.trim(),
      precio: parseFloat(document.getElementById('productPrice').value),
      precio_original: originalPriceValue ? parseFloat(originalPriceValue) : null,
      categoria_id: document.getElementById('productCategory').value,
      descripcion: document.getElementById('productDescription').value.trim(),
      es_oferta: document.getElementById('productIsOffer').checked,
      imagenes: imageUrls,
      mensajes_personalizados: customMessages,
      activo: true
    };

    let result;

    if (currentEditingProduct) {
      // Actualizar producto existente
      result = await updateProduct(currentEditingProduct.id, productData);
    } else {
      // Crear nuevo producto
      result = await createProduct(productData);
    }

    if (result.success) {
      alert('✅ Producto guardado correctamente');
      closeProductModal();
      await loadProducts();
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error al guardar producto:', error);
    alert('❌ Error al guardar producto: ' + error.message);
  }

  hideLoading();
}

// ========== EDITAR PRODUCTO ==========
function editProduct(productId) {
  openProductModal(productId);
}

// ========== ELIMINAR PRODUCTO ==========
function confirmDeleteProduct(productId) {
  const product = allProducts.find(p => p.id === productId);

  if (!product) return;

  showConfirmModal(
    `¿Estás seguro de eliminar "${product.nombre}"?`,
    async () => {
      showLoading();

      const result = await deleteProduct(productId);

      if (result.success) {
        alert('✅ Producto eliminado correctamente');
        await loadProducts();
      } else {
        alert('❌ Error al eliminar producto: ' + result.error);
      }

      hideLoading();
    }
  );
}

// ========== MODAL DE CATEGORÍA ==========
function openCategoryModal(categoryId = null) {
  const modal = document.getElementById('categoryModal');
  const title = document.getElementById('categoryModalTitle');
  const form = document.getElementById('categoryForm');

  form.reset();

  if (categoryId) {
    title.textContent = 'Editar Categoría';
    loadCategoryData(categoryId);
  } else {
    title.textContent = 'Nueva Categoría';
    currentEditingCategory = null;
  }

  modal.style.display = 'flex';
}

function closeCategoryModal() {
  document.getElementById('categoryModal').style.display = 'none';
  currentEditingCategory = null;
}

function loadCategoryData(categoryId) {
  const category = allCategories.find(c => c.id === categoryId);

  if (category) {
    currentEditingCategory = category;

    document.getElementById('categoryId').value = category.id;
    document.getElementById('categoryName').value = category.nombre;
    document.getElementById('categoryGroup').value = category.grupo;
    document.getElementById('categoryIcon').value = category.icono || '';
    document.getElementById('categoryOrder').value = category.orden || 0;
  }
}

// ========== FORMULARIO DE CATEGORÍA ==========
function initCategoryForm() {
  document.getElementById('saveCategoryBtn').addEventListener('click', saveCategory);
}

async function saveCategory() {
  const form = document.getElementById('categoryForm');

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  showLoading();

  const categoryData = {
    nombre: document.getElementById('categoryName').value.trim(),
    grupo: document.getElementById('categoryGroup').value,
    icono: document.getElementById('categoryIcon').value.trim(),
    orden: parseInt(document.getElementById('categoryOrder').value) || 0
  };

  let result;

  if (currentEditingCategory) {
    result = await updateCategory(currentEditingCategory.id, categoryData);
  } else {
    result = await createCategory(categoryData);
  }

  if (result.success) {
    alert('✅ Categoría guardada correctamente');
    closeCategoryModal();
    await loadCategories();
    await loadProducts(); // Recargar productos para actualizar filtros
  } else {
    alert('❌ Error al guardar categoría: ' + result.error);
  }

  hideLoading();
}

// ========== EDITAR CATEGORÍA ==========
function editCategory(categoryId) {
  openCategoryModal(categoryId);
}

// ========== ELIMINAR CATEGORÍA ==========
function confirmDeleteCategory(categoryId) {
  const category = allCategories.find(c => c.id === categoryId);

  if (!category) return;

  showConfirmModal(
    `¿Estás seguro de eliminar la categoría "${category.nombre}"? Los productos de esta categoría quedarán sin categoría.`,
    async () => {
      showLoading();

      const result = await deleteCategory(categoryId);

      if (result.success) {
        alert('✅ Categoría eliminada correctamente');
        await loadCategories();
      } else {
        alert('❌ Error al eliminar categoría: ' + result.error);
      }

      hideLoading();
    }
  );
}

// ========== MODAL DE CONFIRMACIÓN ==========
function showConfirmModal(message, callback) {
  document.getElementById('confirmMessage').textContent = message;
  document.getElementById('confirmModal').style.display = 'flex';

  confirmCallback = callback;

  document.getElementById('confirmActionBtn').onclick = () => {
    closeConfirmModal();
    if (confirmCallback) {
      confirmCallback();
    }
  };
}

function closeConfirmModal() {
  document.getElementById('confirmModal').style.display = 'none';
  confirmCallback = null;
}

// ========== LOADING ==========
function showLoading() {
  document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
  document.getElementById('loadingOverlay').style.display = 'none';
}

// ========== GESTIÓN DE GRUPOS ==========
let allGroups = [];
let currentEditingGroup = null;

// Inicializar eventos de grupos
document.getElementById('newGroupBtn').addEventListener('click', () => openGroupModal());
document.getElementById('closeGroupModal').addEventListener('click', closeGroupModal);
document.getElementById('cancelGroupBtn').addEventListener('click', closeGroupModal);
document.getElementById('saveGroupBtn').addEventListener('click', saveGroup);

async function loadGroups() {
  showLoading();

  try {
    const { data, error } = await supabaseClient
      .from('grupos')
      .select('*')
      .order('orden', { ascending: true });

    if (error) throw error;

    allGroups = data || [];
    renderGroupsGrid();
  } catch (error) {
    console.error('Error al cargar grupos:', error);
    alert('Error al cargar grupos. Es posible que la tabla no exista aún.');
  }

  hideLoading();
}

function renderGroupsGrid() {
  const grid = document.getElementById('groupsGrid');

  if (allGroups.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <p>No hay grupos registrados</p>
        <p><small>Haz clic en "+ Nuevo Grupo" para crear uno</small></p>
      </div>
    `;
    return;
  }

  grid.innerHTML = allGroups.map(group => `
    <div class="category-card" style="border-left: 4px solid ${group.color}">
      <div class="category-header">
        <span class="category-icon">${group.icono}</span>
        <h3 class="category-name">${group.nombre}</h3>
      </div>
      <div class="category-info">
        <span class="category-badge" style="background-color: ${group.color}20; color: ${group.color}">
          ${group.clave}
        </span>
        <span class="category-order">Orden: ${group.orden}</span>
      </div>
      <div class="category-actions">
        <button class="btn-icon" onclick="editGroup('${group.id}')" title="Editar">
          ✏️
        </button>
        <button class="btn-icon btn-icon-danger" onclick="confirmDeleteGroup('${group.id}')" title="Eliminar">
          🗑️
        </button>
      </div>
    </div>
  `).join('');
}

function openGroupModal(groupId = null) {
  const modal = document.getElementById('groupModal');
  const title = document.getElementById('groupModalTitle');
  const form = document.getElementById('groupForm');

  form.reset();

  if (groupId) {
    title.textContent = 'Editar Grupo';
    loadGroupData(groupId);
  } else {
    title.textContent = 'Nuevo Grupo';
    currentEditingGroup = null;
    // Deshabilitar edición de clave en nuevo grupo
    document.getElementById('groupKey').disabled = false;
  }

  modal.style.display = 'flex';
}

function closeGroupModal() {
  document.getElementById('groupModal').style.display = 'none';
  currentEditingGroup = null;
}

async function loadGroupData(groupId) {
  const group = allGroups.find(g => g.id === groupId);

  if (group) {
    currentEditingGroup = group;

    document.getElementById('groupId').value = group.id;
    document.getElementById('groupKey').value = group.clave;
    document.getElementById('groupName').value = group.nombre;
    document.getElementById('groupIcon').value = group.icono;
    document.getElementById('groupColor').value = group.color;
    document.getElementById('groupOrder').value = group.orden || 0;

    // Deshabilitar edición de clave en edición
    document.getElementById('groupKey').disabled = true;
  }
}

async function saveGroup() {
  const form = document.getElementById('groupForm');

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  showLoading();

  try {
    const groupData = {
      clave: document.getElementById('groupKey').value.trim().toLowerCase(),
      nombre: document.getElementById('groupName').value.trim(),
      icono: document.getElementById('groupIcon').value.trim(),
      color: document.getElementById('groupColor').value.trim(),
      orden: parseInt(document.getElementById('groupOrder').value) || 0,
      activo: true
    };

    let result;

    if (currentEditingGroup) {
      // Actualizar grupo existente
      const { data, error } = await supabaseClient
        .from('grupos')
        .update(groupData)
        .eq('id', currentEditingGroup.id)
        .select();

      if (error) throw error;
      result = data;
    } else {
      // Crear nuevo grupo
      const { data, error } = await supabaseClient
        .from('grupos')
        .insert([groupData])
        .select();

      if (error) throw error;
      result = data;
    }

    alert('✅ Grupo guardado correctamente');
    closeGroupModal();
    await loadGroups();

  } catch (error) {
    console.error('Error al guardar grupo:', error);
    if (error.code === '23505') {
      alert('❌ Ya existe un grupo con esa clave');
    } else {
      alert('❌ Error al guardar grupo: ' + error.message);
    }
  }

  hideLoading();
}

function editGroup(groupId) {
  openGroupModal(groupId);
}

function confirmDeleteGroup(groupId) {
  const group = allGroups.find(g => g.id === groupId);

  if (!group) return;

  showConfirmModal(
    `¿Estás seguro de eliminar el grupo "${group.nombre}"? Esta acción no se puede deshacer.`,
    async () => {
      await deleteGroup(groupId);
    }
  );
}

async function deleteGroup(groupId) {
  showLoading();

  try {
    const { error } = await supabaseClient
      .from('grupos')
      .delete()
      .eq('id', groupId);

    if (error) throw error;

    alert('✅ Grupo eliminado correctamente');
    await loadGroups();

  } catch (error) {
    console.error('Error al eliminar grupo:', error);
    if (error.code === '23503') {
      alert('❌ No se puede eliminar el grupo porque tiene categorías asociadas');
    } else {
      alert('❌ Error al eliminar grupo: ' + error.message);
    }
  }

  hideLoading();
}

// Exponer funciones globalmente para onclick en HTML
window.editProduct = editProduct;
window.confirmDeleteProduct = confirmDeleteProduct;
window.editCategory = editCategory;
window.confirmDeleteCategory = confirmDeleteCategory;
window.editGroup = editGroup;
window.confirmDeleteGroup = confirmDeleteGroup;
window.removeImage = removeImage;

// ========================================================================
// GESTIÓN DE MENSAJES PROMOCIONALES
// ========================================================================

const MESSAGES_STORAGE_KEY = 'comercial_liliana_messages_config';

// Configuración por defecto de mensajes
const defaultMessagesConfig = {
  timing: {
    promoBannerInterval: 4000,
    carouselInterval: 3000,
    modalMessageMin: 12000,
    modalMessageMax: 15000
  },
  priceRanges: {
    midPrice: 500,
    highPrice: 1000
  },
  randomize: {
    header: true,
    main: true,
    modalLow: true,
    modalMid: true,
    modalHigh: true
  },
  headerMessages: [
    '¡Pregunta por nuestras OFERTAS especiales! 🎉',
    '¡Descuentos exclusivos en muebles! 💰',
    '🚚 Envío GRATIS en compras mayores a S/500 al Bajo Piura',
    '🎁 Obsequios especiales en compras mayores a S/1000',
    '¡Escríbenos por WhatsApp y cotiza! 📱',
    'Nuevos productos cada semana 🆕',
    '💯 La mejor calidad al mejor precio',
    '🏷️ Descuentos por compra al por mayor',
    '⭐ Consulta por financiamiento disponible',
    '📦 Productos de la mejor calidad para tu hogar'
  ],
  mainMessages: [
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
  ],
  modalLowMessages: [
    "💰 ¡Consulta por descuentos especiales!",
    "🎁 ¿Buscas mejor precio? ¡Pregúntanos!",
    "✨ Tenemos promociones increíbles para ti",
    "💬 ¡Escríbenos y te damos el mejor precio!",
    "🏷️ Descuentos por compra al por mayor",
    "🎉 ¡Pregunta por nuestras ofertas del día!",
    "💯 La mejor calidad al mejor precio",
    "📦 ¿Quieres envío gratuito? ¡Pregúntanos cómo!",
    "🚀 ¡Aprovecha nuestras promociones!",
    "⭐ Consulta por financiamiento disponible"
  ],
  modalMidMessages: [
    "🆓 ¡Envío GRATUITO a todo el Bajo Piura!",
    "🎉 ¡Excelente elección! Envío gratis incluido",
    "✨ Producto premium con envío sin costo",
    "💰 Consulta por descuentos adicionales",
    "🚚 Tu envío es GRATIS al Bajo Piura",
    "💯 La mejor calidad + envío gratuito",
    "🏷️ ¡Precio especial + envío sin costo!",
    "⭐ Aprovecha el envío gratuito",
    "🎁 Pregunta por financiamiento",
    "📦 Envío gratis incluido en tu compra"
  ],
  modalHighMessages: [
    "🎁 ¡OBSEQUIO incluido en tu compra!",
    "🆓 Envío GRATIS + REGALO especial",
    "✨ Producto premium + obsequio sorpresa",
    "🎉 ¡Llévate un regalo con tu compra!",
    "💰 Descuento especial + obsequio incluido",
    "🚚 Envío gratis + regalo de cortesía",
    "⭐ ¡Compra ahora y recibe un obsequio!",
    "🎁 Regalo exclusivo por tu compra",
    "💯 La mejor calidad + envío gratis + obsequio",
    "🏆 Compra premium con regalo incluido",
    "📦 Envío gratis al Bajo Piura + obsequio",
    "💎 Producto de lujo con beneficios extras"
  ]
};

// Cargar configuración de mensajes desde localStorage o usar defaults
function loadMessagesConfig() {
  const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing messages config:', e);
      return defaultMessagesConfig;
    }
  }
  return defaultMessagesConfig;
}

// Guardar configuración de mensajes en localStorage
function saveMessagesConfig(config) {
  localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(config));
  console.log('✅ Configuración de mensajes guardada');
}

// Renderizar lista de mensajes
function renderMessagesList(messages, containerId, messageType) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = messages.map((msg, index) => `
    <div class="message-item" data-index="${index}">
      <span class="message-drag-handle">☰</span>
      <input
        type="text"
        class="message-input"
        value="${msg.replace(/"/g, '&quot;')}"
        data-type="${messageType}"
        data-index="${index}"
      >
      <button
        class="message-delete-btn"
        onclick="deleteMessage('${messageType}', ${index})"
        title="Eliminar mensaje"
      >
        ✕
      </button>
    </div>
  `).join('');
}

// Cargar todos los mensajes en la interfaz
function loadMessagesInterface() {
  const config = loadMessagesConfig();

  // Cargar tiempos
  document.getElementById('headerInterval').value = config.timing.promoBannerInterval;
  document.getElementById('carouselInterval').value = config.timing.carouselInterval;
  document.getElementById('modalMessageMinTime').value = config.timing.modalMessageMin;
  document.getElementById('modalMessageMaxTime').value = config.timing.modalMessageMax;

  // Cargar rangos de precio
  document.getElementById('midPriceThreshold').value = config.priceRanges.midPrice;
  document.getElementById('highPriceThreshold').value = config.priceRanges.highPrice;

  // Cargar toggles de aleatoriedad
  if (config.randomize) {
    document.getElementById('randomizeHeader').checked = config.randomize.header !== false;
    document.getElementById('randomizeMain').checked = config.randomize.main !== false;
    document.getElementById('randomizeModalLow').checked = config.randomize.modalLow !== false;
    document.getElementById('randomizeModalMid').checked = config.randomize.modalMid !== false;
    document.getElementById('randomizeModalHigh').checked = config.randomize.modalHigh !== false;
  }

  // Cargar listas de mensajes
  renderMessagesList(config.headerMessages, 'headerMessagesList', 'header');
  renderMessagesList(config.mainMessages, 'mainMessagesList', 'main');
  renderMessagesList(config.modalLowMessages, 'modalLowMessagesList', 'modalLow');
  renderMessagesList(config.modalMidMessages, 'modalMidMessagesList', 'modalMid');
  renderMessagesList(config.modalHighMessages, 'modalHighMessagesList', 'modalHigh');
}

// Agregar nuevo mensaje
function addMessage(messageType) {
  const config = loadMessagesConfig();
  const typeMap = {
    header: 'headerMessages',
    main: 'mainMessages',
    modalLow: 'modalLowMessages',
    modalMid: 'modalMidMessages',
    modalHigh: 'modalHighMessages'
  };

  const key = typeMap[messageType];
  if (key) {
    config[key].push('Nuevo mensaje...');
    saveMessagesConfig(config);
    loadMessagesInterface();
  }
}

// Eliminar mensaje
function deleteMessage(messageType, index) {
  const config = loadMessagesConfig();
  const typeMap = {
    header: 'headerMessages',
    main: 'mainMessages',
    modalLow: 'modalLowMessages',
    modalMid: 'modalMidMessages',
    modalHigh: 'modalHighMessages'
  };

  const key = typeMap[messageType];
  if (key) {
    if (confirm('¿Estás seguro de eliminar este mensaje?')) {
      config[key].splice(index, 1);
      saveMessagesConfig(config);
      loadMessagesInterface();
    }
  }
}

// Guardar todos los cambios
function saveAllMessagesChanges() {
  const config = loadMessagesConfig();

  // Guardar tiempos
  config.timing.promoBannerInterval = parseInt(document.getElementById('headerInterval').value) || 4000;
  config.timing.carouselInterval = parseInt(document.getElementById('carouselInterval').value) || 3000;
  config.timing.modalMessageMin = parseInt(document.getElementById('modalMessageMinTime').value) || 12000;
  config.timing.modalMessageMax = parseInt(document.getElementById('modalMessageMaxTime').value) || 15000;

  // Guardar rangos de precio
  config.priceRanges.midPrice = parseInt(document.getElementById('midPriceThreshold').value) || 500;
  config.priceRanges.highPrice = parseInt(document.getElementById('highPriceThreshold').value) || 1000;

  // Guardar toggles de aleatoriedad
  if (!config.randomize) {
    config.randomize = {};
  }
  config.randomize.header = document.getElementById('randomizeHeader').checked;
  config.randomize.main = document.getElementById('randomizeMain').checked;
  config.randomize.modalLow = document.getElementById('randomizeModalLow').checked;
  config.randomize.modalMid = document.getElementById('randomizeModalMid').checked;
  config.randomize.modalHigh = document.getElementById('randomizeModalHigh').checked;

  // Guardar mensajes desde inputs
  const saveMessagesFromInputs = (selector, key) => {
    const inputs = document.querySelectorAll(selector);
    config[key] = Array.from(inputs).map(input => input.value.trim()).filter(v => v);
  };

  saveMessagesFromInputs('[data-type="header"]', 'headerMessages');
  saveMessagesFromInputs('[data-type="main"]', 'mainMessages');
  saveMessagesFromInputs('[data-type="modalLow"]', 'modalLowMessages');
  saveMessagesFromInputs('[data-type="modalMid"]', 'modalMidMessages');
  saveMessagesFromInputs('[data-type="modalHigh"]', 'modalHighMessages');

  saveMessagesConfig(config);
  showNotification('✅ Configuración de mensajes guardada exitosamente');
}

// Inicializar eventos de la sección de mensajes
function initMessagesSection() {
  // Cargar interfaz
  loadMessagesInterface();

  // Botón de guardar
  const saveBtn = document.getElementById('saveMessagesBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveAllMessagesChanges);
  }

  // Botones de agregar mensaje
  document.getElementById('addHeaderMessage')?.addEventListener('click', () => addMessage('header'));
  document.getElementById('addMainMessage')?.addEventListener('click', () => addMessage('main'));
  document.getElementById('addModalLowMessage')?.addEventListener('click', () => addMessage('modalLow'));
  document.getElementById('addModalMidMessage')?.addEventListener('click', () => addMessage('modalMid'));
  document.getElementById('addModalHighMessage')?.addEventListener('click', () => addMessage('modalHigh'));
}

// Exponer funciones globalmente
window.deleteMessage = deleteMessage;
window.loadMessagesConfig = loadMessagesConfig;
