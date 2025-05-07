import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Assets } from 'app/models/Inventory/Asset';
import { AssetResponse, PaginatedResponse } from 'app/models/Inventory/AssetResponse';
import { User } from 'app/models/Users/users';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UsersService {
    private url = environment.apiUrl; // Use environment configuration
 

    constructor(private http: HttpClient) {}

    public getUsers(
        pageNumber: number,
        pageSize: number,
        sortOrder: string,
        searchTerm: string
    ): Observable<PaginatedResponse<User>> {
        return this.http.get<PaginatedResponse<User>>(
            `${this.url}/Users`,
            {
                params: new HttpParams()
                    .set('pageNumber', pageNumber)
                    .set('pageSize', pageSize)
                    .set('sortOrder', sortOrder)
                    .set('searchTerm', searchTerm)
            }
        );
        
    }
    

    //changePassword
    changePassword(userId: number, passwordData: any): Observable<any> {
        return this.http.put(
            `${this.url}/Users/${userId}/change-password`,
            passwordData
        );
    }

    updateUser(userId: number, userData: any): Observable<any> {
        return this.http.put(`${this.url}/Users/${userId}`, userData);
    }    
}
