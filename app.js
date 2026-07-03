/* ==========================================================================
   INCREDIBLE INDIA EXPLORER - APPLICATION LOGIC
   Pure Vanilla JavaScript for dynamic content, modals, sliders, and games.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initThemeToggle();
    initRotatingText();

    // Page detection routing
    const pathname = window.location.pathname;

    if (pathname.includes('cuisine.html')) {
        initCuisinePage();
    } else if (pathname.includes('festivals.html')) {
        initFestivalsPage();
    } else if (pathname.includes('culture.html')) {
        initCulturePage();
    } else if (pathname.includes('sports.html')) {
        initSportsPage();
    } else {
        // Main landing page (index.html or root)
        initScrollEffects();
        initInteractiveMap();
        initCuisineExplorer();
        initFestivals();
        initCultureSlider();
        initQuiz();
        initBharatGuide();
    }
});

/* ==========================================================================
   1. NAVIGATION & SCROLL EVENTS
   ========================================================================== */

function initNavigation() {
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const btnScrollTop = document.getElementById('btn-scroll-top');
    const exploreDropdown = navMenu?.querySelector('.nav-dropdown .dropdown-menu');

    // Sticky navbar on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            if (btnScrollTop) btnScrollTop.classList.add('visible');
        } else {
            navbar.classList.remove('scrolled');
            if (btnScrollTop) btnScrollTop.classList.remove('visible');
        }
    });

    // Keep the sports page available across the shared navigation pattern.
    if (exploreDropdown && !exploreDropdown.querySelector('a[href="sports.html"]')) {
        const sportsLink = document.createElement('a');
        sportsLink.href = 'sports.html';
        sportsLink.className = 'dropdown-item';
        sportsLink.textContent = 'Sports';
        exploreDropdown.appendChild(sportsLink);
    }

    // Mobile Hamburger Toggle
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('open');
        navMenu.classList.toggle('open');
    });

    // Close mobile menu on nav link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('open');
            navMenu.classList.remove('open');
        });
    });

    // Scroll to Top action
    if (btnScrollTop) {
        btnScrollTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

function initThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;

    // Check localStorage
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'light') {
        document.body.classList.add('light-theme');
        themeBtn.innerText = '🌙';
        themeBtn.setAttribute('title', 'Toggle Dark Mode');
    }

    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        let theme = 'dark';
        if (document.body.classList.contains('light-theme')) {
            theme = 'light';
            themeBtn.innerText = '🌙';
            themeBtn.setAttribute('title', 'Toggle Dark Mode');
        } else {
            themeBtn.innerText = '☀️';
            themeBtn.setAttribute('title', 'Toggle Light Mode');
        }
        localStorage.setItem('theme', theme);
    });
}

function initRotatingText() {
    const rotators = document.querySelectorAll('.rotating-text-wrapper');
    rotators.forEach(wrapper => {
        const wordsStr = wrapper.getAttribute('data-words');
        if (!wordsStr) return;

        const words = wordsStr.split(',').map(w => w.trim());
        if (words.length === 0) return;

        let currentIndex = 0;
        wrapper.innerHTML = `<span class="rotating-text">${words[0]}</span>`;

        setInterval(() => {
            const currentSpan = wrapper.querySelector('.rotating-text');
            currentSpan.style.animation = 'slideOutFade 0.5s ease-in forwards';

            setTimeout(() => {
                currentIndex = (currentIndex + 1) % words.length;
                wrapper.innerHTML = `<span class="rotating-text">${words[currentIndex]}</span>`;
            }, 500);
        }, 3500); // Rotate every 3.5 seconds
    });
}

function initScrollEffects() {
    const fadeSections = document.querySelectorAll('.fade-in-section, .story-step');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.scroll-section');

    // Section entry animations
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Unobserve after showing
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    fadeSections.forEach(section => {
        fadeObserver.observe(section);
    });

    // Active link highlighting on scroll
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, { threshold: 0.4 });

    sections.forEach(section => {
        sectionObserver.observe(section);
    });
}

/* ==========================================================================
   2. INTERACTIVE INDIA MAP
   ========================================================================== */

function initInteractiveMap() {
    const mapContainer = document.getElementById('map-container');
    const tooltip = document.getElementById('map-tooltip');
    const infoPanel = document.getElementById('quick-info-panel');
    const randomBtn = document.getElementById('btn-random-state');
    const viewMoreBtn = document.getElementById('btn-sidebar-view-more');

    // Overlay Selectors
    const storyOverlay = document.getElementById('state-story-overlay');
    const overlayBackBtn = document.getElementById('state-story-back-btn');
    const overlayAudioBtn = document.getElementById('state-story-audio-btn');
    const overlayTitle = document.getElementById('state-story-title');
    const overlayCapital = document.getElementById('state-story-capital');
    const overlayMainText = document.getElementById('state-story-main-text');
    const highlightsGrid = document.getElementById('state-story-highlights-grid');
    const svgContainer = document.getElementById('state-svg-container');

    // Clear loader
    if (!mapContainer) return;
    mapContainer.innerHTML = '';

    // Create SVG element
    const svgNamespace = "http://www.w3.org/2000/svg";
    const svgElement = document.createElementNS(svgNamespace, 'svg');
    svgElement.setAttribute('viewBox', mapData.viewBox);
    svgElement.setAttribute('class', 'india-svg-map');

    // Create group for paths
    const gElement = document.createElementNS(svgNamespace, 'g');

    // Render paths
    mapData.locations.forEach(loc => {
        const pathElement = document.createElementNS(svgNamespace, 'path');
        pathElement.setAttribute('d', loc.path);
        pathElement.setAttribute('id', `state-${loc.id}`);
        pathElement.setAttribute('data-id', loc.id);
        pathElement.setAttribute('data-name', loc.name);

        // Hover effect listeners
        pathElement.addEventListener('mouseenter', (e) => {
            tooltip.innerText = loc.name;
            tooltip.style.opacity = '1';
        });

        pathElement.addEventListener('mousemove', (e) => {
            tooltip.style.left = (e.clientX + 15) + 'px';
            tooltip.style.top = (e.clientY + 15) + 'px';
        });

        pathElement.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });

        // Click interaction listener
        pathElement.addEventListener('click', () => {
            // Remove highlight from other paths
            document.querySelectorAll('.india-svg-map path').forEach(p => {
                p.classList.remove('highlighted-active');
            });

            // Highlight current
            pathElement.classList.add('highlighted-active');

            // Open state modal
            showStateDetails(loc);
        });

        gElement.appendChild(pathElement);
    });

    svgElement.appendChild(gElement);
    mapContainer.appendChild(svgElement);

    // Overlay Close Triggers
    overlayBackBtn.addEventListener('click', closeOverlay);

    // ESC key closes overlay
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeOverlay();
    });

    // View More Button Trigger - Navigate to individual state page
    viewMoreBtn?.addEventListener('click', () => {
        const currentId = viewMoreBtn.getAttribute('data-active-id');
        window.location.href = `states/${currentId}.html`;
    });

    // Helper functions
    function showStateDetails(loc) {
        // Set Details
        overlayTitle.innerText = loc.name;
        overlayCapital.innerText = loc.capital;

        // Format story text as paragraph lines
        const storyRaw = loc.story || loc.description;
        const paragraphs = storyRaw.split('\\n\\n').map(pText => `<p class="story-paragraph">${pText}</p>`).join('');
        overlayMainText.innerHTML = paragraphs;

        // Reapply Drop Cap on first paragraph
        const firstPara = overlayMainText.querySelector('.story-paragraph');
        if (firstPara) firstPara.classList.add('drop-cap');

        // Set up highlights
        highlightsGrid.innerHTML = `
            <div class="highlight-bullet"><span class="bullet-icon">📍</span><span>Capital: ${loc.capital}</span></div>
            <div class="highlight-bullet"><span class="bullet-icon">🍛</span><span>Famous Food: ${loc.food}</span></div>
            <div class="highlight-bullet"><span class="bullet-icon">🎉</span><span>Major Festival: ${loc.festival}</span></div>
        `;

        // Render SVG in canvas
        svgContainer.innerHTML = `
             <svg viewBox="${mapData.viewBox}" style="width: 80%; height: auto; max-height: 50vh; filter: drop-shadow(0px 10px 20px rgba(0,0,0,0.5)); fill: var(--primary-gold);">
                 <path d="${loc.path}"></path>
             </svg>
         `;

        // Set dynamic theme class based on region or just a default vibrant state theme
        storyOverlay.className = 'story-overlay theme-default';

        // Open Overlay
        storyOverlay.classList.add('open');

        // Update Quick Info Sidebar Panel
        infoPanel.className = "info-card active-state";
        const infoContent = document.getElementById('info-panel-content');
        if (infoContent) {
            infoContent.innerHTML = `
                <div class="info-card-header">
                    <div class="icon-circle">📍</div>
                    <h3>${loc.name}</h3>
                </div>
                <p class="info-card-text">
                    <strong>Capital:</strong> ${loc.capital}<br>
                    <strong>Famous Food:</strong> ${loc.food}<br>
                    <strong>Festival:</strong> ${loc.festival}
                </p>
                <p class="info-card-text" style="font-size: 0.95rem; margin-top: -15px;">
                    ${loc.description.substring(0, 110)}...
                </p>
            `;
        }

        if (viewMoreBtn) {
            viewMoreBtn.classList.remove('hidden');
            viewMoreBtn.setAttribute('data-active-id', loc.id);
        }

        // Bind audio button
        overlayAudioBtn.classList.remove('playing');
        overlayAudioBtn.innerHTML = '<span class="audio-icon">🔊</span> Listen to Soundscape';
        stopSoundscape();

        overlayAudioBtn.onclick = () => {
            if (overlayAudioBtn.classList.contains('playing')) {
                overlayAudioBtn.classList.remove('playing');
                overlayAudioBtn.innerHTML = '<span class="audio-icon">🔊</span> Listen to Soundscape';
                stopSoundscape();
            } else {
                overlayAudioBtn.classList.add('playing');
                overlayAudioBtn.innerHTML = '<span class="audio-icon">🔇</span> Stop Soundscape';
                playStateSoundscape(loc.name);
            }
        };

        setupScrollReveals();
        spawnStateParticles();
    }

    function spawnStateParticles() {
        const particlesContainer = document.getElementById('state-canvas-particles');
        if (!particlesContainer) return;
        particlesContainer.innerHTML = '';
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'canvas-particle';
            const size = Math.random() * 6 + 2;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = (Math.random() * 2) + 's';
            particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
            particle.style.background = 'rgba(255, 255, 255, 0.4)';
            particlesContainer.appendChild(particle);
        }
    }

    function closeOverlay() {
        storyOverlay.classList.remove('open');
        stopSoundscape();
    }

    // Explore Random State Action
    randomBtn.addEventListener('click', () => {
        const randomIndex = Math.floor(Math.random() * mapData.locations.length);
        const randomLoc = mapData.locations[randomIndex];

        // Remove previous highlight
        document.querySelectorAll('.india-svg-map path').forEach(p => {
            p.classList.remove('highlighted-active');
        });

        // Trigger path element selection
        const pathEl = document.getElementById(`state-${randomLoc.id}`);
        if (pathEl) {
            pathEl.classList.add('highlighted-active');
            pathEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Show details
        showStateDetails(randomLoc);
    });
}

