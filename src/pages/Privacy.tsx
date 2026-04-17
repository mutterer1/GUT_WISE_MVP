import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Card from '../components/Card';
import { Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-neutral-bg dark:bg-dark-bg">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="h-7 w-7 text-brand-500 dark:text-brand-300" />
            <h1 className="text-3xl font-sora font-semibold text-neutral-text dark:text-dark-text">Privacy Policy</h1>
          </div>
          <p className="text-sm text-neutral-muted dark:text-dark-muted">Last updated: March 2026 — contact details will be finalised before public launch</p>
        </div>

        <Card>
          <div className="space-y-8 text-sm leading-relaxed text-neutral-muted dark:text-dark-muted">

            <section>
              <h2 className="text-base font-semibold text-neutral-text dark:text-dark-text mb-3">Overview</h2>
              <p className="mb-3">
                GutWise is a personal gut-health intelligence tool. We built it to be private-first. Your health data is yours — we do not sell it, profile you for advertisers, or share it beyond what is necessary to run the service.
              </p>
              <p>
                This policy explains what we collect, why, and what you can do with your data. If anything is unclear, reach out. We will always try to give you a straight answer.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-neutral-text dark:text-dark-text mb-3">What we collect</h2>
              <p className="mb-3">We collect only what is needed to run GutWise:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Account credentials — email address and a hashed password</li>
                <li>Health logs you choose to enter — bowel movements, symptoms, food, hydration, sleep, stress, medications, and menstrual cycle data</li>
                <li>Optional profile information such as age range and diagnosed conditions, used solely to personalise your insights</li>
                <li>Basic technical information — browser type and session data, used only for platform security and reliability</li>
              </ul>
              <p className="mt-3">
                We do not collect location data beyond what you choose to enter. We do not use third-party advertising trackers.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-neutral-text dark:text-dark-text mb-3">How we use your information</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>To generate your personal gut-health insights within the app</li>
                <li>To maintain and improve the GutWise platform</li>
                <li>To communicate with you about your account</li>
                <li>To keep the platform secure</li>
              </ul>
              <p className="mt-3">
                We do not use your health data for research or aggregate analysis without your explicit consent.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-neutral-text dark:text-dark-text mb-3">Data security</h2>
              <p className="mb-3">
                Your data is stored on infrastructure provided by Supabase, which uses encryption at rest and in transit. Access to your data is restricted to your account through row-level security controls.
              </p>
              <p>
                No security measure is absolute. We are committed to acting promptly and transparently if a breach occurs.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-neutral-text dark:text-dark-text mb-3">Third-party services</h2>
              <p className="mb-3">
                We use a small number of trusted third-party providers to operate GutWise — including database infrastructure and AI inference. These providers process your data only as instructed by us and are not permitted to use it for their own purposes.
              </p>
              <p>
                We do not sell your personal or health data to any third party.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-neutral-text dark:text-dark-text mb-3">Your rights</h2>
              <p className="mb-3">You can, at any time:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Access and review the data stored in your account</li>
                <li>Export all your health data as a structured file from Data Management Settings</li>
                <li>Delete all your health logs from Data Management Settings</li>
                <li>Delete your account entirely by contacting us</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-neutral-text dark:text-dark-text mb-3">Data retention</h2>
              <p>
                Your data is retained while your account is active. If you delete your account, your personal data will be removed within a reasonable period except where retention is required by law.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-neutral-text dark:text-dark-text mb-3">Children</h2>
              <p>
                GutWise is intended for adults aged 18 and over. We do not knowingly collect data from anyone under 18.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-neutral-text dark:text-dark-text mb-3">Changes to this policy</h2>
              <p>
                We will update this policy as the product evolves. Material changes will be communicated in-app. The date at the top of this page reflects the most recent revision.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-neutral-text dark:text-dark-text mb-3">Contact</h2>
              <p className="mb-3">
                For privacy-related questions or data requests, please contact us through the in-app support channel. A dedicated privacy contact address will be published here before public launch.
              </p>
            </section>

          </div>
        </Card>

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-brand-500 dark:text-brand-300 hover:text-brand-700 dark:hover:text-brand-100 font-medium transition-colors">
            Return to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
