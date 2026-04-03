import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { CompareService } from '../../../services/compare.service';
import { TraductionService } from '../../../services/traduction.service';
import { Produit } from '../../../modeles/produit.model';

@Component({
  selector: 'app-compare-bar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  animations: [
    trigger('barSlide', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('380ms cubic-bezier(0.22, 1, 0.36, 1)', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('280ms cubic-bezier(0.4, 0, 1, 1)', style({ transform: 'translateY(100%)', opacity: 0 }))
      ])
    ]),
    trigger('itemPop', [
      transition(':enter', [
        style({ transform: 'scale(0.5)', opacity: 0 }),
        animate('320ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'scale(0.5)', opacity: 0 }))
      ])
    ])
  ],
  template: `
    <div *ngIf="items.length > 0" class="cmp-bar" [@barSlide]>
      <div class="cmp-bar-inner">

        <!-- Thumbnails -->
        <div class="cmp-bar-items">
          <div *ngFor="let p of items" class="cmp-bar-item" [@itemPop]>
            <div class="cmp-bar-item-img">
              <img *ngIf="p.imageUrl" [src]="p.imageUrl" [alt]="p.nom">
              <i *ngIf="!p.imageUrl" class="bi bi-box-seam"></i>
            </div>
            <div class="cmp-bar-item-info">
              <span class="cmp-bar-item-name">{{ p.nom | slice:0:22 }}{{ p.nom.length > 22 ? '…' : '' }}</span>
              <span class="cmp-bar-item-price">{{ p.prix | number:'1.2-2' }} TND</span>
            </div>
            <button class="cmp-bar-item-remove" (click)="remove(p.id!)" [title]="t.isFr ? 'Retirer' : 'Remove'">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <!-- Empty slots -->
          <div *ngFor="let s of emptySlots" class="cmp-bar-slot">
            <i class="bi bi-plus-lg"></i>
            <span>{{ t.isFr ? 'Ajouter' : 'Add' }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="cmp-bar-actions">
          <div class="cmp-bar-count">
            <span class="cmp-bar-count-num">{{ items.length }}</span>
            <span class="cmp-bar-count-label">/4 {{ t.isFr ? 'produits' : 'products' }}</span>
          </div>
          <a routerLink="/comparer" class="cmp-bar-btn cmp-bar-btn-primary" [class.disabled]="items.length < 2">
            <i class="bi bi-bar-chart-steps me-2"></i>
            {{ t.isFr ? 'Comparer' : 'Compare' }}
          </a>
          <button class="cmp-bar-btn cmp-bar-btn-ghost" (click)="clear()">
            <i class="bi bi-trash me-1"></i>
            {{ t.isFr ? 'Vider' : 'Clear' }}
          </button>
        </div>

      </div>
    </div>
  `
})
export class CompareBarComponent implements OnInit, OnDestroy {
  items: Produit[] = [];
  private sub!: Subscription;

  constructor(public compareService: CompareService, public t: TraductionService) {}

  ngOnInit(): void {
    this.sub = this.compareService.items$.subscribe(items => this.items = items);
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  get emptySlots(): null[] {
    return new Array(Math.max(0, 4 - this.items.length)).fill(null);
  }

  remove(id: number): void { this.compareService.remove(id); }
  clear(): void { this.compareService.clear(); }
}
