import React from 'react';

const RevenueGrowth = () => {
  const chartData = [
    { val: 20, active: false },
    { val: 25, active: false },
    { val: 18, active: false },
    { val: 30, active: false },
    { val: 28, active: false },
    { val: 32, active: false },
    { val: 26, active: false },
    { val: 40, active: false },
    { val: 35, active: false },
    { val: 22, active: false },
    { val: 45, active: false },
    { val: 75, active: true }
  ];

  return (
    <div className="bg-[#131B2F] rounded-2xl p-6 border border-[#1E293B] shadow-sm mb-6 flex flex-col">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-white text-xl font-medium">Revenue Growth</h2>
        <div className="flex items-center gap-4 text-[10px] font-bold text-[#94A3B8]">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#8B5CF6]"></div>
            MONTHLY
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#2DD4BF]"></div>
            YEARLY
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 flex items-end justify-between px-2 gap-2 sm:gap-4 mt-8 h-[220px]">
        {chartData.map((data, idx) => (
          <div key={idx} className="flex flex-col items-center w-full h-[160px] justify-end group">
            {/* Bar */}
            <div 
              className={`w-full rounded-sm transition-all duration-300 ${
                data.active 
                  ? 'bg-gradient-to-t from-[#2DD4BF] via-[#C084FC] to-[#FDF4FF] shadow-[0_0_30px_rgba(232,121,249,0.5)]' 
                  : 'bg-gradient-to-t from-[#164E63] to-[#5B21B6] opacity-70 group-hover:opacity-100'
              }`}
              style={{ height: `${data.val}%`, minHeight: '10%' }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueGrowth;
