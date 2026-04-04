import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { TraductionService } from '../../../services/traduction.service';
import { ThemeService } from '../../../services/theme.service';
import { PanierService } from '../../../services/panier.service';
import { CategorieService } from '../../../services/categorie.service';
import { WishlistService } from '../../../services/wishlist.service';
import { CompareService } from '../../../services/compare.service';
import { CompareBarComponent } from '../../shared/compare-bar/compare-bar.component';
import { AiAssistantComponent } from '../../shared/ai-assistant/ai-assistant.component';
import { Categorie } from '../../../modeles/categorie.model';
import { Panier } from '../../../modeles/panier.model';

@Component({
  selector: 'app-layout-frontoffice',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule, CompareBarComponent, AiAssistantComponent],
  animations: [
    trigger('miniCartSlide', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms cubic-bezier(0.22, 1, 0.36, 1)', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('250ms cubic-bezier(0.4, 0, 1, 1)', style({ transform: 'translateX(100%)' }))
      ])
    ]),
    trigger('miniCartOverlay', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease', style({ opacity: 0 }))
      ])
    ])
  ],
  template: `
    <!-- Scroll Progress Bar -->
    <div class="fo-scroll-progress" [style.width.%]="scrollProgress"></div>

    <!-- App Container (Flex Row — matches team's main-layout structure) -->
    <div class="fo-app-container">

      <!-- Sidebar Overlay (mobile) -->
      <div class="fo-lsidebar-overlay" *ngIf="sidebarOpen" (click)="sidebarOpen = false"></div>

      <!-- Left Sidebar -->
      <aside class="fo-lsidebar" [class.fo-lsidebar-collapsed]="sidebarCollapsed" [class.fo-lsidebar-open]="sidebarOpen">

        <!-- Brand Header -->
        <div class="fo-lsidebar-header" [class.fo-lsidebar-header-collapsed]="sidebarCollapsed">
          <!-- Brand: fully hidden when collapsed — identical pattern to backoffice -->
          <a routerLink="/" class="fo-lsidebar-brand" *ngIf="!sidebarCollapsed" (click)="sidebarOpen=false">
            <div class="fo-lsidebar-brand-icon">
              <i class="bi bi-heart-pulse"></i>
            </div>
            <div class="fo-lsidebar-brand-text">
              <span class="fo-lsidebar-brand-name">{{ t.tr('nav.brand') }}</span>
              <span class="fo-lsidebar-brand-sub">{{ t.isFr ? 'Pharmacie en ligne' : 'Online Pharmacy' }}</span>
            </div>
          </a>
          <!-- Toggle button: always visible, centered when collapsed -->
          <button class="fo-lsidebar-toggle" (click)="onSidebarToggleClick()" [title]="sidebarCollapsed ? 'Développer' : 'Réduire'">
            <i class="bi bi-list"></i>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="fo-lsidebar-nav">

          <div class="fo-lsidebar-label" *ngIf="!sidebarCollapsed">{{ t.isFr ? 'Navigation' : 'Menu' }}</div>

          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}"
             class="fo-lsidebar-link" (click)="sidebarOpen=false"
             [title]="t.tr('nav.accueil')">
            <span class="fo-lsidebar-icon"><i class="bi bi-house-door-fill"></i></span>
            <span class="fo-lsidebar-link-text"><span>{{ t.tr('nav.accueil') }}</span></span>
          </a>

          <a routerLink="/catalogue" routerLinkActive="active"
             class="fo-lsidebar-link" (click)="sidebarOpen=false"
             [title]="t.tr('nav.catalogue')">
            <span class="fo-lsidebar-icon"><i class="bi bi-grid-3x3-gap-fill"></i></span>
            <span class="fo-lsidebar-link-text"><span>{{ t.tr('nav.catalogue') }}</span></span>
          </a>

          <a routerLink="/wishlist" routerLinkActive="active"
             class="fo-lsidebar-link" (click)="sidebarOpen=false"
             [title]="t.isFr ? 'Souhaits' : 'Wishlist'">
            <span class="fo-lsidebar-icon"><i class="bi bi-heart"></i></span>
            <span class="fo-lsidebar-link-text"><span>{{ t.isFr ? 'Souhaits' : 'Wishlist' }}</span></span>
            <span class="fo-lsidebar-badge fo-lsidebar-badge-red" *ngIf="wishlistCount > 0">{{ wishlistCount }}</span>
          </a>

          <a routerLink="/panier" routerLinkActive="active"
             class="fo-lsidebar-link" (click)="sidebarOpen=false"
             [title]="t.tr('nav.panier')">
            <span class="fo-lsidebar-icon"><i class="bi bi-cart3"></i></span>
            <span class="fo-lsidebar-link-text"><span>{{ t.tr('nav.panier') }}</span></span>
            <span class="fo-lsidebar-badge" *ngIf="nombreArticles > 0" [class.bounce]="cartBounce">{{ nombreArticles }}</span>
          </a>

          <a routerLink="/comparer" routerLinkActive="active"
             class="fo-lsidebar-link" (click)="sidebarOpen=false"
             [title]="t.isFr ? 'Comparer' : 'Compare'">
            <span class="fo-lsidebar-icon"><i class="bi bi-bar-chart-steps"></i></span>
            <span class="fo-lsidebar-link-text"><span>{{ t.isFr ? 'Comparer' : 'Compare' }}</span></span>
            <span class="fo-lsidebar-badge fo-lsidebar-badge-green" *ngIf="compareCount > 0">{{ compareCount }}</span>
          </a>

          <!-- Categories section -->
          <div class="fo-lsidebar-label" *ngIf="!sidebarCollapsed && topCategories.length > 0">
            {{ t.isFr ? 'Catégories' : 'Categories' }}
          </div>

          <a *ngFor="let cat of topCategories" [routerLink]="['/categories', cat.id]"
             routerLinkActive="active" class="fo-lsidebar-link" (click)="sidebarOpen=false"
             [title]="cat.nom">
            <span class="fo-lsidebar-icon"><i class="bi bi-tag"></i></span>
            <span class="fo-lsidebar-link-text"><span>{{ cat.nom }}</span></span>
          </a>

          <a [routerLink]="['/catalogue']" [queryParams]="{filtre:'promo'}"
             class="fo-lsidebar-link fo-lsidebar-link-promo" (click)="sidebarOpen=false"
             [title]="t.isFr ? 'Promotions' : 'Deals'">
            <span class="fo-lsidebar-icon"><i class="bi bi-fire"></i></span>
            <span class="fo-lsidebar-link-text"><span>{{ t.isFr ? 'Promotions' : 'Deals' }}</span></span>
          </a>

          <!-- ── Flexible spacer: pushes bottom section to the bottom of the nav ── -->
          <div class="fo-lsidebar-spacer"></div>

          <!-- ── Pharmacy brand card (visible when expanded — mirrors BO user profile) ── -->
          <div class="fo-lsidebar-pharmacy-card" *ngIf="!sidebarCollapsed">
            <div class="fo-lsidebar-pharmacy-avatar">
              <i class="bi bi-bag-heart-fill"></i>
            </div>
            <div class="fo-lsidebar-pharmacy-info">
              <div class="fo-lsidebar-pharmacy-name">PharmaCare</div>
              <div class="fo-lsidebar-pharmacy-sub">
                <span class="fo-lsidebar-pharmacy-dot"></span>
                {{ t.isFr ? 'Votre pharmacie en ligne' : 'Your online pharmacy' }}
              </div>
            </div>
          </div>

          <!-- ── Admin shortcut (inside nav — no white space below) ── -->
          <a routerLink="/admin" class="fo-lsidebar-link fo-lsidebar-admin-nav"
             (click)="sidebarOpen=false"
             title="Administration">
            <span class="fo-lsidebar-icon"><i class="bi bi-shield-lock-fill"></i></span>
            <span class="fo-lsidebar-link-text"><span>Administration</span></span>
          </a>

        </nav>

      </aside>

      <!-- Main Content -->
      <main class="fo-main-area">

        <!-- Compact Topbar -->
        <header class="fo-topbar-compact" [class.fo-topbar-scrolled]="scrolled">
          <div class="fo-topbar-left">
            <!-- Hamburger (always visible — mobile: open drawer, desktop: collapse sidebar) -->
            <button class="fo-topbar-hamburger" (click)="onHamburgerClick()">
              <i class="bi bi-list"></i>
            </button>
            <!-- Brand identity — slides in from left when page is scrolled -->
            <a routerLink="/" class="fo-topbar-brand-chip fo-topbar-brand-chip-visible">
              <i class="bi bi-heart-pulse-fill"></i>
              <span>PharmaCare</span>
            </a>
            <!-- Search bar -->
            <div class="fo-topbar-search">
              <i class="bi bi-search fo-topbar-search-ico"></i>
              <input type="text" class="fo-topbar-search-input"
                     [placeholder]="t.tr('nav.rechercher')"
                     [(ngModel)]="navSearch"
                     (keyup.enter)="doNavSearch()"
                     (keyup.escape)="navSearch = ''">
              <button class="fo-topbar-search-btn" (click)="doNavSearch()">
                <i class="bi bi-search"></i>
              </button>
            </div>
          </div>

          <div class="fo-topbar-right">
            <!-- Language toggle (pill style) -->
            <div class="fo-topbar-lang">
              <button [class.active]="t.isFr" (click)="t.setLang('fr')">FR</button>
              <button [class.active]="t.isEn" (click)="t.setLang('en')">EN</button>
            </div>
            <!-- Divider -->
            <div class="fo-topbar-sep"></div>
            <!-- Theme toggle -->
            <button class="fo-topbar-icon-btn" (click)="th.toggle()"
                    [title]="th.isDark ? t.tr('theme.light') : t.tr('theme.dark')">
              <i class="bi" [class.bi-moon-stars-fill]="th.isLight" [class.bi-sun-fill]="th.isDark"></i>
            </button>
            <!-- Compare -->
            <a routerLink="/comparer" class="fo-topbar-icon-btn"
               [title]="t.isFr ? 'Comparateur' : 'Compare'">
              <i class="bi bi-bar-chart-steps"></i>
              <span class="fo-topbar-badge fo-topbar-badge-green" *ngIf="compareCount > 0">{{ compareCount }}</span>
            </a>
            <!-- Wishlist -->
            <a routerLink="/wishlist" class="fo-topbar-icon-btn fo-topbar-wishlist-btn"
               [title]="t.isFr ? 'Liste de souhaits' : 'Wishlist'">
              <i class="bi bi-heart"></i>
              <span class="fo-topbar-badge fo-topbar-badge-red" *ngIf="wishlistCount > 0">{{ wishlistCount }}</span>
            </a>
            <!-- Cart -->
            <a routerLink="/panier" class="fo-topbar-icon-btn fo-topbar-cart-btn" [title]="t.tr('nav.panier')">
              <i class="bi bi-cart3"></i>
              <span class="fo-topbar-badge" *ngIf="nombreArticles > 0" [class.bounce]="cartBounce">{{ nombreArticles }}</span>
            </a>
          </div>
        </header>

        <!-- Announcement Bar (below topbar) -->
        <div class="fo-announcement-bar" *ngIf="!announcementClosed">
          <div class="fo-announcement-inner">
            <span class="fo-announcement-item">
              <i class="bi bi-truck"></i> {{ t.tr('announce.livraison') }}
            </span>
            <span class="fo-announcement-separator"></span>
            <span class="fo-announcement-item">
              <i class="bi bi-shield-check"></i> {{ t.tr('announce.pharmacie') }}
            </span>
            <span class="fo-announcement-separator"></span>
            <span class="fo-announcement-item">
              <i class="bi bi-headset"></i> {{ t.tr('announce.support') }}
            </span>
          </div>
          <button class="fo-announcement-close" (click)="announcementClosed = true">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Page Content -->
        <div class="fo-page-content">
          <router-outlet></router-outlet>
        </div>


      </main>

    </div>

    <!-- Newsletter — outside fo-app-container so it spans full viewport width -->
    <section class="fo-newsletter">
      <div class="fo-newsletter-inner">
        <h2>{{ t.tr('newsletter.titre') }}</h2>
        <p>{{ t.tr('newsletter.desc') }}</p>
        <div class="fo-newsletter-form">
          <input type="email" [placeholder]="t.tr('newsletter.placeholder')">
          <button type="button">{{ t.tr('newsletter.btn') }}</button>
        </div>
      </div>
    </section>

    <!-- Footer — outside fo-app-container so it spans full viewport width -->
    <footer class="fo-footer">
      <div class="fo-footer-main">
        <!-- Brand Column -->
        <div class="fo-footer-brand-col">
          <div class="fo-footer-brand">
            <i class="bi bi-heart-pulse"></i>
            <span>{{ t.tr('footer.brand') }}</span>
          </div>
          <p>{{ t.tr('footer.desc') }}</p>
          <div class="fo-footer-social">
            <a href="#"><i class="bi bi-facebook"></i></a>
            <a href="#"><i class="bi bi-instagram"></i></a>
            <a href="#"><i class="bi bi-twitter-x"></i></a>
            <a href="#"><i class="bi bi-whatsapp"></i></a>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="fo-footer-col">
          <h4>{{ t.tr('footer.liens') }}</h4>
          <ul>
            <li><a routerLink="/">{{ t.tr('nav.accueil') }}</a></li>
            <li><a routerLink="/catalogue">{{ t.tr('nav.catalogue') }}</a></li>
            <li><a routerLink="/panier">{{ t.tr('nav.panier') }}</a></li>
            <li><a routerLink="/wishlist">{{ t.isFr ? 'Liste de souhaits' : 'Wishlist' }}</a></li>
          </ul>
        </div>

        <!-- Customer Service -->
        <div class="fo-footer-col">
          <h4>{{ t.tr('footer.service') }}</h4>
          <ul>
            <li><a href="#">{{ t.tr('footer.livraison') }}</a></li>
            <li><a href="#">{{ t.tr('footer.retours') }}</a></li>
            <li><a href="#">{{ t.tr('footer.faq') }}</a></li>
          </ul>
        </div>

        <!-- Contact -->
        <div class="fo-footer-col">
          <h4>{{ t.tr('footer.contact') }}</h4>
          <div class="fo-footer-contact-item">
            <i class="bi bi-geo-alt-fill"></i>
            <span>{{ t.tr('footer.adresse') }}</span>
          </div>
          <div class="fo-footer-contact-item">
            <i class="bi bi-telephone-fill"></i>
            <span>+216 71 000 000</span>
          </div>
          <div class="fo-footer-contact-item">
            <i class="bi bi-envelope-fill"></i>
            <span>contact&#64;pharmacare.tn</span>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="fo-footer-bottom">
        <div class="fo-footer-bottom-inner">
          <p>&copy; {{ annee }} {{ t.tr('footer.brand') }}. {{ t.tr('footer.droits') }}</p>
          <div class="fo-footer-payment">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>D17</span>
          </div>
        </div>
      </div>
    </footer>

    <!-- Mini-Cart Sidebar -->
    <div *ngIf="miniCartOpen" class="fo-minicart-overlay" [@miniCartOverlay] (click)="miniCartOpen = false"></div>
    <div *ngIf="miniCartOpen" class="fo-minicart-panel" [@miniCartSlide]>
      <div class="fo-minicart-header">
        <h3><i class="bi bi-cart3 me-2"></i>{{ t.tr('minicart.titre') }} ({{ nombreArticles }})</h3>
        <button (click)="miniCartOpen = false"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="fo-minicart-body">
        <div *ngIf="!panier || panier.lignes.length === 0" class="fo-minicart-empty">
          <i class="bi bi-cart-x"></i>
          {{ t.tr('minicart.vide') }}
        </div>
        <div *ngFor="let ligne of panier?.lignes || []" class="fo-minicart-item">
          <div class="fo-minicart-item-img">
            <img *ngIf="ligne.produitImageUrl" [src]="ligne.produitImageUrl" [alt]="ligne.produitNom">
            <i *ngIf="!ligne.produitImageUrl" class="bi bi-box-seam"></i>
          </div>
          <div class="fo-minicart-item-info">
            <h4>{{ ligne.produitNom }}</h4>
            <span>x{{ ligne.quantite }}</span>
          </div>
          <div class="fo-minicart-item-price">{{ ligne.sousTotal | number:'1.2-2' }} TND</div>
        </div>
      </div>
      <div class="fo-minicart-footer" *ngIf="panier && panier.lignes.length > 0">
        <div class="fo-minicart-total">
          <span>{{ t.tr('minicart.sousTotal') }}</span>
          <span>{{ panier.montantTotal | number:'1.2-2' }} TND</span>
        </div>
        <a routerLink="/panier" class="fo-minicart-btn" (click)="miniCartOpen = false">
          <i class="bi bi-cart-check me-2"></i>{{ t.tr('minicart.voirPanier') }}
        </a>
      </div>
    </div>

    <!-- AI Assistant -->
    <app-ai-assistant></app-ai-assistant>

    <!-- Compare Bar -->
    <app-compare-bar></app-compare-bar>

    <!-- Back to Top -->
    <button class="fo-back-to-top" [class.visible]="showBackToTop" (click)="scrollToTop()" [title]="t.tr('backToTop')">
      <svg class="fo-btt-ring" viewBox="0 0 54 54">
        <circle cx="27" cy="27" r="25"></circle>
        <circle class="fo-btt-progress" cx="27" cy="27" r="25"
                [attr.stroke-dasharray]="157"
                [attr.stroke-dashoffset]="157 - (157 * scrollProgress / 100)"></circle>
      </svg>
      <i class="bi bi-chevron-up"></i>
    </button>
  `
})
export class LayoutFrontofficeComponent implements OnInit, OnDestroy {
  annee = new Date().getFullYear();
  navSearch = '';
  nombreArticles = 0;
  announcementClosed = false;
  topCategories: Categorie[] = [];
  wishlistCount = 0;
  compareCount = 0;

