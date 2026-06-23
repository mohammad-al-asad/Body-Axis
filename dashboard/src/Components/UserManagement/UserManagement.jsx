import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Filter, Calendar, ChevronDown } from 'lucide-react';
import { adminApi } from '../../services/adminApi';

const UserManagement = ({ globalSearch = '' }) => {
  const [nameFilter, setNameFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const itemsPerPage = 10;
  const totalPages = pagination.total_pages || 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [globalSearch]);

  useEffect(() => {
    let ignore = false;

    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.getUsers({
          page: currentPage,
          page_size: itemsPerPage,
          search: nameFilter.trim(),
          global_search: globalSearch.trim(),
          start_date: startDate,
          end_date: endDate,
          status: statusFilter,
        });

        if (ignore) return;

        setUsers(data.items || []);
        setPagination({
          total: data.total || 0,
          page: data.page || 1,
          page_size: data.page_size || itemsPerPage,
          total_pages: data.total_pages || 0,
        });

        if (data.page && data.page !== currentPage) {
          setCurrentPage(data.page);
        }
      } catch (fetchError) {
        if (ignore) return;
        setUsers([]);
        setPagination({
          total: 0,
          page: 1,
          page_size: itemsPerPage,
          total_pages: 0,
        });
        setError(fetchError.message || 'Failed to load users.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      ignore = true;
    };
  }, [currentPage, endDate, globalSearch, nameFilter, startDate, statusFilter]);

  const visiblePages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    return Array.from({ length: 5 }, (_, index) => start + index);
  }, [currentPage, totalPages]);

  const showingStart = pagination.total
    ? (pagination.page - 1) * pagination.page_size + 1
    : 0;
  const showingEnd = pagination.total
    ? showingStart + users.length - 1
    : 0;

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
      case 'No Plan': return 'text-[#94A3B8]';
      default: return 'text-[#94A3B8]';
    }
  };

  const formatDate = (value) => {
    if (!value) return 'Not provided';

    const date =
      typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(
            Number(value.slice(0, 4)),
            Number(value.slice(5, 7)) - 1,
            Number(value.slice(8, 10)),
          )
        : new Date(value);

    if (Number.isNaN(date.getTime())) return 'Not provided';

    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const truncate = (value, max = 30) => {
    const text = value || 'Not provided';
    return text.length > max ? `${text.slice(0, max - 3)}...` : text;
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
              placeholder="Search name or email"
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
                  type="date" 
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-[#0A0D14] border border-[#1E293B] text-sm text-[#94A3B8] placeholder-[#94A3B8] rounded-xl pl-4 pr-10 py-2 w-[120px] focus:outline-none focus:ring-1 focus:ring-[#22D3EE]/30" 
                />
                <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              </div>
              <span className="text-[#94A3B8] text-[12px]">to</span>
              <div className="relative">
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
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
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Expiring Soon">Expiring Soon</option>
                <option value="Expired">Expired</option>
                <option value="No Plan">No Plan</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="text-[12px] text-[#94A3B8] font-medium tracking-wide">
          {loading
            ? 'Loading users...'
            : `Showing ${showingStart}-${showingEnd} of ${pagination.total}`}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-[#7F1D1D] bg-[#2A0F18] px-5 py-4 text-sm font-semibold text-[#FCA5A5]">
          {error}
        </div>
      )}

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
                <th className="px-8 py-6 text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] whitespace-nowrap">Current Plan</th>
                <th className="px-8 py-6 text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] whitespace-nowrap">Total</th>
                <th className="px-8 py-6 text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] whitespace-nowrap">Status</th>
                <th className="px-8 py-6 text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] whitespace-nowrap">Sessions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[#1E293B]/50 transition-colors">
                  <td className="px-8 py-5">
                    <span className="font-bold text-white text-[13px]" title={user.name}>
                      {truncate(user.name, 28)}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[#94A3B8] text-[13px]">
                      {formatDate(user.date_of_birth)}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[#94A3B8] text-[13px]" title={user.email}>
                      {truncate(user.email, 34)}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[#94A3B8] text-[13px]">
                      {formatDate(user.join_date)}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[#94A3B8] text-[13px]" title={user.current_plan}>
                      {truncate(user.current_plan, 28)}
                    </span>
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
              {!users.length && (
                <tr>
                  <td colSpan="8" className="px-8 py-10 text-center text-[#94A3B8] font-medium text-sm">
                    {loading ? 'Loading users...' : 'No users found matching your filters.'}
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
            disabled={currentPage === 1 || loading}
            className="flex items-center gap-2 text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <div className="flex items-center gap-3">
            {visiblePages[0] > 1 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-all"
                >
                  1
                </button>
                <span className="text-[#94A3B8] text-xs font-bold px-1">...</span>
              </>
            )}

            {visiblePages.map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={loading}
                className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs transition-all ${
                  currentPage === page
                    ? 'bg-[#22D3EE] text-[#0A0D14]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
                }`}
              >
                {page}
              </button>
            ))}

            {visiblePages[visiblePages.length - 1] < totalPages && (
              <>
                <span className="text-[#94A3B8] text-xs font-bold px-1">...</span>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={loading}
                  className="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-all"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0 || loading}
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
