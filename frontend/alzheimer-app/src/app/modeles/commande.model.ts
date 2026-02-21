export interface LigneCommande {
  id?: number;
  produitId?: number | null;
  nomProduit: string;
  prixUnitaire: number;
  quantite: number;
  sousTotal: number;
}

export interface Commande {
  id?: number;
  reference: string;
  nomClient: string;
  emailClient?: string;
  telephoneClient?: string;
  adresseLivraison?: string;
  statut: string;
  montantTotal: number;
  lignes: LigneCommande[];
  nombreArticles: number;
  dateCommande?: string;
  dateModification?: string;
  produitsEpuises?: string[];
}

export interface CreerCommande {
  nomClient: string;
  emailClient?: string;
  telephoneClient?: string;
  adresseLivraison?: string;
  sessionId: string;
}
