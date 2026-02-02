'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarLayout } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  MessageSquare,
  CheckCircle2,
  ListTodo,
  Trash2,
  Edit3,
  Clock,
  Brain
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from '@/lib/utils';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatResponse {
  conversation_id: number;
  response: string;
  tool_calls: string[];
}

const SUGGESTED_PROMPTS = [
  { icon: ListTodo, text: "Show me all my tasks", color: "from-blue-500 to-cyan-500" },
  { icon: CheckCircle2, text: "What tasks are pending?", color: "from-green-500 to-emerald-500" },
  { icon: Zap, text: "Add a task to buy groceries", color: "from-orange-500 to-amber-500" },
  { icon: Clock, text: "Add task: Call mom tomorrow", color: "from-purple-500 to-pink-500" },
];

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | undefined>(undefined);
  const { user, loading } = useAuth();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user) {
      loadConversation();
    }
  }, [user, loading]);

  const loadConversation = async () => {
    try {
      setMessages([]);
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Failed to load conversation');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(inputValue);
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading || !user) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response: ChatResponse = await api.chat.sendMessage(
        user.id,
        message,
        conversationId
      );

      if (conversationId === undefined) {
        setConversationId(response.conversation_id);
      }

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.response,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (response.tool_calls.length > 0) {
        toast.success(`Action completed: ${response.tool_calls.join(', ')}`, {
          icon: <Zap className="w-4 h-4" />,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestionClick = (text: string) => {
    sendMessage(text);
  };

  if (loading || !user) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="flex items-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading AI Assistant...</span>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="h-[calc(100vh-56px)] lg:h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                AI Task Agent
                <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-white">
                  GPT-4
                </span>
              </h1>
              <p className="text-sm text-slate-400">Powered by OpenAI • MCP Protocol</p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-full text-center max-w-2xl mx-auto py-4">
                {/* Hero Icon */}
                <div className="relative mb-4 sm:mb-8">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <Bot className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg animate-bounce">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                </div>

                <h2 className="text-xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">
                  What can I help you with?
                </h2>
                <p className="text-slate-400 text-sm sm:text-lg mb-4 sm:mb-8 px-4">
                  I can manage your tasks using natural language. Just tell me what you need!
                </p>

                {/* Capabilities */}
                <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-8 w-full px-2">
                  <div className="flex flex-col items-center p-2 sm:p-4 rounded-lg sm:rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <ListTodo className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400 mb-1 sm:mb-2" />
                    <span className="text-[10px] sm:text-xs text-slate-400">List</span>
                  </div>
                  <div className="flex flex-col items-center p-2 sm:p-4 rounded-lg sm:rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 mb-1 sm:mb-2" />
                    <span className="text-[10px] sm:text-xs text-slate-400">Add</span>
                  </div>
                  <div className="flex flex-col items-center p-2 sm:p-4 rounded-lg sm:rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 mb-1 sm:mb-2" />
                    <span className="text-[10px] sm:text-xs text-slate-400">Done</span>
                  </div>
                  <div className="flex flex-col items-center p-2 sm:p-4 rounded-lg sm:rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 mb-1 sm:mb-2" />
                    <span className="text-[10px] sm:text-xs text-slate-400">Delete</span>
                  </div>
                </div>

                {/* Suggested Prompts */}
                <div className="w-full space-y-2 sm:space-y-3 px-2">
                  <p className="text-xs sm:text-sm text-slate-500 mb-2 sm:mb-3">Try these examples:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {SUGGESTED_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(prompt.text)}
                        className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-800 transition-all duration-200 text-left group"
                      >
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${prompt.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <prompt.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <span className="text-slate-300 text-xs sm:text-sm">{prompt.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 max-w-3xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}

                    <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
                      <div
                        className={`rounded-2xl px-5 py-4 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'bg-slate-800/80 border border-slate-700/50 text-slate-200 shadow-lg'
                        }`}
                      >
                        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                          {message.content}
                        </div>
                      </div>
                      <div className={`text-xs text-slate-500 mt-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {formatDistanceToNow(message.created_at)}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-4 justify-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="h-2 w-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="h-2 w-2 bg-pink-500 rounded-full animate-bounce"></div>
                        </div>
                        <span className="text-sm text-slate-400 ml-2">Processing...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 border-t border-slate-700/50 bg-slate-900/90 backdrop-blur-sm p-3 sm:p-4">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
              <div className="flex gap-2 sm:gap-3">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type a message... (e.g., 'Add a task to review the report')"
                    disabled={isLoading}
                    className="w-full py-3 sm:py-4 px-4 sm:px-5 pr-10 sm:pr-12 rounded-xl border-2 border-slate-700 focus:border-indigo-500 bg-slate-800/80 text-white placeholder:text-slate-500 shadow-lg transition-all duration-200 text-sm sm:text-base"
                  />
                  <MessageSquare className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 text-white font-medium disabled:opacity-50 disabled:shadow-none"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
              <p className="text-center text-xs text-slate-500 mt-2 sm:mt-3">
                AI can make mistakes. Verify important task details.
              </p>
            </form>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
