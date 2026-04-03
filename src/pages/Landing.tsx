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
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <Header />

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-800 rounded-full text-sm font-medium mb-8">
              <Activity className="h-4 w-4" />
              <span>Your gut's new best friend</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Unlock the Power of Your
              <span className="block text-teal-600">Gut Health Intelligence</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your digestive wellness with personalized insights, expert guidance,
              and a supportive community. Because your gut feeling deserves data-driven confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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

            <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-gray-600">
              {trustSignals.map((signal) => {
                const Icon = signal.icon;
                return (
                  <div key={signal.text} className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-teal-600" />
                    <span>{signal.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Thrive
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools and insights to help you understand and improve your gut health
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="bg-gradient-to-r from-teal-600 to-blue-600 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Take Control of Your Gut Health?
            </h2>
            <p className="text-xl text-teal-50 mb-8">
              Join thousands of users who have transformed their digestive wellness
            </p>
            <Link to="/signup">
              <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-50">
                Get Started Free
              </Button>
            </Link>
            <p className="text-sm text-teal-100 mt-4">
              No credit card required. 14-day free trial.
            </p>
          </div>
        </section>

        <footer className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-6 w-6 text-teal-600" />
                  <span className="text-lg font-bold text-gray-900">GutWise</span>
                </div>
                <p className="text-sm text-gray-600">
                  Empowering you with personalized gut health intelligence
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link to="/" className="hover:text-gray-900">Features</Link></li>
                  <li><Link to="/" className="hover:text-gray-900">Pricing</Link></li>
                  <li><Link to="/" className="hover:text-gray-900">FAQ</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link to="/" className="hover:text-gray-900">About</Link></li>
                  <li><Link to="/" className="hover:text-gray-900">Blog</Link></li>
                  <li><Link to="/" className="hover:text-gray-900">Careers</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link to="/privacy" className="hover:text-gray-900">Privacy Policy</Link></li>
                  <li><Link to="/disclaimer" className="hover:text-gray-900">Medical Disclaimer</Link></li>
                  <li><Link to="/" className="hover:text-gray-900">Terms of Service</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
              <p>&copy; 2024 GutWise. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
