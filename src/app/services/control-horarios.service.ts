import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ControlHorariosService {
  private apiUrl = `${environment.apiUrl}/api/control-horarios`;

  constructor(private http: HttpClient) {}

  marcarEntrada(idEmpleado: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/entrada/${idEmpleado}`, {});
  }

  inicioLunch(idEmpleado: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/inicio-lunch/${idEmpleado}`, {});
  }

  regresoLunch(idEmpleado: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/regreso-lunch/${idEmpleado}`, {});
  }

  finLunch(idEmpleado: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/salida/${idEmpleado}`, {});
  }

  obtenerHorarios(idEmpleado: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${idEmpleado}`);
  }
}
