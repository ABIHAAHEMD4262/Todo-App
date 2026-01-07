'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarLayout } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Sparkles } from 'lucide-react';
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

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | undefined>(undefined);
  const { user, loading } = useAuth();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

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
    if (!inputValue.trim() || isLoading || !user) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: inputValue,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response: ChatResponse = await api.chat.sendMessage(
        user.id,
        inputValue,
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
        toast.info(`Used tools: ${response.tool_calls.join(', ')}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-slate-600">Loading...</div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <main className="p-6 lg:p-8 h-screen flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-violet-600" />
            AI Task Assistant
          </h1>
          <p className="text-slate-600 text-lg">
            Chat with AI to manage your tasks using natural language
          </p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-violet-500/30 transform transition-transform hover:scale-105">
                  <Bot className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-4">How can I help you today?</h3>
                <p className="text-slate-600 max-w-md mb-10 text-lg">
                  Start a conversation by asking me to manage your tasks. For example:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base max-w-4xl mx-auto">
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-5 text-left border border-violet-200 shadow-sm hover:shadow-md transition-shadow">
                    <span className="font-semibold text-violet-800">"Add a task to buy groceries"</span>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-5 text-left border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                    <span className="font-semibold text-purple-800">"Show me my pending tasks"</span>
                  </div>
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-5 text-left border border-indigo-200 shadow-sm hover:shadow-md transition-shadow">
                    <span className="font-semibold text-indigo-800">"Mark task 3 as complete"</span>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-5 text-left border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                    <span className="font-semibold text-blue-800">"Delete the meeting task"</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full shadow-lg shadow-violet-500/20">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                    )}

                    <div className={`max-w-[75%] ${message.role === 'user' ? 'order-1' : ''}`}>
                      <div
                        className={`rounded-2xl px-5 py-4 shadow-sm ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-lg shadow-violet-500/20'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-lg shadow-slate-200/20'
                        }`}
                      >
                        <div className="whitespace-pre-wrap break-words text-base leading-relaxed">{message.content}</div>
                      </div>
                      <div className={`text-xs text-slate-500 mt-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {formatDistanceToNow(message.created_at)}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full shadow-lg shadow-slate-500/20">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4 justify-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full shadow-lg shadow-violet-500/20">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl px-5 py-4 rounded-bl-lg shadow-slate-200/20">
                      <div className="flex space-x-2">
                        <div className="h-3 w-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full animate-bounce"></div>
                        <div className="h-3 w-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-bounce delay-75"></div>
                        <div className="h-3 w-3 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full animate-bounce delay-150"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200/50 bg-white/60 p-6">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message here... (e.g., 'Add a task to buy groceries')"
                  disabled={isLoading}
                  className="py-4 px-6 pr-16 rounded-2xl border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 bg-white/90 backdrop-blur-sm text-slate-900 placeholder:text-slate-500 shadow-sm transition-all duration-200"
                />
                <Send className="absolute right-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="py-4 px-6 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 text-white font-medium"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </main>
    </SidebarLayout>
  );
}
