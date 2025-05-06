import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar'; 
import { UsersService } from 'app/services/user/users.service';

@Component({
    selector: 'app-edit-user-modal',
    templateUrl: './edit-user-modal.component.html',
    styleUrls: ['./edit-user-modal.component.scss'],
})
export class EditUserModalComponent implements OnInit {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditUserModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private usersService: UsersService,
    private snackBar: MatSnackBar 
  ) {}

  ngOnInit(): void {
    console.log('Initializing form with data:', this.data);
    
    // Create form with optional fields (no validators)
    this.form = this.fb.group({
      name: [this.data?.name || ''],
      company: [this.data?.company || ''],
      department: [this.data?.department || ''],
      designation: [this.data?.designation || ''],
      role: [this.data?.role || ''],
      employee_id: [this.data?.employee_id || ''],
      e_signature: [this.data?.e_signature || ''],
      is_active: [this.data?.is_active !== undefined ? this.data?.is_active : true],
      date_hired: [this.data?.date_hired || null],
      date_resignation: [this.data?.date_resignation || null]
    });
    
    console.log('Form initialized:', this.form.value);
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    console.log('Form submitted', this.form.value);
    
    // Always proceed with submission, regardless of validation
    console.log('Sending update request for user ID:', this.data.id);
    
    // Transform form values to match backend expectations
    const updateData = {
      Name: this.form.value.name,
      Company: this.form.value.company,
      Department: this.form.value.department,
      Designation: this.form.value.designation,
      Role: this.form.value.role,
      EmployeeId: this.form.value.employee_id,
      ESignature: this.form.value.e_signature,
      IsActive: this.form.value.is_active,
      DateHired: this.form.value.date_hired,
      DateResignation: this.form.value.date_resignation
    };
    
    this.usersService.updateUser(this.data.id, updateData).subscribe({
      next: (updatedUser) => {
        console.log('Update successful:', updatedUser);
        this.snackBar.open('User updated successfully!', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(updatedUser); // Return updated data
      },
      error: (err) => {
        console.error('Update failed:', err);
        this.snackBar.open(`Update failed: ${err.message || 'Unknown error'}`, 'Close', {
          duration: 5000,
        });
      },
    });
  }
}