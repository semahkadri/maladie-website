import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { EmailLog } from '../modeles/email-log.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailLogService {

  private apiUrl = `${environment.apiUrl}/emails`;

  // Single source of truth for unread count — both sidebar and email list subscribe to this
  private _unreadCount = new BehaviorSubject<number>(0);
  readonly unreadCount$ = this._unreadCount.asObservable();

  constructor(private http: HttpClient) {}

  /** Fetch count from server and push to all subscribers */
  refreshUnreadCount(): void {
    this.http.get<{ count: number }>(`${this.apiUrl}/non-lus/count`).subscribe({
      next: (res) => this._unreadCount.next(res.count),
      error: () => {}
    });
  }

  /** Push a known count directly (avoids extra HTTP round-trip) */
  setUnreadCount(n: number): void {
    this._unreadCount.next(n);
  }

  /** Decrement by 1 (used when a single email is marked read) */
  decrementUnread(): void {
    const current = this._unreadCount.getValue();
    if (current > 0) this._unreadCount.next(current - 1);
  }

  listerTout(): Observable<EmailLog[]> {
    return this.http.get<EmailLog[]>(this.apiUrl);
  }

  obtenirParId(id: number): Observable<EmailLog> {
    return this.http.get<EmailLog>(`${this.apiUrl}/${id}`);
  }

  marquerCommeLu(id: number): Observable<EmailLog> {
    return this.http.put<EmailLog>(`${this.apiUrl}/${id}/lu`, {}).pipe(
      tap(() => this.decrementUnread())
    );
  }

  marquerToutCommeLu(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/tout-lu`, {}).pipe(
      tap(() => this._unreadCount.next(0))
    );
  }

  compterNonLus(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/non-lus/count`);
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
