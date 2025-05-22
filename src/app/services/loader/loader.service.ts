// loader.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private requestCount = 0;
  private _isLoading = new BehaviorSubject<boolean>(false);
  public isLoading$ = this._isLoading.asObservable();

  show() {
    this.requestCount++;
    if (this.requestCount === 1) {
      this._isLoading.next(true);
    }
  }

  hide() {
    if (this.requestCount > 0) {
      this.requestCount--;
    }
    if (this.requestCount === 0) {
      this._isLoading.next(false);
    }
  }
}
