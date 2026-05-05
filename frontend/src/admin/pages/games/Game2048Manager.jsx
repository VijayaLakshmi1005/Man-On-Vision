import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, List, Palette, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../../../utils/api';
import './AdminGameManager.css';

const Admin2048Manager = () => {
  const [labels, setLabels] = useState({
    2: 'Light', 4: 'Mic', 8: 'Camera', 16: 'Lens', 32: 'Drone',
    64: 'Stage', 128: 'Screen', 256: 'Baraat', 512: 'Decor',
    1024: 'Catering', 2048: 'THE EVENT'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_URL}/games/settings?gameType=2048`);
      if (res.data && res.data.settings?.labels) {
        setLabels(res.data.settings.labels);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const handleLabelChange = (val, label) => {
    setLabels(prev => ({ ...prev, [val]: label }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        gameType: '2048',
        settings: { labels }
      };
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/games/settings`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('2048 Event Labels updated!');
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
          <h2>2048 Game Content</h2>
          <p className="text-sm text-stone-500 uppercase tracking-widest font-bold mt-1">Customize tile labels for the Event Edition</p>
        </div>
      </header>

      <div className="bg-white rounded-[32px] p-10 border border-black/5 shadow-sm max-w-4xl">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Object.keys(labels).map(val => (
              <div key={val} className="input-field">
                <label className="flex items-center gap-2"><Hash size={12} /> Tile {val}</label>
                <input 
                  type="text" 
                  value={labels[val]}
                  onChange={e => handleLabelChange(val, e.target.value)}
                  placeholder={`Label for ${val}`}
                />
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-stone-100 flex justify-end">
            <button type="submit" className="btn-luxury-primary px-12 flex items-center gap-2" disabled={loading}>
              <Save size={16} /> {loading ? 'Saving...' : 'Update Labels'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Admin2048Manager;
