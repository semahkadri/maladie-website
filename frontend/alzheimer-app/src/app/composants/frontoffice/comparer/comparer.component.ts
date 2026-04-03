import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { CompareService } from '../../../services/compare.service';
import { PanierService } from '../../../services/panier.service';
import { TraductionService } from '../../../services/traduction.service';
import { Produit } from '../../../modeles/produit.model';

@Component({
  selector: 'app-comparer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(32px)' }),
        animate('500ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('colsAnim', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(40px) scale(0.95)' }),
          stagger(80, [
            animate('450ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <div class="fo-section" [@fadeUp]>
      <div class="fo-section-container">

        <!-- Breadcrumb -->
        <div class="fo-breadcrumb">
          <a routerLink="/"><i class="bi bi-house-door"></i></a>
          <i class="bi bi-chevron-right fo-breadcrumb-sep"></i>
          <span class="fo-breadcrumb-current">{{ t.tr('compare.titre') }}</span>
        </div>

        <!-- Page Title -->
        <div class="cmp-page-heading">
          <div>
            <h1 class="fo-page-title">
              <i class="bi bi-bar-chart-steps me-2 cmp-title-icon"></i>{{ t.tr('compare.titre') }}
            </h1>
            <p class="fo-page-subtitle">{{ t.tr('compare.sousTitre') }}</p>
          </div>
          <div class="cmp-heading-actions" *ngIf="items.length > 0">
            <span class="cmp-count-pill">
              <i class="bi bi-layers me-1"></i>{{ items.length }}/4 {{ t.isFr ? 'produits' : 'products' }}
            </span>
            <button class="btn btn-sm btn-outline-danger" (click)="clear()">
              <i class="bi bi-trash me-1"></i>{{ t.isFr ? 'Vider' : 'Clear all' }}
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="items.length === 0" class="fo-empty-state">
          <i class="bi bi-bar-chart-steps"></i>
          <p>{{ t.tr('compare.aucun') }}</p>
          <small class="d-block mb-3 text-muted">{{ t.tr('compare.aucunDesc') }}</small>
          <a routerLink="/catalogue" class="fo-btn fo-btn-outline">
            <i class="bi bi-grid-3x3-gap me-2"></i>{{ t.tr('compare.explorer') }}
          </a>
        </div>

        <!-- Comparison Table -->
        <div *ngIf="items.length > 0" class="card cmp-card" [@colsAnim]="items.length">

          <!-- Row: Product Cards -->
          <div class="cmp-row cmp-row-header" [style.--cols]="items.length">
            <div class="cmp-label-cell">
              <i class="bi bi-box-seam"></i>
              <span>{{ t.isFr ? 'Produit' : 'Product' }}</span>
            </div>
            <div *ngFor="let p of items" class="cmp-data-cell cmp-card-cell">
              <button class="cmp-remove-btn" (click)="remove(p.id!)" [title]="t.isFr ? 'Retirer' : 'Remove'">
                <i class="bi bi-x-lg"></i>
              </button>
              <div class="cmp-card-img">
                <img *ngIf="p.imageUrl" [src]="p.imageUrl" [alt]="p.nom">
                <i *ngIf="!p.imageUrl" class="bi bi-box-seam"></i>
                <span *ngIf="p.enPromo && p.remise" class="cmp-promo-badge">-{{ p.remise }}%</span>
              </div>
              <div class="cmp-card-category">{{ p.categorieNom }}</div>
              <h3 class="cmp-card-name">{{ p.nom }}</h3>
              <a [routerLink]="['/catalogue', p.id]" class="cmp-card-view-link">
                <i class="bi bi-eye me-1"></i>{{ t.isFr ? 'Voir le produit' : 'View product' }}
              </a>
            </div>
          </div>

          <!-- Row: Price -->
          <div class="cmp-row" [style.--cols]="items.length">
            <div class="cmp-label-cell">
              <i class="bi bi-tag-fill"></i>
              <span>{{ t.isFr ? 'Prix' : 'Price' }}</span>
            </div>
            <div *ngFor="let p of items" class="cmp-data-cell" [class.cmp-best]="isBestPrice(p)">
              <div *ngIf="p.enPromo && p.prixOriginal" class="cmp-price-promo-block">
                <span class="cmp-price-original">{{ p.prixOriginal | number:'1.2-2' }} TND</span>
                <span class="cmp-price-current">{{ p.prix | number:'1.2-2' }} TND</span>
                <span class="cmp-price-saving">{{ t.isFr ? 'Éco.' : 'Save' }} {{ (p.prixOriginal - p.prix) | number:'1.2-2' }} TND</span>
              </div>
              <span *ngIf="!p.enPromo || !p.prixOriginal" class="cmp-price-current">{{ p.prix | number:'1.2-2' }} TND</span>
              <span *ngIf="isBestPrice(p)" class="cmp-best-badge">
                <i class="bi bi-trophy-fill me-1"></i>{{ t.isFr ? 'Meilleur prix' : 'Best price' }}
              </span>
            </div>
          </div>

          <!-- Row: Availability -->
          <div class="cmp-row" [style.--cols]="items.length">
            <div class="cmp-label-cell">
              <i class="bi bi-boxes"></i>
              <span>{{ t.isFr ? 'Disponibilité' : 'Availability' }}</span>
            </div>
            <div *ngFor="let p of items" class="cmp-data-cell">
              <span *ngIf="p.quantite > 10" class="cmp-stock cmp-stock-good">
                <i class="bi bi-check-circle-fill"></i> {{ t.isFr ? 'En stock' : 'In stock' }}
              </span>
              <span *ngIf="p.quantite > 0 && p.quantite <= 10" class="cmp-stock cmp-stock-low">
                <i class="bi bi-exclamation-triangle-fill"></i> {{ t.isFr ? 'Stock faible' : 'Low stock' }} ({{ p.quantite }})
              </span>
              <span *ngIf="p.quantite === 0" class="cmp-stock cmp-stock-out">
                <i class="bi bi-x-circle-fill"></i> {{ t.isFr ? 'Rupture' : 'Out of stock' }}
              </span>
            </div>
          </div>

          <!-- Row: Category -->
          <div class="cmp-row" [style.--cols]="items.length">
            <div class="cmp-label-cell">
              <i class="bi bi-folder-fill"></i>
              <span>{{ t.isFr ? 'Catégorie' : 'Category' }}</span>
            </div>
            <div *ngFor="let p of items" class="cmp-data-cell">
              <span class="cmp-category-pill">{{ p.categorieNom || '—' }}</span>
            </div>
          </div>

          <!-- Row: Promo -->
          <div class="cmp-row" [style.--cols]="items.length">
            <div class="cmp-label-cell">
              <i class="bi bi-fire"></i>
              <span>{{ t.isFr ? 'Promotion' : 'Promotion' }}</span>
            </div>
            <div *ngFor="let p of items" class="cmp-data-cell">
              <span *ngIf="p.enPromo" class="cmp-promo-yes">
                <i class="bi bi-check-lg me-1"></i>-{{ p.remise }}%
              </span>
              <span *ngIf="!p.enPromo" class="cmp-promo-no">
                <i class="bi bi-dash-lg me-1"></i>{{ t.isFr ? 'Non' : 'No' }}
              </span>
            </div>
          </div>

          <!-- Row: Expiration -->
          <div class="cmp-row" [style.--cols]="items.length">
            <div class="cmp-label-cell">
              <i class="bi bi-calendar-event"></i>
              <span>{{ t.isFr ? 'Expiration' : 'Expiry' }}</span>
            </div>
            <div *ngFor="let p of items" class="cmp-data-cell">
              <span *ngIf="p.dateExpiration" [class.cmp-expiry-soon]="(p.joursAvantExpiration || 99) <= 30">
                {{ p.dateExpiration | date:'dd/MM/yyyy' }}
                <small *ngIf="p.joursAvantExpiration && p.joursAvantExpiration <= 30" class="cmp-expiry-warning">
                  ({{ p.joursAvantExpiration }}j)
                </small>
              </span>
              <span *ngIf="!p.dateExpiration" class="text-muted">—</span>
            </div>
          </div>

          <!-- Row: Description -->
          <div class="cmp-row cmp-row-desc" [style.--cols]="items.length">
            <div class="cmp-label-cell">
              <i class="bi bi-file-text"></i>
              <span>{{ t.isFr ? 'Description' : 'Description' }}</span>
            </div>
            <div *ngFor="let p of items" class="cmp-data-cell cmp-desc-cell">
              {{ p.description | slice:0:120 }}{{ (p.description?.length || 0) > 120 ? '…' : '' }}
            </div>
          </div>

          <!-- Row: CTA -->
          <div class="cmp-row cmp-row-cta" [style.--cols]="items.length">
            <div class="cmp-label-cell">
              <i class="bi bi-cart-plus"></i>
              <span>{{ t.isFr ? 'Action' : 'Action' }}</span>
            </div>
            <div *ngFor="let p of items" class="cmp-data-cell">
              <button *ngIf="p.quantite > 0"
                      class="fo-add-cart-btn cmp-add-btn-full"
                      [class.success]="addedId === p.id"
                      [disabled]="addingId === p.id"
                      (click)="addToCart(p)">
                <span *ngIf="addingId === p.id" class="spinner-border spinner-border-sm me-1"></span>
                <i *ngIf="addingId !== p.id && addedId !== p.id" class="bi bi-cart-plus me-1"></i>
                <i *ngIf="addedId === p.id" class="bi bi-check-lg me-1"></i>
                {{ addedId === p.id ? (t.isFr ? 'Ajouté !' : 'Added!') : (t.isFr ? 'Ajouter' : 'Add to cart') }}
              </button>
              <button *ngIf="p.quantite === 0" class="fo-add-cart-btn fo-btn-rupture cmp-add-btn-full" disabled>
                <i class="bi bi-x-circle me-1"></i>{{ t.isFr ? 'Indisponible' : 'Unavailable' }}
              </button>
            </div>
          </div>

        </div><!-- /card -->

        <!-- Continue shopping -->
        <div *ngIf="items.length > 0" class="cmp-footer-actions">
          <a routerLink="/catalogue" class="fo-btn fo-btn-outline">
            <i class="bi bi-plus-lg me-2"></i>{{ t.isFr ? 'Ajouter des produits' : 'Add more products' }}
          </a>
        </div>

      </div>
    </div>
  `
})
export class ComparerComponent implements OnInit, OnDestroy {
  items: Produit[] = [];
  addingId: number | null = null;
  addedId: number | null = null;
  private sub!: Subscription;

  constructor(
    public compareService: CompareService,
    private panierService: PanierService,
    public t: TraductionService
  ) {}

  ngOnInit(): void {
    this.sub = this.compareService.items$.subscribe(items => this.items = items);
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  remove(id: number): void { this.compareService.remove(id); }
  clear(): void { this.compareService.clear(); }

  isBestPrice(p: Produit): boolean {
    if (this.items.length < 2) return false;
    const min = Math.min(...this.items.map(i => i.prix));
    return p.prix === min;
  }

  addToCart(prod: Produit): void {
    if (!prod.id) return;
    this.addingId = prod.id;
    this.panierService.ajouterProduit(prod.id, 1).subscribe({
      next: () => {
        this.addingId = null;
        this.addedId = prod.id!;
        setTimeout(() => this.addedId = null, 2200);
      },
      error: () => { this.addingId = null; }
    });
  }
}
