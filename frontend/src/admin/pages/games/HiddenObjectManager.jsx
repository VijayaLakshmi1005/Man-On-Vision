import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Plus, Trash2, Edit2, Check, X, Search,
  Upload, Filter, Save, AlertCircle, ChevronLeft,
  Target, MousePointer2, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { API_URL, resolveImageUrl } from '../../../utils/api';
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

  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

    const toastId = toast.loading('Uploading Scene...');
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
      toast.success('Scene uploaded', { id: toastId });
      setIsAnalyzing(true);
      setTimeout(() => setIsAnalyzing(false), 1500);
      
    } catch (err) {
      toast.error('Upload failed', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageClick = (e) => {
    if (!isMapping || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCurrentMapping(prev => ({ ...prev, x, y }));
  };

  const addPoint = () => {
    if (!currentMapping.name) return toast.error('Enter object name first');
    if (currentMapping.x === 0) return toast.error('Place marker on image');
    
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
      const authHeader = { headers: { Authorization: `Bearer ${token}` } };
      
      if (editingId) {
        await axios.put(`${API_URL}/admin/games/images/${editingId}`, formData, authHeader);
        toast.success('Scene updated');
      } else {
        await axios.post(`${API_URL}/admin/games/images`, formData, authHeader);
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
    setCurrentMapping({ name: '', x: 0, y: 0 });
  };

  const handleEdit = (img) => {
    setFormData({
      title: img.title,
      imageUrl: img.imageUrl,
      difficulty: img.difficulty,
      gameType: 'hidden_object',
      objects: img.objects || [],
      isActive: img.isActive
    });
    setEditingId(img._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Dismantle this scene protocol?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/games/images/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Protocol dismantled');
      fetchImages();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="min-h-screen -m-4 md:-m-10 p-6 md:p-12 bg-transparent relative font-sans selection:bg-rose-100 selection:text-rose-900">
      <div className="fixed inset-0 bg-[#fdfaf6] -z-20" />
      
      <header className="manager-header max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-5 mb-2">
            <div className="w-1.5 h-12 bg-[#e3ae97] rounded-full shadow-[0_0_25px_rgba(227,174,151,0.4)]" />
            <h1 className="font-luxury text-4xl md:text-7xl text-[#1a1a1a] tracking-tight leading-none">Hidden Vision</h1>
          </div>
          <p className="text-[10px] md:text-[11px] text-stone-400 font-black uppercase tracking-[0.3em] pl-[1.8rem]">
            Object Recognition <span className="text-stone-300 mx-1">/</span> <span className="text-stone-900">Admin Control</span>
          </p>
        </div>
        
        <button className="group px-8 py-4 bg-[#1a1a1a] text-white rounded-full text-[10px] font-black uppercase tracking-[0.4em] transition-all hover:bg-stone-800 flex items-center justify-center gap-4 shadow-xl" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={16} />
          <span>New Scene</span>
        </button>
      </header>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-stone-900/10 backdrop-blur-[4px]" onClick={resetForm} />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-[95vw] h-[90vh] rounded-[48px] shadow-2xl border border-stone-50 flex flex-col overflow-hidden"
            >
              <header className="px-10 py-8 flex justify-between items-center border-b border-stone-100 bg-white/60 backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${editingId ? 'bg-[#e3ae97]' : 'bg-stone-900'} text-white`}>
                     {editingId ? <Edit2 size={24} strokeWidth={1.5} /> : <Plus size={24} strokeWidth={1.5} />}
                  </div>
                  <div>
                    <h2 className="font-luxury text-3xl text-stone-900 tracking-tight leading-none">
                      {editingId ? 'Refining Architecture' : 'Initialize Protocol'}
                    </h2>
                    <p className="text-[8.5px] font-black uppercase tracking-[3px] text-stone-300 mt-1.5">Hidden Vision Design Studio</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button className="px-8 py-3 bg-[#1a1a1a] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition-all flex items-center gap-3 shadow-xl" onClick={handleSubmit}>
                    <Save size={16} strokeWidth={1.5} /> {editingId ? 'Update Protocol' : 'Authorize Scene'}
                  </button>
                  <button onClick={resetForm} className="p-3 rounded-full hover:bg-stone-50 transition-colors text-stone-300 hover:text-stone-900">
                    <X size={20} />
                  </button>
                </div>
              </header>

              <div className="flex-1 flex overflow-hidden relative bg-[#f9f7f4]">
                <aside className="w-96 border-r border-stone-100 bg-white overflow-y-auto p-10 space-y-8 z-20 shrink-0">
                  <div className="space-y-6">
                    <div className="space-y-2.5">
                      <label className="text-[9px] font-black uppercase tracking-[2px] text-stone-500 ml-2">Scene Title</label>
                      <input 
                        type="text" 
                        value={formData.title} 
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-[24px] outline-none text-[14px] font-medium text-stone-900"
                        placeholder="e.g. Vintage Camera Shop"
                      />
                    </div>

                    <div className="space-y-2.5">
                      <label className="text-[9px] font-black uppercase tracking-[2px] text-stone-500 ml-2">Complexity</label>
                      <select 
                        value={formData.difficulty} 
                        onChange={e => setFormData({...formData, difficulty: e.target.value})}
                        className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-[24px] outline-none text-[11px] font-black uppercase tracking-widest text-stone-900 appearance-none cursor-pointer"
                      >
                        <option value="easy">Novice</option>
                        <option value="medium">Specialist</option>
                        <option value="hard">Legend</option>
                      </select>
                    </div>

                    <div className="space-y-2.5">
                      <label className="text-[9px] font-black uppercase tracking-[2px] text-stone-500 ml-2">Source Asset</label>
                      <div className="preview-media-box">
                        {formData.imageUrl ? (
                          <div className="relative group">
                            <img src={resolveImageUrl(formData.imageUrl)} alt="Source" className="w-full h-[180px] object-cover rounded-3xl" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center">
                               <label className="px-4 py-2 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-full cursor-pointer">Change Image
                                 <input type="file" hidden onChange={handleFileUpload} />
                               </label>
                            </div>
                          </div>
                        ) : (
                          <label className="relative h-[180px] border-2 border-dashed border-stone-200 rounded-[32px] flex flex-col items-center justify-center gap-4 hover:border-[#e3ae97] transition-colors cursor-pointer bg-stone-50/50">
                            <ImageIcon className="text-stone-300" size={32} />
                            <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Upload Scene</span>
                            <input type="file" hidden onChange={handleFileUpload} />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-stone-100 space-y-6">
                    <label className="text-[9px] font-black uppercase tracking-[2px] text-stone-400">Mapped Entities ({formData.objects.length})</label>
                    <div className="space-y-3">
                      {formData.objects.map((obj, i) => (
                        <div key={i} className="flex justify-between items-center p-4 bg-stone-50 rounded-2xl border border-stone-100">
                          <span className="text-[12px] font-medium text-stone-900">{obj.name}</span>
                          <button onClick={() => removePoint(i)} className="text-stone-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </aside>

                <main className="flex-1 p-12 overflow-y-auto flex flex-col items-center bg-[#fdfaf6]">
                  <div className="w-full h-full flex flex-col gap-8">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-[#e3ae97] animate-pulse" />
                        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-stone-900">Calibration Stage</h4>
                      </div>
                      
                      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-stone-100">
                         <input 
                           type="text"
                           placeholder="Object Name..."
                           value={currentMapping.name}
                           onChange={(e) => setCurrentMapping({ ...currentMapping, name: e.target.value })}
                           className="px-4 py-2 text-xs border-none outline-none w-48"
                         />
                         <button className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isMapping ? 'bg-[#e3ae97] text-white' : 'bg-stone-100 text-stone-400'}`} onClick={() => setIsMapping(!isMapping)}>
                           {currentMapping.x > 0 ? 'Reposition' : 'Place Marker'}
                         </button>
                         {currentMapping.x > 0 && (
                           <button className="p-2 bg-[#1a1a1a] text-white rounded-xl" onClick={addPoint}>
                             <Check size={16} />
                           </button>
                         )}
                      </div>
                    </div>

                    <div 
                      className="mapping-container relative flex-1"
                      style={{ 
                        overflow: 'hidden', 
                        background: '#1a1a1a',
                        borderRadius: '40px',
                        cursor: isMapping ? 'crosshair' : 'default'
                      }}
                      onClick={handleImageClick}
                    >
                      {formData.imageUrl ? (
                        <div className="w-full h-full relative flex items-center justify-center">
                          <img 
                            ref={imageRef}
                            src={resolveImageUrl(formData.imageUrl)} 
                            alt="Scene" 
                            className="w-full h-full object-contain"
                            draggable="false"
                          />
                          {isAnalyzing && <div className="ho-scanline" />}
                          
                          {formData.objects.map((obj, i) => (
                            <div 
                              key={i}
                              className="absolute transform -translate-x-1/2 -translate-y-1/2 border-2 border-white/50 bg-[#e3ae9733] rounded-full"
                              style={{ 
                                left: `${obj.x}%`, 
                                top: `${obj.y}%`,
                                width: '40px', height: '40px'
                              }}
                            >
                              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[8px] text-white whitespace-nowrap">{obj.name}</div>
                            </div>
                          ))}

                          {currentMapping.x > 0 && (
                            <div 
                              className="absolute transform -translate-x-1/2 -translate-y-1/2 border-2 border-[#e3ae97] bg-[#e3ae9733] rounded-full shadow-[0_0_20px_#e3ae97]"
                              style={{ 
                                left: `${currentMapping.x}%`, 
                                top: `${currentMapping.y}%`,
                                width: '40px', height: '40px'
                              }}
                            >
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#1a1a1a] text-white text-[8px] rounded-full whitespace-nowrap uppercase tracking-widest">Awaiting Confirmation</div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-600 gap-4">
                          <ImageIcon size={48} strokeWidth={1} />
                          <p className="text-[10px] font-black uppercase tracking-[0.4em]">Awaiting Source Asset</p>
                        </div>
                      )}
                    </div>
                  </div>
                </main>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="scenes-grid max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {images.map(img => (
          <div key={img._id} className="game-card bg-white rounded-[32px] overflow-hidden border border-stone-50 shadow-[0_10px_40px_rgba(0,0,0,0.04)] group cursor-pointer transition-all hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:-translate-y-2">
            <div className="relative h-56 bg-stone-100">
              <img src={resolveImageUrl(img.imageUrl)} alt={img.title} className="w-full h-full object-cover" />
              <div className={`absolute top-5 right-5 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${img.difficulty === 'hard' ? 'bg-stone-900 text-white' : 'bg-white text-stone-900 shadow-lg'}`}>
                {img.difficulty}
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button onClick={() => handleEdit(img)} className="p-3 bg-white text-black rounded-full"><Edit2 size={18} /></button>
                <button onClick={() => handleDelete(img._id)} className="p-3 bg-red-500 text-white rounded-full"><Trash2 size={18} /></button>
              </div>
            </div>
            <div className="p-8">
              <h3 className="font-luxury text-2xl text-stone-900 mb-4">{img.title}</h3>
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[2px] text-stone-400">
                <span className="flex items-center gap-2"><Target size={12} /> {img.objects?.length || 0} Entities</span>
                <span className={`flex items-center gap-2 ${img.isActive ? 'text-[#e3ae97]' : 'text-stone-300'}`}>
                  <Check size={12} /> {img.isActive ? 'Active' : 'Draft'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HiddenObjectManager;
