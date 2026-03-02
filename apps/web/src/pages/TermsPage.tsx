import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

const sections = [
  {
    title: 'Acceptance of Terms',
    content:
      'By accessing or using DevHub, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform. We reserve the right to modify these terms at any time, and your continued use constitutes acceptance of any changes.',
  },
  {
    title: 'Account Responsibilities',
    content:
      'You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information when creating your account. You are responsible for all activity that occurs under your account. You must be at least 13 years old to create an account. You agree to notify us immediately of any unauthorized use of your account.',
  },
  {
    title: 'User Content',
    content:
      'You retain ownership of the content you post on DevHub. By posting content, you grant DevHub a non-exclusive, worldwide license to display and distribute your content on the platform. You are solely responsible for the content you post. Content must not violate any applicable laws or third-party rights. We reserve the right to remove content that violates these terms or our community guidelines.',
  },
  {
    title: 'Acceptable Use',
    content:
      'You agree not to: post spam, malware, or misleading content; harass, bully, or threaten other users; impersonate others or create fake accounts; attempt to gain unauthorized access to the platform or other accounts; use the platform for any illegal activities; circumvent any security features or restrictions.',
  },
  {
    title: 'Communities',
    content:
      'Community creators are responsible for moderating their communities. Communities must follow platform-wide rules in addition to their own rules. We reserve the right to intervene in community moderation when necessary. Communities that consistently violate platform rules may be removed.',
  },
  {
    title: 'Voting & Reputation',
    content:
      'Votes should reflect genuine opinions about content quality. Vote manipulation (using multiple accounts, coordinated voting) is prohibited. Karma and reputation scores are for platform use only and have no monetary value.',
  },
  {
    title: 'Intellectual Property',
    content:
      'The DevHub platform, its design, code, and branding are protected by intellectual property laws. The DevHub name and logo are our trademarks. You may not use our branding without prior written permission. Open-source components are subject to their respective licenses.',
  },
  {
    title: 'Limitation of Liability',
    content:
      'DevHub is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the platform. We do not guarantee that the platform will be available at all times or free from errors. We are not responsible for user-generated content or interactions between users.',
  },
  {
    title: 'Termination',
    content:
      'We may suspend or terminate your account for violations of these terms. You may delete your account at any time through the Settings page. Upon termination, your right to use the platform ceases immediately. Content you have posted may remain on the platform after account deletion.',
  },
];

export function TermsPage() {
  return (
    <>
      <Helmet>
        <title>User Agreement - DevHub</title>
      </Helmet>

      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <FileText className="h-6 w-6 text-brand-400" />
            <h1 className="text-2xl font-bold text-white">User Agreement</h1>
          </div>
          <p className="text-sm text-gray-400">
            Last updated: March 2026
          </p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 mb-6">
          <p className="text-sm leading-relaxed text-gray-300">
            Welcome to DevHub. These terms govern your use of our platform. Please read them
            carefully before using DevHub.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section, i) => (
            <div key={section.title} className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <h2 className="mb-3 font-semibold text-white">
                {i + 1}. {section.title}
              </h2>
              <p className="text-sm leading-relaxed text-gray-400">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-gray-800 bg-gray-900 p-6 text-center">
          <p className="text-sm text-gray-400">
            Questions about these terms?{' '}
            <Link to="/help" className="cursor-pointer text-brand-400 hover:text-brand-300">
              Visit our Help Center
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
