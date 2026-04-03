import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./composants/layouts/layout-frontoffice/layout-frontoffice.component')
        .then(m => m.LayoutFrontofficeComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./composants/frontoffice/accueil/accueil.component')
            .then(m => m.AccueilComponent)
      },
      {
        path: 'catalogue',
        loadComponent: () =>
          import('./composants/frontoffice/catalogue/catalogue.component')
            .then(m => m.CatalogueComponent)
      },
      {
        path: 'catalogue/:id',
        loadComponent: () =>
          import('./composants/frontoffice/detail-produit/detail-produit.component')
            .then(m => m.DetailProduitComponent)
      },
      {
        path: 'categories/:id',
        loadComponent: () =>
          import('./composants/frontoffice/categorie-produits/categorie-produits.component')
            .then(m => m.CategorieProduitsComponent)
      },
      {
        path: 'panier',
        loadComponent: () =>
          import('./composants/frontoffice/panier/panier.component')
            .then(m => m.PanierComponent)
      },
      {
        path: 'commander',
        loadComponent: () =>
          import('./composants/frontoffice/commander/commander.component')
            .then(m => m.CommanderComponent)
      },
      {
        path: 'wishlist',
        loadComponent: () =>
          import('./composants/frontoffice/wishlist/wishlist.component')
            .then(m => m.WishlistComponent)
      },
      {
        path: 'commande/:ref',
        loadComponent: () =>
          import('./composants/frontoffice/confirmation-commande/confirmation-commande.component')
            .then(m => m.ConfirmationCommandeComponent)
      }
    ]
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./composants/layouts/layout-backoffice/layout-backoffice.component')
        .then(m => m.LayoutBackofficeComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./composants/tableau-de-bord/tableau-de-bord.component')
            .then(m => m.TableauDeBordComponent)
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./composants/categorie/liste-categories/liste-categories.component')
            .then(m => m.ListeCategoriesComponent)
      },
      {
        path: 'categories/ajouter',
        loadComponent: () =>
          import('./composants/categorie/formulaire-categorie/formulaire-categorie.component')
            .then(m => m.FormulaireCategorieComponent)
      },
      {
        path: 'categories/modifier/:id',
        loadComponent: () =>
          import('./composants/categorie/formulaire-categorie/formulaire-categorie.component')
            .then(m => m.FormulaireCategorieComponent)
      },
      {
        path: 'produits',
        loadComponent: () =>
          import('./composants/produit/liste-produits/liste-produits.component')
            .then(m => m.ListeProduitsComponent)
      },
      {
        path: 'produits/ajouter',
        loadComponent: () =>
          import('./composants/produit/formulaire-produit/formulaire-produit.component')
            .then(m => m.FormulaireProduitComponent)
      },
      {
        path: 'produits/modifier/:id',
        loadComponent: () =>
          import('./composants/produit/formulaire-produit/formulaire-produit.component')
            .then(m => m.FormulaireProduitComponent)
      },
      {
        path: 'commandes',
        loadComponent: () =>
          import('./composants/commande/liste-commandes/liste-commandes.component')
            .then(m => m.ListeCommandesComponent)
      },
      {
        path: 'commandes/:id',
        loadComponent: () =>
          import('./composants/commande/detail-commande/detail-commande.component')
            .then(m => m.DetailCommandeComponent)
      },
      {
        path: 'analyse-stock',
        loadComponent: () =>
          import('./composants/analyse-stock/analyse-stock.component')
            .then(m => m.AnalyseStockComponent)
      },
      {
        path: 'emails',
        loadComponent: () =>
          import('./composants/email/liste-emails/liste-emails.component')
            .then(m => m.ListeEmailsComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
