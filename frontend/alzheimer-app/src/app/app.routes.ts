import { Routes } from '@angular/router';

export const routes: Routes = [
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
  { path: '**', redirectTo: '' }
];
