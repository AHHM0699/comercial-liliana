# ❓ PREGUNTAS FRECUENTES (FAQ)

Respuestas a las preguntas más comunes sobre el Catálogo de Comercial Liliana.

---

## 📱 GENERAL

### ¿Qué es este proyecto?

Es un catálogo web completo para mostrar productos de muebles. Los clientes pueden ver los productos con imágenes, precios y descripciones, y consultar directamente por WhatsApp. **NO es un ecommerce**, no se procesan pagos en línea.

### ¿Cuánto cuesta?

**100% GRATIS**. Todos los servicios utilizados tienen planes gratuitos generosos:
- Supabase: Gratis hasta 500MB de base de datos
- Cloudflare R2: Gratis hasta 10GB de imágenes
- GitHub Pages: Gratis sin límite

### ¿Necesito conocimientos de programación?

No necesitas saber programar para usarlo. Solo debes seguir las instrucciones paso a paso para configurarlo. Una vez configurado, todo se maneja desde el panel de administración visual.

### ¿Funciona en celular?

Sí, completamente. El catálogo y el panel de administración están optimizados para móviles. Puedes agregar productos, subir fotos y gestionar todo desde tu iPhone o Android.

### ¿Puedo usarlo para otro tipo de negocio?

Sí, aunque está diseñado para muebles, puedes adaptarlo para cualquier tipo de productos: ropa, electrodomésticos, artesanías, etc. Solo necesitas cambiar las categorías.

---

## 💻 CONFIGURACIÓN

### ¿Cuánto demora la configuración inicial?

Aproximadamente 40 minutos si sigues la guía paso a paso. La mayoría del tiempo es crear las cuentas y esperar que se activen los servicios.

### ¿Necesito tarjeta de crédito?

Solo para Cloudflare, y es únicamente para verificación. **NO se realiza ningún cargo**. Los servicios que usas son 100% gratuitos.

### ¿Qué pasa si me equivoco en la configuración?

No hay problema, puedes volver a intentar. Los servicios no se rompen. Solo necesitas corregir los valores en el archivo `config.js` y recargar la página.

### ¿Puedo cambiar las credenciales después?

Sí, simplemente edita el archivo `config.js` con las nuevas credenciales y vuelve a subir los archivos a GitHub.

### ¿Dónde guardo mis contraseñas?

En un gestor de contraseñas como LastPass, 1Password, o simplemente en un documento seguro en tu computadora. **NUNCA** las subas a GitHub.

---

## 🖼️ IMÁGENES

### ¿Cuántas imágenes puedo subir por producto?

Técnicamente puedes subir las que quieras, pero se recomienda entre 3 y 5 imágenes por producto para no abrumar al cliente.

### ¿Qué tamaño deben tener las imágenes?

El sistema las comprime automáticamente. Puedes subir imágenes de hasta 10MB, pero se recomienda que no excedan 5MB para que la subida sea más rápida.

### ¿En qué formato se guardan las imágenes?

Automáticamente se convierten a formato WebP, que es el más eficiente y ligero para web. Esto hace que tu catálogo cargue muy rápido.

### ¿Puedo tomar fotos directamente desde el celular?

Sí, el botón "📷 Tomar Foto" abre la cámara de tu celular. Es la forma más rápida de agregar productos.

### ¿Las imágenes tienen marca de agua?

No, el sistema no agrega marcas de agua. Si quieres proteger tus fotos, agrégales una marca de agua antes de subirlas.

### ¿Qué pasa si elimino un producto? ¿Se borran las imágenes?

No automáticamente. Las imágenes quedan en Cloudflare R2. Para liberar espacio, tendrías que eliminarlas manualmente desde R2, pero con 10GB gratis, raramente necesitarás hacerlo.

---

## 📦 PRODUCTOS

### ¿Cuántos productos puedo tener?

Con el plan gratuito de Supabase: miles de productos sin problema. El límite está en el almacenamiento (500MB de base de datos), no en la cantidad de productos.

### ¿Puedo tener productos sin imagen?

Técnicamente sí, pero no se recomienda. Los clientes necesitan ver el producto para interesarse. Si no tienes foto, tómala con tu celular.

### ¿Cómo organizo los productos?

Por categorías. Ya vienen 14 categorías predefinidas (Camas, Roperos, Comedores, etc.), pero puedes agregar más desde el panel admin.

### ¿Puedo duplicar un producto?

No hay función de duplicar, pero puedes crear uno nuevo copiando los datos manualmente. Es rápido.

### ¿Los precios incluyen IGV?

El sistema solo muestra el precio que tú ingresas. Es tu decisión si incluyes o no el IGV. Recomendación: Sé claro en las descripciones.

### ¿Puedo poner "Precio a consultar"?

Sí, puedes poner precio 0.00 y en la descripción escribir "Precio a consultar". El botón de WhatsApp seguirá funcionando.

