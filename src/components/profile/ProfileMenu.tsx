import { forwardRef } from 'react';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  path?: string;
  count?: number;
  primary?: boolean;
  onClick?: () => void;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface ProfileMenuProps {
  sections: MenuSection[];
}

const ProfileMenu = forwardRef<HTMLDivElement, ProfileMenuProps>(
  ({ sections }, ref) => {
    return (
      <div ref={ref} className="px-4 mt-6 space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="bg-card rounded-2xl overflow-hidden border border-border/50">
            <h3 className="px-4 py-3 text-sm font-semibold text-muted-foreground border-b border-border/50 bg-secondary/30">
              {section.title}
            </h3>
            {section.items.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-4 hover:bg-secondary/50 transition-colors",
                    index !== section.items.length - 1 && "border-b border-border/30"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg",
                    item.primary ? "bg-primary/10" : "bg-secondary"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5",
                      item.primary ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  {item.count !== undefined && (
                    <span className="text-sm text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                      {item.count}
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  }
);

ProfileMenu.displayName = 'ProfileMenu';

export default ProfileMenu;
