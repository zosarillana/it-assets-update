import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Assets } from 'app/models/Inventory/Asset';
import { AssetResponse } from 'app/models/Inventory/AssetResponse';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AssetsService {
    
    private url = environment.apiUrl;  // Use environment configuration
    // private url = 'https://localhost:7062';

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
            .set('pageNumber', pageNumber.toString())
            .set('pageSize', pageSize.toString())
            .set('sortOrder', sortOrder);

        if (searchTerm) {
            params = params.set('searchTerm', searchTerm);
        }

        return this.http.get<AssetResponse>(
            `${this.url}/Asset/AssetItems`,
            { params }
        );
    }

    getAllTypes(): Observable<string[]> {
        const url = `${this.url}/assets/types`;
        return this.http.get<string[]>(url);
    }
    
    getAssetById(id: number): Observable<Assets> {
        return this.http.get<Assets>(`${this.url}/Asset/AssetItems/${id}`);        
    }

    public postEvent(data: any): Observable<any> {
        return this.http.post(`${this.url}/Asset/create-vacant-asset/computer-items`, data);
    }
    
    public deleteEvent(id: string): Observable<any>{
        return this.http.delete(`${this.url}/Asset/delete-asset/${id}`);
    }

    public pullOutAsset(assetId: number, remark: string): Observable<any> {
        return this.http.put(`${this.url}/Asset/pullout/${assetId}`, { remarks: remark });
    }
    

    public putEvent(id: string, data: any): Observable<any> {
        return this.http.put(`${this.url}/Asset/update-asset/${id}`, data);
    }    
    
    public pullInAssets(data: { computer_id: number; asset_ids: number[]; remarks: string }): Observable<any> {
        return this.http.post(`${this.url}/Asset/pull_in_assets`, data);
    }
    
}
