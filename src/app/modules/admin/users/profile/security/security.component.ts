import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsersService } from 'app/services/user/users.service';
import { User } from 'app/core/user/user.types';
import { map, take } from 'lodash';
import { finalize, takeUntil } from 'rxjs/operators';
import { UserService } from 'app/core/user/user.service';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-security',
    templateUrl: './security.component.html',
    styleUrls: ['./security.component.scss'],
})
export class SecurityComponent implements OnInit {
    passwordForm: FormGroup;
    isLoading: boolean = false;
    passwordFieldType: string = 'password';
    newPasswordFieldType: string = 'password';
    confirmPasswordFieldType: string = 'password';
    user: User;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        private _userService: UserService,
        private _formBuilder: FormBuilder,
        private createService: UsersService,
        private _snackBar: MatSnackBar
    ) {
        this.passwordForm = this._formBuilder.group(
            {
                currentPassword: ['', [Validators.required]],
                newPassword: [
                    '',
                    [
                        Validators.required,
                        Validators.minLength(8),
                        Validators.pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/),
                    ],
                ],
                confirmNewPassword: ['', [Validators.required]],
            },
            { validator: this.passwordMatchValidator }
        );
    }

    ngOnInit(): void {
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll)) // Auto-unsubscribe when component is destroyed
            .subscribe((user: User) => {
                this.user = user;
                // console.log('🟢 User data loaded:', user);
            });
    }

    // Custom validator to check if passwords match
    passwordMatchValidator(group: FormGroup) {
        const newPass = group.get('newPassword')?.value;
        const confirmPass = group.get('confirmNewPassword')?.value;
        return newPass === confirmPass ? null : { passwordMismatch: true };
    }

    togglePasswordVisibility(): void {
        this.passwordFieldType =
            this.passwordFieldType === 'password' ? 'text' : 'password';
    }

    toggleNewPasswordVisibility(): void {
        this.newPasswordFieldType =
            this.newPasswordFieldType === 'password' ? 'text' : 'password';
    }

    toggleConfirmPasswordVisibility(): void {
        this.confirmPasswordFieldType =
            this.confirmPasswordFieldType === 'password' ? 'text' : 'password';
    }

    onSubmit(): void {
        if (this.passwordForm.invalid) {
            return;
        }

        // Ensure user exists
        if (!this.user || !this.user.id) {
            this._snackBar.open('User ID is missing!', 'Close', {
                duration: 3000,
            });
            return;
        }

        // Ensure passwords match
        if (this.passwordForm.hasError('passwordMismatch')) {
            this._snackBar.open('Passwords do not match!', 'Close', {
                duration: 3000,
            });
            return;
        }

        this.isLoading = true;

        const passwordData = {
            currentPassword: this.passwordForm.value.currentPassword,
            newPassword: this.passwordForm.value.newPassword,
        };

        this.createService
            .changePassword(Number(this.user.id), passwordData)
            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe({
                next: () => {
                    this._snackBar.open(
                        'Password changed successfully!',
                        'Close',
                        { duration: 3000 }
                    );
                    this.passwordForm.reset();
                },
                error: (err) => {
                    this._snackBar.open(
                        'Failed to change password. Please try again.',
                        'Close',
                        { duration: 3000 }
                    );
                    console.error('Password Change Error:', err);
                },
            });
    }

    getErrorMessage(controlName: string): string {
        const control = this.passwordForm.get(controlName);

        if (control?.hasError('required')) {
            return 'This field is required';
        }
        if (control?.hasError('minlength')) {
            return 'Password must be at least 8 characters long';
        }
        if (control?.hasError('pattern')) {
            return 'Password must contain at least one uppercase letter and one special character';
        }
        if (
            this.passwordForm.hasError('passwordMismatch') &&
            controlName === 'confirmNewPassword'
        ) {
            return 'Passwords do not match';
        }
        return '';
    }
}
