// ============================================
// FLOATING FOOD PARTICLES
// ============================================
const particleEmojis = ['🍕', '🧁', '🍩', '🍪', '🥐', '🍰', '🧀', '🌶️', '🥑', '🍓', '🍋', '🥕'];
const particlesContainer = document.getElementById('particles');

function createParticle() {
    const particle = document.createElement('span');
    particle.classList.add('particle');
    particle.textContent = particleEmojis[Math.floor(Math.random() * particleEmojis.length)];
    particle.style.left = Math.random() * 100 + '%';
    particle.style.fontSize = (14 + Math.random() * 18) + 'px';
    particle.style.animationDuration = (12 + Math.random() * 18) + 's';
    particle.style.animationDelay = Math.random() * 5 + 's';
    particlesContainer.appendChild(particle);

    // Remove particle after animation completes
    setTimeout(() => {
        particle.remove();
    }, 35000);
}

// Initial burst of particles
for (let i = 0; i < 15; i++) {
    setTimeout(createParticle, i * 300);
}

// Continuous particle creation
setInterval(createParticle, 2500);


// ============================================
// RECIPE NAVIGATION — Switch between recipes
// ============================================
const navCards = document.querySelectorAll('.nav-card');
const recipeCards = document.querySelectorAll('.recipe-card');

// Track per-recipe state
const recipeState = {};

// ============================================
// RECIPE COLOR THEMES
// Each recipe gets its own background gradient + blob colors
// ============================================
const recipeThemes = {
    cake: {
        bg: 'linear-gradient(135deg, #1a0e05 0%, #3e1f0a 40%, #2a1507 100%)',
        blobs: [
            'radial-gradient(circle, #8B4513, transparent)',   // Saddle brown
            'radial-gradient(circle, #D2691E, transparent)',   // Chocolate
            'radial-gradient(circle, #5C3317, transparent)',   // Dark brown
            'radial-gradient(circle, #A0522D, transparent)'    // Sienna
        ]
    },
    icecream: {
        bg: 'linear-gradient(135deg, #1a0a1e 0%, #2d1b4e 40%, #1e1030 100%)',
        blobs: [
            'radial-gradient(circle, #E8A0BF, transparent)',   // Soft pink
            'radial-gradient(circle, #BA68C8, transparent)',   // Lavender
            'radial-gradient(circle, #7EC8E3, transparent)',   // Sky blue
            'radial-gradient(circle, #F8BBD0, transparent)'    // Pastel pink
        ]
    },
    biryani: {
        bg: 'linear-gradient(135deg, #041a0e 0%, #0d3b20 40%, #082a15 100%)',
        blobs: [
            'radial-gradient(circle, #2E8B57, transparent)',   // Sea green
            'radial-gradient(circle, #DAA520, transparent)',   // Saffron gold accent
            'radial-gradient(circle, #228B22, transparent)',   // Forest green
            'radial-gradient(circle, #50C878, transparent)'    // Emerald
        ]
    },
    fries: {
        bg: 'linear-gradient(135deg, #1a1400 0%, #3d3000 40%, #2a2200 100%)',
        blobs: [
            'radial-gradient(circle, #ea750eff, transparent)',   // Gold
            'radial-gradient(circle, #FFA500, transparent)',   // Orange
            'radial-gradient(circle, #7d5e12ff, transparent)',   // Amber
            'radial-gradient(circle, #be6555af, transparent)'    // Warm yellow
        ]
    }
};

// Apply theme colors to background and blobs
function applyTheme(recipeName) {
    const theme = recipeThemes[recipeName];
    if (!theme) return;

    // Smoothly transition body background
    document.body.style.background = theme.bg;

    // Update blob colors
    const blobs = document.querySelectorAll('.blob');
    blobs.forEach((blob, i) => {
        if (theme.blobs[i]) {
            blob.style.background = theme.blobs[i];
        }
    });
}

// Apply initial theme (cake is default active)
applyTheme('cake');

