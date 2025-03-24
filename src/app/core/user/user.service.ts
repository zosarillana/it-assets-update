import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User } from 'app/core/user/user.types';

@Injectable({
    providedIn: 'root'
})
export class UserService
{
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) 
    {
        this.loadUserFromToken();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User) 
    {
        if (!value || !value.id) {
            console.warn('⚠️ Ignoring empty user:', value);
            return; // Prevent emitting empty user
        }
        this._user.next(value);
        // console.log('✅ UserService emitted user:', value);
    }

    get user$(): Observable<User> 
    {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current logged-in user data from API
     */
    get(): Observable<User> {
        return new Observable<User>((observer) => {
            // const storedUser = localStorage.getItem('user');
            
            // if (storedUser) {
            //     console.log('🟢 Returning stored user:', JSON.parse(storedUser));
            //     observer.next(JSON.parse(storedUser)); // Use stored user
            //     observer.complete();
            //     return;
            // }
    
            // If no stored user, call API
            this._httpClient.get<User>('api/common/user').pipe(
                tap((user) => {
                    if (user && user.id) {
                        this._user.next(user);
                        // localStorage.setItem('user', JSON.stringify(user)); // Persist user
                        // console.log('✅ API User Loaded:', user);
                    } else {
                        // console.warn('⚠️ API returned empty user, keeping stored user.');
                    }
                })
            ).subscribe(observer);
        });
    }
    

    /**
     * Update the user
     *
     * @param user
     */
    update(user: User): Observable<any> 
    {
        return this._httpClient.patch<User>('api/common/user', { user }).pipe(
            map((response) => {
                this._user.next(response);
            })
        );
    }

    /**
     * Load user details from stored JWT token
     */
    private loadUserFromToken(): void {
        // console.log('🟢 loadUserFromToken() called');
    
        const token = localStorage.getItem('accessToken');
        // const storedUser = localStorage.getItem('user');
    
        // // if (storedUser) {
        // //     console.log('🟢 User found in localStorage:', storedUser);
        // //     this.user = JSON.parse(storedUser);
        // // } 
        // else if (token) {
        //     console.log('🟢 Token found in localStorage:', token);
        //     const userData = this.decodeToken(token);
            
        //     if (userData && userData.id) {
        //         this.user = userData; 
        //         localStorage.setItem('user', JSON.stringify(userData)); // Persist user
        //         console.log('✅ User Loaded from Token:', userData);
        //     } else {
        //         console.warn('⚠️ Decoded user is empty or invalid.');
        //     }
        // } else {
        //     console.warn('⚠️ No token or stored user found.');
        // }
    }
    
    

    /**
     * Decode JWT Token
     */
    private decodeToken(token: string): User | null 
    {
        try 
        {
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) 
            {
                throw new Error('Invalid token format');
            }
    
            const payload = JSON.parse(atob(tokenParts[1]));
    
            return {
                id: payload.sub,
                employee_id: payload.unique_name,
                name: payload.name || 'Unknown', // Ensure name exists
                designation: payload.designation || 'No Designation',
                role: payload.role || "No role",
                email: payload.email || 'No Email', // Ensure email exists
                company: payload.company || 'No Company', // Ensure company exists
                department: payload.department || 'No Department', // Ensure department exists
                avatar: 'assets/images/avatars/default-profile.jpg', // Default avatar
                status: 'online'
            };
        } 
        catch (error) 
        {
            console.error('Failed to decode token:', error);
            return null;
        }
    }
    
}
