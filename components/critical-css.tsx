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
          
          /* Aggressive CLS prevention */
          * {
            box-sizing: border-box;
          }
          
          /* Prevent all layout shifts */
          html, body {
            overflow-x: hidden;
            scroll-behavior: smooth;
          }
          
          /* Reserve space for all dynamic content */
          [data-dynamic], .dynamic-content {
            min-height: 200px;
            width: 100%;
            display: block;
          }
          
          /* Prevent font loading shifts */
          @font-face {
            font-display: swap;
          }
          
          /* Aggressive image stability */
          img, picture, video, canvas, svg {
            display: block;
            max-width: 100%;
            height: auto;
            aspect-ratio: attr(width) / attr(height);
          }
          
          /* Force stable dimensions for all containers */
          .container, .max-w-4xl, .max-w-6xl {
            width: 100%;
            min-height: 100px;
          }
          
          /* Stable grid and flex layouts */
          .grid, .flex {
            min-height: 100px;
          }
          
          /* Prevent text reflow */
          h1, h2, h3, h4, h5, h6, p, span, div {
            contain: layout style;
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
          
          /* Fix for Next.js Image component */
          img[data-nimg="fill"] {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          
          /* Prevent layout shifts from dynamic content */
          [data-dynamic] {
            min-height: 200px;
          }
          
          /* Optimize poster container */
          .poster-container {
            position: relative;
            width: 100%;
            aspect-ratio: 1650 / 2562;
            background-color: #f3f4f6;
            border-radius: 0.5rem;
            overflow: hidden;
          }
          
          /* Prevent layout shifts from dynamic content */
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
          }
          
          .max-w-4xl {
            max-width: 56rem;
          }
          
          .py-8 {
            padding-top: 2rem;
            padding-bottom: 2rem;
          }
          
          .py-16 {
            padding-top: 4rem;
            padding-bottom: 4rem;
          }
          
          /* Reserve space for dynamic elements */
          .space-y-6 > * + * {
            margin-top: 1.5rem;
          }
          
          .space-y-4 > * + * {
            margin-top: 1rem;
          }
          
          /* Prevent text layout shifts */
          h1, h2, h3, h4, h5, h6 {
            line-height: 1.2;
            margin-bottom: 0.5rem;
          }
          
          p {
            line-height: 1.6;
            margin-bottom: 1rem;
          }
          
          /* Stable button sizes */
          .btn {
            min-height: 44px;
            min-width: 120px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 0.375rem;
            font-weight: 500;
            transition: all 0.2s;
          }
          
          /* Stable form elements */
          input, textarea, select {
            min-height: 44px;
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            font-size: 1rem;
            line-height: 1.5;
          }
          
          textarea {
            min-height: 120px;
            resize: vertical;
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
