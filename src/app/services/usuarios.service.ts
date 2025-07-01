import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = `${environment.apiUrl}/api/usuarios`;

  constructor(private http: HttpClient) {}

  obtenerUsuarioPorCodigo(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/codigo/${userId}`);
  }
}
