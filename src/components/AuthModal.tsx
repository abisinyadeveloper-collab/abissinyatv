import { useState } from 'react';
import { X, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const AuthModal = () => {
  const { showAuthModal, setShowAuthModal, authAction, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        if (!username.trim()) {
          throw new Error('Username is required');
        }
        await signUp(email, password, username);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            {authAction && (
              <p className="text-sm text-muted-foreground mt-1">
                Sign in to {authAction}
              </p>
            )}
          </div>
          <button 
            onClick={() => setShowAuthModal(false)}
            className="p-2 hover:bg-secondary rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="w-full bg-secondary px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-secondary pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-secondary px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 pr-12"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full btn-primary py-3.5",
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {mode === 'signup' && (
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Please check your email to verify your account after signing up.
          </p>
        )}

        {/* Toggle mode */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-primary font-medium ml-1 hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
