import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AssetResponse } from 'app/models/Inventory/AssetResponse';
import { Observable } from 'rxjs';
import { Accountability, AccountabilityItem, PaginatedResponse } from 'app/models/Accountability/Accountability';
@Injectable({
    providedIn: 'root',
})
export class AccountabilityService {
    private url = 'https://localhost:7062';

    constructor(private http: HttpClient) {}

    getAllAccountability(pageNumber: number = 1, pageSize: number = 10): Observable<PaginatedResponse<AccountabilityItem>> {
        const url = `${this.url}/api/UserAccountabilityList/get-all?pageNumber=${pageNumber}&pageSize=${pageSize}`;
        return this.http.get<PaginatedResponse<AccountabilityItem>>(url);
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
