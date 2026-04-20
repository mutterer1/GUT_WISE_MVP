import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Brain,
  ChevronRight,
  HeartPulse,
  LineChart,
  Lock,
  Shield,
  Sparkles,
  Waves,
} from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/Button';
import Card from '../components/Card';
import GutIntelligenceModal from '../components/GutIntelligenceModal';
import BadgeOnboardingHint from '../components/BadgeOnboardingHint';
import { LogoFull } from '../components/Logo';

const HINT_DISMISSED_KEY = 'gutwise_badge_hint_dismissed';

const features = [
  {
    icon: Brain,
    title: 'Pattern recognition built for real life',
    description:
      'GutWise connects symptoms, meals, hydration, sleep, and stress into a tighter signal model so you can see what actually changes your baseline.',
    accent: 'intelligence',
  },
  {
    icon: LineChart,
    title: 'Trend framing instead of raw charts',
    description:
      'Move from isolated logs to directional understanding with cleaner weekly and monthly views that emphasize change, stability, and emerging drift.',
    accent: 'primary',
  },
  {
    icon: Shield,
    title: 'Private by default',
    description:
      'Sensitive health data stays inside a low-glare, clinical-feeling workspace designed to protect trust as much as it improves clarity.',
    accent: 'quiet',
  },
  {
    icon: HeartPulse,
    title: 'Signals you can act on',
    description:
      'Capture what happened in minutes and get a stronger foundation for conversations, self-observation, and better daily decisions.',
    accent: 'primary',
  },
];

const trustSignals = [
  { icon: Lock, text: 'Encrypted health records' },
  { icon: Shield, text: 'Privacy-first architecture' },
  { icon: Waves, text: 'Clinically informed tracking model' },
];

const operatingPoints = [
  'Log symptoms, meals, hydration, stress, sleep, and context in one system.',
  'Spot recurring triggers and recovery patterns without manual guesswork.',
  'Build a calmer, more structured view of digestive health over time.',
];

