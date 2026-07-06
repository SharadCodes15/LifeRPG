import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePlayer } from './PlayerContext';
import type { Stats } from './PlayerContext';

export interface Milestone {
  id: string;
  name: string;
  xp: number;
  statKey: keyof Stats;
  done: boolean;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  milestones: Milestone[];
}

export interface CampaignClearedEvent {
  campaignTitle: string;
  bossMilestoneName: string;
}

interface CampaignContextType {
  campaigns: Campaign[];
  campaignClearedEvent: CampaignClearedEvent | null;
  addCampaign: (title: string, description: string, milestonesInput: Omit<Milestone, 'id' | 'done'>[]) => void;
  toggleMilestone: (campaignId: string, milestoneId: string) => void;
  deleteCampaign: (campaignId: string) => void;
  clearCampaignClearedEvent: () => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ascension_campaigns';

export const CampaignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { gainXP } = usePlayer();

  // Load initial state
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse campaigns from localStorage', e);
      }
    }
    return [];
  });

  const [campaignClearedEvent, setCampaignClearedEvent] = useState<CampaignClearedEvent | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(campaigns));
  }, [campaigns]);

  const addCampaign = (
    title: string,
    description: string,
    milestonesInput: Omit<Milestone, 'id' | 'done'>[]
  ) => {
    const newCampaign: Campaign = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      description,
      milestones: milestonesInput.map((m) => ({
        ...m,
        id: Math.random().toString(36).substring(2, 9),
        done: false,
      })),
    };
    setCampaigns((prev) => [...prev, newCampaign]);
  };

  const toggleMilestone = (campaignId: string, milestoneId: string) => {
    let milestoneToAward: Milestone | null = null;
    let clearingCampaignTitle = '';

    setCampaigns((prev) => {
      return prev.map((campaign) => {
        if (campaign.id !== campaignId) return campaign;

        const updatedMilestones = campaign.milestones.map((m, index) => {
          if (m.id !== milestoneId) return m;

          const isTurningDone = !m.done;
          if (isTurningDone) {
            milestoneToAward = m;

            // Check if this is the final milestone in the campaign (Boss Stage)
            if (index === campaign.milestones.length - 1) {
              clearingCampaignTitle = campaign.title;
            }
          }

          return { ...m, done: isTurningDone };
        });

        return { ...campaign, milestones: updatedMilestones };
      });
    });

    // Execute side-effects outside of state transitions
    if (milestoneToAward) {
      const m = milestoneToAward as Milestone;
      gainXP(m.xp, m.statKey);

      if (clearingCampaignTitle) {
        setCampaignClearedEvent({
          campaignTitle: clearingCampaignTitle,
          bossMilestoneName: m.name,
        });
      }
    }
  };

  const deleteCampaign = (campaignId: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
  };

  const clearCampaignClearedEvent = () => {
    setCampaignClearedEvent(null);
  };

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        campaignClearedEvent,
        addCampaign,
        toggleMilestone,
        deleteCampaign,
        clearCampaignClearedEvent,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaigns = () => {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error('useCampaigns must be used within a CampaignProvider');
  }
  return context;
};
