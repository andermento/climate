'use client';

import React from 'react';
import {
  Globe,
  Calendar,
  MapPin,
  BarChart3,
  TrendingUp,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

interface SidebarSectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function SidebarSection({
  title,
  icon,
  defaultOpen = true,
  children,
}: SidebarSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-card-hover transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-accent">{icon}</span>
          <span className="text-sm font-medium text-text">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-text-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-text-muted" />
        )}
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export function Sidebar({ isOpen, onClose, children }: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-72 bg-background border-r border-border transition-transform duration-300 ease-in-out overflow-y-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-border">
          <span className="font-medium text-text">Filters</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Filter sections */}
        <div className="py-2">
          {children || (
            <>
              <SidebarSection
                title="Time Period"
                icon={<Calendar className="h-4 w-4" />}
                defaultOpen={true}
              >
                <div className="text-sm text-text-muted">
                  Select year or range of years
                </div>
              </SidebarSection>

              <SidebarSection
                title="Months"
                icon={<BarChart3 className="h-4 w-4" />}
                defaultOpen={false}
              >
                <div className="text-sm text-text-muted">
                  Select months or seasons
                </div>
              </SidebarSection>

              <SidebarSection
                title="Location"
                icon={<MapPin className="h-4 w-4" />}
                defaultOpen={false}
              >
                <div className="text-sm text-text-muted">
                  Select country or search city
                </div>
              </SidebarSection>

              <SidebarSection
                title="View"
                icon={<Globe className="h-4 w-4" />}
                defaultOpen={false}
              >
                <div className="text-sm text-text-muted">
                  Choose data visualization
                </div>
              </SidebarSection>
            </>
          )}
        </div>

        {/* Stats at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <TrendingUp className="h-4 w-4 text-temp-hot" />
            <span>Average warming: +1.4°C since 1850</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
