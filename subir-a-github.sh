#!/bin/bash

# ===========================================
# SCRIPT AUTOMÁTICO PARA SUBIR A GITHUB
# Comercial Liliana
# ===========================================

echo "🚀 SCRIPT DE SUBIDA AUTOMÁTICA A GITHUB"
echo "========================================"
echo ""

# Colores para el output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar que estamos en el directorio correcto
if [ ! -f "index.html" ]; then
    echo -e "${RED}❌ Error: No estás en el directorio del proyecto${NC}"
    echo "Navega a la carpeta comercial-liliana primero"
    exit 1
fi

echo -e "${GREEN}✅ Directorio correcto${NC}"
echo ""

# 2. Pedir el usuario de GitHub
echo "📝 Necesito algunos datos:"
echo ""
read -p "Tu usuario de GitHub (ejemplo: juanperez): " GITHUB_USER

if [ -z "$GITHUB_USER" ]; then
    echo -e "${RED}❌ Debes ingresar tu usuario de GitHub${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📋 Configuración:${NC}"
echo "   Usuario: $GITHUB_USER"
echo "   Repositorio: comercial-liliana"
echo "   URL: https://github.com/$GITHUB_USER/comercial-liliana"
echo ""
read -p "¿Es correcto? (s/n): " CONFIRM

if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
    echo "Operación cancelada"
    exit 1
fi

echo ""
echo "🔧 Iniciando proceso..."
echo ""

# 3. Eliminar .git si existe (para empezar limpio)
if [ -d ".git" ]; then
    echo "🗑️  Limpiando configuración Git anterior..."
    rm -rf .git
fi

# 4. Inicializar Git
echo "📦 Inicializando Git..."
git init
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al inicializar Git${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Git inicializado${NC}"

# 5. Configurar usuario Git (si no está configurado)
if [ -z "$(git config user.name)" ]; then
    echo "⚙️  Configurando Git..."
    git config user.name "$GITHUB_USER"
    git config user.email "${GITHUB_USER}@users.noreply.github.com"
fi

# 6. Crear branch main
git branch -M main

# 7. Agregar todos los archivos
echo "📁 Agregando archivos..."
git add .
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al agregar archivos${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Archivos agregados${NC}"

# 8. Hacer commit
echo "💾 Creando commit..."
git commit -m "Catálogo completo de Comercial Liliana"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al crear commit${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Commit creado${NC}"

# 9. Agregar remote
echo "🔗 Conectando con GitHub..."
REPO_URL="https://github.com/$GITHUB_USER/comercial-liliana.git"
git remote add origin $REPO_URL
echo -e "${GREEN}✅ Conectado a $REPO_URL${NC}"

# 10. Intentar push
echo ""
echo "⬆️  Subiendo archivos a GitHub..."
echo -e "${YELLOW}Se te pedirá tu usuario y contraseña/token de GitHub${NC}"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✅ ¡ÉXITO! Archivos subidos correctamente${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "🌐 URL de tu repositorio:"
    echo "   https://github.com/$GITHUB_USER/comercial-liliana"
    echo ""
    echo "📝 PRÓXIMOS PASOS:"
    echo ""
    echo "1. Ve a: https://github.com/$GITHUB_USER/comercial-liliana"
    echo "2. Clic en 'Settings' (arriba)"
    echo "3. Clic en 'Pages' (menú lateral)"
    echo "4. En 'Source', selecciona:"
    echo "   - Branch: main"
    echo "   - Folder: / (root)"
    echo "5. Clic en 'Save'"
    echo "6. Espera 3-5 minutos"
    echo "7. Tu sitio estará en:"
    echo "   https://$GITHUB_USER.github.io/comercial-liliana/"
    echo ""
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}❌ ERROR al subir archivos${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo "Posibles causas:"
    echo ""
    echo "1. ❌ El repositorio 'comercial-liliana' no existe en GitHub"
    echo "   → Ve a https://github.com/new y créalo primero"
    echo ""
    echo "2. ❌ Credenciales incorrectas"
    echo "   → Verifica tu usuario y contraseña/token"
    echo ""
    echo "3. ❌ El repositorio ya tiene contenido"
    echo "   → Elimínalo y créalo de nuevo vacío"
    echo ""
    echo "Después de corregir, ejecuta este script de nuevo:"
    echo "   bash subir-a-github.sh"
    echo ""
    exit 1
fi

echo "🎉 ¡Listo! Revisa tu sitio en unos minutos."
echo ""
