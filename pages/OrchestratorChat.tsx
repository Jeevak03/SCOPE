import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Layers, ArrowRight, Zap, CheckCircle2, Loader2, BarChart2, AlertTriangle, Play, ShieldCheck, Truck, Factory, ThumbsUp, ThumbsDown, Plus, Sparkles, RotateCcw, ChevronDown, ChevronRight, BrainCircuit, Search, Database } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChatMessage, AgentType, OrchestrationStep } from '../types';
import { useAuth } from '../contexts/AuthContext';

const OrchestratorChat: React.FC = () => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (messages.length === 0 && user) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: `Hello ${user.name}. I am your Supply Chain Orchestrator.\n\nI'm connected to your **${user.role}** context. I can orchestrate tasks across Planning, Procurement, Logistics, and Manufacturing agents.\n\nHow can I help you today?`,
          timestamp: new Date(),
          agent: AgentType.ORCHESTRATOR,
          relatedQueries: [
            "Check status of shipment SHP-1092",
            "Any inventory anomalies for SKU-001?", 
            "Run a full system compliance scan"
          ]
        }
      ]);
    }
  }, [user, messages.length]);

  useEffect(() => {
    if (location.state && location.state.query) {
      const query = location.state.query;
      navigate(location.pathname, { replace: true, state: {} });
      handleSend(null, query);
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const handleSend = async (e: React.FormEvent | null, forcedInput?: string) => {
    if (e) e.preventDefault();
    const textToSend = forcedInput || input;
    if (!textToSend.trim() || isProcessing) return;

    setInput('');
    setIsProcessing(true);

    const timestamp = new Date();
    
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp
    };

    // Construct memory buffer (last 5 messages excluding reasoning blocks)
    const historyPayload = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-5)
        .map(m => ({ role: m.role, content: m.content }));

    setMessages(prev => [...prev, userMsg]);

    const stepMsgId = `sys-${Date.now()}`;
    const systemMsg: ChatMessage = {
      id: stepMsgId,
      role: 'system',
      content: '',
      timestamp,
      steps: [],
      thoughtProcessExpanded: true
    };
    setMessages(prev => [...prev, systemMsg]);

    const responseId = `bot-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: responseId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      agent: AgentType.ORCHESTRATOR
    }]);

    try {
        const response = await fetch('http://localhost:3001/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: textToSend,
                context: {
                    userName: user?.name,
                    userRole: user?.role
                },
                history: historyPayload
            })
        });

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;

            if (value) {
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6);
                        if (dataStr === '[DONE]') break;

                        try {
                            const data = JSON.parse(dataStr);

                            if (data.error) {
                                setMessages(prev => prev.map(m => m.id === responseId ? { ...m, content: m.content + `\n\n[Error: ${data.error}]` } : m));
                                continue;
                            }

                            if (data.steps) {
                                setMessages(prev => prev.map(m => m.id === stepMsgId ? { ...m, steps: data.steps } : m));
                            }

                            if (data.targetAgent) {
                                setMessages(prev => prev.map(m => m.id === responseId ? { ...m, agent: data.targetAgent as AgentType } : m));
                            }

                            if (data.confidence) {
                                setMessages(prev => prev.map(m => m.id === responseId ? { ...m, confidence: data.confidence } : m));
                            }

                            if (data.content) {
                                setMessages(prev => prev.map(m => m.id === responseId ? { ...m, content: m.content + data.content } : m));
                            }

                            if (data.anomalies) {
                                setMessages(prev => prev.map(m => m.id === responseId ? { ...m, anomalies: data.anomalies } : m));
                            }

                        } catch (e) {
                            console.warn("Failed to parse SSE line", line);
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error("Stream error:", error);
    } finally {
        setIsProcessing(false);
        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === stepMsgId ? { ...m, thoughtProcessExpanded: false } : m));
        }, 1500);
    }
  };

  const toggleThoughts = (id: string) => {
      setMessages(prev => prev.map(msg => {
          if (msg.id === id) return { ...msg, thoughtProcessExpanded: !msg.thoughtProcessExpanded };
          return msg;
      }));
  };

  return (
    <div className="flex flex-col h-full bg-[#15151a] rounded-xl shadow-lg border border-[#27272a] overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-[#27272a] bg-[#1a1a20] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-500/10 rounded-lg">
            <Zap size={20} className="text-[#ffe600]" />
          </div>
          <div>
            <h2 className="font-bold text-white">Intelligent Orchestrator</h2>
            <p className="text-xs text-gray-400">GenAI • Multi-Agent System</p>
          </div>
        </div>
        <div className="flex space-x-2">
            <button 
                onClick={() => handleSend(null, "Run System Wide Anomaly Scan")}
                className="flex items-center space-x-2 text-xs bg-[#27272a] text-gray-300 px-3 py-1.5 rounded border border-[#3f3f46] hover:bg-[#3f3f46] transition-colors"
            >
            <Play size={10} className="fill-current" />
            <span>Run System Scan</span>
            </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#101014]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-[#3f3f46]' : 
                msg.role === 'system' ? 'bg-[#15151a] border border-[#27272a]' : 
                'bg-[#ffe600]'
              }`}>
                {msg.role === 'user' ? <User size={14} className="text-white" /> : 
                 msg.role === 'system' ? <BrainCircuit size={14} className="text-purple-400" /> :
                 <Bot size={14} className="text-black" />}
              </div>

              <div className={`rounded-xl p-4 shadow-sm ${
                 msg.role === 'user' ? 'bg-[#27272a] text-white' : 
                 msg.role === 'system' ? 'w-full min-w-[300px] border border-[#3f3f46]/50 bg-[#15151a]/50' :
                 'bg-[#1e1e24] border border-[#27272a] text-gray-200'
              }`}>
                
                {msg.role === 'system' && msg.steps && msg.steps.length > 0 ? (
                   <div>
                      <button 
                        onClick={() => toggleThoughts(msg.id)}
                        className="flex items-center space-x-2 w-full text-left mb-2 group"
                      >
                         <div className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                            {msg.steps.some(s => s.status === 'processing') ? (
                                <span className="flex items-center text-purple-400">
                                    <Loader2 size={12} className="animate-spin mr-2" />
                                    Orchestrating...
                                </span>
                            ) : (
                                <span className="flex items-center text-green-400">
                                    <CheckCircle2 size={12} className="mr-2" />
                                    Processed
                                </span>
                            )}
                         </div>
                         <div className="ml-auto text-gray-600 group-hover:text-white transition-colors">
                            {msg.thoughtProcessExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                         </div>
                      </button>

                      {!msg.thoughtProcessExpanded && (
                          <div className="text-xs text-gray-500 pl-5">
                              {msg.steps.length} actions performed by agents.
                          </div>
                      )}

                      {msg.thoughtProcessExpanded && (
                        <div className="space-y-3 mt-3 pl-1 border-l-2 border-[#27272a] ml-1.5 animate-slide-up">
                            {msg.steps.map((step, idx) => (
                                <div key={idx} className="flex items-center text-sm pl-3 relative">
                                    <div className={`absolute -left-[5px] w-2 h-2 rounded-full ${
                                        step.status === 'completed' ? 'bg-green-500' : 
                                        step.status === 'processing' ? 'bg-purple-500 animate-pulse' : 
                                        'bg-gray-700'
                                    }`}></div>
                                    <span className={`${
                                        step.status === 'completed' ? 'text-gray-400' : 
                                        step.status === 'processing' ? 'text-purple-300 font-medium' : 
                                        'text-gray-600'
                                    }`}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                      )}
                   </div>
                ) : (
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {/* Badge header for assistant messages */}
                    {msg.role === 'assistant' && msg.agent && (
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#27272a]">
                           <div className="flex items-center space-x-2">
                               <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-black bg-[#ffe600]`}>
                                  {msg.agent}
                               </span>
                           </div>
                           {msg.confidence && (
                               <div className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                   msg.confidence >= 90 ? 'text-green-400 border-green-500/30 bg-green-500/10' :
                                   msg.confidence >= 70 ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' :
                                   'text-red-400 border-red-500/30 bg-red-500/10'
                               }`}>
                                  Conf: {msg.confidence}%
                               </div>
                           )}
                        </div>
                    )}

                    {msg.content.split('**').map((part, i) => 
                      i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
                    )}
                    {msg.role === 'assistant' && isProcessing && messages[messages.length-1].id === msg.id && msg.content === '' && (
                        <span className="inline-block w-2 h-4 bg-gray-500 animate-pulse ml-1"></span>
                    )}
                  </div>
                )}

                {msg.anomalies && (
                  <div className="mt-4 space-y-2">
                    {msg.anomalies.map((anomaly) => (
                      <div key={anomaly.id} className="bg-[#15151a] border border-red-900/40 rounded p-3 hover:bg-red-900/10 transition-colors cursor-pointer" onClick={() => navigate(anomaly.metric === 'Inventory' ? '/lpo' : '/procurement')}>
                         <div className="flex justify-between items-start">
                           <div className="flex items-center text-red-400 font-bold text-sm">
                             <AlertTriangle size={14} className="mr-2" />
                             {anomaly.title}
                           </div>
                           <span className="text-[10px] bg-red-900 text-red-200 px-1.5 py-0.5 rounded">{anomaly.severity}</span>
                         </div>
                         <p className="text-xs text-gray-400 mt-1">{anomaly.description}</p>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-[#1a1a20] border-t border-[#27272a]">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
            placeholder={isProcessing ? "Processing request..." : `Ask the Orchestrator...`}
            className="w-full pl-4 pr-12 py-3 bg-[#101014] border border-[#3f3f46] rounded-xl focus:ring-1 focus:ring-[#ffe600] focus:border-[#ffe600] text-white placeholder-gray-600 transition-all disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={!input || isProcessing}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-[#ffe600] text-black rounded-lg hover:bg-yellow-400 disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrchestratorChat;
