import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
import Card from '../components/Card';
import Logo from '../components/Logo';
import {
  Brain,
  Shield,
  TrendingUp,
  Lock,
  Award,
  ChevronRight,
  Sparkles,
  LineChart,
  Heart
} from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: Brain,
      title: 'Pattern Recognition',
      description: 'Our AI analyzes your daily logs to surface connections between your diet, stress, sleep, and digestive symptoms that would be impossible to spot on your own.',
      isAI: true,
    },
    {
      icon: LineChart,
      title: 'Meaningful Trends',
      description: 'Move beyond raw data. See how your body responds over time with clear visualizations that tell the story of your gut health journey.',
      isAI: false,
    },
    {
      icon: Shield,
      title: 'Clinical-Grade Privacy',
      description: 'Your health data is encrypted end-to-end and never shared. Built to exceed HIPAA requirements because trust is non-negotiable.',
      isAI: false,
    },
    {
      icon: Heart,
      title: 'Body Signals Decoded',
      description: 'Log symptoms, meals, and lifestyle factors in seconds. GutWise translates these signals into actionable understanding.',
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
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-500/5 dark:bg-brand-500/10 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-lg sm:px-lg lg:px-lg pt-2xl lg:pt-xl sm:pt-2xl pb-xl sm:pb-2xl">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-dark-elevated dark:bg-dark-elevated bg-brand-100 border border-dark-border dark:border-dark-border border-brand-200 rounded-full text-body-sm font-medium mb-lg">
                <Sparkles className="h-4 w-4 text-discovery-500" />
                <span className="text-neutral-text dark:text-dark-text">AI-Powered Gut Intelligence</span>
              </div>

              <h1 className="text-display-md sm:text-display-lg lg:text-5xl font-sora font-semibold text-neutral-text dark:text-dark-text mb-lg leading-tight">
                Understand What Your
                <span className="block text-Rose-500">Body<span className="block text-brand-500">Is Telling<span className="block text-discovery-500">You</<h1>

              <p className="text-body-lg text-neutral-muted dark:text-dark-muted mb-lg max-w-2xl mx-auto leading-relaxed">
                GutWise transforms scattered health logs into clear insights.
                See the patterns. Understand the connections. Make informed decisions
                about your digestive wellness.
              </p>

              <div className="flex flex-col sm:flex-row gap-md justify-center items-center">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Understanding
                    <ChevronRight className="inline ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">
                    Log In
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center gap-lg mt-2xl text-body-sm text-neutral-muted dark:text-dark-muted">
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

        <section className="max-w-7xl mx-auto px-lg sm:px-lg lg:px-lg py-xl">
          <div className="text-center mb-2xl">
            <h2 className="text-h2 font-sora font-semibold text-neutral-text dark:text-dark-text mb-md">
              Intelligence, Not Just Tracking
            </h2>
            <p className="text-body-lg text-neutral-muted dark:text-dark-muted max-w-2xl mx-auto">
              Most health apps give you charts. GutWise gives you understanding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md lg:gap-lg">
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
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                      feature.isAI
                        ? 'bg-discovery-500/10 dark:bg-discovery-500/20'
                        : 'bg-brand-500/10 dark:bg-brand-500/20'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        feature.isAI ? 'text-discovery-500' : 'text-brand-500'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-h5 font-sora font-semibold text-neutral-text dark:text-dark-text mb-2">
                        {feature.title}
                        {feature.isAI && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs font-medium bg-discovery-500/10 text-discovery-500 rounded-full">
                            AI
                          </span>
                        )}
                      </h3>
                      <p className="text-body-md text-neutral-muted dark:text-dark-muted leading-relaxed">
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

          <div className="relative max-w-4xl mx-auto px-lg sm:px-lg lg:px-lg py-xl sm:py-2xl text-center">
            <div className="inline-flex items-center gap-2 mb-md">
              <Brain className="h-5 w-5 text-discovery-300" />
              <span className="text-body-sm text-brand-200">Powered by AI</span>
            </div>

            <h2 className="text-h2 sm:text-display-md font-sora font-semibold text-white mb-md">
              Your Gut Health Story, Understood
            </h2>
            <p className="text-body-lg text-brand-100 mb-lg max-w-xl mx-auto">
              Every body is different. GutWise learns your patterns and surfaces insights
              that matter specifically to you.
            </p>
            <Link to="/signup">
              <Button size="lg" className="bg-white text-brand-700 hover:bg-brand-50">
                Begin Your Journey
              </Button>
            </Link>
            <p className="text-body-sm text-brand-200 mt-md">
              Free 14-day trial. No credit card required.
            </p>
          </div>
        </section>

        <footer className="bg-neutral-surface dark:bg-dark-bg border-t border-neutral-border dark:border-dark-border">
          <div className="max-w-7xl mx-auto px-lg sm:px-lg lg:px-lg py-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
              <div>
                <div className="mb-md">
                  <Logo variant="full" size="sm" />
                </div>
                <p className="text-body-sm text-neutral-muted dark:text-dark-muted">
                  Turning body signals into understanding
                </p>
              </div>

              <div>
                <h4 className="font-sora font-semibold text-neutral-text dark:text-dark-text mb-md">Product</h4>
                <ul className="space-y-2 text-body-sm text-neutral-muted dark:text-dark-muted">
                  <li><Link to="/" className="hover:text-neutral-text dark:hover:text-dark-text transition-colors">Features</Link></li>
                  <li><Link to="/" className="hover:text-neutral-text dark:hover:text-dark-text transition-colors">Pricing</Link></li>
                  <li><Link to="/" className="hover:text-neutral-text dark:hover:text-dark-text transition-colors">FAQ</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-sora font-semibold text-neutral-text dark:text-dark-text mb-md">Company</h4>
                <ul className="space-y-2 text-body-sm text-neutral-muted dark:text-dark-muted">
                  <li><Link to="/" className="hover:text-neutral-text dark:hover:text-dark-text transition-colors">About</Link></li>
                  <li><Link to="/" className="hover:text-neutral-text dark:hover:text-dark-text transition-colors">Blog</Link></li>
                  <li><Link to="/" className="hover:text-neutral-text dark:hover:text-dark-text transition-colors">Careers</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-sora font-semibold text-neutral-text dark:text-dark-text mb-md">Legal</h4>
                <ul className="space-y-2 text-body-sm text-neutral-muted dark:text-dark-muted">
                  <li><Link to="/privacy" className="hover:text-neutral-text dark:hover:text-dark-text transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/disclaimer" className="hover:text-neutral-text dark:hover:text-dark-text transition-colors">Medical Disclaimer</Link></li>
                  <li><Link to="/" className="hover:text-neutral-text dark:hover:text-dark-text transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-neutral-border dark:border-dark-border mt-xl pt-xl text-center text-body-sm text-neutral-muted dark:text-dark-muted">
              <p>&copy; 2024 GutWise. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
