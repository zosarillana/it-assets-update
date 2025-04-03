// import { Component, OnInit } from '@angular/core';
// import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { UsersService } from 'app/services/user/users.service';
// import { User } from 'app/core/user/user.types';
// import { map, take } from 'lodash';
// import { finalize } from 'rxjs/operators';
// import { UserService } from 'app/core/user/user.service';

// @Component({
//   selector: 'app-security',
//   templateUrl: './security.component.html',
//   styleUrls: ['./security.component.scss']
// })
// export class SecurityComponent implements OnInit {
//   passwordForm: FormGroup;
//   isLoading: boolean = false;
//   passwordFieldType: string = 'password';
//   newPasswordFieldType: string = 'password';
//   confirmPasswordFieldType: string = 'password';
 
//   constructor(
//     private _formBuilder: FormBuilder,
//     private createService: UsersService,
//     private userService: UserService,
//     private _snackBar: MatSnackBar
//   ) {
//     this.passwordForm = this._formBuilder.group({
//       currentPassword: ['', [Validators.required]],
//       newPassword: ['', [Validators.required, Validators.minLength(8), 
//         Validators.pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)]],
//       confirmNewPassword: ['', [Validators.required]]
//     }, { validator: this.passwordMatchValidator });
//   }

//   ngOnInit(): void {}

//   // Custom validator to check if passwords match
//   passwordMatchValidator(group: FormGroup) {
//     const newPass = group.get('newPassword')?.value;
//     const confirmPass = group.get('confirmNewPassword')?.value;
//     return newPass === confirmPass ? null : { passwordMismatch: true };
//   }

//   togglePasswordVisibility(): void {
//     this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
//   }

//   toggleNewPasswordVisibility(): void {
//     this.newPasswordFieldType = this.newPasswordFieldType === 'password' ? 'text' : 'password';
//   }

//   toggleConfirmPasswordVisibility(): void {
//     this.confirmPasswordFieldType = this.confirmPasswordFieldType === 'password' ? 'text' : 'password';
//   }
//   onSubmit(): void {
    
//   }

//   getErrorMessage(controlName: string): string {
//     const control = this.passwordForm.get(controlName);
    
//     if (control?.hasError('required')) {
//       return 'This field is required';
//     }
//     if (control?.hasError('minlength')) {
//       return 'Password must be at least 8 characters long';
//     }
//     if (control?.hasError('pattern')) {
//       return 'Password must contain at least one uppercase letter and one special character';
//     }
//     if (this.passwordForm.hasError('passwordMismatch') && 
//         controlName === 'confirmNewPassword') {
//       return 'Passwords do not match';
//     }
//     return '';
//   }
// }