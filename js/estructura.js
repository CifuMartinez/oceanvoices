/**
 * Inicialización de la sección Estructura Narrativa
 * 
 * Funcionalidades:
 * - Slider con navegación táctil (swipe) en móvil
 * - Auto-play cada X segundos
 * - Indicadores de progreso que se rellenan
 * - Animación DrawSVG para el mapa trazado
 */

document.addEventListener('DOMContentLoaded', () => {
    initEstructuraSlider();
});

/**
 * Inicializa el slider de estructura narrativa
 */
function initEstructuraSlider() {
    const slider = document.getElementById('estructura-slider');
    const slides = document.querySelectorAll('.estructura-slide');
    const progressLines = document.querySelectorAll('.progress-line-fill');
    const videos = document.querySelectorAll('.estructura-video');
    
    if (!slider || slides.length === 0) return;
    
    let currentSlide = 0;
    let autoPlayInterval = null;
    const autoPlayDelay = 5000; // 5 segundos
    let isUserInteracting = false;
    
    // Variables para swipe en móvil
    let touchStartX = 0;
    let touchEndX = 0;
    let isDragging = false;
    let startPosition = 0;
    let currentPosition = 0;
    
    /**
     * Actualiza el slider a un slide específico
     */
    function goToSlide(index) {
        if (index < 0 || index >= slides.length) return;
        
        // Remover clase active de todos los slides
        slides.forEach(slide => slide.classList.remove('active'));
        progressLines.forEach((line, i) => {
            line.classList.remove('active');
            // Mantener el ancho al 100% si el slide ya fue visitado, solo cambiar el color
            if (i < index || (i === index && line.style.width === '100%')) {
                line.style.width = '100%';
            }
        });
        
        // Añadir clase active al slide actual
        slides[index].classList.add('active');
        progressLines[index].classList.add('active');
        // Establecer el ancho al 100% si no está ya establecido
        if (progressLines[index].style.width === '' || progressLines[index].style.width === '0%') {
            progressLines[index].style.width = '100%';
        }
        
        // Actualizar transform del slider
        slider.style.transform = `translateX(-${index * 100}%)`;
        
        // Pausar todos los videos
        videos.forEach(video => {
            video.pause();
            video.currentTime = 0;
        });
        
        // Reproducir video del slide actual
        const currentVideo = slides[index].querySelector('.estructura-video');
        if (currentVideo) {
            currentVideo.play().catch(err => {
                console.log('Error al reproducir video:', err);
            });
        }
        
        currentSlide = index;
        resetAutoPlay();
    }
    
    /**
     * Avanza al siguiente slide
     */
    function nextSlide() {
        const nextIndex = (currentSlide + 1) % slides.length;
        goToSlide(nextIndex);
    }
    
    /**
     * Retrocede al slide anterior
     */
    function prevSlide() {
        const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
        goToSlide(prevIndex);
    }
    
    /**
     * Inicia el auto-play con animación de progreso
     */
    function startAutoPlay() {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
        
        // Reiniciar el indicador de progreso del slide actual
        const currentProgressLine = progressLines[currentSlide];
        if (currentProgressLine) {
            // Solo reiniciar si no está ya al 100%
            if (currentProgressLine.style.width !== '100%') {
                currentProgressLine.style.width = '0%';
            }
            currentProgressLine.style.transition = `width ${autoPlayDelay / 1000}s linear`;
            
            // Animar el relleno del indicador
            setTimeout(() => {
                currentProgressLine.style.width = '100%';
            }, 10);
        }
        
        autoPlayInterval = setInterval(() => {
            if (!isUserInteracting) {
                nextSlide();
            }
        }, autoPlayDelay);
    }
    
    /**
     * Reinicia el auto-play
     */
    function resetAutoPlay() {
        startAutoPlay();
    }
    
    /**
     * Pausa el auto-play temporalmente
     */
    function pauseAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    }
    
    // Eventos de touch para móvil (swipe)
    slider.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        isDragging = true;
        startPosition = touchStartX;
        pauseAutoPlay();
        isUserInteracting = true;
    }, { passive: true });
    
    slider.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentPosition = e.touches[0].clientX;
        const diff = currentPosition - startPosition;
        
        // Aplicar transformación visual durante el arrastre
        slider.style.transform = `translateX(calc(-${currentSlide * 100}% + ${diff}px))`;
        slider.style.transition = 'none';
    }, { passive: true });
    
    slider.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        
        touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        const threshold = 50; // Mínimo de píxeles para considerar un swipe
        
        // Restaurar transición
        slider.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                // Swipe izquierda - siguiente slide
                nextSlide();
            } else {
                // Swipe derecha - slide anterior
                prevSlide();
            }
        }
        
        isDragging = false;
        isUserInteracting = false;
        resetAutoPlay();
    }, { passive: true });
    
    // Eventos de mouse para desktop (drag)
    let mouseDown = false;
    let mouseStartX = 0;
    
    slider.addEventListener('mousedown', (e) => {
        mouseDown = true;
        mouseStartX = e.clientX;
        startPosition = mouseStartX;
        pauseAutoPlay();
        isUserInteracting = true;
        e.preventDefault();
    });
    
    slider.addEventListener('mousemove', (e) => {
        if (!mouseDown) return;
        currentPosition = e.clientX;
        const diff = currentPosition - startPosition;
        
        slider.style.transform = `translateX(calc(-${currentSlide * 100}% + ${diff}px))`;
        slider.style.transition = 'none';
    });
    
    slider.addEventListener('mouseup', (e) => {
        if (!mouseDown) return;
        
        const diff = mouseStartX - e.clientX;
        const threshold = 50;
        
        slider.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
        
        mouseDown = false;
        isUserInteracting = false;
        resetAutoPlay();
    });
    
    slider.addEventListener('mouseleave', () => {
        if (mouseDown) {
            slider.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            slider.style.transform = `translateX(-${currentSlide * 100}%)`;
            mouseDown = false;
            isUserInteracting = false;
            resetAutoPlay();
        }
    });
    
    // Inicializar posición del slider y primer slide
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    goToSlide(0);
    
    // Iniciar auto-play
    startAutoPlay();
    
    // Pausar auto-play cuando la ventana pierde el foco
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            pauseAutoPlay();
        } else {
            resetAutoPlay();
        }
    });
}


