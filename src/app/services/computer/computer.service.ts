import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Assets } from 'app/models/Inventory/Asset';
import { AssetResponse } from 'app/models/Inventory/AssetResponse';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ComputerService {
    // private url = 'https://localhost:7062';
    private url = 'api';

    constructor(private http: HttpClient) {}

    public getAssets(
        pageNumber: number,
        pageSize: number,
        sortOrder: string,
        searchTerm?: string,
        typeFilter?: string[],
        fetchAll?: boolean
    ): Observable<any> {
        // Ensure pageNumber is never less than 1
        pageNumber = Math.max(1, pageNumber);

        let params = new HttpParams()
            .set('pageNumber', fetchAll ? '1' : pageNumber.toString())
            .set('pageSize', fetchAll ? '1000' : pageSize.toString()) // Arbitrarily large number for fetching all
            .set('sortOrder', sortOrder);

        if (searchTerm) {
            params = params.set('searchTerm', searchTerm);
        }

        if (typeFilter && typeFilter.length > 0) {
            params = params.set('typeFilter', typeFilter.join(','));
        }

        return this.http.get<AssetResponse>(
            `${this.url}/Computer/ComputerItems`,
            { params }
        );
    }
  
    getAllTypes(): Observable<string[]> {
        const url = `${this.url}/assets/types`;
        return this.http.get<string[]>(url);
    }

    getComputersById(id: number): Observable<Assets> {
        return this.http.get<Assets>(`${this.url}/Computer/Computers/${id}`);
    }

    // public postEvent(data: any): Observable<any> {
    //     return this.http.post(`${this.url}/api/Assets/add-asset/computer`, data);
    // }

    public postEvent(data: any): Observable<any> {
        return this.http.post(`${this.url}/Assets`, data);
    }

    public putEvent(id: string, data: any): Observable<any> {
        return this.http.put(`${this.url}/Computer/update-computer/${id}`, data);
    }    
    
    public deleteEvent(id: string): Observable<any>{
        return this.http.delete(`${this.url}/Computer/delete-computer/${id}`);
    }
}
