import React from 'react';
import { Button } from '../ui/button';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ className = "", variant = "ghost" }) => {
  const { isDark, toggleTheme } = useTheme();

  const handleToggle = () => {
    console.log('Theme toggle clicked, current theme:', isDark ? 'dark' : 'light');
    toggleTheme();
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleToggle}
      className={`fixed top-20 right-4 z-[9999] bg-card/90 backdrop-blur-sm border border-border shadow-lg hover:bg-accent transition-all duration-200 ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-yellow-500" />
      ) : (
        <Moon className="h-4 w-4 text-muted-foreground" />
      )}
    </Button>
  );
};

export default ThemeToggle;
