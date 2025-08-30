// Main JavaScript for Biomec Website

// Generate CAPTCHA for contact form (Global function)
function generateContactMathCaptcha() {
    const operations = ['+', '-', '×'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer;
    
    switch(operation) {
        case '+':
            num1 = Math.floor(Math.random() * 20) + 1;
            num2 = Math.floor(Math.random() * 20) + 1;
            answer = num1 + num2;
            break;
        case '-':
            num1 = Math.floor(Math.random() * 20) + 10;
            num2 = Math.floor(Math.random() * 10) + 1;
            answer = num1 - num2;
            break;
        case '×':
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            answer = num1 * num2;
            break;
    }
    
    const mathQuestionElement = document.getElementById('contactMathQuestion');
    const mathAnswerElement = document.getElementById('contactMathAnswer');
    const mathInputElement = document.getElementById('contactMathCaptcha');
    
    if (mathQuestionElement && mathAnswerElement && mathInputElement) {
        mathQuestionElement.textContent = `${num1} ${operation} ${num2} = ?`;
        mathAnswerElement.value = answer;
        mathInputElement.value = '';
        mathInputElement.classList.remove('is-valid', 'is-invalid');
        
        // Add real-time validation to CAPTCHA
        mathInputElement.removeEventListener('input', mathInputValidation);
        mathInputElement.addEventListener('input', mathInputValidation);
    }
}

// Math input validation function (separate for reusability)
function mathInputValidation() {
    const userAnswer = this.value.trim();
    const correctAnswer = parseInt(document.getElementById('contactMathAnswer').value);
    
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
}

// Setup real-time validation for contact form (Global function)
function setupContactFormValidation() {
    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const phoneInput = document.getElementById('contactPhone');
    const requestTypeInput = document.getElementById('contactRequestType');
    const messageInput = document.getElementById('contactMessage');
    
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

    // Validación del tipo de solicitud
    if (requestTypeInput) {
        requestTypeInput.addEventListener('change', function() {
            if (this.value) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            } else {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
            }
        });
    }

    // Validación del mensaje
    if (messageInput) {
        messageInput.addEventListener('input', function() {
            const value = this.value.trim();
            if (value.length === 0) {
                this.classList.remove('is-valid', 'is-invalid');
            } else if (value.length < 5) {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar background change on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(28, 55, 87, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.backgroundColor = 'rgba(28, 55, 87, 1)';
            navbar.style.backdropFilter = 'none';
        }
    });

    // Active navigation link highlighting
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-link');

    function highlightNavigation() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', highlightNavigation);

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Add fade-in class to elements that should animate
    const animateElements = document.querySelectorAll('.service-card, .product-card, .about-stats');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // Contact form handling with HubSpot integration
    const contactForm = document.querySelector('#contactForm');
    if (contactForm) {
        // Setup form validation and CAPTCHA when form loads
        setupContactFormValidation();
        generateContactMathCaptcha();
        document.getElementById('contactFormStartTime').value = Date.now();

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitContactForm();
        });
    }

    // Validate anti-robot measures for contact form
    function validateContactAntiRobotMeasures(formData) {
        const honeypot = formData.get('website');
        const userAnswerText = formData.get('mathCaptcha').trim();
        const correctAnswer = parseInt(formData.get('mathAnswer'));
        const formStartTime = parseInt(formData.get('formStartTime'));
        const currentTime = Date.now();
        const timeSpent = (currentTime - formStartTime) / 1000;
        
        // 1. Validar Honeypot
        if (honeypot && honeypot.trim() !== '') {
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
        
        // 3. Validar tiempo mínimo
        if (timeSpent < 5) {
            return {
                valid: false,
                reason: 'Formulario enviado demasiado rápido. Por favor, tómate tu tiempo para completarlo.'
            };
        }
        
        // 4. Validar tiempo máximo
        if (timeSpent > 1800) {
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

    // Submit contact form to HubSpot
    function submitContactForm() {
        const form = document.getElementById('contactForm');
        const formData = new FormData(form);
        
        // Get form values
        const name = formData.get('name').trim();
        const email = formData.get('email').trim();
        const phone = formData.get('phone').trim();
        const requestType = formData.get('requestType');
        const message = formData.get('message').trim();
        
        // Validate required fields
        if (!name || !email || !phone || !requestType || !message) {
            showBootstrapAlert('Por favor complete todos los campos obligatorios marcados con *', 'warning', 4000);
            return;
        }
        
        // Validate anti-robot measures FIRST
        const antiRobotValidation = validateContactAntiRobotMeasures(formData);
        if (!antiRobotValidation.valid) {
            showBootstrapAlert(antiRobotValidation.reason, 'danger', 6000);
            
            if (antiRobotValidation.reason.includes('operación matemática')) {
                setTimeout(() => {
                    generateContactMathCaptcha();
                    showBootstrapAlert('Se ha generado una nueva operación matemática. Por favor, resuélvela.', 'info', 4000);
                }, 1000);
            }
            return;
        }
        
        // Validate email format
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(email)) {
            showBootstrapAlert('Por favor ingrese un correo electrónico válido', 'warning', 5000);
            return;
        }
        
        // Validate phone format
        const phoneRegex = /^(\+?52\s?)?(\(?[0-9]{2,3}\)?\s?)?[0-9]{3,4}[\s\-]?[0-9]{3,4}$|^\+?[1-9]\d{1,14}$/;
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        
        if (!phoneRegex.test(phone) || cleanPhone.length < 10) {
            showBootstrapAlert('Por favor ingrese un número de teléfono válido', 'warning', 5000);
            return;
        }
        
        // Validate name
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
        if (name.length < 2 || !nameRegex.test(name)) {
            showBootstrapAlert('El nombre debe tener al menos 2 caracteres y solo contener letras', 'warning', 4000);
            return;
        }
        
        // Prepare data for HubSpot
        const nameParts = name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Map request type to Spanish
        const requestTypeMap = {
            'cotizacion': 'Cotización de refacciones',
            'servicio': 'Servicio técnico',
            'garantia': 'Consulta de garantía',
            'catalogo': 'Solicitar catálogo'
        };
        
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
                    "name": "tipo_solicitud",
                    "value": requestTypeMap[requestType] || requestType
                },
                {
                    "name": "equipo_marca_modelo",
                    "value": formData.get('equipment') || 'No especificado'
                },
                {
                    "name": "fuente_lead",
                    "value": "Web Principal - Consulta General"
                },
                {
                    "name": "message",
                    "value": message
                }
            ],
            "context": {
                "pageUri": window.location.href,
                "pageName": "Página Principal - Contacto"
            }
        };
        
        // HubSpot configuration
        const HUBSPOT_PORTAL_ID = "50431135";
        const HUBSPOT_FORM_ID = "fb69ed57-fc12-40db-b754-2d60f1efaf62";
        const hubspotUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`;
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="bi bi-clock me-1"></i>Enviando...';
        submitBtn.disabled = true;
        
        // Send to HubSpot
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
            
            // Reset form
            form.reset();
            form.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
                el.classList.remove('is-valid', 'is-invalid');
            });
            
            // Generate new CAPTCHA and reset timer
            generateContactMathCaptcha();
            document.getElementById('contactFormStartTime').value = Date.now();
            
            // Show success message
            showBootstrapAlert(
                '¡Mensaje enviado exitosamente! 📧 Se ha registrado en nuestro CRM. Pronto nos pondremos en contacto contigo.',
                'success',
                6000
            );
            
        })
        .catch(error => {
            console.error('❌ Error enviando a HubSpot:', error);
            
            showBootstrapAlert(
                '⚠️ Hubo un problema al enviar el mensaje. Por favor, intenta nuevamente o contáctanos directamente.',
                'danger',
                6000
            );
            
        })
        .finally(() => {
            // Restore button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
    }

    // Enhanced Bootstrap alert function
    function showBootstrapAlert(message, type = 'success', duration = 5000) {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.custom-bootstrap-alert');
        existingAlerts.forEach(alert => alert.remove());
        
        const alertId = 'alert-' + Date.now();
        const alertHTML = `
            <div class="alert alert-${type} alert-dismissible fade show position-fixed custom-bootstrap-alert" 
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
        
        // Add alert to body
        document.body.insertAdjacentHTML('beforeend', alertHTML);
        
        // Auto-dismiss
        setTimeout(() => {
            const alertElement = document.getElementById(alertId);
            if (alertElement) {
                const bsAlert = new bootstrap.Alert(alertElement);
                bsAlert.close();
            }
        }, duration);
    }

    // Email validation function (kept for compatibility)
    function isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return emailRegex.test(email);
    }

    // Legacy show alert function (kept for compatibility)
    function showAlert(message, type) {
        showBootstrapAlert(message, type, 5000);
    }

    // Service card click handlers
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('.card-title').textContent;
            showAlert(`Información sobre ${title} - Próximamente disponible.`, 'info');
        });
    });

    // Add loading animation to page
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });

    // Parallax effect for hero section
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroSection.style.transform = `translateY(${rate}px)`;
        });
    }

    // Initialize tooltips if Bootstrap tooltips are needed
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple 0.6s linear;
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add CSS for ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        .loaded {
            opacity: 1;
        }
        
        body:not(.loaded) {
            opacity: 0;
            transition: opacity 0.3s ease;
        }
    `;
    document.head.appendChild(style);

    console.log('Biomec website initialized successfully!');
});

// Additional utility functions
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add scroll to top functionality (can be called from anywhere)
window.biomecUtils = {
    scrollToTop: scrollToTop,
    showAlert: function(message, type = 'info') {
        // Implementation would be similar to the showAlert function above
        console.log(`Alert: ${message} (${type})`);
    }
};
