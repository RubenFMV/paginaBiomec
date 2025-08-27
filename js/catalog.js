// ===================================
// CATÁLOGO - FUNCIONALIDAD JAVASCRIPT
// ===================================

// Variables globales
let productsData = [];
let categoriesData = [];
let brandsData = [];
let filteredProducts = [];
let currentFilters = {
    category: '',
    brand: '',
    search: ''
};

// Cargar datos desde JSON
async function loadProductsData() {
    try {
        const response = await fetch('data/products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Asignar datos a variables globales
        productsData = data.products || [];
        categoriesData = data.categories || [];
        brandsData = data.brands || [];
        filteredProducts = [...productsData];
        
        console.log(`Cargados ${productsData.length} productos desde JSON`);
        return data;
    } catch (error) {
        console.error('Error cargando productos:', error);
        // Fallback a datos estáticos si hay error
        loadFallbackData();
        return null;
    }
}

// Datos de respaldo en caso de error al cargar JSON
function loadFallbackData() {
    console.warn('Usando datos de respaldo estáticos');
    productsData = [
        {
            id: 1,
            code: "VAL-001",
            name: "Válvula de Alivio de Presión",
            shortDescription: "Válvula de seguridad para máquinas de anestesia",
            category: "anestesia",
            brand: "drager",
            image: "bi-gear-fill",
            specifications: {
                "Presión": "0-70 cmH2O",
                "Material": "Latón médico",
                "Compatibilidad": "Universal"
            },
            stock: { available: true },
            featured: true
        }
        // Agregar más productos de respaldo si es necesario
    ];
    filteredProducts = [...productsData];
}

// Inicialización
document.addEventListener('DOMContentLoaded', async function() {
    showLoading();
    await loadProductsData();
    initializeCatalog();
    setupEventListeners();
    handleURLParameters();
    hideLoading();
});

// Configurar event listeners
function setupEventListeners() {
    // Filtros
    document.getElementById('category-filter').addEventListener('change', handleFilterChange);
    document.getElementById('brand-filter').addEventListener('change', handleFilterChange);
    document.getElementById('search-filter').addEventListener('input', handleSearchChange);
    document.getElementById('clear-filters').addEventListener('click', clearAllFilters);
    
    // Botón de búsqueda
    document.querySelector('.input-group .btn').addEventListener('click', handleSearch);
    
    // Enter en el campo de búsqueda
    document.getElementById('search-filter').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
}

// Inicializar catálogo
function initializeCatalog() {
    renderProducts();
    updateProductCount();
}

// Manejar cambios en filtros
function handleFilterChange(event) {
    const filterType = event.target.id.replace('-filter', '');
    currentFilters[filterType] = event.target.value;
    applyFilters();
}

// Manejar búsqueda
function handleSearchChange(event) {
    currentFilters.search = event.target.value;
    // Debounce para la búsqueda
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
        applyFilters();
    }, 300);
}

function handleSearch() {
    const searchValue = document.getElementById('search-filter').value;
    currentFilters.search = searchValue;
    applyFilters();
}

// Aplicar filtros
function applyFilters() {
    showLoading();
    
    setTimeout(() => {
        filteredProducts = productsData.filter(product => {
            const matchesCategory = !currentFilters.category || product.category === currentFilters.category;
            const matchesBrand = !currentFilters.brand || product.brand === currentFilters.brand;
            const matchesSearch = !currentFilters.search || 
                product.name.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
                product.code.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
                product.shortDescription.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
                (product.fullDescription && product.fullDescription.toLowerCase().includes(currentFilters.search.toLowerCase())) ||
                (product.tags && product.tags.some(tag => tag.toLowerCase().includes(currentFilters.search.toLowerCase())));
            
            return matchesCategory && matchesBrand && matchesSearch;
        });
        
        renderProducts();
        updateProductCount();
        hideLoading();
    }, 500);
}

// Limpiar filtros
function clearAllFilters() {
    currentFilters = { category: '', brand: '', search: '' };
    
    document.getElementById('category-filter').value = '';
    document.getElementById('brand-filter').value = '';
    document.getElementById('search-filter').value = '';
    
    filteredProducts = [...productsData];
    renderProducts();
    updateProductCount();
}

// Renderizar productos
function renderProducts() {
    const grid = document.getElementById('products-grid');
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div class="col-12">
                <div class="no-results">
                    <i class="bi bi-search"></i>
                    <h4>No se encontraron productos</h4>
                    <p>Intenta ajustar los filtros de búsqueda o explora otras categorías.</p>
                    <button class="btn btn-primary" onclick="clearAllFilters()">Ver todos los productos</button>
                </div>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
}

