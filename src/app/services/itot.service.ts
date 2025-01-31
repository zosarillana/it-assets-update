import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItotPc } from 'app/models/ItotPc';
import { ItotPeripheral } from 'app/models/ItotPeripheral';

@Injectable({
    providedIn: 'root',
})
export class ITOTService {
    private url = 'https://localhost:7233';
    constructor(private http: HttpClient) {}

    public getItots(): Observable<ItotPc[]> {
        return this.http.get<ItotPc[]>(`${this.url}/Itot/pc`);
    }

    public getItotPeripherals(): Observable<ItotPeripheral[]> {
        return this.http.get<ItotPeripheral[]>(`${this.url}/Itot/peripherals`);
    }

    //getting by id
    public getItotPeripheralsId(id: string): Observable<ItotPeripheral[]> {
        return this.http.get<ItotPeripheral[]>(
            `${this.url}/Itot/peripherals/${id}`
        );
    }
    public getItotPcsId(id: string): Observable<ItotPeripheral[]> {
        return this.http.get<ItotPeripheral[]>(
            `${this.url}/Itot/pc/${id}`
        );
    }

    //creating pc and peripheral
    public CreatePeripheral(data: any): Observable<any> {
        return this.http.post(`${this.url}/Itot/peripherals/add`, data);
    }

    public CreatePc(data: any): Observable<any> {
        return this.http.post(`${this.url}/Itot/pc/add`, data);
    }

    //delete pc and peripheral 
    public DeletePeripheral(id: number): Observable<any> {
        return this.http.delete(`${this.url}/Itot/peripherals/delete/${id}`);
    }

    public DeletePc(id: number): Observable<any> {
        return this.http.delete(`${this.url}/Itot/pc/delete/${id}`);
    }
    
    //update pc and peripheral
    public UpdatePeripheral(id: number, data: any): Observable<any> {
        return this.http.put(`${this.url}/Itot/peripherals/update/${id}`, data);
    }

    public UpdatePc(id: number, data: any): Observable<any> {
        return this.http.put(`${this.url}/Itot/pc/update/${id}`, data);
    }
    
    //uploading
    uploadExcelData(data: any[]): Observable<any> {
        return this.http.post(`${this.url}/ImportItot/update/pc`, data);
    }

    uploadExcelDataPeripherals(data: any[]): Observable<any> {
        return this.http.post(
            `${this.url}/ImportItot/update/peripherals`,
            data
        );
    }
}
