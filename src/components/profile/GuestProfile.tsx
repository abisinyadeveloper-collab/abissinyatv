import { forwardRef } from 'react';
import { User, Play, Bookmark, Clock } from 'lucide-react';

interface GuestProfileProps {
  onSignIn: () => void;
}

const GuestProfile = forwardRef<HTMLDivElement, GuestProfileProps>(
  ({ onSignIn }, ref) => {
    return (
      <div ref={ref} className="min-h-screen flex flex-col">
        {/* Header gradient */}
        <div className="h-40 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
        
        <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-20">
          {/* Avatar placeholder */}
          <div className="w-28 h-28 bg-card rounded-full flex items-center justify-center ring-4 ring-background shadow-xl">
            <User className="w-14 h-14 text-muted-foreground" />
          </div>
          
          <h2 className="text-2xl font-bold mt-6">Welcome to ABISINYA</h2>
          <p className="text-muted-foreground text-center mt-2 max-w-xs">
            Sign in to unlock all features and personalize your experience
          </p>
          
          {/* Features grid */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-sm w-full">
            {[
              { icon: Play, label: 'Upload Videos' },
              { icon: Bookmark, label: 'Save Favorites' },
              { icon: Clock, label: 'Watch History' },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.label} 
                  className="flex flex-col items-center gap-2 p-3 bg-card rounded-xl border border-border/50"
                >
                  <Icon className="w-6 h-6 text-primary" />
                  <span className="text-xs text-center text-muted-foreground">{feature.label}</span>
                </div>
              );
            })}
          </div>
          
          {/* Sign in button */}
          <button 
            onClick={onSignIn}
            className="btn-primary mt-8 px-10 py-4 text-lg"
          >
            Sign In
          </button>
          
          <p className="text-xs text-muted-foreground mt-4">
            Create an account or sign in to continue
          </p>
        </div>
      </div>
    );
  }
);

GuestProfile.displayName = 'GuestProfile';

export default GuestProfile;