// Crear tarjeta de producto
function createProductCard(product) {
    const stockBadge = product.stock.available 
        ? '<span class="product-badge bg-success">En Stock</span>' 
        : '<span class="product-badge bg-warning">Consultar</span>';
    
    const featuredBadge = product.featured 
        ? '<span class="product-badge bg-primary" style="top: 40px;">Destacado</span>' 
        : '';
    
    const newBadge = product.newProduct 
        ? '<span class="product-badge bg-info" style="top: 70px;">Nuevo</span>' 
        : '';
    
    const saleBadge = product.onSale 
        ? '<span class="product-badge bg-danger" style="top: 100px;">Oferta</span>' 
        : '';
    
    const specsHtml = Object.entries(product.specifications || {})
        .slice(0, 3) // Mostrar solo las primeras 3 especificaciones
        .map(([key, value]) => `
            <div class="spec-item">
                <span class="spec-label">${key}:</span>
                <span class="spec-value">${value}</span>
            </div>
        `).join('');
    
    const searchTerm = currentFilters.search.toLowerCase();
    let highlightedName = product.name;
    let highlightedCode = product.code;
    
    if (searchTerm) {
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        highlightedName = product.name.replace(regex, '<span class="search-highlight">$1</span>');
        highlightedCode = product.code.replace(regex, '<span class="search-highlight">$1</span>');
    }
    
    // Mostrar precio si está configurado para mostrarse
    const priceHtml = product.price && product.price.showPrice 
        ? `<div class="product-price mb-2">
             <span class="price-amount">${product.price.currency} $${product.price.amount.toLocaleString()}</span>
             ${product.onSale && product.salePrice ? 
               `<span class="price-sale">${product.price.currency} $${product.salePrice.toLocaleString()}</span>` : ''}
           </div>`
        : '';
    
    return `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card product-card">
                <div class="product-image category-${product.category}">
                    <i class="${product.image}"></i>
                    ${stockBadge}
                    ${featuredBadge}
                    ${newBadge}
                    ${saleBadge}
                </div>
                <div class="product-body d-flex flex-column">
                    <div class="product-code">${highlightedCode}</div>
                    <h5 class="product-title">${highlightedName}</h5>
                    <p class="product-description">${product.shortDescription || product.fullDescription || ''}</p>
                    ${priceHtml}
                    <div class="product-specs">
                        ${specsHtml}
                    </div>
                    <div class="product-actions mt-auto">
                        <button class="btn btn-quote" onclick="requestQuote('${product.code}')">
                            <i class="bi bi-envelope me-1"></i>Cotizar
                        </button>
                        <button class="btn btn-details" onclick="showProductDetails(${product.id})">
                            <i class="bi bi-info-circle me-1"></i>Detalles
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Funciones de productos
function requestQuote(productCode) {
    // Redirigir al formulario de contacto con el código prellenado
    const contactURL = `index.html#contact?product=${encodeURIComponent(productCode)}`;
    window.location.href = contactURL;
}

