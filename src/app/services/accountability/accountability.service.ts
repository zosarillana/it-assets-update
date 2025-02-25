import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AssetResponse } from 'app/models/Inventory/AssetResponse';
import { Observable } from 'rxjs';
import { Accountability } from 'app/models/Accountability/Accountability';
@Injectable({
    providedIn: 'root',
})
export class AccountabilityService {
    private url = 'https://localhost:7062';

    constructor(private http: HttpClient) {}

    getAllAccountability(): Observable<string[]> {
        const url = `${this.url}/api/UserAccountabilityList/get-all`;
        return this.http.get<string[]>(url);
    }

    getAccountabilityById(id: number): Observable<Accountability> {
        return this.http.get<Accountability>(`${this.url}/api/UserAccountabilityList/${id}`);
    }

    public postEvent(data: any): Observable<any> {
        return this.http.post(`${this.url}/api/UserAccountabilityList/add-accountability`, data);
    } 
   
    public deleteEvent(id: string): Observable<any>{
        return this.http.delete(`${this.url}/api/UserAccountabilityList/delete/${id}`);
    }
}
