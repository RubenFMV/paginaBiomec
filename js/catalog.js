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

// Función para obtener HTML de imagen del producto
function getProductImageHtml(product) {
    // Verificar si existe la clave images
    if (product.images) {
        // Prioridad 1: Imagen principal definida
        if (product.images.main) {
            return `
                <div class="product-image-container">
                    <img src="${product.images.main}" 
                         alt="${product.name}" 
                         class="product-main-image clickable-image"
                         onclick="showProductDetails(${product.id})"
                         style="cursor: pointer;"
                         title="Haz clic para ver detalles"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="product-icon-fallback clickable-image" 
                         onclick="showProductDetails(${product.id})"
                         style="display: none; cursor: pointer;"
                         title="Haz clic para ver detalles">
                        <i class="bi-cpu"></i>
                    </div>
                    ${product.images.gallery && product.images.gallery.length > 1 ? 
                      `<div class="image-count-badge">
                         <i class="bi bi-images"></i> ${product.images.gallery.length}
                       </div>` : ''}
                </div>
            `;
        }
        // Prioridad 2: Primera imagen de la galería
        else if (product.images.gallery && product.images.gallery.length > 0) {
            return `
                <div class="product-image-container">
                    <img src="${product.images.gallery[0].url}" 
                         alt="${product.images.gallery[0].alt || product.name}" 
                         class="product-main-image clickable-image"
                         onclick="showProductDetails(${product.id})"
                         style="cursor: pointer;"
                         title="Haz clic para ver detalles"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="product-icon-fallback clickable-image" 
                         onclick="showProductDetails(${product.id})"
                         style="display: none; cursor: pointer;"
                         title="Haz clic para ver detalles">
                        <i class="bi-cpu"></i>
                    </div>
                    ${product.images.gallery.length > 1 ? 
                      `<div class="image-count-badge">
                         <i class="bi bi-images"></i> ${product.images.gallery.length}
                       </div>` : ''}
                </div>
            `;
        }
        // Prioridad 3: Imagen thumbnail
        else if (product.images.thumbnail) {
            return `
                <div class="product-image-container">
                    <img src="${product.images.thumbnail}" 
                         alt="${product.name}" 
                         class="product-main-image clickable-image"
                         onclick="showProductDetails(${product.id})"
                         style="cursor: pointer;"
                         title="Haz clic para ver detalles"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="product-icon-fallback clickable-image" 
                         onclick="showProductDetails(${product.id})"
                         style="display: none; cursor: pointer;"
                         title="Haz clic para ver detalles">
                        <i class="bi-cpu"></i>
                    </div>
                </div>
            `;
        }
    }
    
    // Fallback: Si no existe la clave images o está vacía, usar ícono bi-cpu (chip)
    return `<i class="bi-cpu clickable-image" 
               onclick="showProductDetails(${product.id})"
               style="cursor: pointer;"
               title="Haz clic para ver detalles"></i>`;
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
    
    // Manejar imágenes del producto
    const productImageHtml = getProductImageHtml(product);
    
    return `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card product-card">
                <div class="product-image category-${product.category}">
                    ${productImageHtml}
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
                        <button class="btn btn-whatsapp" onclick="quoteViaWhatsApp('${product.code}')">
                            <i class="bi bi-whatsapp me-1"></i>WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Funciones de productos
function requestQuote(productCode) {
    // Encontrar el producto por código
    const product = productsData.find(p => p.code === productCode);
    if (!product) {
        console.error('Producto no encontrado:', productCode);
        return;
    }

    // Cerrar el modal de detalles si está abierto
    const productModal = document.getElementById('productModal');
    if (productModal) {
        const modal = bootstrap.Modal.getInstance(productModal);
        if (modal) {
            modal.hide();
        }
    }

    // Crear modal de cotización
    const quoteModalHTML = `
        <div class="modal fade" id="quoteModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-envelope me-2"></i>Solicitar Cotización
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="quoteForm">
                            <!-- Información del producto -->
                            <div class="row mb-4">
                                <div class="col-12">
                                    <h6 class="fw-bold text-primary mb-3">
                                        <i class="bi bi-box-seam me-2"></i>Producto Seleccionado
                                    </h6>
                                    <div class="card bg-light">
                                        <div class="card-body">
                                            <div class="row align-items-center">
                                                <div class="col-md-8">
                                                    <h6 class="card-title mb-1">${product.name}</h6>
                                                    <p class="card-text mb-1">
                                                        <strong>Código:</strong> ${product.code}
                                                    </p>
                                                    <p class="card-text mb-1">
                                                        <strong>Marca:</strong> ${product.brand.charAt(0).toUpperCase() + product.brand.slice(1)}
                                                    </p>
                                                    <p class="card-text mb-0">
                                                        <strong>Categoría:</strong> ${product.category.replace('-', ' ').charAt(0).toUpperCase() + product.category.replace('-', ' ').slice(1)}
                                                    </p>
                                                </div>
                                                <div class="col-md-4 text-end">
                                                    <span class="badge ${product.stock.available ? 'bg-success' : 'bg-warning'}">
                                                        ${product.stock.available ? 'En Stock' : 'Consultar'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Datos de contacto -->
                            <div class="row mb-4">
                                <div class="col-12">
                                    <h6 class="fw-bold text-primary mb-3">
                                        <i class="bi bi-person me-2"></i>Datos de Contacto
                                    </h6>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="quoteName" class="form-label">Nombre Completo *</label>
                                    <input type="text" class="form-control" id="quoteName" name="name" required
                                           minlength="2"
                                           title="Solo se permiten letras y espacios, mínimo 2 caracteres">
                                    <div class="invalid-feedback">
                                        Por favor ingrese un nombre válido (solo letras y espacios, mínimo 2 caracteres)
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="quoteEmail" class="form-label">Correo Electrónico *</label>
                                    <input type="email" class="form-control" id="quoteEmail" name="email" required
                                           title="Ingrese un correo electrónico válido"
                                           placeholder="ejemplo@dominio.com">
                                    <div class="invalid-feedback">
                                        Por favor ingrese un correo electrónico válido
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="quotePhone" class="form-label">Teléfono *</label>
                                    <input type="tel" class="form-control" id="quotePhone" name="phone" required
                                           title="Ingrese un número de teléfono válido"
                                           placeholder="+52 55 1234 5678 o 5512345678"
                                           minlength="10">
                                    <div class="invalid-feedback">
                                        Por favor ingrese un número de teléfono válido (mínimo 10 dígitos)
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="quoteCompany" class="form-label">Empresa/Institución</label>
                                    <input type="text" class="form-control" id="quoteCompany" name="company">
                                </div>
                                <div class="col-12 mb-3">
                                    <label for="quoteQuantity" class="form-label">Cantidad Solicitada</label>
                                    <input type="number" class="form-control" id="quoteQuantity" name="quantity" min="1" value="1">
                                </div>
                                <div class="col-12 mb-3">
                                    <label for="quoteMessage" class="form-label">Mensaje Adicional</label>
                                    <textarea class="form-control" id="quoteMessage" name="message" rows="4" 
                                              placeholder="Describa cualquier requerimiento específico, urgencia, o información adicional..."></textarea>
                                </div>
                            </div>

                            <!-- Validación Anti-Robot -->
                            <div class="row mb-4">
                                <div class="col-12">
                                    <div class="security-validation-minimal">
                                        <div class="security-header-minimal">
                                            <i class="bi bi-shield-check security-icon-minimal"></i>
                                            <span class="security-title-minimal">Verificación de Seguridad</span>
                                            <span class="badge bg-success security-badge-minimal">
                                                <i class="bi bi-lock-fill"></i>
                                            </span>
                                        </div>
                                        
                                        <!-- Honeypot (campo oculto para robots) -->
                                        <input type="text" name="website" id="website" style="position: absolute; left: -9999px; opacity: 0;" tabindex="-1" autocomplete="off">
                                        
                                        <!-- CAPTCHA Matemático Minimalista -->
                                        <div class="math-captcha-minimal">
                                            <label for="mathCaptcha" class="form-label mb-2">
                                                <i class="bi bi-calculator me-1"></i>
                                                Resuelve: <span id="mathQuestion" class="math-question-minimal"></span> = 
                                                <input type="text" class="form-control d-inline-block math-input-minimal" 
                                                       id="mathCaptcha" name="mathCaptcha" 
                                                       required placeholder="?" autocomplete="off">
                                                <button type="button" class="btn btn-outline-primary btn-sm math-refresh-btn" 
                                                        onclick="generateMathCaptcha()" 
                                                        title="Generar nueva operación">
                                                    <i class="bi bi-arrow-clockwise"></i>
                                                </button>
                                            </label>
                                            <div class="invalid-feedback">
                                                Operación incorrecta
                                            </div>
                                            <small class="text-muted security-help-minimal">
                                                <i class="bi bi-info-circle me-1"></i>Prevención de spam
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <style>
                            .security-validation-minimal {
                                background: #f8f9fa;
                                border: 1px solid #28a745;
                                border-radius: 8px;
                                padding: 15px;
                                border-left: 4px solid #28a745;
                            }

                            .security-header-minimal {
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                margin-bottom: 12px;
                                font-size: 0.9rem;
                            }

                            .security-icon-minimal {
                                color: #28a745;
                                font-size: 1.1rem;
                            }

                            .security-title-minimal {
                                font-weight: 600;
                                color: #495057;
                                flex: 1;
                            }

                            .security-badge-minimal {
                                font-size: 0.7rem;
                                padding: 4px 8px;
                            }

                            .math-captcha-minimal .form-label {
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                margin: 0;
                                font-weight: 500;
                                color: #495057;
                            }

                            .math-question-minimal {
                                background: #007bff;
                                color: white;
                                padding: 4px 12px;
                                border-radius: 4px;
                                font-weight: bold;
                                font-family: monospace;
                                font-size: 0.95rem;
                            }

                            .math-input-minimal {
                                width: 70px !important;
                                height: 32px;
                                text-align: center;
                                font-weight: bold;
                                margin-left: 4px;
                                border: 1px solid #ced4da;
                                color: #000000 !important;
                                background-color: #ffffff !important;
                            }

                            .math-refresh-btn {
                                height: 32px;
                                width: 32px;
                                padding: 0;
                                margin-left: 8px;
                                display: inline-flex;
                                align-items: center;
                                justify-content: center;
                                border-radius: 4px;
                                transition: all 0.2s ease;
                            }

                            .math-refresh-btn:hover {
                                transform: rotate(180deg);
                                background-color: #007bff;
                                color: white;
                                border-color: #007bff;
                            }

                            .math-refresh-btn i {
                                font-size: 0.9rem;
                            }

                            .math-input-minimal:focus {
                                border-color: #007bff;
                                box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
                            }

                            .math-input-minimal.is-valid {
                                border-color: #28a745;
                                background: #f8fff9;
                                color: #000000 !important;
                            }

                            .math-input-minimal.is-invalid {
                                border-color: #dc3545;
                                background: #fff5f5;
                                color: #000000 !important;
                            }

                            .security-help-minimal {
                                display: block;
                                margin-top: 6px;
                                font-size: 0.8rem;
                                color: #6c757d;
                            }

                            /* Responsive */
                            @media (max-width: 576px) {
                                .math-captcha-minimal .form-label {
                                    flex-direction: column;
                                    align-items: flex-start;
                                    gap: 8px;
                                }
                                
                                .math-input-minimal {
                                    margin-left: 0;
                                    margin-top: 4px;
                                }
                            }
                            </style>

                            <!-- Campos ocultos -->
                            <input type="hidden" name="productCode" value="${product.code}">
                            <input type="hidden" name="productName" value="${product.name}">
                            <input type="hidden" name="productCategory" value="${product.category}">
                            <input type="hidden" id="mathAnswer" name="mathAnswer" value="">
                            <input type="hidden" id="formStartTime" name="formStartTime" value="">
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="submitQuote()">
                            <i class="bi bi-send me-1"></i>Enviar Cotización
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remover modal anterior si existe
    const existingQuoteModal = document.getElementById('quoteModal');
    if (existingQuoteModal) {
        existingQuoteModal.remove();
    }

    // Agregar y mostrar nuevo modal
    document.body.insertAdjacentHTML('beforeend', quoteModalHTML);
    
    // Esperar un poco antes de abrir el nuevo modal para evitar conflictos
    setTimeout(() => {
        const quoteModal = new bootstrap.Modal(document.getElementById('quoteModal'));
        quoteModal.show();
        
        // Agregar validaciones en tiempo real
        setupQuoteFormValidation();
        
        // Generar CAPTCHA matemático y registrar tiempo de inicio
        generateMathCaptcha();
        document.getElementById('formStartTime').value = Date.now();
    }, 300);
}

// Configurar validaciones en tiempo real para el formulario de cotización
function setupQuoteFormValidation() {
    const nameInput = document.getElementById('quoteName');
    const emailInput = document.getElementById('quoteEmail');
    const phoneInput = document.getElementById('quotePhone');
    
    // Validación del nombre en tiempo real
    if (nameInput) {
        nameInput.addEventListener('input', function() {
            const value = this.value.trim();
            const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
            
            if (value.length === 0) {
                this.classList.remove('is-valid', 'is-invalid');
            } else if (value.length < 2 || !nameRegex.test(value)) {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            }
        });
    }
    
    // Validación del email en tiempo real
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const value = this.value.trim();
            const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            
            if (value.length === 0) {
                this.classList.remove('is-valid', 'is-invalid');
            } else if (!emailRegex.test(value)) {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            }
        });
    }
    
    // Validación del teléfono en tiempo real
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            const value = this.value.trim();
            const phoneRegex = /^(\+?52\s?)?(\(?[0-9]{2,3}\)?\s?)?[0-9]{3,4}[\s\-]?[0-9]{3,4}$|^\+?[1-9]\d{1,14}$/;
            const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
            
            if (value.length === 0) {
                this.classList.remove('is-valid', 'is-invalid');
            } else if (!phoneRegex.test(value) || cleanPhone.length < 10) {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            }
        });
        
        // Formatear automáticamente el teléfono mientras se escribe
        phoneInput.addEventListener('keyup', function() {
            let value = this.value.replace(/\D/g, ''); // Solo números
            
            // Formatear para México (+52)
            if (value.length >= 10 && value.startsWith('52') && value.length <= 12) {
                value = value.replace(/^52(\d{2})(\d{4})(\d{4})/, '+52 $1 $2 $3');
            } else if (value.length === 10) {
                value = value.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3');
            }
            
            if (this.value !== value) {
                this.value = value;
            }
        });
    }
}

