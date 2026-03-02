import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  return (
    <div className={`prose prose-sm max-w-none prose-p:my-1 prose-p:text-gray-200 prose-headings:my-2 prose-headings:text-white prose-strong:text-white prose-li:text-gray-200 prose-blockquote:text-gray-300 prose-code:text-brand-300 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          code({ className: codeClassName, children, ...props }) {
            const match = /language-(\w+)/.exec(codeClassName || '');
            const isInline = !match;
            if (!isInline && match) {
              return (
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  customStyle={{
                    margin: 0,
                    borderRadius: '0.5rem',
                    fontSize: '0.8125rem',
                  }}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              );
            }
            return (
              <code className="rounded bg-gray-800 px-1.5 py-0.5 text-sm text-brand-300" {...props}>
                {children}
              </code>
            );
          },
          a: ({ children, ...props }) => (
            <a className="text-brand-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          ),
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto">
              <table className="border-collapse border border-gray-700" {...props}>{children}</table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th className="border border-gray-700 bg-gray-800 px-3 py-1.5 text-left text-sm" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="border border-gray-700 px-3 py-1.5 text-sm" {...props}>{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
