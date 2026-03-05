import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TraductionService } from '../../../services/traduction.service';
import { ThemeService } from '../../../services/theme.service';
import { PanierService } from '../../../services/panier.service';
import { CategorieService } from '../../../services/categorie.service';
import { Categorie } from '../../../modeles/categorie.model';

@Component({
  selector: 'app-layout-frontoffice',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <!-- Announcement Bar -->
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

    <!-- Navbar -->
    <nav class="fo-navbar">
      <!-- Top Row: Brand + Search + Actions -->
      <div class="fo-navbar-top">
        <a routerLink="/" class="fo-navbar-brand">
          <div class="fo-navbar-brand-icon">
            <i class="bi bi-heart-pulse"></i>
          </div>
          <span>{{ t.tr('nav.brand') }}</span>
        </a>

        <div class="fo-navbar-search d-none d-md-block">
          <i class="bi bi-search"></i>
          <input type="text" [placeholder]="t.tr('nav.rechercher')">
        </div>

        <div class="fo-navbar-actions">
          <!-- Language Toggle -->
          <div class="lang-toggle">
            <i class="bi bi-globe2 lang-toggle-icon"></i>
            <button [class.active]="t.isFr" (click)="t.setLang('fr')">FR</button>
            <button [class.active]="t.isEn" (click)="t.setLang('en')">EN</button>
          </div>
          <!-- Theme Toggle -->
          <button class="theme-toggle" (click)="th.toggle()" [attr.title]="th.isDark ? t.tr('theme.light') : t.tr('theme.dark')">
            <i class="bi" [class.bi-moon-fill]="th.isLight" [class.bi-sun-fill]="th.isDark"></i>
          </button>
          <!-- Cart -->
          <a routerLink="/panier" class="fo-navbar-action-btn fo-navbar-cart">
            <i class="bi bi-cart3"></i>
            <span *ngIf="nombreArticles > 0" class="fo-cart-badge">{{ nombreArticles }}</span>
          </a>
          <!-- Mobile Toggle -->
          <button class="fo-navbar-toggle" (click)="menuOpen = !menuOpen">
            <i class="bi" [class.bi-list]="!menuOpen" [class.bi-x-lg]="menuOpen"></i>
          </button>
        </div>
      </div>

      <!-- Bottom Row: Category Links -->
      <div class="fo-navbar-bottom" *ngIf="topCategories.length > 0">
        <div class="fo-navbar-bottom-inner">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}"
             class="fo-navbar-cat-link">
            <i class="bi bi-house-door"></i> {{ t.tr('nav.accueil') }}
          </a>
          <a routerLink="/catalogue" routerLinkActive="active"
             class="fo-navbar-cat-link">
            <i class="bi bi-grid-3x3-gap"></i> {{ t.tr('nav.catalogue') }}
          </a>
          <a *ngFor="let cat of topCategories" [routerLink]="['/categories', cat.id]"
             class="fo-navbar-cat-link">
            {{ cat.nom }}
          </a>
          <a routerLink="/admin" class="fo-navbar-cat-link">
            <i class="bi bi-gear"></i> {{ t.tr('nav.admin') }}
          </a>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div class="fo-navbar-menu" [class.open]="menuOpen">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}"
           class="fo-navbar-link" (click)="menuOpen = false">
          <i class="bi bi-house-door"></i> {{ t.tr('nav.accueil') }}
        </a>
        <a routerLink="/catalogue" routerLinkActive="active"
           class="fo-navbar-link" (click)="menuOpen = false">
          <i class="bi bi-grid-3x3-gap"></i> {{ t.tr('nav.catalogue') }}
        </a>
        <a routerLink="/panier" routerLinkActive="active"
           class="fo-navbar-link" (click)="menuOpen = false">
          <i class="bi bi-cart3"></i> {{ t.tr('nav.panier') }}
          <span *ngIf="nombreArticles > 0" class="fo-cart-badge">{{ nombreArticles }}</span>
        </a>
        <a routerLink="/admin" class="fo-navbar-link fo-navbar-admin" (click)="menuOpen = false">
          <i class="bi bi-gear"></i> {{ t.tr('nav.admin') }}
        </a>
      </div>
    </nav>

    <!-- Page Content -->
    <main class="fo-main">
      <router-outlet></router-outlet>
    </main>

    <!-- Footer -->
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
  `
})
export class LayoutFrontofficeComponent implements OnInit, OnDestroy {
  annee = new Date().getFullYear();
  menuOpen = false;
  nombreArticles = 0;
  announcementClosed = false;
  topCategories: Categorie[] = [];
  private panierSub!: Subscription;

  constructor(
    public t: TraductionService,
    public th: ThemeService,
    private panierService: PanierService,
    private categorieService: CategorieService
  ) {}

  ngOnInit(): void {
    this.panierService.chargerPanier().subscribe();
    this.panierSub = this.panierService.panier$.subscribe(panier => {
      this.nombreArticles = panier?.nombreArticles || 0;
    });
    this.categorieService.listerTout().subscribe({
      next: (cats) => this.topCategories = cats.slice(0, 5)
    });
  }

  ngOnDestroy(): void {
    this.panierSub?.unsubscribe();
  }
}
