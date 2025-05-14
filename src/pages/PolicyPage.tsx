
import React from 'react';
import { Link } from 'react-router-dom';

const PolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#121212] text-white py-10">
      <div className="max-w-3xl mx-auto px-4">
        <header className="mb-8">
          <Link 
            to="/"
            className="text-white hover:text-gray-300 flex items-center mb-6"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to homepage
          </Link>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </header>
        
        <div className="space-y-6 text-gray-200">
          <section>
            <h2 className="text-2xl font-bold mb-3">1. Introduction</h2>
            <p>GestorBot ("we", "us") is a project-management assistant that runs on WhatsApp and n8n, using Google Sheets and related services. This Privacy Policy explains what data we collect, how we use it, and your rights.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">2. Data Controller</h2>
            <p>Name: Igor Eckert 2.0</p>
            <p>Contact: privacy@yourdomain.com</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">3. Data We Collect</h2>
            <p>WhatsApp phone number & name: to recognize you and send/receive messages.</p>
            <p className="mt-2">Chat content & timestamps: any messages you send to GestorBot (e.g. task updates).</p>
            <p className="mt-2">Task metadata: titles, due-dates, statuses stored in Google Sheets.</p>
            <p className="mt-2">Technical logs: container logs, IP (for security).</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">4. How We Use Your Data</h2>
            <p>Core service: schedule, track and remind you of tasks via WhatsApp.</p>
            <p className="mt-2">Notifications: send group and one-on-one updates.</p>
            <p className="mt-2">Analytics & improvements: anonymously aggregate usage to improve reliability.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">5. Data Sharing</h2>
            <p>We share your data only with:</p>
            <ul className="list-disc ml-6 mt-2">
              <li>Meta (WhatsApp Cloud API): to deliver messages.</li>
              <li>Google (Sheets API): to store and retrieve tasks.</li>
              <li>Hostinger (VPS provider): to host our server.</li>
            </ul>
            <p className="mt-2">We do not sell or rent your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">6. Data Retention</h2>
            <p>We keep your messages and task history for as long as your account is active.</p>
            <p className="mt-2">You can request deletion of your data at any time (see Section 8).</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">7. Security</h2>
            <p>All data in transit is encrypted (HTTPS/TLS).</p>
            <p className="mt-2">Stored data is protected by access controls on our server and in Google.</p>
            <p className="mt-2">SSH and firewall rules restrict access to our VPS.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc ml-6 mt-2">
              <li>Access your data (what we hold).</li>
              <li>Rectify inaccuracies.</li>
              <li>Erase your data—email us at privacy@yourdomain.com.</li>
              <li>Restrict or object to processing.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy; changes take effect when posted here. We'll notify active WhatsApp groups if there's a material update.</p>
            <p className="mt-2">Contact us at interpretandoevidencia@igorckert.com.br for any questions or requests.</p>
          </section>
        </div>

        <footer className="mt-12 pt-6 border-t border-gray-700 text-gray-400 text-center">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </footer>
      </div>
    </div>
  );
};

export default PolicyPage;
