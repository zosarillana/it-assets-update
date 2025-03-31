import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Assets } from 'app/models/Inventory/Asset';
import { AssetResponse } from 'app/models/Inventory/AssetResponse';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UsersService {
    private url = 'api';

    constructor(private http: HttpClient) {}

    public getUsers(
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

        return this.http.get<AssetResponse>(`${this.url}/api/Users`, {
            params,
        });
    }
}
