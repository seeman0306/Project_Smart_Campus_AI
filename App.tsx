
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Camera, FileText, Languages, 
  ImageIcon, User, LogOut, Menu, 
  MessageSquare, Bell, GraduationCap, NotebookPen, Search,
  CheckCircle, Sparkles, AlertCircle, Info, X
} from 'lucide-react';
import { User as UserType, AppNotification } from './types';
import { auth, authService, onAuthStateChanged } from './services/firebase';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CameraPage from './pages/Camera';
import Summarizer from './pages/Summarizer';
import Chat from './pages/Chat';
import Translator from './pages/Translator';
import ImageGenerator from './pages/ImageGenerator';
import Profile from './pages/Profile';
import Notes from './pages/Notes';

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  logout: () => void;
  updateUser: (userData: Partial<UserType>) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, searchQuery, setSearchQuery } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<AppNotification[]>([
    { id: '1', title: 'System Online', message: 'Welcome to SmartCampus AI. Your personal vault is ready.', type: 'info', timestamp: Date.now() - 3600000, read: false },
    { id: '2', title: 'Scan Complete', message: 'Calculus Ch.4 has been successfully digitized.', type: 'success', timestamp: Date.now() - 86400000, read: true },
    { id: '3', title: 'AI Insight', message: 'New study pattern detected: You are most productive at 8PM.', type: 'ai', timestamp: Date.now() - 172800000, read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Knowledge Vault', icon: NotebookPen, path: '/notes' },
    { name: 'Scanner (OCR)', icon: Camera, path: '/camera' },
    { name: 'AI Shortener', icon: FileText, path: '/summarizer' },
    { name: 'AI Tutor', icon: MessageSquare, path: '/chat' },
    { name: 'Translator', icon: Languages, path: '/translator' },
    { name: 'Visualizer', icon: ImageIcon, path: '/images' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/notes');
    }
  };

  if (location.pathname === '/' || location.pathname === '/login') return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans antialiased text-slate-900">
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transition-all duration-300 transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <Link to="/dashboard" className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/25">
              <GraduationCap size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">SmartCampus</span>
          </Link>

          <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                  location.pathname === item.path 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 font-semibold' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon size={20} className={location.pathname === item.path ? 'text-white' : 'text-slate-400 group-hover:text-primary'} />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-2 pt-6 border-t border-slate-100">
            <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-2xl transition-colors">
              <User size={20} />
              Profile Settings
            </Link>
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl transition-colors font-medium">
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-30">
          <button className="lg:hidden p-2 text-slate-500" onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
          
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full border border-slate-200 w-96 group focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <div className="text-slate-400"><Search size={16} /></div>
            <input 
              type="text" 
              placeholder="Search your knowledge base..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full font-medium" 
            />
          </form>

          <div className="flex items-center gap-5">
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-xl transition-all ${showNotifications ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-4 w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                  <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <h4 className="font-black text-slate-900 flex items-center gap-2">
                       Notifications {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                    </h4>
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                    >
                      Clear Badge
                    </button>
                  </div>
                  
                  <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-slate-50">
                        {notifications.map((n) => (
                          <div key={n.id} className={`p-5 flex gap-4 transition-colors relative group ${!n.read ? 'bg-primary/[0.02]' : 'hover:bg-slate-50/50'}`}>
                            {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
                            <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                              n.type === 'success' ? 'bg-emerald-50 text-emerald-500' :
                              n.type === 'ai' ? 'bg-purple-50 text-purple-500' :
                              n.type === 'warning' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-50'
                            }`}>
                              {n.type === 'success' ? <CheckCircle size={18} /> :
                               n.type === 'ai' ? <Sparkles size={18} /> :
                               n.type === 'warning' ? <AlertCircle size={18} /> : <Info size={18} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h5 className="text-sm font-black text-slate-900 truncate">{n.title}</h5>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="text-xs text-slate-500 font-medium leading-relaxed">{n.message}</p>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center px-10">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4">
                          <Bell size={32} />
                        </div>
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No notifications yet</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 border-t border-slate-50 bg-slate-50/30 text-center">
                    <button className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                      See Older History
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Link to="/profile" className="flex items-center gap-3 pl-5 border-l border-slate-200 group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{user?.name}</p>
                <p className="text-[10px] font-extrabold text-primary uppercase tracking-widest">{user?.subscription} Member</p>
              </div>
              <img 
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=0066FF&color=fff&bold=true`} 
                className="w-10 h-10 rounded-xl shadow-md border-2 border-white group-hover:scale-105 transition-transform object-cover" 
              />
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 scroll-smooth bg-[#F8FAFC]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: any) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid || firebaseUser.id,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.name || 'Scholar',
          avatar: firebaseUser.photoURL || firebaseUser.avatar || undefined,
          university: firebaseUser.university,
          course: firebaseUser.course,
          subscription: firebaseUser.subscription || 'Pro', 
          preferences: firebaseUser.preferences
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = () => {
    authService.logout();
  };

  const updateUser = (userData: Partial<UserType>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Securely accessing Vault...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, updateUser, searchQuery, setSearchQuery }}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
            <Route path="/camera" element={user ? <CameraPage /> : <Navigate to="/login" replace />} />
            <Route path="/summarizer" element={user ? <Summarizer /> : <Navigate to="/login" replace />} />
            <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" replace />} />
            <Route path="/translator" element={user ? <Translator /> : <Navigate to="/login" replace />} />
            <Route path="/images" element={user ? <ImageGenerator /> : <Navigate to="/login" replace />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" replace />} />
            <Route path="/notes" element={user ? <Notes /> : <Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthContext.Provider>
  );
}
