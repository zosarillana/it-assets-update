import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ReturnService {
  private apiUrl = 'https://localhost:7062/api/ReturnItems';

  constructor(private http: HttpClient) {}

  // ✅ Get all return accountability items
  getAllReturnItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  // ✅ Get a specific return item by ID
  getReturnItemById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // ✅ Get return items by user ID
  getReturnItemsByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  // ✅ Create a new return item entry
  createReturnItem(returnItem: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, returnItem);
  }

  // ✅ Update return item status & remarks
  updateReturnItem(id: number, updatedReturnItem: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, updatedReturnItem);
  }

  // ✅ Delete a return item
  deleteReturnItem(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // ✅ Get return items by accountability ID
  getReturnItemsByAccountabilityId(accountabilityId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/accountability/${accountabilityId}`);
  }
}
