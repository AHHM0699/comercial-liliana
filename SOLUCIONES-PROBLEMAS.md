# 🔧 SOLUCIONES A PROBLEMAS COMUNES

Guía rápida para resolver los problemas más frecuentes.

---

## 🚨 PROBLEMA: No puedo iniciar sesión en el panel admin

### Síntomas:
- Aparece "Error: Credenciales inválidas"
- No pasa nada al hacer clic en "Ingresar"
- Se queda cargando indefinidamente

### Soluciones:

#### 1. Verificar que el usuario existe en Supabase

**Pasos:**
1. Ve a Supabase → Tu proyecto
2. Clic en **Authentication** → **Users**
3. Busca tu email en la lista
4. Si NO aparece → Créalo de nuevo (Paso 1.3 de INICIO-RAPIDO.md)

#### 2. Verificar que el usuario está confirmado

**Pasos:**
1. En la lista de usuarios, busca la columna "Email Confirmed"
2. Debe tener un ✅ verde
3. Si tiene un ❌ rojo:
   - Clic en el usuario
   - Busca "Email Confirmed Status"
   - Clic en el botón para confirmar manualmente

#### 3. Verificar las credenciales en config.js

**Pasos:**
1. Abre `js/config.js`
2. Verifica que `SUPABASE_URL` sea correcto:
   ```javascript
   SUPABASE_URL: 'https://xxxxx.supabase.co'
   ```
3. Verifica que `SUPABASE_ANON_KEY` sea correcto:
   ```javascript
   SUPABASE_ANON_KEY: 'eyJhbGciOiJIUz...' // Muy largo
   ```

#### 4. Limpiar caché del navegador

**Pasos:**
1. Presiona `Ctrl + Shift + Delete` (o `Cmd + Shift + Delete` en Mac)
2. Selecciona "Cookies" y "Caché"
3. Clic en "Limpiar datos"
4. Vuelve a intentar

#### 5. Usar consola del navegador para ver el error

**Pasos:**
1. Abre el panel admin
2. Presiona `F12` (o `Cmd + Option + I` en Mac)
3. Ve a la pestaña "Console"
4. Intenta iniciar sesión
5. Mira los mensajes en rojo
6. El error te dirá exactamente qué está mal

**Errores comunes:**
- `Failed to fetch` → Problema con SUPABASE_URL
- `Invalid API key` → Problema con SUPABASE_ANON_KEY
- `User not found` → El usuario no existe en Supabase

---

## 🖼️ PROBLEMA: Las imágenes no se suben

### Síntomas:
- Al subir una imagen, se queda cargando
- Aparece error "Error al subir imagen"
- La imagen no aparece en la lista

### Soluciones:

#### 1. Verificar configuración del Worker

**Pasos:**
1. Ve a Cloudflare → Workers & Pages
2. Abre tu worker `upload-images`
3. Ve a **Settings** → **Variables and Secrets**
4. Verifica:
   - **R2 Bucket Bindings**: Debe tener `IMAGES_BUCKET` → `comercial-liliana-images`
   - **Environment Variables**: Debe tener `R2_PUBLIC_URL` y `ALLOWED_ORIGINS`

#### 2. Verificar que el Worker está desplegado

**Pasos:**
1. Ve a la página principal del Worker
2. Busca el indicador "Deployed"
3. Si dice "Draft" → Clic en "Save and Deploy"

#### 3. Verificar R2_WORKER_URL en config.js

**Pasos:**
1. Abre `js/config.js`
2. Verifica:
   ```javascript
   R2_WORKER_URL: 'https://upload-images.xxx.workers.dev'
   ```
3. Copia esta URL y pégala en el navegador
4. Deberías ver un error JSON (es normal)
5. Si la página no carga → La URL está mal

#### 4. Verificar que el bucket tiene acceso público

**Pasos:**
1. Ve a Cloudflare → R2
2. Abre tu bucket `comercial-liliana-images`
3. Ve a **Settings** → **Public access**
4. Debe decir "Allowed"
5. Si dice "Not allowed" → Clic en "Allow Access"

#### 5. Probar con una imagen más pequeña

