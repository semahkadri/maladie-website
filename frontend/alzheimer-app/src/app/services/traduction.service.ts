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

  // ─── Theme ──────────────────────────────────────────────
  'theme.dark': { fr: 'Mode sombre', en: 'Dark mode' },
  'theme.light': { fr: 'Mode clair', en: 'Light mode' },

  // ─── Navbar (Frontoffice) ────────────────────────────────
  'nav.brand': { fr: 'PharmaCare', en: 'PharmaCare' },
  'nav.rechercher': { fr: 'Rechercher un produit...', en: 'Search for a product...' },
  'nav.accueil': { fr: 'Accueil', en: 'Home' },
  'nav.catalogue': { fr: 'Catalogue', en: 'Catalog' },
  'nav.admin': { fr: 'Administration', en: 'Administration' },

  // ─── Footer ──────────────────────────────────────────────
  'footer.brand': { fr: 'PharmaCare', en: 'PharmaCare' },
  'footer.info': { fr: 'Votre pharmacie en ligne de confiance', en: 'Your trusted online pharmacy' },
  'footer.desc': { fr: 'Votre pharmacie en ligne de confiance. Produits certifiés, livraison rapide et service client disponible 7j/7.', en: 'Your trusted online pharmacy. Certified products, fast delivery and customer service available 7 days a week.' },
  'footer.liens': { fr: 'Liens Rapides', en: 'Quick Links' },
  'footer.service': { fr: 'Service Client', en: 'Customer Service' },
  'footer.livraison': { fr: 'Livraison', en: 'Delivery' },
  'footer.retours': { fr: 'Retours & Remboursements', en: 'Returns & Refunds' },
  'footer.faq': { fr: 'FAQ', en: 'FAQ' },
  'footer.contact': { fr: 'Contact', en: 'Contact' },
  'footer.adresse': { fr: 'Tunis, Tunisie', en: 'Tunis, Tunisia' },
  'footer.droits': { fr: 'Tous droits réservés.', en: 'All rights reserved.' },
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
  'accueil.titre': { fr: 'Votre santé, notre priorité', en: 'Your health, our priority' },
  'accueil.sousTitre': {
    fr: 'Découvrez notre sélection de médicaments, soins et produits de parapharmacie livrés directement chez vous.',
    en: 'Discover our selection of medicines, care products and parapharmacy delivered directly to your door.'
  },
  'accueil.btnCatalogue': { fr: 'Explorer nos produits', en: 'Explore our products' },
  'accueil.sectionCat': { fr: 'Catégories', en: 'Categories' },
  'accueil.voirProduits': { fr: 'Voir les produits', en: 'Browse products' },
  'accueil.derniersProduits': { fr: 'Nouveautés', en: 'New Arrivals' },

  // ─── Announcement Bar ─────────────────────────────────
  'announce.livraison': { fr: 'Livraison gratuite dès 99 DT', en: 'Free delivery from 99 TND' },
  'announce.pharmacie': { fr: 'Pharmacie certifiée', en: 'Certified pharmacy' },
  'announce.support': { fr: 'Support 7j/7', en: 'Support 7 days a week' },

  // ─── Hero ─────────────────────────────────────────────
  'hero.badge': { fr: 'Pharmacie certifiée', en: 'Certified Pharmacy' },
  'hero.nouveautes': { fr: 'Découvrir les nouveautés', en: 'Discover new arrivals' },
  'hero.promoTitre': { fr: 'Les essentiels pharmacie', en: 'Pharmacy Essentials' },
  'hero.promoDesc': { fr: 'Retrouvez tous vos produits de santé et bien-être au meilleur prix.', en: 'Find all your health and wellness products at the best price.' },

  // ─── Trust Strip ──────────────────────────────────────
  'trust.livraison': { fr: 'Livraison rapide', en: 'Fast delivery' },
  'trust.livraisonDesc': { fr: '24-48h partout en Tunisie', en: '24-48h across Tunisia' },
  'trust.paiement': { fr: 'Paiement sécurisé', en: 'Secure payment' },
  'trust.paiementDesc': { fr: 'Transactions 100% sécurisées', en: '100% secure transactions' },
  'trust.certifie': { fr: 'Pharmacie certifiée', en: 'Certified pharmacy' },
  'trust.certifieDesc': { fr: 'Produits authentiques garantis', en: 'Guaranteed authentic products' },
  'trust.retour': { fr: 'Retours faciles', en: 'Easy returns' },
  'trust.retourDesc': { fr: 'Retour gratuit sous 14 jours', en: 'Free returns within 14 days' },
  'trust.garantie': { fr: 'Produits authentiques garantis', en: 'Guaranteed authentic products' },
  'trust.retourDetail': { fr: 'Retour gratuit sous 14 jours', en: 'Free returns within 14 days' },
  'trust.livraisonDetail': { fr: 'Livraison 24-48h', en: 'Delivery 24-48h' },

  // ─── Badges ───────────────────────────────────────────
  'badge.nouveau': { fr: 'Nouveau', en: 'New' },
  'badge.promo': { fr: 'Promo', en: 'Sale' },

  // ─── Promo Banner ─────────────────────────────────────
  'promo.titre': { fr: 'Les indispensables de votre pharmacie', en: 'Your pharmacy essentials' },
  'promo.desc': { fr: 'Découvrez notre sélection de produits essentiels pour votre santé et bien-être au quotidien.', en: 'Discover our selection of essential products for your daily health and well-being.' },
  'promo.cta': { fr: 'Je découvre', en: 'Discover now' },

  // ─── Newsletter ───────────────────────────────────────
  'newsletter.titre': { fr: 'Restez informé', en: 'Stay informed' },
  'newsletter.desc': { fr: 'Recevez nos offres exclusives et nouveautés directement dans votre boîte mail.', en: 'Receive our exclusive offers and new arrivals directly in your inbox.' },
  'newsletter.placeholder': { fr: 'Votre adresse email', en: 'Your email address' },
  'newsletter.btn': { fr: "S'inscrire", en: 'Subscribe' },

  // ─── Catalogue ───────────────────────────────────────────
  'catalogue.titre': { fr: 'Catalogue des Produits', en: 'Product Catalog' },
  'catalogue.sousTitre': {
    fr: 'Parcourez l\'ensemble de nos produits disponibles en stock.',
    en: 'Browse all our products available in stock.'
  },
  'catalogue.rechercher': { fr: 'Rechercher un produit...', en: 'Search for a product...' },
  'catalogue.toutesCat': { fr: 'Toutes les catégories', en: 'All categories' },
  'catalogue.toutStock': { fr: 'Tous', en: 'All' },
  'catalogue.disponible': { fr: 'Disponible', en: 'Available' },
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
  'tdb.commandes': { fr: 'Commandes', en: 'Orders' },
  'tdb.enAttente': { fr: 'En Attente', en: 'Pending' },
  'tdb.chiffreAffaires': { fr: 'Chiffre d\'Affaires (TND)', en: 'Revenue (TND)' },
  'tdb.dernieresCmd': { fr: 'Dernières Commandes', en: 'Latest Orders' },
  'tdb.aucuneCmd': { fr: 'Aucune commande', en: 'No orders' },
  'tdb.voirCommandes': { fr: 'Voir les commandes', en: 'View orders' },
  'tdb.gererCommandes': { fr: 'Gérer les commandes', en: 'Manage orders' },

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
  'fp.imageLabel': { fr: 'Image du produit', en: 'Product image' },
  'fp.placeholderImage': { fr: 'Cliquez ou glissez une image ici', en: 'Click or drag an image here' },
  'fp.uploadImage': { fr: 'Uploader une image', en: 'Upload an image' },
  'fp.changeImage': { fr: 'Changer', en: 'Change' },
  'fp.removeImage': { fr: 'Supprimer', en: 'Remove' },
  'fp.formatImage': { fr: 'JPEG, PNG, GIF ou WebP — 5 Mo max', en: 'JPEG, PNG, GIF or WebP — 5 MB max' },
  'fp.erreurUpload': { fr: 'Erreur lors de l\'upload de l\'image', en: 'Error uploading image' },
  'fp.erreurTaille': { fr: 'Le fichier dépasse la taille maximale (5 Mo)', en: 'File exceeds maximum size (5 MB)' },
  'fp.erreurFormat': { fr: 'Format non supporté. Utilisez JPEG, PNG, GIF ou WebP', en: 'Unsupported format. Use JPEG, PNG, GIF or WebP' },

  // ─── Navbar (Panier) ───────────────────────────────────
  'nav.panier': { fr: 'Panier', en: 'Cart' },

  // ─── Sidebar (Commandes) ───────────────────────────────
  'sidebar.commandes': { fr: 'Commandes', en: 'Orders' },
  'breadcrumb.commandes': { fr: 'Commandes', en: 'Orders' },
  'breadcrumb.detailCommande': { fr: 'Détail Commande', en: 'Order Detail' },

  // ─── Panier (Cart) ─────────────────────────────────────
  'panier.titre': { fr: 'Mon Panier', en: 'My Cart' },
  'panier.sousTitre': { fr: 'Gérez les articles de votre panier avant de passer commande.', en: 'Manage your cart items before placing an order.' },
  'panier.vide': { fr: 'Votre panier est vide.', en: 'Your cart is empty.' },
  'panier.parcourir': { fr: 'Parcourir le catalogue', en: 'Browse catalog' },
  'panier.viderPanier': { fr: 'Vider le panier', en: 'Empty cart' },
  'panier.stock': { fr: 'Stock', en: 'Stock' },
  'panier.resume': { fr: 'Récapitulatif', en: 'Summary' },
  'panier.articles': { fr: 'Articles', en: 'Items' },
  'panier.sousTotal': { fr: 'Sous-total', en: 'Subtotal' },
  'panier.total': { fr: 'Total', en: 'Total' },
  'panier.commander': { fr: 'Passer la commande', en: 'Place order' },
  'panier.continuer': { fr: 'Continuer les achats', en: 'Continue shopping' },
  'panier.erreurChargement': { fr: 'Impossible de charger le panier.', en: 'Unable to load cart.' },
  'panier.erreurModif': { fr: 'Erreur lors de la modification de la quantité.', en: 'Error updating quantity.' },
  'panier.erreurSupp': { fr: 'Erreur lors de la suppression du produit.', en: 'Error removing product.' },
  'panier.erreurVider': { fr: 'Erreur lors du vidage du panier.', en: 'Error emptying cart.' },
  'panier.ajouterSuccess': { fr: 'Produit ajouté au panier !', en: 'Product added to cart!' },
  'panier.ajouterErreur': { fr: 'Erreur lors de l\'ajout au panier.', en: 'Error adding to cart.' },
  'panier.reserveInfo': { fr: 'Votre panier est réservé pour une durée limitée', en: 'Your cart is reserved for a limited time' },
  'panier.expireInfo': { fr: 'Finalisez votre commande pour ne pas perdre vos articles.', en: 'Complete your order to avoid losing your items.' },

  // ─── Catalogue (Add to Cart) ───────────────────────────
  'catalogue.ajouterPanier': { fr: 'Ajouter au panier', en: 'Add to cart' },

  // ─── Detail Produit (Add to Cart) ──────────────────────
  'detail.ajouterPanier': { fr: 'Ajouter au panier', en: 'Add to cart' },
  'detail.quantiteLabel': { fr: 'Quantité', en: 'Quantity' },

  // ─── Checkout ──────────────────────────────────────────
  'checkout.titre': { fr: 'Finaliser la commande', en: 'Complete Order' },
  'checkout.sousTitre': { fr: 'Remplissez vos informations pour valider votre commande.', en: 'Fill in your information to confirm your order.' },
  'checkout.infosClient': { fr: 'Informations du Client', en: 'Client Information' },
  'checkout.nom': { fr: 'Nom complet', en: 'Full name' },
  'checkout.placeholderNom': { fr: 'Ex: Ahmed Ben Salah', en: 'E.g.: Ahmed Ben Salah' },
  'checkout.nomObligatoire': { fr: 'Le nom est obligatoire (min. 2 caractères)', en: 'Name is required (min. 2 characters)' },
  'checkout.email': { fr: 'Email', en: 'Email' },
  'checkout.placeholderEmail': { fr: 'Ex: ahmed@example.com', en: 'E.g.: ahmed@example.com' },
  'checkout.emailInvalide': { fr: 'Adresse email invalide', en: 'Invalid email address' },
  'checkout.telephone': { fr: 'Téléphone', en: 'Phone' },
  'checkout.placeholderTel': { fr: 'Ex: +216 XX XXX XXX', en: 'E.g.: +216 XX XXX XXX' },
  'checkout.adresse': { fr: 'Adresse de livraison', en: 'Delivery address' },
  'checkout.placeholderAdresse': { fr: 'Adresse complète...', en: 'Full address...' },
  'checkout.confirmer': { fr: 'Confirmer la commande', en: 'Confirm order' },
  'checkout.recapitulatif': { fr: 'Récapitulatif de commande', en: 'Order Summary' },
  'checkout.erreur': { fr: 'Erreur lors de la création de la commande.', en: 'Error creating order.' },
  'checkout.telephoneObligatoire': { fr: 'Le téléphone est obligatoire', en: 'Phone number is required' },
  'checkout.telephoneFormat': { fr: 'Le téléphone ne doit contenir que des chiffres', en: 'Phone number must contain only digits' },
  'checkout.adresseObligatoire': { fr: 'L\'adresse de livraison est obligatoire', en: 'Delivery address is required' },

  // ─── Confirmation Commande ─────────────────────────────
  'confirmation.introuvable': { fr: 'Commande introuvable.', en: 'Order not found.' },
  'confirmation.titre': { fr: 'Commande confirmée !', en: 'Order confirmed!' },
  'confirmation.sousTitre': { fr: 'Votre commande a été enregistrée avec succès. Vous recevrez une confirmation prochainement.', en: 'Your order has been successfully recorded. You will receive a confirmation shortly.' },
  'confirmation.reference': { fr: 'Référence de commande', en: 'Order reference' },
  'confirmation.details': { fr: 'Détails de la commande', en: 'Order Details' },
  'confirmation.statut': { fr: 'Statut', en: 'Status' },
  'confirmation.enAttente': { fr: 'En attente', en: 'Pending' },
  'confirmation.continuer': { fr: 'Continuer les achats', en: 'Continue shopping' },
  'confirmation.produitsEpuises': { fr: 'Les produits suivants sont désormais en rupture de stock et ont été retirés du catalogue :', en: 'The following products are now out of stock and have been removed from the catalog:' },

  // ─── Liste Commandes (Backoffice) ──────────────────────
  'lcmd.titre': { fr: 'Gestion des Commandes', en: 'Order Management' },
  'lcmd.commandes': { fr: 'commandes', en: 'orders' },
  'lcmd.commande': { fr: 'commande', en: 'order' },
  'lcmd.rechercher': { fr: 'Rechercher par référence, client...', en: 'Search by reference, client...' },
  'lcmd.tousStatuts': { fr: 'Tous les statuts', en: 'All statuses' },
  'lcmd.enAttente': { fr: 'En attente', en: 'Pending' },
  'lcmd.confirmee': { fr: 'Confirmée', en: 'Confirmed' },
  'lcmd.enPreparation': { fr: 'En préparation', en: 'In preparation' },
  'lcmd.expediee': { fr: 'Expédiée', en: 'Shipped' },
  'lcmd.livree': { fr: 'Livrée', en: 'Delivered' },
  'lcmd.annulee': { fr: 'Annulée', en: 'Cancelled' },
  'lcmd.reference': { fr: 'Référence', en: 'Reference' },
  'lcmd.client': { fr: 'Client', en: 'Client' },
  'lcmd.articles': { fr: 'Articles', en: 'Items' },
  'lcmd.montant': { fr: 'Montant', en: 'Amount' },
  'lcmd.statutCol': { fr: 'Statut', en: 'Status' },
  'lcmd.date': { fr: 'Date', en: 'Date' },
  'lcmd.aucune': { fr: 'Aucune commande trouvée.', en: 'No orders found.' },
  'lcmd.voir': { fr: 'Voir', en: 'View' },
  'lcmd.erreurChargement': { fr: 'Erreur lors du chargement des commandes.', en: 'Error loading orders.' },

  // ─── Détail Commande (Backoffice) ──────────────────────
  'dcmd.titre': { fr: 'Détail de la Commande', en: 'Order Detail' },
  'dcmd.reference': { fr: 'Réf.', en: 'Ref.' },
  'dcmd.infos': { fr: 'Informations de la commande', en: 'Order Information' },
  'dcmd.client': { fr: 'Client', en: 'Client' },
  'dcmd.dateCommande': { fr: 'Date de commande', en: 'Order date' },
  'dcmd.adresse': { fr: 'Adresse de livraison', en: 'Delivery address' },
  'dcmd.articles': { fr: 'Articles commandés', en: 'Ordered Items' },
  'dcmd.prixUnit': { fr: 'Prix unitaire', en: 'Unit price' },
  'dcmd.sousTotal': { fr: 'Sous-total', en: 'Subtotal' },
  'dcmd.changerStatut': { fr: 'Changer le statut', en: 'Change Status' },
  'dcmd.appliquer': { fr: 'Appliquer', en: 'Apply' },
  'dcmd.retourListe': { fr: 'Retour à la liste', en: 'Back to list' },
  'dcmd.erreurChargement': { fr: 'Impossible de charger la commande.', en: 'Unable to load order.' },
  'dcmd.statutModifie': { fr: 'Statut modifié avec succès.', en: 'Status updated successfully.' },
  'dcmd.erreurStatut': { fr: 'Erreur lors de la modification du statut.', en: 'Error updating status.' },

  // ─── Sidebar / Breadcrumb (Analyse) ──────────────────────
  'sidebar.analyse': { fr: 'Analyse', en: 'Analytics' },
  'sidebar.analyseStock': { fr: 'Analyse de Stock', en: 'Stock Analytics' },
  'breadcrumb.analyseStock': { fr: 'Analyse de Stock', en: 'Stock Analytics' },

  // ─── Analyse de Stock ────────────────────────────────────
  'analyse.titre': { fr: 'Analyse Avancée du Stock', en: 'Advanced Stock Analytics' },
  'analyse.sousTitre': { fr: 'Classification ABC, prévisions de demande, indicateurs de performance et alertes de réapprovisionnement.', en: 'ABC classification, demand forecasting, performance indicators and reorder alerts.' },
  'analyse.chargement': { fr: 'Calcul des indicateurs...', en: 'Calculating indicators...' },
  'analyse.erreur': { fr: 'Impossible de charger l\'analyse. Vérifiez que le serveur est démarré.', en: 'Unable to load analysis. Please check that the server is running.' },

  // KPI Cards
  'analyse.totalProduits': { fr: 'Produits en stock', en: 'Products in stock' },
  'analyse.commandes90j': { fr: 'Commandes (90j)', en: 'Orders (90d)' },
  'analyse.ca90j': { fr: 'CA 90 jours (TND)', en: 'Revenue 90d (TND)' },
  'analyse.croissance': { fr: 'Croissance mensuelle', en: 'Monthly growth' },
  'analyse.enAlerte': { fr: 'Produits en alerte', en: 'Products in alert' },
  'analyse.enRupture': { fr: 'Ruptures de stock', en: 'Out of stock' },
  'analyse.rotationMoyenne': { fr: 'Rotation moyenne (90j)', en: 'Avg turnover (90d)' },

  // ABC Analysis
  'analyse.abcTitre': { fr: 'Classification ABC (Pareto)', en: 'ABC Classification (Pareto)' },
  'analyse.abcDesc': { fr: 'Répartition des produits selon leur contribution au chiffre d\'affaires (Principe de Pareto 80/20).', en: 'Product distribution by revenue contribution (Pareto Principle 80/20).' },
  'analyse.prod': { fr: 'prod.', en: 'prod.' },
  'analyse.abcA': { fr: 'Produits stratégiques — 80% du CA', en: 'Strategic products — 80% of revenue' },
  'analyse.abcB': { fr: 'Produits intermédiaires — 15% du CA', en: 'Intermediate products — 15% of revenue' },
  'analyse.abcC': { fr: 'Produits courants — 5% du CA', en: 'Standard products — 5% of revenue' },

  // Sales Trend
  'analyse.tendanceTitre': { fr: 'Tendance des Ventes', en: 'Sales Trend' },
  'analyse.aucuneVente': { fr: 'Aucune donnée de vente disponible.', en: 'No sales data available.' },
  'analyse.mois': { fr: 'Mois', en: 'Month' },
  'analyse.caEnTND': { fr: 'Chiffre d\'affaires en TND', en: 'Revenue in TND' },

  // Product Table
  'analyse.tableTitre': { fr: 'Analyse par Produit', en: 'Product Analysis' },
  'analyse.tousABC': { fr: 'Toutes classes', en: 'All classes' },
  'analyse.classeA': { fr: 'Classe A', en: 'Class A' },
  'analyse.classeB': { fr: 'Classe B', en: 'Class B' },
  'analyse.classeC': { fr: 'Classe C', en: 'Class C' },
  'analyse.tousEtats': { fr: 'Tous les états', en: 'All states' },
  'analyse.alerteSeulement': { fr: 'En alerte seulement', en: 'Alerts only' },
  'analyse.sainSeulement': { fr: 'Sains seulement', en: 'Healthy only' },
  'analyse.triScore': { fr: 'Tri: Score santé', en: 'Sort: Health score' },
  'analyse.triCA': { fr: 'Tri: Chiffre d\'affaires', en: 'Sort: Revenue' },
  'analyse.triRotation': { fr: 'Tri: Taux de rotation', en: 'Sort: Turnover rate' },
  'analyse.triStock': { fr: 'Tri: Stock', en: 'Sort: Stock' },

  // Table Columns
  'analyse.colProduit': { fr: 'Produit', en: 'Product' },
  'analyse.colABC': { fr: 'ABC', en: 'ABC' },
  'analyse.colStock': { fr: 'Stock', en: 'Stock' },
  'analyse.colVendu': { fr: 'Vendu (90j)', en: 'Sold (90d)' },
  'analyse.colCA': { fr: 'CA (TND)', en: 'Rev (TND)' },
  'analyse.colRotation': { fr: 'Rotation', en: 'Turnover' },
  'analyse.colJours': { fr: 'Jours', en: 'Days' },
  'analyse.colReappro': { fr: 'Réappro.', en: 'Reorder' },
  'analyse.colPrevision': { fr: 'Prévision', en: 'Forecast' },
  'analyse.colTendance': { fr: 'Tendance', en: 'Trend' },
  'analyse.colScore': { fr: 'Santé', en: 'Health' },
  'analyse.aucunResultat': { fr: 'Aucun produit ne correspond aux filtres.', en: 'No products match the filters.' },

  // Legend
  'analyse.legendeTitre': { fr: 'Légende des Indicateurs', en: 'Indicator Legend' },
  'analyse.legendeRotation': { fr: 'Taux de Rotation', en: 'Turnover Rate' },
  'analyse.legendeRotationDesc': { fr: 'Quantité vendue (90j) / Stock actuel. Un taux élevé indique une forte demande. ≥2x = bon, <1x = lent.', en: 'Quantity sold (90d) / Current stock. High rate means strong demand. ≥2x = good, <1x = slow.' },
  'analyse.legendeReappro': { fr: 'Point de Réapprovisionnement', en: 'Reorder Point' },
  'analyse.legendeReapproDesc': { fr: 'Seuil de stock minimum calculé : (demande moyenne × délai livraison) + stock de sécurité. Commander quand le stock atteint ce niveau.', en: 'Calculated minimum stock threshold: (avg demand × lead time) + safety stock. Reorder when stock reaches this level.' },
  'analyse.legendeScore': { fr: 'Score de Santé (0-100)', en: 'Health Score (0-100)' },
  'analyse.legendeScoreDesc': { fr: 'Indicateur composite : niveau de stock (30pts), rotation (25pts), classe ABC (20pts), tendance (15pts), couverture stock (10pts). ≥70 = sain, 40-69 = attention, <40 = critique.', en: 'Composite indicator: stock level (30pts), turnover (25pts), ABC class (20pts), trend (15pts), stock coverage (10pts). ≥70 = healthy, 40-69 = caution, <40 = critical.' },

  // ─── Quick View / Mini-Cart / Dynamic UI ───────────────
  'catalogue.quickView': { fr: 'Aperçu rapide', en: 'Quick View' },
  'catalogue.voirDetail': { fr: 'Voir tous les détails', en: 'View full details' },
  'minicart.titre': { fr: 'Panier', en: 'Cart' },
  'minicart.voirPanier': { fr: 'Voir le panier', en: 'View cart' },
  'minicart.vide': { fr: 'Votre panier est vide', en: 'Your cart is empty' },
  'minicart.sousTotal': { fr: 'Sous-total', en: 'Subtotal' },
  'marquee.marques': { fr: 'Nos marques partenaires', en: 'Our partner brands' },
  'backToTop': { fr: 'Haut de page', en: 'Back to top' },
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
