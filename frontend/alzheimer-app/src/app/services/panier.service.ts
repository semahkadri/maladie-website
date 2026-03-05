import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject, Observable, tap } from 'rxjs';
import { Panier } from '../modeles/panier.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PanierService {

  private apiUrl = `${environment.apiUrl}/panier`;
  private sessionId: string;
  private panierSubject = new BehaviorSubject<Panier | null>(null);
  private itemAddedSubject = new Subject<void>();

  itemAdded$ = this.itemAddedSubject.asObservable();

  panier$ = this.panierSubject.asObservable();

  constructor(private http: HttpClient) {
    this.sessionId = this.getOrCreateSessionId();
  }

  get currentSessionId(): string {
    return this.sessionId;
  }

  get nombreArticles(): number {
    return this.panierSubject.value?.nombreArticles || 0;
  }

  chargerPanier(): Observable<Panier> {
    return this.http.get<Panier>(`${this.apiUrl}/${this.sessionId}`).pipe(
      tap(panier => this.panierSubject.next(panier))
    );
  }

  ajouterProduit(produitId: number, quantite: number = 1): Observable<Panier> {
    return this.http.post<Panier>(
      `${this.apiUrl}/${this.sessionId}/produits/${produitId}?quantite=${quantite}`,
      {}
    ).pipe(
      tap(panier => {
        this.panierSubject.next(panier);
        this.itemAddedSubject.next();
      })
    );
  }

  modifierQuantite(produitId: number, quantite: number): Observable<Panier> {
    return this.http.put<Panier>(
      `${this.apiUrl}/${this.sessionId}/produits/${produitId}?quantite=${quantite}`,
      {}
    ).pipe(
      tap(panier => this.panierSubject.next(panier))
    );
  }

  supprimerProduit(produitId: number): Observable<Panier> {
    return this.http.delete<Panier>(
      `${this.apiUrl}/${this.sessionId}/produits/${produitId}`
    ).pipe(
      tap(panier => this.panierSubject.next(panier))
    );
  }

  viderPanier(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${this.sessionId}`).pipe(
      tap(() => this.panierSubject.next({
        sessionId: this.sessionId,
        lignes: [],
        nombreArticles: 0,
        montantTotal: 0
      }))
    );
  }

  resetApresCommande(): void {
    this.panierSubject.next({
      sessionId: this.sessionId,
      lignes: [],
      nombreArticles: 0,
      montantTotal: 0
    });
  }

  private getOrCreateSessionId(): string {
    try {
      let id = localStorage.getItem('panier_session_id');
      if (!id) {
        id = 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('panier_session_id', id);
      }
      return id;
    } catch {
      return 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    }
  }
}
