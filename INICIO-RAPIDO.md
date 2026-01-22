# 🚀 GUÍA DE INICIO RÁPIDO - COMERCIAL LILIANA

Esta guía te llevará paso a paso desde cero hasta tener tu catálogo funcionando.

---

## ⏱️ TIEMPO ESTIMADO: 40 minutos

- ✅ Paso 1: Supabase (10 min)
- ✅ Paso 2: Cloudflare (15 min)
- ✅ Paso 3: Configuración (5 min)
- ✅ Paso 4: GitHub Pages (10 min)

---

## 📋 CHECKLIST INICIAL

Antes de empezar, asegúrate de tener:

- [ ] Cuenta de email activa
- [ ] Navegador web actualizado (Chrome, Firefox, Safari, Edge)
- [ ] El logo LOGO_LILIANA_NUEVO_2026.png en la carpeta assets/

---

# PASO 1: CONFIGURAR SUPABASE (10 minutos)

## 1.1 Crear Cuenta y Proyecto

### A. Crear cuenta en Supabase

1. Abre tu navegador y ve a: **https://supabase.com**
2. Clic en el botón **"Start your project"** o **"Sign Up"**
3. Opciones para registrarte:
   - Con GitHub (recomendado si tienes GitHub)
   - Con email y contraseña
4. Si usas email, recibirás un correo de verificación → Confírmalo

### B. Crear nuevo proyecto

1. Una vez dentro, verás el dashboard
2. Clic en **"New Project"**
3. Si te pide crear una organización primero:
   - Organization name: `comercial-liliana`
   - Plan: **Free** (ya seleccionado)
   - Clic en **"Create organization"**

4. Ahora sí, completa el formulario del proyecto:

```
Project name: comercial-liliana
Database Password: [Genera una contraseña segura]
Region: South America (sao) - São Paulo
Pricing Plan: Free (ya seleccionado)
```

5. **IMPORTANTE**: Copia y guarda la contraseña en un lugar seguro
6. Clic en **"Create new project"**
7. Espera 2-3 minutos mientras se crea el proyecto (aparece una barra de progreso)

---

## 1.2 Ejecutar el Schema SQL

1. En el menú lateral izquierdo, busca el icono de **SQL Editor** (parece `<>`)
2. Clic en **SQL Editor**
3. Clic en **"+ New query"** (botón verde arriba a la derecha)

4. **Copia TODO el contenido** del archivo `supabase-schema.sql`
   - Puedes abrirlo con cualquier editor de texto
   - Selecciona todo (Ctrl+A o Cmd+A)
   - Copia (Ctrl+C o Cmd+C)

5. **Pega** el código en el editor de Supabase
6. Clic en el botón **"Run"** (botón verde abajo a la derecha)
   - O presiona `Ctrl+Enter` (Windows/Linux) o `Cmd+Return` (Mac)

7. Deberías ver el mensaje: **"Success. No rows returned"** ✅
8. También verás mensajes como "CREATE TABLE", "CREATE POLICY", etc.

### ¿Qué acabas de hacer?
- Creaste 2 tablas: `categorias` y `productos`
- Insertaste 14 categorías iniciales (Camas, Roperos, Comedores, etc.)
- Configuraste políticas de seguridad (RLS)

---

## 1.3 Crear Usuario Administrador

1. En el menú lateral, clic en **Authentication** (icono de personas)
2. Clic en la pestaña **"Users"**
3. Clic en **"Add user"** → **"Create new user"**

4. Completa el formulario:

```
Email: admin@comercialliliana.com
(o tu email personal)

Password: [Crea una contraseña segura]
(mínimo 8 caracteres)

☑️ Auto Confirm User (MARCAR ESTA CASILLA)
```

5. Clic en **"Create user"**
6. **Guarda este email y contraseña** - los usarás para entrar al panel admin

---

## 1.4 Copiar Credenciales de Supabase

1. En el menú lateral, clic en **Settings** (ícono de engranaje abajo)
2. Clic en **API**
3. Verás una sección llamada **"Project API keys"**

4. **Copia estos dos valores:**

