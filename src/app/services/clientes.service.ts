import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  id: number;
  nombre_empresa: string;
  nombre_contacto: string;
  telefono: string;
  email: string;
  password?: string;
  rol_id: number;
  user_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private apiUrl = `${environment.apiUrl}/api/clientes`;


  constructor(private http: HttpClient) {}

  // 🔍 Obtener todos los usuarios (ex-clientes)
  getClientes(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  // ➕ Crear nuevo usuario
  addCliente(usuario: Partial<Usuario>): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, usuario);
  }

  // ✏️ Editar usuario
  updateCliente(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }

  // ❌ Eliminar usuario
  deleteCliente(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // 💰 Obtener ventas del día
  getVentasHoyPorCliente(usuarioId: number): Observable<{ cantidad: number, total: number }> {
    return this.http.get<{ cantidad: number, total: number }>(`${this.apiUrl}/${usuarioId}/ventas-hoy`);
  }

  // 🧼 Obtener servicios del usuario
  getServiciosPorCliente(usuarioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${usuarioId}/servicios`);
  }

  // 👀 Obtener datos sensibles del usuario (rol, contraseña)
  getUsuarioPorCliente(usuarioId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${usuarioId}/credenciales`);
  }

  // 🔁 Resetear contraseña
  resetearPassword(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/reset-password`, {});
  }
}