/* ==========================================================================
   3. CUISINE EXPLORER
   ========================================================================== */

function initCuisineExplorer() {
    const cuisineGrid = document.getElementById('cuisine-grid');
    const tabBtns = document.querySelectorAll('.tab-btn');

    // Initial render
    if (!cuisineGrid) return;
    renderCuisines('all');

    // Filter Trigger click
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active status
            tabBtns.forEach(b => b.classList.remove('active'));
            // Set current active
            btn.classList.add('active');

            const region = btn.getAttribute('data-region');

            // Fading grid animation
            cuisineGrid.style.opacity = '0';
            cuisineGrid.style.transform = 'translateY(15px)';
            cuisineGrid.style.transition = 'opacity 0.25s, transform 0.25s';

            setTimeout(() => {
                renderCuisines(region);
                cuisineGrid.style.opacity = '1';
                cuisineGrid.style.transform = 'translateY(0)';
            }, 250);
        });
    });

    function renderCuisines(regionFilter) {
        cuisineGrid.innerHTML = '';

        const filteredList = regionFilter === 'all'
            ? cuisinesData
            : cuisinesData.filter(item => item.region === regionFilter);

        filteredList.forEach(dish => {
            const card = document.createElement('div');
            card.className = 'cuisine-card glass-card';

            // Determine region badge color
            let badgeClass = 'saffron-bg';
            if (dish.region === 'south') badgeClass = 'gold-bg';
            if (dish.region === 'east') badgeClass = 'green-bg';
            if (dish.region === 'west') badgeClass = 'saffron-bg';
            if (dish.region === 'northeast') badgeClass = 'gold-bg';

            card.innerHTML = `
                <div class="cuisine-card-image">
                    <img src="${dish.image}" alt="${dish.name}" loading="lazy">
                    <span class="cuisine-region-badge ${badgeClass}">${dish.region} India</span>
                </div>
                <div class="cuisine-card-body">
                    <span class="cuisine-origin">${dish.state}</span>
                    <h3>${dish.name}</h3>
                    <p>${dish.description}</p>
                </div>
            `;

            cuisineGrid.appendChild(card);
        });
    }
}

/* ==========================================================================
   4. FESTIVALS TIMELINE
   ========================================================================== */

function initFestivals() {
    const festivalTimeline = document.getElementById('festival-timeline');
    const stateModal = document.getElementById('state-modal');

    if (!festivalTimeline) return;
    festivalTimeline.innerHTML = '';

    festivalsData.forEach(fest => {
        const card = document.createElement('div');
        card.className = 'festival-card glass-card';
        card.innerHTML = `
            <img class="festival-card-img" src="${fest.image}" alt="${fest.name}" loading="lazy">
            <div class="festival-card-content">
                <span class="subtitle">${fest.subtitle}</span>
                <h3>${fest.name}</h3>
                <p>${fest.description}</p>
            </div>
        `;

        // Click festival to navigate to the detailed festivals page
        card.addEventListener('click', () => {
            window.location.href = 'festivals.html';
        });

        festivalTimeline.appendChild(card);
    });
}

/* ==========================================================================
   5. CULTURE SLIDER (CAROUSEL)
   ========================================================================== */

function initCultureSlider() {
    const track = document.getElementById('slider-track');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    const dotsContainer = document.getElementById('slider-dots');

    let currentSlide = 0;

    // Render Culture Items
    if (!track) return;
    track.innerHTML = '';
    cultureData.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'slider-card';
        card.innerHTML = `
            <img class="slider-card-img" src="${item.image}" alt="${item.title}" loading="lazy">
            <div class="slider-card-body">
                <span class="slider-card-category">${item.category}</span>
                <h3>${item.title}</h3>
                <p>${item.description}</p>
            </div>
        `;
        track.appendChild(card);
    });

    // Render Navigation Dots
    dotsContainer.innerHTML = '';
    const totalCards = cultureData.length;

    // Determine responsive slide count limits
    function getVisibleSlidesCount() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }

    function getMaxSlides() {
        return Math.max(0, totalCards - getVisibleSlidesCount());
    }

    function updateDots() {
        dotsContainer.innerHTML = '';
        const dotsCount = getMaxSlides() + 1;

        for (let i = 0; i < dotsCount; i++) {
            const dot = document.createElement('span');
            dot.className = `dot ${i === currentSlide ? 'active' : ''}`;
            dot.addEventListener('click', () => {
                currentSlide = i;
                moveSlider();
            });
            dotsContainer.appendChild(dot);
        }
    }

    function moveSlider() {
        // Limit slide bounds
        const maxSlides = getMaxSlides();
        if (currentSlide < 0) currentSlide = 0;
        if (currentSlide > maxSlides) currentSlide = maxSlides;

        const cardWidthPercent = 100 / getVisibleSlidesCount();
        const gapOffset = 30 * currentSlide / getVisibleSlidesCount(); // 30px is gap in CSS

        // Dynamic track translation calculation
        const percentTranslation = currentSlide * cardWidthPercent;

        // Apply styling transform
        track.style.transform = `translateX(calc(-${percentTranslation}% - ${currentSlide * 20}px))`;

        // Update dot highlights
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            if (index === currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // Button controls click listeners
    nextBtn.addEventListener('click', () => {
        currentSlide++;
        moveSlider();
    });

    prevBtn.addEventListener('click', () => {
        currentSlide--;
        moveSlider();
    });

    // ------------------------------------------------------------------
    // TOUCH SWIPE SUPPORT (mobile)
    // Uses touchstart / touchmove / touchend — no external libraries.
    // Minimum threshold of 50px filters out accidental micro-drags.
    // The vertical guard prevents stealing vertical page-scroll gestures.
    // { passive: false } on touchmove lets us call preventDefault() to
    // stop page judder when a horizontal swipe is confirmed.
    // ------------------------------------------------------------------
    const sliderContainer = document.getElementById('slider-container');
    if (!sliderContainer) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false; // true once we've committed to a horizontal drag

    sliderContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        isSwiping = false;
    }, { passive: true });

    sliderContainer.addEventListener('touchmove', (e) => {
        const deltaX = e.changedTouches[0].screenX - touchStartX;
        const deltaY = e.changedTouches[0].screenY - touchStartY;

        // Commit to horizontal swipe only when horizontal movement is dominant
        if (!isSwiping && Math.abs(deltaX) > Math.abs(deltaY)) {
            isSwiping = true;
        }

        // Once committed to horizontal swipe, block vertical page scroll
        if (isSwiping) {
            e.preventDefault();
        }
    }, { passive: false });

    sliderContainer.addEventListener('touchend', (e) => {
        if (!isSwiping) return; // was a vertical scroll — do nothing

        const deltaX = e.changedTouches[0].screenX - touchStartX;
        const SWIPE_THRESHOLD = 50; // px — ignore accidental micro-drags

        if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
            if (deltaX < 0) {
                // Swiped left → advance to next slide
                currentSlide++;
            } else {
                // Swiped right → go back to previous slide
                currentSlide--;
            }
            moveSlider();
        }

        isSwiping = false;
    }, { passive: true });
    // ------------------------------------------------------------------

    // Initialize layout dots
    updateDots();

    // Re-adjust slider items on resize
    window.addEventListener('resize', () => {
        const max = getMaxSlides();
        if (currentSlide > max) {
            currentSlide = max;
        }
        updateDots();
        moveSlider();
    });
}

/* ==========================================================================
   6. FOOD QUIZ GAME
   ========================================================================== */

