import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RepairLogs } from 'app/models/RepairLogs/RepairLogs';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class RepairsService {
  private url = 'https://localhost:7062';

  constructor(private http: HttpClient) {}

  public getRepairLogsById(id: number): Observable<RepairLogs> {
    return this.http.get<RepairLogs>(`${this.url}/api/RepairLogs/byComputer/${id}`);
  }

}
