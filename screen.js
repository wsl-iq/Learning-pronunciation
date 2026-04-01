/**
 * screen.js - Responsive Screen Manager
 * يتعامل مع توافق الواجهة مع جميع أحجام الشاشات
 * يدعم: الهواتف، الأجهزة اللوحية، أجهزة الكمبيوتر المحمولة، الشاشات الكبيرة
 */

class ScreenManager {
    constructor() {
        // Screen breakpoints
        this.breakpoints = {
            mobile: 480,
            tablet: 768,
            laptop: 1024,
            desktop: 1280,
            wide: 1440,
            ultrawide: 1920
        };
        
        // Current device info
        this.currentDevice = {
            type: 'desktop',
            width: window.innerWidth,
            height: window.innerHeight,
            orientation: this.getOrientation(),
            isTouch: this.isTouchDevice(),
            isMobile: false,
            isTablet: false,
            isDesktop: true
        };
        
        // DOM elements that need responsive handling
        this.responsiveElements = new Map();
        
        // Event listeners
        this.listeners = [];
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize screen manager
     */
    init() {
        this.detectDevice();
        this.setupViewport();
        this.setupResizeListener();
        this.setupOrientationListener();
        this.applyResponsiveClasses();
        this.optimizeForPerformance();
        
        // Dispatch initial event
        this.dispatchScreenEvent();
    }
    
    /**
     * Get current screen orientation
     */
    getOrientation() {
        if (window.screen.orientation) {
            return window.screen.orientation.type.includes('portrait') ? 'portrait' : 'landscape';
        }
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }
    
    /**
     * Detect if device is touch-enabled
     */
    isTouchDevice() {
        return ('ontouchstart' in window) || 
               (navigator.maxTouchPoints > 0) || 
               (navigator.msMaxTouchPoints > 0);
    }
    
    /**
     * Detect device type based on screen width
     */
    detectDevice() {
        const width = window.innerWidth;
        
        // Determine device type
        if (width <= this.breakpoints.mobile) {
            this.currentDevice.type = 'mobile';
            this.currentDevice.isMobile = true;
            this.currentDevice.isTablet = false;
            this.currentDevice.isDesktop = false;
        } else if (width <= this.breakpoints.tablet) {
            this.currentDevice.type = 'tablet';
            this.currentDevice.isMobile = false;
            this.currentDevice.isTablet = true;
            this.currentDevice.isDesktop = false;
        } else if (width <= this.breakpoints.laptop) {
            this.currentDevice.type = 'laptop';
            this.currentDevice.isMobile = false;
            this.currentDevice.isTablet = false;
            this.currentDevice.isDesktop = true;
        } else {
            this.currentDevice.type = 'desktop';
            this.currentDevice.isMobile = false;
            this.currentDevice.isTablet = false;
            this.currentDevice.isDesktop = true;
        }
        
        // Update orientation
        this.currentDevice.orientation = this.getOrientation();
        this.currentDevice.width = width;
        this.currentDevice.height = window.innerHeight;
    }
    
    /**
     * Setup viewport meta for responsive design
     */
    setupViewport() {
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        
        // Different viewport settings for different devices
        if (this.currentDevice.isMobile) {
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes, viewport-fit=cover';
        } else if (this.currentDevice.isTablet) {
            viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=yes';
        } else {
            viewport.content = 'width=device-width, initial-scale=1.0';
        }
    }
    
    /**
     * Setup resize event listener with debounce
     */
    setupResizeListener() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            // Clear timeout
            if (resizeTimeout) clearTimeout(resizeTimeout);
            
            // Add resize class to body for CSS transitions
            document.body.classList.add('resizing');
            
            // Debounce resize event
            resizeTimeout = setTimeout(() => {
                this.handleResize();
                document.body.classList.remove('resizing');
            }, 150);
        });
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        const oldDevice = { ...this.currentDevice };
        this.detectDevice();
        
        // Check if device type changed
        if (oldDevice.type !== this.currentDevice.type) {
            this.onDeviceChange(oldDevice.type, this.currentDevice.type);
        }
        
        // Check if orientation changed
        if (oldDevice.orientation !== this.currentDevice.orientation) {
            this.onOrientationChange(oldDevice.orientation, this.currentDevice.orientation);
        }
        
        // Apply responsive classes
        this.applyResponsiveClasses();
        
        // Update viewport if needed
        this.setupViewport();
        
        // Dispatch resize event
        this.dispatchScreenEvent('resize');
        
        // Trigger custom event for components
        const event = new CustomEvent('screenResize', {
            detail: { device: this.currentDevice }
        });
        window.dispatchEvent(event);
    }
    
    /**
     * Setup orientation change listener
     */
    setupOrientationListener() {
        window.addEventListener('orientationchange', () => {
            // Small delay to get new dimensions
            setTimeout(() => {
                this.handleResize();
            }, 50);
        });
        
        // For modern browsers
        if (screen.orientation) {
            screen.orientation.addEventListener('change', () => {
                this.handleResize();
            });
        }
    }
    
    /**
     * Handle device type change
     */
    onDeviceChange(oldType, newType) {
        console.log(`Device changed: ${oldType} → ${newType}`);
        
        // Update body class
        document.body.classList.remove(`device-${oldType}`);
        document.body.classList.add(`device-${newType}`);
        
        // Adjust UI for new device
        this.adjustUIForDevice(newType);
        
        // Dispatch device change event
        const event = new CustomEvent('deviceChange', {
            detail: { oldType, newType, device: this.currentDevice }
        });
        window.dispatchEvent(event);
    }
    
    /**
     * Handle orientation change
     */
    onOrientationChange(oldOrientation, newOrientation) {
        console.log(`Orientation changed: ${oldOrientation} → ${newOrientation}`);
        
        // Update body class
        document.body.classList.remove(`orientation-${oldOrientation}`);
        document.body.classList.add(`orientation-${newOrientation}`);
        
        // Adjust layouts for orientation
        this.adjustLayoutForOrientation(newOrientation);
        
        // Dispatch orientation change event
        const event = new CustomEvent('orientationChange', {
            detail: { oldOrientation, newOrientation, device: this.currentDevice }
        });
        window.dispatchEvent(event);
    }
    
    /**
     * Apply responsive classes to body
     */
    applyResponsiveClasses() {
        const classes = [
            'device-mobile',
            'device-tablet',
            'device-laptop',
            'device-desktop',
            'orientation-portrait',
            'orientation-landscape'
        ];
        
        // Remove all device/orientation classes
        classes.forEach(cls => {
            document.body.classList.remove(cls);
        });
        
        // Add current device class
        document.body.classList.add(`device-${this.currentDevice.type}`);
        
        // Add orientation class
        document.body.classList.add(`orientation-${this.currentDevice.orientation}`);
        
        // Add touch class if applicable
        if (this.currentDevice.isTouch) {
            document.body.classList.add('touch-device');
        } else {
            document.body.classList.add('no-touch');
        }
        
        // Add screen size class
        const width = this.currentDevice.width;
        if (width < this.breakpoints.mobile) {
            document.body.classList.add('screen-xs');
        } else if (width < this.breakpoints.tablet) {
            document.body.classList.add('screen-sm');
        } else if (width < this.breakpoints.laptop) {
            document.body.classList.add('screen-md');
        } else if (width < this.breakpoints.desktop) {
            document.body.classList.add('screen-lg');
        } else {
            document.body.classList.add('screen-xl');
        }
    }
    
    /**
     * Adjust UI based on device type
     */
    adjustUIForDevice(deviceType) {
        switch(deviceType) {
            case 'mobile':
                this.adjustForMobile();
                break;
            case 'tablet':
                this.adjustForTablet();
                break;
            case 'laptop':
                this.adjustForLaptop();
                break;
            case 'desktop':
                this.adjustForDesktop();
                break;
        }
    }
    
    /**
     * Mobile-specific adjustments
     */
    adjustForMobile() {
        // Adjust navbar
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.style.flexDirection = 'column';
            navbar.style.textAlign = 'center';
            navbar.style.gap = '10px';
        }
        
        // Adjust hero section
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.style.padding = '20px';
        }
        
        // Adjust result card
        const resultCard = document.querySelector('.result-card');
        if (resultCard) {
            resultCard.style.padding = '20px';
        }
        
        // Adjust tabs for horizontal scroll
        const tabsHeader = document.querySelector('.tabs-header');
        if (tabsHeader) {
            tabsHeader.style.overflowX = 'auto';
            tabsHeader.style.flexWrap = 'nowrap';
            tabsHeader.style.WebkitOverflowScrolling = 'touch';
        }
        
        // Adjust modal for fullscreen on mobile
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.alignItems = 'flex-end';
        });
        
        const modalContent = document.querySelectorAll('.modal-content');
        modalContent.forEach(content => {
            content.style.width = '100%';
            content.style.borderRadius = '20px 20px 0 0';
            content.style.maxHeight = '90vh';
            content.style.overflowY = 'auto';
        });
        
        // Hide some elements that take too much space
        const breakdownArrows = document.querySelectorAll('.breakdown-arrow');
        breakdownArrows.forEach(arrow => {
            arrow.style.display = 'none';
        });
        
        // Stack breakdown cards vertically
        const breakdownContainer = document.querySelector('.breakdown-container');
        if (breakdownContainer) {
            breakdownContainer.style.flexDirection = 'column';
            breakdownContainer.style.gap = '15px';
        }
        
        const breakdownCards = document.querySelectorAll('.breakdown-card');
        breakdownCards.forEach(card => {
            card.style.width = '100%';
        });
    }
    
    /**
     * Tablet-specific adjustments
     */
    adjustForTablet() {
        // Adjust navbar
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.style.flexDirection = 'row';
            navbar.style.gap = '15px';
        }
        
        // Adjust result card
        const resultCard = document.querySelector('.result-card');
        if (resultCard) {
            resultCard.style.padding = '25px';
        }
        
        // Keep breakdown in row but smaller
        const breakdownContainer = document.querySelector('.breakdown-container');
        if (breakdownContainer) {
            breakdownContainer.style.flexDirection = 'row';
            breakdownContainer.style.gap = '10px';
        }
        
        const breakdownArrows = document.querySelectorAll('.breakdown-arrow');
        breakdownArrows.forEach(arrow => {
            arrow.style.display = 'block';
        });
        
        // Adjust tabs
        const tabsHeader = document.querySelector('.tabs-header');
        if (tabsHeader) {
            tabsHeader.style.overflowX = 'auto';
            tabsHeader.style.flexWrap = 'nowrap';
        }
        
        // Adjust modals
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.alignItems = 'center';
        });
        
        const modalContent = document.querySelectorAll('.modal-content');
        modalContent.forEach(content => {
            content.style.width = '90%';
            content.style.borderRadius = '20px';
            content.style.maxHeight = '85vh';
        });
    }
    
    /**
     * Laptop-specific adjustments
     */
    adjustForLaptop() {
        // Normal layout
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.style.flexDirection = 'row';
            navbar.style.gap = '20px';
        }
        
        const resultCard = document.querySelector('.result-card');
        if (resultCard) {
            resultCard.style.padding = '30px';
        }
        
        const breakdownContainer = document.querySelector('.breakdown-container');
        if (breakdownContainer) {
            breakdownContainer.style.flexDirection = 'row';
            breakdownContainer.style.gap = '20px';
        }
        
        const tabsHeader = document.querySelector('.tabs-header');
        if (tabsHeader) {
            tabsHeader.style.overflowX = 'visible';
            tabsHeader.style.flexWrap = 'wrap';
        }
    }
    
    /**
     * Desktop-specific adjustments
     */
    adjustForDesktop() {
        // Maximum width container
        const container = document.querySelector('.app-container');
        if (container) {
            container.style.maxWidth = '1400px';
            container.style.margin = '0 auto';
        }
        
        // Enhanced spacing
        const resultCard = document.querySelector('.result-card');
        if (resultCard) {
            resultCard.style.padding = '35px';
        }
        
        // Grid improvements
        const symbolsGrid = document.querySelector('.symbols-grid');
        if (symbolsGrid) {
            symbolsGrid.style.gap = '15px';
        }
        
        const dictionaryGrid = document.querySelector('.dictionary-grid');
        if (dictionaryGrid) {
            dictionaryGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
        }
    }
    
    /**
     * Adjust layout for orientation
     */
    adjustLayoutForOrientation(orientation) {
        if (orientation === 'landscape' && this.currentDevice.isMobile) {
            // Landscape mode on mobile - adjust heights
            document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
            
            const resultCard = document.querySelector('.result-card');
            if (resultCard) {
                resultCard.style.maxHeight = '60vh';
                resultCard.style.overflowY = 'auto';
            }
        } else {
            const resultCard = document.querySelector('.result-card');
            if (resultCard) {
                resultCard.style.maxHeight = 'none';
                resultCard.style.overflowY = 'visible';
            }
        }
    }
    
    /**
     * Register responsive element with custom behavior
     */
    registerElement(element, options = {}) {
        if (!element) return;
        
        const id = element.id || `elem_${Date.now()}_${Math.random()}`;
        this.responsiveElements.set(id, {
            element,
            options,
            currentState: null
        });
        
        // Apply initial responsive styles
        this.applyElementResponsiveness(element, options);
    }
    
    /**
     * Apply responsive styles to specific element
     */
    applyElementResponsiveness(element, options) {
        const { width = this.currentDevice.width } = this.currentDevice;
        
        if (options.hideOnMobile && width <= this.breakpoints.mobile) {
            element.style.display = 'none';
        } else if (options.hideOnTablet && width <= this.breakpoints.tablet && width > this.breakpoints.mobile) {
            element.style.display = 'none';
        } else if (options.hideOnDesktop && width > this.breakpoints.laptop) {
            element.style.display = 'none';
        } else {
            element.style.display = '';
        }
        
        // Apply size-based styles
        if (options.smallText && width <= this.breakpoints.mobile) {
            element.style.fontSize = options.smallText;
        } else if (options.largeText && width > this.breakpoints.desktop) {
            element.style.fontSize = options.largeText;
        } else if (options.defaultText) {
            element.style.fontSize = options.defaultText;
        }
    }
    
    /**
     * Optimize performance for mobile devices
     */
    optimizeForPerformance() {
        if (this.currentDevice.isMobile) {
            // Reduce animations on mobile
            document.body.classList.add('reduce-motion');
            
            // Lazy load images if any
            this.setupLazyLoading();
            
            // Disable heavy effects
            const gradientBg = document.querySelector('.gradient-bg');
            if (gradientBg) {
                gradientBg.style.animation = 'none';
            }
        }
    }
    
    /**
     * Setup lazy loading for images
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const images = document.querySelectorAll('img[data-src]');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => observer.observe(img));
        }
    }
    
    /**
     * Dispatch screen change event
     */
    dispatchScreenEvent(type = 'init') {
        const event = new CustomEvent('screenChange', {
            detail: {
                type,
                device: this.currentDevice,
                breakpoints: this.breakpoints
            }
        });
        window.dispatchEvent(event);
    }
    
    /**
     * Get current device info
     */
    getDeviceInfo() {
        return { ...this.currentDevice };
    }
    
    /**
     * Get current breakpoint
     */
    getCurrentBreakpoint() {
        const width = this.currentDevice.width;
        
        if (width <= this.breakpoints.mobile) return 'mobile';
        if (width <= this.breakpoints.tablet) return 'tablet';
        if (width <= this.breakpoints.laptop) return 'laptop';
        if (width <= this.breakpoints.desktop) return 'desktop';
        if (width <= this.breakpoints.wide) return 'wide';
        return 'ultrawide';
    }
    
    /**
     * Check if screen is within breakpoint range
     */
    isBreakpoint(min, max) {
        const width = this.currentDevice.width;
        const minWidth = this.breakpoints[min] || 0;
        const maxWidth = this.breakpoints[max] || Infinity;
        
        return width >= minWidth && width <= maxWidth;
    }
    
    /**
     * Add custom resize listener
     */
    addResizeListener(callback) {
        if (typeof callback === 'function') {
            this.listeners.push(callback);
            window.addEventListener('screenResize', callback);
        }
    }
    
    /**
     * Remove resize listener
     */
    removeResizeListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
            window.removeEventListener('screenResize', callback);
        }
    }
    
    /**
     * Force reflow and update
     */
    forceUpdate() {
        this.handleResize();
    }
    
    /**
     * Get responsive font size based on screen
     */
    getResponsiveFontSize(baseSize = 16) {
        const width = this.currentDevice.width;
        
        if (width <= 480) return baseSize * 0.8;
        if (width <= 768) return baseSize * 0.9;
        if (width <= 1024) return baseSize;
        if (width <= 1440) return baseSize * 1.1;
        return baseSize * 1.2;
    }
    
    /**
     * Get responsive spacing
     */
    getResponsiveSpacing(baseSpacing = 16) {
        const width = this.currentDevice.width;
        
        if (width <= 480) return baseSpacing * 0.75;
        if (width <= 768) return baseSpacing * 0.875;
        if (width <= 1024) return baseSpacing;
        return baseSpacing * 1.25;
    }
}

