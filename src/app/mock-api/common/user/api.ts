import { Injectable } from '@angular/core';
import { assign, cloneDeep } from 'lodash-es';
import { FuseMockApiService } from '@fuse/lib/mock-api';
import { user as userData } from 'app/mock-api/common/user/data';
import { UsersService } from 'app/services/user/users.service';
import { from } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class UserMockApi
{
    private _user: any = userData;

    /**
     * Constructor
     */
    constructor(
        private _fuseMockApiService: FuseMockApiService,
        private _usersService: UsersService // Inject UsersService
    )
    {
        // Register Mock API handlers
        this.registerHandlers();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register Mock API handlers
     */
    registerHandlers(): void
    {
        // -----------------------------------------------------------------------------------------------------
        // @ User - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/common/user')
            .reply(() => {
                // Fetch the real data of the logged-in user
                return from(this._usersService.getCurrentUser().toPromise()).pipe(
                    map(user => {
                        if (user) {
                            this._user = user;
                        }
                        return [200, cloneDeep(this._user)];
                    }),
                    catchError(error => {
                        console.error('Error fetching current user:', error);
                        return [500, { message: 'Error fetching current user' }];
                    })
                );
            });

        // -----------------------------------------------------------------------------------------------------
        // @ User - PATCH
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onPatch('api/common/user')
            .reply(({request}) => {

                // Get the user mock-api
                const user = cloneDeep(request.body.user);

                // Update the user mock-api
                this._user = assign({}, this._user, user);

                // Return the response
                return [200, cloneDeep(this._user)];
            });
    }
}