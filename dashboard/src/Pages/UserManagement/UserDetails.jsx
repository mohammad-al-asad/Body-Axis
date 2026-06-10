import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, Download, ChevronDown, MoreHorizontal, MapPin, Calendar, ShoppingBag } from 'lucide-react';

const UserDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Profile');
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);

  const user = {
    name: 'Steve Hard',
    username: '@username',
    email: 'john@gmail.com',
    gender: 'Male',
    age: '21',
    address: '43, John hopkins road, NYC',
    joiningDate: 'Jan 25 , 2024',
    deletion: '20 days left',
    bio: "Meet Alex Johnson, a passionate traveler and tech enthusiast from the USA. With a knack for coding and a love for exploring new cultures, Alex has visited over 15 countries and enjoys sharing stories from his adventures. When he's not working on innovative software solutions, you can find him hiking in the mountains or trying out local cuisines.",
    avatar: 'https://i.pravatar.cc/150?u=steve',
    status: 'Active',
    accountType: 'Business Account'
  };

  const renderProfileTab = () => (
    <div className="space-y-12 duration-500 animate-in fade-in">
      {/* Row 1 & 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
        <div className="pb-4 border-b border-[#525252] dark:border-gray-800 transition-colors">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Email</p>
          <p className="text-[15px] font-medium text-[#1A1A4B] dark:text-white transition-colors">{user.email}</p>
        </div>
        <div className="pb-4 border-b border-[#525252] dark:border-gray-800 transition-colors">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Username</p>
          <p className="text-[15px] font-medium text-[#1A1A4B] dark:text-white transition-colors">{user.username}</p>
        </div>
        <div className="pb-4 border-b border-[#525252] dark:border-gray-800 transition-colors">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Gender</p>
          <p className="text-[15px] font-medium text-[#1A1A4B] dark:text-white transition-colors">{user.gender}</p>
        </div>
        <div className="pb-4 border-b border-[#525252] dark:border-gray-800 transition-colors">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Age</p>
          <p className="text-[15px] font-medium text-[#1A1A4B] dark:text-white transition-colors">{user.age}</p>
        </div>
      </div>

      {/* Row 3 - Full Width Address */}
      <div className="pb-4 border-b border-[#525252] dark:border-gray-800 transition-colors">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Address</p>
        <p className="text-[15px] font-medium text-[#1A1A4B] dark:text-white transition-colors">{user.address}</p>
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
        <div className="pb-4 border-b border-[#525252] dark:border-gray-800 transition-colors">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Joining Date</p>
          <p className="text-[15px] font-medium text-[#1A1A4B] dark:text-white transition-colors">{user.joiningDate}</p>
        </div>
        <div className="pb-4 border-b border-[#525252] dark:border-gray-800 transition-colors">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Deletion (30 days timeline)</p>
          <p className="text-[15px] font-bold text-red-500">{user.deletion}</p>
        </div>
      </div>

      {/* Row 5 - Bio */}
      <div className="pb-4 border-b border-[#525252] dark:border-gray-800 transition-colors">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Bio</p>
        <p className="text-[14px] leading-relaxed text-[#1A1A4B] dark:text-gray-300 font-medium transition-colors">{user.bio}</p>
      </div>

      {/* Documents Section */}
      <div className="pt-4">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-8">DOCUMENT OF THE BUSINESS</p>
        <div className="w-[110px] h-[130px] bg-white dark:bg-[#1E1E2D] rounded-[16px] flex flex-col items-center justify-center gap-3 border border-gray-200 dark:border-gray-800 relative group cursor-pointer hover:shadow-md transition-all shadow-sm">
          <div className="flex flex-col items-center">
            <div className="w-10 h-12 border-2 border-gray-800 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-4 bg-gray-800 flex items-center justify-center">
                <span className="text-[7px] font-black text-white">PDF</span>
              </div>
              <div className="pt-4 space-y-1">
                <div className="w-6 h-0.5 bg-gray-200"></div>
                <div className="w-6 h-0.5 bg-gray-200"></div>
                <div className="w-4 h-0.5 bg-gray-200"></div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 absolute bottom-3">
            <p className="text-[9px] font-bold text-gray-500">Filename.pdf</p>
            <Download size={11} className="text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderEventTab = () => (
    <div className="grid grid-cols-1 gap-8 duration-500 lg:grid-cols-3 animate-in fade-in">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white dark:bg-[#1E1E2D] rounded-[22px] overflow-hidden shadow-sm border border-gray-50 dark:border-gray-800 group hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <img src="https://i.pravatar.cc/150?u=djkoko" alt="Host" className="object-cover w-10 h-10 rounded-full" />
              <div>
                <p className="text-sm font-bold text-[#1A1A4B] dark:text-white transition-colors">
                  Dj Koko <span className="font-medium text-gray-400">hosting</span> Rooftop Session Vol.4 <span className="font-medium text-gray-400">event</span>
                </p>
                <p className="text-[11px] text-gray-300 font-medium">{i === 1 ? '3 min ago' : '2 min ago'} • 🌐</p>
              </div>
            </div>
            <button className="text-gray-300 hover:text-gray-600 transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>

          <div className="px-6 pb-6">
            <div className="relative h-[280px] rounded-[24px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070&auto=format&fit=crop"
                alt="Event"
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-[#10B981] rounded-full">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live Now</span>
              </div>
              <div className="absolute flex items-end justify-between bottom-6 left-6 right-6">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">Music Party</span>
                    <span className="px-3 py-1 bg-[#FF4D4D]/20 backdrop-blur-md border border-[#FF4D4D]/30 text-[#FF4D4D] text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1">
                      <div className="w-1 h-1 bg-[#FF4D4D] rounded-full"></div> Busy
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Rooftop Session Vol.4</h3>
                    <div className="flex items-center gap-4 mt-1 text-white/70 text-[11px] font-medium">
                      <span className="flex items-center gap-1"><Calendar size={12} /> Sat, Sep 9 • 9:00 - 4:00 PM</span>
                      <span className="flex items-center gap-1"><MapPin size={12} /> 0.3mi</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/event-details/${i}`)}
                  className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 text-white text-[11px] font-bold rounded-xl hover:bg-white hover:text-[#1A1A4B] transition-all"
                >
                  View Details
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(j => (
                    <img key={j} src={`https://i.pravatar.cc/100?u=${j}`} className="object-cover w-6 h-6 border-2 border-white rounded-full" />
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 font-bold">41 going</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCommerceTab = () => (
    <div className="grid grid-cols-1 gap-10 duration-500 lg:grid-cols-2 animate-in fade-in">
      {[1, 2].map((i) => (
        <div key={i} className="space-y-6 group">
          <div className="relative aspect-square rounded-[32px] overflow-hidden bg-white dark:bg-[#1E1E2D] shadow-sm border border-gray-50 dark:border-gray-800 group-hover:shadow-xl transition-all duration-500">
            <img
              src="https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1974&auto=format&fit=crop"
              alt="Product"
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute top-4 right-4 px-2 py-1 bg-black/20 backdrop-blur-md rounded-lg text-white text-[10px] font-bold">
              1/3
            </div>
          </div>

          <div className="px-2 space-y-4">
            <div className="flex items-start justify-between">
              <span className="px-3 py-1 bg-gray-200 dark:bg-[#2D2D3F] text-gray-500 dark:text-gray-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                Skin Care
              </span>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#1E1E2D] border border-gray-100 dark:border-gray-800 rounded-lg text-gray-500 dark:text-gray-400 text-[11px] font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-all">
                Action <ChevronDown size={14} />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-[22px] font-bold text-[#1A1A4B] dark:text-white transition-colors">Medusa Skin Whitening Cream</h3>
              <p className="text-[14px] leading-relaxed text-gray-400 font-medium">
                Premium skin brightening cream with Arbutin, Niacinamide & Hyaluronic Acid. For all skin types. Present QR code at event to collect.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <p className="text-[28px] font-bold text-[#1A1A4B] dark:text-white transition-colors">£28</p>
              <p className="text-[18px] font-medium text-gray-300 line-through">£32</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FD] dark:bg-[#13131F] p-8 transition-colors duration-300">
      <div className="mx-auto max-w-[1400px]">
        {/* Profile Card Section */}
        <div className="flex flex-col justify-between gap-8 mb-12 md:flex-row md:items-center">
          <div className="flex items-center gap-8">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="object-cover w-20 h-20 border-2 border-white rounded-full shadow-md"
              />
              <div className="absolute bottom-0 right-0 bg-[#3B82F6] p-1 rounded-full border-2 border-white shadow-sm">
                <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#10B981] text-white text-[9px] font-black rounded-lg uppercase tracking-widest">
                  {user.status}
                </span>
                <span className="px-3 py-1 bg-[#E2E8F0] dark:bg-[#1E1E2D] text-[#64748B] text-[9px] font-black rounded-lg uppercase tracking-widest">
                  {user.accountType}
                </span>
              </div>
              <h2 className="text-[28px] font-bold text-[#1A1A4B] dark:text-white transition-colors leading-tight tracking-tight">{user.name}</h2>
              <p className="text-sm font-medium text-gray-400 leading-tight">{user.username}</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsVerifyOpen(!isVerifyOpen)}
              className="flex items-center gap-3 px-5 py-2 bg-white dark:bg-[#1E1E2D] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-400 text-xs font-bold hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-all shadow-sm"
            >
              Select Verified or not
              <ChevronDown size={14} className={`transition-transform ${isVerifyOpen ? 'rotate-180' : ''}`} />
            </button>
            {isVerifyOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1E1E2D] border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-30 py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                <button className="w-full px-4 py-2 text-left text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-colors">Verified</button>
                <button className="w-full px-4 py-2 text-left text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-colors">Disproved</button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-10 border-b border-gray-200 dark:border-gray-800">
          <div className="flex gap-8">
            {['Profile', 'Event', 'Commerce'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-[14px] font-bold transition-all relative ${activeTab === tab ? 'text-black dark:text-white' : 'text-gray-300 hover:text-gray-500 dark:hover:text-gray-400'
                  }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black dark:bg-white rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="mt-8">
          {activeTab === 'Profile' && renderProfileTab()}
          {activeTab === 'Event' && renderEventTab()}
          {activeTab === 'Commerce' && renderCommerceTab()}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
