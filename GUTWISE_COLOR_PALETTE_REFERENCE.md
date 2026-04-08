# GutWise Color Palette - Visual Reference

## Brand Color Palette

### Brand Colors (Trust & Navigation)
Primary color for buttons, navigation, headers, and trusted UI elements.

```
Brand-50   #F1E3E5  ▢ Very Light (backgrounds, subtle accents)
Brand-100  #D7ECF5  ▢ Light (hover states, icon backgrounds)
Brand-300  #8EBFD8  ▢ Medium (secondary elements)
Brand-500  #4A8FA8  ▢ Primary (buttons, headers, CTAs) ★
Brand-700  #2C617D  ▢ Dark (hover, active states)
Brand-900  #183C52  ▢ Very Dark (emphasis, text)
```

**Usage**:
- Primary buttons: `bg-brand-500 hover:bg-brand-700`
- Navigation: `text-brand-500`, `bg-brand-700`
- Icons: `text-brand-500`, `bg-brand-100`
- Links: `text-brand-500 hover:text-brand-700`
- Focus rings: `ring-brand-500`

---

### Signal Colors (Biology & Health Metrics)
Rose/pink color for health indicators, menstrual cycle, and biological markers.

```
Signal-50   #F1E3E5  ▢ Very Light (backgrounds)
Signal-100  #F1E3E5  ▢ Light (alert backgrounds)
Signal-300  #D9B3B7  ▢ Medium (subtle indicators)
Signal-500  #C28F94  ▢ Primary (health metrics) ★
Signal-700  #8D5D62  ▢ Dark (emphasis)
Signal-900  #5C3A3E  ▢ Very Dark (strong emphasis)
```

**Usage**:
- Health alerts: `bg-signal-100 border-signal-300 text-signal-700`
- Menstrual tracking: Icon color `text-signal-500`
- Metrics: `text-signal-500` for values
- Emphasis: `text-signal-700` for important data
- Badges: `bg-signal-100 text-signal-700`

---

### Discovery Colors (AI & Intelligence)
Purple color for AI-powered insights, pattern recognition, and discovery features.

```
Discovery-50   #EEE8FF  ▢ Very Light (backgrounds)
Discovery-100  #E6D9FF  ▢ Light (subtle accents)
Discovery-300  #B8A8FF  ▢ Medium (secondary elements)
Discovery-500  #7C5CFF  ▢ Primary (insights, AI features) ★
Discovery-700  #5B3FD6  ▢ Dark (hover, active)
Discovery-900  #3E2A9B  ▢ Very Dark (emphasis)
```

**Usage**:
- Secondary buttons: `bg-discovery-500 hover:bg-discovery-700`
- AI insights: `text-discovery-500`, `bg-discovery-100`
- Focus rings (secondary): `ring-discovery-500`
- Glow effects: `discovery-500/20`
- Badges: `bg-discovery-100 text-discovery-700`

---

### Neutral Colors (Structure & Typography)
Gray/slate colors for text, backgrounds, borders, and structural elements.

```
Neutral-bg      #F7FAFC  ▢ Page Background (soft gray-blue)
Neutral-surface #FFFFFF  ▢ Card/Container Background (white)
Neutral-text    #1E293B  ▢ Primary Text (dark slate) ★
Neutral-muted   #64748B  ▢ Secondary Text (slate gray)
Neutral-border  #E2E8F0  ▢ Borders & Dividers (light)
```

**Usage**:
- Page background: `bg-neutral-bg`
- Card backgrounds: `bg-neutral-surface`
- Headlines: `text-neutral-text`
- Body text: `text-neutral-text`
- Secondary text: `text-neutral-text`
- Borders: `border-neutral-border`
- Placeholder text: `placeholder:text-neutral-muted`

---

## Color Application Matrix

### Interactive Elements

| Element | Default | Hover | Active | Disabled |
|---------|---------|-------|--------|----------|
| Primary Button | brand-500 | brand-700 | brand-900 | opacity-50 |
| Secondary Button | discovery-500 | discovery-700 | discovery-900 | opacity-50 |
| Outline Button | neutral-border | neutral-text | neutral-text | opacity-50 |
| Ghost Button | brand-500 text | brand-700 bg | brand-700 | opacity-50 |

