import { Bold, Italic, Heading2, Link, Code, Braces, List, ListOrdered, Quote } from 'lucide-react';

interface ToolbarAction {
  icon: React.ReactNode;
  label: string;
  prefix: string;
  suffix: string;
}

const actions: ToolbarAction[] = [
  { icon: <Bold className="h-4 w-4" />, label: 'Bold', prefix: '**', suffix: '**' },
  { icon: <Italic className="h-4 w-4" />, label: 'Italic', prefix: '_', suffix: '_' },
  { icon: <Heading2 className="h-4 w-4" />, label: 'Heading', prefix: '## ', suffix: '' },
  { icon: <Link className="h-4 w-4" />, label: 'Link', prefix: '[', suffix: '](url)' },
  { icon: <Code className="h-4 w-4" />, label: 'Inline code', prefix: '`', suffix: '`' },
  { icon: <Braces className="h-4 w-4" />, label: 'Code block', prefix: '```\n', suffix: '\n```' },
  { icon: <List className="h-4 w-4" />, label: 'Bullet list', prefix: '- ', suffix: '' },
  { icon: <ListOrdered className="h-4 w-4" />, label: 'Numbered list', prefix: '1. ', suffix: '' },
  { icon: <Quote className="h-4 w-4" />, label: 'Blockquote', prefix: '> ', suffix: '' },
];

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onInsert: (newValue: string, cursorPos: number) => void;
}

export function MarkdownToolbar({ textareaRef, onInsert }: MarkdownToolbarProps) {
  const handleAction = (action: ToolbarAction) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const before = text.substring(0, start);
    const after = text.substring(end);
    const placeholder = selected || 'text';
    const wrapped = `${action.prefix}${placeholder}${action.suffix}`;
    const newValue = `${before}${wrapped}${after}`;
    const cursorPos = start + action.prefix.length + placeholder.length;

    onInsert(newValue, cursorPos);
  };

  return (
    <>
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={() => handleAction(action)}
          title={action.label}
          className="cursor-pointer rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-700 hover:text-gray-200"
        >
          {action.icon}
        </button>
      ))}
    </>
  );
}
