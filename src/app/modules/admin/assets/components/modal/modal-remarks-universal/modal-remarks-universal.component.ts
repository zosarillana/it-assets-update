import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-remarks-universal',
  templateUrl: './modal-remarks-universal.component.html',
  styleUrls: ['./modal-remarks-universal.component.scss']
})
export class ModalRemarksUniversalComponent implements OnInit {
  remarkForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ModalRemarksUniversalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number, title: string }, // Receive title from parent
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // Initialize the form with validation
    this.remarkForm = this.fb.group({
      remark: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  // Close modal without submitting
  onCancel(): void {
    this.dialogRef.close();
  }

  // Submit remark and pass data back to parent
  onSubmit(): void {
    if (this.remarkForm.valid) {
      const remarkData = {
        id: this.data.id,
        remark: this.remarkForm.value.remark
      };
  
      console.log('Remark Data:', remarkData);
      this.dialogRef.close(remarkData); // Send data back to parent
    }
  }
}
