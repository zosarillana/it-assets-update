import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountabilityApprovalService {
  private apiUrl = 'https://localhost:7062/api/AccountabilityApproval';

  constructor(private http: HttpClient) {}

  // Check by User
  checkByUser(accountabilityId: number, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/check?accountabilityId=${accountabilityId}&userId=${userId}`, {});
  }

  receiveByUser(approvalId: number, userId: string): Observable<any> {
    console.log("Sending ReceiveByUser Request:", approvalId, userId);
    return this.http.put(`${this.apiUrl}/receive?id=${approvalId}&userId=${userId}`, {});
  }
  
  

  // Confirm by User
  confirmByUser(approvalId: number, userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/confirm?id=${approvalId}&userId=${userId}`, {});
  }

  getByAccountabilityId(accountabilityId: number) {
    return this.http.get<any>(`${this.apiUrl}/by-accountability/${accountabilityId}`);
  }
}
