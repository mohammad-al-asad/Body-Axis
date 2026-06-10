import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Filter, Dumbbell, Flame, Activity, User, Edit3, Trash2, ArrowLeft, ArrowRight, ChevronDown, Package } from 'lucide-react';
import StatsCard from '../../Components/Dashboard/StatsCard';
import { ExerciseContext } from '../../context/ExerciseContext';

// Removed mock generator, moved to Context

const getPhaseStyle = (phase) => {
  switch (phase) {
    case 'Reset': return 'bg-[#06B6D4]/10 text-[#06B6D4]';
    case 'Control': return 'bg-[#10B981]/10 text-[#10B981]';
    case 'Integrate': return 'bg-[#8B5CF6]/10 text-[#8B5CF6]';
    default: return 'bg-gray-800 text-gray-300';
  }
};

const ExerciseLibrary = () => {
  const { exercises, deleteExercise } = useContext(ExerciseContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 4;
  const navigate = useNavigate();

  const stats = [
    {
      title: "TOTAL EXERCISES",
      value: "2,854",
      icon: <Dumbbell size={20} className="text-[#38BDF8]" />,
      bgIcon: Dumbbell,
    },
    {
      title: "PUBLISHED EXERCISE",
      value: "412",
      icon: <Flame size={20} className="text-[#34D399]" />,
      bgIcon: Flame,
    },
    {
      title: "AVERAGE DURATION",
      value: "14,285",
      icon: <Activity size={20} className="text-[#38BDF8]" />,
      bgIcon: Activity,
    },
    {
      title: "ACTIVE USERS",
      value: "8,912",
      icon: <User size={20} className="text-[#A855F7]" />,
      bgIcon: User,
    }
  ];

  // Search filter
  const filteredExercises = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredExercises.length / itemsPerPage);
  
  // Ensure current page is valid when filtering reduces total pages
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredExercises.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(p => p + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1);
  };

  const handlePageClick = (num) => {
    setCurrentPage(num);
  };

  const handleDelete = (id) => {
    deleteExercise(id);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="min-h-screen p-8 bg-[#0A0D14] text-white">
      <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight mb-1">Exercise Library</h1>
            <p className="text-[#94A3B8] text-[13px] font-medium">Manage the global database of biomechanical movements, protocols, and performance metrics.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569]" />
              <input 
                type="text" 
                placeholder="Search exercises..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on new search
                }}
                className="bg-[#131B2F] border border-[#1E293B] rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-white outline-none focus:border-[#3B82F6] transition-colors w-[240px]"
              />
            </div>
            <button 
              onClick={() => navigate('/add-exercise')}
              className="flex items-center gap-2 bg-[#3B82F6] hover:bg-blue-600 transition-colors text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(59,130,246,0.3)] whitespace-nowrap"
            >
              Add New Exercise
              <PlusCircle size={18} />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, idx) => (
            <StatsCard key={idx} {...stat} />
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-[#131B2F] rounded-2xl border border-[#1E293B] p-4 mb-6 flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-[#94A3B8] text-[11px] font-bold uppercase tracking-widest px-2">
              <Filter size={16} />
              FILTERS
            </div>

            <div className="flex items-center gap-3">
              <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">BODY AREA</label>
              <div className="relative">
                <select className="bg-[#0A0D14] border border-[#1E293B] rounded-xl pl-4 pr-8 py-2 text-[12px] font-medium text-[#94A3B8] outline-none appearance-none cursor-pointer hover:border-[#38BDF8] transition-colors">
                  <option>Shoulder</option>
                  <option>Lower Back</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">PHASE</label>
              <div className="relative">
                <select className="bg-[#0A0D14] border border-[#1E293B] rounded-xl pl-4 pr-8 py-2 text-[12px] font-medium text-[#94A3B8] outline-none appearance-none cursor-pointer hover:border-[#38BDF8] transition-colors">
                  <option>Reset</option>
                  <option>Control</option>
                  <option>Integrate</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">EQUIPMENT</label>
              <div className="relative">
                <select className="bg-[#0A0D14] border border-[#1E293B] rounded-xl pl-4 pr-8 py-2 text-[12px] font-medium text-[#94A3B8] outline-none appearance-none cursor-pointer hover:border-[#38BDF8] transition-colors">
                  <option>Bench</option>
                  <option>Mini Band</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">STATUS</label>
              <div className="relative">
                <select className="bg-[#0A0D14] border border-[#1E293B] rounded-xl pl-4 pr-8 py-2 text-[12px] font-medium text-[#94A3B8] outline-none appearance-none cursor-pointer hover:border-[#38BDF8] transition-colors">
                  <option>Published</option>
                  <option>Drafted</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="text-[12px] font-medium text-[#64748B] px-2">
            Showing {filteredExercises.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, filteredExercises.length)} of {filteredExercises.length}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-[#131B2F] rounded-2xl border border-[#1E293B] overflow-hidden">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0A0D14]/50 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.1em] border-b border-[#1E293B]">
                  <th className="px-8 py-5 w-[140px]">EXERCISE ID</th>
                  <th className="px-6 py-5 w-[250px]">EXERCISE NAME</th>
                  <th className="px-6 py-5">BODY AREA</th>
                  <th className="px-6 py-5 w-[180px]">PHASE</th>
                  <th className="px-6 py-5 w-[140px]">EQUIPMENT</th>
                  <th className="px-6 py-5 w-[140px]">STATUS</th>
                  <th className="px-8 py-5 text-right w-[120px]">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {currentItems.length > 0 ? (
                  currentItems.map((exercise, index) => (
                    <tr key={exercise.id} className="hover:bg-[#1E293B]/40 transition-colors group">
                      <td className="px-8 py-6 text-[#64748B] text-[12px] font-medium">{exercise.id}</td>
                      <td className="px-6 py-6 text-[14px] font-bold text-white">{exercise.name}</td>
                      
                      {/* Body Area Pills */}
                      <td className="px-6 py-6">
                        <div className="flex flex-wrap gap-2 max-w-[280px]">
                          {exercise.bodyAreas.map((area, i) => (
                            <span key={i} className="bg-[#34D399] text-[#0A0D14] px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap">
                              {area}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Phase Pills */}
                      <td className="px-6 py-6">
                        <div className="flex flex-wrap gap-2">
                          {exercise.phases.map((phase, i) => (
                            <span key={i} className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider ${getPhaseStyle(phase)}`}>
                              {phase}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Equipment */}
                      <td className="px-6 py-6">
                        {exercise.equipment}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${exercise.status === 'Published' ? 'bg-[#34D399] shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-[#64748B]'}`}></div>
                          <span className={`text-[12px] font-bold ${exercise.status === 'Published' ? 'text-[#34D399]' : 'text-[#64748B]'}`}>
                            {exercise.status}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-3 text-[#64748B]">
                          <button className="p-2 hover:bg-[#1E293B] hover:text-white rounded-lg transition-colors">
                            <Edit3 size={18} strokeWidth={1.5} />
                          </button>
                          <button 
                            onClick={() => handleDelete(exercise.id)}
                            className="p-2 hover:bg-[#EF4444]/10 hover:text-[#EF4444] rounded-lg transition-colors"
                          >
                            <Trash2 size={18} strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-16 text-[#64748B] text-[14px]">
                      No exercises found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination */}
          <div className="px-8 py-6 flex items-center justify-between border-t border-[#1E293B]">
            <button 
              onClick={handlePrevPage}
              className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                currentPage === 1 ? 'text-[#475569] cursor-not-allowed' : 'text-[#64748B] hover:text-white'
              }`}
              disabled={currentPage === 1}
            >
              <ArrowLeft size={14} /> PREVIOUS
            </button>
            
            <div className="flex items-center gap-2">
              {getPageNumbers().map(num => (
                <button 
                  key={num}
                  onClick={() => handlePageClick(num)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-bold transition-colors ${
                    currentPage === num 
                      ? 'bg-[#38BDF8] text-[#0A0D14]' 
                      : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            
            <button 
              onClick={handleNextPage}
              className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                currentPage === totalPages || totalPages === 0 ? 'text-[#475569] cursor-not-allowed' : 'text-[#64748B] hover:text-white'
              }`}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              NEXT <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseLibrary;
