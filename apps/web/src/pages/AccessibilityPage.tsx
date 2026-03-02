import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Accessibility, Monitor, Keyboard, Eye, MousePointer } from 'lucide-react';

const features = [
  {
    icon: Monitor,
    title: 'Theme Support',
    description:
      'DevHub supports both dark and light modes. Switch between themes in Settings > Appearance to find the mode that works best for you.',
  },
  {
    icon: Keyboard,
    title: 'Keyboard Navigation',
    description:
      'Core platform features are accessible via keyboard. You can navigate through posts, comments, and community pages using standard keyboard controls.',
  },
  {
    icon: Eye,
    title: 'Readable Typography',
    description:
      'We use clear, legible fonts with appropriate sizing and contrast ratios. Text is responsive and scales with browser zoom settings.',
  },
  {
    icon: MousePointer,
    title: 'Interactive Elements',
    description:
      'All interactive elements like buttons and links have clear visual indicators including hover states, focus rings, and cursor changes.',
  },
];

const commitments = [
  'Maintaining sufficient color contrast ratios across both themes.',
  'Providing clear visual feedback for interactive elements.',
  'Using semantic HTML elements for proper document structure.',
  'Supporting keyboard navigation for core functionality.',
  'Ensuring the platform works with browser zoom up to 200%.',
  'Continuously improving accessibility based on user feedback.',
];

export function AccessibilityPage() {
  return (
    <>
      <Helmet>
        <title>Accessibility - DevHub</title>
      </Helmet>

      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <Accessibility className="h-6 w-6 text-brand-400" />
            <h1 className="text-2xl font-bold text-white">Accessibility</h1>
          </div>
          <p className="text-sm text-gray-400">
            Our commitment to making DevHub accessible to everyone.
          </p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 mb-6">
          <p className="text-sm leading-relaxed text-gray-300">
            We believe that everyone should be able to use DevHub regardless of ability.
            We are committed to making our platform accessible and are continuously working
            to improve the experience for all users.
          </p>
        </div>

        <h2 className="mb-4 text-lg font-bold text-white">Accessibility Features</h2>
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-gray-800 bg-gray-900 p-5"
            >
              <Icon className="mb-3 h-5 w-5 text-brand-400" />
              <h3 className="mb-1 font-semibold text-white">{title}</h3>
              <p className="text-sm text-gray-400">{description}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 mb-8">
          <h2 className="mb-3 font-semibold text-white">Our Commitments</h2>
          <ul className="space-y-2">
            {commitments.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-relaxed text-gray-400">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 text-center">
          <h2 className="mb-2 text-lg font-bold text-white">Feedback</h2>
          <p className="mb-4 text-sm text-gray-400">
            Encountered an accessibility issue? We'd love to hear from you so we can improve.
          </p>
          <Link
            to="/help"
            className="cursor-pointer inline-flex rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
          >
            Visit Help Center
          </Link>
        </div>
      </div>
    </>
  );
}
