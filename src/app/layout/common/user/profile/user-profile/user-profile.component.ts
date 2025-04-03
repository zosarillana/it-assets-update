// import { Component, OnInit } from '@angular/core';
// import { UserService } from 'app/core/user/user.service';
// import { User } from 'app/core/user/user.types';
// import { Subject } from 'rxjs';
// import { takeUntil } from 'rxjs/operators';

// @Component({
//     selector: 'app-user-profile',
//     templateUrl: './user-profile.component.html',
//     styleUrls: ['./user-profile.component.scss'],
// })
// export class UserProfileComponent implements OnInit {
//     user: User;
//     private _unsubscribeAll: Subject<any> = new Subject<any>();

//     constructor(private _userService: UserService) {}

//     ngOnInit(): void {
//         // Subscribe to the user service to get user data
//         this._userService.user$
//             .pipe(takeUntil(this._unsubscribeAll)) // Auto-unsubscribe when component is destroyed
//             .subscribe((user: User) => {
//                 this.user = user;
//                 // console.log('🟢 User data loaded:', user);
//             });
//     }
// }