**Pasos:**
1. Intenta subir una imagen de menos de 1MB
2. Si funciona → El problema es el tamaño
3. El límite es 10MB, pero a veces falla con imágenes muy grandes

#### 6. Ver el error en la consola

**Pasos:**
1. Abre el panel admin
2. Presiona `F12`
3. Ve a "Console"
4. Intenta subir una imagen
5. Mira los errores en rojo

**Errores comunes:**
- `CORS error` → Problema con ALLOWED_ORIGINS en el Worker
- `404 Not Found` → R2_WORKER_URL está mal
- `Network error` → Problema de conexión a internet

---

## 📦 PROBLEMA: El catálogo está vacío

### Síntomas:
- No se ven productos en el catálogo
- Aparece "No se encontraron productos"
- Las categorías aparecen con "0 productos"

### Soluciones:

#### 1. Verificar que agregaste productos

**Pasos:**
1. Ve al panel admin
2. Deberías ver una lista de productos
3. Si la lista está vacía → Agrega tu primer producto

#### 2. Verificar que los productos están activos

**Pasos:**
1. En Supabase, ve a Table Editor → `productos`
2. Busca la columna `activo`
3. Debe estar en `true` (✅)
4. Si está en `false` (❌) → Edita el producto en el admin y guárdalo de nuevo

#### 3. Verificar conexión a Supabase

**Pasos:**
1. Abre el catálogo
2. Presiona `F12`
3. Ve a "Console"
4. Busca el mensaje "✅ Cliente de Supabase inicializado"
5. Si no aparece → Problema con las credenciales

#### 4. Limpiar caché

**Pasos:**
1. Presiona `Ctrl + Shift + R` (o `Cmd + Shift + R` en Mac)
2. Esto recarga la página sin caché

---

## 🚫 PROBLEMA: Error "Failed to fetch"

### Síntomas:
- Aparece este error al cargar el catálogo
- Los productos no cargan
- El admin no se conecta

### Soluciones:

#### 1. Verificar credenciales de Supabase

**Pasos:**
1. Ve a Supabase → Settings → API
2. Compara:
   - **Project URL** con `SUPABASE_URL` en config.js
   - **anon public** con `SUPABASE_ANON_KEY` en config.js
3. Deben ser EXACTAMENTE iguales

#### 2. Verificar que el proyecto de Supabase está activo

**Pasos:**
1. Ve a Supabase → Dashboard
2. Busca tu proyecto
3. Debe decir "Active" o "Running"
4. Si dice "Paused" → Reactívalo (proyectos gratuitos se pausan tras 1 semana de inactividad)

#### 3. Verificar conexión a internet

**Pasos:**
1. Abre otra página web
2. Si no carga → Problema de conexión
3. Verifica tu WiFi/datos móviles

---

## 🖼️ PROBLEMA: Las imágenes no se muestran en el catálogo

### Síntomas:
- Veo cuadros rotos en lugar de imágenes
- Aparece "Sin Imagen" en todos los productos
- El producto tiene imágenes pero no se ven

### Soluciones:

#### 1. Verificar R2_PUBLIC_URL

**Pasos:**
1. Abre `js/config.js`
2. Copia el valor de `R2_PUBLIC_URL`
3. Pégalo en el navegador
4. Deberías ver una página de Cloudflare
5. Si no carga → La URL está mal

#### 2. Verificar URLs de las imágenes en la base de datos

**Pasos:**
1. Ve a Supabase → Table Editor → `productos`
2. Busca la columna `imagenes`
3. Haz clic en una celda
4. Las URLs deben empezar con `https://pub-`
5. Si están vacías o mal → Vuelve a subir las imágenes

#### 3. Probar una URL de imagen directamente

**Pasos:**
1. En Supabase, copia una URL de imagen de un producto
2. Pégala en el navegador
3. Deberías ver la imagen
4. Si no se ve:
   - El archivo no existe en R2
   - El bucket no tiene acceso público

---

## 🔄 PROBLEMA: Los cambios no se reflejan

### Síntomas:
- Actualicé config.js pero no funciona
- Agregué un producto pero no aparece
- Los cambios en el código no se ven

### Soluciones:

#### 1. Limpiar caché del navegador

