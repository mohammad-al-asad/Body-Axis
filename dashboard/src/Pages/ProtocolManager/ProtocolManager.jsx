import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Flame, Dumbbell, Activity, Users, Edit3, Trash2, Search } from 'lucide-react';
import StatsCard from '../../Components/Dashboard/StatsCard';
import { ProtocolContext } from '../../context/ProtocolContext';

const ProtocolManager = () => {
  const stats = [
    {
      title: "TOTAL PROTOCOLS",
      value: "412",
      change: "↗ 12%",
      icon: <Flame size={20} className="text-[#38BDF8]" />,
      bgIcon: Flame,
    },
    {
      title: "TOTAL EXERCISES",
      value: "2,854",
      change: "↗ 12%",
      icon: <Dumbbell size={20} className="text-[#818CF8]" />,
      bgIcon: Dumbbell,
    },
    {
      title: "AVERAGE DURATION",
      value: "14,285",
      change: "↗ 12%",
      icon: <Activity size={20} className="text-[#34D399]" />,
      bgIcon: Activity,
    },
    {
      title: "ACTIVE USERS",
      value: "8,912",
      change: "↗ 12%",
      icon: <Users size={20} className="text-[#A78BFA]" />,
      bgIcon: Users,
    }
  ];

  const { protocols, toggleStatus } = useContext(ProtocolContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  // Filter protocols by search input
  const filteredProtocols = protocols.filter(protocol =>
    protocol.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProtocols.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProtocols = filteredProtocols.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(p => p + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1);
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Generate page numbers with standard truncation logic matching the screenshot
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 1) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto text-white space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Protocol Manager</h1>
          <p className="text-[#94A3B8] text-[13px] mt-1 font-medium">Design and oversee corrective movement sequences.</p>
        </div>
        <button 
          onClick={() => navigate('/create-protocol')}
          className="flex items-center gap-2 bg-[#3B82F6] hover:bg-blue-600 transition-colors text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(59,130,246,0.3)]"
        >
          Create New Protocol
          <PlusCircle size={18} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>

      {/* Manage Protocols Table */}
      <div className="bg-[#0A1120]/80 rounded-2xl border border-[#1E293B] overflow-hidden">
        <div className="px-8 py-5 border-b border-[#1E293B] flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-[15px] font-bold text-white">Manage Protocols</h2>
          
          {/* Search Box */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#475569]">
              <Search size={16} strokeWidth={2} />
            </span>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search...."
              className="w-[250px] pl-10 pr-4 py-2 bg-[#090E1A]/80 border border-[#1E293B] rounded-xl text-white text-[13px] placeholder-[#475569] focus:outline-none focus:border-[#38BDF8]/50 transition-colors"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold text-[#475569] uppercase tracking-[0.15em] border-b border-[#1E293B]">
                <th className="px-8 py-5 w-[100px]">#</th>
                <th className="px-6 py-5">PROTOCOL NAME</th>
                <th className="px-6 py-5 w-[150px]">DURATION</th>
                <th className="px-6 py-5 w-[200px]">STATUS</th>
                <th className="px-8 py-5 text-right w-[150px]">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/55">
              {currentProtocols.length > 0 ? (
                currentProtocols.map((protocol) => (
                  <tr key={protocol.id} className="hover:bg-[#1E293B]/20 transition-colors">
                    {/* Pad IDs to 3 digits */}
                    <td className="px-8 py-5 text-[#3b4c66] text-[13px] font-medium font-mono">
                      {protocol.id}
                    </td>
                    
                    {/* Protocol Name */}
                    <td className="px-6 py-5 text-[14px] font-bold text-gray-100">
                      {protocol.name}
                    </td>
                    
                    {/* Duration */}
                    <td className="px-6 py-5 text-[#94A3B8] text-[13px]">
                      {protocol.duration}
                    </td>
                    
                    {/* Status Pill Toggle */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => toggleStatus(protocol.id)}
                          className={`relative w-[38px] h-[20px] rounded-full transition-colors duration-300 focus:outline-none ${
                            protocol.active ? 'bg-[#10B981]' : 'bg-[#1E293B] border border-slate-700/50'
                          }`}
                        >
                          <span className={`absolute top-[3px] left-[3px] bg-white w-[12px] h-[12px] rounded-full transition-transform duration-300 ${
                            protocol.active ? 'translate-x-[18px]' : 'translate-x-0'
                          }`}></span>
                        </button>
                        <span className={`text-[11px] font-bold tracking-wider uppercase ${
                          protocol.active ? 'text-[#10B981]' : 'text-[#475569]'
                        }`}>
                          {protocol.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                    </td>
                    
                    {/* Action Outline Icons */}
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-3 text-[#475569]">
                        <button className="hover:text-white transition-colors p-1.5 rounded-lg focus:outline-none">
                          <Edit3 size={18} strokeWidth={1.5} />
                        </button>
                        <button className="hover:text-white transition-colors p-1.5 rounded-lg focus:outline-none">
                          <Trash2 size={18} strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-16 text-center text-[#475569] text-[13.5px]">
                    No protocols found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-8 py-6 grid grid-cols-3 items-center text-[13px] text-[#475569] font-medium border-t border-[#1E293B]">
          {/* Left: Showing text */}
          <div className="text-left">
            <p className="text-[13px] text-[#3b4c66] font-medium">
              Showing {filteredProtocols.length > 0 ? indexOfFirstItem + 1 : 0}-
              {Math.min(indexOfLastItem, filteredProtocols.length)} of {filteredProtocols.length} protocols
            </p>
          </div>
          
          {/* Center: Centered Page Numbers */}
          <div className="flex items-center justify-center gap-3">
            {currentPage > 1 && (
              <button 
                onClick={handlePrevPage}
                className="text-[#64748B] hover:text-white font-bold transition-colors uppercase text-[11px] tracking-wider mr-2 focus:outline-none"
              >
                &lt; PREV
              </button>
            )}

            {getPageNumbers().map((num, idx) => (
              num === '...' ? (
                <span key={`dots-${idx}`} className="text-[#3b4c66] font-bold px-1 select-none">...</span>
              ) : (
                <button 
                  key={`page-${num}`}
                  onClick={() => handlePageClick(num)}
                  className={`w-[32px] h-[32px] flex items-center justify-center rounded-lg font-bold transition-colors focus:outline-none ${
                    currentPage === num 
                      ? 'bg-[#00D2FF] text-slate-900 shadow-[0_0_12px_rgba(0,210,255,0.5)]' 
                      : 'text-[#64748B] hover:text-white'
                  }`}
                >
                  {num}
                </button>
              )
            ))}
          </div>
          
          {/* Right: NEXT Button */}
          <div className="text-right">
            {currentPage < totalPages ? (
              <button 
                onClick={handleNextPage}
                className="text-[#64748B] hover:text-white font-bold transition-colors uppercase text-[11px] tracking-wider inline-flex items-center gap-1 focus:outline-none"
              >
                NEXT &gt;
              </button>
            ) : (
              <div className="h-4"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtocolManager;
