import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Assets } from 'app/models/Inventory/Asset';
import { AssetResponse } from 'app/models/Inventory/AssetResponse';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ComputerService {
    private url = 'https://localhost:7062';

    constructor(private http: HttpClient) {}

    public getAssets(
        pageNumber: number,
        pageSize: number,
        sortOrder: string,
        searchTerm?: string
    ): Observable<any> {
        // Ensure pageNumber is never less than 1
        pageNumber = Math.max(1, pageNumber);

        let params = new HttpParams()
            .set('pageNumber', pageNumber.toString())
            .set('pageSize', pageSize.toString())
            .set('sortOrder', sortOrder);

        if (searchTerm) {
            params = params.set('searchTerm', searchTerm);
        }

        return this.http.get<AssetResponse>(
            `${this.url}/api/Computer/ComputerItems`,
            { params }
        );
    }

    getAllTypes(): Observable<string[]> {
        const url = `${this.url}/assets/types`;
        return this.http.get<string[]>(url);
    }

    getComputersById(id: number): Observable<Assets> {
        return this.http.get<Assets>(`${this.url}/api/Computer/Computers/${id}`);
    }

    // public postEvent(data: any): Observable<any> {
    //     return this.http.post(`${this.url}/api/Assets/add-asset/computer`, data);
    // }

    public postEvent(data: any): Observable<any> {
        return this.http.post(`${this.url}/api/Assets`, data);
    }

    public deleteEvent(id: string): Observable<any>{
        return this.http.delete(`${this.url}/api/Computer/delete-computer/${id}`);
    }
}
