import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Navbar } from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { PerformanceMonitor } from "@/components/performance-monitor"
import "./globals.css"

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
                    {/* Preload critical resources */}
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                    <link rel="dns-prefetch" href="https://byictuxdystsrdbynnsl.supabase.co" />
                    
                    {/* Resource hints for better performance */}
                    <link rel="prefetch" href="/tutorials" />
                    <link rel="prefetch" href="/competitions" />
                    <link rel="prefetch" href="/about" />
                    
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
