import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Produit } from '../modeles/produit.model';

const MAX_COMPARE = 4;
const LS_KEY = 'pharmacare-compare';

@Injectable({ providedIn: 'root' })
export class CompareService {
  private _items = new BehaviorSubject<Produit[]>(this.load());
  readonly items$ = this._items.asObservable();

  get items(): Produit[] { return this._items.value; }
  get count(): number { return this._items.value.length; }

  isInCompare(id: number): boolean {
    return this._items.value.some(p => p.id === id);
  }

  toggle(produit: Produit): 'added' | 'removed' | 'full' {
    const current = this._items.value;
    const idx = current.findIndex(p => p.id === produit.id);
    if (idx >= 0) {
      const next = current.filter(p => p.id !== produit.id);
      this._items.next(next);
      this.save(next);
      return 'removed';
    }
    if (current.length >= MAX_COMPARE) return 'full';
    const next = [...current, produit];
    this._items.next(next);
    this.save(next);
    return 'added';
  }

  remove(id: number): void {
    const next = this._items.value.filter(p => p.id !== id);
    this._items.next(next);
    this.save(next);
  }

  clear(): void {
    this._items.next([]);
    this.save([]);
  }

  private save(items: Produit[]): void {
    try { localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch {}
  }

  private load(): Produit[] {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }
}
