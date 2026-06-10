import React, { useState } from 'react';
import { MoreVertical, Filter, X } from 'lucide-react';

const RecentMoomentOnboarding = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('Latest');

  const initialData = [
    { id: 1, name: 'Savannah Nguyen', initials: 'NL', accountType: 'Personal', dateJoined: 'Oct 24, 2026', status: 'Active', timestamp: 1729728000000 },
    { id: 2, name: 'Annette Black', initials: 'NL', accountType: 'Personal', dateJoined: 'Oct 24, 2026', status: 'Active', timestamp: 1729814400000 },
    { id: 3, name: 'Robert Fox', initials: 'NL', accountType: 'Business', dateJoined: 'Oct 24, 2026', status: 'Offline', timestamp: 1729641600000 },
    { id: 4, name: 'Ronald Richards', initials: 'NL', accountType: 'Business', dateJoined: 'Oct 24, 2026', status: 'Offline', timestamp: 1729555200000 },
    { id: 5, name: 'Brooklyn Simmons', initials: 'NL', accountType: 'Business', dateJoined: 'Oct 24, 2026', status: 'Offline', timestamp: 1729468800000 },
    { id: 6, name: 'Devon Lane', initials: 'NL', accountType: 'Personal', dateJoined: 'Oct 24, 2026', status: 'Offline', timestamp: 1729382400000 },
    { id: 7, name: 'Jacob Jones', initials: 'NL', accountType: 'Personal', dateJoined: 'Oct 24, 2026', status: 'Active', timestamp: 1729296000000 },
  ];

  const filteredData = initialData
    .filter((item) => {
      if (statusFilter === 'All') return true;
      return item.status === statusFilter;
    })
    .sort((a, b) => {
      if (dateFilter === 'Latest') return b.timestamp - a.timestamp;
      return a.timestamp - b.timestamp;
    });

  const handleActionClick = (item) => {
    setSelectedRow(item);
    setIsActionOpen(true);
  };

  return (
    <div className="bg-[#1E1E2D] rounded-[24px] shadow-sm border border-gray-800 overflow-hidden relative">
      {/* Header */}
      <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-[#1A1A4B] dark:text-white transition-colors">Recent Mooment Onboarding</h2>
          <p className="text-[14px] text-gray-400 mt-1">Real-time people onboarding to your application</p>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-100 dark:border-gray-800 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-colors"
          >
            <Filter size={18} />
            Filter
          </button>

          <button className="text-[14px] font-bold text-[#6D67E4] hover:text-[#4F46E5] transition-colors">
            View All
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-50 dark:border-gray-800">
              <th className="px-8 py-4 text-[12px] font-bold text-gray-300 uppercase tracking-widest">NAME</th>

              <th className="px-8 py-4 text-[12px] font-bold text-gray-300 uppercase tracking-widest">ACCOUNT TYPE</th>
              <th className="px-8 py-4 text-[12px] font-bold text-gray-300 uppercase tracking-widest">DATE JOINED</th>
              <th className="px-8 py-4 text-[12px] font-bold text-gray-300 uppercase tracking-widest">ACCOUNT STATUS</th>
              <th className="px-8 py-4 text-[12px] font-bold text-gray-300 uppercase tracking-widest">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/30 dark:hover:bg-[#2D2D3F]/30 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-[#F8F9FD] dark:bg-[#2D2D3F] flex items-center justify-center text-[#1A1A4B] dark:text-white font-bold text-[12px]">
                      {item.initials}
                    </div>
                    <span className="font-semibold text-[#5C5C8A] dark:text-gray-200 text-[15px] transition-colors">{item.name}</span>
                  </div>
                </td>

                <td className="px-8 py-5">
                  <span className="text-gray-400 font-medium text-[15px]">{item.accountType}</span>
                </td>
                <td className="px-8 py-5">
                  <span className="text-gray-400 font-medium text-[15px]">{item.dateJoined}</span>
                </td>
                <td className="px-8 py-5">
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    item.status === 'Active' 
                      ? 'bg-[#10B981] text-white shadow-sm shadow-[#10B981]/20' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-500'
                  }`}>
                    {item.status}
                  </span>
                </td>

                <td className="px-8 py-5 text-center">
                  <button 
                    onClick={() => handleActionClick(item)}
                    className="p-1 rounded-lg text-gray-300 hover:text-gray-500 transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Modal (More Options) */}
      {isActionOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
          <div className="bg-[#1E1E2D] rounded-[32px] w-full max-w-[400px] p-12 shadow-2xl animate-in fade-in zoom-in duration-300 relative">
            <button 
              onClick={() => setIsActionOpen(false)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] rounded-full transition-colors"
            >
              <X size={20} className="text-gray-300" />
            </button>
            <div className="flex flex-col gap-8">
              <button className="text-[32px] font-bold text-[#4B4B4B] dark:text-gray-300 text-left hover:text-black dark:hover:text-white transition-colors">

                View
              </button>
              <button className="text-[32px] font-bold text-[#4B4B4B] dark:text-gray-300 text-left hover:text-black dark:hover:text-white transition-colors">
                Edit
              </button>
              <button className="text-[32px] font-bold text-[#C5221F] dark:text-red-400 text-left hover:text-red-700 dark:hover:text-red-300 transition-colors">
                Delete
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
          <div className="bg-[#1E1E2D] rounded-[32px] w-full max-w-[480px] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[22px] font-bold text-[#1A1A4B] dark:text-white transition-colors">Select base on your choice</h3>
              <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] rounded-full transition-colors">
                <X size={22} className="text-gray-300" />
              </button>
            </div>

            <div className="mb-8">
              <h4 className="text-[11px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-4">STATUS</h4>
              <div className="flex gap-3">
                {['Active', 'Offline'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(statusFilter === status ? 'All' : status)}
                    className={`px-7 py-3 rounded-2xl border text-[14px] font-bold transition-all ${
                      statusFilter === status
                        ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-black border-[#1A1A1A] dark:border-white'
                        : 'bg-white dark:bg-[#1E1E2D] text-gray-400 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                  >
                    {status}
                  </button>

                ))}
              </div>
            </div>
            <div className="mb-10">
              <h4 className="text-[11px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-4">DATE</h4>
              <div className="flex gap-3">
                {['Latest', 'Oldest'].map((date) => (
                  <button
                    key={date}
                    onClick={() => setDateFilter(date)}
                    className={`px-7 py-3 rounded-2xl border text-[14px] font-bold transition-all ${
                      dateFilter === date
                        ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-black border-[#1A1A1A] dark:border-white'
                        : 'bg-white dark:bg-[#1E1E2D] text-gray-400 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                  >
                    {date}
                  </button>

                ))}
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="px-8 py-4 bg-[#F8F9FD] dark:bg-[#2D2D3F] text-[#5C5C8A] dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-100 dark:hover:bg-[#3D3D4F] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="px-8 py-4 bg-[#1A1A1A] dark:bg-indigo-600 text-white rounded-2xl font-bold hover:bg-black dark:hover:bg-indigo-700 transition-all shadow-xl shadow-black/10"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default RecentMoomentOnboarding;
