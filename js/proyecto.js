// Funciones JavaScript específicas para la página El Proyecto

gsap.registerPlugin(ScrollTrigger, SplitText);

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
            // Si hay error, intentar cargar manualmente
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
        
        // Intentar reproducir inmediatamente o cuando esté listo
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

// Espera a que las fuentes estén cargadas antes de ejecutar SplitText
function initAfterFontsLoaded() {
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
        initPropuestaScroll();
        initClavesCarousel();
        initEstructuraNavigation();
        initVocesSlider();
        setActiveButton('EL PROYECTO');
        return;
    }
    
    // Si no está en caché, mostrar pantalla de carga y esperar
    animateLoadingScreenEntry();
    
    waitForAllAssets().then(() => {
        // Inicializar todas las funciones
        initPropuestaScroll();
        initClavesCarousel();
        initEstructuraNavigation();
        initVocesSlider();
        setActiveButton('EL PROYECTO');
        
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
}

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar después de que las fuentes estén cargadas
    initAfterFontsLoaded();
});

function initPropuestaScroll() {
    const wavesContainer = document.querySelector('.header-waves-wrapper');
    const propuestaSection = document.querySelector('.propuesta-section');
    const propuestaText = document.querySelector('.propuesta-text');
    const propuestaTitle = document.querySelector('.propuesta-title');
    const wave1 = document.querySelector('.wave-1');
    const wave2 = document.querySelector('.wave-2');
    const wave3 = document.querySelector('.wave-3');
    const header = document.querySelector('.header');
    
    if (!wavesContainer || !propuestaSection || !propuestaText) return;
    
    // Determinar escala según tamaño de pantalla (disponible en todo el scope)
    const isDesktop = window.innerWidth >= 769;
    const baseWaveScale = isDesktop ? 0.6 : 1;
    
    let initialPinTrigger;
    
    // Bloquear scroll inicial
    initialPinTrigger = ScrollTrigger.create({
        trigger: wavesContainer,
        start: 'top top',
        end: 'max',
        pin: true,
        pinSpacing: false,
        anticipatePin: 1
    });
    
    gsap.set('body', { overflow: 'hidden' });
    
    const entranceTimeline = gsap.timeline({
        onComplete: function() {
            gsap.set('body', { overflow: 'auto' });
        }
    });
    
    // Animar logo primero
    if (header) {
        const headerLogo = header.querySelector('.header-logo');
        if (headerLogo) {
            gsap.set(headerLogo, { opacity: 0, scale: 0.9 });
            entranceTimeline.to(headerLogo, {
                opacity: 1,
                scale: 1,
                duration: 0.75,
                ease: "power2.inOut"
            });
        }
    }
    
    // Animar waves con escala inicial
    if (wave1) {
        gsap.set(wave1, { opacity: 0, scale: baseWaveScale });
        entranceTimeline.to(wave1, {
            opacity: 1,
            scale: baseWaveScale,
            duration: 0.75,
            ease: "power2.inOut"
        }, "-=0.5");
    }
    
    if (wave2) {
        gsap.set(wave2, { opacity: 0, scale: baseWaveScale });
        entranceTimeline.to(wave2, {
            opacity: 1,
            scale: baseWaveScale,
            duration: 0.75,
            ease: "power2.inOut"
        }, "-=0.6");
    }
    
    if (wave3) {
        gsap.set(wave3, { opacity: 0, scale: baseWaveScale });
        entranceTimeline.to(wave3, {
            opacity: 1,
            scale: baseWaveScale,
            duration: 0.75,
            ease: "power2.inOut"
        }, "-=0.6");
    }
    
    // Animar título
    if (propuestaTitle) {
        gsap.set(propuestaTitle, { opacity: 0, scale: 0.9 });
        entranceTimeline.to(propuestaTitle, {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "power2.inOut"
        }, "-=0.6");
    }
    
    // Animar líneas de texto
    const textLines = propuestaText.querySelectorAll('.text-line');
    textLines.forEach((line, index) => {
        gsap.set(line, { opacity: 0, y: 30 });
        entranceTimeline.to(line, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.inOut"
        }, index === 0 ? "-=0.6" : `+=${0.1}`);
    });
    
    entranceTimeline.call(function() {
        initTextScroll();
    }, null, "-=0.2");
    
    function initTextScroll() {
        const textLines = propuestaText.querySelectorAll('.text-line');
        const allWords = [];
        
        textLines.forEach((line) => {
            const split = new SplitText(line, {
                type: "words",
                wordsClass: "word"
            });
            
            if (split.words) {
                split.words.forEach((word) => {
                    allWords.push(word);
                });
            }
        });
        
        if (initialPinTrigger) {
            initialPinTrigger.kill();
        }
        
        const extraSpace = 200;
        const scrollDuration = allWords.length * 50 + extraSpace;
        
        const wave1Element = document.querySelector('.wave-1');
        const wave2Element = document.querySelector('.wave-2');
        const wave3Element = document.querySelector('.wave-3');
        const clavesSection = document.querySelector('.claves-section');
        const biodiversidadItem = document.querySelector('.clave-item.biodiversidad');
        const conservacionItem = document.querySelector('.clave-item.conservacion');
        const presionItem = document.querySelector('.clave-item.presion');
        
        const extraSpaceForClaves = window.innerHeight * 3;
        const totalScrollHeight = scrollDuration + extraSpaceForClaves;
        
        // Animar el header un poco antes que las waves
        if (header) {
            gsap.set(header, { y: 0, opacity: 1 });
            
            // El header empieza a moverse un poco antes que las waves (antes del final del scrollDuration)
            const headerEarlyOffset = 1000; // Píxeles antes de que empiecen a desaparecer las waves
            gsap.to(header, {
                y: -window.innerHeight,
                opacity: 0,
                ease: "none",
                scrollTrigger: {
                    trigger: wavesContainer,
                    // Empezar un poco antes que las waves
                    start: () => `top+=${scrollDuration - headerEarlyOffset} top`,
                    // Usar un poco más de espacio para completar la animación
                    end: () => `+=${extraSpaceForClaves + headerEarlyOffset}px`,
                    scrub: 1,
                    invalidateOnRefresh: true
                }
            });
        }
        
        // Animar las waves con escala y opacidad durante el scroll (efecto de ondas)
        // Cada wave escala de manera diferente y reduce su opacidad a medida que crece
        // Usar la escala base determinada por el tamaño de pantalla
        if (wave1) {
            gsap.set(wave1, { scale: baseWaveScale, opacity: 1 });
            gsap.to(wave1, {
                scale: baseWaveScale * 1.5,
                opacity: 0.3,
                ease: "none",
                scrollTrigger: {
                    trigger: wavesContainer,
                    start: 'top top',
                    end: () => `+=${totalScrollHeight}px`,
                    scrub: 1,
                    invalidateOnRefresh: true
                }
            });
        }
        
        if (wave2) {
            gsap.set(wave2, { scale: baseWaveScale, opacity: 1 });
            gsap.to(wave2, {
                scale: baseWaveScale * 1.8,
                opacity: 0.2,
                ease: "none",
                scrollTrigger: {
                    trigger: wavesContainer,
                    start: 'top top',
                    end: () => `+=${totalScrollHeight}px`,
                    scrub: 1,
                    invalidateOnRefresh: true
                }
            });
        }
        
        if (wave3) {
            gsap.set(wave3, { scale: baseWaveScale, opacity: 1 });
            gsap.to(wave3, {
                scale: baseWaveScale * 2.2,
                opacity: 0.1,
                ease: "none",
                scrollTrigger: {
                    trigger: wavesContainer,
                    start: 'top top',
                    end: () => `+=${totalScrollHeight}px`,
                    scrub: 1,
                    invalidateOnRefresh: true
                }
            });
        }
        
        // Animar las waves para que desaparezcan junto con el header
        const groupWaves = document.querySelector('.group-waves');
        if (groupWaves) {
            gsap.set(groupWaves, { opacity: 1 });
            gsap.to(groupWaves, {
                opacity: 0,
                ease: "none",
                scrollTrigger: {
                    trigger: wavesContainer,
                    start: () => `top+=${scrollDuration} top`,
                    end: () => `+=${extraSpaceForClaves}px`,
                    scrub: 1,
                    invalidateOnRefresh: true
                }
            });
        }
        
        ScrollTrigger.create({
            trigger: wavesContainer,
            start: 'top top',
            end: () => `+=${totalScrollHeight}px`,
            pin: true,
            pinSpacing: true,
            scrub: 1,
            anticipatePin: 1,
            pinReparent: false,
            onUpdate: (self) => {
                const progress = self.progress;
                
                // 60% del progreso para palabras, 40% para transiciones
                const wordsProgress = Math.min(progress / 0.6, 1);
                const wordsToFill = Math.floor(wordsProgress * allWords.length);
                
                allWords.forEach((word, index) => {
                    if (index < wordsToFill) {
                        word.classList.add('filled');
                    } else {
                        word.classList.remove('filled');
                    }
                });
                
                // Transiciones entre secciones
                // 0-60%: palabras | 60-65%: propuesta desaparece | 65-80%: Biodiversidad
                // 80-85%: transición | 85-90%: Conservación | 90-95%: transición | 95-100%: Presión
                
                if (propuestaSection) {
                    if (progress >= 0.60 && progress < 0.65) {
                        propuestaSection.classList.add('fade-out');
                    } else if (progress < 0.60) {
                        propuestaSection.classList.remove('fade-out');
                    }
                }
                
                if (clavesSection) {
                    if (progress >= 0.65) {
                        clavesSection.classList.add('visible');
                    } else {
                        clavesSection.classList.remove('visible');
                    }
                }
                
                if (biodiversidadItem && conservacionItem && presionItem) {
                    if (progress >= 0.65 && progress < 0.80) {
                        biodiversidadItem.classList.add('visible');
                        biodiversidadItem.classList.remove('fade-out');
                        conservacionItem.classList.remove('visible');
                        presionItem.classList.remove('visible');
                    }
                    else if (progress >= 0.80 && progress < 0.85) {
                        biodiversidadItem.classList.add('fade-out');
                        biodiversidadItem.classList.remove('visible');
                        conservacionItem.classList.add('visible');
                        conservacionItem.classList.remove('fade-out');
                        presionItem.classList.remove('visible');
                    }
                    else if (progress >= 0.85 && progress < 0.90) {
                        biodiversidadItem.classList.remove('visible');
                        conservacionItem.classList.add('visible');
                        conservacionItem.classList.remove('fade-out');
                        presionItem.classList.remove('visible');
                    }
                    else if (progress >= 0.90 && progress < 0.95) {
                        biodiversidadItem.classList.remove('visible');
                        conservacionItem.classList.add('fade-out');
                        conservacionItem.classList.remove('visible');
                        presionItem.classList.add('visible');
                        presionItem.classList.remove('fade-out');
                    }
                    else if (progress >= 0.95) {
                        biodiversidadItem.classList.remove('visible');
                        conservacionItem.classList.remove('visible');
                        presionItem.classList.add('visible');
                        presionItem.classList.remove('fade-out');
                    }
                    else {
                        biodiversidadItem.classList.remove('visible');
                        conservacionItem.classList.remove('visible');
                        presionItem.classList.remove('visible');
                    }
                }
            }
        });
    }
}

