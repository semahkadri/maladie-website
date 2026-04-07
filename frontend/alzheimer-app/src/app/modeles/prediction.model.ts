export interface DashboardKpis {
  produitsExpires: number;
  expireDans30j: number;
  expireDans90j: number;
  valeurStockRisque: number;
  tauxRotation90j: number;
  anomaliesDetectees: number;
}

export interface AlerteReappro {
  produitId: number;
  nom: string;
  stock: number;
  ventesParJour: number;
  joursDeStock: number;
  urgence: string;
}

export interface AnomalieVente {
  date: string;
  articles: number;
  montant: number;
  type: string;
}

export interface DashboardAnalytics {
  genereLe: string;
  methode: string;
  kpis: DashboardKpis;
  alertesReapprovisionnement: AlerteReappro[];
  anomaliesVentes: AnomalieVente[];
}

export interface ProduitExpiration {
  produitId: number;
  nom: string;
  categorie: string;
  stock: number;
  ventesParJour: number;
  joursAvantExpiration: number | null;
  risqueScore: number;
  statut: string;
  recommandation: string;
}

export interface ExpirationResult {
  resume: { totalProduits: number; expires: number; risqueEleve: number; attention: number; rupture: number; ok: number };
  produits: ProduitExpiration[];
}

export interface PrevisionDemande {
  produitId: number;
  nom: string;
  stockActuel: number;
  demandePrevisionnelle30j: number;
  quantiteRecommandee: number;
  confiance: string;
  tendance: string;
  r2Score?: number;
}

export interface DemandResult {
  periode: string;
  methode: string;
  totalProduits: number;
  previsions: PrevisionDemande[];
}
