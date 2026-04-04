# GutWise Design System - Quick Reference

## Color Palette Quick Access

### Primary Colors
```
Brand (Trust):     #4A8FA8 (500), #2C617D (700), #183C52 (900)
Signal (Bio):      #C28F94 (500), #8D5D62 (700), #5C3A3E (900)
Discovery (AI):    #7C5CFF (500), #5B3FD6 (700), #3E2A9B (900)
```

### Neutral Scale
```
Background:        #F7FAFC
Surface:           #FFFFFF
Text (Primary):    #1E293B
Text (Secondary):  #64748B
Borders:           #E2E8F0
```

## Typography Quick Access

### Font Classes
```
Headings:   font-sora (weights: 400, 600, 700)
Body:       font-sans (weights: 400, 500, 600, 700)
```

### Size Classes
```
text-display-lg    48px, -0.01em tracking
text-h1            32px, -0.01em tracking
text-h2            28px, -0.01em tracking
text-h3            24px, -0.01em tracking
text-h4            20px
text-h5            18px
text-body-lg       16px, 1.6 line height
text-body-md       14px, 1.6 line height
text-body-sm       13px, 1.5 line height
text-label         12px, 0.5px letter spacing
```

## Spacing Quick Access

```
xs    8px       lg    24px
sm    12px      xl    32px
md    16px      2xl   48px
```

## Common Component Patterns

### Primary CTA
```tsx
<Button size="lg" className="w-full">
  Get Started
</Button>
```

### Secondary Action
```tsx
<Button variant="secondary" size="md">
  Learn More
</Button>
```

### Outline Button
```tsx
<Button variant="outline" size="lg">
  Cancel
</Button>
```

### Elevated Card
```tsx
<Card variant="elevated" padding="lg">
  Content here
</Card>
```

### Form Input
```tsx
<input className="input-base" placeholder="Email..." />
```

### Headline with Subtext
```tsx
<div>
  <h1 className="text-h2 font-sora font-semibold text-neutral-text">Title</h1>
  <p className="text-body-md text-neutral-muted mt-2">Subtitle</p>
</div>
```

## Color Application Rules

| Element | Color | Variant |
|---------|-------|---------|
| Primary Buttons | Brand | 500 → hover: 700 |
| Secondary Buttons | Discovery | 500 → hover: 700 |
| Text (Headlines) | Neutral | text |
| Text (Body) | Neutral | text |
| Text (Secondary) | Neutral | muted |
| Icon Backgrounds | Brand | 100 |
| Health Metrics | Signal | 500-700 |
| AI Insights | Discovery | 500-700 |
| Card Backgrounds | Neutral | surface |
| Page Background | Neutral | bg |
| Borders | Neutral | border |

## Common Grid Layouts

### 2-Column (Desktop)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
```

### 3-Column (Desktop)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
```

### 4-Column (Dashboard Actions)
```tsx
<div className="grid grid-cols-2 gap-2 md:grid-cols-4">
```

## Responsive Breakpoints

```
sm:  640px    Mobile
md:  768px    Tablet
lg:  1024px   Desktop
```

## Shadow Elevation

```
elevation-1    shadow-soft     (minimal)
elevation-2    shadow-sm       (subtle)
elevation-3    shadow-md       (medium)
elevation-4    shadow-lg       (strong)
```

## Common Spacing Combinations

| Context | Pattern | Example |
|---------|---------|---------|
| Section Padding | `p-lg` | Cards, containers |
| Section Margin | `mb-lg` | Between sections |
| Element Gaps | `gap-md` | Grid items |
| Heading to Text | `mb-md` | `h2` + `p` pair |
| Form Fields | `space-y-lg` | Form containers |
| Large Margins | `mt-2xl` | Major section breaks |

## Accessibility Checklist

- [ ] All interactive elements have focus rings
- [ ] Form inputs have associated labels
- [ ] Color not used as only indicator
- [ ] Text contrast meets WCAG AA (4.5:1)
- [ ] Icons have aria-labels if button
- [ ] Proper heading hierarchy (h1 → h6)
- [ ] Links are underlined or clearly distinguished
- [ ] Touch targets ≥ 44x44px

## Common Issues & Solutions

### Issue: Button text not visible
**Solution**: Check text color against background. Use white text on brand-500.

### Issue: Input borders too subtle
**Solution**: Use `border-neutral-border` (not gray). Ensures 4.5:1 contrast.

### Issue: Too many colors in layout
**Solution**: Stick to brand + discovery accents. Use neutral for structure.

### Issue: Text hierarchy unclear
**Solution**: Use font-sora for headings, font-sans for body. Ensure size differences.

### Issue: Components not aligned
**Solution**: Use 8px grid. Check padding is multiple of 8px (8, 12, 16, 24, 32).

## Import Statements

```tsx
import Button from '../components/Button';
import Card from '../components/Card';
```

## Hover State Pattern

```tsx
className="transition-smooth hover:bg-brand-700"
```

## Focus Ring Pattern

```tsx
className="focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
```

## Text Truncation

```tsx
className="truncate"           // Single line
className="line-clamp-2"       // 2 lines max
className="text-ellipsis overflow-hidden" // Custom
```

## Flex Alignment Patterns

```tsx
// Center content
<div className="flex items-center justify-center">

// Space between
<div className="flex items-center justify-between">

// Gap between items
<div className="flex items-center gap-md">
```

## Z-Index Scale

```
z-0:      Default (relative)
z-10:     Dropdown menus
z-20:     Modals
z-30:     Toasts
z-40:     Popovers
z-50:     Fixed headers
```

