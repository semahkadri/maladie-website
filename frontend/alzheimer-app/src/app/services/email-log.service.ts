import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmailLog } from '../modeles/email-log.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailLogService {

  private apiUrl = `${environment.apiUrl}/emails`;

  constructor(private http: HttpClient) {}

  listerTout(): Observable<EmailLog[]> {
    return this.http.get<EmailLog[]>(this.apiUrl);
  }

  obtenirParId(id: number): Observable<EmailLog> {
    return this.http.get<EmailLog>(`${this.apiUrl}/${id}`);
  }

  marquerCommeLu(id: number): Observable<EmailLog> {
    return this.http.put<EmailLog>(`${this.apiUrl}/${id}/lu`, {});
  }

  marquerToutCommeLu(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/tout-lu`, {});
  }

  compterNonLus(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/non-lus/count`);
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
