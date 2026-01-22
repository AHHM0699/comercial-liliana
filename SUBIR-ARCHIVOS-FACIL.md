# 📤 CÓMO SUBIR LOS ARCHIVOS A GITHUB

## ⚠️ IMPORTANTE: El problema es que NO has subido los archivos

GitHub Pages está configurado, pero **los archivos están solo en tu computadora**, no en GitHub.

---

## 🎯 SOLUCIÓN AUTOMÁTICA (Más fácil)

### Paso 1: Abre la Terminal

**En Mac:**
1. Presiona `Cmd + Espacio`
2. Escribe "Terminal"
3. Presiona Enter

**Ya está abierta la terminal**, continúa.

### Paso 2: Ve al directorio del proyecto

En la terminal, ejecuta:

```bash
cd /Users/abdon_huidobro/Downloads/comercial-liliana
```

### Paso 3: Ejecuta el script automático

```bash
bash subir-a-github.sh
```

El script te pedirá:
- Tu usuario de GitHub (ejemplo: `abdonhuidobro`)

Y automáticamente:
- ✅ Inicializa Git
- ✅ Agrega todos los archivos
- ✅ Hace el commit
- ✅ Sube todo a GitHub

---

## 🔧 SOLUCIÓN MANUAL (Si el script no funciona)

### Opción A: Desde la Terminal (Más rápido)

```bash
# 1. Ve al directorio
cd /Users/abdon_huidobro/Downloads/comercial-liliana

# 2. Inicializa Git
git init

# 3. Agrega todos los archivos
git add .

# 4. Crea el commit
git commit -m "Catálogo completo de Comercial Liliana"

# 5. Cambia a branch main
git branch -M main

# 6. Conecta con GitHub (REEMPLAZA TU-USUARIO)
git remote add origin https://github.com/TU-USUARIO/comercial-liliana.git

# 7. Sube los archivos
git push -u origin main
```

**Cuando pida credenciales:**
- Username: Tu usuario de GitHub
- Password: Tu contraseña (o token de acceso personal)

### Opción B: Desde GitHub Web (Más visual)

Si los comandos te dan problemas, puedes subir todo manualmente:

1. **Ve a tu repositorio en GitHub:**
   `https://github.com/TU-USUARIO/comercial-liliana`

2. **Clic en "Add file" → "Upload files"**

3. **Arrastra TODOS estos archivos/carpetas:**
   - index.html
   - admin/ (la carpeta completa)
   - css/ (la carpeta completa)
   - js/ (la carpeta completa)
   - assets/ (la carpeta completa)
   - manifest.json
   - service-worker.js
   - README.md
   - Todos los demás archivos .md

4. **En el mensaje de commit escribe:**
   ```
   Catálogo completo de Comercial Liliana
   ```

5. **Clic en "Commit changes"**

6. **Espera 3-5 minutos**

7. **Ve a tu sitio:**
   `https://TU-USUARIO.github.io/comercial-liliana/`

---

## ✅ VERIFICACIÓN

### Después de subir, verifica:

1. **Ve a tu repositorio:**
   `https://github.com/TU-USUARIO/comercial-liliana`

2. **Deberías ver:**
   ```
   index.html
   admin/
   css/
   js/
   assets/
   README.md
   ...
   ```

3. **Ve a Settings → Pages**

4. **Debajo de "Your site is published at", copia la URL**

5. **Espera 3-5 minutos**

6. **Abre la URL en una ventana INCÓGNITA**

7. **¿Ves el catálogo?**
   - ✅ SÍ → ¡Funciona!
   - ❌ NO → Espera 2 minutos más

---

## 🆘 PROBLEMAS COMUNES

### "fatal: not a git repository"
→ No ejecutaste `git init`
→ Ejecuta: `git init` primero

### "remote origin already exists"
→ Ya habías intentado antes
→ Ejecuta: `git remote remove origin`
→ Luego: `git remote add origin https://...`

### "failed to push"
→ El repositorio ya tiene contenido
→ Elimina el repositorio en GitHub y créalo vacío de nuevo

### "Authentication failed"
→ Usuario o contraseña incorrectos
→ Si tienes 2FA activado, necesitas un "Personal Access Token"
   - Ve a GitHub → Settings → Developer settings → Personal access tokens
   - Generate new token → Copia el token
   - Úsalo como contraseña al hacer push

### No encuentro la Terminal
→ En Mac: Cmd + Espacio, escribe "Terminal"
→ O ve a Aplicaciones → Utilidades → Terminal

---

## 📞 SI NADA FUNCIONA

Házmelo saber con esta información:

1. ¿Qué método intentaste? (Automático/Manual/Web)
2. ¿Qué error te dio exactamente? (copia el mensaje completo)
3. ¿Ya existe el repositorio en GitHub?
4. ¿El repositorio está vacío o tiene archivos?

---

## 🎯 TU PRÓXIMO PASO

**Ejecuta AHORA:**

```bash
bash subir-a-github.sh
```

En 2 minutos tus archivos estarán en GitHub y en 5 minutos más tu sitio estará funcionando.

---

¿Listo para intentarlo? 🚀
