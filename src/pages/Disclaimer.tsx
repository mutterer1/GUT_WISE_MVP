import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Card from '../components/Card';
import { AlertTriangle } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <h1 className="text-4xl font-bold text-gray-900">Medical Disclaimer</h1>
          </div>
          <p className="text-gray-600">Last updated: March 31, 2024</p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <p className="text-yellow-800 font-medium">
            Important: Please read this disclaimer carefully before using GutWise
          </p>
        </div>

        <Card className="prose prose-yellow max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Not Medical Advice</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The information provided by GutWise is for informational and educational purposes only.
              It is not intended to be, and should not be interpreted as, medical advice, diagnosis, or
              treatment.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>GutWise does not provide medical advice.</strong> Always seek the advice of your
              physician or other qualified health provider with any questions you may have regarding a
              medical condition or treatment.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Never disregard professional medical advice or delay in seeking it because of something
              you have read on or accessed through GutWise.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Doctor-Patient Relationship</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Use of GutWise does not create a doctor-patient relationship between you and GutWise or
              any of its employees, contractors, or affiliated professionals.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The insights, recommendations, and information provided through our platform are generated
              by algorithms and should be reviewed with your healthcare provider before making any
              health-related decisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Emergency Situations</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>If you think you may have a medical emergency, call your doctor or 911
              immediately.</strong>
            </p>
            <p className="text-gray-700 leading-relaxed">
              GutWise is not designed for emergency situations. Do not use GutWise to seek help in an
              emergency. If you are experiencing severe symptoms, seek immediate medical attention.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Individual Results May Vary</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Health outcomes vary from person to person. Results, testimonials, or case studies
              presented on GutWise are not typical and should not be interpreted as guarantees of
              specific results.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Your individual results may differ based on numerous factors including but not limited to
              your current health status, genetics, lifestyle, adherence to recommendations, and other
              personal circumstances.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Accuracy of Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              While we strive to provide accurate and up-to-date information, GutWise makes no
              representations or warranties regarding the accuracy, completeness, or reliability of any
              content on the platform.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Medical knowledge is constantly evolving. Information that is accurate today may be
              outdated tomorrow. We encourage you to verify any health information with current medical
              literature and your healthcare provider.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dietary Recommendations</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Dietary suggestions provided by GutWise are general in nature and may not be suitable for
              everyone. Before making significant changes to your diet, consult with a registered
              dietitian or your healthcare provider.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This is especially important if you have:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Food allergies or intolerances</li>
              <li>Pre-existing medical conditions</li>
              <li>Are pregnant or nursing</li>
              <li>Are taking medications that may interact with certain foods</li>
              <li>Have a history of eating disorders</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Content</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              GutWise may contain links to third-party websites or content created by community members.
              We do not endorse, verify, or assume responsibility for the accuracy or reliability of any
              third-party information.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Users should independently verify any information before relying on it for health-related
              decisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To the fullest extent permitted by law, GutWise and its officers, directors, employees,
              and agents shall not be liable for any direct, indirect, incidental, special, or
              consequential damages arising from your use of the platform or reliance on any
              information provided.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This includes, but is not limited to, damages for loss of health, personal injury,
              emotional distress, or any other losses resulting from the use or inability to use
              GutWise.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Responsibility</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You are solely responsible for your use of GutWise and for any decisions you make based
              on information obtained through the platform. You assume full responsibility for any risks
              associated with such use.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We strongly encourage you to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Maintain regular check-ups with your healthcare provider</li>
              <li>Discuss any insights or recommendations from GutWise with your doctor</li>
              <li>Report any adverse symptoms or reactions promptly to a medical professional</li>
              <li>Use GutWise as a complement to, not a replacement for, professional medical care</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acknowledgment and Acceptance</h2>
            <p className="text-gray-700 leading-relaxed">
              By using GutWise, you acknowledge that you have read, understood, and agree to be bound
              by this Medical Disclaimer. If you do not agree with any part of this disclaimer, you
              should not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Questions or Concerns</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about this Medical Disclaimer, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong> legal@gutwise.com
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
