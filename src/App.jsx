import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Home, AlertCircle, Menu, X, Shield, Lock, Loader2, BarChart3, Bell, BellOff, ShieldX } from 'lucide-react';
import { ToastContainer } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';
import RoleSelector from './components/RoleSelector';
import RoleBadge from './components/RoleBadge';
import SOSButton from './components/SOSButton';
import SoundNotification from './components/SoundNotification';
import { soundControls, playSound } from './utils/soundEffects';
import { subscribeToIncidents } from './services/socket';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Report = lazy(() => import('./pages/Report'));
const ResponderDashboard = lazy(() => import('./pages/ResponderDashboard'));
const HeroLanding = lazy(() => import('./pages/HeroLanding'));
const Analytics = lazy(() => import('./pages/Analytics'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
      <p className="text-gray-400 animate-pulse">Loading...</p>
    </div>
  </div>
);

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(soundControls.isEnabled());
  const { user, hasPermission } = useAuth();

  // Toggle sound
  const toggleSound = () => {
    const newState = soundControls.toggle();
    setSoundEnabled(newState);
    soundControls.init(); // Initialize audio context on user interaction
  };

  // Close menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { path: '/dashboard', label: 'Live Dashboard', icon: Home },
    { path: '/report', label: 'Report Incident', icon: AlertCircle },
    { path: '/responder', label: 'Responder Portal', icon: Shield, requiredRole: 'responder' },
    { path: '/analytics', label: 'Analytics', icon: BarChart3, requiredRole: 'admin' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="bg-black/90 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-lg sm:text-xl">🚨</span>
              </div>
              <span className="text-white font-bold text-lg sm:text-xl hidden sm:block">
                EmergencyHub
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const canAccess = !link.requiredRole || hasPermission(link.requiredRole);
                return (
                  <Link
                    key={link.path}
                    to={canAccess ? link.path : '#'}
                    onClick={(e) => !canAccess && e.preventDefault()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      !canAccess 
                        ? 'text-gray-600 cursor-not-allowed'
                        : isActive(link.path)
                          ? 'bg-red-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{link.label}</span>
                    {!canAccess && <Lock size={14} className="text-gray-600" />}
                  </Link>
                );
              })}
              
              {/* Sound Toggle & Role Badge */}
              <div className="ml-2 pl-2 border-l border-gray-700 flex items-center gap-2">
                {/* Sound Toggle - Only show for responder/admin */}
                {hasPermission('responder') && (
                  <button
                    onClick={toggleSound}
                    className={`relative p-2 rounded-lg transition-all group ${
                      soundEnabled 
                        ? 'text-green-400 hover:bg-green-500/10' 
                        : 'text-gray-500 hover:bg-gray-800'
                    }`}
                    title={soundEnabled ? 'Sound notifications ON' : 'Sound notifications OFF'}
                  >
                    {soundEnabled ? <Bell size={20} /> : <BellOff size={20} />}
                    {/* Tooltip */}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 
                                   bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 
                                   group-hover:opacity-100 transition-opacity pointer-events-none">
                      Sound notifications
                    </span>
                  </button>
                )}
                <RoleBadge />
              </div>
            </div>

            {/* Mobile Menu Button - Enhanced touch target */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white p-3 -mr-2 rounded-lg hover:bg-gray-800/50 active:bg-gray-800 transition-colors touch-manipulation"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              <div className="relative w-6 h-6">
                <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${mobileMenuOpen ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'}`}>
                  <X size={24} />
                </span>
                <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${mobileMenuOpen ? '-rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}>
                  <Menu size={24} />
                </span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay & Drawer */}
      <div className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Slide-in Menu */}
        <div className={`absolute top-14 right-0 w-72 max-w-[85vw] h-[calc(100vh-56px)] bg-gray-900/98 border-l border-gray-800 shadow-2xl shadow-black/50 transition-transform duration-300 ease-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-4 space-y-2">
            {/* Menu Header */}
            <div className="px-4 py-2 border-b border-gray-800 mb-4">
              <p className="text-gray-500 text-xs uppercase tracking-wider font-medium">Navigation</p>
            </div>
            
            {navLinks.map((link) => {
              const Icon = link.icon;
              const canAccess = !link.requiredRole || hasPermission(link.requiredRole);
              return (
                <Link
                  key={link.path}
                  to={canAccess ? link.path : '#'}
                  onClick={(e) => {
                    if (!canAccess) e.preventDefault();
                    else setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all touch-manipulation active:scale-[0.98] ${
                    !canAccess
                      ? 'text-gray-600 cursor-not-allowed'
                      : isActive(link.path)
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/20'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white active:bg-gray-700'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    !canAccess ? 'bg-gray-800/50' : isActive(link.path) ? 'bg-white/20' : 'bg-gray-800'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-base">{link.label}</span>
                    {!canAccess && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Lock size={10} className="text-gray-600" />
                        <span className="text-xs text-gray-600">{link.requiredRole}+ Only</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
            
            {/* Quick Actions */}
            <div className="pt-4 mt-4 border-t border-gray-800">
              <p className="px-4 text-gray-500 text-xs uppercase tracking-wider font-medium mb-3">Quick Actions</p>
              <Link
                to="/report"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 mx-2 px-4 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 active:scale-[0.98] transition-transform touch-manipulation"
              >
                <AlertCircle size={20} />
                <span>Report Emergency</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Layout component to conditionally show navbar
const Layout = ({ children, showNavbar = true }) => (
  <div className="min-h-screen bg-gray-900">
    {showNavbar && <Navbar />}
    {children}
  </div>
);

// Auth wrapper component with redirect support
const AuthWrapper = ({ children }) => {
  const { isAuthenticated, isLoading, login, user } = useAuth();
  const [shouldRedirect, setShouldRedirect] = React.useState(false);
  const [redirectPath, setRedirectPath] = React.useState('/dashboard');

  // Handle post-login redirect
  React.useEffect(() => {
    if (isAuthenticated && user) {
      const storedRedirect = sessionStorage.getItem('authRedirect');
      if (storedRedirect) {
        setRedirectPath(storedRedirect);
        setShouldRedirect(true);
        sessionStorage.removeItem('authRedirect');
      }
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <RoleSelector onLogin={login} />;
  }

  // Handle redirect after login
  if (shouldRedirect) {
    setShouldRedirect(false);
    window.location.href = redirectPath;
    return <PageLoader />;
  }

  return children;
};

// Protected Route Component - Blocks access based on role
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Not logged in - redirect to home
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }
  
  // Check if user's role is in allowed roles
  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-600/20 rounded-full flex items-center justify-center">
            <ShieldX size={48} className="text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">🚫 Access Denied</h1>
          <p className="text-gray-400 mb-6">
            Authorized Personnel Only. Your role ({user.role}) does not have permission to access this page.
          </p>
          <div className="flex gap-3 justify-center">
            <Link 
              to="/dashboard" 
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all"
            >
              Go to Dashboard
            </Link>
            <Link 
              to="/" 
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return children;
};

// Sound event listener component - only for responder/admin
const SoundEventListener = () => {
  const { hasPermission } = useAuth();

  useEffect(() => {
    // Only subscribe if user is responder or admin
    if (!hasPermission('responder')) return;

    // Initialize sound on component mount
    soundControls.init();

    const unsubscribe = subscribeToIncidents((event) => {
      if (event.type === 'new_incident') {
        const incident = event.data.incident;
        // Play critical alert for critical/high severity
        if (incident?.severity === 'Critical' || incident?.severity === 'High') {
          playSound.criticalAlert();
        } else {
          playSound.newIncident();
        }
      } else if (event.type === 'incident_updated') {
        const status = event.data.status || event.data.incident?.status;
        if (status === 'Dispatched' || status === 'In Progress') {
          playSound.dispatched();
        } else if (status === 'Resolved' || status === 'Closed') {
          playSound.resolved();
        }
      }
    });

    return () => unsubscribe();
  }, [hasPermission]);

  return null;
};

function AppContent() {
  return (
    <AuthWrapper>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Hero Landing - No navbar */}
            <Route path="/" element={<HeroLanding />} />
            
            {/* PUBLIC ROUTES - Anyone logged in can access */}
            <Route path="/report" element={<Layout><Report /></Layout>} />
            
            {/* CITIZEN + EVERYONE - All roles can view dashboard */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['citizen', 'responder', 'admin']}>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            
            {/* RESPONDER PORTAL - Only responders and admins */}
            <Route path="/responder" element={
              <ProtectedRoute allowedRoles={['responder', 'admin']}>
                <Layout><ResponderDashboard /></Layout>
              </ProtectedRoute>
            } />
            
            {/* ADMIN ANALYTICS - Only admins */}
            <Route path="/analytics" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout><Analytics /></Layout>
              </ProtectedRoute>
            } />
          </Routes>
          
          {/* Global SOS Button - Mobile only */}
          <SOSButton />
          
          {/* Sound Notifications - Visual toast for sounds */}
          <SoundNotification />
          
          {/* Sound Event Listener - Triggers sounds on socket events */}
          <SoundEventListener />
        </Suspense>
      </Router>
    </AuthWrapper>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastContainer>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastContainer>
    </ErrorBoundary>
  );
}

export default App;
