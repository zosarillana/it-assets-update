import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BusinessUnit } from 'app/models/BusinessUnit/BusinessUnit';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class BusinessUnitService {
  private url = 'api';
 constructor(private http: HttpClient) {}
 
   public getDepartments(): Observable<BusinessUnit[]> {
     return this.http.get<any>(`${this.url}/BusinessUnits`).pipe(
       map(response => {
         if (response.$values) {
           return response.$values; // If response has $values, return it
         }
         return response; // Otherwise, return the response as is
       })
     );
   }
}
