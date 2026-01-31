import { forwardRef } from 'react';
import { Home, Compass, Upload, Bell, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Compass, label: 'Explore', path: '/explore' },
  { icon: Upload, label: 'Upload', path: '/upload' },
  { icon: Bell, label: 'Activity', path: '/activity' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const BottomNav = forwardRef<HTMLElement>((_, ref) => {
  const location = useLocation();

  return (
    <nav ref={ref} className="fixed bottom-0 left-0 right-0 z-50 glass-nav pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          const isUpload = path === '/upload';
          
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200",
                isActive && !isUpload && "text-primary",
                !isActive && !isUpload && "text-muted-foreground hover:text-foreground",
                isUpload && "relative"
              )}
            >
              {isUpload ? (
                <div className="bg-primary rounded-xl p-3 -mt-4 shadow-lg shadow-primary/30">
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
              ) : (
                <>
                  <Icon className={cn("w-5 h-5", isActive && "fill-current")} />
                  <span className="text-[10px] font-medium">{label}</span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
});

BottomNav.displayName = 'BottomNav';

export default BottomNav;
