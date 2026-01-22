# 🔧 SOLUCIÓN: Error 404 en GitHub Pages

## ❌ Problema: "404 - File not found"

Cuando intentas abrir tu sitio de GitHub Pages aparece este error.

---

## ✅ SOLUCIONES (En orden de más común a menos común)

### SOLUCIÓN 1: Esperar la Propagación (90% de los casos)

GitHub Pages tarda **1-5 minutos** en activarse la primera vez.

**Pasos:**
1. Espera 3 minutos
2. Recarga la página (F5)
3. Si sigue en 404, espera 2 minutos más
4. Intenta en una ventana incógnita (Ctrl+Shift+N)

**Si después de 10 minutos sigue en 404**, continúa con la Solución 2.

---

### SOLUCIÓN 2: Verificar que el Repositorio es Público

GitHub Pages gratuito **solo funciona con repositorios públicos**.

**Pasos:**
1. Ve a tu repositorio en GitHub
2. Clic en **Settings** (arriba)
3. Baja hasta **"Danger Zone"** (al final de la página)
4. Busca la sección **"Change repository visibility"**
5. Debe decir: **"This repository is public"**

**Si dice "This repository is private":**
1. Clic en **"Change visibility"**
2. Selecciona **"Make public"**
3. Escribe el nombre del repositorio para confirmar
4. Clic en **"I understand, change repository visibility"**
5. Espera 2 minutos y vuelve a intentar

---

### SOLUCIÓN 3: Verificar que los Archivos se Subieron

**Pasos:**
1. Ve a tu repositorio en GitHub
2. En la página principal deberías ver:
   ```
   index.html
   admin/
   css/
   js/
   assets/
   README.md
   etc.
   ```

**Si NO ves estos archivos:**

#### Opción A: Subir manualmente
1. En la página del repositorio, clic en **"Add file"** → **"Upload files"**
2. Arrastra TODOS los archivos de la carpeta `comercial-liliana`
3. O clic en **"choose your files"** y selecciona todos
4. En el mensaje de commit, escribe: `Subir archivos del catálogo`
5. Clic en **"Commit changes"**
6. Espera 2 minutos

#### Opción B: Usar Git (si sabes)
```bash
cd comercial-liliana
git init
git add .
git commit -m "Catálogo completo"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/comercial-liliana.git
git push -u origin main
```

---

### SOLUCIÓN 4: Verificar Configuración de GitHub Pages

**Pasos:**
1. Ve a tu repositorio → **Settings** → **Pages**
2. En **"Source"**, verifica:
   - Branch: **main** (o master)
   - Folder: **/ (root)**
3. Si está diferente, corrígelo:
   - Selecciona **main**
   - Selecciona **/ (root)**
   - Clic en **"Save"**
4. Espera 2 minutos

**Debe aparecer un mensaje verde:**
```
Your site is live at https://TU-USUARIO.github.io/comercial-liliana/
```

---

### SOLUCIÓN 5: Verificar que index.html está en la Raíz

**Pasos:**
1. Ve a tu repositorio en GitHub
2. Deberías ver `index.html` en la lista principal (no dentro de una carpeta)

**Si index.html está dentro de una carpeta:**
1. Esa es la causa del 404
2. Necesitas mover todos los archivos a la raíz
3. Elimina el repositorio y vuelve a crearlo correctamente

---

### SOLUCIÓN 6: Verificar la URL Correcta

**URLs incorrectas comunes:**

❌ `https://github.com/TU-USUARIO/comercial-liliana` (Esta es la del repositorio)
✅ `https://TU-USUARIO.github.io/comercial-liliana/` (Esta es la del sitio)

**Asegúrate de usar:**
- `TU-USUARIO.github.io` (NO github.com)
- Termina con `/` al final

---

### SOLUCIÓN 7: Limpiar Caché de GitHub Pages

**Pasos:**
1. Ve a Settings → Pages
2. Cambia temporalmente la fuente a **"None"**
3. Clic en **"Save"**
4. Espera 1 minuto
5. Vuelve a cambiar a **"main"** y **"/ (root)"**
6. Clic en **"Save"**
7. Espera 2 minutos

---

## 🔍 VERIFICACIÓN PASO A PASO