function initQuiz() {
    // Screen containers
    const introScreen = document.getElementById('quiz-intro-screen');
    const questionScreen = document.getElementById('quiz-question-screen');
    const resultScreen = document.getElementById('quiz-result-screen');

    // Buttons
    const startBtn = document.getElementById('btn-start-quiz');
    const restartBtn = document.getElementById('btn-restart-quiz');
    const heroStartBtn = document.getElementById('btn-start-quiz-hero');

    // Gameplay fields
    const currentQNum = document.getElementById('current-q-num');
    const progressFill = document.getElementById('quiz-progress-fill');
    const questionText = document.getElementById('quiz-question-text');
    const optionsGrid = document.getElementById('quiz-options-grid');
    const feedback = document.getElementById('quiz-feedback');
    const feedbackIcon = document.getElementById('feedback-icon');
    const feedbackText = document.getElementById('feedback-text');
    const finalScore = document.getElementById('quiz-final-score');
    const resultMsg = document.getElementById('quiz-result-message');

    let currentQuestionIndex = 0;
    let score = 0;
    let locked = false;

    // Start triggers
    if (startBtn) startBtn.addEventListener('click', startQuiz);
    if (restartBtn) restartBtn.addEventListener('click', startQuiz);

    if (heroStartBtn) {
        heroStartBtn.addEventListener('click', () => {
            // Scroll to quiz and start
            document.getElementById('quiz').scrollIntoView({ behavior: 'smooth' });
            startQuiz();
        });
    }

    function startQuiz() {
        if (!introScreen) return;
        currentQuestionIndex = 0;
        score = 0;
        locked = false;

        introScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
        questionScreen.classList.remove('hidden');

        loadQuestion();
    }

    function loadQuestion() {
        locked = false;
        feedback.classList.add('hidden');

        const q = quizQuestions[currentQuestionIndex];

        // Set texts and fills
        currentQNum.innerText = currentQuestionIndex + 1;
        progressFill.style.width = ((currentQuestionIndex + 1) / 8 * 100) + '%';
        questionText.innerText = q.question;

        // Load Options buttons
        optionsGrid.innerHTML = '';
        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerText = opt;
            btn.addEventListener('click', () => selectOption(btn, opt));
            optionsGrid.appendChild(btn);
        });
    }

    function selectOption(clickedBtn, selectedVal) {
        if (locked) return;
        locked = true;

        const q = quizQuestions[currentQuestionIndex];
        const isCorrect = (selectedVal === q.answer);

        const optionBtns = optionsGrid.querySelectorAll('.option-btn');
        optionBtns.forEach(btn => {
            btn.classList.add('disabled');
            // Show correct solution regardless
            if (btn.innerText === q.answer) {
                btn.classList.add('correct');
            }
        });

        if (isCorrect) {
            clickedBtn.classList.add('correct');
            score++;
            showFeedback(true);
        } else {
            clickedBtn.classList.add('wrong');
            showFeedback(false, q.answer);
        }

        // Delay loading next stage
        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < quizQuestions.length) {
                loadQuestion();
            } else {
                showResults();
            }
        }, 1800);
    }

    function showFeedback(isCorrect, correctAnswer) {
        feedback.classList.remove('hidden', 'correct', 'wrong');

        if (isCorrect) {
            feedback.classList.add('correct');
            feedbackIcon.innerText = '✅';
            feedbackText.innerText = 'Correct! Great job!';
        } else {
            feedback.classList.add('wrong');
            feedbackIcon.innerText = '❌';
            feedbackText.innerText = `Incorrect. The answer is ${correctAnswer}`;
        }
    }

    function showResults() {
        questionScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');

        finalScore.innerText = score;

        // Select message matching rank
        if (score === 8) {
            resultMsg.innerText = "Incredible Mastermind! 🏆 You scored a perfect 8/8! You are an expert on India's vast culinary heritage!";
            document.getElementById('quiz-result-icon').innerText = '🏆';
        } else if (score >= 5) {
            resultMsg.innerText = `Great score! 🌟 You got ${score}/8 correct. You have a solid grasp of Indian cuisine!`;
            document.getElementById('quiz-result-icon').innerText = '🌟';
        } else {
            resultMsg.innerText = `You scored ${score}/8. Keep exploring the interactive map and food lists to discover more flavors! 🍛`;
            document.getElementById('quiz-result-icon').innerText = '🍛';
        }
    }
}

/* ==========================================================================
   SUB-PAGES INITIALIZATION LOGIC & MAPPINGS
   ========================================================================== */

const cuisineDetails = {
    "c1": {
        spice: 45, richness: 90, sweetness: 40,
        ingredients: ["Boneless Chicken", "Fresh Tomato Puree", "Butter & Fresh Cream", "Kashmiri Lal Mirch", "Garam Masala", "Kasuri Methi"],
        story: "Originating in the 1950s at the Moti Mahal restaurant in Delhi, Butter Chicken was created by Kundan Lal Gujral. He cleverly mixed leftover tandoori chicken juices with a rich, buttery tomato gravy to keep the chicken moist, creating a global phenomenon."
    },
    "c2": {
        spice: 80, richness: 70, sweetness: 10,
        ingredients: ["Kabuli Chana (Chickpeas)", "Maida Flatbreads", "Pomegranate Seed Powder", "Amchoor (Mango Powder)", "Green Chiles & Ginger", "Carom Seeds"],
        story: "A beloved classic born in the streets of Punjab, Chole Bhature is the ultimate indulgence. The chickpeas are slow-simmered in a dark, tea-infused spice blend, while the bhature dough is fermented to puff up into massive, golden, cloud-like balloons."
    },
    "c3": {
        spice: 75, richness: 85, sweetness: 10,
        ingredients: ["Mutton (Lamb Shoulder)", "Kashmiri Dry Red Chilies", "Fennel Powder", "Ginger Powder", "Maval (Cockscomb flower)", "Asafoetida"],
        story: "Introduced to Kashmir by the Mughals, Rogan Josh is a staple of the royal Kashmiri Wazwan feast. The dish gets its signature crimson color not from hot heat, but from mild Kashmiri red chilies and cockscomb flower petals."
    },
    "c4": {
        spice: 50, richness: 60, sweetness: 15,
        ingredients: ["Fermented Rice Batter", "Mashed Potatoes", "Mustard Seeds & Curry Leaves", "Chana Dal", "Turmeric & Onion", "Coconut Chutney"],
        story: "Originating in the temple city of Udupi, Karnataka, Masala Dosa is a masterpiece of textures. The paper-thin fermented rice crepe is roasted in ghee until crispy outside, wrapping around a soft, seasoned potato-onion mash."
    },
    "c5": {
        spice: 90, richness: 85, sweetness: 10,
        ingredients: ["Basmati Rice", "Marinated Meat (Chicken/Goat)", "Saffron Milk", "Fried Onions (Biryanis)", "Mint & Coriander Leaves", "Rose Water"],
        story: "Perfected in the kitchens of the Nizams of Hyderabad, this legendary dish uses the raw (Kacchi) biryani method. Raw marinated meat is cooked in layers under seal ('Dum') with long-grain Basmati rice, infusing the rice with pure meat juices."
    },
    "c6": {
        spice: 40, richness: 30, sweetness: 10,
        ingredients: ["Parboiled Rice", "Urad Dal", "Toor Dal (Lentils)", "Tamarind Pulp", "Drumstick & Shallots", "Sambar Powder"],
        story: "Idlis are ancient steamed cakes whose origins trace back to Southern India or Indonesia. Fermenting the black lentils and rice batter breaks down nutrients, making Idli and Sambar one of the healthiest and most digestible breakfasts globally."
    },
    "c7": {
        spice: 65, richness: 50, sweetness: 5,
        ingredients: ["Whole Wheat Flour", "Sattu (Roasted Chickpea)", "Roasted Eggplant", "Mustard Oil", "Garlic & Green Chiles", "Ajwain (Carom)"],
        story: "Litti Chokha was once the survival food for peasant armies and revolutionaries in Bihar because of its long shelf-life. The dough balls stuffed with spiced sattu are slow-baked over dung fires, cracked open, dipped in ghee, and eaten with rustic chokha mash."
    },
    "c8": {
        spice: 70, richness: 40, sweetness: 15,
        ingredients: ["Rahu Fish Pieces", "Mustard Oil & Paste", "Panch Phoron (Five-spice)", "Turmeric & Ginger", "Potatoes & Cauliflower", "Green Chiles"],
        story: "Machher Jhol is the ultimate comfort food for every Bengali home. It is a light, spicy fish stew that balances the pungency of mustard oil with fresh green chilies and a digestive blend of five spices, representing Bengal's riverine heritage."
    },
    "c9": {
        spice: 0, richness: 30, sweetness: 95,
        ingredients: ["Chhena (Fresh Milk Curds)", "Sugar Syrup", "Rose Water", "Semolina (Rava)", "Saffron Strands", "Cardamom Powder"],
        story: "The origin of Rasgulla is a famous historical debate between Bengal and Odisha. In Bengal, Nobin Chandra Das popularized the soft, spongy variant in 1868, while in Odisha, the sweet has been offered to Goddess Lakshmi at Jagannath Temple for centuries."
    },
    "c10": {
        spice: 55, richness: 30, sweetness: 35,
        ingredients: ["Gram Flour (Besan)", "Citric Acid & Baking Soda", "Mustard Seeds", "Curry Leaves & Sesame", "Green Chilies", "Grated Coconut"],
        story: "Khaman Dhokla is a steamed, airy, savory snack from Gujarat. The key is fermenting the gram flour batter and steaming it to perfection, followed by a hot tempering of mustard seeds, green chilies, and sugar water that keeps the cake moist."
    },
    "c11": {
        spice: 85, richness: 60, sweetness: 5,
        ingredients: ["Boiled Potatoes", "Gram Flour Batter", "Pav (Bread Roll)", "Dry Garlic-Coconut Chutney", "Salted Green Chili", "Mint-Coriander Chutney"],
        story: "Invented in 1966 by Ashok Vaidya outside Mumbai's Dadar Station, Vada Pav was designed as a cheap, grab-and-go meal for textile mill workers. Today, it is Mumbai's iconic culinary identity, eaten by millions daily across all social classes."
    },
    "c12": {
        spice: 0, richness: 90, sweetness: 80,
        ingredients: ["Egg Yolks", "Thick Coconut Milk", "Pure Ghee", "Sugar", "Flour", "Nutmeg Grating"],
        story: "Bebinca is a classic Indo-Portuguese dessert, often called the 'Queen of Goan Desserts'. Legend says it was invented by a nun named Bebiana at the Santa Monica Convent, who made layers to symbolize the seven hills of Lisbon or Goa."
    },
    "c13": {
        spice: 60, richness: 35, sweetness: 10,
        ingredients: ["Refined Flour Dough", "Minced Vegetables/Meat", "Soy Sauce & Ginger", "Szechuan Pepper", "Garlic & Chilies", "Sesame Oil"],
        story: "Momos entered the culinary fabric of Sikkim and Northeast India through Tibetan traders and refugees. These steamed delicacies have adapted to local palates, featuring spicy red chutneys made from hot local 'Dalle Khursani' chilies."
    },
    "c14": {
        spice: 95, richness: 50, sweetness: 0,
        ingredients: ["Smoked Pork Pieces", "Anishi (Fermented Yam Leaves)", "Fermented Bamboo Shoots", "Raja Mircha (Ghost Pepper)", "Ginger-Garlic", "Local Herbs"],
        story: "A core staple of the Naga tribal hearth, this dish features pork that is slow-smoked over kitchen woodfires for weeks. It is simmered with pungent, sour fermented bamboo shoots and seasoned with Raja Mircha, one of the spiciest chilies in the world."
    },
    "c15": {
        spice: 70, richness: 45, sweetness: 5,
        ingredients: ["Red Hill Rice", "Pork/Chicken Stock", "Ginger Paste", "Black Pepper", "Local Sesame Seeds", "Aromatic Khasi Herbs"],
        story: "Jadoh is a highly sacred and popular rice dish of the Khasi tribe of Meghalaya. Cooked traditionally with red hill rice and pork or chicken, it is served during important festivals and family reunions as a mark of Khasi heritage and hospitality."
    }
};

