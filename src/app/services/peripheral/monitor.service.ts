import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItotPc } from 'app/models/ItotPc';
import { ItotPeripheral } from 'app/models/ItotPeripheral';

@Injectable({
  providedIn: 'root'
})
export class MonitorService {
  private url = 'https://localhost:7233';
  constructor(private http: HttpClient) {}

  public getMonitor(): Observable<ItotPeripheral[]> {
      return this.http.get<ItotPeripheral[]>(`${this.url}/Monitor`);
  }

  //getting by id
  public getMonitorById(id: string): Observable<ItotPeripheral[]> {
      return this.http.get<ItotPeripheral[]>(
          `${this.url}/Monitor/${id}`
      );
  }

  //creating
  public CreateMonitor(data: any): Observable<any> {
      return this.http.post(`${this.url}/Monitor`, data);
  }

  //delete 
  public DeleteMonitor(id: number): Observable<any> {
      return this.http.delete(`${this.url}/Monitor/${id}`);
  }

  //update
  public UpdateMonitor(id: number, data: any): Observable<any> {
      return this.http.put(`${this.url}/Monitor/${id}`, data);
  }
 
}

