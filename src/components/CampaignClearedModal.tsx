import React, { useEffect } from 'react';
import { useCampaigns } from '../context/CampaignContext';
import { SystemPanel } from './SystemPanel';

export const CampaignClearedModal: React.FC = () => {
  const { campaignClearedEvent, clearCampaignClearedEvent } = useCampaigns();

  useEffect(() => {
    if (campaignClearedEvent) {
      const timer = setTimeout(() => {
        clearCampaignClearedEvent();
      }, 5000); // Expanded slightly for easier manual click
      return () => clearTimeout(timer);
    }
  }, [campaignClearedEvent, clearCampaignClearedEvent]);

  if (!campaignClearedEvent) return null;

  const { campaignTitle, bossMilestoneName } = campaignClearedEvent;

  return (
    <div
      onClick={clearCampaignClearedEvent}
      className="fixed inset-0 bg-bg/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 cursor-pointer transition-opacity duration-300 animate-fadeIn"
    >
      {/* Glow overlay container */}
      <div className="absolute inset-0 bg-accent/5 animate-pulse pointer-events-none" />

      <SystemPanel
        glow={true}
        className="max-w-md w-full p-8 text-center brutalist-modal-card relative overflow-hidden flex flex-col items-center animate-scaleUp cursor-default"
        onClick={(e) => e.stopPropagation()} // Prevent close on clicking card content
      >
        {/* Decorative corner lines in Bronze */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-bronze/35" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-bronze/35" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-bronze/35" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-bronze/35" />

        {/* Victory Icon */}
        <div className="w-16 h-16 rounded-full border border-bronze/30 bg-bronze/10 flex items-center justify-center text-bronze text-3xl mb-4 select-none animate-pulse">
          🏆
        </div>

        {/* Campaign Cleared Title */}
        <h2 className="font-display font-bold text-3xl tracking-widest bg-gradient-to-r from-bronze via-[#fcd34d] to-bronze bg-clip-text text-transparent mb-4 animate-pulse select-none">
          CAMPAIGN CLEARED
        </h2>

        {/* Campaign Info */}
        <div className="my-4 text-center">
          <span className="text-[9px] uppercase tracking-widest text-textdim font-mono block mb-1">
            System Milestone Complete
          </span>
          <span className="text-xl font-display font-bold text-textmain block">
            {campaignTitle}
          </span>
          <span className="text-[11px] font-mono text-bronze/80 block mt-2">
            Final Trial: {bossMilestoneName}
          </span>
        </div>

        {/* System Message */}
        <div className="border-t border-accent/15 w-full pt-4 mt-4 text-[10px] font-mono text-textdim/50 uppercase tracking-widest animate-pulse">
          ★ SYSTEM REWARD DISBURSED ★
        </div>

        {/* Neumorphic Action Button */}
        <button
          onClick={clearCampaignClearedEvent}
          className="mt-6 px-6 py-2.5 rounded text-xs font-mono font-bold uppercase tracking-wider neu-btn active:scale-95 cursor-pointer transition-all duration-300"
        >
          Claim System Rewards
        </button>

        <div className="text-[9px] font-mono text-textdim/30 mt-5">
          Wait or click button to dismiss interface
        </div>
      </SystemPanel>
    </div>
  );
};

export default CampaignClearedModal;
