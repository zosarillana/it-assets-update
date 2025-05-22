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
  isDefective: boolean = false; // Track is_defective

  constructor(
    public dialogRef: MatDialogRef<ModalRemarksUniversalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number; title: string },
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.remarkForm = this.fb.group({
      remark: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  toggleDefective(): void {
    this.isDefective = !this.isDefective;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.remarkForm.valid) {
      const result = {
        remarks: this.remarkForm.value.remark,
        is_defective: this.isDefective
      };

      this.dialogRef.close(result);
    }
  }
}