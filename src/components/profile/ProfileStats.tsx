import { forwardRef } from 'react';
import { Video as VideoIcon, Bookmark, Users } from 'lucide-react';

interface ProfileStatsProps {
  videoCount: number;
  savedCount: number;
  followingCount: number;
}

const ProfileStats = forwardRef<HTMLDivElement, ProfileStatsProps>(
  ({ videoCount, savedCount, followingCount }, ref) => {
    const stats = [
      { 
        label: 'Videos', 
        value: videoCount, 
        icon: VideoIcon,
        color: 'text-blue-400'
      },
      { 
        label: 'Saved', 
        value: savedCount, 
        icon: Bookmark,
        color: 'text-primary'
      },
      { 
        label: 'Following', 
        value: followingCount, 
        icon: Users,
        color: 'text-green-400'
      },
    ];

    return (
      <div ref={ref} className="px-4 mt-4">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label} 
                className="bg-card rounded-xl p-4 text-center border border-border/50 hover:border-primary/30 transition-colors"
              >
                <Icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

ProfileStats.displayName = 'ProfileStats';

export default ProfileStats;
