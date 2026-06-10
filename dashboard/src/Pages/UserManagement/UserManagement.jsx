import React, { useState } from 'react';
import { Search } from 'lucide-react';
import UserManagement from '../../Components/UserManagement/UserManagement';

const UserManagementPage = () => {
  const [globalSearch, setGlobalSearch] = useState('');

  return (
    <div className="min-h-screen p-8 bg-[#0A0D14]">
      <div className="mx-auto max-w-[1600px]">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-white mb-2">User Management</h1>
            <p className="text-[14px] text-[#94A3B8]">
              Manage clients, monitor protocols, and track performance metrics.
            </p>
          </div>
          <div className="relative w-full max-w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#131B2F] border border-[#1E293B] rounded-xl text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-[#22D3EE]/20 transition-all outline-none"
            />
          </div>
        </div>

        <UserManagement globalSearch={globalSearch} />
      </div>
    </div>
  );
};

export default UserManagementPage;