export default function Landing() {
  const [intelligenceModalOpen, setIntelligenceModalOpen] = useState(false);
  const [hintVisible, setHintVisible] = useState(() => !localStorage.getItem(HINT_DISMISSED_KEY));

  const handleDismissHint = () => {
    localStorage.setItem(HINT_DISMISSED_KEY, 'true');
    setHintVisible(false);
  };

  return (
    <div className="min-h-screen bg-app text-[var(--color-text-primary)]">
      <Header />

      <main className="overflow-hidden pt-20">
        <section className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(84,160,255,0.14),transparent_34%),radial-gradient(circle_at_70%_20%,rgba(133,93,255,0.1),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_40%)]" />
          <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[rgba(84,160,255,0.08)] blur-3xl" />

          <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 pb-14 pt-10 sm:px-6 lg:flex-row lg:items-end lg:gap-10 lg:px-8 lg:pb-20 lg:pt-16">
            <div className="w-full max-w-3xl">
              <div className="relative mb-6 inline-block">
                <button
                  type="button"
                  onClick={() => setIntelligenceModalOpen(true)}
                  aria-haspopup="dialog"
                  aria-label="Learn how GutWise intelligence works"
                  className="surface-intelligence interactive-lift inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-[var(--color-text-primary)]"
                >
                  <Sparkles className="h-4 w-4 text-[var(--color-accent-secondary)]" />
                  AI-powered gut intelligence
                </button>
                <BadgeOnboardingHint visible={hintVisible} />
              </div>

              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-[var(--color-text-primary)] sm:text-6xl lg:text-[4.6rem]">
                Private digestive health intelligence for the signals you live with every day.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--color-text-secondary)] sm:text-lg">
                GutWise turns scattered logs into a more coherent clinical picture. Track what happened,
                surface meaningful patterns, and build a calmer understanding of what your body is
                communicating.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start with GutWise
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <Link to="/login">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Log in
                  </Button>
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {trustSignals.map((signal) => {
                  const Icon = signal.icon;

                  return (
                    <div
                      key={signal.text}
                      className="surface-panel-soft inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-[var(--color-text-secondary)]"
                    >
                      <Icon className="h-4 w-4 text-[var(--color-accent-primary)]" />
                      <span>{signal.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="w-full max-w-xl lg:ml-auto">
              <div className="surface-panel relative overflow-hidden rounded-[32px] p-5 sm:p-6">
                <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
                      Daily operating view
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                      A tighter read on symptoms and triggers
                    </p>
                  </div>
                  <div className="surface-intelligence flex h-12 w-12 items-center justify-center rounded-2xl">
                    <Brain className="h-5 w-5 text-[var(--color-accent-secondary)]" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="surface-panel-quiet rounded-3xl p-4">
                    <p className="metric-label">Symptom load</p>
                    <p className="metric-value mt-2">Lower this week</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-tertiary)]">
                      Stability improved after more consistent hydration and earlier evening meals.
                    </p>
                  </div>

                  <div className="surface-intelligence rounded-3xl p-4">
                    <p className="metric-label">Pattern shift</p>
                    <p className="metric-value mt-2">Stress-linked flare window</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                      Symptoms cluster more often on low-sleep, high-stress days.
                    </p>
                  </div>

                  <div className="surface-panel-quiet rounded-3xl p-4 sm:col-span-2">
                    <p className="metric-label">What GutWise helps frame</p>
                    <div className="mt-3 space-y-3">
                      {operatingPoints.map((point) => (
                        <div key={point} className="flex items-start gap-3">
                          <div className="mt-1 h-2 w-2 rounded-full bg-[var(--color-accent-primary)]" />
                          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="mb-8 max-w-2xl">
            <span className="badge-secondary mb-3 inline-flex">Why it feels different</span>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)] sm:text-4xl">
              Less generic wellness. More focused clinical signal.
            </h2>
            <p className="mt-3 text-base leading-7 text-[var(--color-text-secondary)]">
              The product is designed to help you observe patterns with more confidence, not bury you
              in visual noise.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              const variant = feature.accent === 'intelligence' ? 'discovery' : 'elevated';

              return (
                <Card
                  key={feature.title}
                  variant={variant}
                  glowIntensity={feature.accent === 'intelligence' ? 'medium' : 'subtle'}
                  className="card-enter rounded-[28px]"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={[
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
                        feature.accent === 'intelligence'
                          ? 'bg-[rgba(133,93,255,0.14)] text-[var(--color-accent-secondary)]'
                          : 'bg-[rgba(84,160,255,0.12)] text-[var(--color-accent-primary)]',
                      ].join(' ')}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold tracking-[-0.02em] text-[var(--color-text-primary)]">
                        {feature.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="surface-panel relative overflow-hidden rounded-[36px] px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(133,93,255,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(84,160,255,0.12),transparent_26%)]" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <span className="badge-secondary mb-3 inline-flex">Guided by intelligence</span>
                <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)] sm:text-4xl">
                  Build a clearer health narrative without doing the interpretation alone.
                </h2>
                <p className="mt-4 text-base leading-8 text-[var(--color-text-secondary)]">
                  Start tracking with a more deliberate structure and let GutWise help surface the
                  relationships worth paying attention to.
                </p>
              </div>

              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
                <Link to="/signup">
                  <Button size="lg">
                    Begin your account
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-sm text-[var(--color-text-tertiary)]">
                  A quieter, sharper way to monitor digestive health.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10">
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8">
            <div>
              <div className="text-[var(--color-text-primary)]">
                <LogoFull />
              </div>
              <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--color-text-tertiary)]">
                Turning daily body signals into a more usable understanding of digestive health.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                Product
              </h3>
              <div className="mt-4 space-y-3 text-sm text-[var(--color-text-tertiary)]">
                <Link to="/" className="block transition-smooth hover:text-[var(--color-text-primary)]">
                  Features
                </Link>
                <Link to="/" className="block transition-smooth hover:text-[var(--color-text-primary)]">
                  Intelligence
                </Link>
                <Link to="/" className="block transition-smooth hover:text-[var(--color-text-primary)]">
                  Tracking
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                Company
              </h3>
              <div className="mt-4 space-y-3 text-sm text-[var(--color-text-tertiary)]">
                <Link to="/" className="block transition-smooth hover:text-[var(--color-text-primary)]">
                  About
                </Link>
                <Link to="/" className="block transition-smooth hover:text-[var(--color-text-primary)]">
                  Contact
                </Link>
                <Link to="/" className="block transition-smooth hover:text-[var(--color-text-primary)]">
                  FAQ
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                Legal
              </h3>
              <div className="mt-4 space-y-3 text-sm text-[var(--color-text-tertiary)]">
                <Link
                  to="/privacy"
                  className="block transition-smooth hover:text-[var(--color-text-primary)]"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/disclaimer"
                  className="block transition-smooth hover:text-[var(--color-text-primary)]"
                >
                  Medical Disclaimer
                </Link>
                <Link to="/" className="block transition-smooth hover:text-[var(--color-text-primary)]">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <GutIntelligenceModal
        isOpen={intelligenceModalOpen}
        onClose={() => setIntelligenceModalOpen(false)}
        showHintDismiss={hintVisible}
        onDismissHint={handleDismissHint}
      />
    </div>
  );
}
