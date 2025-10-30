# Mystery Box E-Commerce Design Guidelines

## Design Approach
**Reference-Based + Custom Pattern**  
This e-commerce experience draws inspiration from premium product showcases (Apple, Nike) while maintaining a mystery/surprise aesthetic with bold, dark product cards and playful purple accents.

---

## Core Design Elements

### A. Typography
**Font Hierarchy:**
- **Hero/Page Titles**: text-6xl (60px), font-bold, tight leading
- **Section Headers**: text-5xl (48px), font-bold
- **Product Titles**: text-[28px], font-bold
- **Subsection Headers**: text-2xl (24px), font-bold
- **Body Large**: text-xl (20px), font-normal
- **Body Standard**: text-lg (18px), font-normal
- **Body Small**: text-base (16px), font-medium/normal
- **Labels/Meta**: text-sm (14px), font-normal

**Font Weights**: Bold (700) for headings, Medium (500) for emphasis, Normal (400) for body text

---

### B. Layout System
**Spacing Primitives**: Use Tailwind units of 3, 4, 6, 8, 12, 16, 24, 32
- **Container padding**: px-4 (mobile), standard container with max-w-7xl
- **Section spacing**: pt-32 pb-16 (main content areas to account for navbar)
- **Card padding**: p-8 (product cards), p-6 (info cards)
- **Grid gaps**: gap-8 (product grids), gap-12 (checkout columns), gap-4 (form fields)
- **Vertical rhythm**: mb-3, mb-4, mb-6, mb-8, mb-12 for consistent spacing

**Grid Layouts:**
- Product grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Checkout: grid-cols-1 lg:grid-cols-2
- Always single column on mobile (stack everything)

---

### C. Component Library

**Cards:**
- **Product Cards**: Black background (bg-black), rounded-3xl, full product showcase
- **Info Cards**: Light backgrounds with borders, rounded-lg, p-6
- **Feature Cards**: Purple-tinted backgrounds (bg-purple-50 dark:bg-purple-950/20)

**Buttons:**
- **Primary CTA**: Black bg with white text (dark mode inverts), rounded-full, h-14, text-lg font-semibold
- **Secondary**: Outlined with border-2, rounded-full, h-14
- **In-Card Actions**: bg-[#3a3a3a] on dark cards, rounded-2xl, h-14
- **Icon Buttons**: Square with equal dimensions (h-14 w-14), rounded-full
- Always include icons with gap-2 spacing for clarity

**Forms:**
- **Input Fields**: h-14, rounded-xl, consistent border treatment
- **Select Dropdowns**: Match input styling exactly
- **Disabled Fields**: Gray background (bg-gray-50 dark:bg-neutral-800), cursor-not-allowed

**Badges/Labels:**
- Pill-shaped (rounded-full), px-3 py-1, purple color scheme
- Placed above product titles for category/type identification

**Navigation:**
- Fixed navbar with backdrop blur
- Cart button with count badge
- Smooth navigation transitions

---

### D. Visual Treatments

**Product Showcase:**
- Black rectangular containers (rounded-3xl)
- Centered product images with generous padding (p-12)
- Drop-shadow-2xl on product images for depth
- Reflection effect on detail pages (scale-y-[-1] with gradient mask)
- Image containers: relative positioning, specific dimensions (w-[280px] h-[280px] for grid, larger for detail pages)

**Backgrounds:**
- Clean white (light mode) / near-black neutral-950 (dark mode)
- No gradients or textures on main backgrounds
- BackgroundPaths component adds subtle animated decoration

**Elevation & Depth:**
- Subtle borders on cards in light mode
- Drop shadows on product images only
- No heavy box-shadows on UI elements

---

### E. Interaction Patterns

**Cart Experience:**
- Side sheet overlay from right
- Instant add-to-cart with toast notification
- Quantity controls with +/- buttons
- Persistent cart in localStorage

**Product Discovery:**
- Grid view on shop page
- Clickable cards that link to detail pages
- "Add to Cart" always visible on cards
- Hover opacity changes (hover:opacity-90) for subtle feedback

**Checkout Flow:**
- Two-column layout: Form left, Summary right
- Progressive disclosure (sections revealed as needed)
- Form validation with inline feedback
- Clear visual hierarchy for order totals

**Navigation Flow:**
- Home → Shop → Product Detail → Checkout
- Back buttons with arrow icons
- Breadcrumb-style navigation cues

---

## Page-Specific Guidelines

### Homepage
- Large hero section with animated background
- Minimal content, focuses on drawing users to shop
- BackgroundPaths component for visual interest

### Shop Page
- Centered heading with descriptive subtitle
- 3-column grid (responsive to 2-col, 1-col)
- Numbered product titles (1., 2., 3.)
- Each card shows: Title, Label, Price ("From ₹X"), Image, Add to Cart button

### Product Detail Page
- 2-column split: Image left, Details right
- Image section: Full-height black card with centered product
- Details section: Badge, Title, Description, Price, Action buttons, "What's in the Box" purple card, Specifications table
- Share functionality with copy-to-clipboard fallback

### Checkout Page
- Form section: Name/address fields, contact info, submit button
- Summary section: Cart items list, subtotal/shipping/total breakdown
- Validation required for all fields before submission

---

## Accessibility & Responsiveness
- All interactive elements have clear hover/focus states
- Form inputs have visible focus rings
- Sufficient color contrast (WCAG AA compliant)
- Mobile-first responsive design
- Touch-friendly button sizes (minimum h-14 for tap targets)
- Semantic HTML structure maintained throughout

---

## Images
**Product Images**: High-quality PNG images with transparent backgrounds displayed on black containers. Images should be centered and properly sized within their containers.

**Hero Section**: Uses an animated BackgroundPaths component rather than static hero images - provides dynamic visual interest without requiring large image assets.

**Image Placement:**
- Shop page: 280×280px product images in black cards
- Detail page: Larger product images (400px height) with reflection effect
- Checkout summary: Thumbnail images (80×80px) in white/light containers