const festivalHighlights = {
    "Diwali": [
        { icon: "🪔", text: "Clay Diyas & Lighting" },
        { icon: "🎨", text: "Flower & Powder Rangoli" },
        { icon: "🍬", text: "Sharing Mithai (Sweets)" },
        { icon: "🎆", text: "Night Sparklers & Fireworks" }
    ],
    "Holi": [
        { icon: "🎨", text: "Organic Colors (Gulal)" },
        { icon: "💦", text: "Pichkaris & Water Balloons" },
        { icon: "🥛", text: "Thandai & Gujiya Sweets" },
        { icon: "🔥", text: "Holika Dahan Bonfires" }
    ],
    "Eid": [
        { icon: "🌙", text: "Crescent Moon Sighting" },
        { icon: "🕌", text: "Congregational Prayers" },
        { icon: "🥣", text: "Sweet Sheer Khurma Feast" },
        { icon: "🎁", text: "Eidi (Gift-Giving)" }
    ],
    "Pongal": [
        { icon: "🌾", text: "Harvest Sugarcane Stalks" },
        { icon: "🏺", text: "Decorated Clay Boiling Pots" },
        { icon: "☀️", text: "Surya (Sun God) Worship" },
        { icon: "🐄", text: "Decorating Cattle (Mattu)" }
    ],
    "Navratri": [
        { icon: "💃", text: "Garba & Dandiya Dances" },
        { icon: "🥻", text: "Chaniya Choli Dressups" },
        { icon: "🕯️", text: "Ghatasthapana (Holy Jar)" },
        { icon: "🔱", text: "Dussehra Effigy Burning" }
    ],
    "Bihu": [
        { icon: "🥁", text: "Dhol & Pepa Music" },
        { icon: "🌾", text: "Rongali Spring Dance" },
        { icon: "🥞", text: "Pitha Rice Cake Feasts" },
        { icon: "🐃", text: "Community Bonfires" }
    ]
};

function initCuisinePage() {
    const cuisineGrid = document.getElementById('cuisine-grid');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const searchInput = document.getElementById('cuisine-search-input');

    const drawer = document.getElementById('cuisine-drawer');
    const drawerClose = document.getElementById('drawer-close');
    const dRegion = document.getElementById('drawer-region-text');
    const dTitle = document.getElementById('drawer-title');
    const dState = document.getElementById('drawer-state-text');
    const dImg = document.getElementById('drawer-img');
    const dDesc = document.getElementById('drawer-description');
    const dSpice = document.getElementById('fill-spice');
    const dRich = document.getElementById('fill-richness');
    const dSweet = document.getElementById('fill-sweetness');
    const dIngredients = document.getElementById('drawer-ingredients');

    let currentRegion = 'all';
    let searchQuery = '';

    render();

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentRegion = btn.getAttribute('data-region');
            animateRender();
        });
    });

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        animateRender();
    });

    drawerClose.addEventListener('click', closeDrawer);
    drawer.addEventListener('click', (e) => {
        if (e.target === drawer) closeDrawer();
    });

    function closeDrawer() {
        drawer.classList.remove('open');
        document.body.classList.remove('no-scroll');
        document.documentElement.classList.remove('no-scroll');
    }

    function animateRender() {
        cuisineGrid.style.opacity = '0';
        cuisineGrid.style.transform = 'translateY(15px)';
        cuisineGrid.style.transition = 'opacity 0.25s, transform 0.25s';

        setTimeout(() => {
            render();
            cuisineGrid.style.opacity = '1';
            cuisineGrid.style.transform = 'translateY(0)';
        }, 200);
    }

    function render() {
        cuisineGrid.innerHTML = '';

        let filtered = cuisinesData;
        if (currentRegion !== 'all') {
            filtered = filtered.filter(item => item.region === currentRegion);
        }
        if (searchQuery !== '') {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchQuery) ||
                item.state.toLowerCase().includes(searchQuery) ||
                item.description.toLowerCase().includes(searchQuery)
            );
        }

        if (filtered.length === 0) {
            cuisineGrid.innerHTML = `<div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted); font-size: 1.1rem;">No cuisines match your criteria. Try adjusting the filter or search word.</div>`;
            return;
        }

        filtered.forEach(dish => {
            const card = document.createElement('div');
            card.className = 'cuisine-card glass-card';

            let badgeClass = 'saffron-bg';
            if (dish.region === 'south') badgeClass = 'gold-bg';
            if (dish.region === 'east') badgeClass = 'green-bg';
            if (dish.region === 'northeast') badgeClass = 'gold-bg';

            card.innerHTML = `
                <div class="cuisine-card-image">
                    <img src="${dish.image}" alt="${dish.name}" loading="lazy">
                    <span class="cuisine-region-badge ${badgeClass}">${dish.region} India</span>
                </div>
                <div class="cuisine-card-body">
                    <span class="cuisine-origin">${dish.state}</span>
                    <h3>${dish.name}</h3>
                    <p>${dish.description}</p>
                </div>
            `;

            card.addEventListener('click', () => {
                const details = cuisineDetails[dish.id] || {
                    spice: 50, richness: 50, sweetness: 50,
                    ingredients: ["Local spices", "Regional vegetables", "Traditional grains"],
                    story: dish.description
                };

                dRegion.innerText = `${dish.region} India`;
                dRegion.className = `drawer-badge ${badgeClass}`;
                dTitle.innerText = dish.name;
                dState.innerText = `Origin: ${dish.state}`;
                dImg.src = dish.image;
                dImg.alt = dish.name;
                dDesc.innerText = details.story;

                dSpice.style.width = details.spice + '%';
                dRich.style.width = details.richness + '%';
                dSweet.style.width = details.sweetness + '%';

                dIngredients.innerHTML = '';
                details.ingredients.forEach(ing => {
                    const li = document.createElement('li');
                    li.innerText = ing;
                    dIngredients.appendChild(li);
                });

                drawer.classList.add('open');
                document.body.classList.add('no-scroll');
                document.documentElement.classList.add('no-scroll');
            });

            cuisineGrid.appendChild(card);
        });

        // Try Recipe Mode Logic
        const btnTryRecipe = document.getElementById('btn-try-recipe');
        const recipeOverlay = document.getElementById('recipe-mode-overlay');
        const btnExitRecipe = document.getElementById('btn-exit-recipe');
        const recipeTitle = document.getElementById('recipe-title');
        const progressFill = document.getElementById('recipe-progress-fill');
        const stepIndicator = document.getElementById('recipe-step-indicator');
        const stepTitle = document.getElementById('step-title');
        const stepInstruction = document.getElementById('step-instruction');
        const btnPrevStep = document.getElementById('btn-prev-step');
        const btnNextStep = document.getElementById('btn-next-step');

        let currentRecipeSteps = [];
        let currentStepIndex = 0;

        if (btnTryRecipe) {
            btnTryRecipe.onclick = () => {
                recipeTitle.innerText = dTitle.innerText;

                // Generate pseudo-steps based on ingredients
                const ingredientsList = Array.from(dIngredients.querySelectorAll('li')).map(li => li.innerText);
                currentRecipeSteps = [
                    { title: "1. Preparation", text: `Gather and prepare the following ingredients: ${ingredientsList.slice(0, 2).join(', ')}.` },
                    { title: "2. Marination & Sauté", text: `Mix the spices with the base ingredients. Slowly cook the ${ingredientsList.length > 2 ? ingredientsList[2] : "spices"} to release the aromas.` },
                    { title: "3. Simmer & Cook", text: `Add the main elements and let the dish simmer on low heat until fully cooked. Let the flavors meld.` },
                    { title: "4. Garnish & Serve", text: `Finish off with ${ingredientsList.length > 3 ? ingredientsList[3] : "fresh herbs"} and serve hot! Enjoy your authentic meal.` }
                ];

                currentStepIndex = 0;
                updateRecipeUI();
                recipeOverlay.classList.add('active');
            };

            btnExitRecipe.onclick = () => {
                recipeOverlay.classList.remove('active');
            };

            btnPrevStep.onclick = () => {
                if (currentStepIndex > 0) {
                    currentStepIndex--;
                    updateRecipeUI();
                }
            };

            btnNextStep.onclick = () => {
                if (currentStepIndex < currentRecipeSteps.length - 1) {
                    currentStepIndex++;
                    updateRecipeUI();
                } else {
                    // Finished
                    recipeOverlay.classList.remove('active');
                }
            };

            function updateRecipeUI() {
                const step = currentRecipeSteps[currentStepIndex];
                stepTitle.innerText = step.title;
                stepInstruction.innerText = step.text;

                const progress = ((currentStepIndex + 1) / currentRecipeSteps.length) * 100;
                progressFill.style.width = `${progress}%`;
                stepIndicator.innerText = `Step ${currentStepIndex + 1} of ${currentRecipeSteps.length}`;

                btnPrevStep.disabled = currentStepIndex === 0;

                if (currentStepIndex === currentRecipeSteps.length - 1) {
                    btnNextStep.innerText = "Finish 🎉";
                } else {
                    btnNextStep.innerHTML = "Next Step &rarr;";
                }

                // Re-trigger animation
                const card = document.getElementById('recipe-step-card');
                card.classList.remove('animate-slide-up');
                void card.offsetWidth; // trigger reflow
                card.classList.add('animate-slide-up');
            }
        }
    }
}