// Generar CAPTCHA matemático
function generateMathCaptcha() {
    // Generar números aleatorios para operaciones simples
    const operations = ['+', '-', '×'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer;
    
    switch(operation) {
        case '+':
            num1 = Math.floor(Math.random() * 20) + 1; // 1-20
            num2 = Math.floor(Math.random() * 20) + 1; // 1-20
            answer = num1 + num2;
            break;
        case '-':
            num1 = Math.floor(Math.random() * 20) + 10; // 10-29
            num2 = Math.floor(Math.random() * 10) + 1;  // 1-10
            answer = num1 - num2;
            break;
        case '×':
            num1 = Math.floor(Math.random() * 10) + 1; // 1-10
            num2 = Math.floor(Math.random() * 10) + 1; // 1-10
            answer = num1 * num2;
            break;
    }
    
    // Mostrar la pregunta
    document.getElementById('mathQuestion').textContent = `${num1} ${operation} ${num2} = ?`;
    
    // Guardar la respuesta correcta
    document.getElementById('mathAnswer').value = answer;
    
    // Limpiar campo de respuesta
    document.getElementById('mathCaptcha').value = '';
    document.getElementById('mathCaptcha').classList.remove('is-valid', 'is-invalid');
    
    // Agregar validación en tiempo real al CAPTCHA
    const mathInput = document.getElementById('mathCaptcha');
    if (mathInput) {
        mathInput.addEventListener('input', function() {
            const userAnswer = this.value.trim();
            const correctAnswer = parseInt(document.getElementById('mathAnswer').value);
            
            if (userAnswer === '') {
                this.classList.remove('is-valid', 'is-invalid');
            } else {
                // Validate if input contains only numbers (including negative)
                const numericRegex = /^-?\d+$/;
                if (!numericRegex.test(userAnswer)) {
                    this.classList.remove('is-valid');
                    this.classList.add('is-invalid');
                } else {
                    const parsedAnswer = parseInt(userAnswer);
                    if (parsedAnswer === correctAnswer) {
                        this.classList.remove('is-invalid');
                        this.classList.add('is-valid');
                    } else {
                        this.classList.remove('is-valid');
                        this.classList.add('is-invalid');
                    }
                }
            }
        });
    }
}

// Validar medidas anti-robot
function validateAntiRobotMeasures(formData) {
    const honeypot = formData.get('website');
    const userAnswerText = formData.get('mathCaptcha').trim();
    const correctAnswer = parseInt(formData.get('mathAnswer'));
    const formStartTime = parseInt(formData.get('formStartTime'));
    const currentTime = Date.now();
    const timeSpent = (currentTime - formStartTime) / 1000; // en segundos
    
    // 1. Validar Honeypot - debe estar vacío
    if (honeypot && honeypot.trim() !== '') {
        console.warn('🤖 Posible bot detectado: Honeypot field filled');
        return {
            valid: false,
            reason: 'Validación de seguridad fallida. Por favor, intenta nuevamente.'
        };
    }
    
    // 2. Validar CAPTCHA matemático
    // Verificar que la respuesta sea un número válido
    const numericRegex = /^-?\d+$/;
    if (!numericRegex.test(userAnswerText)) {
        return {
            valid: false,
            reason: 'Por favor ingrese solo números en la operación matemática.'
        };
    }
    
    const userAnswer = parseInt(userAnswerText);
    if (isNaN(userAnswer) || userAnswer !== correctAnswer) {
        return {
            valid: false,
            reason: 'La respuesta de la operación matemática es incorrecta. Por favor, verifica y intenta nuevamente.'
        };
    }
    
    // 3. Validar tiempo mínimo (al menos 5 segundos para llenar el formulario)
    if (timeSpent < 5) {
        console.warn('🤖 Posible bot detectado: Form filled too quickly', timeSpent);
        return {
            valid: false,
            reason: 'Formulario enviado demasiado rápido. Por favor, tómate tu tiempo para completarlo.'
        };
    }
    
    // 4. Validar tiempo máximo (no más de 30 minutos)
    if (timeSpent > 1800) { // 30 minutos
        return {
            valid: false,
            reason: 'La sesión ha expirado. Por favor, recarga la página y vuelve a completar el formulario.'
        };
    }
    
    return {
        valid: true,
        reason: 'Validación exitosa'
    };
}

// Crear galería de imágenes para el modal
function createImageGallery(product) {
    // Si el producto tiene sistema de imágenes múltiples
    if (product.images && product.images.gallery && product.images.gallery.length > 0) {
        const mainImage = product.images.main || product.images.gallery[0].url;
        const thumbnails = product.images.gallery.map((img, index) => `
            <div class="col-3 mb-2">
                <img src="${img.url}" 
                     alt="${img.alt || product.name}" 
                     class="img-thumbnail gallery-thumbnail ${index === 0 ? 'active' : ''}"
                     style="cursor: pointer; width: 100%; height: 80px; object-fit: contain; background-color: #f8f9fa;"
                     onclick="changeMainImage('${img.url}', '${img.alt || product.name}')"
                     onerror="this.style.display='none';">
            </div>
        `).join('');
        
        return `
            <div class="image-gallery mb-3">
                <div class="main-image-container mb-3">
                    <img id="mainGalleryImage" 
                         src="${mainImage}" 
                         alt="${product.name}" 
                         class="img-fluid rounded"
                         style="width: 100%; height: auto; max-height: 400px; object-fit: contain; background-color: #ffffff;"
                         onerror="this.style.display='none'; document.getElementById('fallbackIcon').style.display='flex';">
                    <div id="fallbackIcon" class="product-image category-${product.category}" 
                         style="height: 300px; display: none;">
                        <i class="bi-cpu" style="font-size: 5rem;"></i>
                    </div>
                </div>
                <div class="thumbnails-container">
                    <div class="row g-1">
                        ${thumbnails}
                    </div>
                </div>
            </div>
        `;
    }
    // Si solo tiene imagen principal
    else if (product.images && product.images.main) {
        return `
            <div class="single-image mb-3">
                <img src="${product.images.main}" 
                     alt="${product.name}" 
                     class="img-fluid rounded"
                     style="width: 100%; height: 300px; object-fit: cover;"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="product-image category-${product.category}" 
                     style="height: 300px; display: none;">
                    <i class="bi-cpu" style="font-size: 5rem;"></i>
                </div>
            </div>
        `;
    }
    // Fallback al icono por defecto bi-cpu cuando no hay imágenes
    else {
        return `
            <div class="product-image category-${product.category} mb-3" style="height: 300px;">
                <i class="bi-cpu" style="font-size: 5rem;"></i>
            </div>
        `;
    }
}

// Cambiar imagen principal en la galería
function changeMainImage(imageUrl, altText) {
    const mainImage = document.getElementById('mainGalleryImage');
    if (mainImage) {
        mainImage.src = imageUrl;
        mainImage.alt = altText;
        
        // Actualizar thumbnails activos
        document.querySelectorAll('.gallery-thumbnail').forEach(thumb => {
            thumb.classList.remove('active');
        });
        event.target.classList.add('active');
    }
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
    
    // Crear galería de imágenes para el modal
    const imageGalleryHtml = createImageGallery(product);
    
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
                                ${imageGalleryHtml}
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
                        <button type="button" class="btn btn-success" onclick="quoteViaWhatsApp('${product.code}')">
                            <i class="bi bi-whatsapp me-1"></i>WhatsApp
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

// Función para mostrar alertas de Bootstrap
function showBootstrapAlert(message, type = 'success', duration = 5000) {
    // Tipos: 'success', 'danger', 'warning', 'info'
    const alertId = 'alert-' + Date.now();
    const alertHTML = `
        <div class="alert alert-${type} alert-dismissible fade show position-fixed" 
             id="${alertId}"
             style="top: 20px; right: 20px; z-index: 9999; min-width: 350px; max-width: 500px;">
            <div class="d-flex align-items-center">
                <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 
                              type === 'danger' ? 'bi-exclamation-triangle-fill' : 
                              type === 'warning' ? 'bi-exclamation-circle-fill' : 
                              'bi-info-circle-fill'} me-2"></i>
                <span>${message}</span>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // Agregar alerta al body
    document.body.insertAdjacentHTML('beforeend', alertHTML);
    
    // Auto-desvanecimiento
    setTimeout(() => {
        const alertElement = document.getElementById(alertId);
        if (alertElement) {
            const bsAlert = new bootstrap.Alert(alertElement);
            bsAlert.close();
        }
    }, duration);
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

// Función para enviar cotización
function submitQuote() {
    const form = document.getElementById('quoteForm');
    const formData = new FormData(form);
    
    // Validar campos requeridos
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const phone = formData.get('phone').trim();
    
    if (!name || !email || !phone) {
        showBootstrapAlert('Por favor complete todos los campos obligatorios marcados con *', 'warning', 4000);
        return;
    }
    
    // Validar medidas anti-robot PRIMERO
    const antiRobotValidation = validateAntiRobotMeasures(formData);
    if (!antiRobotValidation.valid) {
        showBootstrapAlert(antiRobotValidation.reason, 'danger', 6000);
        
        // Si es error de CAPTCHA, generar uno nuevo
        if (antiRobotValidation.reason.includes('operación matemática')) {
            setTimeout(() => {
                generateMathCaptcha();
                showBootstrapAlert('Se ha generado una nueva operación matemática. Por favor, resuélvela.', 'info', 4000);
            }, 1000);
        }
        return;
    }
    
    // Validar formato de email más estricto
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
        showBootstrapAlert('Por favor ingrese un correo electrónico válido (ejemplo: usuario@dominio.com)', 'warning', 5000);
        return;
    }
    
    // Validar formato de teléfono (México: +52, 10 dígitos, o formatos internacionales)
    const phoneRegex = /^(\+?52\s?)?(\(?[0-9]{2,3}\)?\s?)?[0-9]{3,4}[\s\-]?[0-9]{3,4}$|^\+?[1-9]\d{1,14}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, ''); // Limpiar espacios, guiones y paréntesis
    
    if (!phoneRegex.test(phone) || cleanPhone.length < 10) {
        showBootstrapAlert('Por favor ingrese un número de teléfono válido (ejemplo: +52 55 1234 5678 o 5512345678)', 'warning', 5000);
        return;
    }
    
    // Validar longitud mínima del nombre
    if (name.length < 2) {
        showBootstrapAlert('El nombre debe tener al menos 2 caracteres', 'warning', 4000);
        return;
    }
    
    // Validar que el nombre no contenga solo números
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    if (!nameRegex.test(name)) {
        showBootstrapAlert('El nombre solo debe contener letras y espacios', 'warning', 4000);
        return;
    }
    
    // Preparar datos para HubSpot
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const hubspotData = {
        "fields": [
            {
                "name": "firstname",
                "value": firstName
            },
            {
                "name": "lastname", 
                "value": lastName
            },
            {
                "name": "email",
                "value": email
            },
            {
                "name": "phone",
                "value": phone
            },
            {
                "name": "company",
                "value": formData.get('company') || 'No especificada'
            },
            {
                "name": "producto_solicitado",
                "value": formData.get('productName')
            },
            {
                "name": "codigo_producto",
                "value": formData.get('productCode')
            },
            {
                "name": "cantidad_solicitada",
                "value": parseInt(formData.get('quantity')) || 1
            },
            {
                "name": "categoria_producto",
                "value": formData.get('productCategory') || 'No especificada'
            },
            {
                "name": "fuente_lead",
                "value": "Catálogo Web - Cotización Validada"
            },
            {
                "name": "message",
                "value": formData.get('message') || ''
            }
        ],
        "context": {
            "pageUri": window.location.href,
            "pageName": "Catálogo de Productos"
        }
    };
    
    // CONFIGURACIÓN HUBSPOT - IDs REALES DE BIMEG
    const HUBSPOT_PORTAL_ID = "50431135";
    const HUBSPOT_FORM_ID = "fb69ed57-fc12-40db-b754-2d60f1efaf62";
    
    // Enviar a HubSpot
    const hubspotUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`;
    
    // Mostrar loading
    const submitBtn = document.querySelector('#quoteModal .btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="bi bi-clock me-1"></i>Enviando...';
    submitBtn.disabled = true;
    
    fetch(hubspotUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(hubspotData)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Error en HubSpot');
    })
    .then(data => {
        console.log('✅ Lead enviado a HubSpot exitosamente:', data);
        
        // Cerrar modal
        const quoteModal = bootstrap.Modal.getInstance(document.getElementById('quoteModal'));
        quoteModal.hide();
        
        // Mostrar confirmación con Bootstrap alert
        setTimeout(() => {
            showBootstrapAlert(
                '¡Cotización enviada exitosamente! 📧 Se ha registrado en nuestro CRM. Pronto nos pondremos en contacto contigo.',
                'success',
                6000
            );
        }, 500);
        
    })
    .catch(error => {
        console.error('❌ Error enviando a HubSpot:', error);
        
        // Cerrar modal
        const quoteModal = bootstrap.Modal.getInstance(document.getElementById('quoteModal'));
        quoteModal.hide();
        
        // Mostrar error con Bootstrap alert
        setTimeout(() => {
            showBootstrapAlert(
                '⚠️ Hubo un problema al enviar la cotización. Por favor, intenta nuevamente o contáctanos directamente.',
                'danger',
                6000
            );
        }, 500);
        
    })
    .finally(() => {
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

// Función para cotizar vía WhatsApp
function quoteViaWhatsApp(productCode) {
    // Encontrar el producto por código
    const product = productsData.find(p => p.code === productCode);
    if (!product) {
        console.error('Producto no encontrado:', productCode);
        showBootstrapAlert('Error: Producto no encontrado', 'danger', 4000);
        return;
    }

    // Crear mensaje de WhatsApp con información del producto
    const whatsappMessage = createWhatsAppProductMessage(product);
    
    // Crear URL de WhatsApp
    const whatsappUrl = `https://wa.me/524381092435?text=${encodeURIComponent(whatsappMessage)}`;
    
    // Mostrar confirmación
    showBootstrapAlert(
        '📱 Redirigiendo a WhatsApp para cotización instantánea...',
        'info',
        3000
    );
    
    // Cerrar modal si está abierto
    const productModal = document.getElementById('productModal');
    if (productModal) {
        const modal = bootstrap.Modal.getInstance(productModal);
        if (modal) {
            modal.hide();
        }
    }
    
    // Abrir WhatsApp en nueva ventana después de un breve delay
    setTimeout(() => {
        window.open(whatsappUrl, '_blank');
    }, 1000);
}

// Función para crear mensaje de WhatsApp con datos del producto
function createWhatsAppProductMessage(product) {
    let message = "🏥 *SOLICITUD DE COTIZACIÓN - BIMEG*\n\n";
    message += "📋 *Información del Producto:*\n";
    message += `🔸 *Nombre:* ${product.name}\n`;
    message += `🔸 *Código:* ${product.code}\n`;
    message += `🔸 *Marca:* ${product.brand.charAt(0).toUpperCase() + product.brand.slice(1)}\n`;
    message += `🔸 *Categoría:* ${product.category.replace('-', ' ').charAt(0).toUpperCase() + product.category.replace('-', ' ').slice(1)}\n`;
    
    // Agregar estado de stock
    if (product.stock && product.stock.available) {
        message += `🔸 *Disponibilidad:* ✅ En Stock\n`;
    } else {
        message += `🔸 *Disponibilidad:* ⏰ Consultar\n`;
    }
    
    // Agregar descripción si existe
    if (product.shortDescription) {
        message += `🔸 *Descripción:* ${product.shortDescription}\n`;
    }
    
    // Agregar especificaciones principales si existen
    if (product.specifications && Object.keys(product.specifications).length > 0) {
        message += "\n🔧 *Especificaciones Principales:*\n";
        Object.entries(product.specifications).slice(0, 3).forEach(([key, value]) => {
            message += `   • ${key}: ${value}\n`;
        });
    }
    
    // Agregar compatibilidad si existe
    if (product.compatibility && product.compatibility.length > 0) {
        message += "\n🔗 *Compatible con:*\n";
        product.compatibility.slice(0, 3).forEach(item => {
            message += `   • ${item}\n`;
        });
    }
    
    message += "\n💬 *Mensaje:*\n";
    message += "Hola, estoy interesado en cotizar este producto. Por favor, envíenme información sobre:\n";
    message += "• Precio y disponibilidad\n";
    message += "• Tiempo de entrega\n";
    message += "• Garantía\n";
    message += "• Opciones de instalación\n\n";
    
    message += "✅ *Solicitud enviada desde:* Catálogo Web BIMEG";
    
    return message;
}

// Función para analizar analytics de botones WhatsApp (opcional)
function trackWhatsAppClick(productCode) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', 'click', {
            'event_category': 'WhatsApp',
            'event_label': `Product: ${productCode}`,
            'value': 1
        });
    }
    
    // Log para debugging
    console.log('📱 WhatsApp button clicked for product:', productCode);
}
