/**
 * CLIENTE DE SUPABASE - COMERCIAL LILIANA
 *
 * Este módulo maneja todas las operaciones con Supabase:
 * - Autenticación
 * - Consultas de productos
 * - Consultas de categorías
 * - CRUD de productos (admin)
 */

// Cliente de Supabase
let supabaseClient = null;

/**
 * Inicializa el cliente de Supabase
 */
function initSupabase() {
  if (typeof supabase === 'undefined') {
    console.error('Supabase library no está cargada. Asegúrate de incluir el CDN de Supabase.');
    return false;
  }

  try {
    supabaseClient = supabase.createClient(
      CONFIG.SUPABASE_URL,
      CONFIG.SUPABASE_ANON_KEY
    );
    console.log('✅ Cliente de Supabase inicializado correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al inicializar Supabase:', error);
    return false;
  }
}

// ========== AUTENTICACIÓN ==========

/**
 * Inicia sesión con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Promise<Object>} Datos del usuario o error
 */
async function signIn(email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw error;

    console.log('✅ Sesión iniciada correctamente');
    return { success: true, user: data.user };
  } catch (error) {
    console.error('❌ Error al iniciar sesión:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Cierra la sesión actual
 * @returns {Promise<Object>} Resultado de la operación
 */
async function signOut() {
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;

    console.log('✅ Sesión cerrada correctamente');
    return { success: true };
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene el usuario actual
 * @returns {Promise<Object>} Usuario actual o null
 */
async function getCurrentUser() {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user;
  } catch (error) {
    console.error('❌ Error al obtener usuario:', error);
    return null;
  }
}

/**
 * Verifica si hay una sesión activa
 * @returns {Promise<boolean>} true si hay sesión activa
 */
async function isAuthenticated() {
  const user = await getCurrentUser();
  return user !== null;
}

// ========== CATEGORÍAS ==========

/**
 * Obtiene todas las categorías ordenadas
 * @returns {Promise<Array>} Lista de categorías
 */
async function getCategories() {
  try {
    const { data, error } = await supabaseClient
      .from('categorias')
      .select('*')
      .order('orden', { ascending: true });

    if (error) throw error;

    console.log(`✅ ${data.length} categorías obtenidas`);
    return { success: true, data: data };
  } catch (error) {
    console.error('❌ Error al obtener categorías:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Obtiene una categoría por ID
 * @param {string} id - ID de la categoría
 * @returns {Promise<Object>} Categoría encontrada
 */
async function getCategoryById(id) {
  try {
    const { data, error } = await supabaseClient
      .from('categorias')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return { success: true, data: data };
  } catch (error) {
    console.error('❌ Error al obtener categoría:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Crea una nueva categoría
 * @param {Object} category - Datos de la categoría
 * @returns {Promise<Object>} Categoría creada
 */
async function createCategory(category) {
  try {
    const { data, error } = await supabaseClient
      .from('categorias')
      .insert([category])
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Categoría creada:', data.nombre);
    return { success: true, data: data };
  } catch (error) {
    console.error('❌ Error al crear categoría:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza una categoría existente
 * @param {string} id - ID de la categoría
 * @param {Object} updates - Datos a actualizar
 * @returns {Promise<Object>} Categoría actualizada
 */
async function updateCategory(id, updates) {
  try {
    const { data, error } = await supabaseClient
      .from('categorias')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Categoría actualizada');
    return { success: true, data: data };
  } catch (error) {
    console.error('❌ Error al actualizar categoría:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Elimina una categoría
 * @param {string} id - ID de la categoría
 * @returns {Promise<Object>} Resultado de la operación
 */
async function deleteCategory(id) {
  try {
    const { error } = await supabaseClient
      .from('categorias')
      .delete()
      .eq('id', id);

    if (error) throw error;

    console.log('✅ Categoría eliminada');
    return { success: true };
  } catch (error) {
    console.error('❌ Error al eliminar categoría:', error);
    return { success: false, error: error.message };
  }
}

// ========== PRODUCTOS ==========

/**
 * Obtiene productos con filtros opcionales
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Array>} Lista de productos
 */
async function getProducts(filters = {}) {
  try {
    let query = supabaseClient
      .from('productos')
      .select(`
        *,
        categoria:categoria_id (
          id,
          nombre,
          grupo,
          icono
        )
      `)
      .eq('activo', true);

    // Filtrar por categoría
    if (filters.categoryId) {
      query = query.eq('categoria_id', filters.categoryId);
    }

    // Filtrar por grupo de categoría
    if (filters.categoryGroup) {
      query = query.eq('categoria.grupo', filters.categoryGroup);
    }

    // Filtrar solo ofertas
    if (filters.onlyOffers) {
      query = query.eq('es_oferta', true);
    }

    // Buscar por nombre
    if (filters.search) {
      query = query.ilike('nombre', `%${filters.search}%`);
    }

    // Ordenamiento
    const orderBy = filters.orderBy || 'created_at';
    const orderDirection = filters.orderDirection || 'desc';
    query = query.order(orderBy, { ascending: orderDirection === 'asc' });

    // Límite y offset para paginación
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 12) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;

    console.log(`✅ ${data.length} productos obtenidos`);
    return { success: true, data: data };
  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Obtiene un producto por ID
 * @param {string} id - ID del producto
 * @returns {Promise<Object>} Producto encontrado
 */
async function getProductById(id) {
  try {
    const { data, error } = await supabaseClient
      .from('productos')
      .select(`
        *,
        categoria:categoria_id (
          id,
          nombre,
          grupo,
          icono
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return { success: true, data: data };
  } catch (error) {
    console.error('❌ Error al obtener producto:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Crea un nuevo producto
 * @param {Object} product - Datos del producto
 * @returns {Promise<Object>} Producto creado
 */
async function createProduct(product) {
  try {
    const { data, error } = await supabaseClient
      .from('productos')
      .insert([{
        ...product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Producto creado:', data.nombre);
    return { success: true, data: data };
  } catch (error) {
    console.error('❌ Error al crear producto:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza un producto existente
 * @param {string} id - ID del producto
 * @param {Object} updates - Datos a actualizar
 * @returns {Promise<Object>} Producto actualizado
 */
async function updateProduct(id, updates) {
  try {
    const { data, error } = await supabaseClient
      .from('productos')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Producto actualizado');
    return { success: true, data: data };
  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Elimina un producto (lo marca como inactivo)
 * @param {string} id - ID del producto
 * @returns {Promise<Object>} Resultado de la operación
 */
async function deleteProduct(id) {
  try {
    // En lugar de eliminar, marcamos como inactivo
    const { error } = await supabaseClient
      .from('productos')
      .update({ activo: false })
      .eq('id', id);

    if (error) throw error;

    console.log('✅ Producto eliminado');
    return { success: true };
  } catch (error) {
    console.error('❌ Error al eliminar producto:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Cuenta el total de productos con filtros
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<number>} Total de productos
 */
async function countProducts(filters = {}) {
  try {
    let query = supabaseClient
      .from('productos')
      .select('id', { count: 'exact', head: true })
      .eq('activo', true);

    if (filters.categoryId) {
      query = query.eq('categoria_id', filters.categoryId);
    }

    if (filters.search) {
      query = query.ilike('nombre', `%${filters.search}%`);
    }

    const { count, error } = await query;

    if (error) throw error;

    return { success: true, count: count };
  } catch (error) {
    console.error('❌ Error al contar productos:', error);
    return { success: false, count: 0 };
  }
}

/**
 * Obtiene productos aleatorios de un grupo
 * @param {string} grupo - Grupo de categoría
 * @param {number} limit - Número máximo de productos
 * @returns {Promise<Array>} Lista de productos aleatorios
 */
async function getRandomProductsByGroup(grupo, limit = 5) {
  try {
    // Primero obtenemos todas las categorías del grupo
    const { data: categories } = await supabaseClient
      .from('categorias')
      .select('id')
      .eq('grupo', grupo);

    if (!categories || categories.length === 0) {
      return { success: true, data: [] };
    }

    const categoryIds = categories.map(cat => cat.id);

    // Obtenemos productos aleatorios de esas categorías
    const { data, error } = await supabaseClient
      .from('productos')
      .select('*')
      .eq('activo', true)
      .in('categoria_id', categoryIds)
      .limit(limit * 2); // Obtenemos más para mezclar

    if (error) throw error;

    // Mezclamos y limitamos
    const shuffled = data.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, limit);

    return { success: true, data: selected };
  } catch (error) {
    console.error('❌ Error al obtener productos aleatorios:', error);
    return { success: false, error: error.message, data: [] };
  }
}

// Inicializar automáticamente cuando se carga el script
if (typeof CONFIG !== 'undefined') {
  initSupabase();
}
