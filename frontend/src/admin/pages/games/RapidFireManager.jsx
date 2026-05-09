import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Trash2, Edit2, Check, X, Search, 
  Upload, Filter, Save, AlertCircle, ChevronLeft,
  FileText, Download, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { API_URL } from '../../../utils/api';
import './AdminGameManager.css'; // Reusing common styles if any, or I'll create a new one

const RapidFireManager = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    question_en: '',
    question_kn: '',
    options_en: ['', '', '', ''],
    options_kn: ['', '', '', ''],
    correctAnswerIndex: 0,
    category: 'General',
    difficulty: 'easy',
    audioUrl: '',
    isActive: true
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/games/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const autoTranslate = async () => {
    if (!formData.question_en) {
      toast.error('Enter English question first');
      return;
    }

    const toastId = toast.loading('Translating to Kannada...');
    try {
      const translateText = async (text) => {
        if (!text) return '';
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=kn&dt=t&q=${encodeURIComponent(text)}`);
        const data = await res.json();
        return data[0].map(item => item[0]).join('');
      };

      const translatedQuestion = await translateText(formData.question_en);
      const translatedOptions = await Promise.all(
        formData.options_en.map(opt => translateText(opt))
      );

      setFormData(prev => ({
        ...prev,
        question_kn: translatedQuestion,
        options_kn: translatedOptions
      }));

      toast.success('Translation Complete!', { id: toastId });
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed. Please try again.', { id: toastId });
    }
  };

  const handleOptionChange = (lang, index, value) => {
    const field = lang === 'en' ? 'options_en' : 'options_kn';
    const newOptions = [...formData[field]];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, [field]: newOptions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        await axios.put(`${API_URL}/admin/games/questions/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/admin/games/questions`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchQuestions();
      resetForm();
      toast.success(editingId ? 'Question updated' : 'Question published');
    } catch (err) {
      toast.error('Error saving question');
    }
  };

  const resetForm = () => {
    setFormData({
      question_en: '',
      question_kn: '',
      options_en: ['', '', '', ''],
      options_kn: ['', '', '', ''],
      correctAnswerIndex: 0,
      category: 'General',
      difficulty: 'easy',
      isActive: true
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleEdit = (q) => {
    setFormData({
      question_en: q.question_en || '',
      question_kn: q.question_kn || '',
      options_en: q.options_en && q.options_en.length > 0 ? [...q.options_en] : ['', '', '', ''],
      options_kn: q.options_kn && q.options_kn.length > 0 ? [...q.options_kn] : ['', '', '', ''],
      correctAnswerIndex: q.correctAnswerIndex ?? 0,
      category: q.category || 'General',
      difficulty: q.difficulty || 'easy',
      audioUrl: q.audioUrl || '',
      isActive: q.isActive ?? true
    });
    setEditingId(q._id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/games/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Question deleted');
      fetchQuestions();
    } catch (err) {
      toast.error('Error deleting');
    }
  };

  const filteredQuestions = questions.filter(q => 
    (q.question_en?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     q.question_kn?.includes(searchTerm)) ||
    q.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-manager-container">
      <header className="manager-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => window.history.back()}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1>Rapid Fire Manager</h1>
            <p>Manage Kannada quiz database</p>
          </div>
        </div>
        <button className="add-btn-premium" onClick={() => { resetForm(); setShowAddForm(!showAddForm); }}>
          {showAddForm ? <X size={20} /> : <Plus size={20} />}
          {showAddForm ? 'Cancel' : 'Add Question'}
        </button>
      </header>

      {showAddForm && (
        <div className="form-overlay animate-in">
          <form onSubmit={handleSubmit} className="premium-form">
            <h2 className="form-title">{editingId ? 'Edit Question' : 'New Question'}</h2>
            
            <div className="form-row-dual">
              <div className="form-section">
                <label>Question (English)</label>
                <textarea 
                  name="question_en" 
                  value={formData.question_en} 
                  onChange={handleInputChange}
                  placeholder="Enter question in English..."
                  required
                />
              </div>
              <div className="form-field">
                <label>Question (Kannada)</label>
                <div className="translate-action-wrapper">
                  <button 
                    type="button" 
                    className="magic-translate-btn"
                    onClick={autoTranslate}
                    title="Auto-translate English to Kannada"
                  >
                    <Sparkles size={14} />
                    Magic Translate
                  </button>
                </div>
                <textarea 
                  name="question_kn" 
                  value={formData.question_kn} 
                  onChange={handleInputChange}
                  placeholder="ಪ್ರಶ್ನೆಯನ್ನು ಕನ್ನಡದಲ್ಲಿ ನಮೂದಿಸಿ... (Optional)"
                />
              </div>
            </div>

            <div className="options-input-grid-dual">
              <div className="lang-section">
                <h3>English Options</h3>
                {(formData.options_en || ['', '', '', '']).map((opt, i) => (
                  <div key={i} className="option-field">
                    <input 
                      type="text" 
                      value={opt} 
                      onChange={(e) => handleOptionChange('en', i, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + i)} (EN)`}
                      required
                    />
                  </div>
                ))}
              </div>
              <div className="lang-section">
                <h3>Kannada Options</h3>
                {(formData.options_kn || ['', '', '', '']).map((opt, i) => (
                  <div key={i} className="option-field">
                    <input 
                      type="text" 
                      value={opt} 
                      onChange={(e) => handleOptionChange('kn', i, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + i)} (KN - Optional)`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Correct Answer Index</label>
                <select name="correctAnswerIndex" value={formData.correctAnswerIndex} onChange={(e) => setFormData(prev => ({ ...prev, correctAnswerIndex: parseInt(e.target.value) }))} required>
                  <option value={0}>Option A</option>
                  <option value={1}>Option B</option>
                  <option value={2}>Option C</option>
                  <option value={3}>Option D</option>
                </select>
              </div>
              <div className="form-field">
                <label>Category</label>
                <input type="text" name="category" value={formData.category} onChange={handleInputChange} placeholder="e.g. Cinema" />
              </div>
              <div className="form-field">
                <label>Difficulty</label>
                <select name="difficulty" value={formData.difficulty} onChange={handleInputChange}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="form-field">
                <label>Audio URL (Pronunciation)</label>
                <input type="text" name="audioUrl" value={formData.audioUrl} onChange={handleInputChange} placeholder="https://..." />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="secondary-btn" onClick={resetForm}>Discard</button>
              <button type="submit" className="primary-btn-glow">
                <Save size={18} />
                {editingId ? 'Update Question' : 'Publish Question'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="manager-controls">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search questions or categories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bulk-upload-section">
           <input 
             type="file" 
             id="bulk-upload-json" 
             hidden 
             onChange={async (e) => {
               const file = e.target.files[0];
               if (!file) return;
               const reader = new FileReader();
               reader.onload = async (event) => {
                 try {
                   const json = JSON.parse(event.target.result);
                   const token = localStorage.getItem('token');
                   const loadingToast = toast.loading('Importing questions...');
                   for (const q of json) {
                     await axios.post(`${API_URL}/admin/games/questions`, q, {
                       headers: { Authorization: `Bearer ${token}` }
                     });
                   }
                   fetchQuestions();
                   toast.success('Bulk upload successful', { id: loadingToast });
                 } catch (err) { toast.error('Invalid JSON format'); }
               };
               reader.readAsText(file);
             }}
           />
           <input 
             type="file" 
             id="bulk-upload-csv" 
             accept=".csv, .xlsx, .xls"
             hidden 
             onChange={async (e) => {
               const file = e.target.files[0];
               if (!file) return;
               const reader = new FileReader();
               reader.onload = async (event) => {
                 try {
                   const data = new Uint8Array(event.target.result);
                   const workbook = XLSX.read(data, { type: 'array' });
                   const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                   const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                   
                   const questionsToImport = [];
                   // Skip header row
                    for (let i = 1; i < jsonData.length; i++) {
                      const row = jsonData[i];
                      if (!row[0]) continue;
                      questionsToImport.push({
                        question_en: row[0],
                        question_kn: row[1],
                        options_en: [row[2], row[3], row[4], row[5]],
                        options_kn: [row[6], row[7], row[8], row[9]],
                        correctAnswerIndex: parseInt(row[10]) || 0,
                        category: row[11] || 'General',
                        difficulty: row[12] || 'easy',
                        audioUrl: row[13] || '',
                        isActive: true
                      });
                    }

                   const token = localStorage.getItem('token');
                   const loadingToast = toast.loading(`Syncing ${questionsToImport.length} questions...`);
                   for (const q of questionsToImport) {
                     await axios.post(`${API_URL}/admin/games/questions`, q, {
                       headers: { Authorization: `Bearer ${token}` }
                     });
                   }
                   fetchQuestions();
                   toast.success('Document imported successfully', { id: loadingToast });
                 } catch (err) { toast.error('Format error. Use the provided template.'); }
               };
               reader.readAsArrayBuffer(file);
             }}
           />
           <div className="bulk-actions-group">
             <button className="secondary-btn" onClick={() => document.getElementById('bulk-upload-csv').click()}>
               <FileText size={18} />
               Import Document (Excel/CSV)
             </button>
             <button className="secondary-btn" onClick={() => {
                const templateData = [
                  ["Question EN", "Question KN", "Opt A EN", "Opt B EN", "Opt C EN", "Opt D EN", "Opt A KN", "Opt B KN", "Opt C KN", "Opt D KN", "Correct Index (0-3)", "Category", "Difficulty", "Audio URL"],
                  ["Capital of Karnataka?", "ಕರ್ನಾಟಕದ ರಾಜಧಾನಿ ಯಾವುದು?", "Mysuru", "Bengaluru", "Hubballi", "Mangaluru", "ಮೈಸೂರು", "ಬೆಂಗಳೂರು", "ಹುಬ್ಬಳ್ಳಿ", "ಮಂಗಳೂರು", 1, "General", "easy", ""]
                ];
               const ws = XLSX.utils.aoa_to_sheet(templateData);
               const wb = XLSX.utils.book_new();
               XLSX.utils.book_append_sheet(wb, ws, "RapidFireTemplate");
               XLSX.writeFile(wb, "RapidFire_Template.xlsx");
             }}>
               <Download size={18} />
               Template
             </button>
           </div>
        </div>
        <div className="filter-stats">
          <span>{filteredQuestions.length} Questions Found</span>
        </div>
      </div>

      <div className="questions-table-wrapper glass">
        <table className="premium-table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.map(q => (
              <tr key={q._id}>
                <td className="q-text-cell">
                  <div className="q-dual-display">
                    <span className="en">{q.question_en}</span>
                    <span className="kn">{q.question_kn}</span>
                  </div>
                  <div className="options-preview-inline">
                    <div className="preview-group">
                      <span className="preview-label">Options (EN):</span>
                      <span className="preview-values">{(q.options_en || []).join(' | ')}</span>
                    </div>
                    {q.options_kn && q.options_kn.some(o => o) && (
                      <div className="preview-group">
                        <span className="preview-label">Options (KN):</span>
                        <span className="preview-values">{(q.options_kn || []).filter(o => o).join(' | ')}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td><span className="category-badge">{q.category}</span></td>
                <td><span className={`diff-badge ${q.difficulty}`}>{q.difficulty}</span></td>
                <td>
                  <span className={`status-tag ${q.isActive ? 'active' : 'inactive'}`}>
                    {q.isActive ? 'Active' : 'Paused'}
                  </span>
                </td>
                <td className="actions-cell">
                  <button className="icon-btn edit" onClick={() => handleEdit(q)}><Edit2 size={16} /></button>
                  <button className="icon-btn delete" onClick={() => handleDelete(q._id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RapidFireManager;
