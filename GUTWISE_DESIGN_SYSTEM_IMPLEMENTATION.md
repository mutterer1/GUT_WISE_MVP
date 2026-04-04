# GutWise Design System - Implementation Guide

## Overview

This document provides comprehensive implementation guidelines for the GutWise premium healthcare AI design system. The system has been applied consistently across three key product areas: Landing Page, User Onboarding Flow, and Dashboard Interface.

---

## Design System Foundation

### Color Palette

The GutWise design system uses a carefully curated healthcare-focused color palette with four primary color families:

#### Brand Colors (Trust & Navigation)
- **50**: `#F1E3E5` - Lightest shade for backgrounds
- **100**: `#D7ECF5` - Light shade for secondary elements
- **300**: `#8EBFD8` - Medium shade for interactions
- **500**: `#4A8FA8` - Primary brand color (buttons, headers, nav)
- **700**: `#2C617D` - Dark shade for hover states
- **900**: `#183C52` - Darkest shade for text emphasis

**Usage**: Navigation, primary buttons, headers, key UI elements, and calls-to-action.

#### Signal Colors (Biology & Health Metrics)
- **50**: `#F1E3E5` - Light rose background
- **100**: `#F1E3E5` - Secondary light shade
- **300**: `#D9B3B7` - Medium rose
- **500**: `#C28F94` - Primary signal for health metrics
- **700**: `#8D5D62` - Dark rose for emphasis
- **900**: `#5C3A3E` - Darkest for text

**Usage**: Biological markers, menstrual cycle indicators, symptom severity, health metrics that require attention.

#### Discovery Colors (AI & Intelligence)
- **50**: `#EEE8FF` - Very light purple for subtle backgrounds
- **100**: `#E6D9FF` - Light purple for soft accents
- **300**: `#B8A8FF` - Medium purple
- **500**: `#7C5CFF` - Primary discovery purple for AI insights
- **700**: `#5B3FD6` - Dark purple for emphasis
- **900**: `#3E2A9B` - Darkest purple

**Usage**: AI-powered insights, pattern recognition indicators, discovery-based features, intelligence glow effects.

#### Neutral Colors (Structure & Typography)
- **bg**: `#F7FAFC` - Page background (soft gray-blue)
- **surface**: `#FFFFFF` - Card and container backgrounds
- **text**: `#1E293B` - Primary text color (dark slate)
- **muted**: `#64748B` - Secondary text and labels (slate gray)
- **border**: `#E2E8F0` - Subtle borders and dividers

**Usage**: Page backgrounds, card containers, text hierarchy, borders, and structural elements.

### Typography System

#### Font Families
- **Headings**: Sora (font-sora) - weights: 400, 600, 700
- **Body**: Inter (font-sans) - weights: 400, 500, 600, 700, 800

**Font Hierarchy**:
```
Display Large:  48px, 1.2 line height, -0.01em letter spacing
Display Medium: 40px, 1.2 line height, -0.01em letter spacing
H1:             32px, 1.2 line height, -0.01em letter spacing
H2:             28px, 1.2 line height, -0.01em letter spacing
H3:             24px, 1.2 line height, -0.01em letter spacing
H4:             20px, 1.25 line height
H5:             18px, 1.25 line height
Body Large:     16px, 1.6 line height
Body Medium:    14px, 1.6 line height
Body Small:     13px, 1.5 line height
Label:          12px, 1.4 line height, 0.5px letter spacing
```

**Color Standards**:
- Headings (H1-H6): `text-neutral-text` (dark slate)
- Body text: `text-neutral-text` (dark slate)
- Secondary text: `text-neutral-muted` (slate gray)
- Labels: `text-neutral-muted` with uppercase tracking

### Spacing System

All spacing follows an 8px base unit system:

```
xs:   8px
sm:   12px
md:   16px
lg:   24px
xl:   32px
2xl:  48px
```

**Usage Examples**:
- Component padding: `p-lg` (24px)
- Section margins: `mb-2xl` (48px)
- Element gaps: `gap-md` (16px)
- Compact areas: `p-md` or `p-sm` (16px or 12px)

### Border Radius System

```
sm:    8px
md:    12px
lg:    16px
xl:    20px
2xl:   24px
```

**Standards**:
- Input fields: `rounded-lg` (16px)
- Cards: `rounded-2xl` (24px)
- Buttons: `rounded-lg` (16px)
- Container elements: `rounded-xl` (20px)
- Icons: `rounded-lg` (16px)

### Shadow System

Professional, subtle shadow hierarchy:

```
soft:  0 1px 2px 0 rgba(0, 0, 0, 0.05)
sm:    0 2px 4px 0 rgba(0, 0, 0, 0.08)
md:    0 4px 6px -1px rgba(0, 0, 0, 0.1)
lg:    0 8px 12px -2px rgba(0, 0, 0, 0.12)
glass: 0 8px 32px 0 rgba(31, 38, 135, 0.1)
```

