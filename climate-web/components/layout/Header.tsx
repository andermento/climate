'use client';

import React from 'react';
import { Thermometer, Menu, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [isDark, setIsDark] = React.useState(true);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left: Logo and Menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/20">
              <Thermometer className="h-6 w-6 text-accent" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-text">Climate Explorer</h1>
              <p className="text-xs text-text-muted">272 years of data</p>
            </div>
          </div>
        </div>

        {/* Right: Theme Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDark(!isDark)}
            title="Toggle theme"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-text-muted" />
            ) : (
              <Moon className="h-5 w-5 text-text-muted" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;
