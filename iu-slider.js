document.addEventListener("DOMContentLoaded", () => {
    const sliders = document.querySelectorAll('.iu-slider-container');

    sliders.forEach(slider => {
        const wrapper = slider.querySelector('.iu-slider-wrapper');
        const track = slider.querySelector('.iu-slider-track');
        const prevBtn = slider.querySelector('.prev-btn');
        const nextBtn = slider.querySelector('.next-btn');

        // Cek apakah infinite diaktifkan
        const enableInfinite = slider.classList.contains("enable-infinite");
        const infiniteLoop = slider.classList.contains("infinite-loop");
        const sidePadding = slider.classList.contains('side-padding');
        const singleSlideShift = slider.classList.contains('single-shift');
        const carouselLoop = slider.classList.contains('is-carousel');
        let isTransitioning = false;

        if(sidePadding) {
            wrapper.style.padding = '0 5vw';
        }
        
        const slides = Array.from(slider.querySelectorAll('.iu-slide'));
        if (slides.length === 0) return;
        slides.forEach((slide, index) => {
            slide.setAttribute("data-slide", index + 1);
        });

        // Ambil slidesPerView dari kelas
        const matchSlides = slider.className.match(/slides-per-view-(\d+)(?:-(\d+)-(\d+)-(\d+))?/);
        let slidesPerViewDesktop, slidesPerViewMedium, slidesPerViewTablet, slidesPerViewMobile;

        if (matchSlides) {
            if (matchSlides[2]) {
                slidesPerViewDesktop = parseInt(matchSlides[1]);
                slidesPerViewMedium = parseInt(matchSlides[2]);
                slidesPerViewTablet = parseInt(matchSlides[3]);
                slidesPerViewMobile = parseInt(matchSlides[4]);
            } else {
                slidesPerViewDesktop = slidesPerViewMedium = slidesPerViewTablet = slidesPerViewMobile = parseInt(matchSlides[1]);
            }
        } else {
            // Tanpa kelas slides-per-view-....
            slidesPerViewDesktop = 1;
            slidesPerViewMedium = 1;
            slidesPerViewTablet = 1;
            slidesPerViewMobile = 1;
        }

        // Ambil gap dari kelas dalam persen
        const matchGap = slider.className.match(/gap-size-(\d+(\.\d+)?)/);
        let gapSize = matchGap ? parseFloat(matchGap[1]) : 0;

        let slidesPerView = slidesPerViewDesktop;
        let slideWidthPercent = 0;
        let totalSlides = slides.length;
        // let currentIndex = 0;

        let currentIndex;

        if (infiniteLoop) {
            // currentIndex = slidesPerView == 1 ? slidesPerView : slidesPerView + 1;
            // currentIndex = slidesPerView == 1 ? slidesPerView + 1 : slides.length;
            currentIndex = slidesPerView >= 2 ? slides.length : slidesPerView;
            console.log("Start From Index :", currentIndex);
        } else {
            currentIndex = 0;
        }
        function updateSlidesPerView() {
            if (window.innerWidth <= 600) {
                slidesPerView = slidesPerViewMobile;
                if (infiniteLoop) {
                    currentIndex = slidesPerView >= 2 ? slides.length : slidesPerView;
                    console.log("current Index On Mobile :", currentIndex);
                }
            } else if (window.innerWidth <= 900) {
                slidesPerView = slidesPerViewTablet;
                if (infiniteLoop) {
                    currentIndex = slidesPerView >= 2 ? slides.length : slidesPerView;
                    console.log("current Index On Tablet :", currentIndex);
                }
            } else if (window.innerWidth <= 1200) {
                slidesPerView = slidesPerViewMedium;
                if (infiniteLoop) {
                    currentIndex = slidesPerView >= 2 ? slides.length : slidesPerView;
                    console.log("current Index On Medium  :", currentIndex);
                }
            } else {
                slidesPerView = slidesPerViewDesktop;
                if (infiniteLoop) {
                    currentIndex = slidesPerView >= 2 ? slides.length : slidesPerView;
                    console.log("current Index On Desktop :", currentIndex);
                }
            }
            updateSlideSize();
        }

        function updateSlideSize() {
            let totalGapPercent = gapSize * (slidesPerView - 1);
            slideWidthPercent = (100 - totalGapPercent) / slidesPerView;

            slides.forEach(slide => {
                slide.style.width = `${slideWidthPercent}%`;
            });

            track.style.gap = `${gapSize}%`;
            if(!infiniteLoop) {
                track.scrollTo({ left: currentIndex * track.offsetWidth * (slideWidthPercent / 100 + gapSize / 100), behavior: "instant" });
            } else {
                track.style.transform = `translateX(${getTranslateX(currentIndex)}%)`;
            }

        }

        window.addEventListener('resize', () => {
            updateSlidesPerView();
            // updateSlideClass(slides, slidesPerView, currentIndex);
            console.log('Slide width:',slideWidthPercent);
            console.log('Gap:',gapSize);
        });
        
        updateSlidesPerView();
        
        /// Letakkan Yang membutuhkan slidesPerview di bawah sini.
        function cloneTheSlide(slide) {
            const clone = slide.cloneNode(true);
            clone.classList.add(`clone`);
            return clone; // Harus mengembalikan clone
        }

        if (carouselLoop) {
            const firstClones = Array.from(slides).map(slide => cloneTheSlide(slide));
            firstClones.forEach(clone => track.appendChild(clone));
        } 
        if(infiniteLoop) {
            const firstClones = slides.slice(-(slidesPerView >= 2 ? slides.length : slidesPerView)).map(cloneTheSlide);
            const lastClones = slides.slice(0, slidesPerView >= 2 ? slides.length : slidesPerView + 1).map(cloneTheSlide);
            firstClones.reverse().forEach(clone => track.insertBefore(clone, track.firstChild));
            lastClones.forEach(clone => track.appendChild(clone));
        }

        const originalSlides = Array.from(slider.querySelectorAll('.iu-slide:not(.clone)'));
        originalSlides.forEach(origin => {
            origin.classList.add('original');
        });

        function getTranslateX(index) {
            return -(index * (slideWidthPercent + gapSize));
        }

        function transition() {
            isTransitioning = true;
            track.style.transition = 'transform 0.5s ease-in-out';
            track.style.transform = `translateX(${getTranslateX(currentIndex)}%)`;
        }

        function updateSlideClass(slidesPerView, currentIndex) {
            if(infiniteLoop) {                
                
                const allSlides = slider.querySelectorAll('.iu-slide'); // Ambil semua slide (termasuk clone)
                allSlides.forEach(slide => slide.classList.remove('is-visible', 'next-slide', 'prev-slide'));             

                if (!slider || !allSlides || allSlides.length === 0) {
                    console.error("Error: Slider atau slides tidak ditemukan.");
                    return;
                }

                let visibleSlides = [];
                for (let i = 0; i < slidesPerView; i++) {
                    let index = (currentIndex + i) % allSlides.length;
                    // console.log("Visible Index:", index);  // Cek nilai index
                    // console.log("Current Index:", currentIndex);  // Cek nilai index
                    let slide = allSlides[index];
                    visibleSlides.push(slide);
                }

                visibleSlides.forEach(slide => {
                    if (slide) {  // Pastikan slide valid
                        slide.classList.add('is-visible');
                        const matchingSlides = [...allSlides].filter(s => 
                            s.getAttribute('data-slide') === slide.getAttribute('data-slide')
                        );
                    
                        matchingSlides.forEach(matchingSlide => matchingSlide.classList.add('is-visible'));
                    } else {
                        console.error("Slide tidak ditemukan:", slide);
                    }
                });
                        
                const slidesArray = Array.from(allSlides); 

                // slidesArray.forEach(slide => slide.classList.remove('next-slide', 'prev-slide'));

                slidesArray.forEach((slide, index) => {
                    if (slide.classList.contains('is-visible')) {
                        const prevIndex = (index - 1 + slidesArray.length) % slidesArray.length;
                        const nextIndex = (index + 1) % slidesArray.length;
                        const prevSlide = slidesArray[prevIndex];
                        const nextSlide = slidesArray[nextIndex];

                        // Tambahkan prev-slide jika belum is-visible
                        if (!prevSlide.classList.contains('is-visible') && !prevSlide.classList.contains('next-slide')) {
                            prevSlide.classList.add('prev-slide');
                        }

                        // Tambahkan next-slide jika belum is-visible
                        if (!nextSlide.classList.contains('is-visible') && !nextSlide.classList.contains('prev-slide')) {
                            nextSlide.classList.add('next-slide');
                        }
                    }
                });
            }
        }

        if(infiniteLoop) {
            function checkBoundary() {
                track.addEventListener('transitionend', function resetPosition() {
                    isTransitioning = false;
                    const originalSlidesCount = slides.length;
                    const lastSlideIndex = originalSlidesCount + slidesPerView - 1;
        
                    if (slidesPerView >= 2) {
                        let nextIndex = currentIndex;
            
                        if (currentIndex >= lastSlideIndex) {
                            nextIndex = slidesPerView + (currentIndex - lastSlideIndex - 1);
                        }
            
                        if (currentIndex <= slidesPerView) {
                            nextIndex = lastSlideIndex - (slidesPerView - currentIndex) + 1;
                        }
            
                        if (nextIndex !== currentIndex) {
                            track.style.transition = 'none';
                            currentIndex = nextIndex;
                            track.style.transform = `translateX(${getTranslateX(currentIndex)}%)`;
                            track.offsetHeight;
                        }
                    } else if (slidesPerView === 1) {
                        const allSlides = slider.querySelectorAll('.iu-slide');
                        const slideCount = allSlides.length;
            
                        if (currentIndex >= slideCount - slidesPerView) {
                            track.style.transition = 'none';
                            currentIndex = slidesPerView + 1;
                            track.style.transform = `translateX(${getTranslateX(currentIndex)}%)`;
                        }
            
                        if (currentIndex <= slidesPerView - 1) {
                            track.style.transition = 'none';
                            currentIndex = slideCount - (slidesPerView * 2 + 1);
                            track.style.transform = `translateX(${getTranslateX(currentIndex)}%)`;
                        }
                    }
    
                    track.removeEventListener('transitionend', resetPosition);
                }, { once: true });
            }
        }

        const paginationContainer = slider.querySelector('.iu-slider-pagination');
        if (paginationContainer) {
            const existingBullets = paginationContainer.querySelectorAll('.iu-slider-bullet');

            function getLogicalIndex(index) {
                if (enableInfinite && infiniteLoop) {
                    const cloneCount = slidesPerView >= 2 ? slides.length : slidesPerView;
                    const total = totalSlides;
                    let logical = (index - cloneCount) % total;
                    return logical < 0 ? logical + total : logical;
                }
                return Math.floor(index / slidesPerView);
            }

            function getClosestIndex(current, targetLogical) {
                const total = totalSlides;
            
                if (slidesPerView === 1) {
                    const base = current - getLogicalIndex(current);
                    let minDiff = Infinity;
                    let bestIndex = current;
            
                    for (let i = -1; i <= 1; i++) {
                        const candidate = base + (targetLogical + i * total);
                        const diff = Math.abs(candidate - current);
                        if (candidate >= 0 && diff < minDiff) {
                            minDiff = diff;
                            bestIndex = candidate;
                        }
                    }
                    return bestIndex;
                } else {
                      
                    const total = totalSlides;
                    const clonesBefore = slidesPerView >= 2 ? slides.length : slidesPerView;
                    const totalGroups = Math.ceil(total / slidesPerView);

                    const possibleTargets = [];
                    for (let i = -1; i <= 1; i++) {
                        const groupIndex = targetLogical + i * totalGroups;
                        const actualIndex = groupIndex * slidesPerView + clonesBefore;
                        possibleTargets.push(actualIndex);
                    }

                    let bestIndex = possibleTargets[0];
                    let shortest = Math.abs(current - bestIndex);
                    for (let i = 1; i < possibleTargets.length; i++) {
                        const dist = Math.abs(current - possibleTargets[i]);
                        if (dist < shortest) {
                            shortest = dist;
                            bestIndex = possibleTargets[i];
                        }
                    }

                    return bestIndex;               
                }                              
            }

            function handleBulletClick(i) {
                const clonesBefore = slidesPerView >= 2 ? slides.length : slidesPerView;
                const targetLogical = i;
        
                const logicalCurrentGroup = Math.floor(((currentIndex - clonesBefore) % totalSlides + totalSlides) % totalSlides / slidesPerView);
                if (logicalCurrentGroup === targetLogical) return;
        
                const bestIndex = enableInfinite && infiniteLoop
                    ? getClosestIndex(currentIndex, targetLogical)
                    : targetLogical * slidesPerView;
        
                currentIndex = bestIndex;
        
                if (enableInfinite && infiniteLoop) {
                    transition();
                    checkBoundary();
                } else {
                    track.scrollTo({
                        left: currentIndex * track.offsetWidth * (slideWidthPercent / 100 + gapSize / 100),
                        behavior: "smooth"
                    });
                }
        
                updatePagination();
                updateSlideClass(slidesPerView, currentIndex);
            }
        
            if (existingBullets.length) {
                existingBullets.forEach((bullet, i) => {
                    const bulletNumber = slider.classList.contains('bullet-number');
                    if(bulletNumber) bullet.innerText = i + 1;
                    bullet.addEventListener('click', () => handleBulletClick(i));
                });
            } else {
                const pageCount = Math.ceil(totalSlides / slidesPerView);
                for (let i = 0; i < pageCount; i++) {
                    const bullet = document.createElement('button');
                    bullet.classList.add('iu-slider-bullet');
                    if (i === 0) bullet.classList.add('active');
                    bullet.setAttribute('data-page', i);
                    const bulletNumber = slider.classList.contains('bullet-number');
                    if(bulletNumber) bullet.innerText = i + 1;
                    paginationContainer.appendChild(bullet);
        
                    bullet.addEventListener('click', () => handleBulletClick(i));
                }
            }

            function updatePagination() {
                const bullets = paginationContainer.querySelectorAll('.iu-slider-bullet');
                bullets.forEach(b => b.classList.remove('active'));
            
                let logicalIndex = currentIndex;
                if (enableInfinite && infiniteLoop) {
                    const cloneCount = slidesPerView >= 2 ? slides.length : slidesPerView;
                    const total = totalSlides;
                    logicalIndex = (currentIndex - cloneCount) % total;
                    if (logicalIndex < 0) logicalIndex += total;
                }
            
                const activePage = Math.floor(logicalIndex / slidesPerView);
                const activeBullet = paginationContainer.querySelector(`.iu-slider-bullet[data-page="${activePage}"]`);
                if (activeBullet) activeBullet.classList.add('active');
            }
        }

        function nextSlide() {
            if(!carouselLoop){
                if(enableInfinite){
                    if(!infiniteLoop){
                        const maxIndex = totalSlides - slidesPerView;
                        currentIndex = (currentIndex >= maxIndex) ? 0 : Math.min(maxIndex, currentIndex + slidesPerView);
                        track.scrollTo({ left: currentIndex * track.offsetWidth * (slideWidthPercent / 100 + gapSize / 100), behavior: "smooth" });
                    } else {
                        if (isTransitioning) return;
                        let step = singleSlideShift && slidesPerView > 1 ? 1 : slidesPerView;
    
                        currentIndex += step;
                        transition();
                        checkBoundary(); // Pass direction to checkBoundary
                    }
                } else {
                    const maxIndex = totalSlides - slidesPerView;
                    currentIndex = Math.min(maxIndex, currentIndex + slidesPerView);
                    track.scrollTo({ left: currentIndex * track.offsetWidth * (slideWidthPercent / 100 + gapSize / 100), behavior: "smooth" });
                }
                updateSlideClass(slidesPerView, currentIndex);
                // console.log("current Index After Next:", currentIndex);
                if (paginationContainer) updatePagination();
            }
        }
        function prevSlide() {
            if(!carouselLoop){
                if(enableInfinite){
                    if(!infiniteLoop){
                        const maxIndex = totalSlides - slidesPerView;
                        currentIndex = (currentIndex <= 0) ? maxIndex : Math.max(0, currentIndex - slidesPerView);
                        track.scrollTo({ left: currentIndex * track.offsetWidth * (slideWidthPercent / 100 + gapSize / 100), behavior: "smooth" });
                    } else {
                        if (isTransitioning) return;
                        let step = singleSlideShift && slidesPerView > 1 ? 1 : slidesPerView;
                        // let minIndex = 0; 
                        
                        currentIndex -= step;
                        transition();
                        checkBoundary(); // Pass direction to checkBoundary
                    }
                } else {
                    currentIndex = Math.max(0, currentIndex - slidesPerView);
                    track.scrollTo({ left: currentIndex * track.offsetWidth * (slideWidthPercent / 100 + gapSize / 100), behavior: "smooth" });
                }
                updateSlideClass(slidesPerView, currentIndex);
                // console.log("current Index  After Prev:", currentIndex);
                if (paginationContainer) updatePagination();
            }
        }
        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);

        const keynavEnabled = slider.classList.contains('keyboard-navigation');
        if(keynavEnabled) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight') nextSlide();
                if (e.key === 'ArrowLeft') prevSlide();
            });
        }

        const autoPlayLoop = slider.className.includes('auto-play');
        const matchPlaySpeed = slider.className.match(/play-speed-(\d+(\.\d+)?)/);
        let autoPlaySpeed = matchPlaySpeed ? parseFloat(matchPlaySpeed[1]) : 3000;
        let autoPlay; // Simpan interval agar tidak duplikat

        if (enableInfinite && infiniteLoop && autoPlayLoop) {
            const startAutoPlay = () => {
                if (!autoPlay) autoPlay = setInterval(nextSlide, autoPlaySpeed);
            };

            const stopAutoPlay = () => {
                clearInterval(autoPlay);
                autoPlay = null;
            };

            startAutoPlay();

            document.addEventListener('keydown', stopAutoPlay);
            document.addEventListener('keyup', startAutoPlay);
            slider.addEventListener('mouseenter', stopAutoPlay);
            slider.addEventListener('mouseleave', startAutoPlay);
        }

        if (carouselLoop) {
            const speedMatch = slider.className.match(/carousel-speed-(\d+)-(\d+)-(\d+)/);
            let carouselSpeed = 100;

            if (speedMatch) {
                const [desktopSpeed, tabletSpeed, mobileSpeed] = speedMatch.slice(1).map(Number);
                const width = window.innerWidth;
                if (width >= 1024) {
                    carouselSpeed = desktopSpeed;
                } else if (width >= 768) {
                    carouselSpeed = tabletSpeed;
                } else {
                    carouselSpeed = mobileSpeed;
                }
            }

            let autoScrollFrame = null;
            const slideTrack = track;
            let translateValue = 0;
            wrapper.style.paddingLeft = 0;
            let acceleration = 1; // mendukung tanda minus
            const defaultDirection = slider.classList.contains('carousel-right') ? 1 : -1;
            let direction = defaultDirection;
            // let direction = -1;
            let isManualScroll = false;
            let lastTime = performance.now();
            let speed = carouselSpeed;
            let manualScrollFrame = null;
            let isAnimating = false;
            let isMouseInside = false;
        
            const firstOriginalSlide = originalSlides[0];
            const lastOriginalSlide = originalSlides[originalSlides.length - 1];
            const firstCloneSlide = track.querySelector('.clone[data-slide="1"]');
            const containerRect = slider.getBoundingClientRect();
            
            const updateFocusClass = () => {
                const enableFocus = slider.classList.contains('carousel-focus');
                if(enableFocus){
                    const containerCenter = containerRect.left + containerRect.width / 2;
                    const focusStart = containerCenter - (containerRect.width * 0.25); // 0.25 kena 2 slide // 0.35 kena 3 slide
                    const focusEnd = containerCenter + (containerRect.width * 0.30); // 0.25 kena 2 slide // 0.35 kena 3 slide
                    const allSlides = slider.querySelectorAll('.iu-slide'); // Ambil semua slide (termasuk clone)
                
                    allSlides.forEach(slide => {
                        const slideRect = slide.getBoundingClientRect();
                        const slideCenter = slideRect.left + slideRect.width / 2;
            
                        if (slideCenter >= focusStart && slideCenter <= focusEnd) {
                            slide.classList.add("is-focus-slide");
                        } else {
                            slide.classList.remove("is-focus-slide");
                        }
                    });
                }
            };   
            
            if (!lastOriginalSlide) {
                console.error("lastOriginalSlide tidak ditemukan!");
                return;
            }

            const animate = (now) => {
                if (isAnimating) return;
                isAnimating = true;
                
                if (!lastTime) lastTime = now;
                const deltaTime = (now - lastTime) / 1000;
                lastTime = now;
        
                translateValue += direction * speed * acceleration * deltaTime;
        
                if (translateValue >= 0) {
                    translateValue = 0;
                    stopManualScroll();
                }
                        
                if (direction === -1 && firstCloneSlide && lastOriginalSlide) {
                    const lastSlideRect = lastOriginalSlide.getBoundingClientRect();
                    const cloneSlideRect = firstCloneSlide.getBoundingClientRect();
        
                    if (lastSlideRect.right <= containerRect.left) {
                        translateValue = cloneSlideRect.left - containerRect.left;
                        slideTrack.style.transition = "none";
                    } else {
                        // slideTrack.style.transition = "transform 0.1s linear";
                        const transitionDuration = Math.min(0.001, 100 / speed * acceleration);
                        slideTrack.style.transition = `transform ${transitionDuration}s linear`;
                    }
                }
                
                 // RESET ARAH 1 (ke kanan)
                if (direction === 1 && firstCloneSlide && firstOriginalSlide) {
                    const firstOriginalOffset = firstOriginalSlide.offsetLeft;

                    // Ini kondisi reset saat original muncul di ujung kiri
                    if (translateValue >= -firstOriginalOffset) {
                        translateValue = firstCloneSlide.offsetLeft * -1;
                        slideTrack.style.transition = "none";
                    } else {
                        // slideTrack.style.transition = "transform 0.1s linear";
                        const transitionDuration = Math.min(0.001, 100 / speed * acceleration);
                        slideTrack.style.transition = `transform ${transitionDuration}s linear`;
                    }
                }

        
                slideTrack.style.transform = `translateX(${translateValue}px)`;
                updateFocusClass();
        
                if (!isManualScroll) {
                    autoScrollFrame = requestAnimationFrame(animate);
                }
        
                isAnimating = false;
            };    
            
            if (direction === 1 && firstCloneSlide) {
                requestAnimationFrame(() => {
                    translateValue = -firstCloneSlide.offsetLeft;
                    slideTrack.style.transform = `translateX(${translateValue}px)`;
                    animate(performance.now());
                });
            } else {
                animate(performance.now());
            }

            const startManualScroll = (newDirection) => {
                isManualScroll = true;
                direction = newDirection;
                acceleration = 3;
        
                const manualAnimate = () => {
                    if (!isManualScroll) return;
        
                    translateValue += direction * speed * acceleration * 0.05;
                    slideTrack.style.transform = `translateX(${translateValue}px)`;
                    updateFocusClass();
        
                    if (newDirection === -1 && firstCloneSlide && lastOriginalSlide) {
                        const lastSlideRect = lastOriginalSlide.getBoundingClientRect();
                        const cloneSlideRect = firstCloneSlide.getBoundingClientRect();
            
                        if (lastSlideRect.right <= containerRect.left) {
                            translateValue = cloneSlideRect.left - containerRect.left;
                            slideTrack.style.transition = "none";
                        } else {
                            const transitionDuration = Math.min(0.001, 100 / speed * acceleration);
                            slideTrack.style.transition = `transform ${transitionDuration}s linear`;
                        }
                    }
                    
                     // RESET ARAH 1 (ke kanan)
                    if (newDirection === 1 && firstCloneSlide && firstOriginalSlide) {
                        const firstOriginalOffset = firstOriginalSlide.offsetLeft;
    
                        // Ini kondisi reset saat original muncul di ujung kiri
                        if (translateValue >= -firstOriginalOffset) {
                            translateValue = firstCloneSlide.offsetLeft * -1;
                            slideTrack.style.transition = "none";
                        } else {
                            const transitionDuration = Math.min(0.001, 100 / speed * acceleration);
                            slideTrack.style.transition = `transform ${transitionDuration}s linear`;
                        }
                    }
        
                    manualScrollFrame = requestAnimationFrame(manualAnimate);
                };
        
                if (!manualScrollFrame) {
                    manualAnimate();
                }
            };
        
            const stopManualScroll = () => {
                isManualScroll = false;
                cancelAnimationFrame(manualScrollFrame);
                manualScrollFrame = null;
        
                if (acceleration <= 1) {
                    acceleration = 1;
                    direction = defaultDirection; // Kembali ke arah autoScroll normal (next)
                    if (!autoScrollFrame && !isMouseInside) animate(performance.now());
                    return;
                }
        
                const easeBackToNormal = () => {
                    if (acceleration > 1) {
                        acceleration -= 0.1;
                        requestAnimationFrame(easeBackToNormal);
                    } else {
                        acceleration = 1;
                        direction = defaultDirection; // Pastikan kembali ke arah normal
                        if (!autoScrollFrame && !isMouseInside) animate(performance.now());
                    }
                };
                easeBackToNormal();
            };            
                        
            
            nextBtn.addEventListener("pointerdown", () => startManualScroll(-1));
            nextBtn.addEventListener("pointerup", stopManualScroll);
            prevBtn.addEventListener("pointerdown", () => startManualScroll(1));
            prevBtn.addEventListener("pointerup", stopManualScroll);
        
            const stopAutoScroll = () => {
                if (!isManualScroll && autoScrollFrame) {
                    cancelAnimationFrame(autoScrollFrame);
                    autoScrollFrame = null;
                }
            };
        
            const resumeAutoScroll = () => {
                if (!autoScrollFrame && !isManualScroll) {
                    lastTime = performance.now(); // reset waktu terakhir sebelum animasi dilanjut
                    autoScrollFrame = requestAnimationFrame(animate);
                }
            };
        
            slider.addEventListener('mouseenter', () => {
                isMouseInside = true;
                stopAutoScroll();
            });
            
            slider.addEventListener('mouseleave', () => {
                isMouseInside = false;
                resumeAutoScroll();
            });
        
            animate(performance.now());
        }
        const swipeable = slider.classList.contains('can-swipe');
        if (swipeable) {
            let isDown = false;
            let startX = 0;
            let moveX = 0;
            let threshold = 50;
          
            const startDrag = (e) => {
              if (e.type === 'mousedown') {
                isDown = true;
                startX = e.pageX;
              } else if (e.type === 'touchstart') {
                isDown = true;
                startX = e.touches[0].clientX;
              }
            };
          
            const moveDrag = (e) => {
              if (!isDown) return;
              moveX = (e.type === 'mousemove') ? e.pageX : e.touches[0].clientX;
            };
          
            const endDrag = () => {
              if (!isDown) return;
              const deltaX = moveX - startX;
              if (Math.abs(deltaX) > threshold) {
                if (deltaX > 0) {
                  prevSlide();
                } else {
                  nextSlide();
                }
              }
              isDown = false;
              startX = 0;
              moveX = 0;
            };
          
            // Desktop
            track.addEventListener('mousedown', startDrag);
            track.addEventListener('mousemove', moveDrag);
            track.addEventListener('mouseup', endDrag);
            track.addEventListener('mouseleave', () => { isDown = false; });
          
            // Mobile
            track.addEventListener('touchstart', startDrag, { passive: true });
            track.addEventListener('touchmove', moveDrag, { passive: true });
            track.addEventListener('touchend', endDrag);
        }
        
        updateSlideClass(slidesPerView, currentIndex);
    });
});
