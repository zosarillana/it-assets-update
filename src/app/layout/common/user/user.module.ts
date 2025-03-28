import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { UserComponent } from 'app/layout/common/user/user.component';
import { SharedModule } from 'app/shared/shared.module';

import { UserProfileComponent } from './profile/user-profile/user-profile.component';
import { SecurityComponent } from './profile/security/security.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { UserSetttingsComponent } from './profile/user-setttings/user-setttings.component';

@NgModule({
    declarations: [
        UserComponent,                
    ],
    imports     : [
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        SharedModule,
        RouterModule,
        MatSidenavModule
    ],
    exports     : [
        UserComponent
    ]
})
export class UserModule
{
}