---

## 💬 WHATSAPP

### ¿Cómo funciona la integración con WhatsApp?

Cuando un cliente hace clic en "Consultar", se abre WhatsApp con un mensaje predefinido que incluye el nombre y precio del producto.

### ¿Puedo cambiar el mensaje que se envía?

Sí, editando el archivo `js/catalog.js`. Busca la función que genera el mensaje de WhatsApp y cámbialo a tu gusto.

### ¿El número de WhatsApp debe ser empresarial?

No, funciona con cualquier número de WhatsApp, personal o empresarial.

### ¿Los clientes me pueden escribir directamente?

Sí, el botón abre WhatsApp. Si el cliente tiene WhatsApp instalado, puede escribirte directamente.

### ¿Funciona WhatsApp Web?

Sí, en computadoras de escritorio se abre WhatsApp Web automáticamente.

---

## 🔒 SEGURIDAD

### ¿Es seguro?

Sí. Usa servicios profesionales (Supabase, Cloudflare, GitHub) con altos estándares de seguridad. Además, implementa Row Level Security (RLS) en la base de datos.

### ¿Alguien puede hackear mi panel admin?

Solo pueden entrar personas que tengan tu email y contraseña de Supabase. Usa contraseñas fuertes y no las compartas.

### ¿Los clientes pueden ver mis credenciales?

No. Aunque el código esté público en GitHub, las credenciales están en un archivo que NO se sube (está en .gitignore). Solo tú las tienes.

### ¿Debo hacer backups?

Supabase hace backups automáticos diarios. Pero es buena práctica exportar tus productos ocasionalmente desde la base de datos.

### ¿Qué pasa si pierdo mi contraseña de Supabase?

Puedes recuperarla desde supabase.com usando la opción "Forgot password".

---

## 🚀 RENDIMIENTO

### ¿Qué tan rápido carga el catálogo?

Muy rápido. Las imágenes están optimizadas en WebP y se cargan de forma lazy (solo cuando son visibles). Típicamente carga en menos de 2 segundos.

### ¿Cuántos visitantes puede soportar?

Miles de visitantes simultáneos sin problema. GitHub Pages y Cloudflare tienen infraestructuras masivas.

### ¿El sitio funciona sin internet?

Parcialmente. Tiene un Service Worker que cachea algunos archivos, pero necesita internet para cargar productos desde Supabase.

### ¿Puedo agregar más productos si ya tengo muchos?

Sí, no hay límite práctico en el plan gratuito de Supabase para la cantidad de productos de un catálogo.

---

## 🛠️ PERSONALIZACIÓN

### ¿Puedo cambiar los colores?

Sí, editando el archivo `css/styles.css`. Los colores están definidos como variables CSS al inicio del archivo.

### ¿Puedo cambiar el logo?

Sí, reemplaza el archivo `assets/LOGO_LILIANA_NUEVO_2026.png` con tu logo. Mantén el mismo nombre de archivo.

### ¿Puedo agregar más categorías?

Sí, desde el panel admin, sección "Categorías", botón "+ Nueva Categoría".

### ¿Puedo cambiar el diseño?

Sí, pero requiere conocimientos de HTML/CSS. Los archivos están organizados para facilitar modificaciones.

### ¿Puedo agregar un formulario de contacto?

El sistema usa WhatsApp para contacto, pero puedes agregar un formulario HTML si lo necesitas. Requerirá un servicio adicional para recibir los emails.

---

## 📊 ANÁLISIS

### ¿Puedo ver cuántas visitas tengo?

GitHub Pages no incluye analytics, pero puedes agregar Google Analytics gratuitamente agregando el código de seguimiento a `index.html`.

### ¿Puedo saber qué productos son más consultados?

No directamente, pero si usas Google Analytics, puedes ver qué páginas reciben más clics en los botones de WhatsApp.

### ¿Hay estadísticas de productos?

No en la versión actual, pero es una mejora futura que se puede implementar.

---

## 💰 COSTOS Y LÍMITES

### ¿Cuándo tendría que pagar?

Nunca, si te mantienes dentro de los límites gratuitos:
- Supabase: 500MB de base de datos (miles de productos)
- Cloudflare R2: 10GB de imágenes (cientos de productos con 5 fotos cada uno)
- GitHub Pages: 100GB de tráfico mensual (decenas de miles de visitas)

### ¿Qué pasa si excedo los límites?

Los servicios te avisarán antes. Puedes:
1. Upgradar a un plan de pago (económico)
2. Optimizar eliminando productos viejos
3. Comprimir más las imágenes

### ¿Cuánto costaría si upgrade?

- Supabase Pro: $25/mes (25GB base de datos)
- Cloudflare R2: $0.015 por GB adicional (~$1.50 por 100GB)

