export interface LignePanier {
  id?: number;
  produitId: number;
  produitNom?: string;
  produitPrix?: number;
  produitQuantiteStock?: number;
  categorieNom?: string;
  quantite: number;
  sousTotal?: number;
  dateAjout?: string;
}

export interface Panier {
  id?: number;
  sessionId: string;
  lignes: LignePanier[];
  nombreArticles: number;
  montantTotal: number;
  dateCreation?: string;
  dateModification?: string;
}
