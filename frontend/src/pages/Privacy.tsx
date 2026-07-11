import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export function Privacy() {
  const sections = [
    {
      title: "1. Information We Collect",
      content: "We collect information you provide when creating an account (name, email, password), when you create or join events, and when you make payments. We also collect usage data such as pages visited, features used, and device information to improve our platform."
    },
    {
      title: "2. How We Use Your Information",
      content: "We use your information to provide and improve our services, process payments securely, send event notifications and updates, respond to your support requests, and ensure platform security. We do not sell your personal data to third parties."
    },
    {
      title: "3. Data Security",
      content: "All passwords are encrypted using bcrypt before storage. Payment information is processed through Stripe and SSLCommerz — we never store raw card data. We use JWT tokens with expiration for secure authentication. Our servers use HTTPS encryption for all data in transit."
    },
    {
      title: "4. Cookies & Local Storage",
      content: "We use localStorage to store your authentication tokens and theme preferences. We do not use tracking cookies. You can clear your browser storage at any time, which will log you out of the platform."
    },
    {
      title: "5. Sharing Your Information",
      content: "We share your information only with: payment processors (Stripe, SSLCommerz) to complete transactions, email services to send notifications, and law enforcement when required by law. We never share your data with advertisers."
    },
    {
      title: "6. Your Rights",
      content: "You have the right to access, update, or delete your account information at any time through your dashboard Settings page. You may also contact us at support@planora.app to request data deletion or a copy of your data."
    },
    {
      title: "7. Children's Privacy",
      content: "Planora is not intended for users under the age of 13. We do not knowingly collect personal information from children. If we discover that a child has provided personal information, we will delete it promptly."
    },
    {
      title: "8. Changes to This Policy",
      content: "We may update this Privacy Policy from time to time. We will notify users of significant changes via email or a prominent notice on our platform. Your continued use of Planora after changes constitutes acceptance of the updated policy."
    },
  ];

  return (
    <div className="bg-neutral-50 dark:bg-neutral-950 min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-orange-200">
            <Shield size={32} />
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4">Privacy Policy</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-lg">Last updated: April 2, 2026</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 shadow-sm p-10 space-y-10">
          <p className="text-neutral-600 dark:text-neutral-400 text-lg leading-relaxed">
            At Planora, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our event management platform.
          </p>

          {sections.map((section) => (
            <div key={section.title} className="border-t border-neutral-100 dark:border-neutral-800 pt-8">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">{section.title}</h2>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">{section.content}</p>
            </div>
          ))}

          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-8">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">9. Contact Us</h2>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:support@planora.app" className="text-orange-600 font-bold hover:underline">support@planora.app</a>{" "}
              or visit our{" "}
              <Link to="/contact" className="text-orange-600 font-bold hover:underline">Contact Page</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