navCards.forEach(nav => {
    nav.addEventListener('click', () => {
        const recipeName = nav.dataset.recipe;

        // Update nav active state
        navCards.forEach(n => n.classList.remove('active'));
        nav.classList.add('active');

        // Show the selected recipe card
        recipeCards.forEach(card => {
            card.classList.remove('active');
        });

        const targetCard = document.getElementById('recipe-' + recipeName);
        if (targetCard) {
            targetCard.classList.add('active');
            // Re-trigger entrance animation
            targetCard.style.animation = 'none';
            targetCard.offsetHeight; // Force reflow
            targetCard.style.animation = 'cardEnter 0.6s ease-out';
        }

        // Apply the recipe's color theme
        applyTheme(recipeName);

        // Smooth scroll to the card
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
});


// ============================================
// RECIPE CARD FUNCTIONALITY
// ============================================

recipeCards.forEach(card => {
    const cardId = card.id;

    // Initialize state for this recipe
    recipeState[cardId] = {
        currentStep: -1,
        timerStarted: false,
        totalSeconds: parseInt(card.dataset.time) * 60,
        remainingSeconds: parseInt(card.dataset.time) * 60,
        intervalId: null
    };

    // --- Toggle Ingredients ---
    const ingredientBtn = card.querySelector('.ingredient-btn');
    const ingredientList = card.querySelector('.ingredient-list');

    ingredientBtn.addEventListener('click', () => {
        ingredientList.classList.toggle('hidden');
        const isHidden = ingredientList.classList.contains('hidden');
        ingredientBtn.innerHTML = isHidden
            ? '<span class="btn-icon">🧂</span> Show Ingredients'
            : '<span class="btn-icon">🧂</span> Hide Ingredients';
    });

    // --- Toggle Steps ---
    const stepsBtn = card.querySelector('.steps-btn');
    const stepsList = card.querySelector('.steps-list');

    stepsBtn.addEventListener('click', () => {
        stepsList.classList.toggle('hidden');
        const isHidden = stepsList.classList.contains('hidden');
        stepsBtn.innerHTML = isHidden
            ? '<span class="btn-icon">📋</span> Show Steps'
            : '<span class="btn-icon">📋</span> Hide Steps';
    });

    // --- Step Navigation ---
    const allSteps = card.querySelectorAll('.steps-list li');
    const progressBar = card.querySelector('.progress-bar');
    const progressText = card.querySelector('.progress-text');
    const startBtn = card.querySelector('.start-btn');
    const nextBtn = card.querySelector('.next-btn');
    const timerValue = card.querySelector('.timer-value');

    function highlightStep() {
        const state = recipeState[cardId];
        allSteps.forEach(step => step.classList.remove('active'));

        if (state.currentStep >= 0 && state.currentStep < allSteps.length) {
            allSteps[state.currentStep].classList.add('active');
            allSteps[state.currentStep].scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            const percent = Math.round(((state.currentStep + 1) / allSteps.length) * 100);
            progressBar.style.width = percent + '%';
            progressText.textContent = percent + '%';
        }
    }

    startBtn.addEventListener('click', () => {
        const state = recipeState[cardId];

        // Show steps
        stepsList.classList.remove('hidden');
        stepsBtn.innerHTML = '<span class="btn-icon">📋</span> Hide Steps';

        // Reset to first step
        state.currentStep = 0;
        highlightStep();

        // Start timer
        startTimer(cardId, timerValue);
    });

    nextBtn.addEventListener('click', () => {
        const state = recipeState[cardId];

        if (state.currentStep < allSteps.length - 1) {
            state.currentStep++;
            highlightStep();
        } else if (state.currentStep === allSteps.length - 1) {
            // All steps completed
            progressBar.style.width = '100%';
            progressText.textContent = '100%';
            state.currentStep++;
        }
    });
});


// ============================================
// TIMER
// ============================================
function startTimer(cardId, timerElement) {
    const state = recipeState[cardId];

    if (state.timerStarted) return;
    state.timerStarted = true;

    state.intervalId = setInterval(() => {
        if (state.remainingSeconds <= 0) {
            clearInterval(state.intervalId);
            timerElement.textContent = '✅ Done!';
            timerElement.style.color = '#00b894';
            return;
        }

        state.remainingSeconds--;

        const minutes = Math.floor(state.remainingSeconds / 60);
        const seconds = state.remainingSeconds % 60;

        timerElement.textContent =
            String(minutes).padStart(2, '0') + ':' +
            String(seconds).padStart(2, '0');
    }, 1000);
}


// ============================================
// HEADER SCROLL EFFECT
// ============================================
let lastScrollY = 0;
window.addEventListener('scroll', () => {
    const header = document.getElementById('siteHeader');
    const currentScrollY = window.scrollY;

    if (currentScrollY > 100) {
        header.style.opacity = '0.6';
        header.style.transform = 'scale(0.95)';
    } else {
        header.style.opacity = '1';
        header.style.transform = 'scale(1)';
    }

    lastScrollY = currentScrollY;
});