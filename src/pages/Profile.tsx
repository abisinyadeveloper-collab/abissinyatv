import { useState } from 'react';
import { LogOut, Clock, Heart, Download, Moon, Bell as BellIcon, Settings, Library } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSavedVideos } from '@/hooks/useSavedVideos';
import { toast } from 'sonner';

// Profile components
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileMenu from '@/components/profile/ProfileMenu';
import GuestProfile from '@/components/profile/GuestProfile';
import SavedVideosView from '@/components/profile/SavedVideosView';

const Profile = () => {
  const { user, userProfile, isGuest, setShowAuthModal, setAuthAction, signOut } = useAuth();
  const { savedVideos, removeVideo } = useSavedVideos();
  const [signingOut, setSigningOut] = useState(false);
  const [showSavedVideos, setShowSavedVideos] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch {
      toast.error('Failed to sign out');
    }
    setSigningOut(false);
  };

  const handleSignIn = () => {
    setAuthAction('access your profile');
    setShowAuthModal(true);
  };

  // Guest view
  if (isGuest) {
    return <GuestProfile onSignIn={handleSignIn} />;
  }

  // Saved videos view
  if (showSavedVideos) {
    return (
      <SavedVideosView
        videos={savedVideos}
        onBack={() => setShowSavedVideos(false)}
        onRemove={(videoId) => {
          removeVideo(videoId);
          toast.success('Video removed from library');
        }}
      />
    );
  }

  // Menu sections
  const menuSections = [
    {
      title: 'Your Library',
      items: [
        { 
          icon: Library, 
          label: 'Saved Videos', 
          count: savedVideos.length,
          primary: true,
          onClick: () => setShowSavedVideos(true)
        },
        { icon: Clock, label: 'Watch History', onClick: () => toast.info('Coming soon!') },
        { icon: Heart, label: 'Liked Videos', onClick: () => toast.info('Coming soon!') },
        { icon: Download, label: 'Downloads', onClick: () => toast.info('Coming soon!') },
      ]
    },
    {
      title: 'Settings',
      items: [
        { icon: BellIcon, label: 'Notifications', onClick: () => toast.info('Coming soon!') },
        { icon: Moon, label: 'Appearance', onClick: () => toast.info('Coming soon!') },
        { icon: Settings, label: 'Settings', onClick: () => toast.info('Coming soon!') },
      ]
    }
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Profile Header with cover */}
      <ProfileHeader user={user!} userProfile={userProfile} />

      {/* Stats */}
      <ProfileStats 
        videoCount={0} 
        savedCount={savedVideos.length} 
        followingCount={0} 
      />

      {/* Menu Sections */}
      <ProfileMenu sections={menuSections} />

      {/* Sign Out Button */}
      <div className="px-4 mt-6 pb-4">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-destructive/10 text-destructive rounded-2xl hover:bg-destructive/20 transition-colors font-medium disabled:opacity-50 active:scale-[0.98]"
        >
          <LogOut className="w-5 h-5" />
          {signingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
};

export default Profile;
