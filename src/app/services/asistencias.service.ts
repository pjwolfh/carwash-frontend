import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsistenciasService {

  private apiUrl = 'http://localhost:3000/api/asistencias'; // Cambia si tu backend usa otro puerto

  constructor(private http: HttpClient) {}

  // 🟢 Registrar asistencia (entrada o salida)
  registrarAsistencia(user_id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}`, { user_id });
  }

  // 🔵 Obtener historial de la semana por user_id (empleado)
  getHistorialUsuario(user_id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/historial/${user_id}`);
  }

// 🟣 Obtener historial completo por id_empleado (para el dueño)
getHistorialEmpleado(id_empleado: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/empleado/${id_empleado}`);
}
// 🟡 Obtener nombre del empleado por ID
getNombreEmpleado(id_empleado: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/nombre/${id_empleado}`);
}

getHistorialPorRango(id_empleado: string, desde: string, hasta: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/empleado/${id_empleado}/rango?desde=${desde}&hasta=${hasta}`);
}

// ✅ Filtrar historial por fechas
filtrarAsistenciasPorFechas(id_empleado: string, desde: string, hasta: string): Observable<any[]> {
  const url = `${this.apiUrl}/filtrar?id_empleado=${id_empleado}&desde=${desde}&hasta=${hasta}`;
  return this.http.get<any[]>(url);
}


}
