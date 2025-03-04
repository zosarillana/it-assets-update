import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Department } from 'app/models/Department/Department';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private url = 'https://localhost:7062';

  constructor(private http: HttpClient) {}

  public getDepartments(): Observable<Department[]> {
    return this.http.get<any>(`${this.url}/api/Departments`).pipe(
      map(response => {
        if (response.$values) {
          return response.$values; // If response has $values, return it
        }
        return response; // Otherwise, return the response as is
      })
    );
  }
}
