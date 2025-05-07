import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UsersService } from 'app/services/user/users.service';
import { User } from 'app/models/Users/users';
import { MatSort, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Observable } from 'rxjs';
import { EditUserModalComponent } from './edit-user-modal/edit-user-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit, AfterViewInit {
    errorMessage: string = '';
    users: User[] = [];
    isLoading: boolean = false;

    pageSize = 10;
    pageIndex = 0;
    sortOrder = 'asc';
    sortField = 'fullname';
    searchTerm = '';
    totalItems = 0;

    typeFilterControl = new FormControl('');
    filteredUserOptions!: Observable<User[]>;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    displayedColumns: string[] = ['fullname', 'company', 'department' , 'employee_id','designation', 'action'];

    constructor(
        private usersService: UsersService,
        private _liveAnnouncer: LiveAnnouncer,
        private dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.typeFilterControl.valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).subscribe(value => {
            this.searchTerm = typeof value === 'string' ? value : value?.name || '';
            this.pageIndex = 0;
            this.loadUsers();
        });
    }

    ngAfterViewInit(): void {
        this.paginator.page.subscribe((event: PageEvent) => {
            this.pageSize = event.pageSize;
            this.pageIndex = event.pageIndex;
            this.loadUsers();
        });

        setTimeout(() => this.loadUsers(), 0);
    }

    loadUsers(): void {
        this.isLoading = true;

        this.usersService
            .getUsers(
                this.pageIndex + 1,
                this.pageSize,
                this.sortOrder,
                this.searchTerm
            )
            .subscribe({
                next: (response) => {
                    this.users = response.items;
                    this.totalItems = response.totalItems ?? 0;

                    // Set paginator info
                    if (this.paginator) {
                        this.paginator.length = this.totalItems;
                        this.paginator.pageIndex = this.pageIndex;
                    }

                    this.isLoading = false;
                },
                error: (err) => {
                    console.error('Error loading users:', err);
                    this.errorMessage = 'Failed to load users. Please try again.';
                    this.isLoading = false;
                },
            });
    }

    announceSortChange(sortState: Sort): void {
        if (sortState.direction) {
            this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
            this.sortOrder = sortState.direction;
            this.sortField = sortState.active;
        } else {
            this._liveAnnouncer.announce('Sorting cleared');
            this.sortOrder = 'asc';
        }

        this.pageIndex = 0;
        this.paginator.pageIndex = 0;
        this.loadUsers();
    }

    displayUserFn(user: User): string {
        return user?.name || '';
    }

    onUserSelected(selectedUser: User): void {
        this.searchTerm = selectedUser.name;
        this.pageIndex = 0;
        this.paginator.pageIndex = 0;
        this.loadUsers();
    }

    clearFilter(): void {
        this.typeFilterControl.setValue('');
        this.searchTerm = '';
        this.pageIndex = 0;
        this.paginator.pageIndex = 0;
        this.loadUsers();
    }

    openEditDialog(element: any): void {
        const dialogRef = this.dialog.open(EditUserModalComponent, {
            width: '600px',
            data: element,
            autoFocus: true
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadUsers();
            }
        });
    }
}
