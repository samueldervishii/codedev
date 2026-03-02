import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { HelpCircle, UserPlus, MessagesSquare, Vote, Shield, Settings, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

interface FaqItem {
  question: string;
  answer: string;
}

const faqSections: { title: string; items: FaqItem[] }[] = [
  {
    title: 'Getting Started',
    items: [
      {
        question: 'How do I create an account?',
        answer:
          'Click the "Sign Up" button in the header. You\'ll need to provide a username, email, and password. Once registered, you can immediately start participating in communities.',
      },
      {
        question: 'How do I join a community?',
        answer:
          'Visit any community page and click the "Join" button. You can browse all communities on the Explore page. Joined communities will appear in your sidebar for quick access.',
      },
      {
        question: 'How do I create a post?',
        answer:
          'Navigate to any community you\'ve joined and click "Create Post". You can write text posts with a title and body. Posts support markdown formatting.',
      },
    ],
  },
  {
    title: 'Communities',
    items: [
      {
        question: 'How do I create a community?',
        answer:
          'Click "Create Community" in the sidebar or navigate to /create-community. You\'ll need to provide a unique name, display name, description, and optional tags. Community names cannot be changed after creation.',
      },
      {
        question: 'What are community rules?',
        answer:
          'Each community can define its own rules that members are expected to follow. Rules help maintain the quality of discussions and ensure a positive experience for everyone.',
      },
    ],
  },
  {
    title: 'Voting & Comments',
    items: [
      {
        question: 'How does voting work?',
        answer:
          'You can upvote or downvote posts and comments. Upvoting content you find helpful or interesting raises its visibility. Each user gets one vote per item — clicking the same vote button again removes your vote.',
      },
      {
        question: 'How do comment threads work?',
        answer:
          'Comments support nested replies, creating threaded discussions. You can reply to any comment to continue the conversation. Threads can be collapsed for easier reading.',
      },
    ],
  },
  {
    title: 'Account & Settings',
    items: [
      {
        question: 'How do I change my profile settings?',
        answer:
          'Go to Settings (click your avatar in the header). You can update your display name, bio, avatar URL, and more under the Profile tab.',
      },
      {
        question: 'How do I switch between dark and light mode?',
        answer:
          'Go to Settings > Appearance tab. You can toggle between dark and light themes. Your preference is saved locally and persists across sessions.',
      },
      {
        question: 'How do I change my password?',
        answer:
          'Go to Settings > Password tab. You\'ll need to enter your current password along with your new password to make the change.',
      },
    ],
  },
];

const iconMap: Record<string, typeof HelpCircle> = {
  'Getting Started': UserPlus,
  'Communities': MessagesSquare,
  'Voting & Comments': Vote,
  'Account & Settings': Settings,
};

export function HelpPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (key: string) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <>
      <Helmet>
        <title>Help Center - DevHub</title>
      </Helmet>

      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <HelpCircle className="h-6 w-6 text-brand-400" />
            <h1 className="text-2xl font-bold text-white">Help Center</h1>
          </div>
          <p className="text-sm text-gray-400">
            Find answers to common questions about using DevHub.
          </p>
        </div>

        <div className="space-y-6">
          {faqSections.map((section) => {
            const Icon = iconMap[section.title] || HelpCircle;
            return (
              <div key={section.title} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Icon className="h-5 w-5 text-brand-400" />
                  <h2 className="font-semibold text-white">{section.title}</h2>
                </div>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const key = `${section.title}-${item.question}`;
                    const isOpen = openIndex === key;
                    return (
                      <div key={key} className="border-b border-gray-800 last:border-0">
                        <button
                          onClick={() => toggle(key)}
                          className="cursor-pointer flex w-full items-center justify-between py-3 text-left text-sm text-gray-200 transition-colors hover:text-white"
                        >
                          {item.question}
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 shrink-0 text-gray-500 transition-transform',
                              isOpen && 'rotate-180',
                            )}
                          />
                        </button>
                        {isOpen && (
                          <p className="pb-3 text-sm leading-relaxed text-gray-400">
                            {item.answer}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-xl border border-gray-800 bg-gray-900 p-6 text-center">
          <h2 className="mb-2 text-lg font-bold text-white">Still need help?</h2>
          <p className="mb-4 text-sm text-gray-400">
            Can't find what you're looking for? Check out our community or reach out.
          </p>
          <Link
            to="/explore"
            className="cursor-pointer inline-flex rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
          >
            Browse Communities
          </Link>
        </div>
      </div>
    </>
  );
}
