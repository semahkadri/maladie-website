import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalyseStock } from '../modeles/analyse-stock.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnalyseStockService {

  private apiUrl = `${environment.apiUrl}/analyse-stock`;

  constructor(private http: HttpClient) {}

  analyserStock(): Observable<AnalyseStock> {
    return this.http.get<AnalyseStock>(this.apiUrl);
  }
}
