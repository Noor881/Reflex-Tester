// navigation.js - Universal Navigation System
// Include this file in all your pages: <script src="navigation.js"></script>

class UniversalNavigation {
    constructor() {
        this.mobileToggle = document.getElementById('mobileToggle');
        this.navMenu = document.getElementById('navMenu');
        this.toggleIcon = document.getElementById('toggleIcon');
        this.isOpen = false;
        
        this.init();
    }

    init() {
        if (!this.mobileToggle || !this.navMenu) return;

        // Mobile toggle click
        this.mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });

        // Close menu when clicking on navigation links (mobile)
        const navLinks = this.navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    this.closeMenu();
                }
            });
        });

        // Close menu when clicking outside (mobile)
        document.addEventListener('click', (e) => {
            if (this.isOpen && 
                !this.navMenu.contains(e.target) && 
                !this.mobileToggle.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.closeMenu();
            }
        });

        // Prevent body scroll when mobile menu is open
        this.navMenu.addEventListener('transitionend', () => {
            if (window.innerWidth <= 768) {
                document.body.style.overflow = this.isOpen ? 'hidden' : 'auto';
            }
        });
    }

    toggleMenu() {
        this.isOpen ? this.closeMenu() : this.openMenu();
    }

    openMenu() {
        this.navMenu.classList.add('active');
        this.updateToggleIcon('✕');
        this.mobileToggle.setAttribute('aria-expanded', 'true');
        this.isOpen = true;
        
        // Prevent body scroll on mobile
        if (window.innerWidth <= 768) {
            document.body.style.overflow = 'hidden';
        }
    }

    closeMenu() {
        this.navMenu.classList.remove('active');
        this.updateToggleIcon('☰');
        this.mobileToggle.setAttribute('aria-expanded', 'false');
        this.isOpen = false;
        
        // Restore body scroll
        document.body.style.overflow = 'auto';
    }

    updateToggleIcon(icon) {
        if (this.toggleIcon) {
            this.toggleIcon.innerHTML = icon;
        } else {
            // Fallback if toggleIcon element doesn't exist
            this.mobileToggle.innerHTML = icon;
        }
    }
}

// Active page highlighter - Automatically highlights current page
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        
        // Check for exact match or if we're on home page
        if (href === currentPage || 
            (currentPage === 'index.html' && href === 'index.html') ||
            (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new UniversalNavigation();
    setActiveNavLink();
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UniversalNavigation, setActiveNavLink };
}
