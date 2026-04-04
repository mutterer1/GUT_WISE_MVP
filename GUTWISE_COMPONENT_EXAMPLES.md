# GutWise Design System - Component Examples

## Button Component Examples

### Primary Button (Primary CTA)
```tsx
<Button size="lg" className="w-full">
  Start Your Journey
  <ChevronRight className="inline ml-2 h-5 w-5" />
</Button>
```
**Use for**: Main actions, sign-up flows, primary next steps

### Secondary Button (AI/Discovery Features)
```tsx
<Button variant="secondary" size="lg">
  Explore Insights
</Button>
```
**Use for**: Secondary actions, AI-powered features

### Outline Button (Alternative)
```tsx
<Button variant="outline" size="lg">
  Log In
</Button>
```
**Use for**: Alternative paths, secondary options

### Ghost Button (Minimal)
```tsx
<Button variant="ghost" size="md">
  Skip for Now
</Button>
```
**Use for**: Minimal actions, optional flows

### Size Variants
```tsx
<Button size="sm">Compact</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

---

## Card Component Examples

### Elevated Card (Default)
```tsx
<Card variant="elevated" padding="lg">
  <h3 className="text-h5 font-sora font-semibold text-neutral-text mb-md">
    Feature Title
  </h3>
  <p className="text-body-md text-neutral-muted">
    Card content with description
  </p>
</Card>
```
**Use for**: Primary content containers, feature cards, widgets

### Glass Card (Premium)
```tsx
<Card variant="glass" padding="lg">
  <div className="glow-accent">
    Floating premium content
  </div>
</Card>
```
**Use for**: Overlay content, floating elements, premium feel

### Compact Card (Dense Info)
```tsx
<Card variant="elevated" padding="sm">
  <p className="text-body-sm text-neutral-muted">Quick info</p>
</Card>
```

### Feature Card Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
  {features.map(feature => (
    <Card key={feature.id} variant="elevated" padding="lg">
      <div className="flex items-start gap-md">
        <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center">
          <feature.Icon className="h-6 w-6 text-brand-500" />
        </div>
        <div>
          <h3 className="text-h5 font-sora font-semibold text-neutral-text mb-2">
            {feature.title}
          </h3>
          <p className="text-body-md text-neutral-muted">
            {feature.description}
          </p>
        </div>
      </div>
    </Card>
  ))}
</div>
```

---

## Form Examples

### Basic Email Input
```tsx
<div>
  <label htmlFor="email" className="block text-label font-medium text-neutral-text mb-2">
    Email Address
  </label>
  <div className="relative">
    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-muted" />
    <input
      id="email"
      type="email"
      className="input-base pl-10"
      placeholder="you@example.com"
    />
  </div>
</div>
```

### Password Input with Validation
```tsx
<div>
  <label htmlFor="password" className="block text-label font-medium text-neutral-text mb-2">
    Password
  </label>
  <div className="relative">
    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-muted" />
    <input
      id="password"
      type="password"
      className="input-base pl-10"
      placeholder="Create a strong password"
    />
  </div>
  <p className="mt-2 text-body-sm text-neutral-muted">
    Must be at least 8 characters with a mix of letters and numbers
  </p>
</div>
```

### Error State
```tsx
<div className="mb-md p-3 bg-signal-100 border border-signal-300 rounded-lg text-body-sm text-signal-700">
  Please check your email and try again
</div>
```

### Checkbox
```tsx
<div className="flex items-start">
  <input
    id="terms"
    type="checkbox"
    className="h-4 w-4 text-brand-500 focus:ring-brand-500 border-neutral-border rounded"
  />
  <label htmlFor="terms" className="ml-3 text-body-sm text-neutral-text">
    I agree to the{' '}
    <Link to="/privacy" className="font-medium text-brand-500 hover:text-brand-700">
      Privacy Policy
    </Link>
  </label>
</div>
```

### Select Dropdown
```tsx
<div>
  <label htmlFor="metric" className="block text-label font-medium text-neutral-text mb-2">
    Health Metric
  </label>
  <select className="input-base">
    <option value="">Select a metric</option>
    <option value="bm">Bowel Movement</option>
    <option value="sleep">Sleep Quality</option>
    <option value="stress">Stress Level</option>
  </select>
</div>
```

---

## Typography Examples

### Headline Section
```tsx
<div className="text-center mb-2xl">
  <h1 className="text-display-lg font-sora font-semibold text-neutral-text mb-lg leading-tight">
    Unlock the Power of Your
    <span className="block text-brand-500">Gut Health Intelligence</span>
  </h1>
  <p className="text-body-lg text-neutral-muted max-w-3xl mx-auto">
    Supporting paragraph with key messaging
  </p>
</div>
```

### Card Headline
```tsx
<div>
  <h2 className="text-h3 font-sora font-semibold text-neutral-text mb-md">
    Section Title
  </h2>
  <p className="text-body-md text-neutral-muted">
    Supporting description text
  </p>
</div>
```

### Small Section Title
```tsx
<div>
  <h4 className="text-h5 font-sora font-semibold text-neutral-text mb-2">
    Quick Stat
  </h4>
  <p className="text-body-sm text-neutral-muted">12 entries logged</p>
</div>
```

### Label Text
```tsx
<p className="text-label font-medium text-neutral-muted uppercase tracking-wide">
  HEALTH METRICS
</p>
```

---

## Layout Examples

