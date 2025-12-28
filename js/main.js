// Funciones JavaScript principales comunes

// Navegación entre páginas
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
});

function initNavigation() {
    // Iconos de navegación en el header
    const headerIcons = document.querySelectorAll('.header-icon');
    
    headerIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const iconType = this.getAttribute('data-page');
            if (iconType) {
                navigateToPage(iconType);
            }
        });
    });
    
    // Iconos de navegación en el footer
    const footerIcons = document.querySelectorAll('.footer-icon');
    
    footerIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const iconType = this.getAttribute('data-page');
            if (iconType) {
                navigateToPage(iconType);
            }
        });
    });
    
    // Botón del footer - navegar según la página actual
    const footerButton = document.querySelector('.footer-button');
    if (footerButton) {
        footerButton.addEventListener('click', function() {
            // Determinar la página actual basándose en el icono activo
            const activeIcon = document.querySelector('.footer-icon.active');
            if (activeIcon) {
                const page = activeIcon.getAttribute('data-page');
                if (page) {
                    navigateToPage(page);
                }
            }
        });
    }
}

function navigateToPage(page) {
    const pages = {
        'proyecto': 'index.html',
        'bitacora': 'cuaderno-bitacora.html',
        'equipo': 'equipo.html'
    };
    
    if (pages[page]) {
        window.location.href = pages[page];
    }
}

// Función para actualizar el botón activo del header
function setActiveButton(buttonText) {
    const buttons = document.querySelectorAll('.header-button');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.trim() === buttonText) {
            btn.classList.add('active');
        }
    });
}

