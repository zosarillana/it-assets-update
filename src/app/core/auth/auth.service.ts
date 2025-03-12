import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';

@Injectable()
export class AuthService {
    private _authenticated: boolean = false;
    private _apiBaseUrl: string = 'https://localhost:7062/api';

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
        // return this._httpClient.post(`${this._apiBaseUrl}/Auth/reset-password`, { password });
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    // signIn(credentials: { email: string; password: string }): Observable<any>
    signIn(credentials: { employee_id: string; password: string }): Observable<any> {
        if (this._authenticated) {
            return throwError(() => new Error('User is already logged in.'));
        }
    
        return this._httpClient
            .post<{ token: string }>(`${this._apiBaseUrl}/Auth/login`, credentials)
            .pipe(
                map((response) => {
                    console.log('🟢 Login Response:', response);
    
                    if (!response.token) {
                        throw new Error('❌ No token in response!');
                    }
    
                    this.accessToken = response.token; // Store token
    
                    // Extract user details from token
                    const user = this._extractUserFromToken(response.token);
    
                    // Store user in UserService + Local Storage
                    this._userService.user = user;
                    localStorage.setItem('user', JSON.stringify(user));  // Persist user
    
                    this._authenticated = true;
    
                    return {
                        accessToken: response.token,
                        user: this._userService.user
                    };
                })
            );
    }
    
    
    

    /**
     * Extract user information from JWT token
     */
    private _extractUserFromToken(token: string): any {
        try {
            console.log("🔵 Decoding token:", token);
    
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                throw new Error('Invalid token format');
            }
    
            const payload = JSON.parse(atob(tokenParts[1]));
    
            console.log("🟢 Decoded Token Payload:", payload);
    
            return {
                id: payload.sub,
                employee_id: payload.unique_name, 
                name: payload.name || "Unknown",  
                email: payload.email || "No Email",
                company: payload.company || "No Company",
                department: payload.department || "No Department",
                designation: payload.designation || "No designation",
                avatar: 'assets/images/avatars/default-profile.jpg',
                status: 'online'
            };
        } catch (error) {
            console.error("❌ Failed to extract user info from token:", error);
            return {};
        }
    }
    
    
    signInUsingToken(): Observable<any> {
        if (!this.accessToken || AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }
    
        const user = this._extractUserFromToken(this.accessToken);
    
        this._authenticated = true;
        this._userService.user = user; // Store user details in the service
    
        console.log("User Info:", user);
    
        return of(user); // Return user object
    }
    

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: {
        name: string;
        email: string;
        password: string;
        company: string;
    }): Observable<any> {
        // Adapt to your backend's registration endpoint if you have one
        return this._httpClient.post(`${this._apiBaseUrl}/Auth/register`, {
            name: user.name,
            employee_id: user.email, // Assuming you use email as employee_id for new users
            password: user.password,
            company: user.company,
        });
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        const loginRequest = {
            employee_id: credentials.email,
            password: credentials.password,
        };

        return this._httpClient.post(
            `${this._apiBaseUrl}/Auth/login`,
            loginRequest
        );
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken) {
            return of(false);
        }

        // Check the access token expire date
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }

        // If the access token exists and it didn't expire, sign in using it
        return this.signInUsingToken();
    }

    
}
