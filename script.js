/**
 * Hassan Allam Properties Landing Page Script
 * Author: Properties-egy / Antigravity
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
    initConversionTracking();
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
        const phoneInput = document.getElementById('phone');

        if (!nameInput.value.trim() || !phoneInput.value.trim()) {
            alert('Please fill out all fields.');
            return;
        }

        // Clean spaces, hyphens, parentheses, and dots from input
        let cleanPhone = phoneInput.value.trim().replace(/[\s\-\(\)\.]/g, '');

        // Convert leading 00 to + format (e.g., 00966 -> +966)
        if (cleanPhone.startsWith('00')) {
            cleanPhone = '+' + cleanPhone.slice(2);
        }

        // Accept all valid phone numbers worldwide (7 to 16 digits, with or without +)
        const globalPhoneRegex = /^\+?[0-9]{7,16}$/;
        if (!globalPhoneRegex.test(cleanPhone)) {
            alert('Please enter a valid phone number with country code (e.g. +201003565002, +966501234567)');
            phoneInput.focus();
            return;
        }

        // 2. Prepare Data
        const formData = new FormData(leadForm);
        formData.set('phone', cleanPhone); // Submit cleaned international number
        
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
                phone: cleanPhone
            });
            console.log('To route this form submission to your Gmail live, please register a free access key at https://web3forms.com and paste it in index.html (line ~92).');
            
            setTimeout(() => {
                resetFormState();
                openModal();
                triggerGoogleConversion();
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
                resetFormState();
                openModal();
                triggerGoogleConversion();
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

    function resetFormState() {
        leadForm.reset();
        resetSubmitButton();
    }

    function resetSubmitButton() {
        submitBtn.disabled = false;
        if (spinner) spinner.style.display = 'none';
    }

    function openModal() {
        successModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        successModal.classList.remove('open');
        document.body.style.overflow = 'auto';
    }

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

/* ==========================================================================
   Google Ads Conversion Tracking (WhatsApp Clicks & Form Submissions)
   ========================================================================== */
function triggerGoogleConversion(url) {
    if (typeof gtag_report_conversion === 'function') {
        gtag_report_conversion(url);
    } else if (typeof gtag === 'function') {
        gtag('event', 'conversion', {
            'send_to': 'AW-18387364928/gwUlCPf3iuIcEMDY479E',
            'value': 1.0,
            'currency': 'EGP',
            'event_callback': function () {
                if (typeof url !== 'undefined' && url) {
                    window.location = url;
                }
            }
        });
    } else if (typeof url !== 'undefined' && url) {
        window.location = url;
    }
}

function initConversionTracking() {
    // Attach conversion tracking to all WhatsApp links across the page
    const waLinks = document.querySelectorAll('a[href*="wa.me"]');
    waLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            triggerGoogleConversion();
        });
    });
}