function initFestivalsPage() {
    const festivalTimeline = document.getElementById('festival-timeline');
    const overlay = document.getElementById('story-overlay');
    const backBtn = document.getElementById('story-back-btn');
    const audioBtn = document.getElementById('story-audio-btn');

    const storyImg = document.getElementById('story-img');
    const particlesContainer = document.getElementById('canvas-particles');
    const shapeContainer = document.getElementById('canvas-shape-container');
    const storySubtitle = document.getElementById('story-subtitle');
    const storyTitle = document.getElementById('story-title');
    const storyMainText = document.getElementById('story-main-text');
    const highlightsGrid = document.getElementById('story-highlights-grid');

    festivalTimeline.innerHTML = '';

    festivalsData.forEach(fest => {
        const card = document.createElement('div');
        card.className = 'festival-card glass-card';
        card.innerHTML = `
            <img class="festival-card-img" src="${fest.image}" alt="${fest.name}" loading="lazy">
            <div class="festival-card-content">
                <span class="subtitle">${fest.subtitle}</span>
                <h3>${fest.name}</h3>
                <p>${fest.description}</p>
            </div>
        `;

        card.addEventListener('click', () => {
            storyImg.src = fest.image;
            storyImg.alt = fest.name;
            storySubtitle.innerText = fest.subtitle;
            storyTitle.innerText = fest.name;

            // Format story text as paragraph lines
            const paragraphs = (fest.story || fest.description)
                .split('\n\n')
                .map(pText => `<p class="story-paragraph">${pText}</p>`)
                .join('');
            storyMainText.innerHTML = paragraphs;

            // Reapply Drop Cap on first paragraph
            const firstPara = storyMainText.querySelector('.story-paragraph');
            if (firstPara) firstPara.classList.add('drop-cap');

            // Set dynamic background color transition class
            overlay.className = `story-overlay theme-${fest.name.toLowerCase()}`;

            // Load highlights
            highlightsGrid.innerHTML = '';
            const highlights = festivalHighlights[fest.name] || [
                { icon: "🎉", text: "Traditional Customs" },
                { icon: "🥣", text: "Festive Meals" },
                { icon: "✨", text: "Joyous Decorations" },
                { icon: "🫂", text: "Community Gatherings" }
            ];

            highlights.forEach(hl => {
                const div = document.createElement('div');
                div.className = 'highlight-bullet';
                div.innerHTML = `<span class="bullet-icon">${hl.icon}</span><span>${hl.text}</span>`;
                highlightsGrid.appendChild(div);
            });

            // Spawns custom CSS-animated shapes
            shapeContainer.innerHTML = '';
            if (fest.name === "Diwali") {
                shapeContainer.innerHTML = `
                    <div class="diya-graphic animate-slide-up">
                        <div class="diya-flame" id="diya-flame-obj"></div>
                        <div class="diya-body"></div>
                    </div>
                `;
            } else if (fest.name === "Holi") {
                let html = '<div class="holi-powders">';
                const offsets = [
                    { x: -70, y: -60, color: 'rgba(239, 68, 68, 0.65)', dx: -40, dy: -30 },
                    { x: 70, y: -50, color: 'rgba(59, 130, 246, 0.65)', dx: 30, dy: -40 },
                    { x: -50, y: 60, color: 'rgba(16, 185, 129, 0.65)', dx: -30, dy: 40 },
                    { x: 50, y: 50, color: 'rgba(236, 72, 153, 0.65)', dx: 40, dy: 30 }
                ];
                offsets.forEach(offset => {
                    html += `
                        <div class="color-cloud" style="
                            left: calc(50% + ${offset.x}px); 
                            top: calc(50% + ${offset.y}px); 
                            background: ${offset.color};
                            width: ${Math.random() * 50 + 90}px;
                            height: ${Math.random() * 50 + 90}px;
                            --dx: ${offset.dx}px;
                            --dy: ${offset.dy}px;
                        "></div>
                    `;
                });
                html += '</div>';
                shapeContainer.innerHTML = html;
            } else if (fest.name === "Eid") {
                shapeContainer.innerHTML = `
                    <div class="eid-lantern">
                        <div class="lantern-cord"></div>
                        <div class="lantern-body"></div>
                    </div>
                `;
            } else if (fest.name === "Pongal") {
                shapeContainer.innerHTML = `
                    <div class="pongal-pot-graphic animate-slide-up">
                        <div class="pongal-foam">
                            <div class="foam-bubble"></div>
                            <div class="foam-bubble"></div>
                            <div class="foam-bubble"></div>
                        </div>
                        <div class="pongal-neck"></div>
                        <div class="pongal-pot"></div>
                    </div>
                `;
            } else if (fest.name === "Navratri") {
                shapeContainer.innerHTML = `
                    <div class="navratri-dandiya animate-slide-up" id="navratri-dandiya-sticks">
                        <div class="dandiya-stick left"></div>
                        <div class="dandiya-stick right"></div>
                    </div>
                `;
            } else if (fest.name === "Bihu") {
                shapeContainer.innerHTML = `
                    <div class="bihu-dhol animate-slide-up">
                        <div class="dhol-drum" id="bihu-dhol-drum"></div>
                    </div>
                `;
            }

            // Open overlay with animations
            overlay.classList.add('open');

            // Trigger scroll triggers
            setupScrollReveals();

            // Trigger themed particles spawning
            spawnThemedParticles(fest.name, particlesContainer);

            // Bind soundscape controllers
            audioBtn.classList.remove('playing');
            audioBtn.innerHTML = '<span class="audio-icon">🔊</span> Listen to Soundscape';
            stopSoundscape();

            audioBtn.onclick = () => {
                if (audioBtn.classList.contains('playing')) {
                    audioBtn.classList.remove('playing');
                    audioBtn.innerHTML = '<span class="audio-icon">🔊</span> Listen to Soundscape';
                    stopSoundscape();
                } else {
                    audioBtn.classList.add('playing');
                    audioBtn.innerHTML = '<span class="audio-icon">🔇</span> Stop Soundscape';

                    let drumEl = null;
                    if (fest.name === "Bihu") {
                        drumEl = document.getElementById('bihu-dhol-drum');
                    } else if (fest.name === "Navratri") {
                        drumEl = document.getElementById('navratri-dandiya-sticks');
                    } else if (fest.name === "Diwali") {
                        drumEl = document.getElementById('diya-flame-obj');
                    }
                    playSoundscape(fest.name, drumEl);
                }
            };
        });

        festivalTimeline.appendChild(card);
    });

    backBtn.addEventListener('click', () => {
        overlay.classList.remove('open');
        particlesContainer.innerHTML = '';
        shapeContainer.innerHTML = '';
        stopSoundscape();
    });
}

function setupScrollReveals() {
    const paragraphs = document.querySelectorAll('.story-paragraph');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    paragraphs.forEach(p => {
        p.classList.remove('reveal');
        observer.observe(p);
    });
}

function spawnThemedParticles(festName, container) {
    container.innerHTML = '';

    if (festName === "Diwali") {
        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.className = 'diya-particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.bottom = Math.random() * 50 + '%';
            p.style.animationDelay = Math.random() * 5 + 's';
            p.style.animationDuration = (Math.random() * 4 + 4) + 's';
            container.appendChild(p);
        }
        for (let i = 0; i < 15; i++) {
            const p = document.createElement('div');
            p.className = 'sparkle-particle';
            p.style.left = Math.random() * 80 + 10 + '%';
            p.style.top = Math.random() * 80 + 10 + '%';
            p.style.setProperty('--x', (Math.random() * 100 - 50) + 'px');
            p.style.setProperty('--y', (Math.random() * 100 - 50) + 'px');
            p.style.animationDelay = Math.random() * 2 + 's';
            container.appendChild(p);
        }
    } else if (festName === "Holi") {
        const colors = ['#ef4444', '#3b82f6', '#10b981', '#ec4899', '#f59e0b', '#8b5cf6'];
        for (let i = 0; i < 15; i++) {
            const p = document.createElement('div');
            p.className = 'splash-particle';
            p.style.left = Math.random() * 80 + 10 + '%';
            p.style.top = Math.random() * 80 + 10 + '%';
            const size = Math.random() * 30 + 15;
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            p.style.background = colors[Math.floor(Math.random() * colors.length)];
            p.style.setProperty('--x', (Math.random() * 160 - 80) + 'px');
            p.style.setProperty('--y', (Math.random() * 160 - 80) + 'px');
            p.style.animationDelay = Math.random() * 3 + 's';
            container.appendChild(p);
        }
    } else if (festName === "Eid") {
        for (let i = 0; i < 25; i++) {
            const p = document.createElement('div');
            p.className = 'star-particle';
            p.innerText = '★';
            p.style.left = Math.random() * 100 + '%';
            p.style.top = Math.random() * 100 + '%';
            p.style.animationDelay = Math.random() * 3 + 's';
            p.style.animationDuration = (Math.random() * 2 + 2) + 's';
            container.appendChild(p);
        }
    } else if (festName === "Pongal") {
        for (let i = 0; i < 15; i++) {
            const p = document.createElement('div');
            p.className = 'steam-particle';
            p.style.left = (Math.random() * 40 + 30) + '%';
            p.style.bottom = '10%';
            p.style.setProperty('--x', (Math.random() * 40 - 20) + 'px');
            p.style.animationDelay = Math.random() * 3 + 's';
            container.appendChild(p);
        }
    } else if (festName === "Navratri" || festName === "Bihu") {
        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.className = 'leaf-particle';
            p.innerText = festName === "Bihu" ? '🍃' : '🌸';
            p.style.left = Math.random() * 100 + '%';
            p.style.setProperty('--x', (Math.random() * 80 - 40) + 'px');
            p.style.animationDelay = Math.random() * 5 + 's';
            p.style.animationDuration = (Math.random() * 4 + 5) + 's';
            container.appendChild(p);
        }
    }
}

/* ==========================================================================
   WEB AUDIO API SOUNDSCAPE SYNTHESIZER
   ========================================================================== */
let audioCtx = null;
let soundscapeActive = false;
let audioTimeout = null;
let currentFestivalPlaying = '';
let activeAudioNodes = [];

function initAudioSynth() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playSoundscape(festName, drumElement) {
    initAudioSynth();
    stopSoundscape();

    soundscapeActive = true;
    currentFestivalPlaying = festName;

    if (festName === "Diwali") {
        playDiwaliSoundscape(drumElement);
    } else if (festName === "Holi") {
        playHoliSoundscape();
    } else if (festName === "Eid") {
        playEidSoundscape();
    } else if (festName === "Pongal") {
        playPongalSoundscape();
    } else if (festName === "Navratri") {
        playNavratriSoundscape(drumElement);
    } else if (festName === "Bihu") {
        playBihuSoundscape(drumElement);
    }
}

