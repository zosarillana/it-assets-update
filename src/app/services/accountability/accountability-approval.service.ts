
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountabilityApprovalService {
  private apiUrl = 'https://localhost:7062/api/AccountabilityApproval';

  constructor(private http: HttpClient) {}

  // Prepared by User
  // preparedByUser(approvalId: number, userId: string): Observable<any> {
  //   console.log("Sending PreparedByUser Request:", approvalId, userId);
  //   return this.http.put(`${this.apiUrl}/prepared-by-user-id?id=${approvalId}&userId=${userId}`, {});
  // }
  // Corrected Angular Service Code
  preparedByUser(accountabilityId: number, userId: string) {
    const url = `${this.apiUrl}/prepared-by-user-id?accountabilityId=${accountabilityId}&userId=${userId}`;
    
    console.log('Sending preparedByUser request with:', { accountabilityId, userId });
  
    return this.http.post(url, null); // Use null for body since backend expects query params
  }
  

  // Approved by User
  approvedByUser(approvalId: number, userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/approved-by-user-id?id=${approvalId}&userId=${userId}`, {});
  }

  getByAccountabilityId(accountabilityId: number) {
    return this.http.get<any>(`${this.apiUrl}/by-accountability/${accountabilityId}`);
  }
}