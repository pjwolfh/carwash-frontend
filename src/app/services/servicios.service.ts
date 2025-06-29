import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {
  private apiUrl = 'http://localhost:3000/api/servicios';

  constructor(private http: HttpClient) {}

obtenerServicios(idSucursal: string) {
  return this.http.get<any[]>(`${this.apiUrl}/sucursal/${idSucursal}`);
}


  agregarServicio(servicio: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, servicio);
  }

  editarServicio(id: number, servicio: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, servicio);
  }

  eliminarServicio(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  uploadImagen(file: File): Observable<{ imagePath: string }> {
  const formData = new FormData();
  formData.append('imagen', file);

  return this.http.post<{ imagePath: string }>(
    `${this.apiUrl}/upload`,
    formData
  );
}

}
