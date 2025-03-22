import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ImportMasterdataService {
  // private url = 'https://localhost:7062'; // Ensure this matches your backend
  private url = 'api';

    constructor(private http: HttpClient) {}

   // In your ItotService
   uploadExcelData(formData: FormData): Observable<any> {
    return this.http.post(`${this.url}/Assets/import`, formData);
  }
}