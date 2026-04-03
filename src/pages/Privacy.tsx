import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Card from '../components/Card';
import { Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-teal-600" />
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-gray-600">Last updated: March 31, 2024</p>
        </div>

        <Card className="prose prose-teal max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              At GutWise, we take your privacy seriously. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our gut health intelligence
              platform. Please read this policy carefully.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using GutWise, you agree to the collection and use of information in accordance with
              this policy. If you do not agree with our policies and practices, please do not use our
              services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Name, email address, and account credentials</li>
              <li>Health information including symptoms, dietary habits, and wellness data</li>
              <li>Demographic information such as age, gender, and location</li>
              <li>Communication preferences and support inquiries</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Automatically Collected Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you access our services, we automatically collect:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Device information and IP address</li>
              <li>Browser type and operating system</li>
              <li>Usage data and interaction patterns</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Provide, maintain, and improve our services</li>
              <li>Generate personalized health insights and recommendations</li>
              <li>Communicate with you about your account and updates</li>
              <li>Ensure platform security and prevent fraud</li>
              <li>Comply with legal obligations and protect rights</li>
              <li>Conduct research and development with de-identified data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>256-bit encryption for data transmission and storage</li>
              <li>HIPAA-compliant infrastructure and practices</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and employee training programs</li>
              <li>Secure backup and disaster recovery procedures</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights and Choices</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Access and review your personal information</li>
              <li>Request corrections or updates to your data</li>
              <li>Delete your account and associated data</li>
              <li>Export your health data in a portable format</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent for data processing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide
              services. When you delete your account, we will delete or anonymize your personal
              information within 30 days, except where we are required to retain it for legal or
              regulatory purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may share limited information with trusted third-party service providers who assist us
              in operating our platform. These partners are bound by strict confidentiality agreements
              and may only use your information to provide services on our behalf.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We do not sell your personal health information to third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              GutWise is not intended for individuals under the age of 18. We do not knowingly collect
              personal information from children. If you believe we have collected information from a
              child, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by
              posting the new policy on this page and updating the "Last updated" date. We encourage you
              to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong> privacy@gutwise.com
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Address:</strong> 123 Health Plaza, Suite 400, San Francisco, CA 94105
              </p>
              <p className="text-gray-700">
                <strong>Phone:</strong> 1-800-GUT-WISE (1-800-488-9473)
              </p>
            </div>
          </section>
        </Card>

        <div className="mt-8 text-center">
          <Link to="/" className="text-teal-600 hover:text-teal-700 font-medium">
            Return to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
