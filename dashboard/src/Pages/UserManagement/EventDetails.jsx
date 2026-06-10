import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, ChevronDown } from 'lucide-react';

const EventDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isActionOpen, setIsActionOpen] = React.useState(false);

  const event = {
    title: 'Rooftop Session Vol.4',
    about: 'An unforgettable rooftop experience featuring the best in house and techno. Doors open at 8pm. Dress code smart casual.',
    venue: 'The Rooftop Lounge',
    address: '123 Main Street, New York, NY 1001',
    banner: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070&auto=format&fit=crop',
    position: [40.7128, -74.0060],
    locationNotes: [
      'Use back entrance after 10PM',
      'Parking available at adjacent garage - $20 flat rate',
      'Nearest subway 7th Ave Station'
    ],
    additionalInfo: [
      'Use back entrance after 10PM',
      'Parking available at adjacent garage - $20 flat rate',
      'Nearest subway 7th Ave Station'
    ]
  };

  return (
    <div className="min-h-screen bg-[#13131F] p-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="w-full h-[320px] rounded-[32px] overflow-hidden mb-10 shadow-lg">
          <img src={event.banner} alt="Event Banner" className="object-cover w-full h-full" />
        </div>

        <div className="flex items-start justify-between mb-6">
          <h2 className="text-lg font-bold text-white transition-colors">About</h2>
          <div className="relative">
            <button
              onClick={() => setIsActionOpen(!isActionOpen)}
              className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-gray-300 transition-all bg-[#1E1E2D] border border-gray-800 shadow-sm rounded-lg hover:bg-[#2D2D3F]"
            >
              Action <ChevronDown size={14} className={`transition-transform ${isActionOpen ? 'rotate-180' : ''}`} />
            </button>
            {isActionOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-[#1E1E2D] border border-gray-800 rounded-xl shadow-xl z-30 py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                <button className="w-full px-4 py-2 text-left text-xs font-bold text-gray-300 hover:bg-[#2D2D3F] transition-colors">Suspend </button>

              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-12">
          <div className="flex-1 space-y-10">
            <div className="relative">
              <p className="text-sm text-gray-400 font-medium leading-relaxed mb-4 transition-colors">
                {event.about}
              </p>

              <span className="px-3 py-1 bg-red-900/10 text-red-500 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-red-900/20">
                18+ only
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white transition-colors">
                <MapPin size={18} />
                <h2 className="text-lg font-bold">New York City</h2>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium"><span className="text-gray-400 font-bold uppercase text-[10px] mr-2">Venue:</span> <span className="text-white">{event.venue}</span></p>
                <p className="text-sm font-medium"><span className="text-gray-400 font-bold uppercase text-[10px] mr-2">Address:</span> <span className="text-white">{event.address}</span></p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white transition-colors">Location</h2>
              <ul className="space-y-1">
                {event.locationNotes.map((note, index) => (
                  <li key={index} className="text-sm font-medium text-gray-500 transition-colors tracking-tight">
                    -{note}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white transition-colors">Additional Info</h2>
              <ul className="space-y-1">
                {event.additionalInfo.map((note, index) => (
                  <li key={index} className="text-sm font-medium text-gray-500 transition-colors tracking-tight">
                    -{note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
