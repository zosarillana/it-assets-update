import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Department } from 'app/models/Department/Department';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  // private url = 'https://localhost:7062';
  private url = environment.apiUrl;  // Use environment configuration';

  constructor(private http: HttpClient) {}

  public getDepartments(): Observable<Department[]> {
    return this.http.get<any>(`${this.url}/Departments`).pipe(
      map(response => {
        if (response.$values) {
          return response.$values; // If response has $values, return it
        }
        return response; // Otherwise, return the response as is
      })
    );
  }
}
