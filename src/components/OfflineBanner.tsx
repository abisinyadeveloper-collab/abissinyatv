import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { cn } from '@/lib/utils';

const OfflineBanner = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground",
        "flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium",
        "animate-in slide-in-from-top duration-300"
      )}
    >
      <WifiOff className="w-4 h-4" />
      <span>You are offline. Some features may be unavailable.</span>
    </div>
  );
};

export default OfflineBanner;
