// Landing Page JavaScript for BIMEG

document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            // Close mobile menu if open
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                const navbarToggler = document.querySelector('.navbar-toggler');
                navbarToggler.click();
            }
            
            if (target) {
                // Adjust offset based on screen size
                const offsetTop = window.innerWidth < 768 ? target.offsetTop - 60 : target.offsetTop - 80;
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
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        } else {
            navbar.style.backgroundColor = 'rgba(28, 55, 87, 1)';
            navbar.style.backdropFilter = 'none';
            navbar.style.boxShadow = 'none';
        }
    });
    
    // Optimize animations for mobile - reduce animations on small screens
    function checkForReducedMotion() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 576) {
            document.documentElement.classList.add('reduced-motion');
        } else {
            document.documentElement.classList.remove('reduced-motion');
        }
    }
    
    // Check on load and on resize
    checkForReducedMotion();
    window.addEventListener('resize', checkForReducedMotion);

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.product-card-landing, .benefit-item, .stat-item');
    animateElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });

    // Counter animation for stats
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start) + '+';
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target + '+';
            }
        }
        updateCounter();
    }

    // Stats counter observer
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target.querySelector('h3');
                const targetValue = parseInt(statNumber.textContent);
                animateCounter(statNumber, targetValue);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-item').forEach(stat => {
        statsObserver.observe(stat);
    });

    // Form handling
    const cotizacionForm = document.getElementById('cotizacionForm');
    if (cotizacionForm) {
        cotizacionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Validate required fields
            const requiredFields = ['nombre', 'telefono', 'email', 'refacciones'];
            let hasErrors = false;
            
            requiredFields.forEach(field => {
                const input = document.getElementById(field);
                if (!input.value.trim()) {
                    input.classList.add('is-invalid');
                    hasErrors = true;
                } else {
                    input.classList.remove('is-invalid');
                }
            });
            
            // Validate email format
            const emailField = document.getElementById('email');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailField.value && !emailRegex.test(emailField.value)) {
                emailField.classList.add('is-invalid');
                hasErrors = true;
            }
            
            if (hasErrors) {
                showAlert('Por favor, completa todos los campos requeridos correctamente.', 'danger');
                return;
            }
            
            // Create WhatsApp message
            const whatsappMessage = createWhatsAppMessage(data);
            
            // Show success message
            showAlert('¡Formulario completado! Te redirigiremos a WhatsApp para enviar tu cotización.', 'success');
            
            // Redirect to WhatsApp after 2 seconds
            setTimeout(() => {
                window.open(`https://wa.me/5214381092435?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
            }, 2000);
            
            // Reset form
            this.reset();
        });
    }

    // Create WhatsApp message from form data
    function createWhatsAppMessage(data) {
        let message = "🏥 *SOLICITUD DE COTIZACIÓN - REFACCIONES ANESTESIA*\n\n";
        message += `👤 *Cliente:* ${data.nombre}\n`;
        message += `📱 *Teléfono:* ${data.telefono}\n`;
        message += `📧 *Email:* ${data.email}\n`;
        
        if (data.hospital) {
            message += `🏥 *Hospital/Clínica:* ${data.hospital}\n`;
        }
        
        if (data.marca) {
            message += `🔧 *Marca del Equipo:* ${data.marca}\n`;
        }
        
        if (data.modelo) {
            message += `📋 *Modelo:* ${data.modelo}\n`;
        }
        
        message += `\n🛠️ *REFACCIONES NECESARIAS:*\n${data.refacciones}\n`;
        
        if (data.urgencia) {
            const urgenciaTexto = {
                'normal': 'Normal (3-5 días)',
                'urgente': 'Urgente (24-48 horas)',
                'emergencia': 'Emergencia (mismo día)'
            };
            message += `\n⚡ *Urgencia:* ${urgenciaTexto[data.urgencia]}\n`;
        }
        
        if (data.instalacion) {
            const instalacionTexto = {
                'no': 'No requiere instalación',
                'si': 'Incluir servicio de instalación',
                'consulta': 'Necesita consultoría técnica'
            };
            message += `🔧 *Instalación:* ${instalacionTexto[data.instalacion]}\n`;
        }
        
        message += "\n✅ *Solicitud enviada desde: Landing Máquinas de Anestesia*";
        
        return message;
    }

    // Show alert function
    function showAlert(message, type) {
        // Remove existing alerts
        const existingAlert = document.querySelector('.custom-alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // Create new alert
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show custom-alert position-fixed`;
        alert.style.cssText = 'top: 100px; right: 20px; z-index: 9999; max-width: 400px;';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alert);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alert && alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    // Parallax effect for hero section
    const heroSection = document.querySelector('.hero-landing');
    if (heroSection) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.3;
            heroSection.style.transform = `translateY(${rate}px)`;
        });
    }

    // Add loading animation to page
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
        
        // Start floating animations
        const floatingCards = document.querySelectorAll('.floating-card');
        floatingCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.5}s`;
        });
    });

    // WhatsApp floating button functionality (if needed)
    const whatsappButtons = document.querySelectorAll('a[href*="wa.me"]');
    whatsappButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add click tracking if needed
            console.log('WhatsApp button clicked');
        });
    });

    // Phone number formatting
    const phoneInput = document.getElementById('telefono');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value.length <= 3) {
                    value = value;
                } else if (value.length <= 6) {
                    value = value.slice(0, 3) + ' ' + value.slice(3);
                } else if (value.length <= 10) {
                    value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6);
                } else {
                    value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6, 10);
                }
            }
            e.target.value = value;
        });
    }

    // Form field validation on blur
    const formInputs = document.querySelectorAll('#cotizacionForm input, #cotizacionForm textarea, #cotizacionForm select');
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
            }
        });

        input.addEventListener('input', function() {
            this.classList.remove('is-invalid');
        });
    });

    // Initialize tooltips if Bootstrap tooltips are needed
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

});
