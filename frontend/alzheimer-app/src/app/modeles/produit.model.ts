/**
 * Returns true only if the product is on promo AND the promo has not expired.
 * Use this everywhere instead of checking `produit.enPromo` directly.
 */
export function isPromoActive(produit: Produit | null | undefined): boolean {
  if (!produit?.enPromo) return false;
  if (!produit.dateFinPromo) return true;
  return new Date(produit.dateFinPromo).getTime() > Date.now();
}

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
