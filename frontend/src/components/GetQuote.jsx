import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { 
    CheckCircle, ArrowRight, Camera, Video, LayoutDashboard, MonitorPlay,
    PenTool, Building, Palette, Scissors, Mic, Music, FileText, Users,
    Utensils, Gift, Shirt, Lightbulb, Tv, MapPin, Clock, Calendar, MessageSquare
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || "";

const ICON_MAP = {
    Camera: <Camera size={18} />,
    Video: <Video size={18} />,
    LayoutDashboard: <LayoutDashboard size={18} />,
    MonitorPlay: <MonitorPlay size={18} />,
    PenTool: <PenTool size={18} />,
    Building: <Building size={18} />,
    Palette: <Palette size={18} />,
    Scissors: <Scissors size={18} />,
    Mic: <Mic size={18} />,
    Music: <Music size={18} />,
    FileText: <FileText size={18} />,
    Users: <Users size={18} />,
    Utensils: <Utensils size={18} />,
    Gift: <Gift size={18} />,
    Shirt: <Shirt size={18} />,
    Lightbulb: <Lightbulb size={18} />,
    Tv: <Tv size={18} />
};

const CATEGORY_ICONS = {
    "Core Services": <Camera size={18} />,
    "Event Setup & Styling": <Palette size={18} />,
    "Entertainment Services": <Music size={18} />,
    "Vendor & Logistics": <Utensils size={18} />,
    "Additional Services": <Gift size={18} />,
    "Technical Setup": <Tv size={18} />
};

const EVENT_TYPES = [
    'Weddings',
    'Corporate Events',
    'School Annual Days',
    'Birthday Parties'
];

const GetQuote = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        eventType: '',
        date: '',
        time: '',
        location: '',
        notes: '',
        selectedServices: []
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [serviceCategories, setServiceCategories] = useState([]);
    const [allServices, setAllServices] = useState([]);
    const [isMounted, setIsMounted] = useState(true);

    useEffect(() => {
        setIsMounted(true);
        const fetchServices = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/services`);
                if (isMounted) {
                    setAllServices(res.data);

                    // Group by category
                    const groups = {};
                    res.data.forEach(s => {
                        if (!groups[s.category]) groups[s.category] = [];
                        groups[s.category].push(s);
                    });

                    const formattedCategories = Object.keys(groups).map(catName => ({
                        name: catName,
                        icon: CATEGORY_ICONS[catName] || <CheckCircle size={18} />,
                        services: groups[catName]
                    }));

                    setServiceCategories(formattedCategories);
                }
            } catch (err) {
                console.error("Failed to load services", err);
            }
        };
        fetchServices();
        return () => setIsMounted(false);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleService = (serviceName) => {
        setFormData(prev => {
            const isSelected = prev.selectedServices.includes(serviceName);
            if (isSelected) {
                return { ...prev, selectedServices: prev.selectedServices.filter(s => s !== serviceName) };
            } else {
                return { ...prev, selectedServices: [...prev.selectedServices, serviceName] };
            }
        });
    };

    // Calculate Total Price
    const totalPrice = useMemo(() => {
        let total = 0;
        formData.selectedServices.forEach(serviceName => {
            const srv = allServices.find(s => s.name === serviceName);
            if (srv) total += srv.price;
        });
        return total;
    }, [formData.selectedServices, allServices]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            toast.error("Please enter your full name.");
            return;
        }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error("Please enter a valid email address.");
            return;
        }
        if (!formData.phone.trim()) {
            toast.error("Please enter your phone number.");
            return;
        }
        if (!formData.eventType) {
            toast.error("Please select an event type.");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                phone: formData.phone,
                eventType: formData.eventType,
                eventDate: formData.date,
                eventLocation: formData.location,
                notes: `Time: ${formData.time}\n\n${formData.notes}`,
                services: formData.selectedServices,
                totalAmount: totalPrice
            };

            await axios.post(`${API_URL}/api/leads/public`, payload);
            if (isMounted) {
                setIsSubmitted(true);
            }
            toast.success("Booking request submitted successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to submit request. Please try again.");
        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 pt-40 pb-20">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-xl w-full bg-white rounded-3xl p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100"
                >
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500 shadow-inner">
                        <CheckCircle size={48} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-3xl font-light mb-4 uppercase tracking-[4px] text-stone-800">Booking Received</h2>
                    <p className="text-stone-500 mb-8 leading-relaxed">
                        Thank you for booking with Man On Vision. We have received your request for a {formData.eventType} and will be in touch shortly to finalize the details.
                    </p>
                    <div className="space-y-4">
                        <button 
                            onClick={() => setIsSubmitted(false)}
                            className="bg-stone-900 text-white w-full py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-stone-800 transition-colors"
                        >
                            Book Another Event <ArrowRight size={16} />
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="font-sans text-[#1C1C1C] bg-[#FDFBF7] min-h-screen selection:bg-stone-200 selection:text-stone-900 pt-32 pb-20">
            <Toaster position="top-right" />
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                
                <div className="text-center mb-16">
                    <span className="text-xs font-bold uppercase tracking-[4px] text-[#D4AF37] mb-4 block">Event Management</span>
                    <h1 className="text-4xl md:text-5xl font-light uppercase tracking-[4px] text-stone-800">Book Your Event</h1>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-8">
                    {/* Main Booking Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 bg-white rounded-3xl p-8 lg:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100"
                    >
                            
                            {/* Personal Details */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-800 mb-6 border-b border-stone-100 pb-3">1. Personal Details</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs text-stone-500 mb-2 uppercase tracking-wide">First Name</label>
                                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-stone-500 mb-2 uppercase tracking-wide">Last Name</label>
                                        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-stone-500 mb-2 uppercase tracking-wide">Email</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-stone-500 mb-2 uppercase tracking-wide">Phone</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all" />
                                    </div>
                                </div>
                            </div>

                            {/* Event Information */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-800 mb-6 border-b border-stone-100 pb-3">2. Event Details</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs text-stone-500 mb-3 uppercase tracking-wide">Event Type *</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {EVENT_TYPES.map(type => (
                                                <div 
                                                    key={type}
                                                    onClick={() => setFormData({...formData, eventType: type})}
                                                    className={`cursor-pointer border rounded-xl p-4 text-center transition-all ${formData.eventType === type ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-[#D4AF37] shadow-sm' : 'border-stone-200 bg-stone-50 hover:border-stone-300 text-stone-600'}`}
                                                >
                                                    <span className="text-xs font-semibold">{type}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-stone-500 mb-2 uppercase tracking-wide">Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-3.5 text-stone-400" size={16} />
                                            <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-all" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-stone-500 mb-2 uppercase tracking-wide">Time</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-3.5 text-stone-400" size={16} />
                                            <input type="time" name="time" value={formData.time} onChange={handleChange} required className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-all" />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs text-stone-500 mb-2 uppercase tracking-wide">Location / Venue</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-3.5 text-stone-400" size={16} />
                                            <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Grand Taj, Mumbai" required className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Service Selection */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-800 mb-6 border-b border-stone-100 pb-3">3. Build Your Package</h3>
                                <div className="space-y-8">
                                    {serviceCategories.length === 0 ? (
                                        <div className="text-center py-10 text-stone-400 animate-pulse">Loading Services...</div>
                                    ) : (
                                        serviceCategories.map(category => (
                                            <div key={category.name} className="bg-stone-50/50 rounded-2xl p-6 border border-stone-100">
                                                <div className="flex items-center gap-3 mb-5">
                                                    <div className="text-[#D4AF37] bg-white p-2 rounded-lg shadow-sm border border-stone-100">{category.icon}</div>
                                                    <h4 className="text-sm font-bold text-stone-800 uppercase tracking-wider">{category.name}</h4>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {category.services.map(service => {
                                                        const isSelected = formData.selectedServices.includes(service.name);
                                                        return (
                                                            <div 
                                                                key={service.name}
                                                                onClick={() => toggleService(service.name)}
                                                                className={`cursor-pointer flex items-center justify-between p-4 rounded-xl border transition-all ${isSelected ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-sm' : 'border-stone-200 bg-white hover:border-stone-300'}`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-[#D4AF37] border-[#D4AF37] text-white' : 'border-stone-300'}`}>
                                                                        {isSelected && <CheckCircle size={14} />}
                                                                    </div>
                                                                    <span className={`text-sm font-medium ${isSelected ? 'text-stone-900' : 'text-stone-600'}`}>{service.name}</span>
                                                                </div>
                                                                <span className="text-xs font-semibold text-stone-500">₹{service.price.toLocaleString()}</span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Additional Notes */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-800 mb-6 border-b border-stone-100 pb-3">4. Additional Notes</h3>
                                <textarea 
                                    name="notes" 
                                    rows="4" 
                                    value={formData.notes} 
                                    onChange={handleChange} 
                                    placeholder="Any custom requests, theme ideas, or special instructions..."
                                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 focus:outline-none focus:border-[#D4AF37] transition-all resize-none"
                                ></textarea>
                            </div>

                        </motion.div>

                    {/* Booking Summary Sidebar */}
                    <div className="xl:w-[400px] shrink-0">
                        <div className="sticky top-24 bg-stone-900 text-white rounded-3xl p-8 shadow-2xl">
                            <h3 className="text-lg font-light uppercase tracking-widest mb-6 pb-6 border-b border-white/10">Booking Summary</h3>
                            
                            <div className="space-y-4 mb-8 min-h-[200px]">
                                {formData.eventType && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-stone-400">Event Type:</span>
                                        <span className="font-semibold text-[#D4AF37]">{formData.eventType}</span>
                                    </div>
                                )}
                                {formData.date && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-stone-400">Date:</span>
                                        <span className="font-semibold">{formData.date}</span>
                                    </div>
                                )}
                                
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <span className="text-xs text-stone-400 uppercase tracking-widest block mb-4">Selected Services</span>
                                    {formData.selectedServices.length === 0 ? (
                                        <p className="text-sm text-stone-500 italic">No services selected yet.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            <AnimatePresence>
                                                {formData.selectedServices.map(srvName => {
                                                    let price = 0;
                                                    const s = allServices.find(x => x.name === srvName);
                                                    if(s) price = s.price;
                                                    
                                                    return (
                                                        <motion.div 
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: 10 }}
                                                            key={srvName} 
                                                            className="flex justify-between items-center text-sm"
                                                        >
                                                            <span className="text-stone-300">{srvName}</span>
                                                            <span className="text-stone-400">₹{price.toLocaleString()}</span>
                                                        </motion.div>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-white/10 pt-6 mb-8">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm text-stone-400 uppercase tracking-widest">Estimated Total</span>
                                    <span className="text-3xl font-light text-[#D4AF37]">₹{totalPrice.toLocaleString()}</span>
                                </div>
                                <p className="text-[10px] text-stone-500 mt-2 text-right">Prices are estimated. Final quote may vary.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#D4AF37] hover:bg-[#C5A028] text-stone-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70 uppercase tracking-widest text-xs"
                            >
                                {loading ? 'Processing...' : 'Submit Booking Request'}
                            </button>
                        </div>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default GetQuote;
