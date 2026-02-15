import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TableauDeBord } from '../modeles/tableau-de-bord.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TableauDeBordService {

  private apiUrl = `${environment.apiUrl}/tableau-de-bord`;

  constructor(private http: HttpClient) {}

  obtenirTableauDeBord(): Observable<TableauDeBord> {
    return this.http.get<TableauDeBord>(this.apiUrl);
  }
}
