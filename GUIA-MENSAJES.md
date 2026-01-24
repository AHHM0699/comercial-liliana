# 📝 Guía para Actualizar Mensajes - Comercial Liliana

Esta guía te ayudará a personalizar todos los mensajes que aparecen en tu catálogo web.

---

## 📍 **1. Mensajes del Header (Banner Superior)**

**Ubicación:** `js/config.js` línea 36-45

```javascript
PROMO_MESSAGES: [
  '¡Pregunta por nuestras OFERTAS especiales! 🎉',
  '¡Descuentos exclusivos en muebles! 💰',
  '🚚 Envío GRATIS en compras mayores a S/500 al Bajo Piura',
  // ... más mensajes
],
```

**Cómo editar:**
1. Abre el archivo `js/config.js`
2. Busca la sección `PROMO_MESSAGES`
3. Agrega, elimina o modifica mensajes dentro del array `[ ]`
4. Cada mensaje debe estar entre comillas simples `'mensaje'`
5. Separa cada mensaje con una coma `,`
6. Usa emojis para hacerlo más atractivo 🎉

**Ejemplo - Agregar un nuevo mensaje:**
```javascript
PROMO_MESSAGES: [
  '¡Pregunta por nuestras OFERTAS especiales! 🎉',
  'TU NUEVO MENSAJE AQUÍ 🆕',  // <-- Nuevo mensaje
  '¡Descuentos exclusivos en muebles! 💰',
],
```

**Velocidad de rotación:**
Para cambiar qué tan rápido rotan los mensajes, modifica:
```javascript
PROMO_BANNER_INTERVAL: 4000,  // 4000 = 4 segundos
```

---

## 💬 **2. Mensajes Flotantes del Botón Principal de WhatsApp**

**Ubicación:** `js/catalog.js` línea 690-709

```javascript
const motivationalMessages = [
  "💰 ¡Consulta por descuentos especiales!",
  "🎁 ¡Tenemos ofertas increíbles para ti!",
  "🆓 Envío GRATIS en compras +S/500 al Bajo Piura",
  // ... más mensajes
];
```

**Cómo editar:**
1. Abre el archivo `js/catalog.js`
2. Busca `const motivationalMessages =`
3. Edita los mensajes dentro del array
4. Cada mensaje debe estar entre comillas dobles `"mensaje"`
5. Separa con comas `,`

**Características:**
- Aparecen aleatoriamente cada 20-30 segundos
- Se muestran cerca del botón flotante de WhatsApp
- Desaparecen automáticamente después de 5 segundos

---

## 🛍️ **3. Mensajes del Modal de Productos**

Los mensajes varían según el precio del producto:

### 3.1 Productos **< S/500**

**Ubicación:** `js/product-modal.js` línea 444-455

```javascript
const modalMessagesLow = [
  "💰 ¡Consulta por descuentos especiales!",
  "🎁 ¿Buscas mejor precio? ¡Pregúntanos!",
  "✨ Tenemos promociones increíbles para ti",
  // ... hasta 10 mensajes
];
```

**Propósito:** Incentivar la compra y consulta sobre descuentos

---

### 3.2 Productos **S/500 - S/999**

**Ubicación:** `js/product-modal.js` línea 458-469

```javascript
const modalMessagesMid = [
  "🆓 ¡Envío GRATUITO a todo el Bajo Piura!",
  "🎉 ¡Excelente elección! Envío gratis incluido",
  "✨ Producto premium con envío sin costo",
  // ... hasta 10 mensajes
];
```

**Propósito:** Destacar el beneficio del envío gratuito

---

### 3.3 Productos **>= S/1000**

**Ubicación:** `js/product-modal.js` línea 472-485

```javascript
const modalMessagesHigh = [
  "🎁 ¡OBSEQUIO incluido en tu compra!",
  "🆓 Envío GRATIS + REGALO especial",
  "✨ Producto premium + obsequio sorpresa",
  // ... hasta 12 mensajes
];
```

**Propósito:** Destacar obsequios especiales + envío gratuito

---

**Velocidad de mensajes del modal:**
Los mensajes aparecen cada **12-15 segundos** (tiempo aleatorio)

Para cambiar este tiempo, edita en `js/product-modal.js` línea ~525:
```javascript
const randomDelay = 12000 + Math.random() * 3000;
//                 ^^^^^                 ^^^^
//                 12s                    +3s aleatorio
```

