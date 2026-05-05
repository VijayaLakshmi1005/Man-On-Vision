import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, X, Target, Save, Image as ImageIcon, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../../../utils/api';
import './AdminGameManager.css';

const SpotDifferenceManager = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    secondImageUrl: '',
    difficulty: 'medium',
    differences: []
  });
  const imageRef = useRef(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/games/images?gameType=spot_difference`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setImages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageClick = (e) => {
    if (!formData.imageUrl) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setFormData({
      ...formData,
      differences: [...formData.differences, { x, y, radius: 25 }]
    });
  };

  const removeDiff = (index) => {
    const newDiffs = [...formData.differences];
    newDiffs.splice(index, 1);
    setFormData({ ...formData, differences: newDiffs });
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;
    const toastId = toast.loading(`Uploading ${type}...`);
    try {
      const token = localStorage.getItem('token');
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const res = await axios.post(`${API_URL}/admin/games/upload`, formDataUpload, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      
      setFormData(prev => ({ ...prev, [type]: res.data.url }));
      toast.success(`${type} uploaded!`, { id: toastId });
    } catch (err) {
      toast.error('Upload failed', { id: toastId });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const authHeader = { headers: { Authorization: `Bearer ${token}` } };
      const data = { ...formData, gameType: 'spot_difference' };
      if (selectedImage) {
        await axios.put(`${API_URL}/admin/games/images/${selectedImage._id}`, data, authHeader);
        toast.success('Content updated!');
      } else {
        await axios.post(`${API_URL}/admin/games/images`, data, authHeader);
        toast.success('New content added!');
      }
      setShowModal(false);
      resetForm();
      fetchImages();
    } catch (err) {
      toast.error('Failed to save content');
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this set?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/games/images/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Deleted successfully');
      fetchImages();
    } catch (err) {
      toast.error('Error deleting');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', imageUrl: '', secondImageUrl: '', difficulty: 'medium', differences: [] });
    setSelectedImage(null);
  };

  const startEdit = (img) => {
    setSelectedImage(img);
    setFormData({
      title: img.title,
      imageUrl: img.imageUrl,
      secondImageUrl: img.secondImageUrl,
      difficulty: img.difficulty,
      differences: img.differences || []
    });
    setShowModal(true);
  };

  return (
    <div className="admin-game-manager">
      <header className="manager-header">
        <div>
          <h2>Spot Difference Manager</h2>
          <p className="text-sm text-stone-500 uppercase tracking-widest font-bold mt-1">Manage image sets and difference coordinates</p>
        </div>
        <button className="add-btn" onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus size={16} className="inline mr-2" /> Add New Set
        </button>
      </header>

      <div className="game-list">
        {images.map(img => (
          <div key={img._id} className="game-card" onClick={() => startEdit(img)}>
            <div className="card-image">
              <img src={img.imageUrl} alt={img.title} />
              <div className="card-badge bg-white/80 backdrop-blur px-3 py-1 rounded-full absolute top-4 left-4 text-[9px] font-bold tracking-widest uppercase text-stone-800">
                {img.difficulty}
              </div>
            </div>
            <div className="card-content">
              <h3>{img.title}</h3>
              <div className="flex justify-between items-center mt-4">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
                  <MapPin size={10} /> {img.differences.length} Targets
                </span>
                <div className="flex gap-2">
                  <button className="action-btn" onClick={() => startEdit(img)}><Edit2 size={12} /></button>
                  <button className="action-btn delete" onClick={(e) => deleteImage(img._id, e)}><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="mapping-modal">
          <div className="modal-content">
            <header className="modal-header">
              <h3>{selectedImage ? 'Edit Image Set' : 'Add New Set'}</h3>
              <button className="p-2 hover:bg-stone-100 rounded-full" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleSubmit}>
              <div className="input-grid">
                <div className="input-field">
                  <label>Game Set Title</label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Grand Wedding Hall"
                    required
                  />
                </div>
                <div className="input-field">
                  <label>Difficulty</label>
                  <select 
                    value={formData.difficulty} 
                    onChange={e => setFormData({...formData, difficulty: e.target.value})}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="input-grid">
                <div className="input-field">
                  <label>Original Image</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={formData.imageUrl} 
                      onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                      placeholder="Paste URL or upload..."
                      className="flex-1"
                    />
                    <label className="upload-icon-btn">
                      <ImageIcon size={18} />
                      <input type="file" hidden onChange={e => handleFileUpload(e.target.files[0], 'imageUrl')} />
                    </label>
                  </div>
                </div>
                <div className="input-field">
                  <label>Modified Image</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={formData.secondImageUrl} 
                      onChange={e => setFormData({...formData, secondImageUrl: e.target.value})}
                      placeholder="Paste URL or upload..."
                      className="flex-1"
                    />
                    <label className="upload-icon-btn">
                      <ImageIcon size={18} />
                      <input type="file" hidden onChange={e => handleFileUpload(e.target.files[0], 'secondImageUrl')} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="mapping-section mt-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                    Interactive Mapping Tool
                  </label>
                  <span className="text-[9px] text-luxury-gold italic font-medium">Click on original image to add markers</span>
                </div>
                
                <div className="canvas-container" onClick={handleImageClick}>
                  {formData.imageUrl ? (
                    <>
                      <img src={formData.imageUrl} alt="Mapping Tool" ref={imageRef} />
                      {formData.differences.map((diff, i) => (
                        <div 
                          key={i} 
                          className="map-marker" 
                          style={{ left: `${diff.x}%`, top: `${diff.y}%` }}
                          draggable
                          onDragEnd={(e) => {
                            const rect = imageRef.current.getBoundingClientRect();
                            const x = ((e.clientX - rect.left) / rect.width) * 100;
                            const y = ((e.clientY - rect.top) / rect.height) * 100;
                            const newDiffs = [...formData.differences];
                            newDiffs[i] = { ...newDiffs[i], x, y };
                            setFormData({ ...formData, differences: newDiffs });
                          }}
                        >
                          <span className="marker-number">{i + 1}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="h-[300px] bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center text-stone-400">
                      <ImageIcon size={40} className="mb-2 opacity-50" />
                      <p className="text-sm font-medium">Enter Original Image URL to start marking</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="diff-list mt-6 max-h-[150px] overflow-y-auto custom-scrollbar">
                {formData.differences.map((diff, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl mb-2">
                    <span className="text-[11px] font-bold text-stone-600 tracking-wider">DIFFERENCE #{i+1}: <span className="text-luxury-gold ml-2">X:{Math.round(diff.x)}% Y:{Math.round(diff.y)}%</span></span>
                    <button type="button" onClick={() => removeDiff(i)} className="text-red-500 hover:scale-110 transition-all"><X size={14} /></button>
                  </div>
                ))}
              </div>

              <div className="modal-footer border-t border-stone-100 pt-6">
                <button type="button" className="btn-glass-secondary px-8" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-luxury-primary px-10 flex items-center gap-2" disabled={loading}>
                  <Save size={14} /> {loading ? 'Saving...' : 'Save Game Set'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpotDifferenceManager;

