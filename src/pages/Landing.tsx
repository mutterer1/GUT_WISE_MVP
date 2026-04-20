import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
import Card from '../components/Card';
import GutIntelligenceModal from '../components/GutIntelligenceModal';
import BadgeOnboardingHint from '../components/BadgeOnboardingHint';
import {
  Brain,
  Shield,
  Lock,
  Award,
  ChevronRight,
  Sparkles,
  LineChart,
  Heart,
} from 'lucide-react';

const HINT_DISMISSED_KEY = 'gutwise_badge_hint_dismissed';

export default function Landing() {
  const [intelligenceModalOpen, setIntelligenceModalOpen] = useState(false);
  const [hintVisible, setHintVisible] = useState(
    () => !localStorage.getItem(HINT_DISMISSED_KEY)
  );

  const handleDismissHint = () => {
    localStorage.setItem(HINT_DISMISSED_KEY, 'true');
    setHintVisible(false);
  };

  const features = [
    {
      icon: Brain,
      title: 'Pattern Recognition',
      description:
        'Our AI analyzes your daily logs to surface connections between your diet, stress, sleep, and digestive symptoms that would be impossible to spot on your own.',
      isAI: true,
    },
    {
      icon: LineChart,
      title: 'Meaningful Trends',
      description:
        'Move beyond raw data. See how your body responds over time with clear visualizations that tell the story of your gut health journey.',
      isAI: false,
    },
    {
      icon: Shield,
      title: 'Clinical-Grade Privacy',
      description:
        'Your health data is encrypted end-to-end and never shared. Built to exceed HIPAA requirements because trust is non-negotiable.',
      isAI: false,
    },
    {
      icon: Heart,
      title: 'Body Signals Decoded',
      description:
        'Log symptoms, meals, and lifestyle factors in seconds. GutWise translates these signals into actionable understanding.',
      isAI: false,
    },
  ];

  const trustSignals = [
    { icon: Lock, text: 'HIPAA Compliant' },
    { icon: Shield, text: 'End-to-End Encrypted' },
    { icon: Award, text: 'Clinically Informed' },
  ];

  return (
    <div className="min-h-screen bg-neutral-bg dark:bg-dark-bg">
      <Header />

      <main className="pt-24">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 gradient-dark-radial dark:opacity-100 opacity-0" />
          <div className="absolute top-0 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl dark:bg-brand-500/10" />

          <div className="relative mx-auto max-w-7xl px-lg pb-xl pt-4xl sm:px-lg sm:pb-2xl sm:pt-3xl lg:px-lg lg:pt-3xl">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-lg inline-block">
                <button
                  onClick={() => setIntelligenceModalOpen(true)}
                  aria-haspopup="dialog"
                  aria-label="Learn how GutWise AI intelligence works"
                  className="group inline-flex cursor-pointer select-none items-center gap-2 rounded-full border border-dark-border border-brand-200 bg-dark-elevated bg-brand-100 px-4 py-2 text-body-sm font-medium transition-all duration-200 hover:bg-discovery-500/5 hover:border-discovery-500/50 focus-visible:ring-2 focus-visible:ring-discovery-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:scale-[0.97] dark:border-dark-border dark:bg-dark-elevated"
                >
                  <Sparkles className="h-4 w-4 text-discovery-500 transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-neutral-text dark:text-dark-text">AI-Powered Gut Intelligence</span>
                </button>
                <BadgeOnboardingHint visible={hintVisible} />
              </div>

              <div className="mx-auto mb-lg w-full max-w-2xl">
                <h1 className="mb-md text-display-md font-sora font-semibold leading-tight text-neutral-text dark:text-dark-text sm:text-display-lg lg:text-5xl">
                  Understand What Your <br />
                  <span className="text-signal-500">Body</span> Is Telling{' '}
                  <span className="text-discovery-500">You</span>
                </h1>
                <p className="text-center text-body-lg leading-relaxed text-neutral-muted dark:text-dark-muted">
                  GutWise transforms scattered health logs into clear insights. See the patterns.
                  Understand the connections. Make informed decisions about your digestive wellness.
                </p>
              </div>

              <div className="mb-md flex flex-col items-center justify-center gap-md sm:flex-row">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Understanding
                    <ChevronRight className="ml-2 inline h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"
                  >
                    Log In
                  </Button>
                </Link>
              </div>

              <div className="mt-lg flex flex-wrap justify-center gap-lg text-body-sm text-neutral-muted dark:text-dark-muted">
                {trustSignals.map((signal) => {
                  const Icon = signal.icon;
                  return (
                    <div key={signal.text} className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-brand-500" />
                      <span>{signal.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-lg py-xl sm:px-lg lg:px-lg">
          <div className="mb-2xl flex flex-col items-center text-center">
            <div className="mx-auto w-full max-w-2xl">
              <h2 className="mb-md text-h2 font-sora font-semibold text-neutral-text dark:text-dark-text">
                Intelligence, Not Just Tracking
              </h2>
              <p className="text-center text-body-lg text-neutral-muted dark:text-dark-muted">
                Most health apps give you charts. GutWise gives you understanding.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-md md:grid-cols-2 lg:gap-lg">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  variant={feature.isAI ? 'discovery' : 'elevated'}
                  glowIntensity={feature.isAI ? 'medium' : 'subtle'}
                  className="transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex items-start gap-md">
                    <div
                      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
                        feature.isAI
                          ? 'bg-discovery-500/10 dark:bg-discovery-500/20'
                          : 'bg-brand-500/10 dark:bg-brand-500/20'
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 ${
                          feature.isAI ? 'text-discovery-500' : 'text-brand-500'
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="mb-2 text-h5 font-sora font-semibold text-neutral-text dark:text-dark-text">
                        {feature.title}
                        {feature.isAI && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-discovery-500/10 px-2 py-0.5 text-xs font-medium text-discovery-500">
                            AI
                          </span>
                        )}
                      </h3>
                      <p className="text-body-md leading-relaxed text-neutral-muted dark:text-dark-muted">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-700 to-brand-900 dark:from-brand-900 dark:to-dark-bg" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(124,92,255,0.15)_0%,_transparent_70%)]" />

          <div className="relative mx-auto max-w-4xl px-lg py-xl sm:px-lg sm:py-2xl lg:px-lg">
            <div className="flex flex-col items-center text-center">
              <div className="mb-md inline-flex items-center gap-2">
                <Brain className="h-5 w-5 text-discovery-300" />
                <span className="text-body-sm text-brand-200">Powered by AI</span>
              </div>

              <div className="mx-auto mb-lg w-full max-w-xl">
                <h2 className="mb-md text-h2 font-sora font-semibold text-white sm:text-display-md">
                  Your Gut Health Story, Understood
                </h2>
                <p className="text-center text-body-lg text-brand-100">
                  Every body is different. GutWise learns your patterns and surfaces insights that
                  matter specifically to you.
                </p>
              </div>

              <div className="flex flex-col items-center gap-sm">
                <Link to="/signup">
                  <Button size="lg" className="!bg-white !text-brand-700 hover:!bg-brand-50">
                    Begin Your Journey
                  </Button>
                </Link>
                <p className="text-body-sm text-brand-200">
                  Free 14-day trial. No credit card required.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-neutral-border bg-neutral-surface dark:border-dark-border dark:bg-dark-bg">
          <div className="mx-auto max-w-7xl px-lg py-xl sm:px-lg lg:px-lg">
            <div className="grid grid-cols-1 gap-lg md:grid-cols-4">
              <div>
                <div className="mb-md">
                  <img
                    src="/logos/gutwise-horizontal-dark.svg"
                    alt="GutWise"
                    className="block h-12 w-auto"
                  />
                </div>
                <p className="text-body-sm text-neutral-muted dark:text-dark-muted">
                  Turning body signals into understanding
                </p>
              </div>

              <div>
                <h4 className="mb-md font-sora font-semibold text-neutral-text dark:text-dark-text">
                  Product
                </h4>
                <ul className="space-y-2 text-body-sm text-neutral-muted dark:text-dark-muted">
                  <li>
                    <Link
                      to="/"
                      className="transition-colors hover:text-neutral-text dark:hover:text-dark-text"
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/"
                      className="transition-colors hover:text-neutral-text dark:hover:text-dark-text"
                    >
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/"
                      className="transition-colors hover:text-neutral-text dark:hover:text-dark-text"
                    >
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-md font-sora font-semibold text-neutral-text dark:text-dark-text">
                  Company
                </h4>
                <ul className="space-y-2 text-body-sm text-neutral-muted dark:text-dark-muted">
                  <li>
                    <Link
                      to="/"
                      className="transition-colors hover:text-neutral-text dark:hover:text-dark-text"
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/"
                      className="transition-colors hover:text-neutral-text dark:hover:text-dark-text"
                    >
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/"
                      className="transition-colors hover:text-neutral-text dark:hover:text-dark-text"
                    >
                      Careers
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-md font-sora font-semibold text-neutral-text dark:text-dark-text">
                  Legal
                </h4>
                <ul className="space-y-2 text-body-sm text-neutral-muted dark:text-dark-muted">
                  <li>
                    <Link
                      to="/privacy"
                      className="transition-colors hover:text-neutral-text dark:hover:text-dark-text"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/disclaimer"
                      className="transition-colors hover:text-neutral-text dark:hover:text-dark-text"
                    >
                      Medical Disclaimer
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/"
                      className="transition-colors hover:text-neutral-text dark:hover:text-dark-text"
                    >
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-xl border-t border-neutral-border pt-xl text-center text-body-sm text-neutral-muted dark:border-dark-border dark:text-dark-muted">
              <p>&copy; 2026 GutWise. All rights reserved.</p>
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
