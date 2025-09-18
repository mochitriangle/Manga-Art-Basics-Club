import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Navbar } from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { PerformanceMonitor } from "@/components/performance-monitor"
import { CriticalCSS } from "@/components/critical-css"
import { RouteOptimizer } from "@/components/route-optimizer"
import { CLSPreventer } from "@/components/cls-preventer"
import { ErrorBoundary } from "@/components/error-boundary"
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
                    
                    {/* Minimal performance script for stability */}
                    <script
                      dangerouslySetInnerHTML={{
                        __html: `
                  // Basic error handling and minimal optimizations
                  (function() {
                    // Basic error handling
                    window.addEventListener('unhandledrejection', function(event) {
                      console.error('Promise rejection:', event.reason);
                      event.preventDefault();
                    });

                    window.addEventListener('error', function(event) {
                      console.error('Error:', event.error);
                    });

                    // Basic LCP optimization
                    document.addEventListener('DOMContentLoaded', function() {
                      const images = document.querySelectorAll('img');
                      images.forEach(function(img) {
                        if (img.offsetTop < window.innerHeight) {
                          img.setAttribute('loading', 'eager');
                          img.setAttribute('fetchpriority', 'high');
                        }
                      });
                    });
                  })();
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
          <ErrorBoundary>
            <div className="min-h-screen bg-background">
              <Navbar />
              <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
            </div>
          </ErrorBoundary>
        </ThemeProvider>
        <PerformanceMonitor />
        <RouteOptimizer />
        <CLSPreventer />
      </body>
    </html>
  )
}
