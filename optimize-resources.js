// Performance optimization script to fix preload warnings and improve LCP
// This script addresses the console warnings about unused preloaded resources

// Fix preload warnings by optimizing resource loading
function optimizeResourceLoading() {
  // Remove unused preloads after page load
  window.addEventListener('load', () => {
    // Find and remove unused preload links
    const preloadLinks = document.querySelectorAll('link[rel="preload"]');
    preloadLinks.forEach(link => {
      // Check if the resource was actually used
      const href = link.getAttribute('href');
      if (href && !isResourceUsed(href)) {
        // Convert preload to prefetch if not used
        link.setAttribute('rel', 'prefetch');
      }
    });
  });
}

function isResourceUsed(href) {
  // Check if a resource was actually used on the page
  if (href.includes('.css')) {
    return document.querySelector(`link[href="${href}"]`);
  }
  if (href.includes('.js')) {
    return document.querySelector(`script[src="${href}"]`);
  }
  return false;
}

// Optimize LCP (Largest Contentful Paint)
function optimizeLCP() {
  // Preload the largest content element
  const lcpElement = document.querySelector('img[src*="pmac-poster"], .hero-title, .hero-section');
  if (lcpElement) {
    // Add loading="eager" to LCP elements
    if (lcpElement.tagName === 'IMG') {
      lcpElement.setAttribute('loading', 'eager');
      lcpElement.setAttribute('fetchpriority', 'high');
    }
  }
}

// Optimize CLS (Cumulative Layout Shift)
function optimizeCLS() {
  // Reserve space for dynamic content
  const dynamicElements = document.querySelectorAll('[data-dynamic]');
  dynamicElements.forEach(el => {
    el.style.minHeight = el.offsetHeight + 'px';
  });
  
  // Prevent layout shifts from images
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (!img.style.aspectRatio && img.naturalWidth && img.naturalHeight) {
      img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
    }
  });
}

// Initialize optimizations
if (typeof window !== 'undefined') {
  optimizeResourceLoading();
  optimizeLCP();
  optimizeCLS();
  
  // Monitor performance
  if ('performance' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP Optimized:', entry.startTime, 'ms');
          
          // Alert if LCP is still slow
          if (entry.startTime > 2500) {
            console.warn('⚠️ LCP still slow after optimization:', entry.startTime, 'ms');
          }
        }
        
        if (entry.entryType === 'layout-shift') {
          if (entry.value > 0.1) {
            console.warn('⚠️ Layout shift detected:', entry.value);
          }
        }
      }
    });
    
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'layout-shift'] });
    } catch (e) {
      console.log('PerformanceObserver not fully supported');
    }
  }
}

export { optimizeResourceLoading, optimizeLCP, optimizeCLS };
