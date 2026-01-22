# 🏠 Comercial Liliana - Catálogo Web

> "Una familia que completará tu hogar"

Catálogo web completo para muebles, 100% gratuito utilizando GitHub Pages, Supabase y Cloudflare R2.

![Versión](https://img.shields.io/badge/versión-1.0.0-blue)
![Licencia](https://img.shields.io/badge/licencia-MIT-green)

## 📋 Descripción

Este proyecto es un catálogo web moderno y responsive para Comercial Liliana, una tienda de muebles. **NO es un ecommerce**, sino un catálogo visual donde los clientes pueden ver productos y consultar directamente por WhatsApp.

### ✨ Características Principales

- 📱 **100% Responsive**: Optimizado para móviles, tablets y desktop
- 🎨 **Diseño Moderno**: Interfaz limpia con la paleta de colores del logo
- 🖼️ **Carruseles Automáticos**: Múltiples imágenes por producto
- 🔍 **Búsqueda y Filtros**: Encuentra productos fácilmente
- 💬 **Integración WhatsApp**: Consultas directas desde cada producto
- 🔒 **Panel de Administración**: Gestión completa de productos y categorías
- 📷 **Subida de Imágenes**: Desde cámara o galería con compresión automática
- ⚡ **Carga Rápida**: Imágenes optimizadas en formato WebP
- 🆓 **Totalmente Gratis**: Sin costos de hosting ni servicios

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Base de Datos**: [Supabase](https://supabase.com) (PostgreSQL)
- **Almacenamiento**: [Cloudflare R2](https://cloudflare.com/products/r2)
- **Hosting**: [GitHub Pages](https://pages.github.com)

## 📁 Estructura del Proyecto

```
comercial-liliana/
├── index.html                 # Catálogo público
├── admin/
│   └── index.html            # Panel de administración
├── css/
│   ├── styles.css            # Estilos generales
│   ├── catalog.css           # Estilos del catálogo
│   └── admin.css             # Estilos del admin
├── js/
│   ├── config.js             # Configuración (completar)
│   ├── supabase-client.js    # Cliente Supabase
│   ├── storage.js            # Manejo de R2
│   ├── catalog.js            # Lógica del catálogo
│   ├── admin.js              # Lógica del admin
│   └── image-compressor.js   # Compresión de imágenes
├── assets/
│   └── LOGO_LILIANA_NUEVO_2026.png
├── supabase-schema.sql       # Schema de base de datos
├── r2-worker.js             # Worker de Cloudflare
├── config.example.js        # Plantilla de configuración
└── README.md
```

## 🚀 Guía de Instalación

### Requisitos Previos

- Cuenta de [GitHub](https://github.com)
- Cuenta de [Supabase](https://supabase.com) (gratuita)
- Cuenta de [Cloudflare](https://cloudflare.com) (gratuita)

---

## 📝 PASO 1: Configurar Supabase

### 1.1 Crear Proyecto

1. Ve a [supabase.com](https://supabase.com) e inicia sesión
2. Clic en **"New Project"**
3. Completa los datos:
   - **Name**: `comercial-liliana`
   - **Database Password**: Genera una contraseña segura (guárdala)
   - **Region**: Selecciona la más cercana
   - **Pricing Plan**: Free
4. Clic en **"Create new project"** y espera 2-3 minutos

### 1.2 Ejecutar Schema SQL

1. En tu proyecto, ve a **SQL Editor** (icono de base de datos)
2. Clic en **"New query"**
3. Copia todo el contenido del archivo `supabase-schema.sql`
4. Pégalo en el editor
5. Clic en **"Run"** (o presiona Ctrl/Cmd + Enter)
6. Deberías ver el mensaje: **"Success. No rows returned"**

### 1.3 Crear Usuario Administrador

1. Ve a **Authentication** → **Users**
2. Clic en **"Add user"** → **"Create new user"**
3. Completa:
   - **Email**: Tu email (ej: `admin@comercialliliana.com`)
   - **Password**: Una contraseña segura
   - **Auto Confirm User**: ✅ Activado
4. Clic en **"Create user"**

### 1.4 Copiar Credenciales

1. Ve a **Settings** → **API**
2. Copia estos valores (los necesitarás después):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: La clave pública (empieza con `eyJ...`)

✅ **Supabase configurado correctamente**

---

## 🗄️ PASO 2: Configurar Cloudflare R2

### 2.1 Crear Cuenta en Cloudflare

1. Ve a [cloudflare.com](https://cloudflare.com) y crea una cuenta
2. Verifica tu email

### 2.2 Crear Bucket R2

1. En el dashboard, ve a **R2** (menú lateral)
2. Clic en **"Create bucket"**
3. Nombre: `comercial-liliana-images`
4. Location: Automatic
5. Clic en **"Create bucket"**

### 2.3 Configurar Acceso Público

1. Abre el bucket que creaste
2. Ve a **Settings** → **Public access**
3. Habilita **"Allow Access"**
4. Copia la **Public Bucket URL** (ejemplo: `https://pub-abc123.r2.dev`)
5. Guárdala para después

### 2.4 Crear Worker para Upload

1. Ve a **Workers & Pages** → **Create application** → **Create Worker**
2. Nombre: `upload-images`
3. Clic en **"Deploy"**
4. Clic en **"Edit code"**
5. Borra todo el código predeterminado
6. Copia y pega todo el contenido de `r2-worker.js`
7. Clic en **"Save and Deploy"**

### 2.5 Configurar Binding R2

1. En el Worker, ve a **Settings** → **Variables**
2. Sección **"R2 Bucket Bindings"**:
   - Clic en **"Add binding"**
   - Variable name: `IMAGES_BUCKET`
   - R2 bucket: `comercial-liliana-images`
   - Clic en **"Save"**

### 2.6 Configurar Variables de Entorno

1. En la misma página, sección **"Environment Variables"**:
2. Agrega estas variables:

**R2_PUBLIC_URL**
- Value: La URL pública que copiaste antes (ej: `https://pub-abc123.r2.dev`)

**ALLOWED_ORIGINS**
- Value: `https://TU-USUARIO.github.io,http://localhost:8080`
- (Reemplaza TU-USUARIO con tu usuario de GitHub)

3. Clic en **"Save and Deploy"**

### 2.7 Copiar URL del Worker

1. Ve a la página principal del Worker
2. Copia la URL (ejemplo: `https://upload-images.tu-cuenta.workers.dev`)
3. Guárdala para después

✅ **Cloudflare R2 configurado correctamente**

---

## ⚙️ PASO 3: Configurar el Proyecto

### 3.1 Clonar o Descargar el Proyecto

Si tienes Git instalado:
```bash
git clone https://github.com/TU-USUARIO/comercial-liliana.git
cd comercial-liliana
```

Si no, descarga el ZIP y descomprímelo.

### 3.2 Configurar Credenciales

1. Abre el archivo `js/config.js` con un editor de texto
2. Reemplaza los valores con tus credenciales:

```javascript
const CONFIG = {
  // SUPABASE (copiar del Paso 1.4)
  SUPABASE_URL: 'https://xxxxx.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',

  // CLOUDFLARE R2 (copiar del Paso 2)
  R2_PUBLIC_URL: 'https://pub-abc123.r2.dev',
  R2_BUCKET_NAME: 'comercial-liliana-images',
  R2_WORKER_URL: 'https://upload-images.tu-cuenta.workers.dev',

  // WHATSAPP (verificar número)
  WHATSAPP_NUMBER: '51934634196', // Sin + ni espacios

  // Resto de configuración (dejar como está)
  PRODUCTS_PER_PAGE: 12,
  CAROUSEL_INTERVAL: 3000,
  // ...
};
```

3. Guarda el archivo

✅ **Proyecto configurado correctamente**

---

## 🌐 PASO 4: Publicar en GitHub Pages

### 4.1 Crear Repositorio en GitHub

1. Ve a [github.com](https://github.com) e inicia sesión
2. Clic en el botón **"+"** → **"New repository"**
3. Completa:
   - **Repository name**: `comercial-liliana`
   - **Description**: Catálogo web de Comercial Liliana
   - **Public** (debe ser público para GitHub Pages gratis)
4. **NO** marques "Add a README file"
5. Clic en **"Create repository"**

### 4.2 Subir Archivos

**Opción A: Con Git (recomendado)**

```bash
cd comercial-liliana
git init
git add .
git commit -m "Catálogo inicial de Comercial Liliana"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/comercial-liliana.git
git push -u origin main
```

**Opción B: Subir archivos manualmente**

1. En la página del repositorio, clic en **"uploading an existing file"**
2. Arrastra todos los archivos del proyecto
3. Clic en **"Commit changes"**

### 4.3 Activar GitHub Pages

1. En el repositorio, ve a **Settings** → **Pages**
2. En **"Source"**, selecciona:
   - Branch: `main`
   - Folder: `/ (root)`
3. Clic en **"Save"**
4. Espera 1-2 minutos
5. Aparecerá un mensaje con tu URL: `https://TU-USUARIO.github.io/comercial-liliana`

### 4.4 Actualizar ALLOWED_ORIGINS

1. Vuelve a Cloudflare → Worker → Settings → Variables
2. Edita la variable **ALLOWED_ORIGINS**
3. Cambia `TU-USUARIO` por tu usuario real de GitHub
4. Guarda y despliega

✅ **Sitio web publicado correctamente**

---

## 🎉 PASO 5: Probar el Sistema

### 5.1 Acceder al Catálogo

1. Abre tu navegador
2. Ve a: `https://TU-USUARIO.github.io/comercial-liliana`
3. Deberías ver el catálogo (vacío por ahora)

### 5.2 Acceder al Panel de Administración

1. Ve a: `https://TU-USUARIO.github.io/comercial-liliana/admin/`
2. Inicia sesión con las credenciales del Paso 1.3
3. Deberías ver el panel de administración

### 5.3 Agregar Tu Primer Producto

1. En el panel admin, clic en **"+ Nuevo Producto"**
2. Completa:
   - **Nombre**: Ropero 4 puertas
   - **Precio**: 850.00
   - **Categoría**: Roperos
   - **Descripción**: Amplio ropero de melamina...
   - **Imágenes**: Toma fotos o sube desde galería
3. Clic en **"Guardar Producto"**
4. Regresa al catálogo público y verifica que aparezca

✅ **Sistema funcionando correctamente**

---

## 📖 Guía de Uso

### Para Administradores

#### Gestionar Productos

- **Agregar**: Clic en "+ Nuevo Producto"
- **Editar**: Clic en ✏️ junto al producto
- **Eliminar**: Clic en 🗑️ (el producto se marca como inactivo)
- **Buscar**: Usa el campo de búsqueda en la parte superior
- **Filtrar**: Selecciona una categoría en el dropdown

#### Subir Imágenes

- **Desde cámara**: Clic en "📷 Tomar Foto" (funciona en móvil)
- **Desde galería**: Clic en "📁 Seleccionar Archivos"
- Las imágenes se comprimen automáticamente
- Puedes agregar hasta 10 imágenes por producto
- Arrastra para reordenar (próximamente)

#### Gestionar Categorías

- **Ver categorías**: Clic en "Categorías" en el menú
- **Agregar**: Clic en "+ Nueva Categoría"
- **Editar/Eliminar**: Botones en cada tarjeta

### Para Clientes

- **Ver productos**: Navega por el catálogo
- **Buscar**: Usa la barra de búsqueda en el header
- **Filtrar**: Clic en un grupo (Dormitorio, Sala, etc.)
- **Ver detalles**: Las imágenes se desplazan automáticamente
- **Consultar**: Clic en "📱 Consultar" para ir a WhatsApp

---

## 🔧 Solución de Problemas

### Error: "Failed to fetch"

**Problema**: No se conecta a Supabase

**Solución**:
1. Verifica que `SUPABASE_URL` y `SUPABASE_ANON_KEY` sean correctos
2. Abre la consola del navegador (F12) para ver errores específicos
3. Verifica que el proyecto de Supabase esté activo

### Error al subir imágenes

**Problema**: Las imágenes no se suben a R2

**Solución**:
1. Verifica que `R2_WORKER_URL` sea correcto
2. Verifica que el Worker tenga el binding `IMAGES_BUCKET` configurado
3. Verifica que `ALLOWED_ORIGINS` incluya tu dominio de GitHub Pages
4. Revisa los logs del Worker en Cloudflare

### Productos no aparecen

**Problema**: El catálogo está vacío

**Solución**:
1. Verifica que hayas agregado productos en el admin
2. Verifica que los productos estén marcados como "activo"
3. Abre la consola y busca errores de JavaScript

### No puedo iniciar sesión

**Problema**: Error al iniciar sesión en el admin

**Solución**:
1. Verifica las credenciales del usuario en Supabase
2. En Supabase, ve a Authentication → Users y verifica que el usuario exista
3. Asegúrate de que el usuario tenga "Email Confirmed" en verde

### Las imágenes no cargan

**Problema**: Se ven cuadros rotos en lugar de imágenes

**Solución**:
1. Verifica que `R2_PUBLIC_URL` sea correcto
2. Verifica que el bucket tenga acceso público habilitado
3. Abre la URL de una imagen directamente en el navegador

---

## 🎨 Personalización

### Cambiar Colores

Edita `css/styles.css` y modifica las variables CSS:

```css
:root {
  --azul-acero: #6B9DC2;
  --azul-oscuro: #2C4A6B;
  --dorado-arena: #D4A96A;
  /* etc... */
}
```

### Cambiar Logo

1. Reemplaza `assets/LOGO_LILIANA_NUEVO_2026.png` con tu logo
2. Mantén el mismo nombre de archivo
3. Recomendado: PNG con fondo transparente, 500x500px

### Agregar Más Categorías

1. Ve al panel admin → Categorías
2. Clic en "+ Nueva Categoría"
3. Selecciona el grupo correspondiente
4. Elige un emoji representativo

### Modificar Mensajes de WhatsApp

Edita los mensajes en `js/catalog.js`:

```javascript
const message = `¡Hola! Me interesa este producto:

📦 ${name}
💰 Precio: ${price}

Lo vi en su catálogo web. ¿Está disponible?`;
```

---

## 📊 Límites de las Cuentas Gratuitas

### Supabase (Free Plan)
- ✅ 500 MB de base de datos
- ✅ 1 GB de almacenamiento de archivos
- ✅ 2 GB de transferencia mensual
- ✅ 50,000 usuarios activos mensuales

**Suficiente para**: Miles de productos

### Cloudflare R2 (Free Plan)
- ✅ 10 GB de almacenamiento
- ✅ 1 millón de lecturas (Class A) al mes
- ✅ 10 millones de escrituras (Class B) al mes

**Suficiente para**: Cientos de productos con múltiples imágenes

### GitHub Pages
- ✅ 1 GB de almacenamiento
- ✅ 100 GB de ancho de banda mensual
- ✅ 10 builds por hora

**Suficiente para**: Sitio web completo sin problemas

---

## 🔒 Seguridad

### Buenas Prácticas

1. **NO subas `js/config.js` a GitHub** si contiene credenciales reales
2. Usa el `.gitignore` incluido para proteger archivos sensibles
3. Cambia la contraseña del admin regularmente
4. Las políticas RLS de Supabase protegen tu base de datos
5. Solo usuarios autenticados pueden crear/editar productos

### Copias de Seguridad

**Backup de Base de Datos**:
1. Ve a Supabase → Database → Backups
2. Los backups automáticos se crean diariamente (plan gratuito: 7 días)

**Backup Manual**:
1. Exporta datos desde Supabase:
   ```sql
   SELECT * FROM productos;
   SELECT * FROM categorias;
   ```
2. Guarda el CSV

---

## 🚀 Mejoras Futuras

- [ ] Modo offline con Service Worker
- [ ] Agregar a pantalla de inicio (PWA)
- [ ] Estadísticas de productos más consultados
- [ ] Sistema de favoritos
- [ ] Compartir productos en redes sociales
- [ ] Galería en modo lightbox
- [ ] Drag & drop para reordenar imágenes
- [ ] Importación masiva de productos (CSV)

---

## 🤝 Soporte

Si tienes problemas o preguntas:

1. Revisa la sección de **Solución de Problemas**
2. Verifica la consola del navegador (F12)
3. Revisa los logs de Cloudflare Worker
4. Verifica los logs de Supabase

---

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia MIT.

---

## 👨‍💻 Créditos

Desarrollado para **Comercial Liliana** - La Unión, Piura, Perú

**Stack tecnológico**:
- HTML5, CSS3, JavaScript
- Supabase (PostgreSQL)
- Cloudflare R2 & Workers
- GitHub Pages

---

## 📞 Contacto

**Comercial Liliana**
- 📱 WhatsApp: +51 934 634 196
- 📍 La Unión, Piura, Perú
- 🌐 Web: https://TU-USUARIO.github.io/comercial-liliana

---

¡Gracias por usar este sistema! Si te fue útil, considera dejar una ⭐ en GitHub.
