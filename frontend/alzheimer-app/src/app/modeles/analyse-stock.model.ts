export interface AnalyseProduit {
  produitId: number;
  produitNom: string;
  categorieNom: string;
  stockActuel: number;
  totalVendu: number;
  chiffreAffaires: number;
  classificationABC: string;
  tauxRotation: number;
  joursStockRestant: number;
  pointReapprovisionnement: number;
  previsionDemandeMensuelle: number;
  scoreSante: number;
  tendance: string;
  alerteStock: boolean;
}

export interface ResumeABC {
  produitsA: number;
  produitsB: number;
  produitsC: number;
  pourcentageCA_A: number;
  pourcentageCA_B: number;
  pourcentageCA_C: number;
}

export interface IndicateursGlobaux {
  valeurTotaleStock: number;
  tauxRotationMoyen: number;
  produitsEnAlerte: number;
  produitsEnRupture: number;
  chiffreAffaires90j: number;
  croissanceMensuelle: number;
  totalProduits: number;
  totalCommandes90j: number;
}

export interface TendanceVentes {
  periode: string;
  chiffreAffaires: number;
  nombreCommandes: number;
}

export interface AnalyseStock {
  analyseParProduit: AnalyseProduit[];
  resumeABC: ResumeABC;
  indicateursGlobaux: IndicateursGlobaux;
  tendanceVentes: TendanceVentes[];
}