Pero es muy probable que nunca necesites pagar.

### ¿Puedo monetizar mi catálogo?

Es tuyo, haz lo que quieras. Puedes:
- Agregar publicidad (Google AdSense)
- Ofrecer espacios publicitarios a proveedores
- Cobrar comisiones por referencias

---

## 🌐 DOMINIO

### ¿Puedo usar mi propio dominio (www.mitienda.com)?

Sí, pero requiere algunos pasos adicionales:
1. Comprar un dominio (GoDaddy, Namecheap, etc.)
2. Configurar el dominio en GitHub Pages
3. Actualizar los DNS

Hay tutoriales en línea para esto.

### ¿El dominio de GitHub es profesional?

Sí, muchas empresas usan GitHub Pages. La URL es limpia: `usuario.github.io/comercial-liliana`

---

## 🔄 ACTUALIZACIONES

### ¿Cómo actualizo el catálogo?

Los productos se actualizan desde el panel admin. Para cambios en el código:
1. Edita los archivos localmente
2. Vuelve a subirlos a GitHub
3. GitHub Pages se actualiza automáticamente en 1-5 minutos

### ¿Hay nuevas versiones del sistema?

Este es un proyecto base. Puedes mejorarlo tú mismo o contratar a alguien para agregar funcionalidades.

### ¿Los cambios que hago se reflejan inmediatamente?

- Cambios en productos (admin): Inmediatos
- Cambios en código (GitHub): 1-5 minutos de propagación

---

## 📱 COMPATIBILIDAD

### ¿En qué navegadores funciona?

Todos los navegadores modernos:
- Chrome, Firefox, Safari, Edge
- Versiones móviles de los mismos

### ¿Funciona en iOS y Android?

Sí, está optimizado para ambos. Incluso puedes "agregarlo a la pantalla de inicio" como una app.

### ¿Funciona en tablets?

Sí, el diseño es responsive y se adapta a tablets perfectamente.

---

## 🆘 SOPORTE

### ¿Dónde obtengo ayuda?

1. **INICIO-RAPIDO.md**: Guía paso a paso
2. **SOLUCIONES-PROBLEMAS.md**: Problemas comunes
3. **README.md**: Documentación completa
4. **test-conexion.html**: Verifica tu configuración

### ¿Hay una comunidad?

Este es un proyecto individual, pero puedes buscar ayuda en:
- Foros de Supabase
- Foros de Cloudflare
- Stack Overflow
- Grupos de desarrollo web

### ¿Puedo contratar a alguien para configurarlo?

Sí, cualquier desarrollador web puede hacerlo en menos de 1 hora. O puedes seguir las guías tú mismo, están muy detalladas.

---

## 🎯 MEJORAS FUTURAS

### ¿Puedo agregar un carrito de compras?

Sí, pero requeriría desarrollo adicional. El sistema actual es solo un catálogo, no un ecommerce completo.

### ¿Puedo agregar pagos en línea?

Técnicamente sí, integrando servicios como Stripe, PayPal o Mercado Pago. Pero es un desarrollo más complejo.

### ¿Puedo agregar un chat en vivo?

Sí, hay servicios como Tawk.to o Crisp que se integran con un simple código JavaScript.

### ¿Puedo hacer que los clientes dejen reseñas?

Sí, pero requeriría agregar una tabla adicional en Supabase y desarrollo de interfaz.

---

## 🎓 APRENDIZAJE

### ¿Cómo puedo aprender a modificar el código?

Recursos recomendados:
- HTML/CSS: freeCodeCamp, W3Schools
- JavaScript: JavaScript.info, MDN Web Docs
- Supabase: Documentación oficial de Supabase

### ¿Es difícil agregar nuevas funcionalidades?

Depende de la funcionalidad. Cosas simples (cambiar textos, colores) son fáciles. Funcionalidades complejas (pagos, integraciones) requieren conocimiento de programación.

---

## ✅ MEJORES PRÁCTICAS

### ¿Cada cuánto debo actualizar los productos?

Lo ideal es mantenerlo actualizado semanalmente. Elimina productos agotados y agrega nuevos para mantener el catálogo fresco.

### ¿Qué tipo de fotos debo usar?

- Fondo blanco o neutro
- Buena iluminación
- Múltiples ángulos del producto
- Alta resolución (pero no te preocupes, el sistema las comprime)

### ¿Cómo describo los productos?

- Sé específico: medidas, material, color
- Menciona características destacadas
- Usa lenguaje simple
- Incluye detalles de entrega si aplica

### ¿Debo poner precios exactos?

Sí, los precios transparentes generan confianza. Si los precios varían mucho, puedes poner "desde S/ XXX".

---

¿Tienes más preguntas? Revisa los otros archivos de documentación o haz una prueba con el archivo `test-conexion.html`.

¡Éxito con tu catálogo! 🚀