/**
 * CSS Classes for responsive design (to be added to style.css)
 */
const responsiveCSS = `
    /* Responsive base styles */
    body {
        transition: all 0.3s ease;
    }
    
    body.resizing * {
        transition: none !important;
    }
    
    /* Device-specific styles */
    body.device-mobile {
        font-size: 14px;
    }
    
    body.device-tablet {
        font-size: 15px;
    }
    
    body.device-laptop, body.device-desktop {
        font-size: 16px;
    }
    
    /* Orientation-specific */
    body.orientation-landscape .result-card {
        max-height: 60vh;
        overflow-y: auto;
    }
    
    /* Touch device optimizations */
    body.touch-device button,
    body.touch-device .clickable {
        min-height: 44px;
        cursor: pointer;
    }
    
    /* Performance optimization for mobile */
    @media (max-width: 768px) {
        body.reduce-motion * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
        
        .gradient-bg {
            display: none;
        }
    }
    
    /* Responsive grid adjustments */
    @media (max-width: 768px) {
        .symbols-grid {
            grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
            gap: 8px;
        }
        
        .dictionary-grid {
            grid-template-columns: 1fr;
        }
        
        .stats-overview {
            grid-template-columns: 1fr;
        }
        
        .options-grid {
            grid-template-columns: 1fr;
        }
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
        .symbols-grid {
            grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
        }
        
        .dictionary-grid {
            grid-template-columns: repeat(2, 1fr);
        }
        
        .stats-overview {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    
    @media (min-width: 1025px) {
        .symbols-grid {
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        }
        
        .dictionary-grid {
            grid-template-columns: repeat(3, 1fr);
        }
        
        .stats-overview {
            grid-template-columns: repeat(4, 1fr);
        }
    }
    
    /* Safe area insets for notched devices */
    @supports (padding: max(0px)) {
        .app-container {
            padding-left: max(20px, env(safe-area-inset-left));
            padding-right: max(20px, env(safe-area-inset-right));
            padding-top: max(20px, env(safe-area-inset-top));
            padding-bottom: max(20px, env(safe-area-inset-bottom));
        }
    }
`;

// Add responsive CSS to document
const styleSheet = document.createElement('style');
styleSheet.textContent = responsiveCSS;
document.head.appendChild(styleSheet);

/**
 * Auto-initialize screen manager when DOM is ready
 */
let screenManager = null;

document.addEventListener('DOMContentLoaded', () => {
    screenManager = new ScreenManager();
    window.screenManager = screenManager; // Make globally available
    
    console.log('Screen Manager initialized', screenManager.getDeviceInfo());
});

/**
 * Export for modules if needed
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ScreenManager, screenManager };
}