  sidebarOpen = false;
  sidebarCollapsed = false;

  scrollProgress = 0;
  showBackToTop = false;
  scrolled = false;
  miniCartOpen = false;
  cartBounce = false;
  panier: Panier | null = null;

  private panierSub!: Subscription;
  private itemAddedSub!: Subscription;
  private wishlistSub!: Subscription;
  private compareSub!: Subscription;
  private miniCartTimer: any;

  constructor(
    public t: TraductionService,
    public th: ThemeService,
    private panierService: PanierService,
    private categorieService: CategorieService,
    public wishlistService: WishlistService,
    public compareService: CompareService,
    private router: Router
  ) {}

  doNavSearch(): void {
    const q = this.navSearch.trim();
    if (!q) return;
    this.router.navigate(['/catalogue'], { queryParams: { q } });
    this.navSearch = '';
    this.sidebarOpen = false;
  }

  private applyCollapse(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    localStorage.setItem('fo-sidebar-collapsed', String(this.sidebarCollapsed));
    document.body.classList.toggle('fo-sidebar-collapsed', this.sidebarCollapsed);
  }

  /** Topbar hamburger — mobile: open/close drawer · desktop: collapse/expand sidebar */
  onHamburgerClick(): void {
    if (window.innerWidth <= 991) {
      this.sidebarOpen = !this.sidebarOpen;
    } else {
      this.applyCollapse();
    }
  }

