import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Assets } from 'app/models/Inventory/Asset';
import { AssetResponse } from 'app/models/Inventory/AssetResponse';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class UsersService {
    private url = 'https://localhost:7062';

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

    // Add this method to fetch the current logged-in user
    getCurrentUser() {
        return this.http.get<any>('https://localhost:7062/api/Users/current')
          .pipe(
            catchError(error => {
              console.error('Error fetching current user:', error);
              // Return a user-friendly error or null
              return of(null);
            })
          );
      }
}
