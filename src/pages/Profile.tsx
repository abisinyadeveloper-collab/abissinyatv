import { useState } from 'react';
import { Settings, LogOut, ChevronRight, User, Clock, Heart, Download, Moon, Bell as BellIcon, Library, Bookmark } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSavedVideos } from '@/hooks/useSavedVideos';
import VideoCard from '@/components/VideoCard';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: Clock, label: 'Watch History', path: '/history' },
  { icon: Heart, label: 'Liked Videos', path: '/liked' },
  { icon: Download, label: 'Downloads', path: '/downloads' },
];

const settingsItems = [
  { icon: BellIcon, label: 'Notifications', path: '/settings/notifications' },
  { icon: Moon, label: 'Appearance', path: '/settings/appearance' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const Profile = () => {
  const { user, userProfile, isGuest, setShowAuthModal, setAuthAction, signOut } = useAuth();
  const { savedVideos } = useSavedVideos();
  const [signingOut, setSigningOut] = useState(false);
  const [showSavedVideos, setShowSavedVideos] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
  };

  if (isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">Sign in to your account</h2>
          <p className="text-muted-foreground mb-6">
            Save videos, track your history, and personalize your experience
          </p>
          <button 
            onClick={() => {
              setAuthAction('access your profile');
              setShowAuthModal(true);
            }}
            className="btn-primary"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (showSavedVideos) {
    return (
      <div className="min-h-screen pb-20">
        {/* Header */}
        <header className="sticky top-0 z-40 glass-nav px-4 py-4">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            <button 
              onClick={() => setShowSavedVideos(false)}
              className="p-2 -ml-2 hover:bg-secondary rounded-full"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <h1 className="text-xl font-bold">Saved Videos</h1>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-4">
          {savedVideos.length > 0 ? (
            <div className="space-y-2">
              {savedVideos.map((video) => (
                <VideoCard key={video.video_id} video={video} variant="horizontal" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No saved videos yet</p>
              <p className="text-sm text-muted-foreground mt-1">Videos you save will appear here</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-nav px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* User Info */}
        <div className="flex items-center gap-4 p-4 bg-card rounded-2xl">
          <img 
            src={userProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
            alt={userProfile?.username}
            className="w-16 h-16 rounded-full bg-muted"
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-lg truncate">
              {userProfile?.username || 'User'}
            </h2>
            <p className="text-sm text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
          <button className="p-2 hover:bg-secondary rounded-full transition-colors">
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Videos', value: '0' },
            { label: 'Saved', value: savedVideos.length.toString() },
            { label: 'Following', value: '0' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Library */}
        <div className="bg-card rounded-2xl overflow-hidden">
          <h3 className="px-4 py-3 text-sm font-medium text-muted-foreground border-b border-border">
            Your Library
          </h3>
          
          {/* Saved Videos - Special */}
          <button
            onClick={() => setShowSavedVideos(true)}
            className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-secondary/50 transition-colors border-b border-border"
          >
            <Library className="w-5 h-5 text-primary" />
            <span className="flex-1 text-left">Saved Videos</span>
            {savedVideos.length > 0 && (
              <span className="text-sm text-muted-foreground">{savedVideos.length}</span>
            )}
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3.5 hover:bg-secondary/50 transition-colors",
                  index !== menuItems.length - 1 && "border-b border-border"
                )}
              >
                <Icon className="w-5 h-5 text-muted-foreground" />
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            );
          })}
        </div>

        {/* Settings */}
        <div className="bg-card rounded-2xl overflow-hidden">
          <h3 className="px-4 py-3 text-sm font-medium text-muted-foreground border-b border-border">
            Settings
          </h3>
          {settingsItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3.5 hover:bg-secondary/50 transition-colors",
                  index !== settingsItems.length - 1 && "border-b border-border"
                )}
              >
                <Icon className="w-5 h-5 text-muted-foreground" />
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            );
          })}
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {signingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
};

export default Profile;
