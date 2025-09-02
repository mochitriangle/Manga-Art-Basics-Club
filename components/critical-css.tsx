export function CriticalCSS() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          /* Critical CSS for above-the-fold content */
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #fff;
          }
          
          /* Prevent layout shifts */
          * {
            box-sizing: border-box;
          }
          
          /* Layout stability - reserve space for dynamic content */
          .layout-stable {
            min-height: 100vh;
            overflow-x: hidden;
          }
          
          /* Prevent image layout shifts */
          img {
            max-width: 100%;
            height: auto;
            display: block;
          }
          
          /* Aspect ratio containers */
          .aspect-video {
            aspect-ratio: 16 / 9;
            width: 100%;
          }
          
          .aspect-square {
            aspect-ratio: 1 / 1;
            width: 100%;
          }
          
          /* Prevent text layout shifts */
          .text-stable {
            line-height: 1.6;
            min-height: 1.6em;
          }
          
          /* Button layout stability */
          .btn-stable {
            min-height: 44px;
            min-width: 120px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
          
          /* Critical layout styles */
          .min-h-screen {
            min-height: 100vh;
          }
          
          .bg-background {
            background-color: #fff;
          }
          
          .antialiased {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          /* Critical navbar styles */
          .navbar {
            position: sticky;
            top: 0;
            z-index: 50;
            background-color: #fff;
            border-bottom: 1px solid #e5e7eb;
          }
          
          /* Critical hero section */
          .hero-section {
            padding: 4rem 0;
            text-align: center;
          }
          
          .hero-title {
            font-size: 3rem;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 1rem;
          }
          
          .hero-subtitle {
            font-size: 1.25rem;
            color: #6b7280;
            margin-bottom: 2rem;
          }
          
          /* Critical button styles */
          .btn-primary {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background-color: #1f2937;
            color: #fff;
            text-decoration: none;
            border-radius: 0.375rem;
            font-weight: 500;
            transition: background-color 0.2s;
          }
          
          .btn-primary:hover {
            background-color: #111827;
          }
          
          /* Loading skeleton */
          .skeleton {
            background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
          }
          
          @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `,
      }}
    />
  )
}
