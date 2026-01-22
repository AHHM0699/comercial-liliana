-- ============================================
-- SCHEMA DE BASE DE DATOS - COMERCIAL LILIANA
-- Supabase PostgreSQL
-- ============================================

-- ========== TABLA: categorias ==========
CREATE TABLE IF NOT EXISTS categorias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  grupo VARCHAR(50) NOT NULL CHECK (grupo IN ('dormitorio', 'sala_comedor', 'organizacion')),
  icono VARCHAR(10),
  orden INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para categorias
CREATE INDEX idx_categorias_grupo ON categorias(grupo);
CREATE INDEX idx_categorias_orden ON categorias(orden);

-- ========== TABLA: productos ==========
CREATE TABLE IF NOT EXISTS productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
  descripcion TEXT,
  categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  imagenes TEXT[] NOT NULL DEFAULT '{}',
  es_oferta BOOLEAN DEFAULT FALSE,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para productos
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_activo ON productos(activo);
CREATE INDEX idx_productos_es_oferta ON productos(es_oferta);
CREATE INDEX idx_productos_precio ON productos(precio);
CREATE INDEX idx_productos_nombre ON productos USING gin(to_tsvector('spanish', nombre));

-- ========== FUNCIÓN: Actualizar updated_at automáticamente ==========
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en productos
CREATE TRIGGER update_productos_updated_at
  BEFORE UPDATE ON productos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========== ROW LEVEL SECURITY (RLS) ==========

-- Habilitar RLS en ambas tablas
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

-- ===== POLÍTICAS PARA CATEGORÍAS =====

-- Lectura pública: Todos pueden ver las categorías
CREATE POLICY "Categorías visibles públicamente"
  ON categorias
  FOR SELECT
  USING (true);

-- Inserción: Solo usuarios autenticados pueden crear categorías
CREATE POLICY "Solo admin puede insertar categorías"
  ON categorias
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Actualización: Solo usuarios autenticados pueden actualizar
CREATE POLICY "Solo admin puede actualizar categorías"
  ON categorias
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Eliminación: Solo usuarios autenticados pueden eliminar
CREATE POLICY "Solo admin puede eliminar categorías"
  ON categorias
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ===== POLÍTICAS PARA PRODUCTOS =====

-- Lectura pública: Solo productos activos son visibles públicamente
CREATE POLICY "Productos activos visibles públicamente"
  ON productos
  FOR SELECT
  USING (activo = true);

-- Lectura admin: Usuarios autenticados ven todos los productos
CREATE POLICY "Admin puede ver todos los productos"
  ON productos
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Inserción: Solo usuarios autenticados pueden crear productos
CREATE POLICY "Solo admin puede insertar productos"
  ON productos
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Actualización: Solo usuarios autenticados pueden actualizar
CREATE POLICY "Solo admin puede actualizar productos"
  ON productos
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Eliminación: Solo usuarios autenticados pueden eliminar
CREATE POLICY "Solo admin puede eliminar productos"
  ON productos
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ========== DATOS INICIALES: CATEGORÍAS ==========

-- DORMITORIO
INSERT INTO categorias (nombre, grupo, icono, orden) VALUES
('Camas', 'dormitorio', '🛏️', 1),
('Colchones', 'dormitorio', '🛏️', 2),
('Cómodas', 'dormitorio', '🗄️', 3),
('Cunas', 'dormitorio', '👶', 4),
('Roperos', 'dormitorio', '🚪', 5),
('Tocadores', 'dormitorio', '💄', 6)
ON CONFLICT DO NOTHING;

-- SALA Y COMEDOR
INSERT INTO categorias (nombre, grupo, icono, orden) VALUES
('Comedores', 'sala_comedor', '🍽️', 7),
('Muebles', 'sala_comedor', '🛋️', 8),
('Separadores', 'sala_comedor', '📏', 9),
('Vitrinas', 'sala_comedor', '🪟', 10)
ON CONFLICT DO NOTHING;

