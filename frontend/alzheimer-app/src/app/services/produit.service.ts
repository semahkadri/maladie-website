import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produit } from '../modeles/produit.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {

  private apiUrl = `${environment.apiUrl}/produits`;

  constructor(private http: HttpClient) {}

  listerTout(): Observable<Produit[]> {
    return this.http.get<Produit[]>(this.apiUrl);
  }

  listerParCategorie(categorieId: number): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/categorie/${categorieId}`);
  }

  obtenirParId(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/${id}`);
  }

  creer(produit: Produit): Observable<Produit> {
    return this.http.post<Produit>(this.apiUrl, produit);
  }

  modifier(id: number, produit: Produit): Observable<Produit> {
    return this.http.put<Produit>(`${this.apiUrl}/${id}`, produit);
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploaderImage(id: number, fichier: File): Observable<Produit> {
    const formData = new FormData();
    formData.append('fichier', fichier);
    return this.http.post<Produit>(`${this.apiUrl}/${id}/image`, formData);
  }

  supprimerImage(id: number): Observable<Produit> {
    return this.http.delete<Produit>(`${this.apiUrl}/${id}/image`);
  }
}