function showProductDetails(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;
    
    // Crear especificaciones completas
    const fullSpecsHtml = Object.entries(product.specifications || {}).map(([key, value]) => `
        <div class="spec-item">
            <span class="spec-label">${key}:</span>
            <span class="spec-value">${value}</span>
        </div>
    `).join('');
    
    // Crear lista de compatibilidad
    const compatibilityHtml = product.compatibility ? 
        `<div class="mb-3">
            <h6 class="fw-bold">Compatibilidad:</h6>
            <ul class="list-unstyled">
                ${product.compatibility.map(item => `<li><i class="bi bi-check-circle text-success me-2"></i>${item}</li>`).join('')}
            </ul>
        </div>` : '';
    
    // Crear información de precio
    const priceHtml = product.price ? 
        (product.price.showPrice ? 
            `<div class="d-flex justify-content-between align-items-center mb-3">
                <span class="fw-bold">Precio:</span>
                <span class="h5 text-primary mb-0">
                    ${product.price.currency} $${product.price.amount.toLocaleString()}
                    ${product.onSale && product.salePrice ? 
                        ` <small class="text-decoration-line-through text-muted">$${product.salePrice.toLocaleString()}</small>` : ''}
                </span>
            </div>` :
            `<div class="d-flex justify-content-between align-items-center mb-3">
                <span class="fw-bold">Precio:</span>
                <span class="badge bg-info">Cotizar</span>
            </div>`
        ) : '';
    
    // Crear información de stock detallada
    const stockHtml = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="fw-bold">Disponibilidad:</span>
            <span class="badge ${product.stock.available ? 'bg-success' : 'bg-warning'}">
                ${product.stock.available ? `En Stock (${product.stock.quantity || 'Disponible'})` : 'Consultar disponibilidad'}
            </span>
        </div>
        <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="fw-bold">Tiempo de entrega:</span>
            <span>${product.stock.leadTime}</span>
        </div>`;
    
    // Crear badges de estado
    const badgesHtml = `
        <div class="product-badges mb-3">
            ${product.featured ? '<span class="badge bg-primary me-1">Destacado</span>' : ''}
            ${product.newProduct ? '<span class="badge bg-info me-1">Nuevo</span>' : ''}
            ${product.onSale ? '<span class="badge bg-danger me-1">En Oferta</span>' : ''}
        </div>`;
    
    // Crear tags
    const tagsHtml = product.tags ? 
        `<div class="mb-3">
            <h6 class="fw-bold">Etiquetas:</h6>
            <div class="tags-container">
                ${product.tags.map(tag => `<span class="badge bg-light text-dark me-1">${tag}</span>`).join('')}
            </div>
        </div>` : '';
    
    // Crear modal dinámico con detalles completos del producto
    const modalHTML = `
        <div class="modal fade" id="productModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${product.name}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="product-image category-${product.category} mb-3" style="height: 300px;">
                                    <i class="${product.image}" style="font-size: 5rem;"></i>
                                </div>
                                <div class="product-code mb-3">${product.code}</div>
                                ${badgesHtml}
                                <h6 class="fw-bold mb-2">Descripción:</h6>
                                <p class="text-muted mb-3">${product.fullDescription || product.shortDescription}</p>
                                ${compatibilityHtml}
                                ${tagsHtml}
                            </div>
                            <div class="col-md-6">
                                <h6 class="fw-bold mb-3">Información del producto:</h6>
                                ${priceHtml}
                                ${stockHtml}
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <span class="fw-bold">Marca:</span>
                                    <span class="text-capitalize">${product.brand}</span>
                                </div>
                                <div class="d-flex justify-content-between align-items-center mb-4">
                                    <span class="fw-bold">Categoría:</span>
                                    <span class="text-capitalize">${product.category.replace('-', ' ')}</span>
                                </div>
                                
                                <h6 class="fw-bold mb-3">Especificaciones técnicas:</h6>
                                <div class="product-specs">
                                    ${fullSpecsHtml}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        <button type="button" class="btn btn-outline-primary" onclick="window.print()">
                            <i class="bi bi-printer me-1"></i>Imprimir
                        </button>
                        <button type="button" class="btn btn-primary" onclick="requestQuote('${product.code}')">
                            <i class="bi bi-envelope me-1"></i>Solicitar Cotización
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal anterior si existe
    const existingModal = document.getElementById('productModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Agregar y mostrar nuevo modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

// Estados de carga
function showLoading() {
    document.getElementById('loading-spinner').style.display = 'block';
    document.getElementById('products-grid').style.opacity = '0.5';
}

function hideLoading() {
    document.getElementById('loading-spinner').style.display = 'none';
    document.getElementById('products-grid').style.opacity = '1';
}

// Actualizar contador de productos
function updateProductCount() {
    const totalProducts = filteredProducts.length;
    const availableProducts = filteredProducts.filter(p => p.stock && p.stock.available).length;
    
    // Actualizar estadísticas en el hero si existen
    const statsElements = document.querySelectorAll('.stat-item h3');
    if (statsElements.length > 0) {
        statsElements[0].textContent = `${totalProducts}+`;
        if (statsElements.length > 1) {
            // Contar marcas únicas en productos filtrados
            const uniqueBrands = [...new Set(filteredProducts.map(p => p.brand))].length;
            statsElements[1].textContent = `${uniqueBrands}+`;
        }
    }
    
    // Log para debugging
    console.log(`Mostrando ${totalProducts} productos, ${availableProducts} disponibles`);
}

// Función para manejar parámetros URL (si viene desde el botón "Ver Catálogo")
function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    
    if (category) {
        document.getElementById('category-filter').value = category;
        currentFilters.category = category;
    }
    
    if (search) {
        document.getElementById('search-filter').value = search;
        currentFilters.search = search;
    }
    
    if (category || search) {
        applyFilters();
    }
}

// Ejecutar al cargar
document.addEventListener('DOMContentLoaded', function() {
    handleURLParameters();
});
