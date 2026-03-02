import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Code2, Users, MessageSquare, Zap, Heart, Github } from 'lucide-react';

export function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About - DevHub</title>
      </Helmet>

      <div className="mx-auto max-w-3xl">
        <div className="mb-8 rounded-xl border border-gray-800 bg-gray-900 p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-800">
              <Code2 className="h-6 w-6 text-brand-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">About DevHub</h1>
              <p className="text-sm text-gray-400">A community built for developers, by developers</p>
            </div>
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-gray-300">
            <p>
              DevHub is an open-source social platform designed specifically for developers.
              It provides a space to share knowledge, discuss technologies, showcase projects,
              and connect with fellow developers from around the world.
            </p>
            <p>
              Whether you're a beginner just starting your coding journey or a seasoned
              engineer with decades of experience, DevHub welcomes you. Our goal is to
              foster a supportive and inclusive environment where everyone can learn and grow.
            </p>
          </div>
        </div>

        <h2 className="mb-4 text-lg font-bold text-white">What makes DevHub special</h2>
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: Users,
              title: 'Developer Communities',
              description: 'Join or create communities around languages, frameworks, tools, and topics you care about.',
            },
            {
              icon: MessageSquare,
              title: 'Threaded Discussions',
              description: 'Engage in meaningful conversations with nested comment threads and real-time voting.',
            },
            {
              icon: Zap,
              title: 'Built with Modern Tech',
              description: 'React, TypeScript, Node.js, MongoDB — DevHub is built with the tools developers love.',
            },
            {
              icon: Heart,
              title: 'Open Source',
              description: 'DevHub is fully open source. Contribute, fork, or use it as a learning resource.',
            },
          ].map(({ icon: Icon, title, description }) => (
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

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 text-center">
          <h2 className="mb-2 text-lg font-bold text-white">Want to contribute?</h2>
          <p className="mb-4 text-sm text-gray-400">
            DevHub is open source and we welcome contributions of all kinds.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <Link
              to="/explore"
              className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
            >
              Explore Communities
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
