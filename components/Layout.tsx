import React, { useState, useEffect, useRef } from 'react';
import { 
  Home,
  LayoutGrid,
  MessageSquare, 
  Database,
  Truck,
  ShoppingCart,
  Factory,
  Settings, 
  Menu,
  X,
  Search,
  Bell,
  User,
  Zap,
  ShieldCheck,
  ChevronDown,
  AlertTriangle,
  Info,
  CheckCircle,
  ToggleLeft,
  RotateCcw,
  Bot,
  ArrowRight
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { personas, globalSearchSuggestions } from '../mockData';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<typeof globalSearchSuggestions>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, switchRole, canAccess } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const navigation = [
    { name: 'App Store', href: '/', icon: LayoutGrid },
    { name: 'SC Assistant', href: '/chat', icon: MessageSquare },
    { name: 'Agent Studio', href: '/agent-studio', icon: Bot }, // NEW AGENT BUILDER
    { name: 'Planning', href: '/lpo', icon: Database },
    { name: 'Procurement', href: '/procurement', icon: ShoppingCart },
    { name: 'Manufacturing', href: '/manufacturing', icon: Factory },
    { name: 'Logistics', href: '/logistics', icon: Truck },
    { name: 'Returns', href: '/returns', icon: RotateCcw },
    { name: 'Compliance', href: '/compliance', icon: ShieldCheck }, 
    { name: 'Documents', href: '/documents', icon: Home },
  ];

  // Filter navigation based on RBAC
  const filteredNavigation = navigation.filter(item => canAccess(item.href));

  // Handle Search Input Change
  useEffect(() => {
    if (searchQuery.length > 1) {
      const filtered = globalSearchSuggestions.filter(s =>
        s.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 6)); // Limit to 6 suggestions
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  // Handle Click Outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate('/chat', { state: { query: searchQuery } });
      setSearchQuery('');
    }
  };

  const handleSuggestionClick = (suggestionLabel: string) => {
      setSearchQuery(suggestionLabel);
      setShowSuggestions(false);
      navigate('/chat', { state: { query: suggestionLabel } });
      setSearchQuery(''); // Clear after navigation
  };

  const handleNotificationClick = (notif: any) => {
    markAsRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
      setIsNotificationsOpen(false);
    }
  };

  const getPhaseColor = (type: string) => {
      switch(type) {
          case 'PLAN': return 'text-purple-400 bg-purple-900/20 border-purple-900';
          case 'SOURCE': return 'text-blue-400 bg-blue-900/20 border-blue-900';
          case 'MAKE': return 'text-orange-400 bg-orange-900/20 border-orange-900';
          case 'DELIVER': return 'text-cyan-400 bg-cyan-900/20 border-cyan-900';
          case 'LOGISTICS': return 'text-cyan-400 bg-cyan-900/20 border-cyan-900';
          case 'RETURN': return 'text-pink-400 bg-pink-900/20 border-pink-900';
          case 'COMPLIANCE': return 'text-green-400 bg-green-900/20 border-green-900';
          default: return 'text-gray-400 bg-gray-800 border-gray-700';
      }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#101014] text-ey-text font-sans">
      
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#15151a] border-b border-[#27272a] z-50 flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            {/* EY Logo Concept */}
            <div className="relative h-10 w-10 flex items-center justify-center bg-[#2e2e33] rounded mr-3 overflow-hidden">
               <span className="font-bold text-lg text-white tracking-tighter">EY</span>
               <div className="absolute bottom-0 left-0 w-full h-1.5 bg-[#ffe600]"></div>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white hidden md:block">
              Supply Chain & Ops Platform
            </h1>
          </div>
        </div>

        {/* Central Search / Assistant Bar */}
        <div className="flex-1 max-w-xl mx-4 hidden md:block" ref={searchContainerRef}>
          <form onSubmit={handleGlobalSearch} className="relative group">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <div className="bg-white rounded-full p-0.5">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-6 h-6 rounded-full" alt="AI" />
               </div>
             </div>
             <input 
               type="text" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               onFocus={() => { if(searchQuery.length > 1) setShowSuggestions(true) }}
               className="block w-full pl-12 pr-32 py-2.5 border border-[#3f3f46] rounded-lg leading-5 bg-[#1e1e24] text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-[#27272a] focus:border-[#ffe600] focus:ring-1 focus:ring-[#ffe600] sm:text-sm transition-all"
               placeholder={`Ask the Orchestrator as ${user.role}...`}
               autoComplete="off"
             />
             <div className="absolute inset-y-0 right-0 flex items-center pr-1">
               <button type="submit" className="bg-transparent border border-[#ffe600] text-[#ffe600] hover:bg-[#ffe600] hover:text-black px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors flex items-center cursor-pointer">
                 <Zap size={14} className="mr-1.5" />
                 Solve
               </button>
             </div>

             {/* Typeahead Suggestions Dropdown */}
             {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1e1e24] border border-[#3f3f46] rounded-xl shadow-2xl overflow-hidden z-50 animate-slide-up">
                   <div className="px-4 py-2 text-[10px] uppercase font-bold text-gray-500 bg-[#15151a] border-b border-[#27272a]">
                      Suggested Queries
                   </div>
                   <ul>
                      {suggestions.map((s, idx) => (
                         <li 
                            key={idx}
                            onClick={() => handleSuggestionClick(s.label)}
                            className="px-4 py-3 hover:bg-[#27272a] cursor-pointer flex items-center justify-between group transition-colors border-b border-[#27272a] last:border-0"
                         >
                            <span className="text-sm text-gray-300 group-hover:text-white flex items-center">
                               <Search size={14} className="mr-3 text-gray-500 group-hover:text-[#ffe600]" />
                               {s.label}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${getPhaseColor(s.type)}`}>
                               {s.type}
                            </span>
                         </li>
                      ))}
                   </ul>
                </div>
             )}
          </form>
        </div>

        <div className="flex items-center space-x-4">
          
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 text-gray-400 hover:text-white transition-colors relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#1e1e24] border border-[#27272a] rounded-xl shadow-2xl overflow-hidden z-[100]">
                <div className="p-3 border-b border-[#27272a] bg-[#15151a] flex justify-between items-center">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Notifications</h3>
                  <span className="text-[10px] text-gray-500">{unreadCount} unread</span>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">No new notifications</div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 border-b border-[#27272a] hover:bg-[#27272a] transition-colors cursor-pointer ${!notif.read ? 'bg-[#27272a]/50 border-l-2 border-l-[#ffe600]' : ''}`}
                      >
                         <div className="flex items-start">
                            <div className="mr-3 mt-1">
                               {notif.type === 'critical' ? <AlertTriangle size={16} className="text-red-500"/> :
                                notif.type === 'warning' ? <AlertTriangle size={16} className="text-orange-500"/> :
                                <Info size={16} className="text-blue-500"/>}
                            </div>
                            <div>
                               <h4 className={`text-sm font-medium ${!notif.read ? 'text-white' : 'text-gray-400'}`}>{notif.title}</h4>
                               <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                               <span className="text-[10px] text-gray-600 mt-2 block">{notif.time}</span>
                            </div>
                         </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Persona Switcher / Profile */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-[#1e1e24] transition-colors border border-transparent hover:border-[#3f3f46]"
            >
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-white">{user.name}</div>
                <div className="text-[10px] text-[#ffe600] font-bold">{user.title}</div>
              </div>
              <img src={user.avatar} className="h-8 w-8 rounded-full bg-gray-700 border border-[#27272a]" alt="User" />
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#1e1e24] border border-[#27272a] rounded-xl shadow-2xl overflow-hidden z-[100]">
                <div className="p-3 border-b border-[#27272a] bg-[#15151a]">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Switch Persona (RBAC Demo)</h3>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {personas.map((persona) => (
                    <button
                      key={persona.id}
                      onClick={() => {
                        switchRole(persona.role);
                        setIsProfileOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 flex items-center space-x-3 hover:bg-[#27272a] transition-colors ${
                        user.id === persona.id ? 'bg-[#27272a] border-l-2 border-[#ffe600]' : ''
                      }`}
                    >
                      <img src={persona.avatar} className="h-8 w-8 rounded-full" alt={persona.name} />
                      <div>
                        <div className={`text-sm font-medium ${user.id === persona.id ? 'text-white' : 'text-gray-300'}`}>
                          {persona.name}
                        </div>
                        <div className="text-[10px] text-gray-500">{persona.title}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-16 bottom-0 bg-[#15151a] border-r border-[#27272a] transition-all duration-300 z-40 flex flex-col ${
          isSidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        <div className="flex-1 py-4 overflow-y-auto custom-scrollbar">
           {/* Section Label */}
           {isSidebarOpen && <div className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Menu</div>}
           
           <nav className="space-y-1 px-2">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all ${
                    isActive 
                      ? 'bg-[#ffe600] text-black shadow-[0_0_15px_rgba(255,230,0,0.3)]' 
                      : 'text-gray-400 hover:bg-[#1e1e24] hover:text-white'
                  }`}
                >
                  <item.icon 
                    className={`flex-shrink-0 transition-colors ${
                      isActive ? 'text-black' : 'text-gray-400 group-hover:text-white'
                    }`} 
                    size={20} 
                  />
                  {isSidebarOpen && (
                    <span className="ml-3 truncate">{item.name}</span>
                  )}
                  {isActive && isSidebarOpen && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-black"></div>
                  )}
                </Link>
              );
            })}
           </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#27272a]">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center justify-center w-full p-2 text-gray-400 hover:text-white hover:bg-[#1e1e24] rounded-md transition-colors"
          >
            <Settings size={20} />
            {isSidebarOpen && <span className="ml-3 text-sm">Settings</span>}
          </button>
          <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="mt-2 flex items-center justify-center w-full p-2 text-gray-500 hover:text-white hover:bg-[#1e1e24] rounded-md transition-colors"
          >
             {isSidebarOpen ? <X size={16}/> : <Menu size={16}/>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main 
        className={`flex-1 flex flex-col pt-16 transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-16'
        }`}
      >
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-[#101014] p-6 custom-scrollbar">
           {children}
        </div>
      </main>
      
      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center">
            <div className="bg-[#1e1e24] w-full max-w-md rounded-xl border border-[#27272a] shadow-2xl p-6">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">System Settings</h2>
                  <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
               </div>
               
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <div>
                        <h3 className="text-white font-medium">Demo Simulation Mode</h3>
                        <p className="text-xs text-gray-500">Auto-generate anomalies every 5 mins</p>
                     </div>
                     <button className="text-[#ffe600]"><ToggleLeft size={32} /></button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                     <div>
                        <h3 className="text-white font-medium">Dark Mode</h3>
                        <p className="text-xs text-gray-500">System default theme</p>
                     </div>
                     <button className="text-[#ffe600]"><ToggleLeft size={32} className="rotate-180" /></button>
                  </div>

                  <div className="flex items-center justify-between">
                     <div>
                        <h3 className="text-white font-medium">Notifications</h3>
                        <p className="text-xs text-gray-500">Enable desktop alerts</p>
                     </div>
                     <button className="text-[#ffe600]"><ToggleLeft size={32} className="rotate-180" /></button>
                  </div>
               </div>

               <div className="mt-8 pt-4 border-t border-[#27272a] flex justify-end">
                   <button onClick={() => setIsSettingsOpen(false)} className="px-4 py-2 bg-[#ffe600] text-black font-bold rounded-lg text-sm">
                      Save Changes
                   </button>
               </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Layout;