  /** Toggle button inside sidebar — mobile: close drawer · desktop: collapse/expand */
  onSidebarToggleClick(): void {
    if (window.innerWidth <= 991) {
      this.sidebarOpen = false;
    } else {
      this.applyCollapse();
    }
  }

  ngOnInit(): void {
    this.sidebarCollapsed = localStorage.getItem('fo-sidebar-collapsed') === 'true';
    document.body.classList.toggle('fo-sidebar-collapsed', this.sidebarCollapsed);

    this.panierService.chargerPanier().subscribe();
    this.panierSub = this.panierService.panier$.subscribe(panier => {
      this.panier = panier;
      this.nombreArticles = panier?.nombreArticles || 0;
    });
    this.categorieService.listerTout().subscribe({
      next: (cats) => this.topCategories = cats.slice(0, 5)
    });
    this.wishlistSub = this.wishlistService.wishlist$.subscribe(items => this.wishlistCount = items.length);
    this.compareSub = this.compareService.items$.subscribe(items => this.compareCount = items.length);

    this.itemAddedSub = this.panierService.itemAdded$.subscribe(() => {
      this.miniCartOpen = true;
      clearTimeout(this.miniCartTimer);
      this.miniCartTimer = setTimeout(() => this.miniCartOpen = false, 5000);
      this.cartBounce = true;
      setTimeout(() => this.cartBounce = false, 600);
    });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    this.scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    this.showBackToTop = scrollTop > 400;
    this.scrolled = scrollTop > 20;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    this.panierSub?.unsubscribe();
    this.itemAddedSub?.unsubscribe();
    this.wishlistSub?.unsubscribe();
    this.compareSub?.unsubscribe();
    clearTimeout(this.miniCartTimer);
  }
}
