import { useState, useRef } from 'react';
import { Eye, PencilLine } from 'lucide-react';
import { MarkdownToolbar } from './MarkdownToolbar';
import { MarkdownPreview } from './MarkdownPreview';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  error?: string;
}

export function MarkdownEditor({ value, onChange, placeholder, rows = 8, error }: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsert = (newValue: string, cursorPos: number) => {
    onChange(newValue);
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = cursorPos;
        textareaRef.current.selectionEnd = cursorPos;
      }
    });
  };

  return (
    <div>
      {/* Toolbar row */}
      <div className="flex items-center justify-between rounded-t-lg border border-b-0 border-gray-700 bg-gray-800/50 px-2 py-1.5">
        <div className="flex flex-wrap gap-0.5">
          {!showPreview && (
            <MarkdownToolbar textareaRef={textareaRef} onInsert={handleInsert} />
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-700 hover:text-gray-200"
        >
          {showPreview ? <PencilLine className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Editor or Preview */}
      {showPreview ? (
        <div className="min-h-[200px] rounded-b-lg border border-gray-700 bg-gray-800 p-3">
          {value.trim() ? (
            <MarkdownPreview content={value} />
          ) : (
            <p className="text-sm text-gray-500">Nothing to preview</p>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="w-full rounded-b-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-500"
          placeholder={placeholder || 'Write using markdown...'}
        />
      )}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
