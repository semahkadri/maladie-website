import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategorieService } from '../../../services/categorie.service';
import { ProduitService } from '../../../services/produit.service';
import { Categorie } from '../../../modeles/categorie.model';
import { Produit } from '../../../modeles/produit.model';
import { TraductionService } from '../../../services/traduction.service';
import { ScrollAnimateDirective } from '../../../directives/scroll-animate.directive';
import { CountUpDirective } from '../../../directives/count-up.directive';
import { PromoCountdownComponent } from '../../shared/promo-countdown/promo-countdown.component';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, RouterLink, ScrollAnimateDirective, CountUpDirective, PromoCountdownComponent],
  template: `
    <!-- Premium Animated Hero -->
    <section class="fo-hero fo-hero-animated">
      <!-- Floating Particles -->
      <div class="fo-hero-particles">
        <div class="fo-hero-particle"></div>
        <div class="fo-hero-particle"></div>
        <div class="fo-hero-particle"></div>
        <div class="fo-hero-particle"></div>
        <div class="fo-hero-particle"></div>
        <div class="fo-hero-particle"></div>
      </div>
      <div class="fo-hero-inner">
        <div class="fo-hero-text">
          <div class="fo-hero-badge">
            <i class="bi bi-shield-check"></i> {{ t.tr('hero.badge') }}
          </div>
          <h1>{{ t.tr('accueil.titre') }}</h1>
          <p>{{ t.tr('accueil.sousTitre') }}</p>
          <div class="fo-hero-buttons">
            <a routerLink="/catalogue" class="fo-hero-btn">
              <i class="bi bi-grid-3x3-gap me-2"></i>{{ t.tr('accueil.btnCatalogue') }}
            </a>
            <a routerLink="/catalogue" class="fo-hero-btn-secondary">
              <i class="bi bi-stars me-2"></i>{{ t.tr('hero.nouveautes') }}
            </a>
          </div>
        </div>
        <div class="fo-hero-visual">
          <div class="fo-hero-promo-card">
            <i class="bi bi-capsule"></i>
            <h3>{{ t.tr('hero.promoTitre') }}</h3>
            <p>{{ t.tr('hero.promoDesc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Trust Strip with Scroll Animation & Count Up -->
    <section class="fo-trust-strip" appScrollAnimate="fade-up">
      <div class="fo-trust-strip-inner">
        <div class="fo-trust-badge" appScrollAnimate="fade-up" [animateDelay]="0">
          <div class="fo-trust-badge-icon">
            <i class="bi bi-truck"></i>
          </div>
          <div>
            <h4>{{ t.tr('trust.livraison') }}</h4>
            <p><span [appCountUp]="24" countSuffix="h" [countDuration]="1800"></span> {{ t.isFr ? 'partout en Tunisie' : 'across Tunisia' }}</p>
          </div>
        </div>
        <div class="fo-trust-badge" appScrollAnimate="fade-up" [animateDelay]="100">
          <div class="fo-trust-badge-icon">
            <i class="bi bi-shield-lock"></i>
          </div>
          <div>
            <h4>{{ t.tr('trust.paiement') }}</h4>
            <p><span [appCountUp]="100" countSuffix="%" [countDuration]="2000"></span> {{ t.isFr ? 'sécurisées' : 'secure' }}</p>
          </div>
        </div>
        <div class="fo-trust-badge" appScrollAnimate="fade-up" [animateDelay]="200">
          <div class="fo-trust-badge-icon">
            <i class="bi bi-patch-check"></i>
          </div>
          <div>
            <h4>{{ t.tr('trust.certifie') }}</h4>
            <p>{{ t.tr('trust.certifieDesc') }}</p>
          </div>
        </div>
        <div class="fo-trust-badge" appScrollAnimate="fade-up" [animateDelay]="300">
          <div class="fo-trust-badge-icon">
            <i class="bi bi-arrow-return-left"></i>
          </div>
          <div>
            <h4>{{ t.tr('trust.retour') }}</h4>
            <p><span [appCountUp]="14" [countDuration]="1500"></span> {{ t.isFr ? ' jours de retour gratuit' : ' days free returns' }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section — Carousel -->
    <section class="fo-section" *ngIf="categories.length > 0" appScrollAnimate="fade-up">
      <div class="fo-section-container">
        <div class="fo-section-header">
          <h2 class="fo-section-title fo-section-title-bar">{{ t.tr('accueil.sectionCat') }}</h2>
          <div class="fo-carousel-nav-header">
            <button class="fo-carousel-arrow fo-carousel-arrow-left" (click)="scrollCarousel(catTrack, -1)"
                    [class.disabled]="!canScrollLeft(catTrack)">
              <i class="bi bi-chevron-left"></i>
            </button>
            <button class="fo-carousel-arrow fo-carousel-arrow-right" (click)="scrollCarousel(catTrack, 1)"
                    [class.disabled]="!canScrollRight(catTrack)">
              <i class="bi bi-chevron-right"></i>
            </button>
            <a routerLink="/catalogue" class="fo-section-link">{{ t.tr('common.voirTout') }} <i class="bi bi-arrow-right"></i></a>
          </div>
        </div>
        <div class="fo-carousel-wrapper">
          <div class="fo-carousel-track" #catTrack>
            <a *ngFor="let cat of categories; let i = index" [routerLink]="['/categories', cat.id]" class="fo-category-card fo-carousel-item"
               appScrollAnimate="scale-in" [animateDelay]="i * 80">
              <div class="fo-category-icon">
                <i class="bi" [ngClass]="getCategoryIcon(cat.nom)"></i>
              </div>
              <h3>{{ cat.nom }}</h3>
              <p>{{ cat.description | slice:0:80 }}{{ cat.description && cat.description.length > 80 ? '...' : '' }}</p>
              <span class="fo-category-count">{{ t.tr('accueil.voirProduits') }}</span>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Promo Banner -->
    <section class="fo-section" style="padding-bottom: 0;" appScrollAnimate="fade-up">
      <div class="fo-section-container">
        <div class="fo-promo-banner">
          <h2>{{ t.tr('promo.titre') }}</h2>
          <p>{{ t.tr('promo.desc') }}</p>
          <a routerLink="/catalogue" class="fo-promo-banner-cta">
            {{ t.tr('promo.cta') }} <i class="bi bi-arrow-right ms-2"></i>
          </a>
        </div>
      </div>
    </section>

    <!-- Brand Marquee -->
    <section class="fo-marquee-section" appScrollAnimate="fade-up">
      <h3>{{ t.tr('marquee.marques') }}</h3>
      <div class="fo-marquee-track">
        <span class="fo-marquee-item" *ngFor="let brand of brands">{{ brand }}</span>
        <span class="fo-marquee-item" *ngFor="let brand of brands">{{ brand }}</span>
      </div>
    </section>

    <!-- Recent Products Section — Carousel with Arrows -->
    <section class="fo-section" *ngIf="recentProducts.length > 0" appScrollAnimate="fade-up">
      <div class="fo-section-container">
        <div class="fo-section-header">
          <h2 class="fo-section-title fo-section-title-bar">{{ t.tr('accueil.derniersProduits') }}</h2>
          <div class="fo-carousel-nav-header">
            <button class="fo-carousel-arrow fo-carousel-arrow-left" (click)="scrollCarousel(prodTrack, -1)"
                    [class.disabled]="!canScrollLeft(prodTrack)">
              <i class="bi bi-chevron-left"></i>
            </button>
            <button class="fo-carousel-arrow fo-carousel-arrow-right" (click)="scrollCarousel(prodTrack, 1)"
                    [class.disabled]="!canScrollRight(prodTrack)">
              <i class="bi bi-chevron-right"></i>
            </button>
            <a routerLink="/catalogue" class="fo-section-link">{{ t.tr('common.voirTout') }} <i class="bi bi-arrow-right"></i></a>
          </div>
        </div>
        <div class="fo-carousel-wrapper">
          <div class="fo-carousel-track fo-carousel-track-products" #prodTrack>
            <a *ngFor="let prod of recentProducts; let i = index" [routerLink]="['/catalogue', prod.id]"
               class="fo-product-card fo-carousel-item fo-carousel-product-item">
              <div class="fo-product-card-img">
                <span *ngIf="prod.enPromo && prod.remise" class="fo-product-badge fo-badge-promo">-{{ prod.remise }}%</span>
                <span *ngIf="!prod.enPromo" class="fo-product-badge fo-badge-new">{{ t.tr('badge.nouveau') }}</span>
                <img *ngIf="prod.imageUrl" [src]="prod.imageUrl" [alt]="prod.nom" style="width: 100%; height: 100%; object-fit: cover;">
                <i *ngIf="!prod.imageUrl" class="bi bi-box-seam"></i>
              </div>
              <div class="fo-product-card-body">
                <span class="fo-product-brand">{{ prod.categorieNom }}</span>
                <h4>{{ prod.nom }}</h4>
                <p>{{ prod.description | slice:0:60 }}{{ prod.description && prod.description.length > 60 ? '...' : '' }}</p>
                <div class="fo-product-card-footer">
                  <div *ngIf="prod.enPromo && prod.prixOriginal" class="fo-price-block">
                    <span class="fo-price-original">{{ prod.prixOriginal | number:'1.2-2' }} TND</span>
                    <span class="fo-price-promo">{{ prod.prix | number:'1.2-2' }} TND</span>
                  </div>
                  <span *ngIf="!prod.enPromo || !prod.prixOriginal" class="fo-product-price">{{ prod.prix | number:'1.2-2' }} TND</span>
                  <span class="fo-product-stock"
                        [class.in-stock]="prod.quantite > 0"
                        [class.out-of-stock]="prod.quantite === 0">
                    {{ prod.quantite > 0 ? t.tr('common.enStock') : t.tr('common.rupture') }}
                  </span>
                </div>
                <app-promo-countdown
                  *ngIf="prod.enPromo && prod.dateFinPromo"
                  [dateFinPromo]="prod.dateFinPromo"
                  size="card"
                  [isFr]="t.isFr">
                </app-promo-countdown>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter -->
    <section class="fo-newsletter" appScrollAnimate="fade-up">
      <div class="fo-newsletter-inner">
        <h2>{{ t.tr('newsletter.titre') }}</h2>
        <p>{{ t.tr('newsletter.desc') }}</p>
        <div class="fo-newsletter-form">
          <input type="email" [placeholder]="t.tr('newsletter.placeholder')">
          <button type="button">{{ t.tr('newsletter.btn') }}</button>
        </div>
      </div>
    </section>

    <!-- Loading -->
    <div *ngIf="loading" class="fo-loading">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">{{ t.tr('common.chargement') }}</span>
      </div>
    </div>
  `
})
export class AccueilComponent implements OnInit {
  categories: Categorie[] = [];
  recentProducts: Produit[] = [];
  loading = true;