function stopSoundscape() {
    soundscapeActive = false;
    currentFestivalPlaying = '';
    if (audioTimeout) {
        clearTimeout(audioTimeout);
        audioTimeout = null;
    }
    // Stop all active running nodes to prevent leaks (especially Eid drone)
    activeAudioNodes.forEach(node => {
        try {
            node.stop();
        } catch (e) {
            // Already stopped or not started
        }
    });
    activeAudioNodes = [];
}

// 1. Diwali Sparkler crackles & dynamic flame flickers
function playDiwaliSoundscape(flameElement) {
    if (!soundscapeActive || currentFestivalPlaying !== "Diwali") return;

    const time = audioCtx.currentTime;
    const bufferSize = audioCtx.sampleRate * 0.08;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() > 0.985 ? (Math.random() * 2 - 1) : 0;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 5000;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.06, time);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();

    // Sparkle flicker visual sync
    if (flameElement && Math.random() > 0.5) {
        flameElement.style.transform = `scale(${Math.random() * 0.2 + 0.95}) rotate(${Math.random() * 4 - 2}deg)`;
        setTimeout(() => {
            if (flameElement) flameElement.style.transform = '';
        }, 100);
    }

    audioTimeout = setTimeout(() => playDiwaliSoundscape(flameElement), 80 + Math.random() * 150);
}

// 2. Holi Dhol strike rhythm
function playHoliSoundscape() {
    let beatIndex = 0;
    const tempo = 120;
    const beatDuration = 60 / tempo;

    function playBeatLoop() {
        if (!soundscapeActive || currentFestivalPlaying !== "Holi") return;

        const pattern = [1, 0, 0.6, 1, 1, 0, 0.6, 0.4];
        const strength = pattern[beatIndex % pattern.length];

        if (strength > 0) {
            synthesizeDholStrike(strength);
        }

        beatIndex++;
        audioTimeout = setTimeout(playBeatLoop, (beatDuration * 1000) / 2);
    }
    playBeatLoop();
}

function synthesizeDholStrike(strength) {
    const time = audioCtx.currentTime;

    // Low drum body
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(strength >= 1 ? 65 : 85, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.35);

    gain.gain.setValueAtTime(strength * 0.45, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.35);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(time);
    osc.stop(time + 0.4);

    // High head snap
    const snapOsc = audioCtx.createOscillator();
    const snapGain = audioCtx.createGain();
    snapOsc.type = "triangle";
    snapOsc.frequency.setValueAtTime(280, time);
    snapOsc.frequency.exponentialRampToValueAtTime(80, time + 0.07);

    snapGain.gain.setValueAtTime(strength * 0.1, time);
    snapGain.gain.exponentialRampToValueAtTime(0.01, time + 0.07);

    snapOsc.connect(snapGain);
    snapGain.connect(audioCtx.destination);
    snapOsc.start(time);
    snapOsc.stop(time + 0.08);
}

// 3. Eid Serene ambient drone & hanging chimes
function playEidSoundscape() {
    let chimeIndex = 0;

    // Continuous ambient drone oscillators
    const drone1 = audioCtx.createOscillator();
    const drone2 = audioCtx.createOscillator();
    const droneGain = audioCtx.createGain();

    drone1.type = "sine";
    drone1.frequency.value = 110; // A2
    drone2.type = "triangle";
    drone2.frequency.value = 165; // E3
    droneGain.gain.value = 0.035;

    drone1.connect(droneGain);
    drone2.connect(droneGain);
    droneGain.connect(audioCtx.destination);

    drone1.start();
    drone2.start();

    activeAudioNodes.push(drone1, drone2);

    function playChimeLoop() {
        if (!soundscapeActive || currentFestivalPlaying !== "Eid") {
            try { drone1.stop(); } catch (e) { }
            try { drone2.stop(); } catch (e) { }
            return;
        }

        const scale = [440, 494, 554, 659, 740]; // Pentatonic Major
        const freq = scale[chimeIndex % scale.length];

        const time = audioCtx.currentTime;
        const chime = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        chime.type = "sine";
        chime.frequency.value = freq;
        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 1.5);

        chime.connect(gain);
        gain.connect(audioCtx.destination);
        chime.start(time);
        chime.stop(time + 1.6);

        chimeIndex++;
        audioTimeout = setTimeout(playChimeLoop, 1500 + Math.random() * 2000);
    }
    playChimeLoop();
}

// 4. Pongal Harvest syncopations
function playPongalSoundscape() {
    let beatIndex = 0;
    const tempo = 96;
    const beatDuration = 60 / tempo;

    function playPongalLoop() {
        if (!soundscapeActive || currentFestivalPlaying !== "Pongal") return;

        const pattern = [1, 0, 0, 1, 0.5, 0, 1, 0.4];
        const strength = pattern[beatIndex % pattern.length];

        if (strength > 0) {
            synthesizeClap(strength);
        }

        beatIndex++;
        audioTimeout = setTimeout(playPongalLoop, (beatDuration * 1000) / 2);
    }
    playPongalLoop();
}

function synthesizeClap(strength) {
    const time = audioCtx.currentTime;
    const bufferSize = audioCtx.sampleRate * 0.08;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1100;
    filter.Q.value = 3;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(strength * 0.16, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start(time);
}

// 5. Navratri Dandiya tapping sticks
function playNavratriSoundscape(sticksElement) {
    let beatIndex = 0;
    const tempo = 124;
    const beatDuration = 60 / tempo;

    function playNavratriLoop() {
        if (!soundscapeActive || currentFestivalPlaying !== "Navratri") return;

        const pattern = [1, 1, 0.6, 1, 0, 1, 1, 0.6];
        const strength = pattern[beatIndex % pattern.length];

        if (strength > 0) {
            synthesizeDandiyaStrike(strength);
            if (sticksElement) {
                sticksElement.classList.add('beat-pulse');
                setTimeout(() => sticksElement.classList.remove('beat-pulse'), 150);
            }
        }

        beatIndex++;
        audioTimeout = setTimeout(playNavratriLoop, (beatDuration * 1000) / 2);
    }
    playNavratriLoop();
}

function synthesizeDandiyaStrike(strength) {
    const time = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(1350, time);
    osc.frequency.exponentialRampToValueAtTime(750, time + 0.04);

    gain.gain.setValueAtTime(strength * 0.14, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(time);
    osc.stop(time + 0.05);
}

// 6. Bihu High-tempo Assamese Dhol beat
function playBihuSoundscape(drumElement) {
    let beatIndex = 0;
    const tempo = 142;
    const beatDuration = 60 / tempo;

    function playBihuLoop() {
        if (!soundscapeActive || currentFestivalPlaying !== "Bihu") return;

        const pattern = [1, 0.5, 1, 0.5, 1, 1, 0.5, 1];
        const strength = pattern[beatIndex % pattern.length];

        if (strength > 0) {
            synthesizeDholStrike(strength * 1.1);
            if (drumElement) {
                drumElement.classList.add('beat-pulse');
                setTimeout(() => drumElement.classList.remove('beat-pulse'), 150);
            }
        }

        beatIndex++;
        audioTimeout = setTimeout(playBihuLoop, (beatDuration * 1000) / 2);
    }
    playBihuLoop();
}

// 7. Generic State Ambient Drone
function playStateSoundscape(stateName) {
    initAudioSynth();
    stopSoundscape();

    soundscapeActive = true;
    currentFestivalPlaying = "State";

    // Play a mystical sitar/flute-like ambient drone
    const drone1 = audioCtx.createOscillator();
    const drone2 = audioCtx.createOscillator();
    const droneGain = audioCtx.createGain();

    drone1.type = "sine";
    drone1.frequency.value = 146.83; // D3
    drone2.type = "triangle";
    drone2.frequency.value = 220.00; // A3

    droneGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    droneGain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 2); // Fade in

    drone1.connect(droneGain);
    drone2.connect(droneGain);
    droneGain.connect(audioCtx.destination);

    drone1.start();
    drone2.start();

    activeAudioNodes.push(drone1, drone2);

    // Add occasional wind chimes/bells
    function playStateChime() {
        if (!soundscapeActive || currentFestivalPlaying !== "State") return;

        const scale = [587.33, 659.25, 739.99, 880.00, 987.77]; // D Major Pentatonic
        const freq = scale[Math.floor(Math.random() * scale.length)];

        const time = audioCtx.currentTime;
        const chime = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        chime.type = "sine";
        chime.frequency.value = freq;
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 2);

        chime.connect(gain);
        gain.connect(audioCtx.destination);
        chime.start(time);
        chime.stop(time + 2.1);

        audioTimeout = setTimeout(playStateChime, 2000 + Math.random() * 4000);
    }
    playStateChime();
}

function initCulturePage() {
    const gridContainer = document.getElementById('culture-grid-container');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const modal = document.getElementById('culture-modal');
    const modalClose = document.getElementById('culture-modal-close');
    const mBadge = document.getElementById('culture-modal-badge');
    const mTitle = document.getElementById('culture-modal-title');
    const mImg = document.getElementById('culture-modal-img');
    const mDesc = document.getElementById('culture-modal-description');

    let currentCategory = 'all';

    render();

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-category');

            gridContainer.style.opacity = '0';
            gridContainer.style.transform = 'translateY(15px)';
            gridContainer.style.transition = 'opacity 0.25s, transform 0.25s';

            setTimeout(() => {
                render();
                gridContainer.style.opacity = '1';
                gridContainer.style.transform = 'translateY(0)';
            }, 200);
        });
    });

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    function closeModal() {
        modal.classList.remove('open');
    }

    function render() {
        gridContainer.innerHTML = '';

        const filtered = currentCategory === 'all'
            ? cultureData
            : cultureData.filter(item => item.category === currentCategory);

        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = 'culture-card-standalone glass-card';
            card.innerHTML = `
                <img src="${item.image}" alt="${item.title}" loading="lazy">
                <div class="cuisine-card-body">
                    <span class="cuisine-origin">${item.category}</span>
                    <h3>${item.title}</h3>
                    <p>${item.description.substring(0, 120)}...</p>
                </div>
            `;

            card.addEventListener('click', () => {
                mBadge.innerText = item.category;
                mBadge.className = `modal-badge ${item.category === 'dance' ? 'green-bg' : item.category === 'music' ? 'gold-bg' : 'saffron-bg'}`;
                mTitle.innerText = item.title;
                mImg.src = item.image;
                mImg.alt = item.title;
                mDesc.innerText = item.description;

                modal.classList.add('open');
            });

            gridContainer.appendChild(card);
        });
    }
}