Si quieres que sea entre 10-12 segundos:
```javascript
const randomDelay = 10000 + Math.random() * 2000;
```

---

## 🔄 **Cómo Aplicar los Cambios**

Después de editar cualquier archivo:

### Opción 1: Usando Git (Recomendado)

```bash
# 1. Guardar cambios
git add .

# 2. Crear commit
git commit -m "Actualizar mensajes promocionales"

# 3. Subir a GitHub
git push origin main
```

### Opción 2: Subir Archivos Manualmente

1. Ve a tu repositorio en GitHub
2. Navega al archivo que editaste
3. Click en el ícono de lápiz (✏️ Edit)
4. Pega el nuevo contenido
5. Click en "Commit changes"

---

## ⚙️ **Configuración de Rangos de Precio**

Si quieres cambiar los rangos de precio para los mensajes del modal:

**Ubicación:** `js/product-modal.js` línea ~494-500

```javascript
let messages;
if (precio >= 1000) {        // Cambiar este número
  messages = modalMessagesHigh;
} else if (precio >= 500) {   // Cambiar este número
  messages = modalMessagesMid;
} else {
  messages = modalMessagesLow;
}
```

**Ejemplo:** Si quieres que los obsequios sean para compras >= S/800:
```javascript
if (precio >= 800) {  // Era 1000, ahora 800
```

También debes actualizar el mensaje de WhatsApp en línea ~548:
```javascript
if (precio >= 800) {  // Cambiar aquí también
  message += `\n\n🎁 ¿Incluye el obsequio y el envío gratuito al Bajo Piura?`;
```

---

## 📋 **Checklist de Actualización**

- [ ] Editar mensajes del header (`js/config.js`)
- [ ] Editar mensajes flotantes principales (`js/catalog.js`)
- [ ] Editar mensajes del modal - bajo precio (`js/product-modal.js`)
- [ ] Editar mensajes del modal - precio medio (`js/product-modal.js`)
- [ ] Editar mensajes del modal - precio alto (`js/product-modal.js`)
- [ ] Verificar rangos de precio si es necesario
- [ ] Guardar cambios con Git
- [ ] Verificar en el sitio web que los mensajes se vean correctamente

---

## 💡 **Consejos de Redacción**

1. **Usa emojis relevantes** 🎉💰🎁 para llamar la atención
2. **Sé conciso** - Mensajes de 4-8 palabras funcionan mejor
3. **Varía el tono** - Combina urgencia, beneficios y llamados a la acción
4. **Menciona beneficios específicos** - Envío gratis, obsequios, descuentos
5. **Usa verbos de acción** - Consulta, Pregunta, Aprovecha, Escribe

---

## ❓ **Preguntas Frecuentes**

**P: ¿Cuántos mensajes puedo agregar?**
R: Puedes agregar tantos como quieras, pero se recomienda entre 10-20 para buena variedad.

**P: ¿Los mensajes se pueden repetir?**
R: Sí, el sistema selecciona aleatoriamente, así que podrían repetirse.

**P: ¿Puedo usar saltos de línea en los mensajes?**
R: No en los mensajes flotantes, pero sí en los mensajes de WhatsApp usando `\n\n`.

**P: ¿Cómo sé si los cambios funcionaron?**
R: Abre tu sitio en modo incógnito (Ctrl+Shift+N) para evitar el caché y verifica.

**P: ¿Qué pasa si cometo un error de sintaxis?**
R: El sitio puede dejar de funcionar. Asegúrate de:
   - No olvidar las comillas
   - Separar con comas
   - No dejar comas al final del último mensaje

---

## 🆘 **Solución de Problemas**

**Error: Los mensajes no aparecen**
- Verifica que no hayas olvidado comillas o comas
- Abre la consola del navegador (F12) y busca errores en rojo
- Asegúrate de haber guardado y subido los cambios

**Error: Sitio en blanco después de editar**
- Revisa la sintaxis de JavaScript
- Usa una herramienta como [JSONLint](https://jsonlint.com/) para verificar
- Revierte al último commit funcional

---

## 📞 **Soporte**

Si tienes dudas o problemas, revisa el archivo y compara con los ejemplos de esta guía.

¡Recuerda siempre hacer una copia de seguridad antes de hacer cambios importantes! 🛡️
