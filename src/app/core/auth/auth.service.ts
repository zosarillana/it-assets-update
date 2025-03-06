
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';

@Injectable()
export class AuthService
{
    private _authenticated: boolean = false;
    private _apiBaseUrl: string = 'https://localhost:7062/api'; // Update with your API base URL

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string)
    {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string
    {
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
    forgotPassword(email: string): Observable<any>
    {
        return this._httpClient.post(`${this._apiBaseUrl}/Auth/forgot-password`, { email });
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any>
    {
        return this._httpClient.post(`${this._apiBaseUrl}/Auth/reset-password`, { password });
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { employee_id: string; password: string }): Observable<any>
    {
        // Throw error, if the user is already logged in
        if ( this._authenticated )
        {
            return throwError('User is already logged in.');
        }

        // Adapt credentials to match backend expectations
        const loginRequest = {
            employee_id: credentials.employee_id, // Assuming email field is used for employee_id
            password: credentials.password
        };

        return this._httpClient.post(`${this._apiBaseUrl}/Auth/login`, loginRequest).pipe(
            map((response: any) => {
                // Your backend returns { token } so we need to adapt this
                // to the format expected by the rest of the app
                return {
                    accessToken: response.token,
                    user: this._extractUserFromToken(response.token)
                };
            }),
            switchMap((response: any) => {
                // Store the access token in the local storage
                this.accessToken = response.accessToken;

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.user;

                // Return a new observable with the response
                return of(response);
            })
        );
    }

    /**
     * Extract user information from JWT token
     */
    private _extractUserFromToken(token: string): any {
        try {
            // Decode JWT without verification (as we just want to extract the payload)
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                throw new Error('Invalid token format');
            }
            
            // Decode the payload (second part)
            const payload = JSON.parse(atob(tokenParts[1]));
            
            // Map JWT claims to user object
            // Adjust according to your actual token claims and User model needs
            return {
                id: payload.sub,
                name: payload.unique_name, // This would be employee_id based on your JWT setup
                email: payload.unique_name, // You may want to adjust this if you have email in your token
                // Add other user fields as needed
            };
        } catch (error) {
            console.error('Failed to extract user info from token:', error);
            return {};
        }
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any>
    {
        // In your current backend setup, you might not have a refresh endpoint
        // So we'll check if the token is valid and if it is, we'll extract user info
        // If not, we'll return false
        
        if (!this.accessToken || AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }

        // Extract user info from token
        const user = this._extractUserFromToken(this.accessToken);
        
        // Set the authenticated flag to true
        this._authenticated = true;

        // Store the user on the user service
        this._userService.user = user;

        // Return true
        return of(true);
        
        // Alternatively, if you add a refresh endpoint to your backend:
        /*
        return this._httpClient.post(`${this._apiBaseUrl}/Auth/refresh-token`, {
            token: this.accessToken
        }).pipe(
            catchError(() => of(false)),
            switchMap((response: any) => {
                // Store the access token in the local storage
                this.accessToken = response.token;

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = this._extractUserFromToken(response.token);

                // Return true
                return of(true);
            })
        );
        */
    }

    /**
     * Sign out
     */
    signOut(): Observable<any>
    {
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
    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any>
    {
        // Adapt to your backend's registration endpoint if you have one
        return this._httpClient.post(`${this._apiBaseUrl}/Auth/register`, {
            name: user.name,
            employee_id: user.email, // Assuming you use email as employee_id for new users
            password: user.password,
            company: user.company
        });
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email:string; password: string }): Observable<any>
    {
        const loginRequest = {
            employee_id: credentials.email,
            password: credentials.password
        };
        
        return this._httpClient.post(`${this._apiBaseUrl}/Auth/login`, loginRequest);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean>
    {
        // Check if the user is logged in
        if ( this._authenticated )
        {
            return of(true);
        }

        // Check the access token availability
        if ( !this.accessToken )
        {
            return of(false);
        }

        // Check the access token expire date
        if ( AuthUtils.isTokenExpired(this.accessToken) )
        {
            return of(false);
        }

        // If the access token exists and it didn't expire, sign in using it
        return this.signInUsingToken();
    }
}