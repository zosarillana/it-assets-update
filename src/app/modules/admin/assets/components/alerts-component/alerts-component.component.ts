import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertService } from 'app/services/alert.service';
import { Subscription } from 'rxjs';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-alerts-component',
  templateUrl: './alerts-component.component.html',
  styleUrls: ['./alerts-component.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 1 })),
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in')
      ]),
      transition(':leave', [
        animate('500ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class AlertsComponentComponent implements OnInit, OnDestroy {
  successMessage: string | null = null;
  errorMessage: string | null = null;
  successVisible = false;
  errorVisible = false;
  private successSub: Subscription;
  private errorSub: Subscription;

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    this.successSub = this.alertService.success$.subscribe((message) => {
      if (message) {
        this.successMessage = message;
        this.successVisible = true;

        // Auto hide after 5 seconds
        setTimeout(() => {
          this.successVisible = false;
        }, 5000);
      } else {
        this.successVisible = false;
      }
    });

    this.errorSub = this.alertService.error$.subscribe((message) => {
      if (message) {
        this.errorMessage = message;
        this.errorVisible = true;

        // Auto hide after 5 seconds
        setTimeout(() => {
          this.errorVisible = false;
        }, 5000);
      } else {
        this.errorVisible = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.successSub.unsubscribe();
    this.errorSub.unsubscribe();
  }
}