// Swiper.js con efecto cards - Basado en Skiper UI #48
function initClavesCarousel() {
    let attempts = 0;
    const maxAttempts = 50;
    
    function initSwiperCarousels() {
        attempts++;
        
        if (typeof Swiper === 'undefined') {
            if (attempts < maxAttempts) {
                setTimeout(initSwiperCarousels, 100);
            } else {
                console.error('Swiper no se pudo cargar después de múltiples intentos');
            }
            return;
        }
        
        const carousels = document.querySelectorAll('.Carousal_002');
        
        if (!carousels.length) {
            console.error('No se encontraron carousels con clase .Carousal_002');
            return;
        }
        
        carousels.forEach((carouselElement, index) => {
            try {
                const slides = carouselElement.querySelectorAll('.swiper-slide');
                if (!slides.length) {
                    console.warn(`Carousel ${index + 1}: No se encontraron slides`);
                    return;
                }
                
                const slideCount = slides.length;
                
                // Configuración optimizada para 11 slides (Skiper UI #48)
                const swiperConfig = {
                    spaceBetween: 40,
                    effect: 'cards',
                    grabCursor: true,
                    loop: true,
                    loopedSlides: slideCount,
                    loopAdditionalSlides: 2,
                    loopPreventsSliding: false,
                    cardsEffect: {
                        perSlideOffset: 8,
                        perSlideRotate: 2,
                        rotate: true,
                        slideShadows: true,
                    },
                };
                
                if (slideCount >= 11) {
                    console.log(`Carousel ${index + 1}: Configurado con ${slideCount} slides - Loop funcionará perfectamente`);
                } else if (slideCount >= 6) {
                    console.log(`Carousel ${index + 1}: Configurado con ${slideCount} slides - Loop debería funcionar bien`);
                } else {
                    console.warn(`Carousel ${index + 1}: Solo tiene ${slideCount} slides. Se recomiendan 11 slides para un loop perfecto.`);
                }
                
                const swiper = new Swiper(carouselElement, swiperConfig);
                
                setTimeout(() => {
                    try {
                        if (swiper.params.loop && swiper.slides.length > slideCount) {
                            console.log(`Carousel ${index + 1} - Loop activo con ${swiper.slides.length} slides totales`);
                        } else {
                            console.warn(`Carousel ${index + 1} - Recreando loop...`);
                            if (swiper.loopDestroy) {
                                swiper.loopDestroy();
                            }
                            if (swiper.loopCreate) {
                                swiper.loopCreate();
                            }
                            swiper.update();
                        }
                    } catch (e) {
                        console.error(`Error al verificar loop del carousel ${index + 1}:`, e);
                    }
                }, 200);
                
                swiper.on('slideChange', function() {
                    const realIndex = this.realIndex;
                    if (realIndex < 0 || realIndex >= slideCount) {
                        console.warn(`Carousel ${index + 1} - Índice fuera de rango: ${realIndex}`);
                    }
                });
                
                console.log(`Carousel ${index + 1} inicializado correctamente con ${slideCount} slides`);
                
            } catch (error) {
                console.error(`Error al inicializar carousel ${index + 1}:`, error);
            }
        });
    }
    
    setTimeout(initSwiperCarousels, 300);
}

