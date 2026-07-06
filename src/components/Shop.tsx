import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import type { Reward } from '../context/ShopContext';
import { usePlayer } from '../context/PlayerContext';
import { SystemPanel } from './SystemPanel';

export const Shop: React.FC = () => {
  const { gold } = usePlayer();
  const { rewards, history, addReward, editReward, deleteReward, redeemReward } = useShop();

  // Dialog/Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  const [rewardName, setRewardName] = useState('');
  const [rewardCost, setRewardCost] = useState(10);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardName.trim() || rewardCost <= 0) return;
    addReward(rewardName, rewardCost);
    setRewardName('');
    setRewardCost(10);
    setShowAddModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReward || !rewardName.trim() || rewardCost <= 0) return;
    editReward(editingReward.id, rewardName, rewardCost);
    setRewardName('');
    setRewardCost(10);
    setEditingReward(null);
  };

  const startEdit = (reward: Reward) => {
    setEditingReward(reward);
    setRewardName(reward.name);
    setRewardCost(reward.cost);
  };

  const cancelForm = () => {
    setRewardName('');
    setRewardCost(10);
    setShowAddModal(false);
    setEditingReward(null);
  };

  const formatDate = (timestamp: number): string => {
    const d = new Date(timestamp);
    const date = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return `${date} at ${time}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Shop Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-panel2 pb-4 mb-2">
        <div>
          <h2 className="font-display font-bold text-2xl tracking-widest bg-gradient-to-r from-accent via-accent2 to-accent bg-clip-text text-transparent uppercase select-none">
            REWARDS SHOP
          </h2>
          <p className="text-xs text-textdim mt-1 font-mono uppercase">
            Exchange earned gold for custom personal rewards. Honesty policy active.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-panel px-4 py-2 border border-accent/25 rounded-md font-mono text-xs select-none">
            Available Capital: <span className="text-accent font-bold">🪙 {gold} Gold</span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs font-mono bg-accent/15 border border-accent/40 hover:bg-accent/25 text-accent px-4 py-2 rounded uppercase tracking-wider font-bold cursor-pointer active:scale-95 transition-all duration-300"
          >
            ✚ Create Reward
          </button>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 bp-820:grid-cols-3 gap-6">
        {rewards.map((r) => {
          const isAffordable = gold >= r.cost;

          return (
            <SystemPanel
              key={r.id}
              glow={false}
              className="p-5 flex flex-col justify-between border border-panel2 bg-panel/30 hover:border-accent/15 transition-all min-h-[160px] relative group"
            >
              {/* Card Title & Info */}
              <div>
                <div className="flex justify-between items-start gap-3 mb-2">
                  <h3 className="font-sans font-bold text-sm text-textmain leading-tight pr-4">
                    {r.name}
                  </h3>
                  <div className="text-xs font-mono font-bold text-accent shrink-0">
                    🪙 {r.cost}g
                  </div>
                </div>
              </div>

              {/* Purchase & Modify Buttons */}
              <div className="border-t border-accent/5 pt-3 flex items-center justify-between gap-4 mt-4">
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(r)}
                    className="text-[10px] font-mono text-textdim hover:text-accent cursor-pointer transition-colors"
                  >
                    Edit
                  </button>
                  <span className="text-textdim/20 text-[9px]">|</span>
                  <button
                    onClick={() => deleteReward(r.id)}
                    className="text-[10px] font-mono text-textdim hover:text-danger cursor-pointer transition-colors"
                  >
                    Delete
                  </button>
                </div>

                <button
                  onClick={() => redeemReward(r.id)}
                  className={`text-[10px] font-mono border px-3 py-1.5 rounded uppercase tracking-wider font-semibold cursor-pointer active:scale-95 transition-all duration-300 ${
                    isAffordable
                      ? 'bg-accent/15 border-accent/40 hover:bg-accent/25 text-accent'
                      : 'bg-panel/40 border-textdim/10 text-textdim hover:bg-bronze/10 hover:border-bronze/30 hover:text-bronze'
                  }`}
                  title={!isAffordable ? 'Insufficient gold, but honesty system is active!' : undefined}
                >
                  Redeem Reward
                </button>
              </div>
            </SystemPanel>
          );
        })}
      </div>

      {/* Redemption Log History */}
      <div className="mt-8 border-t border-panel2 pt-6">
        <h3 className="font-display font-bold text-sm tracking-widest text-textmain uppercase mb-4">
          REDEMPTION HISTORY LOGS
        </h3>

        {history.length > 0 ? (
          <SystemPanel glow={false} className="p-4 bg-panel/15 border-panel2 max-h-60 overflow-y-auto">
            <div className="divide-y divide-accent/5 font-mono text-xs text-textdim">
              {history.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-accent text-[9px]">✔</span>
                    <span>
                      Acquired <span className="text-textmain font-semibold">"{log.rewardName}"</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-accent font-bold">🪙 -{log.cost}g</span>
                    <span className="text-[10px] text-textdim/45">{formatDate(log.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </SystemPanel>
        ) : (
          <div className="text-center py-6 border border-dashed border-panel2 rounded-lg text-xs text-textdim/55 font-mono uppercase tracking-wide">
            No redemptions logged in this sector
          </div>
        )}
      </div>

      {/* Add / Edit Reward Dialog Popover */}
      {(showAddModal || editingReward) && (
        <div
          onClick={cancelForm}
          className="fixed inset-0 bg-bg/85 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 cursor-pointer transition-opacity duration-300 animate-fadeIn"
        >
          <SystemPanel
            glow={true}
            className="max-w-md w-full p-6 bg-panel border-accent/40 shadow-2xl relative overflow-hidden flex flex-col animate-scaleUp cursor-default"
            onClick={(e) => e.stopPropagation()} // Prevent close on clicking card body
          >
            <h3 className="font-display font-bold text-base tracking-wider text-accent uppercase mb-4">
              {editingReward ? 'Modify Custom Reward' : 'Create Custom Reward'}
            </h3>

            <form onSubmit={editingReward ? handleEditSubmit : handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] text-textdim uppercase font-mono tracking-wider block">Reward Name</label>
                <input
                  type="text"
                  value={rewardName}
                  onChange={(e) => setRewardName(e.target.value)}
                  placeholder="e.g. 1 hour gaming, eat a slice of pizza"
                  className="w-full bg-bg border border-accent/25 rounded px-3 py-1.5 text-sm text-textmain focus:outline-none focus:border-accent"
                  maxLength={50}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-textdim uppercase font-mono tracking-wider block">Gold Cost</label>
                <input
                  type="number"
                  value={rewardCost}
                  onChange={(e) => setRewardCost(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-bg border border-accent/25 rounded px-3 py-1.5 text-xs text-textmain focus:outline-none focus:border-accent font-mono"
                  min={1}
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-accent/10 mt-6">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-3 py-1.5 border border-textdim/20 text-textdim hover:text-textmain text-xs font-mono rounded cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-accent/15 border border-accent/40 hover:bg-accent/25 text-accent text-xs font-mono font-bold rounded cursor-pointer transition-colors"
                >
                  {editingReward ? 'Apply Changes' : 'Form Reward'}
                </button>
              </div>
            </form>
          </SystemPanel>
        </div>
      )}
    </div>
  );
};

export default Shop;