Usa esta lista para verificar todo:

### ✅ Checklist de Verificación:

```
[ ] ¿El repositorio es PÚBLICO?
    → Settings → Debe decir "public" en Danger Zone

[ ] ¿Los archivos están en la raíz del repositorio?
    → Debes ver index.html en la página principal

[ ] ¿GitHub Pages está activado?
    → Settings → Pages → Debe mostrar URL verde

[ ] ¿La configuración es correcta?
    → Branch: main, Folder: / (root)

[ ] ¿Han pasado al menos 5 minutos?
    → GitHub Pages tarda en propagarse

[ ] ¿La URL es correcta?
    → Debe ser: TU-USUARIO.github.io/comercial-liliana/

[ ] ¿Probaste en ventana incógnita?
    → Para evitar problemas de caché del navegador
```

---

## 🎯 PRUEBA RÁPIDA

**Haz esto para verificar:**

1. Ve a tu repositorio en GitHub
2. Clic en el archivo `index.html`
3. Clic en el botón **"Raw"** (arriba a la derecha)
4. Si ves el código HTML → Los archivos están bien
5. Si da 404 → Los archivos no se subieron

---

## 📸 CÓMO DEBE VERSE

### En el Repositorio:
```
tu-usuario/comercial-liliana
│
├── 📄 index.html               ← Debe estar aquí (raíz)
├── 📄 README.md
├── 📁 admin/
├── 📁 css/
├── 📁 js/
├── 📁 assets/
└── ...
```

### En Settings → Pages:
```
✅ Your site is published at https://tu-usuario.github.io/comercial-liliana/

Source:
  Branch: main
  Folder: / (root)
  [Save]
```

---

## 🆘 SI NADA FUNCIONA

### Opción 1: Recrear el Repositorio

1. **Elimina el repositorio actual:**
   - Settings → Danger Zone → Delete this repository
   - Confirma escribiendo el nombre

2. **Crea uno nuevo desde cero:**
   - Sigue INICIO-RAPIDO.md Paso 4 de nuevo
   - Asegúrate de que sea PÚBLICO
   - Sube TODOS los archivos correctamente

### Opción 2: Usar un Nombre Diferente

A veces GitHub tiene problemas con nombres específicos.

1. En vez de `comercial-liliana`, usa `catalogo-liliana`
2. O `liliana-muebles`
3. Actualiza el nombre en todos lados

---

## 💡 PREGUNTAS FRECUENTES

### ¿Cuánto tarda en funcionar?
Entre 1 y 5 minutos la primera vez. Después los cambios son instantáneos.

### ¿Puedo usar un repositorio privado?
No con GitHub Pages gratis. Necesitas upgrade a Pro ($4/mes).

### ¿La URL siempre será tan larga?
Puedes configurar un dominio personalizado (como www.comercialliliana.com) pero eso requiere comprar el dominio.

### ¿Cómo sé si está funcionando?
Cuando en Settings → Pages aparezca el mensaje verde con la URL.

---

## 🔧 COMANDOS ÚTILES (Para usuarios de Git)

### Ver si Git está rastreando los archivos:
```bash
git status
```

### Ver qué se subió al repositorio:
```bash
git log --oneline
```

### Forzar actualización:
```bash
git add .
git commit -m "Forzar actualización"
git push origin main --force
```

---

## 📞 NECESITO AYUDA ESPECÍFICA

**Dame esta información:**

1. **URL de tu repositorio:**
   `https://github.com/TU-USUARIO/comercial-liliana`

2. **URL que intentas abrir:**
   `https://TU-USUARIO.github.io/comercial-liliana/`

3. **¿El repositorio es público o privado?**

4. **¿Ves index.html en la página principal del repositorio?**

5. **¿Qué dice en Settings → Pages?**

Con esa información puedo ayudarte mejor.

---

## ✅ CUANDO FUNCIONE

Deberías ver:
- Logo de Comercial Liliana
- Header con buscador
- Banner dorado de ofertas
- 3 tarjetas de categorías
- Footer

Si ves eso → **¡Funcionó!** 🎉

---

**Siguiente paso:** Ir a `/admin/` para agregar productos

**URL del admin:** `https://TU-USUARIO.github.io/comercial-liliana/admin/`
