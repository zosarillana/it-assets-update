import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-universal',
  templateUrl: './modal-universal.component.html',
  styleUrls: ['./modal-universal.component.scss']
})
export class ModalUniversalComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalUniversalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string }
  ) {}

  onNoClick(): void {
    this.dialogRef.close(); // Close dialog without returning any data
  }
}
