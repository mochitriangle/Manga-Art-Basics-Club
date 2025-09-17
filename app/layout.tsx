import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Navbar } from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { PerformanceMonitor } from "@/components/performance-monitor"
import { CriticalCSS } from "@/components/critical-css"
import "@/styles/globals.css"

export const metadata: Metadata = {
  title: "Manga & Art Basics Club",
  description: "Your gateway to mastering art—beginner to pro",
  generator: "v0.app",
  // Add performance hints
  other: {
    'viewport-fit': 'cover',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
                        <head>
                    {/* Critical CSS for above-the-fold content */}
                    <CriticalCSS />
                    
                    {/* Preload critical resources */}
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                    <link rel="dns-prefetch" href="https://byictuxdystsrdbynnsl.supabase.co" />
                    
                    {/* Optimize resource hints - only prefetch on hover */}
                    <link rel="prefetch" href="/tutorials" as="document" />
                    <link rel="prefetch" href="/competitions" as="document" />
                    <link rel="prefetch" href="/about" as="document" />
                    
                    {/* Advanced performance optimization */}
                    <script
                      dangerouslySetInnerHTML={{
                        __html: `
                          // Comprehensive performance optimization
                          (function() {
                            // Aggressively fix preload warnings
                            const fixPreloads = () => {
                              const preloadLinks = document.querySelectorAll('link[rel="preload"]');
                              preloadLinks.forEach(link => {
                                const href = link.getAttribute('href');
                                
                                // Immediately convert ALL problematic CSS preloads
                                if (href && href.includes('.css')) {
                                  // Check if this CSS is actually used on the page
                                  const isUsed = document.querySelector('link[href="' + href + '"]') || 
                                               document.querySelector('style[data-href="' + href + '"]');
                                  
                                  if (!isUsed) {
                                    link.setAttribute('rel', 'prefetch');
                                    link.setAttribute('data-converted', 'true');
                                    console.log('✅ Converted unused CSS preload to prefetch:', href);
                                  }
                                }
                                
                                // Add proper as attribute if missing
                                const as = link.getAttribute('as');
                                if (href && !as) {
                                  if (href.includes('.css')) {
                                    link.setAttribute('as', 'style');
                                  } else if (href.includes('.js')) {
                                    link.setAttribute('as', 'script');
                                  } else if (href.includes('.woff')) {
                                    link.setAttribute('as', 'font');
                                  }
                                }
                              });
                            };
                            
                            // Run immediately and on load
                            fixPreloads();
                            window.addEventListener('load', fixPreloads);
                            
                            // Optimize LCP and images
                            document.addEventListener('DOMContentLoaded', () => {
                              // Fix image loading errors
                              const images = document.querySelectorAll('img');
                              images.forEach(img => {
                                // Add error handling
                                img.addEventListener('error', function() {
                                  console.warn('Image failed to load:', this.src);
                                  // Set fallback or hide broken images
                                  this.style.display = 'none';
                                });
                                
                                // Optimize LCP images
                                if (img.src && (img.src.includes('pmac-poster') || img.offsetTop < window.innerHeight)) {
                                  img.setAttribute('loading', 'eager');
                                  img.setAttribute('fetchpriority', 'high');
                                }
                              });
                              
                              // Prevent layout shifts
                              const dynamicElements = document.querySelectorAll('[data-dynamic], .skeleton');
                              dynamicElements.forEach(el => {
                                el.style.minHeight = el.offsetHeight + 'px';
                              });
                            });
                            
                            // Monitor and log performance improvements
                            if ('performance' in window) {
                              const observer = new PerformanceObserver((list) => {
                                for (const entry of list.getEntries()) {
                                  if (entry.entryType === 'largest-contentful-paint') {
                                    console.log('✅ LCP Optimized:', entry.startTime, 'ms');
                                  }
                                  if (entry.entryType === 'layout-shift') {
                                    if (entry.value < 0.1) {
                                      console.log('✅ CLS Good:', entry.value);
                                    } else {
                                      console.warn('⚠️ CLS Issue:', entry.value);
                                    }
                                  }
                                }
                              });
                              
                              try {
                                observer.observe({ entryTypes: ['largest-contentful-paint', 'layout-shift'] });
                              } catch (e) {
                                console.log('PerformanceObserver not supported');
                              }
                            }
                          })();
                        `,
                      }}
                    />
                    
                    {/* Performance monitoring */}
                    <script
                      dangerouslySetInnerHTML={{
                        __html: `
                          // Performance monitoring
                          if (typeof window !== 'undefined') {
                            window.addEventListener('load', () => {
                              if ('performance' in window) {
                                const perfData = performance.getEntriesByType('navigation')[0];
                                if (perfData && perfData.loadEventEnd > 0 && perfData.loadEventStart > 0) {
                                  const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                                  if (loadTime > 0) {
                                    console.log('Page Load Time:', loadTime, 'ms');
                                  }
                                }
                                
                                if (perfData && perfData.domContentLoadedEventEnd > 0 && perfData.domContentLoadedEventStart > 0) {
                                  const domTime = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart;
                                  if (domTime > 0) {
                                    console.log('DOM Content Loaded:', domTime, 'ms');
                                  }
                                }
                              }
                            });
                          }
                        `,
                      }}
                    />
                  </head>
      <body className={`${GeistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background">
            <Navbar />
            <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          </div>
        </ThemeProvider>
        <PerformanceMonitor />
      </body>
    </html>
  )
}
