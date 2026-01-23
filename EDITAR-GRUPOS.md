# 📝 CÓMO EDITAR GRUPOS DE CATEGORÍAS

## 🎯 Método Simple (Recomendado)

Los grupos de categorías se editan directamente en el archivo [config.js](js/config.js#L54-L71).

### Paso 1: Abre el archivo

Abre el archivo: `js/config.js`

### Paso 2: Busca la sección CATEGORY_GROUPS

Encontrarás esto alrededor de la línea 54:

```javascript
CATEGORY_GROUPS: {
  dormitorio: {
    name: 'Dormitorio',
    icon: '🛏️',
    color: '#6B9DC2'
  },
  sala_comedor: {
    name: 'Sala y Comedor',
    icon: '🏠',
    color: '#2C4A6B'
  },
  organizacion: {
    name: 'Organización',
    icon: '🗄️',
    color: '#D4A96A'
  }
}
```

### Paso 3: Edita los grupos

#### ✏️ Para editar un grupo existente:

Cambia los valores de `name`, `icon` o `color`:

```javascript
dormitorio: {
  name: 'Habitaciones',  // Nuevo nombre
  icon: '🏠',            // Nuevo emoji
  color: '#FF5733'        // Nuevo color (código hex)
}
```

#### ➕ Para agregar un nuevo grupo:

Añade un nuevo bloque después del último grupo:

```javascript
organizacion: {
  name: 'Organización',
  icon: '🗄️',
  color: '#D4A96A'
},
jardin: {                    // ← NUEVO GRUPO
  name: 'Jardín',
  icon: '🌿',
  color: '#4CAF50'
}
```

**IMPORTANTE**: Agrega una coma `,` después del grupo anterior.

#### ❌ Para eliminar un grupo:

Borra todo el bloque del grupo (incluyendo la coma final):

```javascript
// Eliminar este bloque completo:
organizacion: {
  name: 'Organización',
  icon: '🗄️',
  color: '#D4A96A'
},  // ← También elimina la coma si es el último
```

### Paso 4: Guarda y sube a GitHub

1. Guarda el archivo `js/config.js`

2. Súbelo a GitHub:
   - **Opción Web**: Ve a tu repositorio → carpeta `js` → `config.js` → Editar → Commit
   - **Opción Terminal**:
     ```bash
     cd /Users/abdon_huidobro/Downloads/comercial-liliana
     git add js/config.js
     git commit -m "Actualizar grupos de categorías"
     git push origin main
     ```

3. Espera 1-2 minutos para que GitHub Pages se actualice

4. Recarga tu catálogo: https://ahhm0699.github.io/comercial-liliana/

---

## 📋 Estructura de un Grupo

```javascript
clave_del_grupo: {      // Nombre técnico (sin espacios, lowercase)
  name: 'Nombre',       // Nombre visible al usuario
  icon: '🎨',          // Emoji que representa el grupo
  color: '#HEXCODE'    // Color en formato hexadecimal
}
```

### Ejemplos de grupos:

```javascript
CATEGORY_GROUPS: {
  dormitorio: {
    name: 'Dormitorio',
    icon: '🛏️',
    color: '#6B9DC2'
  },
  sala: {
    name: 'Sala',
    icon: '🛋️',
    color: '#8E44AD'
  },
  cocina: {
    name: 'Cocina',
    icon: '🍳',
    color: '#E74C3C'
  },
  bano: {
    name: 'Baño',
    icon: '🚿',
    color: '#3498DB'
  },
  jardin: {
    name: 'Jardín',
    icon: '🌿',
    color: '#27AE60'
  },
  oficina: {
    name: 'Oficina',
    icon: '💼',
    color: '#34495E'
  }
}
```

---

## 🎨 Consejos para Colores

Usa colores en formato hexadecimal (#RRGGBB):

- **Azules**: `#3498DB`, `#6B9DC2`, `#5DADE2`
- **Verdes**: `#27AE60`, `#52BE80`, `#16A085`
- **Rojos**: `#E74C3C`, `#C0392B`, `#E67E22`
- **Amarillos**: `#F39C12`, `#F1C40F`, `#D4A96A`
- **Morados**: `#8E44AD`, `#9B59B6`, `#6C3483`
- **Grises**: `#34495E`, `#7F8C8D`, `#95A5A6`

**Herramienta útil**: https://htmlcolorcodes.com/es/

---

## 😀 Emojis Recomendados

Busca emojis en: https://emojipedia.org/

**Por categoría**:
- **Dormitorio**: 🛏️ 🛌 🪑 💤
- **Sala**: 🛋️ 🪑 📺 🏠
- **Comedor**: 🍽️ 🪑 🍴
- **Cocina**: 🍳 🔪 🧊 ☕
- **Baño**: 🚿 🛁 🚽 🧼
- **Jardín**: 🌿 🌻 🌳 🪴
- **Oficina**: 💼 🖥️ 📝 🗄️
- **Organización**: 🗄️ 📦 🧺 📁

---

## 🔄 Cómo se vinculan con las categorías

Cuando creas o editas una categoría en el panel admin, seleccionas el grupo del dropdown:

1. Ve al admin → **Categorías**
2. Crea/Edita una categoría
3. En el campo **"Grupo"**, selecciona el grupo deseado
4. La categoría se mostrará bajo ese grupo en el catálogo

**Nota**: Los grupos deben existir en `config.js` ANTES de usarlos en el admin.

---

## ⚠️ Errores Comunes

### 1. ❌ Olvidar la coma entre grupos

**Incorrecto**:
```javascript
dormitorio: { ... }
sala: { ... }  // ← Falta coma después de dormitorio
```

**Correcto**:
```javascript
dormitorio: { ... },
sala: { ... }
```

### 2. ❌ Usar espacios en la clave

**Incorrecto**:
```javascript
'sala comedor': { ... }  // ← No uses espacios
```

**Correcto**:
```javascript
sala_comedor: { ... }  // ← Usa guión bajo
```

### 3. ❌ Color sin #

**Incorrecto**:
```javascript
color: '6B9DC2'  // ← Falta el #
```

**Correcto**:
```javascript
color: '#6B9DC2'
```

---

## 🚀 Método Avanzado (Opcional)

Si quieres que los grupos sean editables desde el panel admin (sin tocar código), puedes ejecutar el script SQL que se encuentra en:

📄 **grupos-categorias.sql**

### Pasos:

1. Ve a Supabase → Tu proyecto → **SQL Editor**

2. Copia y pega el contenido de `grupos-categorias.sql`

3. Clic en **"Run"**

4. Espera confirmación ✅

**Nota**: Esta opción requiere modificar el código del admin para conectarse a la tabla de grupos en lugar de usar `config.js`. Es más avanzado y requiere desarrollo adicional.

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas editando los grupos:

1. Verifica que la sintaxis JavaScript sea correcta
2. Asegúrate de no tener errores de coma o llaves
3. Abre la consola del navegador (F12) para ver errores
4. Compara tu código con el ejemplo original

---

## ✅ Checklist Final

Después de editar los grupos:

- [ ] Los grupos tienen nombres descriptivos
- [ ] Los emojis se ven correctamente
- [ ] Los colores son distintos y visibles
- [ ] No hay errores de sintaxis (comas, llaves)
- [ ] Guardaste el archivo
- [ ] Subiste a GitHub
- [ ] Esperaste 1-2 minutos
- [ ] Recargaste el catálogo
- [ ] Los grupos se ven correctamente en el catálogo

---

¡Listo! Ahora puedes personalizar los grupos de categorías según tus necesidades. 🎉
