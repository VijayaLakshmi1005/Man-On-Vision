import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Layout, Eye, EyeOff, MoveUp, MoveDown, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../../../utils/api';
import './AdminGameManager.css';

const AdminPageManager = () => {
  const [settings, setSettings] = useState({
    title: 'Game Experience Zone',
    description: 'Immersive interactive entertainment curated for your event.',
    backgroundImage: '',
    games: [
      { id: 'tictactoe', title: 'Tic Tac Toe', description: 'Classic camera vs lights battle. Beat our advanced AI!', icon: '🎮', image: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948', enabled: true },
      { id: '2048', title: '2048 Event Edition', description: 'Merge tiles to create the ultimate event setup.', icon: '🔢', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f', enabled: true },
      { id: 'spot_difference', title: 'Spot The Difference', description: 'Find subtle changes in stunning event photography.', icon: '🔍', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622', enabled: true },
      { id: 'kannada_rapid_fire', title: 'Kannada Rapid Fire', description: 'Test your knowledge on Kannada culture and cinema!', icon: '⚡', image: 'https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c', enabled: true },
      { id: 'hidden_object', title: 'Hidden Object', description: 'Can you find all the event equipment hidden in the scene?', icon: '🕵️', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30', enabled: true }
    ]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_URL}/games/zone`);
      if (res.data) {
        const fetchedSettings = res.data;
        const defaultGames = [
          { id: 'tictactoe', title: 'Tic Tac Toe', description: 'Classic camera vs lights battle. Beat our advanced AI!', icon: '🎮', image: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948', enabled: true },
          { id: '2048', title: '2048 Event Edition', description: 'Merge tiles to create the ultimate event setup.', icon: '🔢', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f', enabled: true },
          { id: 'spot_difference', title: 'Spot The Difference', description: 'Find subtle changes in stunning event photography.', icon: '🔍', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622', enabled: true },
          { id: 'kannada_rapid_fire', title: 'Kannada Rapid Fire', description: 'Test your knowledge on Kannada culture and cinema!', icon: '⚡', image: 'https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c', enabled: true },
          { id: 'hidden_object', title: 'Hidden Object', description: 'Can you find all the event equipment hidden in the scene?', icon: '🕵️', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30', enabled: true }
        ];

        // Merge logic: keep existing settings but add new games if they don't exist
        const mergedGames = [...fetchedSettings.games];
        defaultGames.forEach(defGame => {
          if (!mergedGames.find(g => g.id === defGame.id)) {
            mergedGames.push(defGame);
          }
        });

        setSettings({ ...fetchedSettings, games: mergedGames });
      }
    } catch (err) {
      console.error('Error fetching zone settings:', err);
    }
  };

  const handleGameUpdate = (index, field, value) => {
    const newGames = [...settings.games];
    newGames[index] = { ...newGames[index], [field]: value };
    setSettings({ ...settings, games: newGames });
  };

  const moveGame = (index, direction) => {
    const newGames = [...settings.games];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newGames.length) return;
    
    [newGames[index], newGames[targetIndex]] = [newGames[targetIndex], newGames[index]];
    setSettings({ ...settings, games: newGames });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/games/settings`, {
        gameType: 'page_settings',
        settings: settings
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Page settings updated successfully!');
    } catch (err) {
      toast.error('Failed to update page settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-game-manager">
      <header className="manager-header">
        <div>
          <h2>Zone Appearance Manager</h2>
          <p className="text-sm text-stone-500 uppercase tracking-widest font-bold mt-1">Customize the Game Hub Landing Page</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-[32px] p-8 border border-black/5 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Layout size={20} /> Global Header Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="input-field">
              <label>Page Main Title</label>
              <input 
                type="text" 
                value={settings.title}
                onChange={e => setSettings({...settings, title: e.target.value})}
              />
            </div>
            <div className="input-field">
              <label>Hero Background Image URL</label>
              <input 
                type="text" 
                value={settings.backgroundImage}
                onChange={e => setSettings({...settings, backgroundImage: e.target.value})}
                placeholder="Leave blank for default cinematic dark"
              />
            </div>
            <div className="input-field md:col-span-2">
              <label>Page Description</label>
              <textarea 
                value={settings.description}
                onChange={e => setSettings({...settings, description: e.target.value})}
                rows={2}
                className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-[24px] outline-none focus:border-stone-200 transition-all text-sm font-medium text-stone-900"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-8 border border-black/5 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><ImageIcon size={20} /> Game Modules Configuration</h3>
          <div className="space-y-6">
            {settings.games.map((game, index) => (
              <div key={game.id} className={`p-6 rounded-2xl border ${game.enabled ? 'border-stone-200' : 'bg-stone-50 border-stone-100 opacity-60'} transition-all`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{game.icon}</div>
                    <div>
                      <h4 className="font-bold">{game.title}</h4>
                      <p className="text-xs text-stone-500">{game.id.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => moveGame(index, 'up')} className="p-2 hover:bg-stone-100 rounded-lg"><MoveUp size={16} /></button>
                    <button type="button" onClick={() => moveGame(index, 'down')} className="p-2 hover:bg-stone-100 rounded-lg"><MoveDown size={16} /></button>
                    <button 
                      type="button" 
                      onClick={() => handleGameUpdate(index, 'enabled', !game.enabled)}
                      className={`p-2 rounded-lg ${game.enabled ? 'text-green-600 hover:bg-green-50' : 'text-stone-400 hover:bg-stone-200'}`}
                    >
                      {game.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="input-field">
                    <label>Display Title</label>
                    <input 
                      type="text" 
                      className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-[24px] outline-none focus:border-stone-200 transition-all text-sm font-medium text-stone-900"
                      value={game.title}
                      onChange={e => handleGameUpdate(index, 'title', e.target.value)}
                    />
                  </div>
                  <div className="input-field">
                    <label>Thumbnail Image URL</label>
                    <input 
                      type="text" 
                      className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-[24px] outline-none focus:border-stone-200 transition-all text-sm font-medium text-stone-900"
                      value={game.image}
                      onChange={e => handleGameUpdate(index, 'image', e.target.value)}
                    />
                  </div>
                  <div className="input-field md:col-span-2">
                    <label>Description (Short)</label>
                    <input 
                      type="text" 
                      className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-[24px] outline-none focus:border-stone-200 transition-all text-sm font-medium text-stone-900"
                      value={game.description}
                      onChange={e => handleGameUpdate(index, 'description', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="btn-luxury-primary px-12 flex items-center gap-2" disabled={loading}>
            <Save size={18} /> {loading ? 'Saving Changes...' : 'Publish Global Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPageManager;
