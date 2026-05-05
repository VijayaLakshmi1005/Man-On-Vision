import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Settings, Monitor, User, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../../../utils/api';
import './AdminGameManager.css';

const AdminTicTacToeManager = () => {
  const [settings, setSettings] = useState({
    userIcon: '🎥',
    aiIcon: '💡',
    defaultDifficulty: 'medium',
    theme: 'dark'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_URL}/games/settings?gameType=tictactoe`);
      if (res.data && res.data.settings) {
        setSettings({
          userIcon: res.data.settings.icons?.user || '🎥',
          aiIcon: res.data.settings.icons?.ai || '💡',
          defaultDifficulty: res.data.settings.defaultDifficulty || 'medium',
          theme: res.data.settings.theme || 'dark'
        });
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        gameType: 'tictactoe',
        settings: {
          icons: { user: settings.userIcon, ai: settings.aiIcon },
          defaultDifficulty: settings.defaultDifficulty,
          theme: settings.theme
        }
      };
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/games/settings`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Tic Tac Toe settings updated!');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-game-manager">
      <header className="manager-header">
        <div>
          <h2>Tic Tac Toe Settings</h2>
          <p className="text-sm text-stone-500 uppercase tracking-widest font-bold mt-1">Configure AI behavior and visuals</p>
        </div>
      </header>

      <div className="bg-white rounded-[32px] p-10 border border-black/5 shadow-sm max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="input-field">
                <label className="flex items-center gap-2"><User size={14} /> Player Icon (Emoji)</label>
                <input 
                  type="text" 
                  value={settings.userIcon}
                  onChange={e => setSettings({...settings, userIcon: e.target.value})}
                  maxLength={2}
                />
              </div>
              <div className="input-field">
                <label className="flex items-center gap-2"><Cpu size={14} /> AI Icon (Emoji)</label>
                <input 
                  type="text" 
                  value={settings.aiIcon}
                  onChange={e => setSettings({...settings, aiIcon: e.target.value})}
                  maxLength={2}
                />
              </div>
            </div>

            <div className="input-field">
              <label className="flex items-center gap-2"><Monitor size={14} /> Default Difficulty</label>
              <select 
                value={settings.defaultDifficulty}
                onChange={e => setSettings({...settings, defaultDifficulty: e.target.value})}
              >
                <option value="easy">Easy (Random)</option>
                <option value="medium">Medium (Hybrid)</option>
                <option value="hard">Hard (Unbeatable)</option>
              </select>
            </div>

            <div className="input-field">
              <label className="flex items-center gap-2"><Settings size={14} /> Visual Theme</label>
              <div className="flex gap-4 mt-2">
                {['dark', 'gold', 'classic'].map(t => (
                  <button
                    key={t}
                    type="button"
                    className={`px-6 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                      settings.theme === t ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-500 border-stone-200'
                    }`}
                    onClick={() => setSettings({...settings, theme: t})}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-stone-100 flex justify-end">
            <button type="submit" className="btn-luxury-primary px-12 flex items-center gap-2" disabled={loading}>
              <Save size={16} /> {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminTicTacToeManager;
