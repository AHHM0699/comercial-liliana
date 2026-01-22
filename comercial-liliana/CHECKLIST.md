# ✅ CHECKLIST DE CONFIGURACIÓN
## Comercial Liliana - Catálogo Web

Usa este checklist para asegurarte de que todo está configurado correctamente.

---

## 📋 ANTES DE EMPEZAR

- [ ] Tengo el logo en `assets/LOGO_LILIANA_NUEVO_2026.png`
- [ ] Tengo una cuenta de email activa
- [ ] Tengo un navegador actualizado
- [ ] He leído el archivo `INICIO-RAPIDO.md`

---

## 🗄️ PASO 1: SUPABASE

### Cuenta y Proyecto
- [ ] Creé cuenta en supabase.com
- [ ] Creé nuevo proyecto llamado "comercial-liliana"
- [ ] Guardé la contraseña de la base de datos

### Base de Datos
- [ ] Abrí SQL Editor en Supabase
- [ ] Copié el contenido de `supabase-schema.sql`
- [ ] Ejecuté el SQL (vi "Success. No rows returned")
- [ ] Verifiqué en Table Editor que existen 2 tablas
- [ ] Verifiqué que la tabla `categorias` tiene 14 filas

### Usuario Administrador
- [ ] Fui a Authentication → Users
- [ ] Creé un nuevo usuario (email + password)
- [ ] Marqué "Auto Confirm User"
- [ ] Guardé el email y password en un lugar seguro