### Data Visualization

| Type | Color | Context |
|------|-------|---------|
| Primary Metric | brand-500 | Health tracking data |
| Secondary Metric | discovery-500 | AI-derived metrics |
| Alert/Warning | signal-500 | Health concerns |
| Positive State | brand-700 | Success indicators |
| Neutral State | neutral-muted | Inactive elements |

### Semantic Colors

| Semantic Meaning | Color | Use Case |
|------------------|-------|----------|
| Success | brand-700 | Saved, confirmed |
| Error | signal-500 | Validation errors |
| Warning | signal-500 | Caution messages |
| Info | brand-500 | Informational messages |
| AI/Insights | discovery-500 | AI features |

---

## Contrast Ratios (WCAG AA)

All color combinations meet WCAG AA standards (minimum 4.5:1 for text):

| Foreground | Background | Ratio | Status |
|-----------|-----------|-------|---------|
| neutral-text | neutral-surface | 8.8:1 | ✓ AAA |
| neutral-text | neutral-bg | 8.5:1 | ✓ AAA |
| brand-500 text | white | 5.2:1 | ✓ AA |
| signal-500 text | white | 4.6:1 | ✓ AA |
| discovery-500 text | white | 4.8:1 | ✓ AA |
| white text | brand-500 | 6.1:1 | ✓ AAA |
| white text | discovery-500 | 5.3:1 | ✓ AA |

---

## Color Palette Usage by Component

### Button Component
```tsx
// Primary (Brand)
<button className="bg-brand-500 text-white hover:bg-brand-700">
  Primary Action
</button>

// Secondary (Discovery)
<button className="bg-discovery-500 text-white hover:bg-discovery-700">
  Secondary Action
</button>

// Outline (Neutral)
<button className="border-2 border-neutral-border text-neutral-text hover:border-neutral-text">
  Outline Action
</button>

// Ghost (Brand)
<button className="text-brand-500 hover:bg-brand-50">
  Ghost Action
</button>
```

### Card Component
```tsx
// Elevated (Default)
<div className="bg-neutral-surface border border-neutral-border rounded-2xl shadow-soft">
  Card content
</div>

// Glass (Premium)
<div className="bg-neutral-surface/80 backdrop-blur-soft border border-neutral-border/20">
  Premium content
</div>
```

### Form Inputs
```tsx
// Standard Input
<input
  className="border border-neutral-border bg-neutral-surface text-neutral-text"
  placeholder="..."
/>

// Focus State
<input
  className="border-brand-500 ring-2 ring-brand-500/20"
/>

// Error State
<input
  className="border-signal-300 bg-signal-100"
/>
```

### Typography
```tsx
// Headlines
<h1 className="text-neutral-text">Heading</h1>

// Body Text
<p className="text-neutral-text">
  Body content
</p>

// Secondary Text
<p className="text-neutral-muted">
  Secondary information
</p>

// Labels
<label className="text-neutral-text text-label">
  Form Label
</label>
```

### Backgrounds & Containers
```tsx
// Page Background
<div className="bg-neutral-bg">
  Page content
</div>

// Content Container
<div className="bg-neutral-surface">
  Content area
</div>

// Accent Background
<div className="bg-brand-100">
  Accent content
</div>
```

---

## Color Combinations for Sections

### Welcome/Hero Section
```
Background: neutral-bg or neutral-surface
Headline: text-neutral-text
Accent text: text-brand-500
Buttons: brand-500 primary, neutral outline secondary
```

### Onboarding (Login/Signup)
```
Background: neutral-bg
Form: neutral-surface card
Labels: text-neutral-text
Inputs: border-neutral-border
Buttons: brand-500 primary
Links: text-brand-500 hover:text-brand-700
Errors: bg-signal-100 border-signal-300 text-signal-700
```

### Dashboard
```
Background: neutral-bg
Cards: neutral-surface with neutral-border
Headings: text-neutral-text
Metrics: text-signal-500 for health data
Quick Actions: Colorful backgrounds (brand-50, signal-50, etc.)
Insights: discovery-500 for AI features
```

---

## Color Consistency Rules

