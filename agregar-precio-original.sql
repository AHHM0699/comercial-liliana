-- ========================================
-- AGREGAR PRECIO ORIGINAL A PRODUCTOS
-- Comercial Liliana
-- ========================================

-- Agregar columna precio_original a la tabla productos
ALTER TABLE productos
ADD COLUMN IF NOT EXISTS precio_original DECIMAL(10,2);

-- Comentario de la columna
COMMENT ON COLUMN productos.precio_original IS 'Precio de lista original antes del descuento';
