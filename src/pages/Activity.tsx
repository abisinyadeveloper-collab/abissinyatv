import { useState, useEffect } from 'react';
import { Bell, Heart, MessageCircle, UserPlus, Play } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatTimeAgo } from '@/lib/format';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'new_video';
  message: string;
  thumbnail?: string;
  timestamp: Date;
  read: boolean;
}

const Activity = () => {
  const { user, isGuest, setShowAuthModal, setAuthAction } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading notifications
    setLoading(true);
    setTimeout(() => {
      if (!isGuest) {
        setNotifications([
          {
            id: '1',
            type: 'like',
            message: 'John liked your video "Amazing Performance"',
            thumbnail: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200',
            timestamp: new Date(Date.now() - 3600000),
            read: false
          },
          {
            id: '2',
            type: 'comment',
            message: 'Sarah commented: "This is incredible!"',
            thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200',
            timestamp: new Date(Date.now() - 7200000),
            read: false
          },
          {
            id: '3',
            type: 'follow',
            message: 'Mike started following you',
            timestamp: new Date(Date.now() - 86400000),
            read: true
          },
          {
            id: '4',
            type: 'new_video',
            message: 'Music Channel uploaded a new video',
            thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200',
            timestamp: new Date(Date.now() - 172800000),
            read: true
          }
        ]);
      }
      setLoading(false);
    }, 500);
  }, [isGuest]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment': return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow': return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'new_video': return <Play className="w-5 h-5 text-purple-500" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  if (isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">Sign in to see activity</h2>
          <p className="text-muted-foreground mb-6">
            Track likes, comments, and new videos from channels you follow
          </p>
          <button 
            onClick={() => {
              setAuthAction('view your activity');
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

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-nav px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Activity</h1>
          {notifications.some(n => !n.read) && (
            <button className="text-sm text-primary font-medium">
              Mark all as read
            </button>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`flex gap-3 p-4 transition-colors ${
                  !notification.read ? 'bg-primary/5' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTimeAgo(notification.timestamp)}
                  </p>
                </div>
                {notification.thumbnail && (
                  <div className="w-16 h-10 rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={notification.thumbnail} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activity;