function initEstructuraNavigation() {
    const progressDots = document.querySelectorAll('.progress-dot');
    
    progressDots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            progressDots.forEach(d => d.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function initVocesSlider() {
    const vocesGrid = document.getElementById('voces-grid');
    const vocesSliderContainer = document.querySelector('.voces-slider-container');
    const vozCards = document.querySelectorAll('.voz-card');
    
    if (!vocesGrid || vozCards.length === 0 || !vocesSliderContainer) return;
    
    // Inicializar tarjetas
    gsap.set(vozCards, { opacity: 1, y: 0, scale: 0.85 });
    
    // Actualizar escalas basadas en posición
    const updateScales = () => {
        const center = vocesSliderContainer.getBoundingClientRect().left + vocesSliderContainer.offsetWidth / 2;
        vozCards.forEach(card => {
            const distance = Math.abs(card.getBoundingClientRect().left + card.offsetWidth / 2 - center);
            const scale = 0.85 + (0.15 * (1 - Math.min(distance / (vocesSliderContainer.offsetWidth * 0.6), 1)));
            gsap.to(card, { scale, duration: 0.4, ease: 'power2.out' });
        });
    };
    
    // Rebote al finalizar scroll (solo en desktop, no interfiere con touch)
    let scrollTimeout;
    let isScrolling = false;
    vocesSliderContainer.addEventListener('scroll', () => {
        updateScales();
        isScrolling = true;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
            // Solo aplicar rebote si no es un scroll táctil activo
            if (!vocesSliderContainer.matches(':active')) {
                const scroll = vocesSliderContainer.scrollLeft;
                gsap.to(vocesSliderContainer, {
                    scrollLeft: scroll - 5,
                    duration: 0.1,
                    ease: 'power1.out',
                    onComplete: () => {
                        gsap.to(vocesSliderContainer, { scrollLeft: scroll, duration: 0.2, ease: 'power2.out' });
                    }
                });
            }
        }, 150);
    }, { passive: true });
    
    // Habilitar desplazamiento táctil en todas las pantallas
    vocesSliderContainer.addEventListener('touchstart', (e) => {
        // Permitir que el evento de touch se propague normalmente
    }, { passive: true });
    
    vocesSliderContainer.addEventListener('touchmove', (e) => {
        // Permitir desplazamiento táctil
    }, { passive: true });
    
    // Drag con mouse para desktop (click y arrastrar)
    let isDragging = false;
    let dragStartX = 0;
    let dragStartScrollLeft = 0;
    let hasDragged = false; // Para distinguir entre click y drag
    
    vocesSliderContainer.addEventListener('mousedown', (e) => {
        // No iniciar drag si se hace click en el botón de play o en elementos interactivos
        if (e.target.closest('.voz-play-button') || e.target.closest('a') || e.target.closest('button')) {
            return;
        }
        
        isDragging = true;
        hasDragged = false;
        dragStartX = e.clientX;
        dragStartScrollLeft = vocesSliderContainer.scrollLeft;
        vocesSliderContainer.style.cursor = 'grabbing';
        vocesSliderContainer.style.userSelect = 'none';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        hasDragged = true;
        const diffX = e.clientX - dragStartX;
        vocesSliderContainer.scrollLeft = dragStartScrollLeft - diffX;
        updateScales();
    });
    
    document.addEventListener('mouseup', (e) => {
        if (isDragging) {
            isDragging = false;
            vocesSliderContainer.style.cursor = 'grab';
            vocesSliderContainer.style.userSelect = '';
        }
    });
    
    vocesSliderContainer.addEventListener('mouseleave', (e) => {
        if (isDragging) {
            isDragging = false;
            vocesSliderContainer.style.cursor = 'grab';
            vocesSliderContainer.style.userSelect = '';
        }
    });
    
    // Animación de entrada
    gsap.from(vozCards, {
        opacity: 0,
        y: 30,
        duration: 0.5,
        stagger: 0.15,
        ease: 'easeOut',
        scrollTrigger: { trigger: vocesGrid, start: 'top 80%' }
    });
    
    // Resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updateScales, 250);
    });
    
    updateScales();
    initVocesVideoModal();
}

function initVocesVideoModal() {
    const modal = document.getElementById('voces-video-modal');
    const playButtons = document.querySelectorAll('.voz-play-button');
    const closeButton = document.querySelector('.voces-video-modal-close');
    const backdrop = document.querySelector('.voces-video-modal-backdrop');
    const iframe = document.getElementById('voces-video-iframe');
    
    if (!modal || !closeButton || !backdrop || !iframe) return;
    
    function openModal(videoId) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        iframe.src = embedUrl;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        modal.classList.remove('active');
        iframe.src = '';
        document.body.style.overflow = '';
    }
    
    playButtons.forEach((button) => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar que el click se propague a la tarjeta
            const card = this.closest('.voz-card');
            const videoId = card?.getAttribute('data-video-id');
            if (videoId) {
                openModal(videoId);
            }
        });
    });
    
    closeButton.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}
