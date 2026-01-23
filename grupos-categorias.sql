-- ========================================
-- TABLA DE GRUPOS DE CATEGORÍAS
-- Comercial Liliana
-- ========================================

-- Crear tabla de grupos
CREATE TABLE IF NOT EXISTS grupos_categorias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clave VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  icono VARCHAR(10) NOT NULL,
  color VARCHAR(20) NOT NULL,
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar grupos por defecto
INSERT INTO grupos_categorias (clave, nombre, icono, color, orden) VALUES
  ('dormitorio', 'Dormitorio', '🛏️', '#6B9DC2', 1),
  ('sala_comedor', 'Sala y Comedor', '🏠', '#2C4A6B', 2),
  ('organizacion', 'Organización', '🗄️', '#D4A96A', 3)
ON CONFLICT (clave) DO NOTHING;

-- Agregar columna grupo_id a la tabla categorias (si no existe)
ALTER TABLE categorias
ADD COLUMN IF NOT EXISTS grupo_clave VARCHAR(50) REFERENCES grupos_categorias(clave);

-- Actualizar categorías existentes con sus grupos
UPDATE categorias SET grupo_clave = 'dormitorio' WHERE grupo = 'dormitorio';
UPDATE categorias SET grupo_clave = 'sala_comedor' WHERE grupo = 'sala_comedor';
UPDATE categorias SET grupo_clave = 'organizacion' WHERE grupo = 'organizacion';

-- Políticas RLS para grupos_categorias
ALTER TABLE grupos_categorias ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública
CREATE POLICY "Permitir lectura pública de grupos" ON grupos_categorias
  FOR SELECT USING (true);

-- Permitir todas las operaciones para usuarios autenticados
CREATE POLICY "Permitir todas las operaciones a usuarios autenticados en grupos" ON grupos_categorias
  FOR ALL USING (auth.role() = 'authenticated');

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_grupos_orden ON grupos_categorias(orden);
CREATE INDEX IF NOT EXISTS idx_grupos_activo ON grupos_categorias(activo);
CREATE INDEX IF NOT EXISTS idx_categorias_grupo_clave ON categorias(grupo_clave);
