# Landing Page Implementation Guide

This guide provides comprehensive instructions for implementing a simple one-page landing site for the Images Manager application. The landing page should maintain visual and stylistic consistency with the main application while providing an engaging introduction to potential users.

## 🎯 Objectives

- Create a professional, modern landing page
- Maintain visual consistency with the main app's design system
- Provide clear information about the application
- Include download links and call-to-action buttons
- Ensure responsive design for all device sizes
- Optimize for performance and SEO

## 🎨 Design Requirements

### Visual Identity

The landing page should reuse the main application's design tokens:

- **Colors**: Use the same color palette defined in `src/styles/variables.ts`
- **Typography**: Inter font family with consistent sizing scale
- **Spacing**: Maintain the same spacing system (4px grid)
- **Border Radius**: Use consistent border radius values
- **Shadows**: Apply the same shadow system for depth

### Brand Colors Reference

```typescript
// Primary Colors
Primary Blue: #3b82f6 (colors.primary[500])
Primary Blue Hover: #2563eb (colors.primary[600])

// Secondary Colors
Gray Scale: #f9fafb to #111827 (colors.gray[50-900])

// Semantic Colors
Success: #10b981 (colors.success[500])
Error: #ef4444 (colors.error[500])
Warning: #f59e0b (colors.warning[500])
```

## 📋 Required Sections

### 1. Hero Section

- **App Name**: "Images Manager"
- **Tagline**: "Organize, tag, and connect your images with ease"
- **Subtitle**: "A powerful desktop application for managing image collections within workspaces with SQLite database support."
- **Primary CTA**: "Download for Windows" / "Download for macOS" / "Download for Linux"
- **Secondary CTA**: "View on GitHub"

### 2. Key Features Section

- **Workspace Management**: Organize images by projects
- **Smart Tagging**: Create and assign custom tags with colors
- **Image Connections**: Link related images together
- **Dark/Light Theme**: Customizable appearance
- **Fast Search**: Quickly find images by tags or metadata
- **SQLite Database**: Reliable local storage

### 3. Screenshots/Preview Section

- Gallery view screenshot
- Image details page screenshot
- Tags management interface
- Connections graph view
- Settings page with theme toggle

### 4. Technical Information

- **Built with**: Tauri 2.0, React 19, TypeScript, Tailwind CSS
- **Database**: SQLite with tauri-plugin-sql
- **Cross-platform**: Windows, macOS, Linux support
- **File Support**: JPG, PNG, GIF, WebP, TIFF, SVG, and more

### 5. Download Section

- Platform-specific download buttons
- System requirements
- Installation instructions
- Link to GitHub releases

### 6. Footer

- GitHub repository link
- Documentation link
- Support/Issues link
- License information

## 🛠 Recommended Technology Stack

### Option 1: Next.js (Recommended)

```bash
npx create-next-app@latest images-manager-landing --typescript --tailwind --app
```

**Benefits**:

- Built-in SEO optimization
- Static site generation
- Image optimization
- Easy deployment to Vercel

### Option 2: Vite + React

```bash
npm create vite@latest images-manager-landing -- --template react-ts
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Benefits**:

- Fast development build times
- Smaller bundle size
- Simple deployment

### Option 3: Plain HTML/CSS/JS

**Benefits**:

- Maximum performance
- No build process
- Easy to host anywhere

## 📁 Recommended Project Structure

```
images-manager-landing/
├── public/
│   ├── images/
│   │   ├── hero-bg.jpg
│   │   ├── screenshot-gallery.png
│   │   ├── screenshot-details.png
│   │   ├── screenshot-tags.png
│   │   └── screenshot-connections.png
│   ├── icons/
│   │   ├── favicon.ico
│   │   ├── app-icon.png
│   │   └── platform-icons/
│   └── downloads/
│       └── (download files or links)
├── src/
│   ├── components/
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Screenshots.tsx
│   │   ├── TechSpecs.tsx
│   │   ├── Downloads.tsx
│   │   └── Footer.tsx
│   ├── styles/
│   │   ├── globals.css
│   │   └── variables.css
│   ├── utils/
│   │   └── constants.ts
│   └── app/
│       ├── layout.tsx
│       └── page.tsx
├── tailwind.config.js
├── package.json
└── README.md
```

## 🎨 CSS Variables Implementation

Create a `variables.css` file that mirrors the main app's design tokens:

```css
:root {
  /* Colors - Light Theme */
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-secondary: #6b7280;
  --color-background: #ffffff;
  --color-surface: #f9fafb;
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-border: #e5e7eb;

  /* Typography */
  --font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;

  /* Spacing */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;

  /* Border Radius */
  --radius-sm: 0.125rem;
  --radius-base: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;

  /* Shadows */
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  --shadow-base: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}

