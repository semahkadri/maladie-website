import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProduitService } from '../../../services/produit.service';
import { PanierService } from '../../../services/panier.service';
import { Produit } from '../../../modeles/produit.model';
import { TraductionService } from '../../../services/traduction.service';
import { WishlistService } from '../../../services/wishlist.service';
import { ScrollAnimateDirective } from '../../../directives/scroll-animate.directive';
import { CountUpDirective } from '../../../directives/count-up.directive';
import { PromoCountdownComponent } from '../../shared/promo-countdown/promo-countdown.component';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, RouterLink, ScrollAnimateDirective, CountUpDirective, PromoCountdownComponent],
  template: `
    <!-- ══════════ HERO SLIDER ══════════ -->
    <section class="fo-slider" (mouseenter)="pauseSlider()" (mouseleave)="resumeSlider()">

      <div class="fo-slider-track" [style.transform]="'translateX(-' + currentSlide * 100 + '%)'">
        <div *ngFor="let slide of slides" class="fo-slide" [ngClass]="'fo-slide-' + slide.theme">

          <!-- Decorative blobs -->
          <div class="fo-slide-blob fo-slide-blob-1"></div>
          <div class="fo-slide-blob fo-slide-blob-2"></div>
          <div class="fo-slide-blob fo-slide-blob-3"></div>

          <!-- Left: text content -->
          <div class="fo-slide-content">
            <div class="fo-slide-badge">
              <i class="bi" [ngClass]="slide.icon"></i>
              {{ t.isFr ? slide.badge.fr : slide.badge.en }}
            </div>
            <h1 class="fo-slide-title">{{ t.isFr ? slide.titre.fr : slide.titre.en }}</h1>
            <p class="fo-slide-desc">{{ t.isFr ? slide.desc.fr : slide.desc.en }}</p>
            <a [routerLink]="slide.link" [queryParams]="slide.queryParams" class="fo-slide-cta">
              {{ t.isFr ? slide.cta.fr : slide.cta.en }}
              <i class="bi bi-arrow-right ms-2"></i>
            </a>
          </div>

          <!-- Right: decorative icon ring -->
          <div class="fo-slide-icon-area">
            <div class="fo-slide-icon-ring">
              <i class="bi" [ngClass]="slide.icon"></i>
            </div>
            <div class="fo-slide-icon-ring fo-slide-icon-ring-outer"></div>
          </div>

        </div>
      </div>

      <!-- Prev / Next arrows -->
      <button class="fo-slider-arrow fo-slider-prev" (click)="prevSlide()" aria-label="Slide précédent">
        <i class="bi bi-chevron-left"></i>
      </button>
      <button class="fo-slider-arrow fo-slider-next" (click)="nextSlide()" aria-label="Slide suivant">
        <i class="bi bi-chevron-right"></i>
      </button>

      <!-- Dot indicators -->
      <div class="fo-slider-dots">
        <button *ngFor="let slide of slides; let i = index"
                class="fo-slider-dot"
                [class.active]="i === currentSlide"
                (click)="goToSlide(i)"
                [attr.aria-label]="'Slide ' + (i + 1)">
        </button>
      </div>

      <!-- Progress bar -->
      <div class="fo-slider-progress" [class.running]="!paused" [style.animation-duration]="'5s'"></div>

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

    <!-- Promo Banner -->
    <section class="fo-section" style="padding-bottom: 0;" appScrollAnimate="fade-up">
      <div class="fo-section-container">
        <div class="fo-promo-banner">
          <h2>{{ t.tr('promo.titre') }}</h2>
          <p>{{ t.tr('promo.desc') }}</p>
          <a [routerLink]="['/catalogue']" [queryParams]="{filtre: 'promo'}" class="fo-promo-banner-cta">
            {{ t.tr('promo.cta') }} <i class="bi bi-arrow-right ms-2"></i>
          </a>
        </div>
      </div>
    </section>

    <!-- Promo Products Section -->
    <section class="fo-section acc-promo-section" *ngIf="promoProducts.length > 0" appScrollAnimate="fade-up">
      <div class="fo-section-container">
        <div class="fo-section-header">
          <div class="acc-promo-title">
            <span class="acc-promo-fire">🔥</span>
            <h2 class="fo-section-title fo-section-title-bar">
              {{ t.isFr ? 'Offres Spéciales' : 'Special Offers' }}
            </h2>
            <span class="acc-promo-count-badge">{{ promoProducts.length }} {{ t.isFr ? 'offres' : 'deals' }}</span>
          </div>
          <div class="fo-carousel-nav-header">
            <button class="fo-carousel-arrow fo-carousel-arrow-left" (click)="scrollCarousel(promoTrack, -1)"
                    [class.disabled]="!canScrollLeft(promoTrack)">
              <i class="bi bi-chevron-left"></i>
            </button>
            <button class="fo-carousel-arrow fo-carousel-arrow-right" (click)="scrollCarousel(promoTrack, 1)"
                    [class.disabled]="!canScrollRight(promoTrack)">
              <i class="bi bi-chevron-right"></i>
            </button>
            <a [routerLink]="['/catalogue']" [queryParams]="{filtre: 'promo'}" class="fo-section-link acc-promo-link">
              {{ t.isFr ? 'Toutes les promos' : 'All deals' }} <i class="bi bi-arrow-right"></i>
            </a>
          </div>
        </div>

        <div class="fo-carousel-wrapper">
          <div class="fo-carousel-track fo-carousel-track-products" #promoTrack>
            <div *ngFor="let prod of promoProducts; let i = index"
                 class="fo-product-card fo-carousel-item fo-carousel-product-item">

              <!-- ① Clickable zone (image + info) -->
              <a [routerLink]="['/catalogue', prod.id]" class="fo-card-link">
                <div class="fo-product-card-img">
                  <span *ngIf="prod.remise" class="fo-product-badge fo-badge-promo">-{{ prod.remise }}%</span>
                  <button class="fo-product-wishlist" [class.wl-active]="wishlistService.isInWishlist(prod.id!)"
                          (click)="$event.preventDefault();$event.stopPropagation();wishlistService.toggle(prod)">
                    <i class="bi" [class.bi-heart-fill]="wishlistService.isInWishlist(prod.id!)" [class.bi-heart]="!wishlistService.isInWishlist(prod.id!)"></i>
                  </button>
                  <img *ngIf="prod.imageUrl" [src]="prod.imageUrl" [alt]="prod.nom" style="width:100%;height:100%;object-fit:cover;">
                  <i *ngIf="!prod.imageUrl" class="bi bi-box-seam"></i>
                </div>
                <div class="fo-product-card-body">
                  <span class="fo-product-brand">{{ prod.categorieNom }}</span>
                  <h4>{{ prod.nom }}</h4>
                  <p>{{ prod.description | slice:0:60 }}{{ prod.description && prod.description.length > 60 ? '...' : '' }}</p>
                </div>
              </a>

              <!-- ② Static footer — identical structure on every card -->
              <div class="fo-card-bottom">
                <div class="fo-card-price-row">
                  <div *ngIf="prod.prixOriginal" class="fo-price-block">
                    <span class="fo-price-original">{{ prod.prixOriginal | number:'1.2-2' }} TND</span>
                    <span class="fo-price-promo">{{ prod.prix | number:'1.2-2' }} TND</span>
                  </div>
                  <span *ngIf="!prod.prixOriginal" class="fo-product-price">{{ prod.prix | number:'1.2-2' }} TND</span>
                  <span class="fo-product-stock" [class.in-stock]="prod.quantite > 0" [class.out-of-stock]="prod.quantite === 0">
                    {{ prod.quantite > 0 ? t.tr('common.enStock') : t.tr('common.rupture') }}
                  </span>
                </div>
                <div class="fo-card-countdown-slot">
                  <app-promo-countdown *ngIf="prod.dateFinPromo"
                    [dateFinPromo]="prod.dateFinPromo" size="card" [isFr]="t.isFr">
                  </app-promo-countdown>
                </div>
                <button *ngIf="prod.quantite > 0"
                        class="fo-add-cart-btn"
                        [class.success]="ajoutOk === prod.id"
                        (click)="ajouterAuPanier($event, prod)"
                        [disabled]="ajoutEnCours === prod.id">
                  <span *ngIf="ajoutEnCours === prod.id" class="spinner-border spinner-border-sm me-1"></span>
                  <i *ngIf="ajoutEnCours !== prod.id && ajoutOk !== prod.id" class="bi bi-cart-plus me-1"></i>
                  <i *ngIf="ajoutOk === prod.id" class="bi bi-check-lg me-1"></i>
                  {{ ajoutOk === prod.id ? t.tr('panier.ajouterSuccess') : t.tr('catalogue.ajouterPanier') }}
                </button>
                <button *ngIf="prod.quantite === 0" class="fo-add-cart-btn fo-btn-rupture" disabled>
                  <i class="bi bi-x-circle me-1"></i>{{ t.tr('common.rupture') }}
                </button>
              </div>

            </div>
          </div>
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
            <div *ngFor="let prod of recentProducts; let i = index"
                 class="fo-product-card fo-carousel-item fo-carousel-product-item">

              <!-- ① Clickable zone (image + info) -->
              <a [routerLink]="['/catalogue', prod.id]" class="fo-card-link">
                <div class="fo-product-card-img">
                  <span *ngIf="prod.enPromo && prod.remise" class="fo-product-badge fo-badge-promo">-{{ prod.remise }}%</span>
                  <span *ngIf="!prod.enPromo" class="fo-product-badge fo-badge-new">{{ t.tr('badge.nouveau') }}</span>
                  <button class="fo-product-wishlist" [class.wl-active]="wishlistService.isInWishlist(prod.id!)"
                          (click)="$event.preventDefault();$event.stopPropagation();wishlistService.toggle(prod)">
                    <i class="bi" [class.bi-heart-fill]="wishlistService.isInWishlist(prod.id!)" [class.bi-heart]="!wishlistService.isInWishlist(prod.id!)"></i>
                  </button>
                  <img *ngIf="prod.imageUrl" [src]="prod.imageUrl" [alt]="prod.nom" style="width:100%;height:100%;object-fit:cover;">
                  <i *ngIf="!prod.imageUrl" class="bi bi-box-seam"></i>
                </div>
                <div class="fo-product-card-body">
                  <span class="fo-product-brand">{{ prod.categorieNom }}</span>
                  <h4>{{ prod.nom }}</h4>
                  <p>{{ prod.description | slice:0:60 }}{{ prod.description && prod.description.length > 60 ? '...' : '' }}</p>
                </div>
              </a>

              <!-- ② Static footer — identical structure on every card -->
              <div class="fo-card-bottom">
                <div class="fo-card-price-row">
                  <div *ngIf="prod.enPromo && prod.prixOriginal" class="fo-price-block">
                    <span class="fo-price-original">{{ prod.prixOriginal | number:'1.2-2' }} TND</span>
                    <span class="fo-price-promo">{{ prod.prix | number:'1.2-2' }} TND</span>
                  </div>
                  <span *ngIf="!prod.enPromo || !prod.prixOriginal" class="fo-product-price">{{ prod.prix | number:'1.2-2' }} TND</span>
                  <span class="fo-product-stock" [class.in-stock]="prod.quantite > 0" [class.out-of-stock]="prod.quantite === 0">
                    {{ prod.quantite > 0 ? t.tr('common.enStock') : t.tr('common.rupture') }}
                  </span>
                </div>
                <div class="fo-card-countdown-slot">
                  <app-promo-countdown *ngIf="prod.enPromo && prod.dateFinPromo"
                    [dateFinPromo]="prod.dateFinPromo" size="card" [isFr]="t.isFr">
                  </app-promo-countdown>
                </div>
                <button *ngIf="prod.quantite > 0"
                        class="fo-add-cart-btn"
                        [class.success]="ajoutOk === prod.id"
                        (click)="ajouterAuPanier($event, prod)"
                        [disabled]="ajoutEnCours === prod.id">
                  <span *ngIf="ajoutEnCours === prod.id" class="spinner-border spinner-border-sm me-1"></span>
                  <i *ngIf="ajoutEnCours !== prod.id && ajoutOk !== prod.id" class="bi bi-cart-plus me-1"></i>
                  <i *ngIf="ajoutOk === prod.id" class="bi bi-check-lg me-1"></i>
                  {{ ajoutOk === prod.id ? t.tr('panier.ajouterSuccess') : t.tr('catalogue.ajouterPanier') }}
                </button>
                <button *ngIf="prod.quantite === 0" class="fo-add-cart-btn fo-btn-rupture" disabled>
                  <i class="bi bi-x-circle me-1"></i>{{ t.tr('common.rupture') }}
                </button>
              </div>

            </div>
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
export class AccueilComponent implements OnInit, OnDestroy {
  // ─── Slider ─────────────────────────────────────────────
  currentSlide = 0;
  paused = false;
  private sliderInterval: ReturnType<typeof setInterval> | null = null;

  slides = [
    {
      badge: { fr: 'Pharmacie certifiée', en: 'Certified pharmacy' },
      titre: { fr: 'Votre santé,\nnotre priorité', en: 'Your health,\nour priority' },
      desc: { fr: "Des produits certifiés, une équipe d'experts à votre service 7j/7.", en: 'Certified products, an expert team at your service 7 days a week.' },
      cta: { fr: 'Découvrir le catalogue', en: 'Browse catalogue' },
      link: '/catalogue', queryParams: null, theme: 'blue', icon: 'bi-shield-heart'
    },
    {
      badge: { fr: 'Offres exclusives', en: 'Exclusive deals' },
      titre: { fr: 'Promotions\nExclusives', en: 'Exclusive\nOffers' },
      desc: { fr: "Jusqu'à -50% sur une large sélection de produits pharmaceutiques.", en: 'Up to -50% on a wide selection of pharmaceutical products.' },
      cta: { fr: 'Voir toutes les offres', en: 'View all deals' },
      link: '/catalogue', queryParams: { filtre: 'promo' }, theme: 'red', icon: 'bi-percent'
    },
    {
      badge: { fr: 'Bien-être & Nutrition', en: 'Wellness & Nutrition' },
      titre: { fr: 'Vitamines &\nCompléments', en: 'Vitamins &\nSupplements' },
      desc: { fr: 'Renforcez votre immunité avec nos meilleurs produits naturels et compléments alimentaires.', en: 'Boost your immunity with our best natural products and dietary supplements.' },
      cta: { fr: 'Explorer la gamme', en: 'Explore range' },
      link: '/catalogue', queryParams: null, theme: 'green', icon: 'bi-capsule'
    },
    {
      badge: { fr: 'Livraison express', en: 'Express delivery' },
      titre: { fr: 'Livraison 24h\nPartout en Tunisie', en: 'Delivery 24h\nAcross Tunisia' },
      desc: { fr: 'Commandez en ligne et recevez vos produits directement chez vous, rapidement et en toute sécurité.', en: 'Order online and receive your products directly at home, quickly and securely.' },
      cta: { fr: 'Commander maintenant', en: 'Order now' },
      link: '/catalogue', queryParams: null, theme: 'purple', icon: 'bi-truck'
    }
  ];

  // ─── Products ────────────────────────────────────────────
  recentProducts: Produit[] = [];
  promoProducts: Produit[] = [];
  loading = true;
  ajoutEnCours: number | null = null;
  ajoutOk: number | null = null;

  brands = ['Sanofi', 'Pfizer', 'Bayer', "L'Oréal Derma", 'Roche', 'Johnson & Johnson', 'Novartis', 'AstraZeneca'];

  constructor(
    private produitService: ProduitService,
    private panierService: PanierService,
    public t: TraductionService,
    public wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    this.startSlider();
    this.produitService.listerTout().subscribe({
      next: (prods) => {
        const sorted = prods.sort((a, b) => (b.dateCreation || '').localeCompare(a.dateCreation || ''));
        this.recentProducts = sorted.slice(0, 12);
        this.promoProducts = prods.filter(p => p.enPromo)
          .sort((a, b) => (b.dateCreation || '').localeCompare(a.dateCreation || ''))
          .slice(0, 12);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // ─── Hero Slider ─────────────────────────────────────────
  startSlider(): void {
    this.sliderInterval = setInterval(() => {
      if (!this.paused) this.nextSlide();
    }, 5000);
  }

  nextSlide(): void { this.currentSlide = (this.currentSlide + 1) % this.slides.length; }
  prevSlide(): void { this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length; }
  goToSlide(i: number): void { this.currentSlide = i; }
  pauseSlider(): void { this.paused = true; }
  resumeSlider(): void { this.paused = false; }

  ngOnDestroy(): void {
    if (this.sliderInterval) clearInterval(this.sliderInterval);
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

  ajouterAuPanier(event: Event, produit: Produit): void {
    event.preventDefault();
    event.stopPropagation();
    if (!produit.id || this.ajoutEnCours) return;
    this.ajoutEnCours = produit.id;
    this.ajoutOk = null;
    this.panierService.ajouterProduit(produit.id, 1).subscribe({
      next: () => {
        this.ajoutEnCours = null;
        this.ajoutOk = produit.id!;
        setTimeout(() => { if (this.ajoutOk === produit.id) this.ajoutOk = null; }, 2000);
      },
      error: () => {
        this.ajoutEnCours = null;
      }
    });
  }

}
