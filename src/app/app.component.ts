import { Component, ChangeDetectorRef } from '@angular/core';
import { LoaderService } from './services/loader/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isLoading = false;

  constructor(private loaderService: LoaderService, private cdr: ChangeDetectorRef) {
   this.loaderService.isLoading$.subscribe((loading) => {
  setTimeout(() => {
    this.isLoading = loading;
  });
});

  }
}