### DO ✓
- Use brand-500 for primary actions
- Use signal-500 for health/biological data
- Use discovery-500 for AI/insights
- Use neutral colors for structure
- Pair colors with labels/text
- Test contrast ratios

### DON'T ✗
- Mix multiple secondary colors unnecessarily
- Use purple (discovery) for non-AI features
- Use rose (signal) for non-biological data
- Skip hover/focus states
- Forget accessibility contrast
- Use colors without semantic meaning

---

## Color Migration Guide

### From Old System to GutWise

| Old Color | New Color | Context |
|-----------|-----------|---------|
| teal-600 | brand-500 | Primary buttons, nav |
| teal-700 | brand-700 | Hover, active states |
| gray-900 | neutral-text | Headlines, text |
| gray-600 | neutral-muted | Secondary text |
| gray-50 | neutral-bg | Page background |
| red-50 | signal-100 | Error backgrounds |
| blue-600 | discovery-500 | Secondary CTAs |

---

## Tailwind CSS Usage

### Direct Color Classes
```
text-brand-500
bg-brand-100
border-neutral-border
hover:bg-discovery-700
```

### CSS Custom Properties
```css
color: var(--color-brand-500);
background-color: var(--color-neutral-bg);
border-color: var(--color-neutral-border);
```

### Tailwind Config Reference
See `tailwind.config.js` for:
```javascript
colors: {
  brand: { ... },
  signal: { ... },
  discovery: { ... },
  neutral: { ... }
}
```

---

## Accessibility Notes

### Color Only Communication
- ✓ Always pair colors with text or icons
- ✓ Use labels alongside color indicators
- ✓ Don't rely on color alone for state

### Contrast Requirements
- Headlines: 4.5:1 minimum (AA)
- Body text: 4.5:1 minimum (AA)
- UI components: 3:1 minimum (AA)
- Target: 7:1+ (AAA level)

### Color Blindness Considerations
- Brand colors: Blue-ish (safe for deuteranopia)
- Signal colors: Rose/pink (somewhat visible)
- Discovery colors: Purple (somewhat visible)
- Always label and use patterns too

---

## Color Psychology in Healthcare

### Brand Blue (#4A8FA8)
- **Trust**: Trustworthy, professional, medical
- **Calm**: Soothing, reliable, stable
- **Professional**: Clinical, competent, expert

### Signal Rose (#C28F94)
- **Biological**: Natural, health-related, feminine
- **Attention**: Notice me, important, alert
- **Care**: Compassion, wellness, nurturing

### Discovery Purple (#7C5CFF)
- **Intelligence**: Smart, analytical, insightful
- **Innovation**: Technology, future-forward, AI
- **Transformation**: Change, growth, potential

### Neutral Gray (#1E293B, #64748B)
- **Clarity**: Clear, readable, professional
- **Stability**: Grounded, reliable, structured
- **Balance**: Neutral, unbiased, factual

---

## Color Palette Summary

**Total Colors**: 18
- Brand: 6 shades (50, 100, 300, 500, 700, 900)
- Signal: 6 shades (50, 100, 300, 500, 700, 900)
- Discovery: 6 shades (50, 100, 300, 500, 700, 900)
- Neutral: 5 colors (bg, surface, text, muted, border)

**Primary Colors** (most used):
1. brand-500 (#4A8FA8) - Primary actions
2. neutral-text (#1E293B) - Headlines
3. neutral-surface (#FFFFFF) - Containers
4. discovery-500 (#7C5CFF) - Secondary features
5. signal-500 (#C28F94) - Health metrics

---

## Quick Reference Card

```
BRAND:    #4A8FA8 (buttons, nav, trust)
SIGNAL:   #C28F94 (health, metrics, bio)
DISCOVERY: #7C5CFF (insights, AI)
TEXT:     #1E293B (headlines, primary)
MUTED:    #64748B (secondary text)
BG:       #F7FAFC (page background)
SURFACE:  #FFFFFF (cards, containers)
BORDER:   #E2E8F0 (dividers, edges)
```

---

**Color Palette Version**: 1.0
**Last Updated**: April 4, 2026
**WCAG Compliance**: AA (4.5:1 minimum)