-- ORGANIZACIÓN
INSERT INTO categorias (nombre, grupo, icono, orden) VALUES
('Escritorios', 'organizacion', '📝', 11),
('Estantes', 'organizacion', '📚', 12),
('Reposteros', 'organizacion', '🍳', 13),
('Zapateras', 'organizacion', '👟', 14)
ON CONFLICT DO NOTHING;

-- ========== COMENTARIOS PARA DOCUMENTACIÓN ==========

COMMENT ON TABLE categorias IS 'Categorías de productos organizadas por grupos (dormitorio, sala_comedor, organizacion)';
COMMENT ON COLUMN categorias.grupo IS 'Grupo al que pertenece la categoría: dormitorio, sala_comedor, organizacion';
COMMENT ON COLUMN categorias.icono IS 'Emoji que representa la categoría';
COMMENT ON COLUMN categorias.orden IS 'Orden de visualización de la categoría';

COMMENT ON TABLE productos IS 'Productos del catálogo de Comercial Liliana';
COMMENT ON COLUMN productos.imagenes IS 'Array de URLs de imágenes del producto almacenadas en Cloudflare R2';
COMMENT ON COLUMN productos.es_oferta IS 'Indica si el producto está en oferta especial';
COMMENT ON COLUMN productos.activo IS 'Indica si el producto está activo y visible en el catálogo público';

-- ========== VISTAS ÚTILES (OPCIONAL) ==========

-- Vista: Productos con información de categoría
CREATE OR REPLACE VIEW productos_completos AS
SELECT
  p.*,
  c.nombre as categoria_nombre,
  c.grupo as categoria_grupo,
  c.icono as categoria_icono
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id;

-- Vista: Conteo de productos por categoría
CREATE OR REPLACE VIEW productos_por_categoria AS
SELECT
  c.id,
  c.nombre,
  c.grupo,
  c.icono,
  COUNT(p.id) FILTER (WHERE p.activo = true) as total_productos
FROM categorias c
LEFT JOIN productos p ON p.categoria_id = c.id
GROUP BY c.id, c.nombre, c.grupo, c.icono
ORDER BY c.orden;

-- ========== FUNCIONES ÚTILES ==========

-- Función: Buscar productos por texto
CREATE OR REPLACE FUNCTION buscar_productos(termino TEXT)
RETURNS SETOF productos AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM productos
  WHERE activo = true
    AND (
      nombre ILIKE '%' || termino || '%'
      OR descripcion ILIKE '%' || termino || '%'
    )
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Función: Obtener productos destacados (ofertas)
CREATE OR REPLACE FUNCTION productos_en_oferta()
RETURNS SETOF productos AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM productos
  WHERE activo = true
    AND es_oferta = true
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ========== CONFIGURACIÓN DE PERMISOS ==========

-- Asegurar que las vistas sean accesibles públicamente
GRANT SELECT ON productos_completos TO anon;
GRANT SELECT ON productos_por_categoria TO anon;

-- Las funciones son ejecutables por anon
GRANT EXECUTE ON FUNCTION buscar_productos(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION productos_en_oferta() TO anon;

-- ============================================
-- FIN DEL SCHEMA
-- ============================================

/*
NOTAS IMPORTANTES:

1. Después de ejecutar este schema, debes crear un usuario administrador
   en la sección de Authentication de Supabase:

   - Ve a Authentication > Users
   - Clic en "Add user"
   - Ingresa email y contraseña
   - Este usuario podrá acceder al panel de administración

2. Las políticas RLS aseguran que:
   - Cualquiera puede VER productos activos (catálogo público)
   - Solo usuarios autenticados pueden CREAR, EDITAR o ELIMINAR

3. Para verificar que todo funciona:

   -- Contar categorías
   SELECT COUNT(*) FROM categorias;

   -- Ver productos por categoría
   SELECT * FROM productos_por_categoria;

   -- Probar búsqueda
   SELECT * FROM buscar_productos('ropero');

4. Si necesitas resetear los datos:

   -- CUIDADO: Esto eliminará todos los productos y categorías
   DELETE FROM productos;
   DELETE FROM categorias;

   -- Luego vuelve a ejecutar los INSERT de categorías iniciales
*/
