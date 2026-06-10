import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Filter, Calendar, ChevronDown } from 'lucide-react';

const UserManagement = ({ globalSearch = '' }) => {
  const navigate = useNavigate();
  // Filter states
  const [nameFilter, setNameFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const userData = useMemo(() => [
    { id: 1, name: 'Olivia Katherine Montgo', dob: '14 May 1990', email: 'olivia.katherine.montgomery', joinDate: '12 Jan 2026', currentProtocol: 'The Lower Back Ache Full...', total: 4, status: 'Active', sessions: 42 },
    { id: 2, name: 'Olivia Katherine Mont...', dob: '22 Aug 1992', email: 'olivia.katherine.montgomery', joinDate: '12 Jan 2026', currentProtocol: 'The Lower Back Ache Full...', total: 4, status: 'Expiring Soon', sessions: 42 },
    { id: 3, name: 'Olivia Katherine Mont...', dob: '05 Nov 1988', email: 'olivia.katherine.montgomery', joinDate: '12 Jan 2026', currentProtocol: 'The Lower Back Ache Full...', total: 4, status: 'Expired', sessions: 42 },
    { id: 4, name: 'Ethan Alexander Broo...', dob: '30 Jan 1995', email: 'ethan.alexander.brookshire...', joinDate: '18 Jan 2026', currentProtocol: 'The QL Deep Reset', total: 2, status: 'Expiring Soon', sessions: 36 },
    { id: 5, name: 'Ethan Alexander Broo...', dob: '12 Mar 1993', email: 'ethan.alexander.brookshire...', joinDate: '18 Jan 2026', currentProtocol: 'The QL Deep Reset', total: 2, status: 'Expiring Soon', sessions: 38 },
    { id: 6, name: 'Ethan Alexander Broo...', dob: '19 Jul 1991', email: 'ethan.alexander.brookshire...', joinDate: '18 Jan 2026', currentProtocol: 'The QL Deep Reset', total: 2, status: 'Expired', sessions: 36 },
    { id: 7, name: 'Sophia Elizabeth Harri...', dob: '27 Sep 1989', email: 'sophia.elizabeth.harrington...', joinDate: '25 Jan 2026', currentProtocol: 'The Hip Flexor Strength F...', total: 4, status: 'Active', sessions: 42 },
    { id: 8, name: 'Sophia Elizabeth Harri...', dob: '03 Feb 1994', email: 'sophia.elizabeth.harrington...', joinDate: '25 Jan 2026', currentProtocol: 'The Hip Flexor Strength F...', total: 4, status: 'Active', sessions: 42 },
    { id: 9, name: 'Liam Jonathan Wellin...', dob: '11 Oct 1996', email: 'liam.jonathan.wellington@ex', joinDate: '25 Jan 2026', currentProtocol: 'The Hip Flexor Strength F...', total: 4, status: 'Expired', sessions: 42 },
    { id: 10, name: 'Liam Jonathan Wellin...', dob: '08 Dec 1990', email: 'liam.jonathan.wellington@ex', joinDate: '25 Jan 2026', currentProtocol: 'The Hip Flexor Strength F...', total: 4, status: 'Active', sessions: 42 },
    { id: 11, name: 'Test User', dob: '01 Jan 2000', email: 'test@example.com', joinDate: '26 Jan 2026', currentProtocol: 'Test Protocol', total: 1, status: 'Active', sessions: 10 },
  ], []);

  // Filter and Paginate logic
  const filteredData = useMemo(() => {
    return userData.filter(user => {
      // Global search (top right)
      const matchesGlobal = globalSearch === '' || 
        user.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(globalSearch.toLowerCase());
        
      // Local name/email filter
      const matchesName = nameFilter === '' || 
        user.name.toLowerCase().includes(nameFilter.toLowerCase()) ||
        user.email.toLowerCase().includes(nameFilter.toLowerCase());
        
      // Status filter
      const matchesStatus = statusFilter === '' || user.status === statusFilter;
      
      return matchesGlobal && matchesName && matchesStatus;
    });
  }, [globalSearch, nameFilter, statusFilter, userData]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredData.slice(indexOfFirstItem, indexOfLastItem);
  }, [currentPage, filteredData]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'text-[#10B981]';
      case 'Expiring Soon': return 'text-[#F59E0B]';
      case 'Expired': return 'text-[#EF4444]';
      default: return 'text-[#94A3B8]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="bg-[#131B2F] border border-[#1E293B] rounded-2xl p-5 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <Filter size={18} />
            <span className="text-[12px] font-bold uppercase tracking-widest">Filters</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Email ID/Name</span>
            <input
              type="text"
              placeholder="olivia.katherine.montgomery"
              value={nameFilter}
              onChange={(e) => {
                setNameFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#0A0D14] border border-[#1E293B] text-sm text-[#94A3B8] placeholder-[#94A3B8] rounded-xl px-4 py-2 w-[240px] focus:outline-none focus:ring-1 focus:ring-[#22D3EE]/30"
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Join Date</span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="10/14/25" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-[#0A0D14] border border-[#1E293B] text-sm text-[#94A3B8] placeholder-[#94A3B8] rounded-xl pl-4 pr-10 py-2 w-[120px] focus:outline-none focus:ring-1 focus:ring-[#22D3EE]/30" 
                />
                <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              </div>
              <span className="text-[#94A3B8] text-[12px]">to</span>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="10/14/25" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-[#0A0D14] border border-[#1E293B] text-sm text-[#94A3B8] placeholder-[#94A3B8] rounded-xl pl-4 pr-10 py-2 w-[120px] focus:outline-none focus:ring-1 focus:ring-[#22D3EE]/30" 
                />
                <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Status</span>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-[#0A0D14] border border-[#1E293B] text-sm text-[#94A3B8] rounded-xl pl-4 pr-10 py-2 focus:outline-none focus:ring-1 focus:ring-[#22D3EE]/30"
              >
                <option value="">Expiring Soon</option>
                <option value="Active">Active</option>
                <option value="Expiring Soon">Expiring Soon</option>
                <option value="Expired">Expired</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="text-[12px] text-[#94A3B8] font-medium tracking-wide">
          Showing {filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredData.length)} of 9,548
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#131B2F] border border-[#1E293B] rounded-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#1E293B]">
                <th className="px-8 py-6 text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] whitespace-nowrap">Name</th>
                <th className="px-8 py-6 text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] whitespace-nowrap">Date of Birth</th>
                <th className="px-8 py-6 text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] whitespace-nowrap">Email</th>
                <th className="px-8 py-6 text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] whitespace-nowrap">Join Date</th>
                <th className="px-8 py-6 text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] whitespace-nowrap">Current Protocol</th>
                <th className="px-8 py-6 text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] whitespace-nowrap">Total</th>
                <th className="px-8 py-6 text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] whitespace-nowrap">Status</th>
                <th className="px-8 py-6 text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] whitespace-nowrap">Sessions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/50">
              {currentItems.map((user) => (
                <tr key={user.id} className="hover:bg-[#1E293B]/50 transition-colors">
                  <td className="px-8 py-5">
                    <span className="font-bold text-white text-[13px]">{user.name}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[#94A3B8] text-[13px]">{user.dob}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[#94A3B8] text-[13px]">{user.email}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[#94A3B8] text-[13px]">{user.joinDate}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[#94A3B8] text-[13px]">{user.currentProtocol}</span>
                  </td>
                  <td className="px-8 py-5 text-center sm:text-left">
                    <span className="font-bold text-white text-[13px] ml-1">{user.total}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className={`flex items-center gap-2 ${getStatusColor(user.status)} text-[11px] font-bold uppercase tracking-widest`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                      {user.status}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-bold text-[#10B981] text-[13px] ml-4">{user.sessions}</span>
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-8 py-10 text-center text-[#94A3B8] font-medium text-sm">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="px-8 py-5 flex items-center justify-between border-t border-[#1E293B]">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2 text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <div className="flex items-center gap-3">
            {[...Array(Math.min(totalPages, 3))].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs transition-all ${
                  currentPage === i + 1
                    ? 'bg-[#22D3EE] text-[#0A0D14]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
                }`}
              >
                {i + 1}
              </button>
            ))}
            {totalPages > 3 && <span className="text-[#94A3B8] text-xs font-bold px-1">..</span>}
            {totalPages > 3 && (
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-all"
                onClick={() => handlePageChange(955)}
              >
                955
              </button>
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="flex items-center gap-2 text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest hover:text-white disabled:opacity-30 transition-colors"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
