// Funciones JavaScript específicas para Cuaderno de Bitácora

// Bloquear scroll inicialmente
document.body.style.overflow = 'hidden';

// Función para animar la entrada de la pantalla de carga
function animateLoadingScreenEntry() {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingVideo = loadingScreen?.querySelector('.loading-video');
    
    if (loadingScreen && loadingVideo) {
        // Verificar si el video puede cargarse
        loadingVideo.addEventListener('error', (e) => {
            console.error('Error al cargar el video de carga:', e);
            loadingVideo.load();
        }, { once: true });
        
        // Esperar a que el video tenga datos cargados antes de reproducir
        const tryPlay = () => {
            if (loadingVideo.readyState >= 2) {
                loadingVideo.play().catch(err => {
                    console.log('Error al reproducir video de carga:', err);
                });
            } else {
                loadingVideo.addEventListener('loadeddata', () => {
                    loadingVideo.play().catch(err => {
                        console.log('Error al reproducir video de carga:', err);
                    });
                }, { once: true });
            }
        };
        
        tryPlay();
        
        // Animación de entrada suave
        gsap.set(loadingScreen, { opacity: 0, scale: 0.95 });
        gsap.set(loadingVideo, { opacity: 0, scale: 0.8 });
        
        gsap.to(loadingScreen, {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'power2.out'
        });
        
        gsap.to(loadingVideo, {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'power2.out',
            delay: 0.1
        });
    }
}

// Función para ocultar la pantalla de carga con animación suave
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingVideo = loadingScreen?.querySelector('.loading-video');
    
    if (loadingScreen && loadingVideo) {
        // Pausar el video antes de ocultar
        loadingVideo.pause();
        
        // Marcar el body como cargado para mostrar el contenido
        document.body.classList.add('loaded');
        
        // Animación de salida suave
        gsap.to(loadingVideo, {
            opacity: 0,
            scale: 0.8,
            duration: 0.5,
            ease: 'power2.in'
        });
        
        gsap.to(loadingScreen, {
            opacity: 0,
            scale: 1.05,
            duration: 0.8,
            ease: 'power2.in',
            delay: 0.2,
            onComplete: () => {
                loadingScreen.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }
}

// Verificar si el contenido está en caché
function isContentCached() {
    // Verificar si las imágenes principales ya están cargadas
    const images = document.querySelectorAll('img');
    let allImagesCached = true;
    images.forEach(img => {
        if (!img.complete) {
            allImagesCached = false;
        }
    });
    
    // Verificar si los videos ya tienen datos
    const videos = document.querySelectorAll('video');
    let allVideosCached = true;
    videos.forEach(video => {
        if (video.readyState < 2) {
            allVideosCached = false;
        }
    });
    
    // Verificar si el documento ya está completamente cargado
    const documentReady = document.readyState === 'complete';
    
    // Si todo está cargado, probablemente está en caché
    return allImagesCached && allVideosCached && documentReady;
}

// Espera a que todo esté cargado antes de mostrar el contenido
function waitForAllAssets() {
    const promises = [];
    
    // Verificar si el contenido está en caché
    if (isContentCached()) {
        // Si está en caché, resolver inmediatamente sin delay mínimo
        return Promise.resolve();
    }
    
    // Esperar a que las fuentes estén cargadas
    if (document.fonts && document.fonts.ready) {
        promises.push(document.fonts.ready);
    }
    
    // Esperar a que todas las imágenes estén cargadas
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (!img.complete) {
            promises.push(new Promise((resolve) => {
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });
            }));
        }
    });
    
    // Esperar a que todos los videos estén listos
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        if (video.readyState < 2) {
            promises.push(new Promise((resolve) => {
                video.addEventListener('loadeddata', resolve, { once: true });
                video.addEventListener('error', resolve, { once: true });
            }));
        }
    });
    
    // Esperar a que la ventana esté completamente cargada
    promises.push(new Promise((resolve) => {
        if (document.readyState === 'complete') {
            resolve();
        } else {
            window.addEventListener('load', resolve, { once: true });
        }
    }));
    
    // Solo esperar un mínimo de tiempo si NO está en caché
    promises.push(new Promise((resolve) => {
        setTimeout(resolve, 1000); // Mínimo 1 segundo de carga
    }));
    
    return Promise.all(promises);
}

document.addEventListener('DOMContentLoaded', () => {
    // Verificar si el contenido está en caché
    const cached = isContentCached();
    
    if (cached) {
        // Si está en caché, ocultar la pantalla de carga inmediatamente y mostrar contenido
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        document.body.classList.add('loaded');
        document.body.style.overflow = '';
        
        // Inicializar funciones directamente
        initBitacora();
        initFooterScroll();
        setActiveButton('CUADERNO DE BITÁCORA');
        return;
    }
    
    // Si no está en caché, mostrar pantalla de carga y esperar
    animateLoadingScreenEntry();
    
    waitForAllAssets().then(() => {
        // Inicializar funciones
        initBitacora();
        initFooterScroll();
        setActiveButton('CUADERNO DE BITÁCORA');
        
        // Ocultar pantalla de carga después de un pequeño delay
        setTimeout(() => {
            hideLoadingScreen();
        }, 300);
    }).catch((error) => {
        console.error('Error al cargar recursos:', error);
        // Ocultar pantalla de carga incluso si hay errores
        setTimeout(() => {
            hideLoadingScreen();
        }, 1000);
    });
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

