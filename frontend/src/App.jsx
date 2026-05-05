import { Routes, Route, useLocation, Outlet, Link } from 'react-router-dom';
import { Suspense, lazy, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Bell } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import LenisProvider from './components/common/LenisProvider';
import ProtectedRoute from './components/ProtectedRoute';
import { useTheme } from './context/ThemeContext';
import Breadcrumbs from './components/common/Breadcrumbs';
import PageTransition from './components/common/PageTransition';

// Lazy load the main components
const HomePage = lazy(() => import('./pages/HomePage/HomePage'));
const AuthPage = lazy(() => import('./components/AuthPage'));
const GetQuote = lazy(() => import('./components/GetQuote'));

// Portal components
import ClientDashboard from './pages/client/ClientDashboard';
const ClientGallery = lazy(() => import('./pages/client/Gallery'));
const Chats = lazy(() => import('./pages/client/Chats'));
const Profile = lazy(() => import('./pages/client/Profile'));
import ClientHeader from './components/client/Header';
import ClientFooter from './components/client/Footer';
import ClientSidebar from './components/client/Sidebar';

// Admin components
import AdminLayout from './admin/components/common/Layout';
const AdminDashboard = lazy(() => import('./admin/pages/Dashboard'));
const AdminCRM = lazy(() => import('./admin/pages/CRM'));
const AdminSmartGallery = lazy(() => import('./admin/pages/SmartGallery'));
const AdminFinance = lazy(() => import('./admin/pages/Finance'));
const AdminCalendarPage = lazy(() => import('./admin/pages/Calendar'));
const AdminActivityLog = lazy(() => import('./admin/pages/ActivityLog'));
const AdminChats = lazy(() => import('./admin/pages/Chats'));
const AdminDriveGalleryDetail = lazy(() => import('./admin/pages/DriveGalleryDetail'));
const AdminClientEvents = lazy(() => import('./admin/pages/ClientEvents'));
const AdminUserManagement = lazy(() => import('./admin/pages/UserManagement'));

// Game Experience Zone
const GameZone = lazy(() => import('./games/GameZone'));
const TicTacToe = lazy(() => import('./games/TicTacToe/TicTacToe'));
const Game2048 = lazy(() => import('./games/Game2048/Game2048'));
const SpotDifference = lazy(() => import('./games/SpotDifference/SpotDifference'));

// Admin Game Management
const AdminGameDashboard = lazy(() => import('./admin/pages/games/AdminGameDashboard'));
const AdminTicTacToeManager = lazy(() => import('./admin/pages/games/TicTacToeManager'));
const Admin2048Manager = lazy(() => import('./admin/pages/games/Game2048Manager'));
const AdminSpotDifferenceManager = lazy(() => import('./admin/pages/games/SpotDifferenceManager'));
const AdminPageManager = lazy(() => import('./admin/pages/games/AdminPageManager'));




const PortalLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  const clientBackgroundStyle = {
    background: `
          radial-gradient(circle at top left, rgba(255, 235, 133, 0.6) 0%, rgba(253, 251, 247, 0) 50%),
          radial-gradient(circle at top right, rgba(255, 182, 193, 0.5) 0%, rgba(253, 251, 247, 0) 50%),
          #FDFBF7
      `,
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed'
  };

  return (
    <div
      className="flex h-screen selection:bg-black selection:text-white overflow-hidden font-sans text-stone-900"
      style={clientBackgroundStyle}
    >
      <div className="hidden lg:block w-[320px] shrink-0 sticky top-0 h-screen">
        <ClientSidebar />
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-[200] lg:hidden transition-transform duration-500 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <ClientSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <div className="lg:hidden">
          <ClientHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        </div>

        <main className="flex-1 w-full max-w-[1200px] px-4 md:px-6 lg:px-8 py-6 lg:py-8 space-y-8 lg:space-y-12 pt-24 lg:pt-8 mx-auto">
          <div className="mb-8 flex justify-between items-center relative z-50">
            <Breadcrumbs />

            <div className="hidden sm:flex items-center gap-4">
              <Link to="/portal/chats" className="w-10 h-10 flex items-center justify-center bg-white/30 backdrop-blur-xl rounded-full border border-white/20 shadow-sm hover:bg-white/50 transition-all text-stone-500 hover:text-luxury-gold">
                <Bell size={18} />
              </Link>
              <Link to="/portal/profile" className="flex items-center gap-3 bg-white/30 backdrop-blur-xl px-4 py-2 rounded-[20px] border border-white/20 shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:bg-white/50 transition-all cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-800 to-black text-[#D4AF37] flex items-center justify-center font-serif text-sm border border-stone-700 shadow-inner">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0) || ''}
                </div>
                <div className="text-left pr-2">
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-stone-800 leading-tight">
                    {user ? `${user.firstName} ${user.lastName}` : "Client User"}
                  </p>
                  <p className="text-[7px] uppercase tracking-[0.2em] text-stone-500 font-medium">
                    {user?.email || "Studio Guest"}
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <PageTransition>
            <Suspense fallback={<div className="flex h-screen w-full items-center justify-center text-xl opacity-50 font-serif">Loading Portal...</div>}>
              <Outlet />
            </Suspense>
          </PageTransition>

          <div className="pt-20">
            <ClientFooter />
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  const location = useLocation();
  const { isDarkMode } = useTheme();

  return (
    <LenisProvider>
      <div className={`font-sans min-h-screen overflow-x-hidden relative transition-colors duration-1000 ${
        isDarkMode 
        ? 'text-white selection:bg-orange-600/30 selection:text-white' 
        : 'text-stone-900 selection:bg-stone-200'
      }`}>
        <Toaster position="top-right" />
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center text-xl font-serif">MAN ON VISION</div>}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/quote" element={<GetQuote />} />
              
              <Route element={<ProtectedRoute allowedRoles={['client']} />}>
                <Route path="/portal" element={<PortalLayout />}>
                  <Route index element={<ClientDashboard />} />
                  <Route path="gallery" element={<ClientGallery />} />
                  <Route path="chats" element={<Chats />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="crm" element={<AdminCRM />} />
                  <Route path="gallery" element={<AdminSmartGallery />} />
                  <Route index path="gallery/:id" element={<AdminClientEvents />} />
                  <Route path="gallery/event/:eventId" element={<AdminDriveGalleryDetail />} />
                  <Route path="finance" element={<AdminFinance />} />
                  <Route path="calendar" element={<AdminCalendarPage />} />
                  <Route path="activity-log" element={<AdminActivityLog />} />
                  <Route path="chats" element={<AdminChats />} />
                  <Route path="users" element={<AdminUserManagement />} />
                  <Route path="games" element={<AdminGameDashboard />} />
                  <Route path="games/tictactoe" element={<AdminTicTacToeManager />} />
                  <Route path="games/2048" element={<Admin2048Manager />} />
                  <Route path="games/spot_difference" element={<AdminSpotDifferenceManager />} />
                  <Route path="games/page-settings" element={<AdminPageManager />} />

                </Route>
              </Route>

              {/* Game Experience Zone Routes */}
              <Route path="/games" element={<GameZone />} />
              <Route path="/games/tictactoe" element={<TicTacToe />} />
              <Route path="/games/2048" element={<Game2048 />} />
              <Route path="/games/spot_difference" element={<SpotDifference />} />
              <Route path="*" element={<AuthPage />} />

            </Routes>
          </AnimatePresence>
        </Suspense>
      </div>
    </LenisProvider>
  );
}

export default App;
