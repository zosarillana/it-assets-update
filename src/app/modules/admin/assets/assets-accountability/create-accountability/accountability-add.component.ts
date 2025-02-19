import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ComputerService } from 'app/services/computer/computer.service';
import { Observable, of } from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,    
    map,    
    startWith,
    switchMap,
} from 'rxjs/operators';
import { Assets } from 'app/models/Inventory/Asset';
import { UsersService } from 'app/services/user/users.service';
import { User } from 'app/core/user/user.types';

@Component({
    selector: 'app-accountability-add',
    templateUrl: './accountability-add.component.html',
    styleUrls: ['./accountability-add.component.scss'],
})
export class AccoundabilityAddComponent implements OnInit {
    @ViewChild('pcInput') pcInput!: ElementRef<HTMLInputElement>;
    eventForm!: FormGroup;
    typeComputerControl = new FormControl('');
    filteredComputerOptions!: Observable<Assets[]>;
    computersData: Assets[] = [];
    selectedComputer: Assets | null = null;

    constructor(
        private _formBuilder: FormBuilder,
        private computerService: ComputerService,
        private userService: UsersService
    ) {}

    private initializeForm(): void {
            this.eventForm = this._formBuilder.group({
                // image_component: [null],
                // serial_number: [this.data.serial_number || 'N/A', []], // Use the passed value
                // asset_barcode: [this.data.asset_barcode || 'N/A', []], // Use the passed value
                // date_acquired: [new Date(), [Validators.required]],                
                emplotypeComputerControl: ['', [Validators.required]],
                employee_id: ['', [Validators.required]],
                name: ['', [Validators.required]],
                department: ['', [Validators.required]],
                date_hired: ['', [Validators.required]],
                date_resignation: ['', [Validators.required]],
                company: ['', [Validators.required]],
            });
        }
        
    ngOnInit(): void {
        this.initializeForm();
        // this.loadUsers();

        // // Filter user list based on input value
        // this.filteredUserOptions = this.typeUserControl.valueChanges.pipe(
        //     startWith(''),
        //     debounceTime(300),
        //     distinctUntilChanged(),
        //     map((value) => this._filterUsers(value || ''))
        // );
            
        this.loadComputers();
        this.filteredComputerOptions =
            this.typeComputerControl.valueChanges.pipe(
                startWith(''),
                debounceTime(300),
                distinctUntilChanged(),
                switchMap((value) => this._filterAutocompleteOptions(value))
            );
    }

    private loadComputers(): void {
        this.computerService.getAssets(1, 100, 'asc').subscribe({
            next: (response) => {
                if (response.items && Array.isArray(response.items.$values)) {
                    this.computersData = response.items.$values; // Extract the actual array
                } else {
                    console.error('Expected an array, but got:', response);
                    this.computersData = [];
                }
            },
            error: (error) => {
                console.error('Error loading computers:', error);
                this.computersData = [];
            },
        });
    }

    private _filterAutocompleteOptions(
        value: string | null
    ): Observable<Assets[]> {
        if (!value) return of(this.computersData);

        const filterValue = value.toLowerCase();
        return of(
            this.computersData.filter((option) =>
                option.asset_barcode.toLowerCase().includes(filterValue)
            )
        );
    }

    onTypeSelected(event: any): void {
        const selectedBarcode = event;
        const selectedComputer = this.computersData.find(
            (comp) => comp.asset_barcode === selectedBarcode
        );

        if (selectedComputer) {
            this.typeComputerControl.setValue(selectedBarcode, {
                emitEvent: false,
            });

            this.computerService
                .getComputersById(selectedComputer.id)
                .subscribe({
                    next: (details: Assets) => {
                        this.selectedComputer = details;
                    },
                    error: (error) => {
                        console.error(
                            'Error fetching computer details:',
                            error
                        );
                    },
                });
        }
    }

    //Users  
    // typeUserControl = new FormControl('');
    // filteredUserOptions!: Observable<User[]>;
    // UserData: User[] = [];
    // selectedUser: User | null = null;
    // private loadUsers(): void {
    //     this.userService.getUsers(1, 100, 'asc').subscribe({
    //         next: (response) => {
    //             if (response.$values && Array.isArray(response.$values)) {
    //                 this.UserData = response.$values;
    //             } else {
    //                 console.error('Expected an array, but got:', response);
    //                 this.UserData = [];
    //             }
    //         },
    //         error: (error) => {
    //             console.error('Error loading users:', error);
    //             this.UserData = [];
    //         },
    //     });
    // }
    
    // private _filterUsers(value: string): User[] {
    //     const filterValue = value.toLowerCase();
    //     return this.UserData.filter((user) =>
    //         user.name.toLowerCase().includes(filterValue)
    //     );
    // }

 
    // onUserSelected(userName: string): void {
    //     const selectedUser = this.UserData.find((user) => user.name === userName);
    
    //     if (selectedUser) {
    //         this.selectedUser = selectedUser; // Directly set the selected user
    //     }
    // }
    
}