### Credenciales
- [ ] Fui a Settings → API
- [ ] Copié el "Project URL" (https://xxx.supabase.co)
- [ ] Copié el "anon public" key (empieza con eyJ...)
- [ ] Guardé ambos en un bloc de notas

**Supabase configurado:** ✅

---

## ☁️ PASO 2: CLOUDFLARE R2

### Cuenta
- [ ] Creé cuenta en cloudflare.com
- [ ] Verifiqué mi email
- [ ] Agregué método de pago (para verificación, NO se cobra)

### Bucket R2
- [ ] Fui a R2 en el dashboard
- [ ] Creé bucket llamado "comercial-liliana-images"
- [ ] Configuré acceso público (Allow Access)
- [ ] Copié la URL pública del bucket (https://pub-xxx.r2.dev)

### Worker
- [ ] Fui a Workers & Pages
- [ ] Creé nuevo Worker llamado "upload-images"
- [ ] Edité el código y pegué el contenido de `r2-worker.js`
- [ ] Guardé y desplegué (Save and Deploy)

### Configuración del Worker
- [ ] En Settings, agregué R2 Bucket Binding:
  - Variable name: `IMAGES_BUCKET`
  - R2 bucket: `comercial-liliana-images`
- [ ] Agregué Environment Variable `R2_PUBLIC_URL`
- [ ] Agregué Environment Variable `ALLOWED_ORIGINS` (valor: `*`)
- [ ] Guardé y desplegué

### URL del Worker
- [ ] Copié la URL del Worker (https://upload-images.xxx.workers.dev)
- [ ] La guardé en mi bloc de notas

**Cloudflare R2 configurado:** ✅

---

## ⚙️ PASO 3: CONFIGURACIÓN DEL PROYECTO

### Archivo config.js
- [ ] Abrí el archivo `js/config.js`
- [ ] Pegué `SUPABASE_URL` desde mi bloc de notas
- [ ] Pegué `SUPABASE_ANON_KEY` desde mi bloc de notas
- [ ] Pegué `R2_PUBLIC_URL` desde mi bloc de notas
- [ ] Pegué `R2_WORKER_URL` desde mi bloc de notas
- [ ] Verifiqué el `WHATSAPP_NUMBER`
- [ ] Guardé el archivo

### Verificación
- [ ] SUPABASE_URL termina en `.supabase.co`
- [ ] SUPABASE_ANON_KEY tiene más de 100 caracteres
- [ ] R2_PUBLIC_URL termina en `.r2.dev`
- [ ] R2_WORKER_URL termina en `.workers.dev`
- [ ] Todas las URLs empiezan con `https://`

**Proyecto configurado:** ✅

---

## 🌐 PASO 4: GITHUB PAGES

### Repositorio
- [ ] Creé cuenta en github.com (si no tenía)
- [ ] Creé nuevo repositorio llamado "comercial-liliana"
- [ ] Marqué el repositorio como Public
- [ ] NO marqué "Add a README file"

### Subir Archivos
- [ ] Subí todos los archivos del proyecto a GitHub
- [ ] Verifiqué que todos los archivos están en el repositorio

### Activar Pages
- [ ] Fui a Settings → Pages
- [ ] Seleccioné Branch: `main`, folder: `/ (root)`
- [ ] Guardé (Save)
- [ ] Esperé 2 minutos
- [ ] Refresque la página
- [ ] Copié la URL del sitio (https://usuario.github.io/comercial-liliana/)

### Actualizar ALLOWED_ORIGINS
- [ ] Volví a Cloudflare → Worker → Settings
- [ ] Edité la variable `ALLOWED_ORIGINS`
- [ ] La cambié a mi URL de GitHub Pages
- [ ] Guardé y desplegué

**GitHub Pages activado:** ✅

---

## 🧪 PRUEBAS FINALES

### Catálogo Público
- [ ] Abrí la URL: `https://usuario.github.io/comercial-liliana/`
- [ ] El sitio carga correctamente
- [ ] Veo el logo de Comercial Liliana
- [ ] Veo las 3 tarjetas de grupos (Dormitorio, Sala, Organización)
- [ ] El buscador funciona
- [ ] Los botones de WhatsApp funcionan

### Panel de Administración
- [ ] Abrí: `https://usuario.github.io/comercial-liliana/admin/`
- [ ] Veo la pantalla de login
- [ ] Ingresé con mi email y password de Supabase
- [ ] Entré correctamente al panel admin
- [ ] Veo la sección "Gestión de Productos"
- [ ] Veo la pestaña "Categorías"

### Subida de Imágenes
- [ ] En el panel admin, clic en "+ Nuevo Producto"
- [ ] Completé el formulario
- [ ] Subí al menos 1 imagen
- [ ] La imagen se comprimió correctamente
- [ ] Guardé el producto
- [ ] El producto aparece en la lista

### Catálogo Actualizado
- [ ] Volví al catálogo público
- [ ] Actualicé la página (F5)
- [ ] Veo el producto que agregué
- [ ] Las imágenes cargan correctamente
- [ ] El botón "Consultar" abre WhatsApp

**¡TODO FUNCIONA CORRECTAMENTE!** 🎉

---

## 🔧 SI ALGO NO FUNCIONA

### No puedo iniciar sesión en el admin
**Revisar:**
1. ¿El email existe en Supabase → Authentication → Users?
2. ¿El usuario tiene "Email Confirmed" ✅?
3. ¿La contraseña es correcta?
4. ¿SUPABASE_URL y SUPABASE_ANON_KEY son correctos en config.js?

### Las imágenes no se suben
**Revisar:**
1. ¿El Worker tiene el binding R2 configurado?
2. ¿Las variables de entorno están configuradas?
3. ¿R2_WORKER_URL es correcto en config.js?
4. ¿El bucket tiene acceso público habilitado?

### El catálogo está vacío
**Revisar:**
1. ¿Agregaste productos desde el panel admin?
2. ¿Los productos están marcados como activos?
3. ¿SUPABASE_URL y SUPABASE_ANON_KEY son correctos?

### Error "Failed to fetch"
**Revisar:**
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Busca errores en rojo
4. Verifica que todas las URLs en config.js sean correctas

---

## 📞 RECURSOS DE AYUDA

- **Guía paso a paso**: `INICIO-RAPIDO.md`
- **Documentación completa**: `README.md`
- **Schema SQL**: `supabase-schema.sql`
- **Worker Code**: `r2-worker.js`

---

## 🎯 PRÓXIMOS PASOS

Una vez que todo funcione:

- [ ] Personalizaré los colores en `css/styles.css`
- [ ] Cambiaré el logo si es necesario
- [ ] Agregaré todos mis productos
- [ ] Tomaré fotos de calidad de los productos
- [ ] Compartiré el enlace con mis clientes
- [ ] Agregaré el enlace a mis redes sociales
- [ ] Imprimiré un QR code con el enlace para mi tienda

---

**¿Todo listo?** ¡Tu catálogo web está operativo! 🚀

Ahora puedes gestionar tus productos desde cualquier dispositivo con internet.
