// Configuración del catálogo - BIMEG
// Este archivo controla qué versión del catálogo se muestra al público

const catalogConfig = {
    // Cambiar a 'production' para mostrar la página temporal
    // Cambiar a 'development' para mostrar el catálogo de ejemplo
    mode: 'production', // 'production' | 'development'
    
    // URLs de los catálogos
    urls: {
        development: 'catalogo.html',     // Catálogo con productos de ejemplo
        production: 'catalogo-temporal.html'  // Página temporal "en preparación"
    },
    
    // Función para obtener la URL correcta del catálogo
    getCatalogUrl: function() {
        return this.urls[this.mode];
    },
    
    // Función para verificar si estamos en modo desarrollo
    isDevelopment: function() {
        return this.mode === 'development';
    },
    
    // Función para verificar si estamos en modo producción
    isProduction: function() {
        return this.mode === 'production';
    }
};

// Función global para redirigir al catálogo correcto
function goToCatalog() {
    window.location.href = catalogConfig.getCatalogUrl();
}

// Función para redirigir al catálogo con categoría (solo en desarrollo)
function goToCatalogWithCategory(category) {
    if (catalogConfig.isDevelopment()) {
        window.location.href = `${catalogConfig.urls.development}?category=${category}`;
    } else {
        // En producción, ir a la página temporal sin categoría
        window.location.href = catalogConfig.urls.production;
    }
}

// Auto-aplicar configuración cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Actualizar todos los enlaces al catálogo en la página
    const catalogLinks = document.querySelectorAll('a[href*="catalogo.html"]');
    
    catalogLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        if (catalogConfig.isProduction()) {
            // En producción, todos los enlaces van a la página temporal
            if (href.includes('?category=')) {
                link.setAttribute('href', catalogConfig.urls.production);
            } else if (href === 'catalogo.html') {
                link.setAttribute('href', catalogConfig.urls.production);
            }
        }
        // En desarrollo, mantener los enlaces originales
    });
    
    // Mostrar indicador de modo en consola (solo para desarrollo)
    if (catalogConfig.isDevelopment()) {
        console.log('🔧 MODO DESARROLLO: Catálogo de ejemplo activo');
        console.log('💡 Para activar página temporal, cambiar catalogConfig.mode a "production"');
    }
});