function initSportsPage() {
    const athleteGrid = document.getElementById('sports-athlete-grid');
    const searchInput = document.getElementById('sports-search-input');
    const filterButtons = document.querySelectorAll('[data-sports-filter]');
    const timelineGrid = document.getElementById('sports-timeline');
    const timelineDetail = document.getElementById('sports-timeline-detail');
    const modal = document.getElementById('sports-modal');
    const modalClose = document.getElementById('sports-modal-close');
    const modalAvatar = document.getElementById('sports-modal-avatar');
    const modalCategory = document.getElementById('sports-modal-category');
    const modalTitle = document.getElementById('sports-modal-title');
    const modalSubtitle = document.getElementById('sports-modal-subtitle');
    const modalStory = document.getElementById('sports-modal-story');
    const modalHighlights = document.getElementById('sports-modal-highlights');
    const modalStats = document.getElementById('sports-modal-stats');
    const sportsSection = document.getElementById('sports-athletes-section');

    if (!athleteGrid || !searchInput || !filterButtons.length || !timelineGrid || !timelineDetail || !modal || !modalClose) {
        return;
    }

    // Sports page uses the same fade-in class as the homepage, but it does
    // not run the homepage scroll observer. Reveal those sections immediately.
    document.querySelectorAll('.fade-in-section').forEach(section => {
        section.classList.add('is-visible');
    });

    const athleteData = [
        {
            id: 'sachin-tendulkar',
            category: 'cricket',
            name: 'Sachin Tendulkar',
            subtitle: 'Master Blaster',
            image: 'assets/sports/sachin-tendulkar.png',
            summary: 'A benchmark for longevity, timing, and calm under pressure.',
            story: 'Sachin Tendulkar became the face of Indian batting for more than two decades. His records, consistency, and composure helped turn cricket into a shared national passion.',
            highlights: ['200 Test matches', '2011 World Cup winner', 'Most international runs'],
            stats: [
                { label: 'Role', value: 'Top-order batter' },
                { label: 'Legacy', value: 'Cricket icon' },
                { label: 'Era', value: '1989-2013' }
            ]
        },
        {
            id: 'ms-dhoni',
            category: 'cricket',
            name: 'M. S. Dhoni',
            subtitle: 'Captain Cool',
            image: 'assets/sports/ms-dhoni.png',
            summary: 'A calm leader who delivered India across formats.',
            story: 'M. S. Dhoni guided India to major white-ball titles and became known for sharp decision-making, calm finishing, and a fearless approach to leadership.',
            highlights: ['2007 T20 World Cup', '2011 ODI World Cup', '2013 Champions Trophy'],
            stats: [
                { label: 'Role', value: 'Wicketkeeper-captain' },
                { label: 'Leadership', value: 'Title-winning captain' },
                { label: 'Style', value: 'Finisher' }
            ]
        },
        {
            id: 'harmanpreet-kaur',
            category: 'cricket',
            name: 'Harmanpreet Kaur',
            subtitle: 'Modern match-winner',
            image: 'assets/sports/harmanpreet-kaur.png',
            summary: 'An aggressive leader shaping the next era of Indian women’s cricket.',
            story: 'Harmanpreet Kaur is one of the most influential voices in Indian women’s cricket. Her power hitting and leadership have helped expand the sport’s visibility and ambition.',
            highlights: ['ICC tournament standout', 'India captain', 'Big-match temperament'],
            stats: [
                { label: 'Role', value: 'Batting all-rounder' },
                { label: 'Focus', value: 'Power play leader' },
                { label: 'Impact', value: 'Women’s cricket growth' }
            ]
        },
        {
            id: 'abhinav-bindra',
            category: 'olympics',
            name: 'Abhinav Bindra',
            image: 'assets/sports/abhinav-bindra.png',
            subtitle: 'India’s first individual Olympic gold medalist',
            summary: 'A milestone figure in India’s Olympic story.',
            story: 'At Beijing 2008, Abhinav Bindra won India’s first individual Olympic gold in shooting. That achievement changed the country’s expectations of what was possible in precision sport.',
            highlights: ['2008 Olympic gold', 'World champion shooter', 'Enduring sporting benchmark'],
            stats: [
                { label: 'Sport', value: 'Shooting' },
                { label: 'Gold', value: 'Olympic champion' },
                { label: 'Era', value: '2000s' }
            ]
        },
        {
            id: 'pv-sindhu',
            category: 'olympics',
            name: 'P. V. Sindhu',
            subtitle: 'Badminton trailblazer',
            image: 'assets/sports/pv-sindhu.png',
            summary: 'A consistent medal contender who raised the bar for Indian badminton.',
            story: 'P. V. Sindhu became the first Indian woman to win two Olympic medals. Her speed, discipline, and clutch play turned badminton into a major national success story.',
            highlights: ['Olympic silver and bronze', 'World Championships medalist', 'Elite badminton standard'],
            stats: [
                { label: 'Sport', value: 'Badminton' },
                { label: 'Signature', value: 'Explosive rallies' },
                { label: 'Legacy', value: 'Two-time Olympic medallist' }
            ]
        },
        {
            id: 'neeraj-chopra',
            category: 'olympics',
            name: 'Neeraj Chopra',
            subtitle: 'Javelin pioneer',
            image: 'assets/sports/neeraj-chopra.png',
            summary: 'The athlete who opened a new chapter for Indian athletics.',
            story: 'Neeraj Chopra won Olympic gold in javelin throw and inspired a wave of interest in track and field. His success showed that Indian athletes could dominate in throwing events on the world stage.',
            highlights: ['2021 Olympic gold', 'World championship medal', 'Athletics breakthrough'],
            stats: [
                { label: 'Sport', value: 'Javelin throw' },
                { label: 'Strength', value: 'Explosive power' },
                { label: 'Impact', value: 'Athletics landmark' }
            ]
        },
        {
            id: 'anup-kumar',
            category: 'indigenous',
            name: 'Anup Kumar',
            subtitle: 'Kabaddi leader',
            image: 'assets/sports/anup-kumar.png',
            summary: 'A composed raider and captain who defined modern kabaddi leadership.',
            story: 'Anup Kumar helped kabaddi move from local grounds to national spotlight. His technique, reading of the mat, and leadership made him a reference point for the sport.',
            highlights: ['Pro Kabaddi era star', 'National captain', 'Kabaddi strategist'],
            stats: [
                { label: 'Sport', value: 'Kabaddi' },
                { label: 'Role', value: 'Raider-captain' },
                { label: 'Legacy', value: 'Modern kabaddi icon' }
            ]
        },
        {
            id: 'pardeep-narwal',
            category: 'indigenous',
            name: 'Pardeep Narwal',
            subtitle: 'Record-setting raider',
            image: 'assets/sports/pradeep-narwal.png',
            summary: 'One of kabaddi’s most feared scorers in the league era.',
            story: 'Pardeep Narwal became a symbol of kabaddi’s fast, tactical evolution. His pace and scoring record helped the sport reach a wider audience through televised league play.',
            highlights: ['Record raid totals', 'League standout', 'High-pressure scorer'],
            stats: [
                { label: 'Sport', value: 'Kabaddi' },
                { label: 'Style', value: 'Explosive raids' },
                { label: 'Impact', value: 'Fan favorite' }
            ]
        },
        {
            id: 'uday-deshpande',
            category: 'indigenous',
            name: 'Uday Deshpande',
            subtitle: 'Mallakhamb revivalist',
            image: 'assets/sports/uday-deshpande.png',
            summary: 'A major figure in preserving and promoting mallakhamb.',
            story: 'Uday Deshpande has been central to the modern revival of mallakhamb, the traditional strength-and-gymnastics discipline. His work kept a historic indigenous practice visible for new generations.',
            highlights: ['Mallakhamb coach', 'Heritage revival', 'Strength and balance expert'],
            stats: [
                { label: 'Sport', value: 'Mallakhamb' },
                { label: 'Focus', value: 'Heritage training' },
                { label: 'Legacy', value: 'Living tradition' }
            ]
        }
    ];

    const timelineData = [
        {
            id: 'all',
            category: 'all',
            year: '1928',
            title: 'India begins its hockey dynasty',
            summary: 'A gold-medal run in Amsterdam helped establish India as a global hockey force and laid early Olympic sporting pride.',
            detail: 'The 1928 Olympic gold in hockey became an early symbol of Indian sporting excellence. It set the tone for future Olympic ambition and gave the country a durable international identity in team sport.'
        },
        {
            id: 'cricket-1983',
            category: 'cricket',
            year: '1983',
            title: 'World Cup triumph at Lord’s',
            summary: 'India’s first Cricket World Cup win transformed cricket into a national obsession.',
            detail: 'The 1983 World Cup victory under Kapil Dev reshaped Indian cricket forever. It proved that India could beat the best on the world stage and inspired a generation of players and fans.'
        },
        {
            id: 'olympics-2008',
            category: 'olympics',
            year: '2008',
            title: 'First individual Olympic gold',
            summary: 'Abhinav Bindra’s shooting gold in Beijing became a defining Olympic breakthrough.',
            detail: 'Bindra’s gold medal in 2008 changed the emotional ceiling of Indian sport. It showed that an individual Indian athlete could deliver gold at the highest level of global competition.'
        },
        {
            id: 'indigenous-2014',
            category: 'indigenous',
            year: '2014',
            title: 'Kabaddi returns to the mainstream',
            summary: 'The league era brought indigenous sports like kabaddi into living rooms across the country.',
            detail: 'Televised league competition gave kabaddi a fresh audience, bigger stages, and stronger youth participation. The format helped connect a traditional game to a modern sports ecosystem.'
        },
        {
            id: 'olympics-2021',
            category: 'olympics',
            year: '2021',
            title: 'Neeraj Chopra wins javelin gold',
            summary: 'India’s first Olympic athletics gold became a landmark moment for track and field.',
            detail: 'Neeraj Chopra’s gold in javelin throw turned athletics into a real medal pathway for India. The victory inspired broader investment and interest in field events.'
        }
    ];

    let activeFilter = 'all';
    let activeTimelineId = 'all';
    let lastFocusedTrigger = null;
    let isModalOpen = false;

    renderTimeline();
    renderTimelineDetail(timelineData[0]);
    setActiveTimelineButton(timelineGrid.querySelector('[data-timeline-id="all"]'));
    renderAthletes();
    setActiveFilterButton(activeFilter);

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            activeFilter = btn.getAttribute('data-sports-filter') || 'all';
            setActiveFilterButton(activeFilter);

            const matchingMilestone = timelineData.find(item => item.category === activeFilter) || timelineData[0];
            activeTimelineId = matchingMilestone.id;
            setActiveTimelineButton(timelineGrid.querySelector(`[data-timeline-id="${matchingMilestone.id}"]`));
            renderTimelineDetail(matchingMilestone);
            renderAthletes();
        });
    });

    searchInput.addEventListener('input', () => {
        renderAthletes();
    });

    timelineGrid.addEventListener('click', (event) => {
        const button = event.target.closest('[data-timeline-filter]');
        if (!button) return;

        const filter = button.getAttribute('data-timeline-filter') || 'all';
        activeTimelineId = button.getAttribute('data-timeline-id') || 'all';
        activeFilter = filter;
        setActiveFilterButton(filter);
        setActiveTimelineButton(button);

        const milestone = timelineData.find(item => item.id === activeTimelineId) || timelineData[0];
        renderTimelineDetail(milestone);
        renderAthletes();
        sportsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    document.addEventListener('keydown', (event) => {
        if (!isModalOpen) return;

        if (event.key === 'Escape') {
            event.preventDefault();
            closeModal();
            return;
        }

        if (event.key === 'Tab') {
            trapModalFocus(event);
        }
    });

    function setActiveFilterButton(filterValue) {
        filterButtons.forEach(btn => {
            const isActive = (btn.getAttribute('data-sports-filter') || 'all') === filterValue;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', String(isActive));
        });
    }

    function setActiveTimelineButton(activeButton) {
        const buttons = timelineGrid.querySelectorAll('[data-timeline-filter]');
        buttons.forEach(btn => {
            const isActive = activeButton ? btn === activeButton : false;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', String(isActive));
        });
    }

    function renderAthletes() {
        const query = searchInput.value.trim().toLowerCase();
        const filteredAthletes = athleteData.filter(athlete => {
            const matchesFilter = activeFilter === 'all' || athlete.category === activeFilter;
            const matchesSearch = !query || [
                athlete.name,
                athlete.subtitle,
                athlete.summary,
                athlete.story,
                athlete.category,
                ...(athlete.highlights || [])
            ].join(' ').toLowerCase().includes(query);
            return matchesFilter && matchesSearch;
        });

        athleteGrid.innerHTML = '';

        if (filteredAthletes.length === 0) {
            athleteGrid.innerHTML = `
                <div class="sports-empty-state glass-card">
                    <h3>No athletes found</h3>
                    <p>Try a different search term or switch back to All categories.</p>
                    <button type="button" class="btn btn-primary" id="sports-reset-filters">Show All Athletes</button>
                </div>
            `;

            const resetBtn = document.getElementById('sports-reset-filters');
            resetBtn?.addEventListener('click', () => {
                searchInput.value = '';
                activeFilter = 'all';
                activeTimelineId = 'all';
                setActiveFilterButton('all');
                setActiveTimelineButton(timelineGrid.querySelector('[data-timeline-id="all"]'));
                renderTimelineDetail(timelineData[0]);
                renderAthletes();
            });
            return;
        }

        filteredAthletes.forEach(athlete => {
            const card = document.createElement('article');
            card.className = 'athlete-card glass-card';
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `View details for ${athlete.name}`);
            card.setAttribute('data-category', athlete.category);

            card.innerHTML = `
                <div class="athlete-card-header">
                    <div class="athlete-media ${athlete.category}">
                        <img src="${athlete.image}" alt="${athlete.name}" loading="lazy">
                    </div>
                    <div class="athlete-card-title">
                        <span class="sports-badge ${athlete.category}">${getCategoryLabel(athlete.category)}</span>
                        <h3>${athlete.name}</h3>
                        <p>${athlete.subtitle}</p>
                    </div>
                </div>
                <p class="athlete-summary">${athlete.summary}</p>
                <div class="achievement-chip-row">
                    ${athlete.highlights.map(item => `<span class="achievement-chip">${item}</span>`).join('')}
                </div>
                <div class="athlete-card-footer">
                    <span class="card-sport-note">Click to explore career highlights</span>
                    <button type="button" class="btn btn-secondary athlete-view-btn">View Details</button>
                </div>
            `;

            card.addEventListener('click', () => openModal(athlete, card));
            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openModal(athlete, card);
                }
            });

            athleteGrid.appendChild(card);
        });
    }

    function renderTimeline() {
        timelineGrid.innerHTML = '';

        timelineData.forEach(item => {
            const timelineButton = document.createElement('button');
            timelineButton.type = 'button';
            timelineButton.className = `sports-timeline-item glass-card ${item.category}`;
            timelineButton.setAttribute('data-timeline-filter', item.category);
            timelineButton.setAttribute('data-timeline-id', item.id);
            timelineButton.setAttribute('aria-pressed', 'false');
            timelineButton.innerHTML = `
                <span class="timeline-year">${item.year}</span>
                <span class="sports-badge ${item.category}">${getCategoryLabel(item.category)}</span>
                <h3>${item.title}</h3>
                <p>${item.summary}</p>
            `;

            timelineGrid.appendChild(timelineButton);
        });
    }

    function renderTimelineDetail(item) {
        timelineDetail.innerHTML = `
            <div class="timeline-detail-head">
                <span class="sports-badge ${item.category}">${getCategoryLabel(item.category)}</span>
                <span class="timeline-detail-year">${item.year}</span>
            </div>
            <h3>${item.title}</h3>
            <p>${item.detail}</p>
        `;
    }

    function openModal(athlete, trigger) {
        lastFocusedTrigger = trigger || document.activeElement;
        isModalOpen = true;

        modalCategory.className = `sports-badge ${athlete.category}`;
        modalCategory.textContent = getCategoryLabel(athlete.category);
        modalTitle.textContent = athlete.name;
        modalSubtitle.textContent = athlete.subtitle;
        modalStory.textContent = athlete.story;

        modalHighlights.innerHTML = athlete.highlights.map(item => `<li>${item}</li>`).join('');
        modalStats.innerHTML = athlete.stats.map(stat => `
            <div class="modal-stat">
                <span class="modal-stat-label">${stat.label}</span>
                <span class="modal-stat-value">${stat.value}</span>
            </div>
        `).join('');

        modalAvatar.className = `sports-modal-avatar ${athlete.category}`;
        modalAvatar.innerHTML = `<img src="${athlete.image}" alt="${athlete.name}" loading="lazy">`;

        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => {
            modalClose.focus();
        });
    }

    function closeModal() {
        if (!isModalOpen) return;

        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        isModalOpen = false;

        if (lastFocusedTrigger && typeof lastFocusedTrigger.focus === 'function') {
            lastFocusedTrigger.focus();
        }
    }

    function trapModalFocus(event) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (!focusableElements.length) return;

        const focusable = Array.from(focusableElements).filter(el => !el.hasAttribute('disabled'));
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function getCategoryLabel(category) {
        if (category === 'cricket') return 'Cricket';
        if (category === 'olympics') return 'Olympics';
        if (category === 'indigenous') return 'Indigenous Sports';
        return 'All';
    }
}

