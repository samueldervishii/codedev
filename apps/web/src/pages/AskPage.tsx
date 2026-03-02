import { Helmet } from 'react-helmet-async';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, Loader2, ArrowLeft, Code2, Sparkles, MessageSquare, Trash2, Plus } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { streamChat, conversationsApi } from '../api/chat.api';
import { MarkdownPreview } from '../components/shared/MarkdownPreview';
import toast from 'react-hot-toast';
import type { ChatMessage, ConversationSummary } from '@devhub/shared';

const suggestedQuestions = [
  { icon: '🚀', text: 'How do React Server Components work?' },
  { icon: '🔧', text: 'Best practices for REST API design' },
  { icon: '🐛', text: 'How to debug memory leaks in Node.js' },
  { icon: '📦', text: 'When to use SQL vs NoSQL databases' },
  { icon: '⚡', text: 'How to optimize React app performance' },
  { icon: '🔒', text: 'Best practices for JWT authentication' },
  { icon: '🧪', text: 'How to write good unit tests' },
  { icon: '🐳', text: 'Docker basics for web developers' },
  { icon: '🌐', text: 'TypeScript vs JavaScript: when to use which' },
];

export function AskPage() {
  const { conversationId: urlConversationId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [conversationId, setConversationId] = useState<string>(() =>
    urlConversationId || crypto.randomUUID(),
  );
  const [history, setHistory] = useState<ConversationSummary[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  const hasConversation = messages.length > 0;

  // Load conversation history list
  const loadHistory = useCallback(async () => {
    try {
      const res = await conversationsApi.list({ limit: 30 });
      setHistory(res.data.data);
    } catch {
      // Silently fail
    }
  }, []);

  // Load a specific conversation
  const loadConversation = useCallback(async (convId: string) => {
    setLoadingHistory(true);
    try {
      const res = await conversationsApi.get(convId);
      const conv = res.data.data;
      setMessages(conv.messages.map((m: any) => ({ role: m.role, content: m.content })));
      setConversationId(convId);
      setShowHistory(false);
    } catch {
      toast.error('Failed to load conversation');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // On mount: load history, and if URL has a conversationId, load that conversation
  useEffect(() => {
    loadHistory();
    if (urlConversationId) {
      loadConversation(urlConversationId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!hasConversation && !urlConversationId) inputRef.current?.focus();
  }, [hasConversation, urlConversationId]);

  useEffect(() => {
    if (streamedContent) {
      responseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [streamedContent]);

  const handleSend = async (text?: string) => {
    const question = (text || input).trim();
    if (!question || isStreaming) return;

    const userMessage: ChatMessage = { role: 'user', content: question };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);
    setStreamedContent('');

    // Update URL to include conversationId if not already there
    if (!urlConversationId) {
      navigate(`/ask/${conversationId}`, { replace: true });
    }

    try {
      let fullContent = '';
      for await (const chunk of streamChat(newMessages, conversationId)) {
        fullContent += chunk;
        setStreamedContent(fullContent);
      }
      setMessages([...newMessages, { role: 'assistant', content: fullContent }]);
      setStreamedContent('');
      // Refresh history after new message
      loadHistory();
    } catch {
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    const newId = crypto.randomUUID();
    setMessages([]);
    setStreamedContent('');
    setInput('');
    setConversationId(newId);
    navigate('/ask', { replace: true });
  };

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await conversationsApi.delete(convId);
      setHistory((prev) => prev.filter((c) => c.conversationId !== convId));
      if (convId === conversationId) {
        handleNewChat();
      }
    } catch {
      toast.error('Failed to delete conversation');
    }
  };

  const handleSelectConversation = (convId: string) => {
    navigate(`/ask/${convId}`, { replace: true });
    loadConversation(convId);
  };

  // Landing view — no conversation yet
  if (!hasConversation && !isStreaming && !loadingHistory) {
    return (
      <>
        <Helmet>
          <title>Ask AI - DevHub</title>
        </Helmet>

        <div className="mx-auto flex max-w-2xl flex-col items-center pt-12">
          {/* Branding */}
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-brand-600">
            <Code2 className="h-9 w-9 text-white" />
          </div>
          <h1 className="mb-1 text-3xl font-extrabold text-white">
            dev<span className="text-brand-400">hub</span> answers
          </h1>
          <p className="mb-8 text-sm text-gray-400">AI-powered answers for developers</p>

          {/* Question input */}
          <div className="relative w-full">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question"
              rows={3}
              className="w-full resize-none rounded-2xl border border-gray-700 bg-gray-900 px-5 py-4 pr-14 text-sm text-gray-200 placeholder-gray-500 outline-none transition-colors hover:border-gray-600 focus:border-brand-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="absolute bottom-4 right-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          {/* Suggested questions */}
          <div className="mt-8 w-full">
            <p className="mb-3 text-sm font-semibold text-white">Recommended</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {suggestedQuestions.map((q) => (
                <button
                  key={q.text}
                  onClick={() => handleSend(q.text)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-left text-sm text-gray-300 transition-colors hover:border-gray-700 hover:bg-gray-800"
                >
                  <span className="text-base">{q.icon}</span>
                  <span className="line-clamp-2">{q.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent conversations */}
          {history.length > 0 && (
            <div className="mt-10 w-full">
              <p className="mb-3 text-sm font-semibold text-white">Recent conversations</p>
              <div className="space-y-1.5">
                {history.slice(0, 5).map((conv) => (
                  <button
                    key={conv.conversationId}
                    onClick={() => handleSelectConversation(conv.conversationId)}
                    className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-left text-sm text-gray-300 transition-colors hover:border-gray-700 hover:bg-gray-800"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 text-gray-500" />
                    <span className="min-w-0 flex-1 truncate">{conv.title}</span>
                    <span className="shrink-0 text-xs text-gray-600">{new Date(conv.updatedAt).toLocaleDateString()}</span>
                    <button
                      onClick={(e) => handleDeleteConversation(conv.conversationId, e)}
                      className="shrink-0 cursor-pointer text-gray-600 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </button>
                ))}
                {history.length > 5 && (
                  <button
                    onClick={() => setShowHistory(true)}
                    className="cursor-pointer text-sm text-brand-400 transition-colors hover:text-brand-300"
                  >
                    View all ({history.length})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Full history modal */}
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowHistory(false)}>
            <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-700 bg-gray-900 p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="mb-4 text-lg font-bold text-white">Conversation History</h2>
              <div className="space-y-1.5">
                {history.map((conv) => (
                  <button
                    key={conv.conversationId}
                    onClick={() => handleSelectConversation(conv.conversationId)}
                    className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-gray-800 px-4 py-3 text-left text-sm text-gray-300 transition-colors hover:border-gray-700 hover:bg-gray-800"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 text-gray-500" />
                    <span className="min-w-0 flex-1 truncate">{conv.title}</span>
                    <span className="shrink-0 text-xs text-gray-600">{new Date(conv.updatedAt).toLocaleDateString()}</span>
                    <button
                      onClick={(e) => handleDeleteConversation(conv.conversationId, e)}
                      className="shrink-0 cursor-pointer text-gray-600 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Loading state
  if (loadingHistory) {
    return (
      <div className="flex items-center justify-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  // Conversation view
  return (
    <>
      <Helmet>
        <title>Ask AI - DevHub</title>
      </Helmet>

      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleNewChat}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-400 transition-colors hover:border-gray-600 hover:text-gray-200"
          >
            <Plus className="h-4 w-4" />
            New
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Sparkles className="h-3.5 w-3.5" />
          Powered by Claude
        </div>
      </div>

      {/* Message history */}
      <div className="space-y-6">
        {messages.map((msg, i) => (
          <div key={i}>
            {msg.role === 'user' ? (
              <div className="mb-4">
                <p className="mb-1 text-xs font-medium text-gray-500">You</p>
                <p className="text-base font-medium text-white">{msg.content}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-800">
                    <Bot className="h-3.5 w-3.5 text-brand-300" />
                  </div>
                  <span className="text-xs font-medium text-gray-400">DevHub AI</span>
                </div>
                <MarkdownPreview content={msg.content} />
              </div>
            )}
          </div>
        ))}

        {/* Streaming response */}
        {isStreaming && (
          <div ref={responseRef}>
            <div className="mb-4">
              <p className="mb-1 text-xs font-medium text-gray-500">You</p>
              <p className="text-base font-medium text-white">
                {messages[messages.length - 1]?.content}
              </p>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-800">
                  <Bot className="h-3.5 w-3.5 text-brand-300" />
                </div>
                <span className="text-xs font-medium text-gray-400">DevHub AI</span>
              </div>
              {streamedContent ? (
                <MarkdownPreview content={streamedContent} />
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Follow-up input */}
      {!isStreaming && messages.length > 0 && (
        <div className="mt-6">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a follow-up..."
              rows={2}
              className="w-full resize-none rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 pr-14 text-sm text-gray-200 placeholder-gray-500 outline-none transition-colors hover:border-gray-600 focus:border-brand-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="absolute bottom-3 right-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
