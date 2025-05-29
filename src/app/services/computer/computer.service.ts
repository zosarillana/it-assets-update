import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Assets } from 'app/models/Inventory/Asset';
import { AssetResponse } from 'app/models/Inventory/AssetResponse';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ComputerService {
    // private url = 'https://localhost:7062';
    private url = environment.apiUrl; // Use environment configuration

    constructor(private http: HttpClient) {}

    public getAssets(
        pageNumber: number,
        pageSize: number,
        sortOrder: string,
        searchTerm?: string,
        typeFilter?: string[],
        departmentFilter?: string[], // <-- NEW PARAM
        businessUnitFilter?: string[], // <-- NEW PARAM
        fetchAll?: boolean
    ): Observable<any> {
        // Ensure pageNumber is never less than 1
        pageNumber = Math.max(1, pageNumber);

        let params = new HttpParams()
            .set('pageNumber', fetchAll ? '1' : pageNumber.toString())
            .set('pageSize', fetchAll ? '1000' : pageSize.toString())
            .set('sortOrder', sortOrder);

        if (searchTerm) {
            params = params.set('searchTerm', searchTerm);
        }

        if (typeFilter && typeFilter.length > 0) {
            params = params.set('typeFilter', typeFilter.join(','));
        }

        // Add departmentFilter if provided
        if (departmentFilter && departmentFilter.length > 0) {
            params = params.set('departmentFilter', departmentFilter.join(','));
        }

        // Add businessUnitFilter if provided
        if (businessUnitFilter && businessUnitFilter.length > 0) {
            params = params.set(
                'businessUnitFilter',
                businessUnitFilter.join(',')
            );
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
        return this.http.post(`${this.url}/Asset`, data);
    }

    public putEvent(id: string, data: any): Observable<any> {
        return this.http.put(
            `${this.url}/Computer/update-computer/${id}`,
            data
        );
    }

    public deleteEvent(id: string): Observable<any> {
        return this.http.delete(`${this.url}/Computer/delete-computer/${id}`);
    }

    // **New Method for fetching counts of LAPTOP and CPU types**
    public getCount(type?: string): Observable<any> {
        let url = `${this.url}/Computer/ComputerCount`;

        if (type) {
            // If a type is provided, append it to the URL
            url = `${this.url}/Computer/ComputerCount?type=${type}`;
        }

        return this.http.get<any>(url);
    }

    public getCountDate(
        type?: string,
        groupBy: string = 'date'
    ): Observable<any> {
        let url = `${this.url}/Computer/ComputerCount`;

        // If a type is provided, append it to the URL
        if (type) {
            url = `${url}?type=${type}`;
        }

        // Always include groupBy, defaulting to 'date'
        if (url.includes('?')) {
            url = `${url}&groupBy=${groupBy}`;
        } else {
            url = `${url}?groupBy=${groupBy}`;
        }

        return this.http.get<any>(url);
    }
}
