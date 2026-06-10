import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Filter, Trash2, ArrowLeft, ArrowRight, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { VideoContext } from '../../context/VideoContext';
// Dynamic state now managed by VideoContext

const VideoManager = () => {
  const { videos, deleteVideo } = useContext(VideoContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState(new Date('2025-10-30T12:00:00'));
  const [showCalendar, setShowCalendar] = useState(false);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  // Format date helper
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  // Search filter
  const filteredVideos = videos.filter(video => 
    video.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVideos.slice(indexOfFirstItem, indexOfLastItem);

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
    deleteVideo(id);
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
            <h1 className="text-[28px] font-bold tracking-tight mb-1">Video Manager</h1>
            <p className="text-[#94A3B8] text-[13px] font-medium">Review and manage biomechanical movement assets.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569]" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on new search
                }}
                className="bg-[#131B2F] border border-[#1E293B] rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-white outline-none focus:border-[#3B82F6] transition-colors w-[240px]"
              />
            </div>
            <button 
              onClick={() => navigate('/upload-video')}
              className="flex items-center gap-2 bg-[#3B82F6] hover:bg-blue-600 transition-colors text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(59,130,246,0.3)] whitespace-nowrap"
            >
              Upload New Video
              <PlusCircle size={18} />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#131B2F] rounded-2xl border border-[#1E293B] p-4 mb-6 flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-[#94A3B8] text-[11px] font-bold uppercase tracking-widest px-2">
              <Filter size={16} />
              FILTERS
            </div>

            <div className="flex items-center gap-3">
              <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">EXERCISE ID/NAME</label>
              <div className="bg-[#0A0D14] border border-[#1E293B] rounded-xl px-4 py-2 w-[220px] text-[12px] font-medium text-[#94A3B8] truncate">
                Long-Lever Hamstring Bridge
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">UPLOAD DATE</label>
              <div className="relative">
                <div className="relative" onClick={() => setShowCalendar(!showCalendar)}>
                  <input 
                    type="text"
                    value={formatDate(filterDate)}
                    readOnly
                    className="bg-[#0A0D14] border border-[#1E293B] rounded-xl pl-4 pr-10 py-2 text-[12px] font-medium text-[#94A3B8] outline-none w-[140px] cursor-pointer"
                  />
                  <CalendarIcon size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#475569] pointer-events-none" />
                </div>
                {showCalendar && (
                  <div className="absolute top-[120%] left-0 z-[100] shadow-2xl rounded-2xl overflow-hidden border border-[#1E293B] animate-in fade-in slide-in-from-top-2 duration-200">
                    <Calendar
                      onChange={(date) => {
                        setFilterDate(date);
                        setShowCalendar(false);
                      }}
                      value={filterDate}
                      className="premium-calendar !bg-[#131B2F] !text-white !border-none"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">STATUS</label>
              <div className="relative">
                <select className="bg-[#0A0D14] border border-[#1E293B] rounded-xl pl-4 pr-8 py-2 text-[12px] font-medium text-[#94A3B8] outline-none appearance-none cursor-pointer hover:border-[#38BDF8] transition-colors">
                  <option>Published</option>
                  <option>Processing</option>
                  <option>Error</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="text-[12px] font-medium text-[#64748B] px-2">
            Showing {filteredVideos.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, filteredVideos.length)} of {filteredVideos.length}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-[#131B2F] rounded-2xl border border-[#1E293B] overflow-hidden">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0A0D14]/50 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.1em] border-b border-[#1E293B]">
                  <th className="px-8 py-5 w-[160px]">EXERCISE ID</th>
                  <th className="px-6 py-5 w-[300px]">EXERCISE NAME</th>
                  <th className="px-6 py-5 w-[160px]">FILE SIZE</th>
                  <th className="px-6 py-5 w-[160px]">UPLOAD DATE</th>
                  <th className="px-6 py-5 w-[160px]">STATUS</th>
                  <th className="px-8 py-5 text-right w-[120px]">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {currentItems.length > 0 ? (
                  currentItems.map((video) => (
                    <tr key={video.id} className="hover:bg-[#1E293B]/40 transition-colors group">
                      <td className="px-8 py-6 text-[#64748B] text-[13px] font-medium">{video.id}</td>
                      <td className="px-6 py-6 text-[14px] font-bold text-white">{video.name}</td>
                      <td className="px-6 py-6 text-[#64748B] text-[13px]">{video.fileSize}</td>
                      <td className="px-6 py-6 text-[#64748B] text-[13px]">{video.uploadDate}</td>
                      
                      {/* Status */}
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            video.status === 'Uploaded' ? 'bg-[#34D399] shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 
                            video.status === 'Processing' ? 'bg-[#EAB308] shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 
                            'bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                          }`}></div>
                          <span className={`text-[12px] font-bold ${
                            video.status === 'Uploaded' ? 'text-[#34D399]' : 
                            video.status === 'Processing' ? 'text-[#EAB308]' : 
                            'text-[#EF4444]'
                          }`}>
                            {video.status}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end text-[#64748B]">
                          <button 
                            onClick={() => handleDelete(video.id)}
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
                    <td colSpan="6" className="text-center py-16 text-[#64748B] text-[14px]">
                      No videos found matching your search.
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

export default VideoManager;
