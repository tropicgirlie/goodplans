import React from 'react';
import { Compass, Target, PlusCircle, Calendar, Users } from 'lucide-react';

export default function MobileAppFrame({ children, isMobileFrameView, activeTab, setActiveTab, onOpenPlanModal }) {
  if (!isMobileFrameView) {
    return <div className="min-h-screen pb-16">{children}</div>;
  }

  return (
    <div className="bg-[#1A1D20] min-h-screen py-6 px-4 flex flex-col items-center justify-center">
      {/* Mobile Device Container Frame */}
      <div className="mobile-simulated-frame w-full max-w-[430px] bg-[#FAF7F2] relative overflow-hidden flex flex-col">
        
        {/* Mobile Device Status Bar */}
        <div className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-md px-6 py-2 flex items-center justify-between border-b border-[#EFE9DF] text-xs font-bold text-[#1E2022] font-mono">
          <span>9:41</span>
          <div className="flex items-center gap-1.5 text-xs">
            <span>📶</span>
            <span>📡</span>
            <span>🔋</span>
          </div>
        </div>

        {/* Inner Mobile App Content */}
        <div className="flex-1 overflow-y-auto pb-20">
          {children}
        </div>

        {/* Native Mobile Bottom App Navigation Bar */}
        <div className="bottom-nav">
          <button
            onClick={() => setActiveTab('explore')}
            className={`bottom-nav-item ${activeTab === 'explore' ? 'active' : ''}`}
          >
            <Compass className="w-5 h-5" />
            <span>Explore</span>
          </button>

          <button
            onClick={() => setActiveTab('affinity')}
            className={`bottom-nav-item ${activeTab === 'affinity' ? 'active' : ''}`}
          >
            <Target className="w-5 h-5" />
            <span>Matches</span>
          </button>

          {/* Plus Action */}
          <button
            onClick={onOpenPlanModal}
            className="w-12 h-12 rounded-full bg-[#F64060] text-white flex items-center justify-center shadow-lg transform -translate-y-3 hover:scale-110 transition-transform cursor-pointer border-4 border-white"
          >
            <PlusCircle className="w-6 h-6" />
          </button>

          <button
            onClick={() => setActiveTab('outings')}
            className={`bottom-nav-item ${activeTab === 'outings' ? 'active' : ''}`}
          >
            <Calendar className="w-5 h-5" />
            <span>My Outings</span>
          </button>

          <button
            onClick={() => setActiveTab('squad')}
            className={`bottom-nav-item ${activeTab === 'squad' ? 'active' : ''}`}
          >
            <Users className="w-5 h-5" />
            <span>Squad</span>
          </button>
        </div>

      </div>
    </div>
  );
}
