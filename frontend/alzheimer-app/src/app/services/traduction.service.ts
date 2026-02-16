import { Injectable } from '@angular/core';

export type Lang = 'fr' | 'en';

interface TranslationEntry {
  fr: string;
  en: string;
}

const DICT: Record<string, TranslationEntry> = {

  // ─── Common ──────────────────────────────────────────────
  'common.produit': { fr: 'produit', en: 'product' },
  'common.produits': { fr: 'produits', en: 'products' },
  'common.categorie': { fr: 'catégorie', en: 'category' },
  'common.categories': { fr: 'catégories', en: 'categories' },
  'common.resultat': { fr: 'résultat', en: 'result' },
  'common.resultats': { fr: 'résultats', en: 'results' },
  'common.chargement': { fr: 'Chargement...', en: 'Loading...' },
  'common.enStock': { fr: 'En stock', en: 'In stock' },
  'common.stockFaible': { fr: 'Stock faible', en: 'Low stock' },
  'common.rupture': { fr: 'Rupture', en: 'Out of stock' },
  'common.modifier': { fr: 'Modifier', en: 'Edit' },
  'common.supprimer': { fr: 'Supprimer', en: 'Delete' },
  'common.annuler': { fr: 'Annuler', en: 'Cancel' },
  'common.retour': { fr: 'Retour', en: 'Back' },
  'common.creer': { fr: 'Créer', en: 'Create' },
  'common.ajouter': { fr: 'Ajouter', en: 'Add' },
  'common.voirTout': { fr: 'Voir tout', en: 'View all' },
  'common.nom': { fr: 'Nom', en: 'Name' },
  'common.description': { fr: 'Description', en: 'Description' },
  'common.actions': { fr: 'Actions', en: 'Actions' },
  'common.id': { fr: 'ID', en: 'ID' },
  'common.tnd': { fr: 'TND', en: 'TND' },

  // ─── Navbar (Frontoffice) ────────────────────────────────
  'nav.brand': { fr: 'Gestion de Stock', en: 'Stock Management' },
  'nav.accueil': { fr: 'Accueil', en: 'Home' },
  'nav.catalogue': { fr: 'Catalogue', en: 'Catalog' },
  'nav.admin': { fr: 'Administration', en: 'Administration' },

  // ─── Footer ──────────────────────────────────────────────
  'footer.brand': { fr: 'Alzheimer - Gestion de Stock', en: 'Alzheimer - Stock Management' },
  'footer.info': { fr: 'Microservices Spring Boot + Angular', en: 'Microservices Spring Boot + Angular' },
  'footer.boInfo': { fr: 'Alzheimer - Gestion de Stock', en: 'Alzheimer - Stock Management' },

  // ─── Sidebar ─────────────────────────────────────────────
  'sidebar.brand': { fr: 'Gestion Stock', en: 'Stock Mgmt' },
  'sidebar.brandSub': { fr: 'Alzheimer Detection', en: 'Alzheimer Detection' },
  'sidebar.principal': { fr: 'Principal', en: 'Main' },
  'sidebar.tdb': { fr: 'Tableau de Bord', en: 'Dashboard' },
  'sidebar.gestion': { fr: 'Gestion', en: 'Management' },
  'sidebar.categories': { fr: 'Catégories', en: 'Categories' },
  'sidebar.produits': { fr: 'Produits', en: 'Products' },
  'sidebar.actionsRapides': { fr: 'Actions Rapides', en: 'Quick Actions' },
  'sidebar.nouvelleCat': { fr: 'Nouvelle Catégorie', en: 'New Category' },
  'sidebar.nouveauProd': { fr: 'Nouveau Produit', en: 'New Product' },
  'sidebar.voirSite': { fr: 'Voir le site', en: 'View Website' },
  'sidebar.tech': { fr: 'PostgreSQL | Spring Boot', en: 'PostgreSQL | Spring Boot' },
  'breadcrumb.accueil': { fr: 'Accueil', en: 'Home' },
  'breadcrumb.categories': { fr: 'Catégories', en: 'Categories' },
  'breadcrumb.nouvelleCat': { fr: 'Nouvelle Catégorie', en: 'New Category' },
  'breadcrumb.produits': { fr: 'Produits', en: 'Products' },
  'breadcrumb.nouveauProd': { fr: 'Nouveau Produit', en: 'New Product' },
  'breadcrumb.modifierCat': { fr: 'Modifier Catégorie', en: 'Edit Category' },
  'breadcrumb.modifierProd': { fr: 'Modifier Produit', en: 'Edit Product' },

  // ─── Accueil (Homepage) ──────────────────────────────────
  'accueil.titre': { fr: 'Gestion de Stock', en: 'Stock Management' },
  'accueil.sousTitre': {
    fr: 'Plateforme de gestion de stock pour le projet Alzheimer Detection.\nConsultez notre catalogue de produits et explorez les catégories disponibles.',
    en: 'Stock management platform for the Alzheimer Detection project.\nBrowse our product catalog and explore available categories.'
  },
  'accueil.btnCatalogue': { fr: 'Parcourir le Catalogue', en: 'Browse Catalog' },
  'accueil.enChiffres': { fr: 'En chiffres', en: 'In Numbers' },
  'accueil.statProduits': { fr: 'Produits', en: 'Products' },
  'accueil.statCategories': { fr: 'Catégories', en: 'Categories' },
  'accueil.statValeur': { fr: 'Valeur Stock (TND)', en: 'Stock Value (TND)' },
  'accueil.sectionCat': { fr: 'Catégories', en: 'Categories' },
  'accueil.derniersProduits': { fr: 'Derniers Produits', en: 'Latest Products' },

  // ─── Catalogue ───────────────────────────────────────────
  'catalogue.titre': { fr: 'Catalogue des Produits', en: 'Product Catalog' },
  'catalogue.sousTitre': {
    fr: 'Parcourez l\'ensemble de nos produits disponibles en stock.',
    en: 'Browse all our products available in stock.'
  },
  'catalogue.rechercher': { fr: 'Rechercher un produit...', en: 'Search for a product...' },
  'catalogue.toutesCat': { fr: 'Toutes les catégories', en: 'All categories' },
  'catalogue.toutStock': { fr: 'Tout le stock', en: 'All stock' },
  'catalogue.enStockFiltre': { fr: 'En stock (> 10)', en: 'In stock (> 10)' },
  'catalogue.faibleFiltre': { fr: 'Stock faible (1-10)', en: 'Low stock (1-10)' },
  'catalogue.ruptureFiltre': { fr: 'Rupture de stock', en: 'Out of stock' },
  'catalogue.trouves': { fr: 'trouvé', en: 'found' },
  'catalogue.filtres': { fr: 'filtré', en: 'filtered' },
  'catalogue.toutEffacer': { fr: 'Tout effacer', en: 'Clear all' },
  'catalogue.trierPar': { fr: 'Trier par', en: 'Sort by' },
  'catalogue.nomAZ': { fr: 'Nom A → Z', en: 'Name A → Z' },
  'catalogue.nomZA': { fr: 'Nom Z → A', en: 'Name Z → A' },
  'catalogue.prixAsc': { fr: 'Prix croissant', en: 'Price ascending' },
  'catalogue.prixDesc': { fr: 'Prix décroissant', en: 'Price descending' },
  'catalogue.dateDesc': { fr: 'Plus récents', en: 'Most recent' },
  'catalogue.dateAsc': { fr: 'Plus anciens', en: 'Oldest' },
  'catalogue.stockDesc': { fr: 'Stock décroissant', en: 'Stock descending' },
  'catalogue.stockAsc': { fr: 'Stock croissant', en: 'Stock ascending' },
  'catalogue.chipRecherche': { fr: 'Recherche', en: 'Search' },
  'catalogue.chipCategorie': { fr: 'Catégorie', en: 'Category' },
  'catalogue.chipStock': { fr: 'Stock', en: 'Stock' },
  'catalogue.aucunProduit': {
    fr: 'Aucun produit trouvé pour vos critères de recherche.',
    en: 'No products found matching your search criteria.'
  },
  'catalogue.reinitialiser': { fr: 'Réinitialiser les filtres', en: 'Reset filters' },
  'catalogue.affichage': { fr: 'Affichage', en: 'Showing' },
  'catalogue.sur': { fr: 'sur', en: 'of' },
  'catalogue.parPage': { fr: 'Par page :', en: 'Per page:' },
  'catalogue.premierePage': { fr: 'Première page', en: 'First page' },
  'catalogue.precedente': { fr: 'Page précédente', en: 'Previous page' },
  'catalogue.suivante': { fr: 'Page suivante', en: 'Next page' },
  'catalogue.dernierePage': { fr: 'Dernière page', en: 'Last page' },
  'catalogue.toutParcourir': { fr: 'Tout parcourir', en: 'Browse all' },

  // ─── Detail Produit ──────────────────────────────────────
  'detail.catalogue': { fr: 'Catalogue', en: 'Catalog' },
  'detail.prix': { fr: 'Prix', en: 'Price' },
  'detail.disponibilite': { fr: 'Disponibilité', en: 'Availability' },
  'detail.enStockUnites': { fr: 'En stock ({n} unités)', en: 'In stock ({n} units)' },
  'detail.faibleUnites': { fr: 'Stock faible ({n} unités)', en: 'Low stock ({n} units)' },
  'detail.ruptureStock': { fr: 'Rupture de stock', en: 'Out of stock' },
  'detail.categorie': { fr: 'Catégorie', en: 'Category' },
  'detail.retourCatalogue': { fr: 'Retour au catalogue', en: 'Back to catalog' },
  'detail.similaires': { fr: 'Produits similaires', en: 'Related Products' },

  // ─── Categorie Produits ──────────────────────────────────
  'catProd.rechercherDans': { fr: 'Rechercher dans cette catégorie...', en: 'Search in this category...' },
  'catProd.aucunProduit': { fr: 'Aucun produit dans cette catégorie.', en: 'No products in this category.' },
  'catProd.aucunFiltre': { fr: 'Aucun produit trouvé pour vos critères.', en: 'No products found matching your criteria.' },
  'catProd.parcourirCatalogue': { fr: 'Parcourir le catalogue', en: 'Browse catalog' },

  // ─── Tableau de Bord ─────────────────────────────────────
  'tdb.titre': { fr: 'Tableau de Bord', en: 'Dashboard' },
  'tdb.sousTitre': {
    fr: 'Gestion de Stock - Plateforme Détection Maladie Alzheimer',
    en: 'Stock Management - Alzheimer Disease Detection Platform'
  },
  'tdb.chargement': { fr: 'Chargement du tableau de bord...', en: 'Loading dashboard...' },
  'tdb.erreurChargement': {
    fr: 'Impossible de charger les données. Vérifiez que le serveur est démarré.',
    en: 'Unable to load data. Please check that the server is running.'
  },
  'tdb.reessayer': { fr: 'Réessayer', en: 'Retry' },
  'tdb.categories': { fr: 'Catégories', en: 'Categories' },
  'tdb.produits': { fr: 'Produits', en: 'Products' },
  'tdb.stockFaible': { fr: 'Stock Faible (≤ 10)', en: 'Low Stock (≤ 10)' },
  'tdb.valeurStock': { fr: 'Valeur Stock (TND)', en: 'Stock Value (TND)' },
  'tdb.alerteRupture': { fr: 'Alerte :', en: 'Alert:' },
  'tdb.enRuptureMsg': { fr: 'en rupture de stock !', en: 'out of stock!' },
  'tdb.voirProduits': { fr: 'Voir les produits', en: 'View products' },
  'tdb.nouvelleCat': { fr: 'Nouvelle Catégorie', en: 'New Category' },
  'tdb.ajouterCat': { fr: 'Ajouter une catégorie', en: 'Add a category' },
  'tdb.nouveauProd': { fr: 'Nouveau Produit', en: 'New Product' },
  'tdb.ajouterProd': { fr: 'Ajouter un produit au stock', en: 'Add a product to stock' },
  'tdb.voirStock': { fr: 'Voir tout le Stock', en: 'View All Stock' },
  'tdb.listeComplete': { fr: 'Liste complète des produits', en: 'Complete product list' },
  'tdb.dernieresCat': { fr: 'Dernières Catégories', en: 'Latest Categories' },
  'tdb.derniersProd': { fr: 'Derniers Produits', en: 'Latest Products' },
  'tdb.aucuneCat': { fr: 'Aucune catégorie', en: 'No categories' },
  'tdb.aucunProd': { fr: 'Aucun produit', en: 'No products' },
  'tdb.qte': { fr: 'Qté:', en: 'Qty:' },

  // ─── Liste Catégories ────────────────────────────────────
  'lc.titre': { fr: 'Gestion des Catégories', en: 'Category Management' },
  'lc.auTotal': { fr: 'au total', en: 'total' },
  'lc.nouvelleCat': { fr: 'Nouvelle Catégorie', en: 'New Category' },
  'lc.rechercher': { fr: 'Rechercher une catégorie...', en: 'Search for a category...' },
  'lc.nbProduits': { fr: 'Nb. Produits', en: 'Products' },
  'lc.dateCreation': { fr: 'Date Création', en: 'Created On' },
  'lc.aucuneCat': { fr: 'Aucune catégorie trouvée', en: 'No categories found' },
  'lc.aucunResultat': { fr: 'Aucun résultat pour', en: 'No results for' },
  'lc.ajouterCat': { fr: 'Ajouter une catégorie', en: 'Add a category' },
  'lc.confirmTitre': { fr: 'Confirmation de suppression', en: 'Delete Confirmation' },
  'lc.confirmMsg': {
    fr: 'Êtes-vous sûr de vouloir supprimer la catégorie',
    en: 'Are you sure you want to delete the category'
  },
  'lc.confirmWarning': {
    fr: 'Cette action est irréversible et supprimera tous les produits associés.',
    en: 'This action is irreversible and will delete all associated products.'
  },
  'lc.successSupp': { fr: 'Catégorie "{nom}" supprimée avec succès', en: 'Category "{nom}" deleted successfully' },
  'lc.erreurChargement': { fr: 'Erreur lors du chargement des catégories', en: 'Error loading categories' },
  'lc.erreurSuppression': { fr: 'Erreur lors de la suppression', en: 'Error during deletion' },
  'lc.chargement': { fr: 'Chargement des catégories...', en: 'Loading categories...' },
  'lc.affichage': { fr: 'Affichage', en: 'Showing' },

  // ─── Formulaire Catégorie ────────────────────────────────
  'fc.modifierTitre': { fr: 'Modifier la Catégorie', en: 'Edit Category' },
  'fc.nouveauTitre': { fr: 'Nouvelle Catégorie', en: 'New Category' },
  'fc.modifierSousTitre': { fr: 'Modifier les informations de la catégorie', en: 'Edit category information' },
  'fc.nouveauSousTitre': { fr: 'Ajouter une nouvelle catégorie au stock', en: 'Add a new category to stock' },
  'fc.infos': { fr: 'Informations de la Catégorie', en: 'Category Information' },
  'fc.nomObligatoire': { fr: 'Le nom est obligatoire', en: 'Name is required' },
  'fc.nomMin': { fr: 'Le nom doit contenir au moins 2 caractères', en: 'Name must be at least 2 characters' },
  'fc.placeholderNom': { fr: 'Ex: Médicaments, Équipements...', en: 'E.g.: Medications, Equipment...' },
  'fc.placeholderDesc': { fr: 'Décrivez la catégorie...', en: 'Describe the category...' },
  'fc.caracteres': { fr: 'caractères', en: 'characters' },
  'fc.erreurChargement': { fr: 'Impossible de charger la catégorie', en: 'Unable to load category' },
  'fc.erreurModification': { fr: 'Erreur lors de la modification', en: 'Error during update' },
  'fc.erreurCreation': { fr: 'Erreur lors de la création', en: 'Error during creation' },

  // ─── Liste Produits ──────────────────────────────────────
  'lp.titre': { fr: 'Gestion des Produits', en: 'Product Management' },
  'lp.auTotal': { fr: 'au total', en: 'total' },
  'lp.nouveauProd': { fr: 'Nouveau Produit', en: 'New Product' },
  'lp.rechercher': { fr: 'Rechercher un produit...', en: 'Search for a product...' },
  'lp.toutesCat': { fr: 'Toutes catégories', en: 'All categories' },
  'lp.toutStock': { fr: 'Tout le stock', en: 'All stock' },
  'lp.stockNormal': { fr: 'Stock normal', en: 'Normal stock' },
  'lp.stockFaible': { fr: 'Stock faible', en: 'Low stock' },
  'lp.enRupture': { fr: 'En rupture', en: 'Out of stock' },
  'lp.prixTND': { fr: 'Prix (TND)', en: 'Price (TND)' },
  'lp.quantite': { fr: 'Quantité', en: 'Quantity' },
  'lp.dateCreation': { fr: 'Date Création', en: 'Created On' },
  'lp.aucunProduit': { fr: 'Aucun produit trouvé', en: 'No products found' },
  'lp.aucunFiltre': { fr: 'Aucun résultat pour vos filtres', en: 'No results for your filters' },
  'lp.ajouterProduit': { fr: 'Ajouter un produit', en: 'Add a product' },
  'lp.reinitialiser': { fr: 'Réinitialiser les filtres', en: 'Reset filters' },
  'lp.ruptureBadge': { fr: 'Rupture', en: 'Out' },
  'lp.confirmTitre': { fr: 'Confirmation de suppression', en: 'Delete Confirmation' },
  'lp.confirmMsg': {
    fr: 'Êtes-vous sûr de vouloir supprimer le produit',
    en: 'Are you sure you want to delete the product'
  },
  'lp.successSupp': { fr: 'Produit "{nom}" supprimé avec succès', en: 'Product "{nom}" deleted successfully' },
  'lp.erreurChargement': { fr: 'Erreur lors du chargement des produits', en: 'Error loading products' },
  'lp.erreurSuppression': { fr: 'Erreur lors de la suppression', en: 'Error during deletion' },
  'lp.chargement': { fr: 'Chargement des produits...', en: 'Loading products...' },
  'lp.affichage': { fr: 'Affichage', en: 'Showing' },

  // ─── Formulaire Produit ──────────────────────────────────
  'fp.modifierTitre': { fr: 'Modifier le Produit', en: 'Edit Product' },
  'fp.nouveauTitre': { fr: 'Nouveau Produit', en: 'New Product' },
  'fp.modifierSousTitre': { fr: 'Modifier les informations du produit', en: 'Edit product information' },
  'fp.nouveauSousTitre': { fr: 'Ajouter un nouveau produit au stock', en: 'Add a new product to stock' },
  'fp.infos': { fr: 'Informations du Produit', en: 'Product Information' },
  'fp.nomObligatoire': { fr: 'Le nom est obligatoire', en: 'Name is required' },
  'fp.nomMin': { fr: 'Le nom doit contenir au moins 2 caractères', en: 'Name must be at least 2 characters' },
  'fp.placeholderNom': { fr: 'Ex: Donépézil 10mg', en: 'E.g.: Donepezil 10mg' },
  'fp.placeholderDesc': { fr: 'Décrivez le produit...', en: 'Describe the product...' },
  'fp.prixLabel': { fr: 'Prix (TND)', en: 'Price (TND)' },
  'fp.prixInvalide': { fr: 'Le prix doit être supérieur à 0', en: 'Price must be greater than 0' },
  'fp.quantiteLabel': { fr: 'Quantité', en: 'Quantity' },
  'fp.quantiteInvalide': { fr: 'La quantité ne peut pas être négative', en: 'Quantity cannot be negative' },
  'fp.categorieLabel': { fr: 'Catégorie', en: 'Category' },
  'fp.selectCategorie': { fr: '-- Sélectionner une catégorie --', en: '-- Select a category --' },
  'fp.categorieObligatoire': { fr: 'La catégorie est obligatoire', en: 'Category is required' },
  'fp.valeurStock': { fr: 'Valeur en stock :', en: 'Stock value:' },
  'fp.enRupture': { fr: 'Produit en rupture de stock', en: 'Product out of stock' },
  'fp.stockFaible': { fr: 'Stock faible', en: 'Low stock' },
  'fp.erreurChargement': { fr: 'Impossible de charger le produit', en: 'Unable to load product' },
  'fp.erreurCategories': { fr: 'Impossible de charger les catégories', en: 'Unable to load categories' },
  'fp.erreurModification': { fr: 'Erreur lors de la modification', en: 'Error during update' },
  'fp.erreurCreation': { fr: 'Erreur lors de la création', en: 'Error during creation' },
};

@Injectable({ providedIn: 'root' })
export class TraductionService {

  lang: Lang = (this.getStoredLang() || 'fr');

  private getStoredLang(): Lang | null {
    try {
      const stored = localStorage.getItem('lang');
      if (stored === 'fr' || stored === 'en') return stored;
    } catch {}
    return null;
  }

  get isFr(): boolean { return this.lang === 'fr'; }
  get isEn(): boolean { return this.lang === 'en'; }

  setLang(l: Lang): void {
    this.lang = l;
    try { localStorage.setItem('lang', l); } catch {}
  }

  toggleLang(): void {
    this.setLang(this.lang === 'fr' ? 'en' : 'fr');
  }

  tr(key: string, params?: Record<string, string | number>): string {
    const entry = DICT[key];
    if (!entry) return key;
    let text = entry[this.lang] || entry['fr'] || key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  }

  /** Returns locale string for date formatting */
  get locale(): string {
    return this.lang === 'fr' ? 'fr-FR' : 'en-US';
  }
}
