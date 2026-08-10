/**
 * Hassan Allam Properties Landing Page Script
 * Author: Properties-eg / Antigravity
 * Date: 2026-08-10
 */

document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Initialize Scroll Animations & Effects
    initNavbarScroll();
    initMobileMenu();
    initScrollReveal();
    initFormHandling();
});

/* ==========================================================================
   Navbar Scroll Effect
   ========================================================================== */
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

/* ==========================================================================
   Mobile Navigation Menu Toggle
   ========================================================================== */
function initMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = navMenu.querySelectorAll('a');

    menuToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('open');
        menuToggle.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            menuToggle.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

/* ==========================================================================
   Gallery Swapping Logic
   ========================================================================== */
function switchGallery(sectionId, imagePath, index, thumbElement) {
    let mainImgId = '';
    if (sectionId === 'pc') {
        mainImgId = 'gallery-main-pc';
    } else if (sectionId === 'valleys') {
        mainImgId = 'gallery-main-valleys';
    }
    
    const mainImg = document.getElementById(mainImgId);
    if (!mainImg) return;

    // Fade out main image
    mainImg.style.opacity = '0.3';
    
    setTimeout(() => {
        mainImg.src = imagePath;
        // Fade back in
        mainImg.style.opacity = '1';
        
        // Update gallery navigation display text if it exists
        const indicator = mainImg.parentElement.querySelector('.gallery-indicator');
        if (indicator) {
            indicator.textContent = `${index} / 2`;
        }
    }, 200);

    // Update active thumbnail state
    const thumbsContainer = thumbElement.parentElement;
    const thumbs = thumbsContainer.querySelectorAll('.thumb-item');
    thumbs.forEach(t => t.classList.remove('active'));
    thumbElement.classList.add('active');
}

// Make function global so inline onclick handlers can call it
window.switchGallery = switchGallery;

/* ==========================================================================
   Scroll Reveal Animations
   ========================================================================== */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.animate-reveal');
    
    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.85;
        
        revealElements.forEach(el => {
            const elTop = el.getBoundingClientRect().top;
            if (elTop < triggerBottom) {
                el.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    // Initial run to reveal elements already in view
    revealOnScroll();
}

/* ==========================================================================
   Form Handling & Validation
   ========================================================================== */
function initFormHandling() {
    const leadForm = document.getElementById('lead-form');
    const submitBtn = document.getElementById('submit-btn');
    const spinner = document.getElementById('form-spinner');
    const successModal = document.getElementById('success-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    if (!leadForm) return;

    leadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Perform Validation
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const interestInput = document.getElementById('interest');

        if (!nameInput.value.trim() || !emailInput.value.trim() || !phoneInput.value.trim() || !interestInput.value) {
            alert('Please fill out all fields.');
            return;
        }

        // Egyptian Mobile Number validation: should start with 10, 11, 12, or 15 and contain exactly 10 digits
        // For example: 1003565002
        const egPhoneRegex = /^1[0125][0-9]{8}$/;
        const cleanPhone = phoneInput.value.trim().replace(/\s+/g, '');
        if (!egPhoneRegex.test(cleanPhone)) {
            alert('Please enter a valid Egyptian mobile number (10 digits starting with 10, 11, 12, or 15. E.g. 1003565002)');
            phoneInput.focus();
            return;
        }

        // 2. Prepare Data
        const formData = new FormData(leadForm);
        // Include prefix in the submitted phone field for clarity in email
        formData.set('phone', '+20' + cleanPhone);
        
        const accessKeyInput = document.getElementById('web3forms-key');
        const accessKey = accessKeyInput ? accessKeyInput.value.trim() : '';

        // 3. Show loading state
        submitBtn.disabled = true;
        if (spinner) spinner.style.display = 'inline-block';

        // Check if user is using the placeholder key
        if (accessKey === 'YOUR_WEB3FORMS_ACCESS_KEY_HERE') {
            console.log('%c[Lead Captured - Test Mode]', 'color: #c5a880; font-weight: bold; font-size: 14px;');
            console.log('Lead Details:', {
                name: nameInput.value,
                email: emailInput.value,
                phone: '+20' + cleanPhone,
                interest: interestInput.value
            });
            console.log('To route this form submission to your Gmail live, please register a free access key at https://web3forms.com and paste it in index.html (line ~116).');
            
            // Simulate API request delay for mock experience
            setTimeout(() => {
                resetFormState();
                openModal();
            }, 1200);
            
            return;
        }

        // 4. Submit Live via Web3Forms API
        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Form submission successful
                resetFormState();
                openModal();
            } else {
                console.error('Web3Forms Error:', result);
                alert('Submission failed: ' + (result.message || 'Unknown error occurred. Please try again.'));
                resetSubmitButton();
            }
        } catch (error) {
            console.error('Submission Catch Error:', error);
            alert('An error occurred during submission. Checking network connection...');
            resetSubmitButton();
        }
    });

    // Helper functions
    function resetFormState() {
        leadForm.reset();
        resetSubmitButton();
    }

    function resetSubmitButton() {
        submitBtn.disabled = false;
        if (spinner) spinner.style.display = 'none';
    }

    // Modal Controls
    function openModal() {
        successModal.classList.add('open');
        document.body.style.overflow = 'hidden'; // Stop scrolling
    }

    function closeModal() {
        successModal.classList.remove('open');
        document.body.style.overflow = 'auto'; // Enable scrolling
    }

    // Expose close modal globally
    window.closeModal = closeModal;

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    if (successModal) {
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                closeModal();
            }
        });
    }
}
