import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commande, CreerCommande } from '../modeles/commande.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommandeService {

  private apiUrl = `${environment.apiUrl}/commandes`;

  constructor(private http: HttpClient) {}

  creerCommande(commande: CreerCommande): Observable<Commande> {
    return this.http.post<Commande>(this.apiUrl, commande);
  }

  listerTout(statut?: string): Observable<Commande[]> {
    const url = statut ? `${this.apiUrl}?statut=${statut}` : this.apiUrl;
    return this.http.get<Commande[]>(url);
  }

  obtenirParId(id: number): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/${id}`);
  }

  obtenirParReference(reference: string): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/reference/${reference}`);
  }

  modifierStatut(id: number, statut: string): Observable<Commande> {
    return this.http.patch<Commande>(`${this.apiUrl}/${id}/statut?statut=${statut}`, {});
  }
}
