import { useState } from 'react';

interface CommentFormProps {
  onSubmit: (body: string) => void;
  isPending?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
}

export function CommentForm({ onSubmit, isPending, placeholder, autoFocus, onCancel }: CommentFormProps) {
  const [body, setBody] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    onSubmit(body.trim());
    setBody('');
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        autoFocus={autoFocus}
        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-500"
        placeholder={placeholder || 'Write a comment...'}
      />
      <div className="mt-2 flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-full px-4 py-1.5 text-sm text-gray-400 transition-colors hover:bg-gray-800"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isPending || !body.trim()}
          className="cursor-pointer rounded-full bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Posting...' : 'Comment'}
        </button>
      </div>
    </form>
  );
}
