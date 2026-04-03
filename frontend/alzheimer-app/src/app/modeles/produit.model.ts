export interface Produit {
  id?: number;
  nom: string;
  description: string;
  prix: number;
  quantite: number;
  imageUrl?: string;
  prixOriginal?: number;
  enPromo?: boolean;
  remise?: number;
  dateExpiration?: string;
  numeroLot?: string;
  joursAvantExpiration?: number;
  categorieId: number;
  categorieNom?: string;
  dateFinPromo?: string;
  dateCreation?: string;
  dateModification?: string;
}
