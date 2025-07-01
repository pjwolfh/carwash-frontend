import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/api/usuarios`; // 🧠 Cambiar si tu backend cambia

  constructor(private http: HttpClient) {}

  registrarUsuario(email: string, telefono: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/registrar`, { email, telefono });
  }

  iniciarSesion(telefono: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { telefono });
  }

  obtenerUsuarioPorId(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}
