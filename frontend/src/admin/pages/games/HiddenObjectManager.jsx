import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Plus, Trash2, Edit2, Check, X, Search, 
  Upload, Filter, Save, AlertCircle, ChevronLeft,
  Target, MousePointer2, Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../../../utils/api';
import './AdminGameManager.css';

const HiddenObjectManager = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    difficulty: 'medium',
    gameType: 'hidden_object',
    objects: [],
    isActive: true
  });

  const [currentMapping, setCurrentMapping] = useState({ name: '', x: 0, y: 0 });
  const [isMapping, setIsMapping] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/games/images?gameType=hidden_object`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setImages(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/admin/games/upload`, data, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      setFormData(prev => ({ ...prev, imageUrl: res.data.url }));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageClick = (e) => {
    if (!isMapping) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCurrentMapping(prev => ({ ...prev, x, y }));
  };

  const addPoint = () => {
    if (!currentMapping.name) return toast.error('Enter object name first');
    setFormData(prev => ({
      ...prev,
      objects: [...prev.objects, { ...currentMapping, radius: 5 }]
    }));
    setCurrentMapping({ name: '', x: 0, y: 0 });
    setIsMapping(false);
    toast.success('Object mapped');
  };

  const removePoint = (index) => {
    setFormData(prev => ({
      ...prev,
      objects: prev.objects.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl) return toast.error('Upload image first');
    if (formData.objects.length === 0) return toast.error('Add at least one object');

    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        await axios.put(`${API_URL}/admin/games/images/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Scene updated');
      } else {
        await axios.post(`${API_URL}/admin/games/images`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Scene published');
      }
      fetchImages();
      resetForm();
    } catch (err) {
      toast.error('Save failed');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      imageUrl: '',
      difficulty: 'medium',
      gameType: 'hidden_object',
      objects: [],
      isActive: true
    });
    setEditingId(null);
    setShowForm(false);
    setIsMapping(false);
  };

  const handleEdit = (img) => {
    setFormData({
      title: img.title,
      imageUrl: img.imageUrl,
      difficulty: img.difficulty,
      gameType: 'hidden_object',
      objects: img.objects,
      isActive: img.isActive
    });
    setEditingId(img._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this scene?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/games/images/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Scene deleted');
      fetchImages();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="admin-manager-container">
      <header className="manager-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => window.history.back()}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1>Hidden Object Manager</h1>
            <p>Map production equipment in cinematic scenes</p>
          </div>
        </div>
        <button className="add-btn-premium" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Cancel' : 'New Scene'}
        </button>
      </header>

      {showForm && (
        <div className="form-overlay animate-in">
          <form onSubmit={handleSubmit} className="premium-form-wide">
            <div className="form-main-grid">
              <div className="form-sidebar glass">
                 <h2 className="form-title">{editingId ? 'Edit Scene' : 'New Scene'}</h2>
                 
                 <div className="form-field">
                   <label>Scene Title</label>
                   <input 
                     type="text" 
                     value={formData.title} 
                     onChange={(e) => setFormData({...formData, title: e.target.value})}
                     placeholder="e.g. Grand Ballroom Setup"
                     required
                   />
                 </div>

                 <div className="form-field">
                    <label>Difficulty</label>
                    <select value={formData.difficulty} onChange={(e) => setFormData({...formData, difficulty: e.target.value})}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                 </div>

                 <div className="form-field">
                   <label>Base Image</label>
                   {formData.imageUrl ? (
                     <div className="image-preview-box">
                       <img src={formData.imageUrl} alt="Preview" />
                       <button type="button" className="change-img-btn" onClick={() => setFormData({...formData, imageUrl: ''})}>
                         Change Scene
                       </button>
                     </div>
                   ) : (
                     <div className="upload-placeholder">
                        <Upload size={24} />
                        <p>{isUploading ? 'Uploading...' : 'Click to upload scene'}</p>
                        <input type="file" onChange={handleFileUpload} accept="image/*" />
                     </div>
                   )}
                 </div>

                 <div className="form-field">
                    <label>Mapped Objects ({formData.objects.length})</label>
                    <div className="mapped-items-scroll">
                       {formData.objects.map((obj, i) => (
                         <div key={i} className="mapped-item">
                           <span>{obj.name}</span>
                           <button type="button" onClick={() => removePoint(i)} className="delete-obj-btn">
                             <Trash2 size={14} />
                           </button>
                         </div>
                       ))}
                       {formData.objects.length === 0 && <p className="empty-msg">No objects mapped yet</p>}
                    </div>
                 </div>

                 <div className="form-actions-sidebar">
                    <button type="submit" className="primary-btn-glow w-full">
                      <Save size={18} />
                      <span>{editingId ? 'Update Scene' : 'Publish Scene'}</span>
                    </button>
                 </div>
              </div>

              <div className="mapping-canvas-area">
                 <div className="mapping-toolbar">
                    <div className="mapping-status">
                      {isMapping ? (
                        <span className="status active">CLICK ON IMAGE TO PLACE MARKER</span>
                      ) : (
                        <span className="status">DEFINE OBJECTS BELOW</span>
                      )}
                    </div>
                    <div className="add-mapping-tool">
                       <input 
                         type="text" 
                         placeholder="Object Name..." 
                         value={currentMapping.name}
                         onChange={(e) => setCurrentMapping({...currentMapping, name: e.target.value})}
                       />
                       <button 
                         type="button" 
                         className={`tool-btn ${isMapping ? 'active' : ''}`}
                         onClick={() => setIsMapping(!isMapping)}
                       >
                         <Target size={18} />
                         {currentMapping.x > 0 ? 'Reposition' : 'Place Marker'}
                       </button>
                       {currentMapping.x > 0 && (
                         <button type="button" className="confirm-btn" onClick={addPoint}>
                           <Check size={18} />
                         </button>
                       )}
                    </div>
                 </div>

                 <div className="canvas-wrapper">
                    {formData.imageUrl ? (
                      <div className="mapping-container" onClick={handleImageClick}>
                        <img 
                          ref={imageRef}
                          src={formData.imageUrl} 
                          alt="Mapping Canvas" 
                          draggable="false"
                        />
                        
                        {/* Existing Objects */}
                        {formData.objects.map((obj, i) => (
                          <div key={i} className="marker existing" style={{ left: `${obj.x}%`, top: `${obj.y}%` }}>
                            <div className="dot" />
                            <span className="label">{obj.name}</span>
                          </div>
                        ))}

                        {/* Current Mapping */}
                        {currentMapping.x > 0 && (
                          <div className="marker current" style={{ left: `${currentMapping.x}%`, top: `${currentMapping.y}%` }}>
                            <div className="dot animate-pulse" />
                            <span className="label">New Object</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="canvas-empty">
                         <ImageIcon size={64} opacity={0.1} />
                         <p>Upload an image to start mapping</p>
                      </div>
                    )}
                 </div>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="scenes-grid">
        {images.map(img => (
          <div key={img._id} className="scene-card-admin glass">
            <div className="scene-thumb">
              <img src={img.imageUrl} alt={img.title} />
              <div className="scene-overlay-actions">
                <button onClick={() => handleEdit(img)}><Edit2 size={18} /></button>
                <button onClick={() => handleDelete(img._id)}><Trash2 size={18} /></button>
              </div>
            </div>
            <div className="scene-info">
              <h3>{img.title}</h3>
              <div className="scene-stats-row">
                 <span className={`diff-badge ${img.difficulty}`}>{img.difficulty}</span>
                 <span className="obj-count">{img.objects.length} Objects</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default HiddenObjectManager;
