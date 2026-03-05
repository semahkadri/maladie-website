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
  categorieId: number;
  categorieNom?: string;
  dateCreation?: string;
  dateModification?: string;
}
