import { Helmet } from 'react-helmet-async';
import { Shield } from 'lucide-react';

const sections = [
  {
    title: 'Information We Collect',
    content: [
      'Account information: When you create an account, we collect your username, email address, and password (stored securely using bcrypt hashing).',
      'Profile information: You may optionally provide a display name, bio, and avatar URL.',
      'Content: Posts, comments, and votes you create on the platform.',
      'Usage data: We collect basic usage information such as pages visited and actions taken to improve the platform experience.',
    ],
  },
  {
    title: 'How We Use Your Information',
    content: [
      'To provide and maintain the DevHub platform and its features.',
      'To authenticate your identity and manage your account.',
      'To display your content (posts, comments) to other users.',
      'To personalize your experience, such as showing your joined communities.',
      'To improve the platform based on aggregate usage patterns.',
    ],
  },
  {
    title: 'Information Sharing',
    content: [
      'Your public profile, posts, and comments are visible to all DevHub users.',
      'We do not sell your personal information to third parties.',
      'We may share information if required by law or to protect the safety of our users.',
      'Aggregated, anonymized data may be used for analytics and platform improvements.',
    ],
  },
  {
    title: 'Data Security',
    content: [
      'Passwords are hashed using bcrypt and never stored in plain text.',
      'Authentication uses JWT tokens with secure HttpOnly cookies for refresh tokens.',
      'We implement industry-standard security measures to protect your data.',
      'While we strive to protect your information, no method of transmission over the Internet is 100% secure.',
    ],
  },
  {
    title: 'Your Rights',
    content: [
      'You can update your profile information at any time through the Settings page.',
      'You can change your password from the Settings page.',
      'You can delete your posts and comments.',
      'You may request deletion of your account by contacting us.',
    ],
  },
  {
    title: 'Cookies',
    content: [
      'We use HttpOnly cookies to store refresh tokens for secure authentication.',
      'Local storage is used to save your theme preference (dark/light mode).',
      'We do not use third-party tracking cookies.',
    ],
  },
  {
    title: 'Changes to This Policy',
    content: [
      'We may update this Privacy Policy from time to time.',
      'Changes will be posted on this page with an updated effective date.',
      'Continued use of DevHub after changes constitutes acceptance of the updated policy.',
    ],
  },
];

export function PrivacyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - DevHub</title>
      </Helmet>

      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <Shield className="h-6 w-6 text-brand-400" />
            <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
          </div>
          <p className="text-sm text-gray-400">
            Last updated: March 2026
          </p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 mb-6">
          <p className="text-sm leading-relaxed text-gray-300">
            At DevHub, we take your privacy seriously. This Privacy Policy explains how we collect,
            use, and protect your personal information when you use our platform.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section, i) => (
            <div key={section.title} className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <h2 className="mb-3 font-semibold text-white">
                {i + 1}. {section.title}
              </h2>
              <ul className="space-y-2">
                {section.content.map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-relaxed text-gray-400">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
