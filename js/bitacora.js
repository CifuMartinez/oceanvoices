// Funciones JavaScript específicas para Cuaderno de Bitácora

document.addEventListener('DOMContentLoaded', function() {
    initBitacora();
    initFooterScroll();
    setActiveButton('CUADERNO DE BITÁCORA');
});

// Controlar visibilidad del footer según dirección del scroll
function initFooterScroll() {
    const footer = document.querySelector('.footer');
    if (!footer) return;

    let lastScrollTop = 0;
    let ticking = false;

    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Solo mostrar footer cuando estamos exactamente en top 0
        if (scrollTop === 0) {
            footer.classList.remove('hidden');
        } else if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down - ocultar footer
            footer.classList.add('hidden');
        }
        // No mostrar cuando se hace scroll hacia arriba, solo cuando llegue a top 0

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        ticking = false;
    }

    // Asegurar que el footer esté visible al inicio
    footer.classList.remove('hidden');

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(handleScroll);
            ticking = true;
        }
    }, { passive: true });
}

// Datos de ejemplo (pueden reemplazarse por datos reales)
const bitacoraEntries = [
    {
        id: 1,
        title: 'Un día con ballenas después de un viaje largo a las profundidades del oceano',
        subtitle: '01 Diciembre de 2025',
        cover: 'images/Bitacora/Day01_Portrait.jpg',
        thumb: 'images/Bitacora/Day01_Portrait.jpg',
        body: [
            { type: 'p', text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.' },
            { type: 'quote', text: '“Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna.”' },
            { type: 'img', src: 'https://placehold.co/800x500?text=Mar+1', alt: 'Mar 1' },
            { type: 'p', text: 'Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan.' },
            { type: 'img', src: 'https://placehold.co/800x600?text=Ballenas', alt: 'Ballenas' }
        ]
    },
    {
        id: 2,
        title: 'Los delfines nos acompañan en el camino de regreso',
        subtitle: '02 Diciembre de 2025',
        cover: 'images/Bitacora/Day02_Portrait.jpg',
        thumb: 'images/Bitacora/Day02_Portrait.jpg',
        body: [
            { type: 'p', text: 'Relato breve de nuestra navegación junto a delfines. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl.' },
            { type: 'img', src: 'https://placehold.co/800x500?text=Delfines', alt: 'Delfines' },
            { type: 'quote', text: '“Un atardecer de sueño en medio del mar.”' },
            { type: 'p', text: 'Continuamos la travesía observando el comportamiento de las especies y registrando cada momento.' }
        ]
    },
    {
        id: 3,
        title: 'Encuentro con tiburones',
        subtitle: '05 Diciembre de 2025',
        cover: 'images/Bitacora/Day03_Portrait.jpg',
        thumb: 'images/Bitacora/Day03_Portrait.jpg',
        body: [
            { type: 'p', text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Observamos tiburones y registramos su comportamiento.' },
            { type: 'img', src: 'https://placehold.co/800x500?text=Tiburones', alt: 'Tiburones' },
            { type: 'p', text: 'Más texto descriptivo del encuentro, condiciones del mar y registro visual.' }
        ]
    }
];

function initBitacora() {
    const mainCard = document.getElementById('main-card');
    const mainImage = document.getElementById('main-image');
    const mainTitle = document.getElementById('main-title');
    const mainSubtitle = document.getElementById('main-subtitle');
    const thumbnailGallery = document.getElementById('thumbnail-gallery');
    const gallerySection = document.getElementById('bitacora-gallery');
    const articleSections = document.querySelectorAll('.bitacora-article');

    let activeIndex = 0;

    // Renderizar thumbnails del slider
    function renderThumbnails() {
        if (!thumbnailGallery) return;
        thumbnailGallery.innerHTML = '';
        bitacoraEntries.forEach((entry, index) => {
            const thumb = document.createElement('div');
            thumb.className = `thumbnail-item ${index === activeIndex ? 'active' : ''}`;
            thumb.dataset.index = index.toString();
            thumb.innerHTML = `<img src="${entry.thumb}" alt="${entry.title}">`;
            thumb.addEventListener('click', () => {
                activeIndex = parseInt(thumb.dataset.index);
                updateMain();
                showArticle(activeIndex);
            });
            thumbnailGallery.appendChild(thumb);
        });
    }

    // Actualizar la imagen principal y captions del slider
    function updateMain() {
        const entry = bitacoraEntries[activeIndex];
        if (mainImage) mainImage.src = entry.cover;
        if (mainTitle) mainTitle.textContent = entry.title;
        if (mainSubtitle) mainSubtitle.textContent = entry.subtitle;

        // Actualizar thumbnail activo
        const thumbs = document.querySelectorAll('.thumbnail-item');
        thumbs.forEach(t => t.classList.remove('active'));
        const activeThumb = document.querySelector(`.thumbnail-item[data-index="${activeIndex}"]`);
        if (activeThumb) activeThumb.classList.add('active');
    }

    // Mostrar artículo específico y ocultar el resto
    function showArticle(index) {
        articleSections.forEach((section, i) => {
            if (i === index) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });
    }

    // Volver a la galería (ocultar todos los artículos)
    function showGallery() {
        articleSections.forEach(section => {
            section.classList.add('hidden');
        });
    }

    // Navegación entre artículos
    function navigateArticle(direction) {
        if (direction === 'prev') {
            activeIndex = (activeIndex - 1 + bitacoraEntries.length) % bitacoraEntries.length;
        } else if (direction === 'next') {
            activeIndex = (activeIndex + 1) % bitacoraEntries.length;
        }
        updateMain();
        showArticle(activeIndex);
    }

    // Event listeners
    if (mainCard) {
        mainCard.addEventListener('click', () => {
            showArticle(activeIndex);
        });
    }

    // Inicializar
    renderThumbnails();
    updateMain();
    
    // En desktop, mostrar el primer artículo automáticamente
    if (window.innerWidth >= 769) {
        showArticle(0);
    }
}

