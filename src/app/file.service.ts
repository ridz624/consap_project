import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', 
})
export class FileService {
  private apiUrl = 'http://localhost:3000';  

  constructor(private http: HttpClient) {}

  getFileData(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getdata`);  
  }

  uploadFile(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/upload_csv`, formData);
  }
}
