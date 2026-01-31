import { Settings, Edit3 } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
}

interface ProfileHeaderProps {
  user: User;
  userProfile: UserProfile | null;
}

const ProfileHeader = ({ user, userProfile }: ProfileHeaderProps) => {
  return (
    <div className="relative">
      {/* Cover gradient */}
      <div className="h-32 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent" />
      
      {/* Profile card - overlapping cover */}
      <div className="px-4 -mt-16">
        <div className="bg-card rounded-2xl p-6 shadow-lg border border-border/50">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative">
              <img 
                src={userProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                alt={userProfile?.username}
                className="w-20 h-20 rounded-full bg-muted ring-4 ring-background"
              />
              <button className="absolute -bottom-1 -right-1 p-1.5 bg-primary rounded-full text-primary-foreground hover:opacity-90 transition-opacity">
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
            
            {/* User info */}
            <div className="flex-1 min-w-0 pt-2">
              <h2 className="font-bold text-xl truncate">
                {userProfile?.username || 'User'}
              </h2>
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {user?.email}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  Creator
                </span>
              </div>
            </div>
            
            {/* Settings button */}
            <button className="p-2.5 hover:bg-secondary rounded-full transition-colors">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
