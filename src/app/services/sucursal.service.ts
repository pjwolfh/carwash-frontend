import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SucursalService {
  private apiUrl = `${environment.apiUrl}/api/sucursales`;

  constructor(private http: HttpClient) {}

  // 🔵 Obtener todas las sucursales de un cliente
  obtenerSucursales(idCliente: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${idCliente}`);
  }

  // 🟢 Crear nueva sucursal
  crearSucursal(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  // 🟡 Editar sucursal
 editarSucursal(id: number, data: any): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}/${id}`, data);
}


  // 🔴 Eliminar sucursal
  eliminarSucursal(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // ✅ Obtener resumen de ventas y empleados por sucursal
  obtenerResumenSucursal(idSucursal: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/resumen/${idSucursal}`);
  }
  obtenerSucursalesPorUsuario(idUsuario: number) {
    return this.http.get<any[]>(`${environment.apiUrl}/api/usuarios/${idUsuario}/sucursales`);
  }
  
}