### Project URL:
```
https://xxxxxxxxxxxxx.supabase.co
```
📋 Cópialo completo (empieza con https://)

### anon public (API Key):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI...
```
📋 Es una clave MUY LARGA (comienza con eyJ...)

5. **Pega estos valores en un bloc de notas temporal** - los usarás pronto

---

## ✅ VERIFICAR PASO 1

Para verificar que todo está correcto:

1. Ve a **Table Editor** (menú lateral, icono de tabla)
2. Deberías ver dos tablas: `categorias` y `productos`
3. Clic en `categorias`
4. Deberías ver 14 filas (Camas, Colchones, Cómodas, etc.)

Si ves las 14 categorías → **¡Paso 1 completado! ✅**

---

# PASO 2: CONFIGURAR CLOUDFLARE R2 (15 minutos)

## 2.1 Crear Cuenta en Cloudflare

1. Ve a: **https://cloudflare.com**
2. Clic en **"Sign Up"** (arriba a la derecha)
3. Completa:
   - Email
   - Contraseña
4. Verifica tu email (revisa tu bandeja de entrada)
5. Inicia sesión

---

## 2.2 Crear Bucket R2

1. En el dashboard de Cloudflare, busca en el menú lateral **"R2"**
   - Si no lo ves, ve a la sección **"Storage & Databases"**
2. Clic en **R2 Object Storage**

3. **IMPORTANTE**: Si es tu primera vez usando R2:
   - Te pedirá agregar un método de pago (tarjeta de crédito)
   - **NO TE PREOCUPES**: El plan gratuito es de 10 GB y NO te cobrarán nada
   - Es solo una verificación de seguridad de Cloudflare
   - Agrega tu tarjeta y continúa

4. Clic en **"Create bucket"**

5. Completa:
```
Bucket name: comercial-liliana-images
Location: Automatic (deja por defecto)
Storage Class: Standard (deja por defecto)
```

6. Clic en **"Create bucket"**

---

## 2.3 Configurar Acceso Público al Bucket

1. Entra al bucket que acabas de crear (clic en su nombre)
2. Ve a la pestaña **"Settings"**
3. Busca la sección **"Public access"**
4. Clic en **"Allow Access"**
5. Confirma clic en **"Allow"**

6. **¡IMPORTANTE!** Aparecerá una URL pública. Cópiala:
```
https://pub-xxxxxxxxxxxxxxx.r2.dev
```

7. **Pega esta URL en tu bloc de notas** - la necesitarás

---

## 2.4 Crear Worker para Subir Imágenes

### A. Crear el Worker

1. En el menú lateral de Cloudflare, ve a **"Workers & Pages"**
2. Clic en **"Create application"**
3. Clic en **"Create Worker"**

4. Completa:
```
Worker name: upload-images
```

5. Clic en **"Deploy"** (no te preocupes por el código ahora)

### B. Editar el código del Worker

1. Después de crear el Worker, clic en **"Edit code"**
2. **Borra TODO** el código que aparece por defecto
3. **Abre el archivo** `r2-worker.js` del proyecto
4. **Copia TODO** el contenido
5. **Pega** el código en el editor de Cloudflare
6. Clic en **"Save and deploy"** (botón azul arriba a la derecha)

---

## 2.5 Configurar el Binding R2

1. En la página del Worker, clic en **"Settings"**
2. Ve a la sección **"Variables and Secrets"**
3. Busca **"R2 Bucket Bindings"**
4. Clic en **"Add binding"**

5. Completa:
```
Variable name: IMAGES_BUCKET
R2 bucket: comercial-liliana-images
```

6. Clic en **"Save"**

---

## 2.6 Agregar Variables de Entorno

1. En la misma página (Settings), busca **"Environment Variables"**
2. Clic en **"Add variable"**

### Variable 1: R2_PUBLIC_URL

```
Variable name: R2_PUBLIC_URL
Value: [pega la URL pública del bucket que copiaste antes]
Ejemplo: https://pub-abc123xyz.r2.dev
```

Clic en **"Add variable"**

### Variable 2: ALLOWED_ORIGINS

```
Variable name: ALLOWED_ORIGINS
Value: *
(Por ahora usamos * para permitir todos los orígenes)
```

Clic en **"Add variable"**

3. Clic en **"Save and Deploy"** (arriba)

---

## 2.7 Copiar URL del Worker

1. Vuelve a la página principal del Worker (clic en el nombre arriba)
2. En la sección **"Preview"**, verás una URL:

```
https://upload-images.TU-CUENTA.workers.dev
```

3. **Copia esta URL completa** y pégala en tu bloc de notas

---

## ✅ VERIFICAR PASO 2

Para verificar que todo está correcto:

1. Ve a R2 → Buckets
2. Deberías ver tu bucket `comercial-liliana-images`
3. Ve a Workers & Pages
4. Deberías ver tu worker `upload-images`
5. En Settings del worker, deberías ver:
   - R2 Bucket Binding: ✅
   - 2 Environment Variables: ✅

**¡Paso 2 completado! ✅**

---

# PASO 3: CONFIGURAR EL PROYECTO (5 minutos)

Ahora vamos a pegar todas las credenciales en el proyecto.

## 3.1 Abrir el archivo de configuración

1. Abre la carpeta del proyecto `comercial-liliana`
2. Ve a la carpeta `js`
3. Abre el archivo `config.js` con un editor de texto

## 3.2 Reemplazar las credenciales

Vas a reemplazar estas líneas:

### De tu bloc de notas, copia:

1. **SUPABASE_URL**: La URL de Supabase (https://xxx.supabase.co)
2. **SUPABASE_ANON_KEY**: La clave larga que empieza con eyJ...
3. **R2_PUBLIC_URL**: La URL pública del bucket (https://pub-xxx.r2.dev)
4. **R2_WORKER_URL**: La URL del Worker (https://upload-images.xxx.workers.dev)

### Reemplaza en config.js:

```javascript
const CONFIG = {
  // SUPABASE (pegar aquí)
  SUPABASE_URL: 'https://xxxxx.supabase.co', // ← Reemplazar
  SUPABASE_ANON_KEY: 'eyJhbGci...', // ← Reemplazar (es MUY largo)

  // CLOUDFLARE R2 (pegar aquí)
  R2_PUBLIC_URL: 'https://pub-xxx.r2.dev', // ← Reemplazar
  R2_BUCKET_NAME: 'comercial-liliana-images', // ← Ya está correcto
  R2_WORKER_URL: 'https://upload-images.xxx.workers.dev', // ← Reemplazar

  // WHATSAPP (verificar)
  WHATSAPP_NUMBER: '51934634196', // ← Cambiar si es necesario

  // El resto déjalo como está
  PRODUCTS_PER_PAGE: 12,
  CAROUSEL_INTERVAL: 3000,
  // ...
};
```

## 3.3 Guardar el archivo

1. Guarda el archivo `config.js`
2. Cierra el editor

---

## ✅ VERIFICAR PASO 3

Verifica que:
- [ ] SUPABASE_URL empieza con `https://` y termina en `.supabase.co`
- [ ] SUPABASE_ANON_KEY es una cadena MUY larga (más de 100 caracteres)
- [ ] R2_PUBLIC_URL empieza con `https://pub-` y termina en `.r2.dev`
- [ ] R2_WORKER_URL empieza con `https://` y termina en `.workers.dev`
- [ ] WHATSAPP_NUMBER es correcto (sin + ni espacios)

**¡Paso 3 completado! ✅**

---

# PASO 4: PUBLICAR EN GITHUB PAGES (10 minutos)

## 4.1 Crear Repositorio en GitHub

1. Ve a: **https://github.com**
2. Inicia sesión (o crea una cuenta si no tienes)
3. Clic en el botón **"+"** arriba a la derecha
4. Clic en **"New repository"**

5. Completa:
```
Repository name: comercial-liliana
Description: Catálogo web de Comercial Liliana
☑️ Public (debe estar en público para GitHub Pages gratis)
☐ NO marques "Add a README file"
```

6. Clic en **"Create repository"**

---

## 4.2 Subir Archivos al Repositorio

### OPCIÓN A: Subir archivos manualmente (Más fácil)

1. En la página del repositorio recién creado, verás un texto que dice:
   **"...or create a new repository on the command line"**

2. Debajo verás un enlace: **"uploading an existing file"**
3. Clic en ese enlace

4. **Arrastra la carpeta completa** `comercial-liliana` a la página
   - O clic en "choose your files" y selecciona todos los archivos

5. Espera a que se suban todos los archivos (puede tardar 1-2 minutos)

6. Abajo, en "Commit changes":
```
Commit message: Catálogo inicial de Comercial Liliana
```

7. Clic en **"Commit changes"**

### OPCIÓN B: Usar Git (Si sabes usar Git)

```bash
cd comercial-liliana
git init
git add .
git commit -m "Catálogo inicial de Comercial Liliana"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/comercial-liliana.git
git push -u origin main
```

---

## 4.3 Activar GitHub Pages

1. En tu repositorio, clic en **"Settings"** (arriba)
2. En el menú lateral izquierdo, busca **"Pages"**
3. Clic en **Pages**

4. En la sección **"Build and deployment"**:
   - Source: **Deploy from a branch**
   - Branch: Selecciona **main** y **/ (root)**
   - Clic en **"Save"**

5. Espera 1-2 minutos

6. **Recarga la página** (F5)

7. Aparecerá un mensaje verde arriba:
```
Your site is live at https://TU-USUARIO.github.io/comercial-liliana/
```

8. **Copia esta URL** - ¡es tu catálogo web!

---

## 4.4 Actualizar ALLOWED_ORIGINS en Cloudflare

1. Vuelve a Cloudflare → Workers & Pages
2. Entra a tu worker `upload-images`
3. Ve a **Settings** → **Environment Variables**
4. Edita la variable `ALLOWED_ORIGINS`
5. Cambia el valor a:
```
https://TU-USUARIO.github.io
```
(Reemplaza TU-USUARIO con tu usuario de GitHub)

6. Clic en **"Save and Deploy"**

---

## ✅ VERIFICAR PASO 4

1. Abre tu navegador
2. Ve a: `https://TU-USUARIO.github.io/comercial-liliana/`
3. Deberías ver el catálogo de Comercial Liliana ✅

**¡Paso 4 completado! ✅**

---

# 🎉 ¡PRUEBA FINAL!

## Probar el Panel de Administración

1. Ve a: `https://TU-USUARIO.github.io/comercial-liliana/admin/`
2. Inicia sesión con:
   - Email: El que creaste en Supabase (Paso 1.3)
   - Contraseña: La contraseña que creaste

3. Si entras correctamente → **¡TODO FUNCIONA! 🎉**

## Agregar tu Primer Producto

1. En el panel admin, clic en **"+ Nuevo Producto"**
2. Completa los campos:
   - Nombre: `Ropero 4 puertas`
   - Precio: `850`
   - Categoría: Selecciona "🚪 Roperos"
   - Descripción: `Amplio ropero de melamina con 4 puertas y espejo`

3. **Agregar imágenes**:
   - Clic en "📷 Tomar Foto" (si estás en móvil)
   - O "📁 Seleccionar Archivos" (para subir desde tu computadora)
   - Selecciona 1-3 imágenes

4. Espera a que se compriman y suban las imágenes

5. Clic en **"Guardar Producto"**

6. **Ve al catálogo público** y verifica que aparezca tu producto ✅

---

# 🎊 ¡FELICITACIONES!

Tu catálogo web está funcionando completamente:

- ✅ Catálogo público visible en Internet
- ✅ Panel de administración funcionando
- ✅ Subida de imágenes operativa
- ✅ Integración con WhatsApp activa
- ✅ Base de datos configurada

---

# 📞 ¿PROBLEMAS?

## Error: "Failed to fetch"
→ Revisa que las credenciales en `config.js` sean correctas

## Las imágenes no se suben
→ Verifica que el Worker tenga el binding R2 configurado

## No puedo iniciar sesión en el admin
→ Verifica el email y contraseña en Supabase → Authentication → Users

## El catálogo está vacío
→ Agrega productos desde el panel admin

---

# 🚀 PRÓXIMOS PASOS

1. Personaliza los colores en `css/styles.css`
2. Cambia el logo en `assets/`
3. Agrega más productos
4. Comparte el enlace con tus clientes
5. Promociona en redes sociales

---

**¿Necesitas más ayuda?**

Revisa el archivo `README.md` para documentación completa.

¡Éxito con tu catálogo web! 🎉