**Pasos:**
1. Presiona `Ctrl + F5` (o `Cmd + Shift + R` en Mac)
2. Esto recarga sin usar caché

#### 2. Esperar propagación de GitHub Pages

**Pasos:**
1. Los cambios en GitHub Pages tardan 1-5 minutos en propagarse
2. Espera y vuelve a intentar

#### 3. Verificar que subiste los cambios a GitHub

**Pasos:**
1. Ve a tu repositorio en GitHub
2. Verifica que los archivos modificados están actualizados
3. Si no → Vuelve a subirlos

#### 4. Limpiar caché del Service Worker

**Pasos:**
1. Presiona `F12`
2. Ve a "Application" (o "Aplicación")
3. En el menú lateral, "Service Workers"
4. Clic en "Unregister"
5. Recarga la página

---

## ⚠️ PROBLEMA: GitHub Pages muestra error 404

### Síntomas:
- La URL del sitio no funciona
- Aparece "404 - File not found"

### Soluciones:

#### 1. Verificar que GitHub Pages está activado

**Pasos:**
1. Ve a tu repositorio → Settings → Pages
2. Debe decir "Your site is published at..."
3. Si no → Vuelve a configurarlo (Paso 4.3 de INICIO-RAPIDO.md)

#### 2. Verificar que el repositorio es público

**Pasos:**
1. Ve a tu repositorio → Settings → General
2. Busca "Danger Zone"
3. Verifica que dice "This repository is public"
4. Si dice "private" → Cambia a público

#### 3. Verificar que index.html está en la raíz

**Pasos:**
1. Ve a tu repositorio
2. Deberías ver `index.html` en la lista de archivos
3. Si no está → Vuelve a subirlo

---

## 💬 PROBLEMA: El botón de WhatsApp no funciona

### Síntomas:
- Al hacer clic, no pasa nada
- No abre WhatsApp
- Abre WhatsApp pero sin mensaje

### Soluciones:

#### 1. Verificar WHATSAPP_NUMBER en config.js

**Pasos:**
1. Abre `js/config.js`
2. Verifica:
   ```javascript
   WHATSAPP_NUMBER: '51934634196' // Sin + ni espacios
   ```
3. Debe tener el código de país (51 para Perú)
4. NO debe tener `+` al inicio
5. NO debe tener espacios

#### 2. Verificar que WhatsApp está instalado

**Pasos:**
1. En móvil: Verifica que tienes WhatsApp instalado
2. En desktop: Se abrirá WhatsApp Web

---

## 🐛 CÓMO REPORTAR UN PROBLEMA

Si ninguna solución funciona:

1. **Abre la consola del navegador**:
   - Presiona F12
   - Ve a "Console"
   - Copia todos los mensajes de error

2. **Toma capturas de pantalla**:
   - Del error que ves
   - De la configuración (sin mostrar credenciales)

3. **Documenta los pasos**:
   - Qué estabas haciendo cuando ocurrió
   - Qué esperabas que pasara
   - Qué pasó en realidad

4. **Verifica**:
   - [ ] ¿Seguiste todos los pasos de INICIO-RAPIDO.md?
   - [ ] ¿Todas las credenciales son correctas?
   - [ ] ¿El problema persiste en otro navegador?
   - [ ] ¿El problema persiste en modo incógnito?

---

## 🎯 TIPS PARA PREVENIR PROBLEMAS

1. **Guarda una copia de config.js**:
   - Haz una copia de respaldo de `config.js` con tus credenciales
   - Guárdala en un lugar seguro

2. **Documenta tus credenciales**:
   - Crea un documento con todas tus URLs y claves
   - No lo subas a GitHub

3. **Prueba en modo incógnito**:
   - Siempre prueba los cambios en una ventana incógnita
   - Así evitas problemas de caché

4. **Verifica antes de subir**:
   - Antes de subir cambios a GitHub, prueba localmente
   - Usa un servidor local simple

5. **Mantén backups**:
   - Exporta los datos de Supabase regularmente
   - Guarda copias de tus imágenes

---

**¿Solucionaste tu problema?** ¡Excelente! 🎉

**¿Aún tienes problemas?** Revisa el archivo `README.md` para más información.
