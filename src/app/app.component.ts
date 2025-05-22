import { Component } from '@angular/core';
import { LoaderService } from './services/loader/loader.service';

@Component({
    selector   : 'app-root',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss']
})
export class AppComponent
{
   isLoading = false;

  constructor(private loaderService: LoaderService) {
    this.loaderService.isLoading$.subscribe((loading) => {
      this.isLoading = loading;
    });
  }
}
