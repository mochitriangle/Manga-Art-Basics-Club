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
                    
                    {/* Optimize resource loading */}
                    <script
                      dangerouslySetInnerHTML={{
                        __html: `
                          // Fix preload warnings and optimize performance
                          (function() {
                            // Remove unused preloads after page load
                            window.addEventListener('load', () => {
                              const preloadLinks = document.querySelectorAll('link[rel="preload"]');
                              preloadLinks.forEach(link => {
                                const href = link.getAttribute('href');
                                if (href && href.includes('.css') && !document.querySelector('link[href="' + href + '"]')) {
                                  link.setAttribute('rel', 'prefetch');
                                }
                              });
                            });
                            
                            // Optimize LCP
                            document.addEventListener('DOMContentLoaded', () => {
                              const lcpElement = document.querySelector('img[src*="pmac-poster"]');
                              if (lcpElement) {
                                lcpElement.setAttribute('loading', 'eager');
                                lcpElement.setAttribute('fetchpriority', 'high');
                              }
                            });
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
