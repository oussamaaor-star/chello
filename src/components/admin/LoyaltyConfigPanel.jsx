import { useEffect, useState } from 'react';
import { Plus, Settings, Save, Loader2, Star, Minus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Panneau de configuration du barème fidélité.
// Possède tout l'état config (chargement, édition, sauvegarde) et remonte la
// config chargée/sauvée au parent via onConfigChange (quick stats + récompenses).
// Toujours monté (le chargement doit avoir lieu même panneau replié) ;
// `visible` ne contrôle que l'affichage du formulaire.
export function LoyaltyConfigPanel({ visible, onConfigChange }) {
  const [config, setConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);
  const [configError, setConfigError] = useState('');
  const [editConfig, setEditConfig] = useState(null);

  const loadConfig = async () => {
    setConfigLoading(true);
    const { data } = await supabase.from('loyalty_config').select('*').limit(1).maybeSingle();
    if (data) {
      const parsed = {
        ...data,
        reward_tiers: typeof data.reward_tiers === 'string' ? JSON.parse(data.reward_tiers) : data.reward_tiers ?? [],
      };
      setConfig(parsed);
      onConfigChange?.(parsed);
      setEditConfig({
        omr_per_point: String(parsed.omr_per_point),
        points_per_threshold: String(parsed.points_per_threshold),
        signup_bonus: String(parsed.signup_bonus),
        reward_tiers: parsed.reward_tiers,
      });
    }
    setConfigLoading(false);
  };

  useEffect(() => {
    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveConfig = async () => {
    if (!config || !editConfig) return;
    setConfigSaving(true);
    setConfigSaved(false);
    setConfigError('');
    const tiers = editConfig.reward_tiers.filter((t) => t.points > 0 && t.discount_omr > 0);
    // .select() : un UPDATE bloqué par RLS renvoie error=null + 0 ligne →
    // faux succès. On vérifie qu'une ligne a bien été modifiée.
    const { data, error } = await supabase.from('loyalty_config').update({
      omr_per_point: parseFloat(editConfig.omr_per_point) || 30,
      points_per_threshold: parseInt(editConfig.points_per_threshold) || 1,
      signup_bonus: parseInt(editConfig.signup_bonus) || 0,
      reward_tiers: tiers,
      updated_at: new Date().toISOString(),
    }).eq('id', config.id).select('id');
    setConfigSaving(false);
    if (error || !data || data.length === 0) {
      setConfigError('Save failed — the configuration was not updated.');
      return;
    }
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
    loadConfig();
  };

  const addTier = () => {
    setEditConfig((prev) => ({
      ...prev,
      reward_tiers: [...prev.reward_tiers, { points: 0, discount_omr: 0 }],
    }));
  };

  const updateTier = (idx, field, value) => {
    setEditConfig((prev) => ({
      ...prev,
      reward_tiers: prev.reward_tiers.map((t, i) =>
        i === idx ? { ...t, [field]: parseFloat(value) || 0 } : t
      ),
    }));
  };

  const removeTier = (idx) => {
    setEditConfig((prev) => ({
      ...prev,
      reward_tiers: prev.reward_tiers.filter((_, i) => i !== idx),
    }));
  };

  if (!visible) return null;

  return (
    <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-6 space-y-5">
      <h2 className="text-sm font-bold uppercase tracking-widest text-ink-soft flex items-center gap-2">
        <Settings size={14} /> Points Configuration
      </h2>

      {configLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-ink-soft" />
        </div>
      ) : editConfig && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-ink-soft mb-1.5">OMR per point</label>
              <input
                type="number"
                step="0.001"
                value={editConfig.omr_per_point}
                onChange={(e) => setEditConfig({ ...editConfig, omr_per_point: e.target.value })}
                className="w-full border border-ink/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-silver/40"
              />
              <p className="text-[10px] text-ink-soft/60 mt-1">
                Customer spends {editConfig.omr_per_point} OMR = earns {editConfig.points_per_threshold} point(s)
              </p>
            </div>
            <div>
              <label className="block text-xs text-ink-soft mb-1.5">Points per threshold</label>
              <input
                type="number"
                value={editConfig.points_per_threshold}
                onChange={(e) => setEditConfig({ ...editConfig, points_per_threshold: e.target.value })}
                className="w-full border border-ink/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-silver/40"
              />
            </div>
            <div>
              <label className="block text-xs text-ink-soft mb-1.5">Signup bonus</label>
              <input
                type="number"
                value={editConfig.signup_bonus}
                onChange={(e) => setEditConfig({ ...editConfig, signup_bonus: e.target.value })}
                className="w-full border border-ink/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-silver/40"
              />
              <p className="text-[10px] text-ink-soft/60 mt-1">Points given when a new customer registers</p>
            </div>
          </div>

          {/* Reward Tiers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-ink-soft font-semibold">Reward Tiers</label>
              <button
                onClick={addTier}
                className="flex items-center gap-1 text-xs text-silver-deep hover:text-silver transition-colors"
              >
                <Plus size={12} /> Add tier
              </button>
            </div>
            {editConfig.reward_tiers.length === 0 ? (
              <p className="text-xs text-ink-soft/50">No reward tiers configured. Add one above.</p>
            ) : (
              <div className="space-y-2">
                {editConfig.reward_tiers.map((tier, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-cream-deep rounded-xl px-3 py-2">
                    <div className="flex items-center gap-1.5 flex-1">
                      <Star size={12} className="text-silver" />
                      <input
                        type="number"
                        value={tier.points}
                        onChange={(e) => updateTier(idx, 'points', e.target.value)}
                        className="w-20 border border-ink/10 rounded-lg px-2 py-1.5 text-sm bg-white"
                      />
                      <span className="text-xs text-ink-soft">pts =</span>
                      <input
                        type="number"
                        step="0.001"
                        value={tier.discount_omr}
                        onChange={(e) => updateTier(idx, 'discount_omr', e.target.value)}
                        className="w-24 border border-ink/10 rounded-lg px-2 py-1.5 text-sm bg-white"
                      />
                      <span className="text-xs text-ink-soft">OMR discount</span>
                    </div>
                    <button onClick={() => removeTier(idx)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Minus size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={saveConfig}
              disabled={configSaving}
              className="flex items-center gap-2 bg-ink text-cream rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-ink/90 transition-colors disabled:opacity-50"
            >
              {configSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save configuration
            </button>
            {configSaved && (
              <span className="text-sm text-emerald-600 font-medium">Saved!</span>
            )}
            {configError && (
              <span className="text-sm text-red-600 font-medium">{configError}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
