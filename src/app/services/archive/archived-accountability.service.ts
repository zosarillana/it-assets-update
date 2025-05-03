import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { Accountability } from 'app/models/Accountability/Accountability';

@Injectable({
    providedIn: 'root',
})
export class ArchivedAccountabilityService {
    private url = environment.apiUrl;

    constructor(private http: HttpClient) {}

    getAllArchived(
        pageNumber: number = 1,
        pageSize: number = 10,
        sortOrder: 'asc' | 'desc' = 'asc',
        searchTerm?: string
    ): Observable<Accountability[]> {
        let params = new HttpParams()
            .set('pageNumber', pageNumber)
            .set('pageSize', pageSize)
            .set('sortOrder', sortOrder);

        if (searchTerm) {
            params = params.set('searchTerm', searchTerm);
        }

        const url = `${this.url}/ArchivedUserAccountabilityList/all`;

        return this.http.get<Accountability[]>(url, {
            params,
        });
    }

    getArchivedDetails(id: number): Observable<Accountability> {
        return this.http.get<Accountability>(
            `${this.url}/ArchivedUserAccountabilityList/details/${id}`
        );
    }
}
