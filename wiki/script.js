// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Handle navigation link clicks
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Update active states
                updateActiveNavigation(targetId);
                
                // Smooth scroll to target
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL without jumping
                history.pushState(null, null, targetId);
            }
        });
    });
    
    // Handle scroll-based navigation highlighting
    window.addEventListener('scroll', throttle(updateNavigationOnScroll, 100));
    
    // Initialize navigation on page load
    updateNavigationOnScroll();
});

// Update active navigation based on current section
function updateActiveNavigation(targetId) {
    // Remove active classes from all nav links
    document.querySelectorAll('.nav-link, .sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current links
    document.querySelectorAll(`a[href="${targetId}"]`).forEach(link => {
        link.classList.add('active');
    });
    
    // Update breadcrumb
    updateBreadcrumb(targetId);
}

// Update navigation based on scroll position
function updateNavigationOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100; // Offset for header
    
    let currentSection = null;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            currentSection = section;
        }
    });
    
    if (currentSection) {
        const currentId = '#' + currentSection.id;
        updateActiveNavigation(currentId);
        
        // Update URL without adding to history
        if (history.replaceState) {
            history.replaceState(null, null, currentId);
        }
    }
}

// Update breadcrumb based on current section
function updateBreadcrumb(targetId) {
    const breadcrumb = document.querySelector('.breadcrumb .current');
    if (breadcrumb) {
        const sectionTitles = {
            '#overview': 'Overview',
            '#quick-start': 'Quick Start',
            '#features': 'Features',
            '#crosshair-styles': 'Crosshair Styles',
            '#customization': 'Customization',
            '#modules': 'Modules',
            '#ui-overview': 'UI Overview',
            '#technical': 'Technical',
            '#technology-stack': 'Technology Stack',
            '#requirements': 'Requirements',
            '#architecture': 'Architecture',
            '#installation': 'Installation',
            '#faq': 'FAQ',
            '#notes': 'Important Notes'
        };
        
        breadcrumb.textContent = sectionTitles[targetId] || 'Documentation';
    }
}

// Throttle function for scroll performance
function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function() {
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    }
}

// Add hover effects for interactive elements
document.addEventListener('DOMContentLoaded', function() {
    // Add interactive effects to feature cards
    const featureCards = document.querySelectorAll('.feature-card, .module-card, .tech-item, .style-item');
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click animation to buttons
    const buttons = document.querySelectorAll('.nav-link, .sidebar-link');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
});

// Handle mobile menu toggle (if needed in future)
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');
    
    sidebar.classList.toggle('mobile-open');
    content.classList.toggle('mobile-blur');
}

// Add search functionality (placeholder for future enhancement)
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            // Future: implement search functionality
            console.log('Searching for:', query);
        });
    }
}

// Initialize all interactive features
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
    
    // Add loading animation completion
    document.body.classList.add('loaded');
    
    // Performance optimization: lazy load images if any
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
});
