import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Trash2, Edit2, X, Target, Save, 
  Image as ImageIcon, MapPin, Eye, MousePointer2,
  Trash, Sparkles, CheckCircle2, ChevronLeft, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { API_URL } from '../../../utils/api';
import './AdminGameManager.css';

const SpotDifferenceManager = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    secondImageUrl: '',
    difficulty: 'medium',
    differences: []
  });
  
  const imageRef = useRef(null);
  const [activeDiff, setActiveDiff] = useState(null);

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

    // Hit detection for existing markers
    const clickedIdx = formData.differences.findIndex(diff => {
      const dist = Math.sqrt(Math.pow(x - diff.x, 2) + Math.pow(y - diff.y, 2));
      // Radius check (approximate converted from px to %)
      const radiusInPercent = (diff.radius / rect.width) * 100;
      return dist <= radiusInPercent;
    });

    if (clickedIdx !== -1) {
      if (activeDiff === clickedIdx) {
        // Remove if already active (one more click to remove)
        const newDiffs = formData.differences.filter((_, i) => i !== clickedIdx);
        setFormData({ ...formData, differences: newDiffs });
        setActiveDiff(null);
        toast.success('Marker removed');
      } else {
        // Select if not active
        setActiveDiff(clickedIdx);
      }
      return;
    }
    
    const newDiff = { x, y, radius: 25 };
    setFormData(prev => {
      const nextDiffs = [...prev.differences, newDiff];
      setActiveDiff(nextDiffs.length - 1);
      return { ...prev, differences: nextDiffs };
    });
  };

  const updateDiffRadius = (index, newRadius) => {
    const newDiffs = [...formData.differences];
    newDiffs[index].radius = parseInt(newRadius);
    setFormData({ ...formData, differences: newDiffs });
  };

  const removeDiff = (index, e) => {
    e.stopPropagation();
    const newDiffs = formData.differences.filter((_, i) => i !== index);
    setFormData({ ...formData, differences: newDiffs });
    setActiveDiff(null);
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
    if (formData.differences.length === 0) return toast.error('Add at least one difference');
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const authHeader = { headers: { Authorization: `Bearer ${token}` } };
      const data = { ...formData, gameType: 'spot_difference' };
      
      if (selectedImage) {
        await axios.put(`${API_URL}/admin/games/images/${selectedImage._id}`, data, authHeader);
        toast.success('Level updated successfully!');
      } else {
        await axios.post(`${API_URL}/admin/games/images`, data, authHeader);
        toast.success('New level published!');
      }
      setShowModal(false);
      resetForm();
      fetchImages();
    } catch (err) {
      toast.error('Failed to save level');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', imageUrl: '', secondImageUrl: '', difficulty: 'medium', differences: [] });
    setSelectedImage(null);
    setActiveDiff(null);
    setPreviewMode(false);
  };

  const startEdit = (img) => {
    setSelectedImage(img);
    setFormData({
      title: img.title,
      description: img.description || '',
      imageUrl: img.imageUrl,
      secondImageUrl: img.secondImageUrl || '',
      difficulty: img.difficulty,
      differences: img.differences || []
    });
    setShowModal(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you certain you wish to dismantle this challenge protocol? This action is irreversible.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/games/images/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Protocol dismantled');
      fetchImages();
    } catch (err) {
      toast.error('Failed to dismantle protocol');
    }
  };

  return (
    <div className="min-h-screen -m-4 md:-m-10 p-6 md:p-12 bg-transparent relative font-sans selection:bg-rose-100 selection:text-rose-900 overflow-visible">
      {/* Immersive Background Layer */}
      <div className="fixed inset-0 bg-[#fdfaf6] -z-20" />
      
      <header className="relative z-10 max-w-7xl mx-auto mb-10 md:mb-16 px-4 md:px-8 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
        <div className="space-y-1.5 translate-x-1">
          <div className="flex items-center gap-5 mb-2">
            <div className="w-1.5 h-12 bg-[#e3ae97] rounded-full shadow-[0_0_25px_rgba(227,174,151,0.4)] animate-pulse" />
            <h1 className="font-luxury text-4xl md:text-7xl text-[#1a1a1a] tracking-tight leading-none">Spot Master</h1>
          </div>
          <p className="text-[10px] md:text-[11px] text-stone-400 font-black uppercase tracking-[0.3em] md:tracking-[0.5em] pl-[1.8rem] opacity-70">
            Visual Intelligence <span className="text-stone-300 mx-1">/</span> <span className="text-stone-900">Game Design</span>
          </p>
        </div>
        
        <button 
          className="group px-6 md:px-10 py-3.5 md:py-4 bg-[#1a1a1a] text-white rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] transition-all hover:bg-stone-800 hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)] hover:translate-y-[-3px] active:translate-y-0 flex items-center justify-center gap-4 overflow-hidden shadow-xl"
          onClick={() => { resetForm(); setShowModal(true); }}
        >
          <Plus size={16} strokeWidth={1.5} />
          <span>New Challenge</span>
        </button>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        <div className="game-list">
          {images.map(img => (
            <div key={img._id} className="game-card bg-white rounded-[32px] overflow-hidden border border-stone-50 shadow-[0_10px_40px_rgba(0,0,0,0.04)] group cursor-pointer transition-all hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:-translate-y-2" onClick={() => startEdit(img)}>
              <div className="relative h-56 bg-stone-100">
                <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" />
                <div className={`absolute top-5 right-5 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${img.difficulty === 'hard' ? 'bg-stone-900 text-white' : 'bg-white text-stone-900 shadow-lg'}`}>
                  {img.difficulty}
                </div>
              </div>
              <div className="p-8">
                <h3 className="font-luxury text-2xl text-stone-900 mb-4">{img.title}</h3>
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[2px] text-stone-400">
                  <span className="flex items-center gap-2"><Target size={12} strokeWidth={1.5} /> {img.differences.length} Targets</span>
                  <div className="flex items-center gap-4">
                    <span className={`flex items-center gap-2 ${img.isActive ? 'text-[#e3ae97]' : 'text-stone-300'}`}>
                      <CheckCircle2 size={12} strokeWidth={1.5} /> {img.isActive ? 'Active' : 'Draft'}
                    </span>
                    <button 
                      onClick={(e) => handleDelete(e, img._id)}
                      className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowModal(false)} 
              className="absolute inset-0 bg-stone-900/10 backdrop-blur-[4px]" 
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-white w-full max-w-7xl h-[90vh] rounded-[48px] shadow-[0_50px_150px_rgba(0,0,0,0.12)] border border-stone-50 flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <header className="px-10 py-8 flex justify-between items-center border-b border-stone-100 bg-white/60 backdrop-blur-xl">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${selectedImage ? 'bg-[#e3ae97]' : 'bg-stone-900'} text-white`}>
                     {selectedImage ? <Shield size={24} strokeWidth={1.5} /> : <Plus size={24} strokeWidth={1.5} />}
                  </div>
                  <div>
                    <h2 className="font-luxury text-3xl text-stone-900 tracking-tight leading-none">
                      {selectedImage ? 'Refining Architecture' : 'Initialize Protocol'}
                    </h2>
                    <p className="text-[8.5px] font-black uppercase tracking-[3px] text-stone-300 mt-1.5">Spot Master Design Studio</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${previewMode ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'}`}
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    <Eye size={16} strokeWidth={1.5} /> {previewMode ? 'Live Preview' : 'Preview Mode'}
                  </button>
                  
                  <button 
                    className="px-8 py-3 bg-[#1a1a1a] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition-all flex items-center gap-3 shadow-xl"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    <Save size={16} strokeWidth={1.5} /> {loading ? 'Syncing...' : 'Authorize Level'}
                  </button>

                  <button onClick={() => setShowModal(false)} className="p-3 rounded-full hover:bg-stone-50 transition-colors text-stone-300 hover:text-stone-900">
                    <X size={20} />
                  </button>
                </div>
              </header>

              <div className="flex-1 flex overflow-hidden relative bg-[#f9f7f4]">
              {/* Left Configuration Sidebar - Hides in Preview Mode */}
              <AnimatePresence>
                {!previewMode && (
                  <motion.aside 
                    initial={{ width: 0, opacity: 0, x: -50 }}
                    animate={{ width: 384, opacity: 1, x: 0 }}
                    exit={{ width: 0, opacity: 0, x: -50 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="w-96 border-r border-stone-100 bg-white overflow-y-auto custom-scrollbar p-10 space-y-8 z-20"
                  >
                    <div className="space-y-6">
                      <div className="space-y-2.5">
                        <label className="text-[9px] font-black uppercase tracking-[2px] text-stone-500 ml-2">Level Identity</label>
                        <input 
                          type="text" 
                          value={formData.title} 
                          onChange={e => setFormData({...formData, title: e.target.value})}
                          className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-[24px] outline-none focus:border-stone-200 transition-all text-[14px] font-medium text-stone-900 placeholder:text-stone-200"
                          placeholder="e.g. Grand Wedding Hall"
                        />
                      </div>

                      <div className="space-y-2.5">
                        <label className="text-[9px] font-black uppercase tracking-[2px] text-stone-500 ml-2">Briefing</label>
                        <textarea 
                          value={formData.description} 
                          onChange={e => setFormData({...formData, description: e.target.value})}
                          className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-[24px] outline-none focus:border-stone-200 transition-all text-[14px] font-medium text-stone-900 placeholder:text-stone-200 h-32 resize-none"
                          placeholder="Instructions for the user..."
                        />
                      </div>

                      <div className="space-y-2.5">
                        <label className="text-[9px] font-black uppercase tracking-[2px] text-stone-500 ml-2">Complexity</label>
                        <select 
                          value={formData.difficulty} 
                          onChange={e => setFormData({...formData, difficulty: e.target.value})}
                          className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-[24px] outline-none focus:border-stone-200 transition-all text-[11px] font-black uppercase tracking-widest text-stone-900 appearance-none cursor-pointer"
                        >
                          <option value="easy">Novice (Easy)</option>
                          <option value="medium">Specialist (Medium)</option>
                          <option value="hard">Legend (Hard)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-6 pt-8 border-t border-stone-100">
                      <div className="space-y-2.5">
                        <label className="text-[9px] font-black uppercase tracking-[2px] text-stone-500 ml-2">Source Asset (Original)</label>
                        <div className="flex gap-3">
                          <input 
                            type="text" 
                            value={formData.imageUrl} 
                            onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                            className="flex-1 px-6 py-4 bg-stone-50 border border-stone-100 rounded-[24px] outline-none focus:border-stone-200 transition-all text-[12px] text-stone-600"
                            placeholder="Image URL..."
                          />
                          <label className="w-14 h-14 bg-stone-100 flex items-center justify-center rounded-2xl cursor-pointer hover:bg-stone-200 transition-all text-stone-400">
                            <ImageIcon size={18} strokeWidth={1.5} />
                            <input type="file" hidden onChange={e => handleFileUpload(e.target.files[0], 'imageUrl')} />
                          </label>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <label className="text-[9px] font-black uppercase tracking-[2px] text-stone-500 ml-2">Target Asset (Modified)</label>
                        <div className="flex gap-3">
                          <input 
                            type="text" 
                            value={formData.secondImageUrl} 
                            onChange={e => setFormData({...formData, secondImageUrl: e.target.value})}
                            className="flex-1 px-6 py-4 bg-stone-50 border border-stone-100 rounded-[24px] outline-none focus:border-stone-200 transition-all text-[12px] text-stone-600"
                            placeholder="Modified URL..."
                          />
                          <label className="w-14 h-14 bg-stone-100 flex items-center justify-center rounded-2xl cursor-pointer hover:bg-stone-200 transition-all text-stone-400">
                            <ImageIcon size={18} strokeWidth={1.5} />
                            <input type="file" hidden onChange={e => handleFileUpload(e.target.files[0], 'secondImageUrl')} />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-stone-100 space-y-6">
                      <div className="flex justify-between items-center px-2">
                        <label className="text-[9px] font-black uppercase tracking-[2px] text-stone-400">Mapping Repository ({formData.differences.length})</label>
                        {activeDiff !== null && (
                          <button onClick={(e) => removeDiff(activeDiff, e)} className="text-red-400 text-[9px] font-black uppercase tracking-widest hover:text-red-600 transition-colors">Delete Active</button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 px-1">
                        {formData.differences.map((diff, i) => (
                          <button 
                            key={i} 
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-bold transition-all border ${activeDiff === i ? 'bg-[#e3ae97] text-white border-[#e3ae97] shadow-lg' : 'bg-white text-stone-400 border-stone-100 hover:border-stone-200'}`}
                            onClick={() => setActiveDiff(i)}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>

                      {activeDiff !== null && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-6 bg-stone-50 border border-stone-100 rounded-[32px] space-y-4"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Tolerance Radius</span>
                            <span className="text-[12px] font-mono text-[#e3ae97]">{formData.differences[activeDiff].radius}px</span>
                          </div>
                          <input 
                            type="range" 
                            min="10" 
                            max="100" 
                            value={formData.differences[activeDiff].radius}
                            onChange={(e) => updateDiffRadius(activeDiff, e.target.value)}
                            className="w-full accent-[#e3ae97] cursor-pointer"
                          />
                        </motion.div>
                      )}
                    </div>
                  </motion.aside>
                )}
              </AnimatePresence>

              {/* Right Interactive Canvas - Expands in Preview Mode */}
              <main className={`flex-1 transition-all duration-500 overflow-y-auto custom-scrollbar ${previewMode ? 'p-8 md:p-16' : 'p-12'}`}>
                <div className={`mx-auto space-y-8 transition-all duration-500 ${previewMode ? 'max-w-[1600px]' : 'max-w-6xl'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-[#e3ae97] animate-pulse" />
                      <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-stone-900">
                        {previewMode ? 'Focused Master View' : 'Interactive Canvas Repository'}
                      </h4>
                    </div>
                    {previewMode && (
                      <div className="px-6 py-2 bg-stone-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">
                         Focus Protocol Active
                      </div>
                    )}
                  </div>

                    <div className="relative" onClick={handleImageClick}>
                    {formData.imageUrl ? (
                      <div className={`grid grid-cols-1 xl:grid-cols-2 gap-10 items-center justify-items-center w-full`}>
                        <div className="w-full max-w-5xl">
                          <div className="relative rounded-[40px] overflow-hidden shadow-2xl border border-white group">
                            <img src={formData.imageUrl} alt="Source" ref={imageRef} className="w-full h-auto block" draggable="false" />
                            <div className="absolute top-6 left-6 px-4 py-1.5 bg-black/40 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-widest z-30">Original Protocol</div>
                            
                            {formData.differences.map((diff, i) => (
                              <div 
                                key={i} 
                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 border-2 rounded-full flex items-center justify-center cursor-pointer transition-all ${activeDiff === i ? 'border-[#e3ae97] bg-[#e3ae9733] shadow-[0_0_30px_rgba(227,174,151,0.5)] z-20' : 'border-white/50 bg-white/10 z-10'}`}
                                style={{ 
                                  left: `${diff.x}%`, 
                                  top: `${diff.y}%`,
                                  width: `${diff.radius * 2}px`,
                                  height: `${diff.radius * 2}px`
                                }}
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  if (activeDiff === i) {
                                    setFormData(prev => ({ ...prev, differences: prev.differences.filter((_, idx) => idx !== i) }));
                                    setActiveDiff(null);
                                    toast.success('Marker removed');
                                  } else {
                                    setActiveDiff(i);
                                  }
                                }}
                              >
                                <div className="w-5 h-5 bg-white rounded-lg flex items-center justify-center text-[10px] font-black text-stone-900 shadow-md">
                                  {i + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="w-full max-w-5xl">
                          <div className="relative rounded-[40px] overflow-hidden shadow-2xl border border-white">
                            <img src={formData.secondImageUrl || formData.imageUrl} alt="Target" className="w-full h-auto block" draggable="false" />
                            <div className="absolute top-6 left-6 px-4 py-1.5 bg-[#e3ae97]/80 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-widest z-30">Modification Target</div>
                            
                            {previewMode && formData.differences.map((diff, i) => (
                              <div 
                                key={i} 
                                className="absolute w-2 h-2 bg-[#e3ae97] rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_#e3ae97] z-20"
                                style={{ left: `${diff.x}%`, top: `${diff.y}%` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                        <div className="h-[600px] bg-white rounded-[48px] border-2 border-dashed border-stone-100 flex flex-col items-center justify-center gap-6 text-stone-300">
                          <div className="w-24 h-24 rounded-full bg-stone-50 flex items-center justify-center">
                            <ImageIcon size={40} strokeWidth={1} />
                          </div>
                          <p className="text-[11px] font-black uppercase tracking-[0.4em]">Awaiting Source Assets</p>
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
    </div>
  );
};

export default SpotDifferenceManager;
