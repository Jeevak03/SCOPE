import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Layers, ArrowRight, Zap, CheckCircle2, Loader2, BarChart2, AlertTriangle, Play, ShieldCheck, Truck, Factory, ThumbsUp, ThumbsDown, Plus, Sparkles, RotateCcw, ChevronDown, ChevronRight, BrainCircuit, Search, Database } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChatMessage, AgentType, AnomalyReport, OrchestrationStep } from '../types';
import { spendCategories, inventoryData, shipments, machineStatus, complianceMetrics, recentReturns } from '../mockData';
import { useAuth } from '../contexts/AuthContext';
import { analyzeIntentWithAI, generateResponseStreamWithAI, isAIEnabled } from '../ai';

const OrchestratorChat: React.FC = () => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize chat greeting based on Persona
  useEffect(() => {
    if (messages.length === 0) {
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
  }, [user]);

  // Handle auto-trigger from global search
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

  // --- 1. INTELLIGENCE LAYER (Intent Classification) ---

  const analyzeIntent = (text: string) => {
    const lower = text.toLowerCase();
    
    // Conversation
    if (lower.match(/^(hi|hello|hey|greetings|good morning|thanks|thank you|help)/)) {
        return { type: 'CONVERSATION', confidence: 0.99 };
    }

    // Explicit Actions (User explicitly asks to DO something)
    if (lower.match(/run|scan|analyze|start|execute|create|update|generate|alert/)) {
        if (lower.includes('iso') || lower.includes('audit')) return { type: 'ACTION', agent: AgentType.COMPLIANCE, action: 'SCAN_AUDIT' };
        if (lower.includes('anomaly') || lower.includes('risk')) return { type: 'ACTION', agent: AgentType.ORCHESTRATOR, action: 'SYSTEM_SCAN' };
        if (lower.includes('report')) return { type: 'ACTION', agent: AgentType.ORCHESTRATOR, action: 'GENERATE_REPORT' };
        return { type: 'ACTION', agent: AgentType.ORCHESTRATOR, action: 'GENERAL_SCAN' };
    }

    // Domain Queries & Routing (User asks about a topic or specific entity)
    // We check for specific entities FIRST, then general domain keywords
    
    // PLANNING / LPO
    if (lower.includes('planning') || lower.includes('lpo') || lower.includes('stock') || lower.includes('inventory') || lower.includes('sku') || lower.includes('forecast') || lower.includes('otif')) {
       return { type: 'QUERY', agent: AgentType.LPO, entity: 'SKU' };
    }
    
    // LOGISTICS
    if (lower.includes('logistics') || lower.includes('shipment') || lower.includes('transport') || lower.includes('tracking') || lower.includes('route') || lower.includes('delivery') || lower.includes('delay')) {
       return { type: 'QUERY', agent: AgentType.LOGISTICS, entity: 'SHIPMENT' };
    }

    // PROCUREMENT
    if (lower.includes('procurement') || lower.includes('vendor') || lower.includes('supplier') || lower.includes('spend') || lower.includes('buying') || lower.includes('cost') || lower.includes('purchase')) {
       return { type: 'QUERY', agent: AgentType.PROCUREMENT, entity: 'VENDOR' };
    }

    // MANUFACTURING
    if (lower.includes('manufacturing') || lower.includes('production') || lower.includes('factory') || lower.includes('machine') || lower.includes('plant') || lower.includes('oee')) {
       return { type: 'QUERY', agent: AgentType.MANUFACTURING, entity: 'MACHINE' };
    }

    // RETURNS
    if (lower.includes('return') || lower.includes('rma') || lower.includes('refund') || lower.includes('reverse') || lower.includes('recovery')) {
       return { type: 'QUERY', agent: AgentType.RETURN, entity: 'RMA' };
    }

    // COMPLIANCE
    if (lower.includes('compliance') || lower.includes('iso') || lower.includes('audit') || lower.includes('esg') || lower.includes('carbon') || lower.includes('safety')) {
       return { type: 'QUERY', agent: AgentType.COMPLIANCE, entity: 'STANDARD' };
    }

    // DOCUMENTS
    if (lower.includes('document') || lower.includes('contract') || lower.includes('legal') || lower.includes('pdf')) {
       return { type: 'QUERY', agent: AgentType.DOCUMENT, entity: 'DOC' };
    }

    // Default to unknown if no keywords matched
    return { type: 'UNKNOWN', confidence: 0.5 };
  };

  // --- 2. ORCHESTRATION LAYER (Multi-Agent Logic) ---

  const generateReasoningChain = (intent: any, userInput: string): OrchestrationStep[] => {
     if (intent.type === 'CONVERSATION') {
         return [
             { id: '1', label: 'Analyzing sentiment...', status: 'pending' },
             { id: '2', label: 'Checking user context...', status: 'pending' },
             { id: '3', label: 'Formulating conversational response...', status: 'pending' }
         ];
     }

     if (intent.type === 'ACTION') {
         return [
             { id: '1', label: `Orchestrator: Parsing action request...`, status: 'pending' },
             { id: '2', label: `Orchestrator: Delegating to ${intent.agent} Agent...`, status: 'pending' },
             { id: '3', label: `${intent.agent}: Initiating protocol ${intent.action}...`, status: 'pending' },
             { id: '4', label: `${intent.agent}: Analyzing results & generating report...`, status: 'pending' },
             { id: '5', label: `Orchestrator: Synthesizing final output...`, status: 'pending' }
         ];
     }

     if (intent.type === 'QUERY') {
         // Determine if specific entity or general query
         const entityMatch = userInput.match(/(SKU-\d+|SHP-\d+|RMA-\d+|M-\d+|ISO \d+)/i);
         const specificEntity = entityMatch ? entityMatch[0].toUpperCase() : 'General Domain Data';

         return [
             { id: '1', label: `Orchestrator: Identifying intent (Query ${intent.agent})...`, status: 'pending' },
             { id: '2', label: `Orchestrator: Routing to ${intent.agent} Agent...`, status: 'pending' },
             { id: '3', label: `${intent.agent}: Searching knowledge base for "${specificEntity}"...`, status: 'pending' },
             { id: '4', label: `${intent.agent}: Aggregating insights...`, status: 'pending' },
             { id: '5', label: `Orchestrator: Formatting response...`, status: 'pending' }
         ];
     }

     return [
        { id: '1', label: 'Parsing input...', status: 'pending' }, 
        { id: '2', label: 'Checking global knowledge base...', status: 'pending' },
        { id: '3', label: 'Formulating response...', status: 'pending' }
     ];
  };

  // --- 3. EXECUTION LAYER (Response Generation) ---

  const executeCommand = (intent: any, userInput: string): any => {
      // 3a. Conversational
      if (intent.type === 'CONVERSATION') {
          return {
              response: "I'm here to help you orchestrate your supply chain. \n\nYou can ask me to:\n- **Track specific items** (e.g., 'Check SHP-1092')\n- **Analyze domains** (e.g., 'How is Procurement performing?')\n- **Run actions** (e.g., 'Run anomaly scan')\n\nWhat would you like to do?",
              relatedQueries: ["Check Inventory Health", "Analyze Logistics Delays", "View Compliance Score"]
          };
      }

      // 3b. Action Execution (Scans)
      if (intent.type === 'ACTION') {
          if (intent.action === 'SYSTEM_SCAN' || intent.action === 'GENERAL_SCAN') {
              return {
                  response: "I've completed a full system anomaly scan across all connected agents.\n\n**Planning Agent**: Detected abnormal stockout risk for SKU-004 (Z-Score > 3.8).\n**Compliance Agent**: Flagged a Scope 3 emissions spike in APAC region.\n**Logistics Agent**: Monitoring potential port strike impact on West Coast routes.",
                  anomalies: [
                      { id: 'A1', severity: 'critical', title: 'Inventory Risk', description: 'SKU-004 stockout imminent', confidence: 98, rootCause: 'Demand Spike', metric: 'Inventory', impact: 'High' },
                      { id: 'A2', severity: 'warning', title: 'Emission Spike', description: 'Scope 3 above threshold', confidence: 85, rootCause: 'Logistics Change', metric: 'Carbon', impact: 'Medium' }
                  ],
                  relatedQueries: ["Show me details for SKU-004", "Generate mitigation plan"]
              };
          }
          if (intent.action === 'SCAN_AUDIT') {
              return {
                  response: "Audit Scan Initiated. \n\nI have reviewed the latest entries in the Compliance Ledger. No critical non-conformances found in the last 24 hours. However, the ISO 14001 recertification is due in 45 days.",
                  actionLink: { label: 'View Audit Schedule', url: '/compliance' },
                  relatedQueries: ["Prepare audit checklist", "Review ISO 14001 gaps"]
              };
          }
      }

      // 3c. Query Retrieval (Data Lookup & Summaries)
      if (intent.type === 'QUERY') {
          const lowerInput = userInput.toLowerCase();
          
          // --- PLANNING (LPO) ---
          if (intent.agent === AgentType.LPO) {
              const sku = inventoryData.find(i => lowerInput.includes(i.sku.toLowerCase()));
              if (sku) {
                  return {
                      response: `I found the inventory record for **${sku.sku}**.\n\nIt currently has **${sku.stockoutInstances}** recorded stockout instances with a shortage quantity of ${sku.stockoutQuantity} units. ${sku.isAnomaly ? '⚠️ **This is marked as an anomaly** due to deviation from the forecast.' : 'Status is currently within normal parameters.'}`,
                      data: { type: 'stat', title: 'Stockout Qty', value: sku.stockoutQuantity, sub: `${sku.stockoutInstances} Instances` },
                      actionLink: { label: 'View in Planning Dashboard', url: '/lpo' },
                      relatedQueries: [`Check suppliers for ${sku.sku}`, "Forecast demand for next month"]
                  };
              }
              // GENERAL SUMMARY
              return {
                  response: "I've analyzed the Planning & Inventory status. \n\nOverall stock levels are **94% optimal**. We have **8 SKUs** currently flagged for potential stockouts in the next cycle. \n\nWould you like to run a detailed simulation on the Planning Dashboard?",
                  data: { type: 'stat', title: 'Planning Health', value: '94%', sub: '8 Risks Detected' },
                  actionLink: { label: 'Go to Planning Dashboard', url: '/lpo' },
                  relatedQueries: ["Analyze stockout risk", "Show top performing SKUs"]
              };
          }

          // --- LOGISTICS ---
          if (intent.agent === AgentType.LOGISTICS) {
              const shp = shipments.find(s => lowerInput.includes(s.id.toLowerCase()));
              if (shp) {
                  return {
                      response: `Tracking **${shp.id}** (${shp.carrier}).\n\n**Status**: ${shp.status}\n**Route**: ${shp.origin} ➝ ${shp.destination}\n**ETA**: ${shp.eta.split('T')[0]}\n\n${shp.status === 'Delayed' ? '⚠️ This shipment is currently delayed.' : 'Shipment is on schedule.'} ${shp.activeRisks ? `Active risk factors detected: ${shp.activeRisks.join(', ')}.` : ''}`,
                      data: { type: 'stat', title: 'Shipment Status', value: shp.status, sub: `ETA: ${shp.eta.split('T')[0]}` },
                      actionLink: { label: 'View on Logistics Map', url: '/logistics' },
                      relatedQueries: [`Reroute ${shp.id}`, "Check tracking for SHP-1092"]
                  };
              }
              // GENERAL SUMMARY
              return {
                  response: "Logistics Overview: \n\nWe have **142 Active Shipments**. \n- **128** On Time \n- **14** Delayed \n\nCritical Alert: Red Sea corridor delays are affecting 2 vessels. I can help you optimize routes to avoid these risks.",
                  data: { type: 'stat', title: 'On-Time Performance', value: '90%', sub: '14 Delayed' },
                  actionLink: { label: 'Go to Logistics Dashboard', url: '/logistics' },
                  relatedQueries: ["Show delayed shipments", "Check Red Sea impact"]
              };
          }

          // --- COMPLIANCE ---
          if (intent.agent === AgentType.COMPLIANCE) {
              return {
                  response: "I've retrieved the latest ISO Compliance metrics.\n\n**ISO 9001**: 92/100 (Compliant)\n**ISO 14001**: 78/100 (At Risk)\n\nThere is an open Major finding regarding Scope 3 emissions in the APAC region.",
                  data: { type: 'alert', title: 'ISO 14001', value: 'At Risk', sub: 'Score: 78/100' },
                  actionLink: { label: 'Open Compliance Hub', url: '/compliance' },
                  relatedQueries: ["Show audit logs", "How to improve ISO 14001 score?"]
              };
          }
          
          // --- RETURNS ---
          if (intent.agent === AgentType.RETURN) {
             const rma = recentReturns.find(r => lowerInput.includes(r.id.toLowerCase()));
             if (rma) {
                return {
                   response: `Return Request **${rma.id}** is currently **${rma.status}**.\n\n**Customer**: ${rma.customer}\n**Reason**: ${rma.reason}\n**Disposition**: ${rma.disposition}\n\nFinancial Impact: ${rma.financialImpact} ${rma.currency}`,
                   data: { type: 'stat', title: 'RMA Status', value: rma.status, sub: rma.disposition },
                   actionLink: { label: 'Manage Returns', url: '/returns' },
                   relatedQueries: ["Check RMA-2024-002", "Show returns dashboard"]
                };
             }
             // GENERAL SUMMARY
             return {
                 response: "Reverse Logistics Summary:\n\nTotal Return Value in pipeline: **$12.4M**.\nRecovery Rate: **72%**.\n\nPending Actions: 4 Return Requests require approval. Disposition efficiency has improved by 8% this month.",
                 data: { type: 'stat', title: 'Recovery Rate', value: '72%', sub: '$12.4M Value' },
                 actionLink: { label: 'Go to Returns Dashboard', url: '/returns' },
                 relatedQueries: ["Show pending approvals", "Analyze return reasons"]
             };
          }

          // --- MANUFACTURING ---
           if (intent.agent === AgentType.MANUFACTURING) {
               const machine = machineStatus.find(m => lowerInput.includes(m.name.toLowerCase()));
               if (machine) {
                   return {
                       response: `Digital Twin Telemetry for **${machine.name}**:\n\n**Status**: ${machine.status}\n**Health**: ${machine.health}%\n**Temp**: ${machine.temperature}°C\n\n${machine.health < 80 ? '⚠️ Maintenance recommended immediately.' : 'Operating within normal parameters.'}`,
                       data: { type: 'stat', title: 'Machine Health', value: `${machine.health}%`, sub: machine.status },
                       actionLink: { label: 'View Factory Floor', url: '/manufacturing' }
                   };
               }
               // GENERAL SUMMARY
               return {
                  response: "Smart Factory Status:\n\n**Plant A**: Operating at 92% Efficiency.\n**OEE Score**: 85% (Global Avg).\n\nAlert: 'Robot Arm Delta' is showing vibration anomalies indicating potential failure in 48h.",
                  data: { type: 'stat', title: 'Global OEE', value: '85%', sub: 'Plant A' },
                  actionLink: { label: 'Go to Manufacturing Dashboard', url: '/manufacturing' },
                  relatedQueries: ["Check Robot Arm Delta", "Schedule maintenance"]
               };
           }

           // --- PROCUREMENT ---
           if (intent.agent === AgentType.PROCUREMENT) {
              return {
                 response: "Procurement Snapshot:\n\nTotal Managed Spend: **$152M**.\nActive Vendors: **7,877**.\n\nWe are tracking 2 high-risk vendors in the APAC region. Spend analysis shows a 12% variance in the 'Electronics' category.",
                 data: { type: 'stat', title: 'Managed Spend', value: '$152M', sub: '7,877 Vendors' },
                 actionLink: { label: 'Go to Procurement Dashboard', url: '/procurement' },
                 relatedQueries: ["Show high risk vendors", "Analyze electronics spend"]
              };
           }
      }

      // Default Fallback (Unknown Intent)
      return {
          response: "I'm listening, but I didn't recognize a specific request in your message. \n\nI can help you with:\n- **Planning** (Inventory, Forecasting)\n- **Sourcing** (Vendors, Spend)\n- **Logistics** (Shipments, Routes)\n- **Compliance** (ISO, Audits)\n\nTry asking 'Show me the Planning dashboard' or 'Check inventory for SKU-001'.",
          relatedQueries: ["Go to Planning", "Go to Logistics", "Help"]
      };
  };

  const handleSend = async (e: React.FormEvent | null, forcedInput?: string) => {
    if (e) e.preventDefault();
    const textToSend = forcedInput || input;
    if (!textToSend.trim()) return;

    setInput('');
    setIsProcessing(true);

    const timestamp = new Date();
    
    // 1. User Message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp
    };
    setMessages(prev => [...prev, userMsg]);

    // 2. Intent Analysis
    let intent;
    if (isAIEnabled()) {
        try {
            intent = await analyzeIntentWithAI(textToSend, user.role);
        } catch (e) {
            console.warn("AI Intent Analysis failed, falling back to basic regex.");
            intent = analyzeIntent(textToSend);
        }
    } else {
        intent = analyzeIntent(textToSend);
    }
    const reasoningChain = generateReasoningChain(intent, textToSend);
    
    // 3. System Reasoning Block
    const stepMsgId = `sys-${Date.now()}`;
    const initialSteps: OrchestrationStep[] = reasoningChain.map((step, idx) => ({
       ...step,
       status: idx === 0 ? 'processing' : 'pending'
    }));

    const systemMsg: ChatMessage = {
      id: stepMsgId,
      role: 'system',
      content: '',
      timestamp,
      steps: initialSteps,
      thoughtProcessExpanded: true
    };
    setMessages(prev => [...prev, systemMsg]);

    // --- Simulation Loop ---
    for (let i = 0; i < initialSteps.length; i++) {
       const delay = Math.floor(Math.random() * 500) + 500; // Organic delay
       await new Promise(r => setTimeout(r, delay));

       setMessages(prev => prev.map(m => {
          if (m.id === stepMsgId && m.steps) {
             const newSteps = [...m.steps];
             newSteps[i] = { ...newSteps[i], status: 'completed' };
             if (i + 1 < newSteps.length) {
                newSteps[i+1] = { ...newSteps[i+1], status: 'processing' };
             }
             return { ...m, steps: newSteps };
          }
          return m;
       }));
    }

    // Auto-collapse thought process
    await new Promise(r => setTimeout(r, 400));
    setMessages(prev => prev.map(m => {
        if (m.id === stepMsgId) return { ...m, thoughtProcessExpanded: false }; 
        return m;
    }));

    // 4. Execute Logic & Generate Response
    const executionResult = executeCommand(intent, textToSend);

    // 5. Streaming Response
    const responseId = `bot-${Date.now()}`;
    const agentResponse: ChatMessage = {
      id: responseId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      agent: intent.type === 'ACTION' || intent.type === 'QUERY' ? intent.agent : AgentType.ORCHESTRATOR,
      metrics: executionResult.data,
      actionLink: executionResult.actionLink,
      anomalies: executionResult.anomalies,
      relatedQueries: executionResult.relatedQueries
    };
    setMessages(prev => [...prev, agentResponse]);

    if (isAIEnabled()) {
        const contextString = JSON.stringify({
           fallbackResponse: executionResult.response,
           dataContext: executionResult.data || executionResult.anomalies || null
        });

        await generateResponseStreamWithAI(intent, textToSend, contextString, (chunk: string) => {
            setMessages(prev => prev.map(m =>
                m.id === responseId ? { ...m, content: chunk } : m
            ));
        });
    } else {
        // Fallback fake stream
        const words = executionResult.response.split(/(\s+)/);
        let streamedContent = '';
        for (const word of words) {
            streamedContent += word;
            setMessages(prev => prev.map(m =>
                m.id === responseId ? { ...m, content: streamedContent } : m
            ));
            await new Promise(r => setTimeout(r, 20 + Math.random() * 30));
        }
    }

    setIsProcessing(false);
  };

  const handleFeedback = (id: string, type: 'like' | 'dislike') => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === id) {
        return { ...msg, feedback: msg.feedback === type ? null : type };
      }
      return msg;
    }));
  };

  const toggleThoughts = (id: string) => {
      setMessages(prev => prev.map(msg => {
          if (msg.id === id) return { ...msg, thoughtProcessExpanded: !msg.thoughtProcessExpanded };
          return msg;
      }));
  };

  const getAgentIcon = (agent: AgentType) => {
      switch(agent) {
          case AgentType.LOGISTICS: return <Truck size={14} className="text-blue-500"/>;
          case AgentType.MANUFACTURING: return <Factory size={14} className="text-orange-500"/>;
          case AgentType.COMPLIANCE: return <ShieldCheck size={14} className="text-green-500"/>;
          case AgentType.RETURN: return <RotateCcw size={14} className="text-purple-500"/>;
          default: return <BarChart2 size={14} className="text-gray-400"/>;
      }
  };

  const getAgentColor = (agent: AgentType) => {
      switch(agent) {
          case AgentType.LOGISTICS: return 'bg-blue-500';
          case AgentType.MANUFACTURING: return 'bg-orange-500';
          case AgentType.COMPLIANCE: return 'bg-green-500';
          case AgentType.RETURN: return 'bg-purple-500';
          default: return 'bg-[#ffe600]';
      }
  };

  return (
    <div className="flex flex-col h-full bg-[#15151a] rounded-xl shadow-lg border border-[#27272a] overflow-hidden animate-fade-in">
      {/* Header */}
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

      {/* Chat Area */}
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
                
                {/* Reasoning Chain (Perplexity/Gemini style) */}
                {msg.role === 'system' && msg.steps ? (
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
                    {msg.content.split('**').map((part, i) => 
                      i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
                    )}
                    {msg.role === 'assistant' && msg.content === '' && (
                        <span className="inline-block w-2 h-4 bg-gray-500 animate-pulse ml-1"></span>
                    )}
                  </div>
                )}

                {/* Anomaly Cards */}
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

                {/* Widgets */}
                {msg.metrics && msg.role === 'assistant' && msg.content.length > 10 && (
                  <div className="mt-4 pt-3 border-t border-[#27272a] animate-fade-in">
                    <div className="flex items-center justify-between mb-3">
                       <div className="flex items-center space-x-2">
                          {msg.agent ? getAgentIcon(msg.agent) : <BarChart2 size={14} className="text-gray-400"/>}
                          <span className="text-xs text-gray-400 uppercase tracking-wider">Agent Data</span>
                       </div>
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-black ${msg.agent ? getAgentColor(msg.agent) : 'bg-[#ffe600]'}`}>
                         {msg.agent}
                       </span>
                    </div>
                    
                    <div className="bg-[#15151a] p-3 rounded border border-[#27272a] flex items-center space-x-4">
                       <div className={`p-2 rounded-lg ${msg.metrics.type === 'alert' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {msg.metrics.type === 'alert' ? <AlertTriangle size={20}/> : <Database size={20}/>}
                       </div>
                       <div>
                          <div className="text-xs text-gray-500">{msg.metrics.title}</div>
                          <div className="text-lg font-bold text-white">{msg.metrics.value}</div>
                          <div className="text-xs text-gray-400">{msg.metrics.sub}</div>
                       </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {msg.actionLink && msg.role === 'assistant' && msg.content.length > 10 && (
                  <button 
                    onClick={() => navigate(msg.actionLink.url)}
                    className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-[#2e2e36] hover:bg-[#3f3f46] text-white rounded-lg text-sm font-medium transition-colors border border-[#3f3f46]"
                  >
                    {msg.actionLink.label}
                    <ArrowRight size={16} className="ml-2" />
                  </button>
                )}

                {/* Suggestions */}
                {msg.role === 'assistant' && msg.relatedQueries && msg.content.length > 10 && (
                  <div className="mt-4 pt-3 border-t border-[#3f3f46] animate-fade-in">
                     <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                        <Sparkles size={12} className="mr-1.5 text-[#ffe600]" />
                        Suggested Actions
                     </div>
                     <div className="space-y-2">
                       {msg.relatedQueries.map((query, idx) => (
                         <button
                           key={idx}
                           onClick={() => handleSend(null, query)}
                           className="w-full text-left flex items-center justify-between p-2.5 rounded-lg bg-[#1a1a20] hover:bg-[#2e2e36] border border-[#27272a] hover:border-[#3f3f46] transition-all group"
                         >
                           <span className="text-sm text-gray-300 group-hover:text-white truncate">{query}</span>
                           <Plus size={14} className="text-gray-500 group-hover:text-[#ffe600] transition-colors" />
                         </button>
                       ))}
                     </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isProcessing && !messages[messages.length-1]?.steps && !messages[messages.length-1]?.content && (
           <div className="text-xs text-gray-600 italic ml-14">Orchestrator initializing...</div>
        )}
      </div>

      {/* Input */}
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