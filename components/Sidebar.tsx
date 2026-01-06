import React, { useState, useMemo } from 'react';
import { Database, Search, HardDrive, Download, MapPin, FileText } from 'lucide-react';
import { getAllEquipment, generateSQLDump } from '../services/mockDatabase';
import { generatePDFReport } from '../services/pdfGenerator';

interface SidebarProps {
  onSelectEquipment: (eqId: string, eqName: string) => void;
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ onSelectEquipment, isOpen }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Memoize equipment list to prevent unnecessary calls
  const allEquipment = useMemo(() => getAllEquipment(), []);

  const filteredEquipment = useMemo(() => {
    if (!searchTerm.trim()) return allEquipment;
    const lowerTerm = searchTerm.toLowerCase();
    
    return allEquipment.filter(eq => 
      eq.name.toLowerCase().includes(lowerTerm) ||
      eq.type.toLowerCase().includes(lowerTerm) ||
      eq.location.toLowerCase().includes(lowerTerm) ||
      eq.id.toLowerCase().includes(lowerTerm)
    );
  }, [searchTerm, allEquipment]);

  const handleDownloadSql = () => {
    const sqlContent = generateSQLDump();
    const blob = new Blob([sqlContent], { type: 'text/sql' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inspector_ai_postgres.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleGeneratePdf = () => {
    // Logic update:
    // 1. If search is active, export the filtered results.
    // 2. If search is EMPTY, export ONLY ONE RANDOM equipment (as requested).
    
    let itemsToExport;

    if (searchTerm.trim()) {
      itemsToExport = filteredEquipment;
    } else {
      // Select 1 random item from the entire database
      const randomIndex = Math.floor(Math.random() * allEquipment.length);
      itemsToExport = [allEquipment[randomIndex]];
    }

    generatePDFReport(itemsToExport);
  };

  return (
    <div className={`
      fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out border-r border-slate-700
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      md:relative md:translate-x-0
    `}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center gap-2 text-white font-semibold">
          <Database className="text-emerald-500" />
          <span>InspectorDB</span>
        </div>

        {/* Search Input */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search assets, type, or location..." 
              className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-500"
            />
          </div>
        </div>

        {/* Equipment List */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Assets ({filteredEquipment.length})
          </h3>
          <div className="space-y-1">
            {filteredEquipment.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-500">
                No matching assets found.
              </div>
            ) : (
              filteredEquipment.map((eq) => (
                <button
                  key={eq.id}
                  onClick={() => onSelectEquipment(eq.id, eq.name)}
                  className="w-full flex items-start gap-3 px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-left group"
                >
                  <HardDrive size={16} className="text-slate-500 group-hover:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-200 group-hover:text-white truncate">
                      {eq.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate flex items-center gap-1">
                      <span>{eq.type}</span>
                    </div>
                    {searchTerm && (
                      <div className="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1 truncate">
                        <MapPin size={10} /> {eq.location}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 space-y-3">
           <button 
            onClick={handleDownloadSql}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-md text-xs font-medium text-slate-300 transition-colors border border-slate-600"
          >
            <Download size={14} />
            <span>Export PostgreSQL</span>
          </button>
          
          <button 
            onClick={handleGeneratePdf}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 rounded-md text-xs font-medium text-white transition-colors border border-emerald-600"
            title="Exports filtered list, or 1 random asset if no filter."
          >
            <FileText size={14} />
            <span>Generate Reports (PDF)</span>
          </button>
          
          <div className="text-[10px] text-slate-500 text-center">
            Connected to: <span className="text-emerald-500">Primary DB</span>
          </div>
        </div>
      </div>
    </div>
  );
};