import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardAnalytics, ExpirationResult, DemandResult } from '../modeles/prediction.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PredictionService {

  private apiUrl = environment.pythonApiUrl;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardAnalytics> {
    return this.http.get<DashboardAnalytics>(`${this.apiUrl}/dashboard`);
  }

  getExpiration(): Observable<ExpirationResult> {
    return this.http.get<ExpirationResult>(`${this.apiUrl}/expiration`);
  }

  getDemandForecast(): Observable<DemandResult> {
    return this.http.get<DemandResult>(`${this.apiUrl}/demand-forecast`);
  }
}
