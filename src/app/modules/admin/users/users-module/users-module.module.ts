import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { UsersListComponent } from '../users-masterclass/users-list/users-list.component';
import { UsersViewComponent } from '../users-masterclass/users-view/users-view.component';
import { UsersAddComponent } from '../users-masterclass/users-add/users-add.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseAlertModule } from '@fuse/components/alert';
import { FuseCardModule } from '@fuse/components/card';
import { FuseHighlightModule } from '@fuse/components/highlight';
import { FuseScrollbarModule } from '@fuse/directives/scrollbar';
import { SharedModule } from 'app/shared/shared.module';

const userRoute: Route[] = [
    {
        path: 'list',
        component: UsersListComponent,
    },
    {
        path: 'list/view',
        component: UsersViewComponent,
    },
    {
        path: 'list/add',
        component: UsersAddComponent,
    },
];

@NgModule({
    declarations: [UsersListComponent, UsersViewComponent, UsersAddComponent],
    imports: [
        CommonModule,
        FuseAlertModule,
        MatDividerModule,
        SharedModule,
        FuseHighlightModule,
        MatMomentDateModule,
        MatDatepickerModule,
        MatIconModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatChipsModule,
        MatStepperModule,
        ReactiveFormsModule,
        FormsModule,
        MatDialogModule,
        MatSortModule,
        MatTableModule,
        MatPaginatorModule,
        MatButtonToggleModule,
        MatProgressBarModule,
        FuseCardModule,
        MatMenuModule,
        MatTooltipModule,
        MatIconModule,
        MatButtonModule,
        MatSidenavModule,
        MatRadioModule,
        MatCheckboxModule,
        MatDividerModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatMenuModule,
        FuseScrollbarModule,
        RouterModule.forChild(userRoute),
    ],
})
export class UsersModuleModule {}
