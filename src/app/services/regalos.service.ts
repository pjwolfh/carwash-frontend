import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegalosService {
  private apiUrl = 'http://localhost:3000/api/regalos';

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
