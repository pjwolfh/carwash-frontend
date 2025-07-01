import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegalosService {
  private apiUrl = `${environment.apiUrl}/api/regalos`;

  constructor(private http: HttpClient) {}

  /**
   * ✅ Obtener todos los regalos
   */
  obtenerRegalos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * ✅ Crear regalo
   */
  crearRegalo(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  /**
   * ✅ Actualizar regalo
   */
  actualizarRegalo(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * ✅ Eliminar regalo
   */
  eliminarRegalo(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * ✅ Crear regalo con FormData (para archivos)
   */
  crearRegaloFormData(data: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  /**
   * ✅ Actualizar regalo con FormData (para archivos)
   */
  actualizarRegaloFormData(id: number, data: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }
}
