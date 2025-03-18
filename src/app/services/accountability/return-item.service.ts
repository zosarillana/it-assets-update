import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReturnItemService {
  private apiUrl = 'https://localhost:7062/api/ReturnItemsApproval'; // Your API base URL

  constructor(private http: HttpClient) {}

  // Check an item by user
  checkByUser(accountabilityId: number, userId: string): Observable<any> {
    const params = new HttpParams()
      .set('accountabilityId', accountabilityId.toString())
      .set('userId', userId);

    return this.http.post(`${this.apiUrl}/check`, null, { params });
  }

  // Receive an item by user
  receiveByUser(id: number, userId: string): Observable<any> {
    const params = new HttpParams()
      .set('id', id.toString())
      .set('userId', userId);

    return this.http.put(`${this.apiUrl}/receive`, null, { params });
  }

  // Confirm an item by user
  confirmByUser(id: number, userId: string): Observable<any> {
    const params = new HttpParams()
      .set('id', id.toString())
      .set('userId', userId);

    return this.http.put(`${this.apiUrl}/confirm`, null, { params });
  }

  // Get approval by accountability ID
  getApprovalByAccountabilityId(accountabilityId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/by-accountability/${accountabilityId}`);
  }
}