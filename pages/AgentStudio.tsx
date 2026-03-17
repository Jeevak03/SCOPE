import React, { useState } from 'react';
import { 
  Bot, Plus, BookOpen, Layers, FileText, Image as ImageIcon, Terminal, 
  BarChart, PieChart, Activity, Check, Save, UserCheck, Trash2, HelpCircle
} from 'lucide-react';
import { useAgents } from '../contexts/AgentContext';
import { CustomAgent, SCORPhase, DashboardWidgetConfig, UserRole } from '../types';
import { useNavigate } from 'react-router-dom';

const AgentStudio: React.FC = () => {
  const { agents, addAgent, deleteAgent } = useAgents();
  const navigate = useNavigate();
  
  const [showWizard, setShowWizard] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  
  // Wizard State
  const [step, setStep] = useState(1);
  const [newAgent, setNewAgent] = useState<Partial<CustomAgent>>({
    name: '',
    description: '',
    phase: 'PLAN',
    knowledgeBase: [],
    actions: [],
    widgets: [],
    status: 'Active'
  });

  // Widget Builder State
  const [tempWidget, setTempWidget] = useState<Partial<DashboardWidgetConfig>>({
     title: '',
     type: 'KPI_CARD',
     visibleTo: [],
     data: []
  });
  const [widgetDataInput, setWidgetDataInput] = useState(''); // Simple comma sep

  // -- Handlers --

  const handleCreateAgent = () => {
    if (!newAgent.name) return;
    
    const agent: CustomAgent = {
       id: `ca-${Date.now()}`,
       name: newAgent.name!,
       description: newAgent.description || '',
       phase: newAgent.phase as SCORPhase,
       knowledgeBase: newAgent.knowledgeBase || [],
       actions: newAgent.actions || [],
       widgets: newAgent.widgets || [],
       createdBy: 'You',
       status: 'Active'
    };
    
    addAgent(agent);
    setShowWizard(false);
    setNewAgent({ name: '', description: '', phase: 'PLAN', knowledgeBase: [], actions: [], widgets: [] });
    setStep(1);
  };

  const addWidgetToAgent = () => {
     if (!tempWidget.title) return;
     
     // Parse Data Input (Label:Value)
     const parsedData = widgetDataInput.split(',').map(item => {
        const [name, val] = item.split(':');
        return { name: name?.trim() || 'Item', value: Number(val) || 0, color: '#8884d8' };
     });

     const widget: DashboardWidgetConfig = {
        id: `w-${Date.now()}`,
        title: tempWidget.title!,
        type: tempWidget.type as any,
        targetDashboard: newAgent.phase as SCORPhase,
        visibleTo: tempWidget.visibleTo || ['EXECUTIVE'],
        data: parsedData.length > 0 ? parsedData : [{name: 'Sample', value: 100}],
        kpiUnit: tempWidget.kpiUnit,
        actionLabel: tempWidget.actionLabel
     };

     setNewAgent(prev => ({
        ...prev,
        widgets: [...(prev.widgets || []), widget]
     }));
     
     // Reset Widget Builder
     setTempWidget({ title: '', type: 'KPI_CARD', visibleTo: [], data: [] });
     setWidgetDataInput('');
  };

  const togglePermission = (role: UserRole) => {
     setTempWidget(prev => {
        const current = prev.visibleTo || [];
        if (current.includes(role)) {
           return { ...prev, visibleTo: current.filter(r => r !== role) };
        } else {
           return { ...prev, visibleTo: [...current, role] };
        }
     });
  };

  return (
    <div className="flex h-full animate-fade-in relative">
      
      {/* Left Panel: Agent List */}
      <div className="w-1/3 border-r border-[#27272a] p-6 overflow-y-auto">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
               <Bot className="mr-2 text-[#ffe600]" /> Agent Studio
            </h2>
            <button 
               onClick={() => setShowWizard(true)} 
               className="p-2 bg-[#ffe600] text-black rounded-lg hover:bg-yellow-400 transition-colors"
            >
               <Plus size={20} />
            </button>
         </div>

         <div className="space-y-4">
            {agents.map(agent => (
               <div key={agent.id} className="bg-[#15151a] border border-[#27272a] rounded-xl p-4 hover:border-gray-500 transition-colors group relative">
                  <div className="flex justify-between items-start">
                     <div>
                        <h3 className="font-bold text-white">{agent.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 mt-1 inline-block border border-gray-700">
                           Phase: {agent.phase}
                        </span>
                     </div>
                     <button onClick={() => deleteAgent(agent.id)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={16} />
                     </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{agent.description}</p>
                  <div className="mt-4 flex items-center space-x-2 text-[10px] text-gray-400">
                     <span className="flex items-center"><FileText size={10} className="mr-1"/> {agent.knowledgeBase.length} Docs</span>
                     <span className="flex items-center"><Activity size={10} className="mr-1"/> {agent.widgets.length} Widgets</span>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Right Panel: Content / Wizard */}
      <div className="flex-1 p-8 bg-[#101014] overflow-y-auto">
         
         {!showWizard ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
               <div className="w-20 h-20 bg-[#1e1e24] rounded-full flex items-center justify-center mb-6 border border-[#27272a]">
                  <Layers size={40} className="text-gray-500" />
               </div>
               <h3 className="text-2xl font-bold text-white mb-2">Build Your Own Supply Chain Agents</h3>
               <p className="text-gray-400 mb-8">
                  Create custom agents that live within specific SCOR phases. Upload documents for RAG, define actions, and create dashboard widgets for visibility.
               </p>
               
               {showGuide && (
                  <div className="bg-[#15151a] border border-blue-900/50 rounded-xl p-6 text-left w-full animate-slide-up">
                     <div className="flex items-center space-x-2 mb-4 text-blue-400">
                        <BookOpen size={20} />
                        <h4 className="font-bold">Learning Guide: How to Configure</h4>
                     </div>
                     <ul className="space-y-3 text-sm text-gray-300">
                        <li className="flex items-start">
                           <span className="bg-blue-900/50 text-blue-300 w-5 h-5 rounded-full flex items-center justify-center text-xs mr-3 flex-shrink-0">1</span>
                           Select a SCOR Phase (e.g., PLAN) where the agent will operate.
                        </li>
                        <li className="flex items-start">
                           <span className="bg-blue-900/50 text-blue-300 w-5 h-5 rounded-full flex items-center justify-center text-xs mr-3 flex-shrink-0">2</span>
                           Upload PDFs or Text. The agent uses this "Knowledge Base" to answer queries in the Orchestrator.
                        </li>
                        <li className="flex items-start">
                           <span className="bg-blue-900/50 text-blue-300 w-5 h-5 rounded-full flex items-center justify-center text-xs mr-3 flex-shrink-0">3</span>
                           Define Actions (e.g., "Approve PO"). These become buttons in the interface.
                        </li>
                        <li className="flex items-start">
                           <span className="bg-blue-900/50 text-blue-300 w-5 h-5 rounded-full flex items-center justify-center text-xs mr-3 flex-shrink-0">4</span>
                           <strong>Dashboard Config:</strong> Create widgets that automatically appear on the relevant dashboard (e.g., LPO Dashboard) for specific personas.
                        </li>
                     </ul>
                  </div>
               )}
               
               <button 
                  onClick={() => setShowWizard(true)}
                  className="mt-8 px-6 py-3 bg-[#ffe600] text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
               >
                  Start Building
               </button>
            </div>
         ) : (
            // WIZARD
            <div className="max-w-3xl mx-auto animate-fade-in">
               
               {/* Steps Indicator */}
               <div className="flex items-center justify-between mb-8 border-b border-[#27272a] pb-4">
                  {[1, 2, 3, 4].map(s => (
                     <div key={s} className={`flex items-center ${step >= s ? 'text-[#ffe600]' : 'text-gray-600'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mr-2 font-bold ${step >= s ? 'border-[#ffe600] bg-[#ffe600]/10' : 'border-gray-700'}`}>
                           {s}
                        </div>
                        <span className="hidden sm:block text-sm font-medium">
                           {s === 1 ? 'Identity' : s === 2 ? 'Knowledge' : s === 3 ? 'Actions' : 'Dashboard'}
                        </span>
                        {s < 4 && <div className="w-12 h-0.5 bg-[#27272a] mx-4"></div>}
                     </div>
                  ))}
               </div>

               {/* Step 1: Identity */}
               {step === 1 && (
                  <div className="space-y-6">
                     <h2 className="text-xl font-bold text-white">Agent Identity</h2>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Agent Name</label>
                        <input 
                           type="text" 
                           className="w-full bg-[#1e1e24] border border-[#3f3f46] rounded-lg p-3 text-white focus:border-[#ffe600]"
                           placeholder="e.g. Risk Mitigation Bot"
                           value={newAgent.name}
                           onChange={e => setNewAgent({...newAgent, name: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                        <textarea 
                           className="w-full bg-[#1e1e24] border border-[#3f3f46] rounded-lg p-3 text-white focus:border-[#ffe600] h-24"
                           placeholder="What does this agent do?"
                           value={newAgent.description}
                           onChange={e => setNewAgent({...newAgent, description: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">SCOR Phase</label>
                        <div className="grid grid-cols-3 gap-3">
                           {['PLAN', 'SOURCE', 'MAKE', 'DELIVER', 'RETURN', 'ENABLE'].map(p => (
                              <button 
                                 key={p}
                                 onClick={() => setNewAgent({...newAgent, phase: p as SCORPhase})}
                                 className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                                    newAgent.phase === p 
                                       ? 'bg-[#ffe600] text-black border-[#ffe600]' 
                                       : 'bg-[#1e1e24] text-gray-400 border-[#3f3f46] hover:border-gray-400'
                                 }`}
                              >
                                 {p}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>
               )}

               {/* Step 2: Knowledge */}
               {step === 2 && (
                  <div className="space-y-6">
                     <h2 className="text-xl font-bold text-white">Knowledge Base Configuration</h2>
                     <p className="text-sm text-gray-400">Upload documents or text context. The agent uses this for RAG responses.</p>
                     
                     <div className="border-2 border-dashed border-[#3f3f46] rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:border-[#ffe600] hover:text-[#ffe600] transition-colors cursor-pointer bg-[#1e1e24]/50">
                        <FileText size={32} className="mb-2" />
                        <span className="font-medium">Drag & Drop Documents (PDF, DOCX)</span>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-[#1e1e24] rounded-lg border border-[#3f3f46] flex items-center text-gray-300">
                           <ImageIcon size={20} className="mr-3 text-blue-500" /> Image Context (OCR)
                        </div>
                        <div className="p-4 bg-[#1e1e24] rounded-lg border border-[#3f3f46] flex items-center text-gray-300">
                           <Terminal size={20} className="mr-3 text-green-500" /> Plain Text Instructions
                        </div>
                     </div>
                  </div>
               )}

               {/* Step 3: Actions */}
               {step === 3 && (
                  <div className="space-y-6">
                     <h2 className="text-xl font-bold text-white">Capability & Action Setup</h2>
                     <p className="text-sm text-gray-400">What can this agent perform inside the {newAgent.phase} phase?</p>
                     
                     <div className="space-y-3">
                        {['Send Email Notification', 'Create Purchase Order', 'Flag Anomaly', 'Update ERP Record', 'Schedule Maintenance', 'Reroute Shipment'].map(act => (
                           <label key={act} className="flex items-center p-4 bg-[#1e1e24] border border-[#3f3f46] rounded-lg cursor-pointer hover:bg-[#27272a]">
                              <input 
                                 type="checkbox" 
                                 className="w-5 h-5 text-[#ffe600] rounded focus:ring-0 bg-gray-800 border-gray-600"
                                 onChange={(e) => {
                                    if(e.target.checked) setNewAgent(p => ({...p, actions: [...(p.actions||[]), act]}));
                                    else setNewAgent(p => ({...p, actions: (p.actions||[]).filter(a => a !== act)}));
                                 }}
                              />
                              <span className="ml-3 text-white font-medium">{act}</span>
                           </label>
                        ))}
                     </div>
                  </div>
               )}

               {/* Step 4: Dashboard Widget */}
               {step === 4 && (
                  <div className="space-y-6">
                     <h2 className="text-xl font-bold text-white">Dashboard Configuration</h2>
                     <p className="text-sm text-gray-400">Design a widget that will appear on the <strong>{newAgent.phase} Dashboard</strong>.</p>
                     
                     <div className="bg-[#1e1e24] p-6 rounded-xl border border-[#3f3f46]">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                           <div>
                              <label className="text-xs font-bold text-gray-500">Widget Title</label>
                              <input 
                                 type="text" 
                                 value={tempWidget.title} 
                                 onChange={e => setTempWidget({...tempWidget, title: e.target.value})}
                                 className="w-full bg-[#15151a] border border-[#3f3f46] rounded p-2 text-white text-sm mt-1" 
                              />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-gray-500">Type</label>
                              <select 
                                 value={tempWidget.type}
                                 onChange={e => setTempWidget({...tempWidget, type: e.target.value as any})}
                                 className="w-full bg-[#15151a] border border-[#3f3f46] rounded p-2 text-white text-sm mt-1"
                              >
                                 <option value="KPI_CARD">KPI Card</option>
                                 <option value="BAR_CHART">Bar Chart</option>
                                 <option value="PIE_CHART">Pie Chart</option>
                                 <option value="ACTION_PANEL">Action Panel</option>
                              </select>
                           </div>
                        </div>

                        <div className="mb-4">
                           <label className="text-xs font-bold text-gray-500">
                              Simulated Data {tempWidget.type === 'KPI_CARD' ? '(Label:Value)' : '(Label1:10, Label2:20)'}
                           </label>
                           <input 
                                 type="text" 
                                 value={widgetDataInput} 
                                 onChange={e => setWidgetDataInput(e.target.value)}
                                 placeholder={tempWidget.type === 'KPI_CARD' ? "Revenue:50000" : "A:10, B:20, C:15"}
                                 className="w-full bg-[#15151a] border border-[#3f3f46] rounded p-2 text-white text-sm mt-1 font-mono" 
                           />
                        </div>

                        <div className="mb-4">
                           <label className="text-xs font-bold text-gray-500 mb-2 block">Visible To (Permissions)</label>
                           <div className="flex flex-wrap gap-2">
                              {['EXECUTIVE', 'PLANNER', 'PROCUREMENT', 'LOGISTICS'].map((role) => (
                                 <button
                                    key={role}
                                    onClick={() => togglePermission(role as UserRole)}
                                    className={`px-3 py-1 rounded text-xs border ${
                                       tempWidget.visibleTo?.includes(role as UserRole) 
                                       ? 'bg-blue-600 text-white border-blue-500' 
                                       : 'bg-[#15151a] text-gray-400 border-[#3f3f46]'
                                    }`}
                                 >
                                    {role}
                                 </button>
                              ))}
                           </div>
                        </div>

                        <button 
                           onClick={addWidgetToAgent}
                           className="w-full py-2 bg-[#27272a] hover:bg-[#3f3f46] text-white rounded border border-[#3f3f46] text-sm font-bold"
                        >
                           Add Widget to Config
                        </button>
                     </div>

                     {/* Preview Added Widgets */}
                     <div className="grid grid-cols-2 gap-4">
                        {newAgent.widgets?.map((w, idx) => (
                           <div key={idx} className="p-3 bg-green-900/10 border border-green-500/30 rounded text-green-400 text-sm flex items-center justify-between">
                              <span>{w.title} ({w.type})</span>
                              <Check size={16} />
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {/* Navigation Buttons */}
               <div className="flex justify-between mt-8 border-t border-[#27272a] pt-6">
                  <button 
                     onClick={() => step === 1 ? setShowWizard(false) : setStep(step - 1)}
                     className="px-6 py-2 bg-[#27272a] text-white rounded-lg"
                  >
                     Back
                  </button>
                  {step < 4 ? (
                     <button 
                        onClick={() => setStep(step + 1)}
                        className="px-6 py-2 bg-[#ffe600] text-black font-bold rounded-lg"
                     >
                        Next Step
                     </button>
                  ) : (
                     <button 
                        onClick={handleCreateAgent}
                        className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 flex items-center"
                     >
                        <Save size={18} className="mr-2" />
                        Create Agent
                     </button>
                  )}
               </div>

            </div>
         )}
      </div>

    </div>
  );
};

export default AgentStudio;