/* ==========================================================================
   BHARAT GUIDE AI LOGIC
   ========================================================================== */

function initBharatGuide() {
    const fabGuide = document.getElementById('fab-guide');
    const chatWindow = document.getElementById('guide-chat-window');
    const btnCloseChat = document.getElementById('btn-close-chat');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const btnSendMsg = document.getElementById('btn-send-msg');

    if (!fabGuide) return; // Not on this page

    // Knowledge Graph is now loaded from chatbot-data.js

    let isSynthesizing = false;

    // Toggle Chat
    fabGuide.addEventListener('click', () => {
        chatWindow.classList.toggle('open');
        if (chatWindow.classList.contains('open')) {
            chatInput.focus();
        }
    });

    btnCloseChat.addEventListener('click', () => {
        chatWindow.classList.remove('open');
        if (isSynthesizing) {
            window.speechSynthesis.cancel();
            isSynthesizing = false;
        }
    });

    // Send Message
    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Add user message
        addMessage(text, 'user-message');
        chatInput.value = '';

        // Determine bot response using external knowledge base
        let response = "I'm sorry, I seem to be having trouble accessing my knowledge base. Let's try again later.";
        if (typeof findBestResponse === 'function') {
            response = findBestResponse(text);
        }

        // Show typing indicator
        const typingId = showTypingIndicator();

        setTimeout(() => {
            removeTypingIndicator(typingId);
            addMessage(response, 'bot-message');
            speakResponse(response);
        }, 1200 + Math.random() * 800);
    }

    btnSendMsg.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Chat UI helpers
    function addMessage(text, className) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${className}`;
        msgDiv.innerHTML = `<div class="message-content">${text}</div>`;
        chatMessages.appendChild(msgDiv);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message bot-message';
        msgDiv.id = id;
        msgDiv.innerHTML = `
            <div class="message-content typing-indicator">
                <span></span><span></span><span></span>
            </div>
        `;
        chatMessages.appendChild(msgDiv);
        scrollToBottom();
        return id;
    }

    function removeTypingIndicator(id) {
        const indicator = document.getElementById(id);
        if (indicator) {
            indicator.remove();
        }
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Web Speech API (Text-to-Speech)
    function speakResponse(text) {
        if (!('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel(); // Cancel any ongoing speech

        const utterance = new SpeechSynthesisUtterance(text);

        // Try to find an Indian English voice for authenticity
        const voices = window.speechSynthesis.getVoices();
        const indianVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('India'));

        if (indianVoice) {
            utterance.voice = indianVoice;
        }

        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        isSynthesizing = true;
        utterance.onend = () => { isSynthesizing = false; };

        window.speechSynthesis.speak(utterance);
    }

    // Ensure voices are loaded (Chrome issue)
    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
        };
    }
}

