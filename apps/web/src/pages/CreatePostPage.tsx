import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FileText, ExternalLink, Code2 } from 'lucide-react';
import { useCreatePost } from '../hooks/usePosts';
import { useCommunity } from '../hooks/useCommunities';
import { MarkdownEditor } from '../components/shared/MarkdownEditor';
import { cn } from '../lib/utils';
import type { CreatePostInput, CommunityFlair } from '@devhub/shared';

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'rust', 'go', 'java',
  'c', 'cpp', 'csharp', 'ruby', 'php', 'swift', 'kotlin',
  'html', 'css', 'sql', 'bash', 'json', 'yaml', 'markdown',
];

type PostTab = 'text' | 'link' | 'code';

export function CreatePostPage() {
  const { communityName } = useParams<{ communityName: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<PostTab>('text');
  const createPost = useCreatePost(communityName!);
  const communityQuery = useCommunity(communityName!);
  const flairs = communityQuery.data?.flairs ?? [];

  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('');
  const [fileName, setFileName] = useState('');
  const [selectedFlair, setSelectedFlair] = useState<CommunityFlair | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (tab === 'text' && !body.trim()) errs.body = 'Body is required';
    if (tab === 'link' && !url.trim()) errs.url = 'URL is required';
    if (tab === 'code') {
      if (!code.trim()) errs.code = 'Code is required';
      if (!language) errs.language = 'Language is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let data: CreatePostInput;
    const flair = selectedFlair || undefined;
    if (tab === 'text') {
      data = { type: 'text', title: title.trim(), body: body.trim(), flair };
    } else if (tab === 'link') {
      data = { type: 'link', title: title.trim(), url: url.trim(), flair };
    } else {
      data = {
        type: 'code',
        title: title.trim(),
        flair,
        codeSnippet: {
          code: code.trim(),
          language,
          ...(fileName.trim() ? { fileName: fileName.trim() } : {}),
        },
      };
    }

    createPost.mutate(data, {
      onSuccess: () => navigate(`/c/${communityName}`),
    });
  };

  const switchTab = (newTab: PostTab) => {
    setTab(newTab);
    setErrors({});
  };

  const tabs: { key: PostTab; label: string; icon: React.ReactNode }[] = [
    { key: 'text', label: 'Text', icon: <FileText className="h-4 w-4" /> },
    { key: 'link', label: 'Link', icon: <ExternalLink className="h-4 w-4" /> },
    { key: 'code', label: 'Code', icon: <Code2 className="h-4 w-4" /> },
  ];

  return (
    <>
      <Helmet>
        <title>Create Post - c/{communityName} - DevHub</title>
      </Helmet>

      <div className="mx-auto max-w-2xl py-4">
        <h1 className="mb-1 text-xl font-bold text-white">Create a Post</h1>
        <p className="mb-6 text-sm text-gray-400">
          Posting to{' '}
          <Link to={`/c/${communityName}`} className="cursor-pointer font-medium text-brand-400 hover:underline">c/{communityName}</Link>
        </p>

        <div className="rounded-xl border border-gray-800 bg-gray-900">
          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => switchTab(t.key)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors',
                  tab === t.key
                    ? 'border-brand-500 text-brand-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300',
                )}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            {/* Title (shared) */}
            <div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-500"
                placeholder="Title"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-400">{errors.title}</p>
              )}
            </div>

            {/* Text tab */}
            {tab === 'text' && (
              <MarkdownEditor
                value={body}
                onChange={setBody}
                placeholder="What's on your mind? (Markdown supported)"
                rows={8}
                error={errors.body}
              />
            )}

            {/* Link tab */}
            {tab === 'link' && (
              <div>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  type="url"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-500"
                  placeholder="https://example.com"
                />
                {errors.url && (
                  <p className="mt-1 text-xs text-red-400">{errors.url}</p>
                )}
              </div>
            )}

            {/* Code tab */}
            {tab === 'code' && (
              <>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-500"
                    >
                      <option value="">Select language</option>
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                    {errors.language && (
                      <p className="mt-1 text-xs text-red-400">{errors.language}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-500"
                      placeholder="filename.ts (optional)"
                    />
                  </div>
                </div>
                <div>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    rows={10}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 font-mono text-sm text-white placeholder-gray-500 outline-none focus:border-brand-500"
                    placeholder="Paste your code here..."
                    spellCheck={false}
                  />
                  {errors.code && (
                    <p className="mt-1 text-xs text-red-400">{errors.code}</p>
                  )}
                </div>
              </>
            )}

            {/* Flair selector */}
            {flairs.length > 0 && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">Post Flair</label>
                <div className="flex flex-wrap gap-2">
                  {flairs.map((f: CommunityFlair) => (
                    <button
                      key={f.name}
                      type="button"
                      onClick={() => setSelectedFlair(selectedFlair?.name === f.name ? null : f)}
                      className={cn(
                        'cursor-pointer rounded-full px-3 py-1 text-xs font-medium text-white transition-opacity',
                        selectedFlair?.name === f.name ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : 'opacity-70 hover:opacity-100',
                      )}
                      style={{ backgroundColor: f.color }}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-full border border-gray-700 px-5 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createPost.isPending}
                className="rounded-full bg-brand-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-50"
              >
                {createPost.isPending ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
