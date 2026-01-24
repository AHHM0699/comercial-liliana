/**
 * ROUTER.JS - Sistema de navegación SPA
 * Maneja la navegación interna sin recargar la página
 */

// Estado actual de la navegación
const navigationState = {
  currentView: null,
  currentData: {}
};

// ========== FUNCIONES DE NAVEGACIÓN ==========

/**
 * Navega a una ruta específica
 * @param {string} path - Ruta a navegar
 * @param {object} data - Datos adicionales para la vista
 */
function navigate(path, data = {}) {
  // Guardar datos en el estado
  navigationState.currentData = data;

  // Actualizar URL sin recargar
  history.pushState({ path, data }, '', path);

  // Renderizar la nueva ruta
  renderRoute();

  // Scroll al inicio
  window.scrollTo(0, 0);
}

/**
 * Oculta todas las vistas
 */
function hideAllViews() {
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('view-active');
    view.setAttribute('hidden', '');
  });
}

/**
 * Muestra una vista específica
 * @param {string} viewId - ID de la vista a mostrar
 */
function showView(viewId) {
  hideAllViews();
  const view = document.getElementById(viewId);
  if (view) {
    view.removeAttribute('hidden');
    view.classList.add('view-active');
    navigationState.currentView = viewId;
  }
}

/**
 * Renderiza la ruta actual
 */
function renderRoute() {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);

  console.log('🧭 Navegando a:', path, 'Params:', Object.fromEntries(params));

  // Determinar qué vista mostrar
  if (path === '/' || path.endsWith('index.html') || path === '') {
    // Vista principal (home)
    showView('view-home');
    if (typeof renderHomeView === 'function') {
      renderHomeView();
    }
  } else if (path.includes('/grupo')) {
    // Vista de grupo
    const groupId = params.get('id');
    if (groupId) {
      showView('view-group');
      if (typeof renderGroupView === 'function') {
        renderGroupView(parseInt(groupId));
      }
    } else {
      // Si no hay ID, volver al home
      navigate('/');
    }
  } else if (path.includes('/categoria')) {
    // Vista de categoría
    const categoryId = params.get('id');
    const groupId = params.get('grupo');
    if (categoryId) {
      showView('view-category');
      if (typeof renderCategoryView === 'function') {
        renderCategoryView(categoryId, groupId ? parseInt(groupId) : null);
      }
    } else {
      navigate('/');
    }
  } else if (path.includes('/producto')) {
    // Vista de producto
    const productId = params.get('id');
    const categoryId = params.get('categoria');
    const groupId = params.get('grupo');
    if (productId) {
      showView('view-product');
      if (typeof renderProductView === 'function') {
        renderProductView(productId, categoryId, groupId ? parseInt(groupId) : null);
      }
    } else {
      navigate('/');
    }
  } else {
    // Ruta no encontrada, volver al home
    navigate('/');
  }
}

/**
 * Navega hacia atrás en el historial
 */
function goBack() {
  history.back();
}

// ========== INICIALIZACIÓN ==========

/**
 * Inicializa el router
 */
function initRouter() {
  // Escuchar cambios en el historial (botón atrás/adelante)
  window.addEventListener('popstate', (event) => {
    console.log('⬅️ Navegación del historial detectada');
    if (event.state && event.state.data) {
      navigationState.currentData = event.state.data;
    }
    renderRoute();
  });

  // Prevenir comportamiento por defecto de enlaces
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-navigate]');
    if (link) {
      e.preventDefault();
      const path = link.getAttribute('href') || link.getAttribute('data-navigate');
      navigate(path);
    }
  });

  // Renderizar ruta inicial
  renderRoute();

  console.log('✅ Router inicializado');
}

// Exportar funciones globalmente
window.navigate = navigate;
window.goBack = goBack;
window.showView = showView;
window.hideAllViews = hideAllViews;
window.renderRoute = renderRoute;
window.initRouter = initRouter;
window.navigationState = navigationState;