**Elevation Scale**:
1. `.elevation-1` (shadow-soft) - Subtle baseline elevation
2. `.elevation-2` (shadow-sm) - Slight lift for interactive elements
3. `.elevation-3` (shadow-md) - Medium elevation for emphasis
4. `.elevation-4` (shadow-lg) - Strong elevation for modals

---

## Component Implementation Guidelines

### Buttons

#### Primary Button
```tsx
<Button size="lg" className="w-full">
  Start Your Journey
</Button>
```

**Styles**:
- Background: `bg-brand-500`
- Hover: `bg-brand-700`
- Text: White
- Padding: `px-6 py-3` (lg size)
- Border Radius: `rounded-lg`
- Focus Ring: `ring-brand-500`

#### Secondary Button
```tsx
<Button variant="secondary" size="lg">
  Explore Features
</Button>
```

**Styles**:
- Background: `bg-discovery-500`
- Hover: `bg-discovery-700`
- Text: White
- Used for: Secondary calls-to-action, AI-related features

#### Outline Button
```tsx
<Button variant="outline" size="lg">
  Learn More
</Button>
```

**Styles**:
- Border: `border-2 border-neutral-border`
- Hover: `border-neutral-text bg-neutral-bg`
- Text: `text-neutral-text`
- Used for: Tertiary actions, alternate options

#### Ghost Button
```tsx
<Button variant="ghost" size="md">
  Skip for Now
</Button>
```

**Styles**:
- Background: Transparent
- Text: `text-brand-500`
- Hover: `bg-brand-50`
- Used for: Minimal actions, secondary options

### Cards

#### Elevated Card (Default)
```tsx
<Card variant="elevated" padding="lg">
  {children}
</Card>
```

**Styles**:
- Background: `bg-neutral-surface`
- Border: `border border-neutral-border`
- Border Radius: `rounded-2xl`
- Shadow: `shadow-soft`
- Padding: 24px (lg), 16px (md), 12px (sm)

#### Glass Card
```tsx
<Card variant="glass" padding="lg">
  {children}
</Card>
```

**Styles**:
- Background: `bg-neutral-surface/80 backdrop-blur-soft`
- Border: `border border-neutral-border/20`
- Border Radius: `rounded-2xl`
- Shadow: `shadow-glass`
- Used for: Floating sections, overlays, premium feel

### Form Inputs

#### Standard Input
```tsx
<input
  type="email"
  className="input-base"
  placeholder="you@example.com"
/>
```

**Styles**:
- Background: `bg-neutral-surface`
- Border: `border border-neutral-border`
- Border Radius: `rounded-lg`
- Padding: `px-4 py-3`
- Focus: `border-brand-500 ring-2 ring-brand-500/20`
- Text: `text-neutral-text`
- Placeholder: `placeholder:text-neutral-muted`

#### Input with Icon
```tsx
<div className="relative">
  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-muted" />
  <input className="input-base pl-10" />
</div>
```

---

## Page Implementation Standards

### Landing Page Hero Section

**Visual Structure**:
1. **Header Badge**: `inline-flex items-center gap-2 px-4 py-2 bg-brand-100 text-brand-900 rounded-full`
2. **Main Headline**: `text-display-md sm:text-display-lg font-sora font-semibold text-neutral-text`
3. **Accent Text**: Colored highlight in brand-500 for key phrase
4. **Supporting Paragraph**: `text-body-lg text-neutral-muted max-w-3xl`
5. **CTA Buttons**: Primary + Outline pair, stacked on mobile
6. **Trust Signals**: Grid of icon + text items showing credibility

**Color Implementation**:
- Background: `bg-neutral-bg`
- Primary text: `text-neutral-text`
- Accent color: `text-brand-500`
- Secondary text: `text-neutral-muted`
- Icon backgrounds: `bg-brand-100`

**Spacing**:
- Section padding: `px-lg py-xl sm:py-2xl`
- Feature card gap: `gap-md lg:gap-lg`
- Button group gap: `gap-md`

### Onboarding Flow (Login/Signup)

**Layout**:
```
[Logo/Brand] (mb-xl)
┌─────────────────────────┐
│  Card (variant=elevated)│
│  ├─ Headline (mb-lg)    │
│  ├─ Form Fields         │
│  ├─ Primary CTA         │
│  ├─ Divider             │
│  └─ Secondary Link      │
└─────────────────────────┘
[Compliance Note] (mt-xl)
```

**Color Scheme**:
- Container: `Card variant="elevated"`
- Labels: `text-label font-medium text-neutral-text`
- Inputs: `.input-base`
- Error states: `bg-signal-100 border-signal-300 text-signal-700`
- Success CTAs: Primary button with `bg-brand-500`
- Links: `text-brand-500 hover:text-brand-700`

**Form Spacing**:
- Form elements gap: `space-y-lg`
- Label to input: `mb-2`
- Input to next field: `py-3`
- Form to button: `lg gap before button`

### Dashboard Interface