  brands = ['Sanofi', 'Pfizer', 'Bayer', "L'Oréal Derma", 'Roche', 'Johnson & Johnson', 'Novartis', 'AstraZeneca'];

  constructor(
    private categorieService: CategorieService,
    private produitService: ProduitService,
    public t: TraductionService
  ) {}

  ngOnInit(): void {
    this.categorieService.listerTout().subscribe({
      next: (cats) => this.categories = cats
    });
    this.produitService.listerTout().subscribe({
      next: (prods) => {
        this.recentProducts = prods
          .sort((a, b) => (b.dateCreation || '').localeCompare(a.dateCreation || ''))
          .slice(0, 12);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // ─── Carousel scroll ────────────────────────────────────
  scrollCarousel(track: HTMLElement, direction: number): void {
    const cardWidth = track.querySelector('.fo-carousel-item')?.clientWidth || 300;
    const gap = 20;
    const scrollAmount = (cardWidth + gap) * 2;
    track.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  }

  canScrollLeft(track: HTMLElement): boolean {
    return track?.scrollLeft > 0;
  }

  canScrollRight(track: HTMLElement): boolean {
    if (!track) return false;
    return track.scrollLeft < (track.scrollWidth - track.clientWidth - 2);
  }

  getCategoryIcon(name: string): string {
    const n = (name || '').toLowerCase();
    if (n.includes('medic') || n.includes('médic') || n.includes('pharma')) return 'bi-capsule';
    if (n.includes('beauté') || n.includes('beaute') || n.includes('beauty') || n.includes('cosm')) return 'bi-stars';
    if (n.includes('bébé') || n.includes('bebe') || n.includes('baby') || n.includes('enfant')) return 'bi-emoji-smile';
    if (n.includes('hygièn') || n.includes('hygien') || n.includes('soin')) return 'bi-droplet';
    if (n.includes('vitamin') || n.includes('complémen') || n.includes('complemen') || n.includes('nutri')) return 'bi-lightning';
    if (n.includes('équip') || n.includes('equip') || n.includes('matéri') || n.includes('materi')) return 'bi-bandaid';
    return 'bi-tag-fill';
  }
}
