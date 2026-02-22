import { Injectable } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  theme: Theme;

  constructor() {
    this.theme = this.getStoredTheme() || 'light';
    this.applyTheme();
  }

  private getStoredTheme(): Theme | null {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {}
    return null;
  }

  get isDark(): boolean { return this.theme === 'dark'; }
  get isLight(): boolean { return this.theme === 'light'; }

  toggle(): void {
    this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
  }

  setTheme(t: Theme): void {
    this.theme = t;
    try { localStorage.setItem('theme', t); } catch {}
    this.applyTheme();
  }

  private applyTheme(): void {
    document.documentElement.setAttribute('data-theme', this.theme);
  }
}