### Hero Section Layout
```tsx
<section className="max-w-7xl mx-auto px-lg sm:px-lg lg:px-lg py-xl sm:py-2xl">
  <div className="text-center">
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 text-brand-900 rounded-full text-body-sm font-medium mb-lg">
      <Activity className="h-4 w-4" />
      <span>Your gut's new best friend</span>
    </div>

    <h1 className="text-display-md sm:text-display-lg lg:text-5xl font-sora font-semibold text-neutral-text mb-lg">
      Main headline here
    </h1>

    <p className="text-body-lg text-neutral-muted mb-lg max-w-3xl mx-auto">
      Supporting paragraph with key benefits
    </p>

    <div className="flex flex-col sm:flex-row gap-md justify-center">
      <Button size="lg">Primary CTA</Button>
      <Button variant="outline" size="lg">Secondary CTA</Button>
    </div>
  </div>
</section>
```

### Dashboard Grid
```tsx
<div className="flex min-h-screen bg-neutral-bg">
  <Sidebar />
  <main className="flex-1 lg:ml-64 p-lg">
    <div className="max-w-7xl mx-auto">
      {/* Content */}
    </div>
  </main>
</div>
```

### Feature Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
  {items.map(item => (
    <Card key={item.id} variant="elevated" padding="lg">
      {/* Card content */}
    </Card>
  ))}
</div>
```

### Metric Cards Row
```tsx
<div className="grid grid-cols-1 gap-md md:grid-cols-2">
  <Card variant="elevated">
    <div className="rounded-lg bg-brand-100 p-3">
      <p className="mb-1 font-medium text-brand-900">Track Consistently</p>
      <p className="text-body-sm text-brand-700">
        Log daily to unlock stronger patterns
      </p>
    </div>
  </Card>

  <Card variant="elevated">
    <div className="rounded-lg bg-discovery-100 p-3">
      <p className="mb-1 font-medium text-discovery-900">Data Privacy</p>
      <p className="text-body-sm text-discovery-700">
        Your health data is private
      </p>
    </div>
  </Card>
</div>
```

---

## Interactive Element Examples

### Hover State
```tsx
<div className="transition-smooth hover:bg-brand-100 hover:shadow-sm cursor-pointer rounded-lg p-md">
  Interactive content
</div>
```

### Focus Ring
```tsx
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
  Accessible button
</button>
```

### Tooltip
```tsx
<div className="relative group">
  <button>Hover me</button>
  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-text text-white text-body-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
    Helpful text
  </div>
</div>
```

### Loading State
```tsx
<Button disabled>
  {loading ? 'Loading...' : 'Submit'}
</Button>
```

### Badge/Tag
```tsx
<span className="inline-flex items-center px-3 py-1 bg-discovery-100 text-discovery-700 text-body-sm font-medium rounded-full">
  AI Insight
</span>
```

---

## Color Application Examples

### Health Data Warning
```tsx
<div className="bg-signal-100 border border-signal-300 text-signal-700 rounded-lg p-md">
  <p className="font-medium">High stress detected</p>
  <p className="text-body-sm">Consider stress management techniques</p>
</div>
```

### AI Insight Card
```tsx
<Card variant="glass" padding="lg" className="glow-accent border border-discovery-200/50">
  <div className="flex items-start gap-md">
    <div className="text-discovery-500 text-2xl">✨</div>
    <div>
      <h3 className="text-h5 font-sora font-semibold text-neutral-text">
        Pattern Detected
      </h3>
      <p className="text-body-md text-neutral-muted mt-1">
        AI-powered insight about your health patterns
      </p>
    </div>
  </div>
</Card>
```

### Trust Signal
```tsx
<div className="flex items-center gap-2">
  <Lock className="h-5 w-5 text-brand-500" />
  <span className="text-body-sm text-neutral-text">
    HIPAA Compliant & Bank-Level Encryption
  </span>
</div>
```

---

## Responsive Design Examples

### Mobile-First Stacking
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md lg:gap-lg">
  {/* Items automatically stack on mobile */}
</div>
```

### Flexible Padding
```tsx
<div className="p-md sm:p-lg lg:p-lg">
  {/* Responsive padding based on screen size */}
</div>
```

### Hidden on Mobile
```tsx
<div className="hidden lg:block">
  {/* Only visible on desktop */}
</div>
```

### Responsive Typography
```tsx
<h1 className="text-h3 md:text-h2 lg:text-h1 font-sora font-semibold text-neutral-text">
  {/* Text size increases on larger screens */}
</h1>
```

---

## Accessibility Examples

### Form with Labels
```tsx
<div>
  <label htmlFor="email" className="block text-label mb-2">
    Email
  </label>
  <input
    id="email"
    name="email"
    type="email"
    className="input-base"
    aria-required="true"
    aria-invalid={error ? 'true' : 'false'}
  />
  {error && <div role="alert" className="text-signal-700 mt-2">{error}</div>}
</div>
```

### Icon Button with Label
```tsx
<button
  className="focus-visible:ring-2 focus-visible:ring-brand-500"
  aria-label="Close dialog"
>
  <X className="h-6 w-6" />
</button>
```

### Semantic HTML
```tsx
<article>
  <header>
    <h1>Article Title</h1>
    <time dateTime="2024-01-15">January 15, 2024</time>
  </header>
  <section>
    <p>Article content...</p>
  </section>
</article>
```

