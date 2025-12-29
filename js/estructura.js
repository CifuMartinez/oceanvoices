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
        
        // Desactivar todas las líneas de progreso y reiniciarlas a 0%
        progressLines.forEach((line, i) => {
            line.classList.remove('active');
            // Reiniciar todas las líneas a 0% y quitar transición para reset instantáneo
            line.style.transition = 'none';
            line.style.width = '0%';
        });
        
        // Añadir clase active al slide actual
        slides[index].classList.add('active');
        progressLines[index].classList.add('active');
        
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
            // Asegurar que el video esté listo antes de reproducir
            if (currentVideo.readyState >= 2) {
                currentVideo.play().catch(err => {
                    console.log('Error al reproducir video:', err);
                });
            } else {
                currentVideo.addEventListener('loadeddata', () => {
                    currentVideo.play().catch(err => {
                        console.log('Error al reproducir video:', err);
                    });
                }, { once: true });
            }
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
        if (currentProgressLine && currentProgressLine.classList.contains('active')) {
            // Siempre reiniciar a 0% para comenzar la animación desde el principio
            currentProgressLine.style.transition = 'none';
            currentProgressLine.style.width = '0%';
            
            // Usar requestAnimationFrame para asegurar que el reset se aplique antes de la animación
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    // Aplicar la transición y animar hasta 100%
                    currentProgressLine.style.transition = `width ${autoPlayDelay / 1000}s linear`;
                    currentProgressLine.style.width = '100%';
                });
            });
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
    
    // Asegurar que los videos estén listos antes de iniciar
    videos.forEach(video => {
        video.load(); // Forzar carga de los videos
    });
    
    // Esperar a que el primer video esté listo antes de iniciar
    const firstVideo = slides[0].querySelector('.estructura-video');
    if (firstVideo) {
        if (firstVideo.readyState >= 2) {
            goToSlide(0);
            startAutoPlay();
        } else {
            firstVideo.addEventListener('loadeddata', () => {
                goToSlide(0);
                startAutoPlay();
            }, { once: true });
        }
    } else {
        goToSlide(0);
        startAutoPlay();
    }
    
    // Pausar auto-play cuando la ventana pierde el foco
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            pauseAutoPlay();
        } else {
            resetAutoPlay();
        }
    });
}


