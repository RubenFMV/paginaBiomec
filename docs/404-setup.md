# Configuración de Página 404 - BIMEG

## 📋 Archivos Incluidos

- **`404.html`** - Página de error personalizada con diseño BIMEG
- **`.htaccess`** - Configuración para servidor Apache
- **`nginx-config.txt`** - Configuración de ejemplo para Nginx

## 🚀 Instalación

### Para Apache (Hosting compartido/cPanel)
1. El archivo `.htaccess` ya está configurado
2. Sube todos los archivos a tu servidor
3. La página 404 funcionará automáticamente

### Para Nginx
1. Copia la configuración de `nginx-config.txt`
2. Agrégala a tu archivo de configuración del sitio
3. Reinicia Nginx: `sudo nginx -s reload`

### Para Netlify/Vercel
1. Crea archivo `_redirects` (Netlify) o `vercel.json` (Vercel):

**Netlify (_redirects):**
```
/*    /404.html   404
```

**Vercel (vercel.json):**
```json
{
  "errorPage": "404.html"
}
```

## ✨ Características de la Página 404

### 🎨 Diseño
- **Gradient animado** con patrón médico flotante
- **Iconos biomédicos** animados en el fondo
- **Responsive** para todos los dispositivos
- **Coherente** con el branding de BIMEG

### 🧭 Navegación Inteligente
- **Breadcrumb** para orientación
- **Enlaces rápidos** a secciones principales
- **Sugerencias categorizadas** por especialidad médica
- **Integración con catalog-config.js** para redirección correcta

### 📞 Llamadas a la Acción
- **Teléfono directo** para emergencias
- **Email de contacto** para consultas
- **Formulario de contacto** desde página principal
- **Acceso directo** al catálogo según configuración

### 🔧 Funcionalidad Técnica
- **Detección de URL** que causó el error
- **Logging** para debugging (consola)
- **Animaciones suaves** CSS3
- **Efectos hover** interactivos
- **Carga progresiva** con transiciones

## 🔧 Personalización

### Cambiar Información de Contacto
Edita las líneas en `404.html`:
```html
<a href="tel:+524381092435">+52 438 109 2435</a>
<a href="mailto:ventas@bimeg-equipomedico.mx">Email</a>
```

### Agregar Más Categorías
Duplica bloques de `.search-suggestion` con nuevas categorías:
```html
<div class="search-suggestion">
    <h6 class="fw-bold mb-2">
        <i class="bi bi-ICON text-COLOR me-2"></i>NUEVA CATEGORÍA
    </h6>
    <p class="text-muted small mb-2">Descripción</p>
    <a href="javascript:goToCatalogWithCategory('categoria')" class="btn btn-sm btn-outline-COLOR">
        Ver Productos
    </a>
</div>
```

### Personalizar Colores
Modifica las variables CSS en `<style>`:
```css
/* Gradient principal */
background: linear-gradient(135deg, #TU_COLOR1 0%, #TU_COLOR2 100%);

/* Color de enlaces */
.btn-primary { background-color: #TU_COLOR_PRIMARIO; }
```

## 📊 Analytics y Seguimiento

### Google Analytics
Agrega tracking de errores 404:
```javascript
// Después de cargar GA
gtag('event', 'page_view', {
  'page_title': 'Error 404',
  'page_location': window.location.href,
  'content_group1': 'Error Pages'
});
```

### Hotjar/Similar
El código de tracking funcionará automáticamente si ya está instalado en el sitio.

## 🔒 Seguridad

### Protección del Panel de Desarrollo
En `.htaccess` (descomenta para activar):
```apache
<Files "dev-panel.html">
    Require ip 127.0.0.1
    Require ip TU_IP_DE_DESARROLLO
</Files>
```

### Headers de Seguridad
Ya incluidos en `.htaccess`:
- `X-XSS-Protection`
- `X-Frame-Options`
- `X-Content-Type-Options`

## 🚨 Solución de Problemas

### La página 404 no aparece
1. **Verifica** que `.htaccess` esté en la raíz del sitio
2. **Confirma** que Apache tiene `mod_rewrite` habilitado
3. **Revisa** permisos de archivos (644 para archivos, 755 para carpetas)

### Enlaces del catálogo no funcionan
1. **Verifica** que `js/catalog-config.js` esté cargando
2. **Revisa** la configuración del modo en `catalogConfig`
3. **Confirma** que las rutas de archivos sean correctas

### Estilos no cargan correctamente
1. **Verifica** la ruta a `css/styles.css`
2. **Confirma** que Bootstrap CDN esté accesible
3. **Revisa** la consola del navegador por errores

## 📱 Testing

### URLs de Prueba
- `tu-sitio.com/pagina-inexistente`
- `tu-sitio.com/catalogo/producto-falso`
- `tu-sitio.com/cualquier-cosa`

### Checklist de Funcionalidad
- [ ] Página 404 se muestra correctamente
- [ ] Navegación a página principal funciona
- [ ] Enlaces de catálogo redirigen según configuración
- [ ] Botones de contacto funcionan
- [ ] Diseño responsive en móviles
- [ ] Animaciones se ven correctamente
- [ ] No hay errores en consola

## 🎯 Métricas Recomendadas

### KPIs para la Página 404
- **Bounce rate** de la página 404
- **Clicks** en "Página Principal"
- **Clicks** en botones de contacto
- **Tiempo** en página 404
- **Rutas** más comunes que generan 404

## 📞 Soporte

Si necesitas ayuda con la configuración, contacta:
- **Email técnico**: [tu-email]
- **Documentación**: Este archivo
- **Testing**: Usa `dev-panel.html` para verificar configuración
