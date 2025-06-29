import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SucursalesService {
  private API_URL = 'http://localhost:3000/api/sucursales';

  constructor(private http: HttpClient) {}

  // 📄 Listar sucursales de un cliente
  obtenerSucursales(idCliente: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/${idCliente}`);
  }
  
  
  // ➕ Crear nueva sucursal
  crearSucursal(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}`, data);
  }

  // 🛠️ Editar sucursal
  editarSucursal(idSucursal: number, data: any): Observable<any> {
    return this.http.put(`${this.API_URL}/${idSucursal}`, data);
  }

  // ❌ Eliminar sucursal
  eliminarSucursal(idSucursal: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${idSucursal}`);
  }
}
