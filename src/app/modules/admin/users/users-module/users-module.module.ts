import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { UsersListComponent } from '../users-masterclass/users-list/users-list.component';

const userRoute: Route[] = [
    {
        path: 'list',
        component: UsersListComponent,
    },
];

@NgModule({
    declarations: [UsersListComponent],
    imports: [CommonModule, RouterModule.forChild(userRoute)],
})
export class UsersModuleModule {}
