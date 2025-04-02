import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReturnService {
  // private apiUrl = 'https://localhost:7062/api/ReturnItems';
  private url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ✅ Get all return accountability items
  getAllReturnItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/ReturnItems`);
  }

  // ✅ Get a specific return item by ID
  getReturnItemById(id: number): Observable<any> {
    return this.http.get<any>(`${this.url}/ReturnItems/${id}`);
  }

  // ✅ Get return items by user ID
  getReturnItemsByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/ReturnItems/user/${userId}`);
  }

  // ✅ Create a new return item entry
  createReturnItem(returnItem: any): Observable<any> {
    return this.http.post<any>(`${this.url}/ReturnItems`, returnItem);
  }

  // ✅ Update return item status & remarks
  updateReturnItem(id: number, updatedReturnItem: any): Observable<any> {
    return this.http.put<any>(`${this.url}/ReturnItems/${id}`, updatedReturnItem);
  }

  // ✅ Delete a return item
  deleteReturnItem(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/ReturnItems/${id}`);
  }

  // ✅ Get return items by accountability ID
  getReturnItemsByAccountabilityId(accountabilityId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/ReturnItems/accountability/${accountabilityId}`);
  }
}
