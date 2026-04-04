import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
import Card from '../components/Card';
import {
  Brain,
  Shield,
  TrendingUp,
  Users,
  Lock,
  Award,
  ChevronRight,
  Activity
} from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: Brain,
      title: 'Personalized Insights',
      description: 'AI-powered analysis tailored to your unique gut microbiome and health patterns.',
    },
    {
      icon: TrendingUp,
      title: 'Track Your Progress',
      description: 'Monitor improvements over time with detailed charts and actionable recommendations.',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your health data is encrypted and never shared without your explicit consent.',
    },
    {
      icon: Users,
      title: 'Expert Community',
      description: 'Connect with others on similar journeys and learn from certified health professionals.',
    },
  ];

  const trustSignals = [
    { icon: Lock, text: 'HIPAA Compliant' },
    { icon: Shield, text: 'Bank-Level Encryption' },
    { icon: Award, text: 'Medically Reviewed' },
  ];

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Header />

      <main>
        <section className="max-w-7xl mx-auto px-lg sm:px-lg lg:px-lg py-xl sm:py-2xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 text-brand-900 rounded-full text-body-sm font-medium mb-lg">
              <Activity className="h-4 w-4" />
              <span>Your gut's new best friend</span>
            </div>

            <h1 className="text-display-md sm:text-display-lg lg:text-5xl font-sora font-semibold text-neutral-text mb-lg leading-tight">
              Unlock the Power of Your
              <span className="block text-brand-500">Gut Health Intelligence</span>
            </h1>

            <p className="text-body-lg text-neutral-muted mb-lg max-w-3xl mx-auto leading-relaxed">
              Transform your digestive wellness with personalized insights, expert guidance,
              and a supportive community. Because your gut feeling deserves data-driven confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-md justify-center items-center">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Your Journey
                  <ChevronRight className="inline ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Log In
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-lg mt-2xl text-body-sm text-neutral-muted">
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
        </section>

        <section className="max-w-7xl mx-auto px-lg sm:px-lg lg:px-lg py-xl">
          <div className="text-center mb-2xl">
            <h2 className="text-h2 font-sora font-semibold text-neutral-text mb-md">
              Everything You Need to Thrive
            </h2>
            <p className="text-body-lg text-neutral-muted max-w-2xl mx-auto">
              Comprehensive tools and insights to help you understand and improve your gut health
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md lg:gap-lg">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} variant="elevated">
                  <div className="flex items-start gap-md">
                    <div className="flex-shrink-0 w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-brand-500" />
                    </div>
                    <div>
                      <h3 className="text-h5 font-sora font-semibold text-neutral-text mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-body-md text-neutral-muted leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="bg-gradient-to-br from-brand-500 to-brand-700 py-xl sm:py-2xl">
          <div className="max-w-4xl mx-auto px-lg sm:px-lg lg:px-lg text-center">
            <h2 className="text-h2 sm:text-display-md font-sora font-semibold text-white mb-md">
              Ready to Take Control of Your Gut Health?
            </h2>
            <p className="text-body-lg text-brand-100 mb-lg">
              Join thousands of users who have transformed their digestive wellness
            </p>
            <Link to="/signup">
              <Button size="lg" className="bg-white text-brand-500 hover:bg-neutral-bg">
                Get Started Free
              </Button>
            </Link>
            <p className="text-body-sm text-brand-200 mt-md">
              No credit card required. 14-day free trial.
            </p>
          </div>
        </section>

        <footer className="bg-neutral-surface border-t border-neutral-border">
          <div className="max-w-7xl mx-auto px-lg sm:px-lg lg:px-lg py-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
              <div>
                <div className="flex items-center gap-2 mb-md">
                  <Activity className="h-6 w-6 text-brand-500" />
                  <span className="text-h5 font-sora font-semibold text-neutral-text">GutWise</span>
                </div>
                <p className="text-body-sm text-neutral-muted">
                  Empowering you with personalized gut health intelligence
                </p>
              </div>

              <div>
                <h4 className="font-sora font-semibold text-neutral-text mb-md">Product</h4>
                <ul className="space-y-2 text-body-sm text-neutral-muted">
                  <li><Link to="/" className="hover:text-neutral-text transition-colors">Features</Link></li>
                  <li><Link to="/" className="hover:text-neutral-text transition-colors">Pricing</Link></li>
                  <li><Link to="/" className="hover:text-neutral-text transition-colors">FAQ</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-sora font-semibold text-neutral-text mb-md">Company</h4>
                <ul className="space-y-2 text-body-sm text-neutral-muted">
                  <li><Link to="/" className="hover:text-neutral-text transition-colors">About</Link></li>
                  <li><Link to="/" className="hover:text-neutral-text transition-colors">Blog</Link></li>
                  <li><Link to="/" className="hover:text-neutral-text transition-colors">Careers</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-sora font-semibold text-neutral-text mb-md">Legal</h4>
                <ul className="space-y-2 text-body-sm text-neutral-muted">
                  <li><Link to="/privacy" className="hover:text-neutral-text transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/disclaimer" className="hover:text-neutral-text transition-colors">Medical Disclaimer</Link></li>
                  <li><Link to="/" className="hover:text-neutral-text transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-neutral-border mt-xl pt-xl text-center text-body-sm text-neutral-muted">
              <p>&copy; 2024 GutWise. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
