import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

export interface Peripheral {
  id: number;
  type: string;
  // Add other fields if needed (brand, model, asset_barcode, etc.)
}

@Injectable({
  providedIn: 'root'
})
export class PeripheralService {

  private url = `${environment.apiUrl}/Peripherals`; // Ensure environment.apiUrl is configured

  constructor(private http: HttpClient) { }

  // GET: api/Peripherals
  public getPeripherals(): Observable<Peripheral[]> {
    return this.http.get<Peripheral[]>(this.url);
  }

  // GET: api/Peripherals/{id}
  public getPeripheralById(id: number): Observable<Peripheral> {
    return this.http.get<Peripheral>(`${this.url}/${id}`);
  }

  // POST: api/Peripherals
  public createPeripheral(peripheral: Peripheral): Observable<Peripheral> {
    return this.http.post<Peripheral>(this.url, peripheral);
  }

  // PUT: api/Peripherals/{id}
  public updatePeripheral(id: number, peripheral: Peripheral): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, peripheral);
  }

  // DELETE: api/Peripherals/{id}
  public deletePeripheral(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