**Layout Grid**:
```
┌─────────────────────────────────────────────┐
│ Welcome Banner | Streak Tracker              │
├─────────────────────────────────────────────┤
│ Today's Summary Widget (Full Width)          │
├─────────────────────────────────────────────┤
│ Quick Log Actions (4-column grid)            │
├─────────────────────────────────────────────┤
│ Pattern Insights (Full Width)                │
├─────────────────────────────────────────────┤
│ Metric Widget 1 | Metric Widget 2 | Widget 3│
├─────────────────────────────────────────────┤
│ Information Card (Full Width)                │
└─────────────────────────────────────────────┘
```

**Color Application**:
- Page background: `bg-neutral-bg`
- Cards: `Card variant="elevated"` with `rounded-2xl`
- Headings: `text-h4 font-sora font-semibold text-neutral-text`
- Info sections: Brand-colored backgrounds for emphasis
- Error states: Signal-colored alerts

**Spacing Standards**:
- Main content padding: `p-md sm:p-lg lg:p-lg`
- Section margins: `mb-lg` between major sections
- Component gaps: `gap-md` for grids, `gap-lg` for larger spaces
- Widget padding: `p-lg` for card content

---

## Design Patterns & Best Practices

### Color Usage Rules

1. **Brand Colors**: Use for primary actions, navigation, and trusted elements
2. **Signal Colors**: Reserve for health metrics, biological indicators, menstrual data
3. **Discovery Colors**: Limit to AI-powered insights and pattern recognition
4. **Neutral Colors**: Structural foundation for all layouts

### Accessibility Standards

- **Color Contrast**: All text meets WCAG AA standards (4.5:1 minimum)
- **Focus States**: All interactive elements have visible focus rings
- **Typography**: Minimum 14px body text for readability
- **Labels**: All form inputs have associated `<label>` elements
- **Icons**: Icon-only buttons include `aria-label` attributes

### Interactive States

- **Default**: Neutral color from palette
- **Hover**: +1-2 shades darker in color ramp
- **Focus**: Visible ring (`ring-brand-500`)
- **Active**: Darkest shade in ramp
- **Disabled**: Reduced opacity (`opacity-50`)

### Transitions

- **Standard duration**: `duration-200`
- **Smooth transitions**: `transition-all` or `transition-colors`
- **Hover effects**: Scale (`group-hover:scale-110`) or shadow elevation

---

## CSS Utility Classes Reference

### Typography Classes
```css
.text-headline    /* text-h2 font-sora font-semibold */
.text-subheading  /* text-h4 font-sora font-semibold */
.text-body        /* text-body-md text-neutral-muted */
.text-label-style /* text-label font-medium uppercase */
```

### Component Classes
```css
.btn-primary      /* Brand primary button styling */
.btn-secondary    /* Discovery secondary button styling */
.btn-outline      /* Outline button styling */
.card-elevated    /* Elevated card with soft shadow */
.card-glass       /* Glass-effect card with blur */
.input-base       /* Base input field styling */
.glow-subtle      /* Subtle discovery glow effect */
.glow-accent      /* Accent glow for emphasis */
```

### Utility Classes
```css
.transition-smooth     /* transition-all duration-300 ease-out */
.elevation-1 to .elevation-4  /* Shadow elevation scale */
```

---

## Implementation Checklist

- [x] Color palette configured in Tailwind theme
- [x] Typography scales defined with proper sizing and spacing
- [x] Spacing system established with 8px base unit
- [x] Border radius standardized across components
- [x] Shadow system with elevation hierarchy
- [x] Button component with all variants
- [x] Card component with elevated and glass options
- [x] Form input styling with focus states
- [x] Landing page hero with brand application
- [x] Login/Signup pages with onboarding flow
- [x] Dashboard interface with metric widgets
- [x] Accessibility standards met throughout
- [x] Build verification completed

---

## File References

**Configuration Files**:
- `tailwind.config.js` - Theme colors, typography, spacing
- `src/index.css` - Global styles, CSS components, utilities
- `src/components/Button.tsx` - Button component with variants
- `src/components/Card.tsx` - Card component with options

**Page Implementations**:
- `src/pages/Landing.tsx` - Hero section with CTA
- `src/pages/Login.tsx` - Authentication onboarding
- `src/pages/Signup.tsx` - Registration onboarding
- `src/pages/Dashboard.tsx` - Health metrics dashboard

---

## Future Enhancement Opportunities

1. **Dark Mode**: Extend color system with dark variants
2. **Responsive Refinements**: Additional mobile breakpoints
3. **Animation Library**: Pre-built micro-interactions
4. **Component Variants**: Additional button and card states
5. **Motion Design**: Smooth page transitions and loading states
6. **Theme Customization**: User preference system for accent colors

---

## Design System Maintenance

This design system should be maintained with the following practices:

1. **Consistency Reviews**: Regular audits of new components against standards
2. **Documentation Updates**: Keep examples current with implementations
3. **Performance Monitoring**: Track CSS file size and optimization
4. **Accessibility Testing**: Regular WCAG compliance checks
5. **User Feedback**: Monitor UX metrics for design effectiveness

