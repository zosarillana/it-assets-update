import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RepairLogs } from 'app/models/RepairLogs/RepairLogs';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class RepairsService {
  // private url = 'https://localhost:7062';
  private url = environment.apiUrl;  // Use environment configuration

  constructor(private http: HttpClient) {}

  public getRepairLogsById(id: number): Observable<RepairLogs> {
    return this.http.get<RepairLogs>(`${this.url}/RepairLogs/byComputer/${id}`);
  }

}
