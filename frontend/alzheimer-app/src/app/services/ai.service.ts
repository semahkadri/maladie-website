import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Produit } from '../modeles/produit.model';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  contenu: string;
}

export interface AiChatResponse {
  reponse: string;
  produitsSugeres: Produit[];
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private apiUrl = `${environment.apiUrl}/ai`;

  constructor(private http: HttpClient) {}

  chat(
    message: string,
    historique: ConversationMessage[],
    langue: string
  ): Observable<AiChatResponse> {
    return this.http.post<AiChatResponse>(`${this.apiUrl}/chat`, {
      message,
      historique,
      langue
    });
  }

  genererDescription(
    nomProduit: string,
    categorie: string,
    prix: number,
    langue: string
  ): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/generer-description`,
      { nomProduit, categorie, prix, langue },
      { responseType: 'text' }
    );
  }
}
