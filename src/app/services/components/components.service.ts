import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Assets } from 'app/models/Inventory/Asset';
import { AssetResponse } from 'app/models/Inventory/AssetResponse';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComponentsService {
//  private url = 'https://localhost:7062';
private url = environment.apiUrl;  // Use environment configuration
    constructor(private http: HttpClient) {}

    public getComponents(
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
            `${this.url}/ComputerComponents/Components`,
            { params }
        );
    }

    // getComponentsById(uid: string, asset_barcode: string): Observable<Assets> {
    //     return this.http.get<Assets>(`${this.url}/api/ComputerComponents/${asset_barcode}?uid=${uid}`);
    // }
    getComponentsById(uid: string): Observable<Assets> {
        return this.http.get<Assets>(`${this.url}/ComputerComponents/${uid}`);
    }
    
    public postEvent(data: any): Observable<any> {
        return this.http.post(`${this.url}/ComputerComponents`, data);
    }
    
    public deleteEvent(id: string): Observable<any>{
        return this.http.delete(`${this.url}/ComputerComponents/${id}`);
    }

    public putEvent(id: string, data: any): Observable<any> {
        return this.http.put(`${this.url}/ComputerComponents/${id}`, data);
    }  
    
    public pullOutComponent(id: number, remark: string): Observable<any> {
        return this.http.put(`${this.url}/ComputerComponents/pullout/${id}`,{ remarks: remark });
    }
    
    public pullInComponent(data: { computer_id: number; component_uid: string; remarks: string }): Observable<any> {
        return this.http.post(`${this.url}/ComputerComponents/pull_in_component`, data);
    }
    
     // **New Method for fetching counts of LAPTOP and CPU types**
     public getCount(type?: string): Observable<any> {
        let url = `${this.url}/ComputerComponents/ComponentCount`;

        if (type) {
            // If a type is provided, append it to the URL
            url = `${this.url}/ComputerComponents/ComponentCount?type=${type}`;
        }

        return this.http.get<any>(url);
    }
}