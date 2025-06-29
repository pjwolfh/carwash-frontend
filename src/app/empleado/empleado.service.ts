import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {
  private baseUrl = 'http://localhost:3000/api/empleados';

  constructor(private http: HttpClient) {}

  obtenerEmpleados(idSucursal: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${idSucursal}`);
  }

  crearEmpleado(empleado: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, empleado);
  }

  actualizarEmpleado(id: number, empleado: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, empleado);
  }

  eliminarEmpleado(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  obtenerEmpleadoPorId(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/buscar/${id}`);
  }

  // ✅ Este método trae los datos del panel (nombre, puesto, horario)
  obtenerEmpleadoInfo(user_id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/info/${user_id}`);
  }

  // ✅ Este método trae el historial de asistencia semanal
  obtenerHistorial(user_id: string): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:3000/api/asistencias/historial/${user_id}`);
  }
}
