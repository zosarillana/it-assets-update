import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AssetResponse } from 'app/models/Inventory/AssetResponse';
import { Observable } from 'rxjs';
import { Accountability, AccountabilityItem, PaginatedResponse } from 'app/models/Accountability/Accountability';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AccountabilityService {
    private url = environment.apiUrl;  // Use environment configuration
    // private url = 'https://localhost:7062';

    constructor(private http: HttpClient) {}

    getAllAccountability(
        pageNumber: number = 1, 
        pageSize: number = 10,
        sortOrder: string = 'asc',
        searchTerm?: string
    ): Observable<PaginatedResponse<AccountabilityItem>> {
        // Ensure pageNumber is never less than 1
        pageNumber = Math.max(1, pageNumber);
    
        let params = new HttpParams()
            .set('pageNumber', pageNumber.toString())
            .set('pageSize', pageSize.toString())
            .set('sortOrder', sortOrder);
    
        if (searchTerm) {
            params = params.set('searchTerm', searchTerm);
        }
    
        return this.http.get<PaginatedResponse<AccountabilityItem>>(
            `${this.url}/UserAccountabilityList/get-all`,
            { params }
        );
    }

    getAccountabilityById(id: number): Observable<Accountability> {
        return this.http.get<Accountability>(`${this.url}/UserAccountabilityList/${id}`);
    }

    public postEvent(data: any): Observable<any> {
        return this.http.post(`${this.url}/UserAccountabilityList/add-accountability`, data);
    } 
   
    public deleteEvent(id: string): Observable<any>{
        return this.http.delete(`${this.url}/UserAccountabilityList/delete/${id}`);
    }
}
