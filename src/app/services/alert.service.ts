import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private successSubject = new BehaviorSubject<string | null>(null);
  private errorSubject = new BehaviorSubject<string | null>(null);

  success$ = this.successSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  triggerSuccess(message: string): void {
    this.successSubject.next(message);
  }

  triggerError(message: string): void {
    this.errorSubject.next(message);
  }

  clearAlerts(): void {
    this.successSubject.next(null);
    this.errorSubject.next(null);
  }
}
