import React, { useState } from 'react';
import { UploadCloud, Search, FileText, CheckCircle, Clock, X, File as FileIcon } from 'lucide-react';
import { mockCitations } from '../mockData';

const DocumentAgent: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      // Simulate upload and embedding delay
      setTimeout(() => {
        setUploadedFile(file);
        setIsUploading(false);
      }, 1200);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setResult(null);
    
    // Simulate RAG pipeline delay
    setTimeout(() => {
      setIsSearching(false);
      setResult({
        answer: "Based on the supplier agreement analysis, the force majeure clause explicitly covers global supply chain disruptions caused by pandemics or government-imposed trade restrictions. However, notification must be provided within 5 business days of the event.",
        citations: mockCitations
      });
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Contracts.AI Document Agent</h2>
          <p className="text-gray-400 mt-1">Semantic Search & Extraction across Contracts and Reports</p>
        </div>
        <div className="flex items-center space-x-4">
           {/* Upload Widget */}
           {!uploadedFile && !isUploading && (
             <div className="relative group">
                <input type="file" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <button className="flex items-center px-4 py-2 bg-[#ffe600] text-black rounded-lg hover:bg-yellow-400 transition-colors font-semibold">
                  <UploadCloud size={18} className="mr-2" />
                  Upload Document
                </button>
             </div>
           )}

           {isUploading && (
             <div className="flex items-center px-4 py-2 bg-[#1e1e24] text-gray-300 rounded-lg border border-[#27272a]">
                <div className="w-4 h-4 border-2 border-[#ffe600] border-t-transparent rounded-full animate-spin mr-2"></div>
                Embedding...
             </div>
           )}

           {uploadedFile && (
             <div className="flex items-center px-4 py-2 bg-[#27272a] text-white rounded-lg border border-green-900/50">
                <FileIcon size={16} className="text-green-500 mr-2" />
                <span className="text-sm mr-2">{uploadedFile.name}</span>
                <button onClick={() => setUploadedFile(null)} className="text-gray-500 hover:text-white"><X size={14}/></button>
             </div>
           )}
        </div>
      </div>

      {/* Main Search Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <form onSubmit={handleSearch} className="relative mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about your documents (e.g., 'What are the payment terms for Vendor X?')"
            className="w-full pl-12 pr-4 py-4 bg-[#1e1e24] border border-[#3f3f46] rounded-xl focus:ring-1 focus:ring-[#ffe600] focus:border-[#ffe600] text-white placeholder-gray-500 text-lg transition-all shadow-lg"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={24} />
          <button 
            type="submit"
            disabled={!query || isSearching}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-[#ffe600] text-black rounded-lg hover:bg-yellow-400 disabled:opacity-50 font-medium text-sm transition-colors"
          >
            {isSearching ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>

        {isSearching && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
             <div className="w-12 h-12 border-4 border-[#27272a] border-t-[#ffe600] rounded-full animate-spin"></div>
             <p className="text-gray-400 animate-pulse">Retrieving chunks from Vector Store & Generating Answer...</p>
          </div>
        )}

        {result && !isSearching && (
          <div className="space-y-6 animate-slide-up">
            <div className="bg-[#15151a] p-6 rounded-xl border border-[#27272a] shadow-lg relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-[#ffe600]"></div>
               <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                 <BotIcon className="w-6 h-6 text-[#ffe600] mr-2" />
                 Generated Answer
               </h3>
               <p className="text-gray-200 leading-relaxed text-lg">
                 {result.answer}
               </p>
            </div>

            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-6">Source Citations</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.citations.map((cite: any) => (
                <div key={cite.id} className="bg-[#15151a] p-4 rounded-lg border border-[#27272a] hover:border-[#ffe600] transition-colors group cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center text-sm font-semibold text-gray-300">
                      <FileText size={16} className="mr-2 text-gray-500 group-hover:text-[#ffe600]" />
                      {cite.filename}
                    </div>
                    <span className="text-xs bg-[#27272a] text-gray-400 px-2 py-0.5 rounded border border-[#3f3f46]">
                      Page {cite.page}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2 italic">
                    "...{cite.text}..."
                  </p>
                  <div className="flex items-center justify-between mt-2">
                     <span className="text-xs font-mono text-gray-600">Similarity: {cite.similarity}</span>
                     <span className="text-xs text-[#ffe600] font-medium opacity-0 group-hover:opacity-100 transition-opacity">View Source &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!result && !isSearching && (
           <div className="text-center py-12 text-gray-600">
              <FileText size={48} className="mx-auto mb-4 opacity-20" />
              <p>Upload documents to the Knowledge Base to begin analysis.</p>
              <div className="mt-8 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                 <div className="p-4 bg-[#15151a] rounded border border-[#27272a] text-xs">
                    <strong className="text-gray-400 block mb-1">Vector Store</strong> pgvector
                 </div>
                 <div className="p-4 bg-[#15151a] rounded border border-[#27272a] text-xs">
                    <strong className="text-gray-400 block mb-1">Embeddings</strong> ada-002
                 </div>
                 <div className="p-4 bg-[#15151a] rounded border border-[#27272a] text-xs">
                    <strong className="text-gray-400 block mb-1">LLM</strong> GPT-4o
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

const BotIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
    <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" />
    <path d="M15 14h-6" />
    <path d="M9 9h.01" />
    <path d="M15 9h.01" />
  </svg>
);

export default DocumentAgent;