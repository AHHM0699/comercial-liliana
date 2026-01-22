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
      if (section === 'products') {
        document.getElementById('productsSection').style.display = 'block';
        document.getElementById('categoriesSection').style.display = 'none';
      } else if (section === 'categories') {
        document.getElementById('productsSection').style.display = 'none';
        document.getElementById('categoriesSection').style.display = 'block';
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
    document.getElementById('productCategory').value = product.categoria_id;
    document.getElementById('productDescription').value = product.descripcion || '';
    document.getElementById('productIsOffer').checked = product.es_oferta;

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
  ['productName', 'productPrice', 'productDescription', 'productIsOffer'].forEach(id => {
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
    <div class="image-preview-item has-image">
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

// ========== ACTUALIZAR PREVIEW DEL PRODUCTO ==========
function updateProductPreview() {
  const previewContainer = document.getElementById('productPreview');

  const name = document.getElementById('productName').value || 'Nombre del producto';
  const price = document.getElementById('productPrice').value || '0';
  const description = document.getElementById('productDescription').value || '';
  const isOffer = document.getElementById('productIsOffer').checked;

  const formattedPrice = formatPrice(price);

  const firstImage = productImages.length > 0
    ? productImages[0].url
    : 'https://via.placeholder.com/300x250?text=Sin+Imagen';

  previewContainer.innerHTML = `
    <div class="product-card product-preview-card">
      <div class="product-carousel">
        <div class="product-carousel-slide">
          <img src="${firstImage}" alt="${name}" class="product-image">
        </div>
        ${isOffer ? '<span class="product-badge">¡OFERTA!</span>' : ''}
      </div>
      <div class="product-content">
        <h3 class="product-name">${name}</h3>
        <p class="product-price">${formattedPrice}</p>
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
    const productData = {
      nombre: document.getElementById('productName').value.trim(),
      precio: parseFloat(document.getElementById('productPrice').value),
      categoria_id: document.getElementById('productCategory').value,
      descripcion: document.getElementById('productDescription').value.trim(),
      es_oferta: document.getElementById('productIsOffer').checked,
      imagenes: imageUrls,
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

// Exponer funciones globalmente para onclick en HTML
window.editProduct = editProduct;
window.confirmDeleteProduct = confirmDeleteProduct;
window.editCategory = editCategory;
window.confirmDeleteCategory = confirmDeleteCategory;
window.removeImage = removeImage;
