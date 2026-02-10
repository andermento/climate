'use client';

import React from 'react';
import { Thermometer, Search, Menu, Moon, Sun, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  onMenuClick?: () => void;
  onSearch?: (query: string) => void;
}

export function Header({ onMenuClick, onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isDark, setIsDark] = React.useState(true);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

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

        {/* Center: Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              type="text"
              placeholder="Search city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50"
            />
          </div>
        </form>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Filters */}
          <div className="hidden md:flex items-center gap-2 mr-2">
            <Button variant="ghost" size="sm" className="text-text-muted hover:text-text">
              Global
            </Button>
            <Button variant="ghost" size="sm" className="text-text-muted hover:text-text">
              Decades
            </Button>
          </div>

          {/* Theme Toggle */}
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

          {/* GitHub Link */}
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://github.com/andersonxn/climate-etl-pipeline"
              target="_blank"
              rel="noopener noreferrer"
              title="View on GitHub"
            >
              <Github className="h-5 w-5 text-text-muted" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;
