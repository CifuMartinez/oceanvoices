// ============================================
// COMPONENTE EXPANDONHOVER - Adaptado de Skiper UI #52
// Convertido de React + Framer Motion a Vanilla JS + GSAP
// ============================================

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

// ============================================
// DATOS DE LOS MIEMBROS DEL EQUIPO
// ============================================
const teamMembersData = [
    {
        name: "Claudia Farinós",
        description: "Dirección",
        bio: "Creación del concepto creativo y desarrollo del proyecto. Dirección artística, narrativa y guionista."
    },
    {
        name: "Iván Moreno",
        description: "Director de Fotografía",
        bio: "Diseño visual, cámara e iluminación del documental."
    },
    {
        name: "Vicente Seco",
        description: "Underwater Video",
        bio: "Imagen subacuática. Operación de cámara subacuática."
    },
    {
        name: "Nora Lejarza",
        description: "Investigación Sociológica",
        bio: "Análisis sociocultural y asistencia direccional del proyecto."
    },
    {
        name: "Constanza Bellettini",
        description: "Ayudante de Producción",
        bio: "Logística. Behind the scenes. Apoyo en producción, coordiniación en rodaje y registro del proceso."
    }
];

// ============================================
// VARIABLE DE ESTADO (equivalente a useState)
// ============================================
let activeImageIndex = 1; // Estado inicial: segundo miembro activo (índice 1)

// ============================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ============================================
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
        if (typeof gsap !== 'undefined') {
            initTeamExpandGallery();
        } else {
            console.error('GSAP no está cargado');
        }
        setActiveButton('EL EQUIPO');
        return;
    }
    
    // Si no está en caché, mostrar pantalla de carga y esperar
    animateLoadingScreenEntry();
    
    waitForAllAssets().then(() => {
        // Esperar a que GSAP esté disponible
        if (typeof gsap !== 'undefined') {
            initTeamExpandGallery();
        } else {
            console.error('GSAP no está cargado');
        }
        setActiveButton('EL EQUIPO');
        
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

// ============================================
// FUNCIÓN PRINCIPAL: INICIALIZAR LA GALERÍA
// Basada en el componente HoverExpand_001 de Skiper UI
// ============================================
function initTeamExpandGallery() {
    const members = document.querySelectorAll('.team-member-expand');
    const infoContainer = document.querySelector('.team-member-info');
    const nameElement = document.querySelector('.team-member-name-expand');
    const descriptionElement = document.querySelector('.team-member-description-expand');
    const bioElement = document.querySelector('.team-member-bio-expand');
    
    if (!members.length || !infoContainer || !nameElement || !descriptionElement || !bioElement) {
        console.error('Elementos del equipo no encontrados');
        return;
    }
    
    // ============================================
    // PASO 1: CONFIGURAR EL ESTADO INICIAL
    // ============================================
    // Activar el segundo miembro por defecto (índice 1)
    setActiveImage(activeImageIndex, members, infoContainer, nameElement, descriptionElement, bioElement);
    
    // ============================================
    // PASO 2: AGREGAR EVENT LISTENERS
    // Equivalente a onHoverStart y onClick del componente original
    // ============================================
    members.forEach((member, index) => {
        // onHoverStart (equivalente a React)
        member.addEventListener('mouseenter', function() {
            setActiveImage(index, members, infoContainer, nameElement, descriptionElement, bioElement);
        });
        
        // onClick (equivalente a React)
        member.addEventListener('click', function() {
            setActiveImage(index, members, infoContainer, nameElement, descriptionElement, bioElement);
        });
    });
    
    // Reajustar tamaños cuando cambie el tamaño de ventana
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            setActiveImage(activeImageIndex, members, infoContainer, nameElement, descriptionElement, bioElement);
        }, 250);
    });
}

// ============================================
// FUNCIÓN: ESTABLECER IMAGEN ACTIVA
// Equivalente a setActiveImage del componente React
// ============================================
/**
 * Establece qué imagen está activa y anima los cambios
 * 
 * @param {number} index - Índice de la imagen a activar
 * @param {NodeList} members - Lista de todos los elementos de miembros
 * @param {HTMLElement} infoContainer - Contenedor de la información
 * @param {HTMLElement} nameElement - Elemento donde se muestra el nombre
 * @param {HTMLElement} descriptionElement - Elemento donde se muestra la descripción
 * @param {HTMLElement} bioElement - Elemento donde se muestra el bio/descriptivo
 */
function setActiveImage(index, members, infoContainer, nameElement, descriptionElement, bioElement) {
    // Validar índice
    if (index < 0 || index >= teamMembersData.length) {
        console.error('Índice de miembro inválido');
        return;
    }
    
    // Actualizar el estado
    activeImageIndex = index;
    
    // Obtener datos del miembro
    const memberData = teamMembersData[index];
    
    // Actualizar información de texto
    nameElement.textContent = memberData.name;
    descriptionElement.textContent = memberData.description;
    bioElement.textContent = memberData.bio || '';
    
    // Asegurar que no hay transformaciones aplicadas por GSAP
    gsap.set([nameElement, descriptionElement, bioElement, infoContainer], {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        clearProps: "transform"
    });
    
    // Mostrar contenedor de información solo con opacidad
    infoContainer.classList.add('active');
    
    // ============================================
    // ANIMAR CADA MIEMBRO CON GSAP
    // Equivalente a motion.div con animate en Framer Motion
    // ============================================
    // Determinar tamaños según el tamaño de pantalla
    const isDesktop = window.innerWidth >= 768;
    
    members.forEach((member, memberIndex) => {
        const isActive = memberIndex === index;
        
        // Dimensiones según el estado y tamaño de pantalla
        let targetWidth, targetHeight;
        
        if (isDesktop) {
            // Desktop (>=768px): Tamaños originales
            // Activo: width: 24rem (384px), height: 24rem (384px)
            // Inactivo: width: 5rem (80px), height: 20rem (320px)
            targetWidth = isActive ? '24rem' : '5rem';
            targetHeight = isActive ? '24rem' : '20rem';
        } else {
            // Mobile (<768px): Tamaños reducidos
            // Activo: width: 12rem, height: 14rem (para encajar en contenedor de 14rem)
            // Inactivo: width: 2.5rem (40px), height: 12rem
            targetWidth = isActive ? '12rem' : '2.5rem';
            targetHeight = isActive ? '14rem' : '12rem';
        }
        
        // Animar con GSAP (equivalente a transition en Framer Motion)
        // duration: 0.3, ease: "easeInOut" del componente original
        gsap.to(member, {
            width: targetWidth,
            height: targetHeight,
            duration: 0.3,
            ease: "power2.inOut" // easeInOut en GSAP
        });
        
        // Actualizar clase active para el overlay
        if (isActive) {
            member.classList.add('active');
        } else {
            member.classList.remove('active');
        }
        
        // Animar el overlay (aparece/desaparece)
        const overlay = member.querySelector('.team-member-overlay');
        if (overlay) {
            gsap.to(overlay, {
                opacity: isActive ? 1 : 0,
                duration: 0.3,
                ease: "power2.inOut"
            });
        }
    });
}
