import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';

import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
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

    typeFilterControl = new FormControl('');
    filteredUserOptions!: Observable<User[]>;
    
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    dataSource = new MatTableDataSource<User>();
    displayedColumns: string[] = ['fullname', 'designation', 'action'];

    constructor(
        private usersService: UsersService,
        private _liveAnnouncer: LiveAnnouncer,
        private dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        // Initialize the filteredUserOptions for autocomplete
        this.filteredUserOptions = this.typeFilterControl.valueChanges.pipe(
            startWith(''),
            debounceTime(300),
            distinctUntilChanged(),
            map(value => typeof value === 'string' ? value : value?.name || ''),
            switchMap(searchText => {
                // If search text is empty, return all users
                if (!searchText || searchText.length < 2) {
                    return this.usersService.getUsers(1, 100, 'asc', '').pipe(
                        map(users => users.slice(0, 10)) // Limit to 10 suggestions
                    );
                }
                
                // Otherwise, return filtered users from API
                return this.usersService.getUsers(1, 10, 'asc', searchText);
            })
        );

        // Apply direct filtering when user types without having to select from dropdown
        this.typeFilterControl.valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).subscribe(value => {
            this.searchTerm = typeof value === 'string' ? value : value?.name || '';
            if (this.paginator) {
                this.paginator.pageIndex = 0;
            }
            this.loadUsers();
        });
    }

    ngAfterViewInit(): void {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
  
      setTimeout(() => {
          this.loadUsers();
      });
  
      this.paginator.page.subscribe(() => {
          this.pageSize = this.paginator.pageSize;
          this.pageIndex = this.paginator.pageIndex;
          this.loadUsers();
      });
  }

    loadUsers(): void {
        this.isLoading = true;
        const pageNumber = this.paginator ? this.paginator.pageIndex + 1 : 1;

        this.usersService
            .getUsers(
                pageNumber,
                this.pageSize,
                this.sortOrder,
                this.searchTerm,
                // this.sortField
            )
            .subscribe({
                next: (response) => {
                    this.users = response;
                    this.dataSource.data = this.users;
                    this.isLoading = false;
                },
                error: (error) => {
                    // console.error('Error fetching users:', error);
                    // this.errorMessage = 'Failed to load users';
                    this.isLoading = false;
                },
            });
    }

    announceSortChange(sortState: Sort): void {
        // This example uses English messages. If your application supports
        // multiple language, you would internationalize these strings.
        if (sortState.direction) {
            this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
            this.sortOrder = sortState.direction;
            this.sortField = sortState.active;
        } else {
            this._liveAnnouncer.announce('Sorting cleared');
            this.sortOrder = 'asc';
        }
        
        if (this.paginator) {
            this.paginator.pageIndex = 0;
        }
        
        this.loadUsers();
    }

    displayUserFn(user: User): string {
        return user?.name || '';
    }

    onUserSelected(selectedUser: User): void {
        this.searchTerm = selectedUser.name;
        
        if (this.paginator) {
            this.paginator.pageIndex = 0;
        }
        
        this.loadUsers();
    }

    clearFilter(): void {
        this.typeFilterControl.setValue('');
        this.searchTerm = '';
        if (this.paginator) {
            this.paginator.pageIndex = 0;
        }
        this.loadUsers();
    }

    //Edit
    openEditDialog(element: any): void {
      const dialogRef = this.dialog.open(EditUserModalComponent, {
        width: '600px',
        data: element,
        autoFocus: true // <-- this ensures focus moves into the modal
      });
    
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          // Reload the table datasource if update was successful
          this.loadUsers();
        }
      });
    }
}