/* Dark Theme */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #111827;
    --color-surface: #1f2937;
    --color-text-primary: #f9fafb;
    --color-text-secondary: #9ca3af;
    --color-border: #374151;
  }
}
```

## 📱 Component Examples

### Hero Component (Next.js/React)

```tsx
import React from "react";
import { Download, Github, ArrowRight } from "lucide-react";

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Images Manager
          </h1>
          <p className="text-xl sm:text-2xl text-blue-600 dark:text-blue-400 mb-4 font-medium">
            Organize, tag, and connect your images with ease
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            A powerful desktop application for managing image collections within
            workspaces with SQLite database support. Create custom tags, link
            related images, and organize your visual assets like never before.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download for Windows
            </button>
            <button className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center gap-2">
              <Github className="w-5 h-5" />
              View on GitHub
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
```

### Features Component

```tsx
import React from "react";
import { FolderOpen, Tag, Link, Palette, Search, Database } from "lucide-react";

const features = [
  {
    icon: FolderOpen,
    title: "Workspace Management",
    description:
      "Organize your images by projects with dedicated workspace folders and databases.",
  },
  {
    icon: Tag,
    title: "Smart Tagging",
    description:
      "Create custom tags with colors to categorize and organize your image collections.",
  },
  {
    icon: Link,
    title: "Image Connections",
    description:
      "Link related images together and visualize relationships with an interactive graph.",
  },
  {
    icon: Palette,
    title: "Dark/Light Theme",
    description:
      "Choose between light and dark themes with workspace-specific preferences.",
  },
  {
    icon: Search,
    title: "Fast Search",
    description:
      "Quickly find images using tags, metadata, or file names with instant results.",
  },
  {
    icon: Database,
    title: "SQLite Database",
    description:
      "Reliable local storage with fast queries and no external dependencies.",
  },
];

const Features: React.FC = () => {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to organize and manage your image collections
            efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg"
            >
              <feature.icon className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
```

## 📸 Screenshot Guidelines

### Required Screenshots

1. **Gallery View**: Show the main image grid with thumbnails
2. **Image Details**: Display the image details page with tags and metadata
3. **Tags Management**: Show the tag creation and management interface
4. **Connections Graph**: Display the relationship graph between images
5. **Theme Toggle**: Show both light and dark theme examples

### Screenshot Specifications

- **Resolution**: 1920x1080 minimum
- **Format**: PNG with transparency where applicable
- **Compression**: Optimize for web without quality loss
- **Consistent Window Size**: Use the same window dimensions for all screenshots
- **Sample Data**: Use realistic sample images and tags

## 🚀 Deployment Options

### 1. Vercel (Recommended for Next.js)

```bash
npm install -g vercel
vercel --prod
```

### 2. Netlify

```bash
npm run build
# Upload dist folder to Netlify
```

### 3. GitHub Pages

```bash
npm run build
# Push dist folder to gh-pages branch
```

### 4. Static Hosting

- Upload build files to any static hosting service
- Configure custom domain if needed

## 🔧 SEO and Performance Optimization

### Meta Tags

```html
<meta
  name="description"
  content="Images Manager - Organize, tag, and connect your images with ease. A powerful desktop application for managing image collections."
/>
<meta
  name="keywords"
  content="image manager, photo organizer, tagging, desktop app, SQLite, Tauri"
/>
<meta
  property="og:title"
  content="Images Manager - Desktop Image Organization Tool"
/>
<meta
  property="og:description"
  content="Organize, tag, and connect your images with ease. Desktop application built with Tauri."
/>
<meta property="og:image" content="/images/og-image.png" />
<meta name="twitter:card" content="summary_large_image" />
```

### Performance Checklist

- [ ] Optimize images (WebP format, proper sizing)
- [ ] Minify CSS and JavaScript
- [ ] Enable gzip compression
- [ ] Use CDN for static assets
- [ ] Implement lazy loading for images
- [ ] Add proper caching headers

## 📋 Pre-Launch Checklist

### Content Review

- [ ] Proofread all text content
- [ ] Verify all links work correctly
- [ ] Test download buttons and links
- [ ] Ensure screenshots are current and accurate

### Technical Testing

- [ ] Test on different screen sizes (mobile, tablet, desktop)
- [ ] Verify dark/light theme switching
- [ ] Check loading performance
- [ ] Test in different browsers
- [ ] Validate HTML and accessibility

### SEO and Analytics

- [ ] Set up Google Analytics (optional)
- [ ] Submit sitemap to search engines
- [ ] Verify Open Graph tags work
- [ ] Test social media sharing

## 🤝 Maintenance and Updates

### Regular Updates

- Update screenshots when the main app UI changes
- Keep download links current with latest releases
- Monitor and fix broken links
- Update feature descriptions as new functionality is added

### Analytics Tracking

Consider tracking:

- Download button clicks
- Page views and user engagement
- Traffic sources
- Geographic distribution of visitors

## 📞 Support and Resources

- **Design System Reference**: Main app's `src/styles/variables.ts`
- **Component Library**: Reuse patterns from main app components
- **Icons**: Lucide React (same as main app)
- **Font**: Inter (same as main app)

This guide provides everything needed to create a professional, cohesive landing page that effectively showcases the Images Manager application while maintaining consistency with the main application's design and branding.
