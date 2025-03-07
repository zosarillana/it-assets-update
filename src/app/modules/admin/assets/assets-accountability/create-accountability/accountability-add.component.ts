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
import { AccountabilityService } from 'app/services/accountability/accountability.service';
import { AlertService } from 'app/services/alert.service';
import { DepartmentService } from 'app/services/department/department.service';
import { Department } from 'app/models/Department/Department';
import { MatTableDataSource } from '@angular/material/table';

@Component({
    selector: 'app-accountability-add',
    templateUrl: './accountability-add.component.html',
    styleUrls: ['./accountability-add.component.scss'],
})
export class AccoundabilityAddComponent implements OnInit {
    @ViewChild('pcInput') pcInput!: ElementRef<HTMLInputElement>;
    eventForm!: FormGroup;
    filteredComputerOptions!: Observable<Assets[]>;
    computersData: Assets[] = [];
    selectedComputer: Assets | null = null;

    constructor(
        private _formBuilder: FormBuilder,
        private computerService: ComputerService,
        private userService: UsersService,
        private alertService: AlertService,
        private accountabilityService: AccountabilityService,
        private departmentService: DepartmentService
    ) {}

    displayFn = (value: any): string => {
        if (!value) return '';
        
        // If value is an object (during selection)
        if (typeof value === 'object') {
            return value.asset_barcode;
        }
        
        // If value is an ID (after selection), find the matching computer
        const computer = this.computersData.find(comp => comp.id === value);
        return computer ? computer.asset_barcode : '';
    };
    
    private initializeForm(): void {
        this.eventForm = this._formBuilder.group({
            typeComputerControl: [null, Validators.required],
            employee_id: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
            name: ['', Validators.required],
            department: ['', Validators.required],
            date_hired: ['', Validators.required],
            // date_resignation: ['', Validators.required],
            company: ['', Validators.required],
            // business_unit: ['', Validators.required],
            designation: ['', Validators.required],
        });
    }
        
    ngOnInit(): void {
        this.initializeForm(); // Ensure the form is created first
        this.loadDepartments();
        this.loadComputers();
        
        this.filteredComputerOptions = this.eventForm.get('typeComputerControl')!.valueChanges.pipe(
            startWith(''),
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((value) => {
                if (typeof value === 'string') {
                    return this._filterAutocompleteOptions(value);
                }
                return this._filterAutocompleteOptions('');
            })
        );
    }
    

    validateNumber(event: KeyboardEvent) {
        const inputChar = event.key;
        if (!/^\d$/.test(inputChar) && inputChar !== 'Backspace' && inputChar !== 'Tab') {
            event.preventDefault();
        }
    }
  
    private loadComputers(): void {
        this.computerService.getAssets(1, 100, 'asc').subscribe({
            next: (response) => {
                if (response.items && Array.isArray(response.items.$values)) {
                    this.computersData = response.items.$values
                        .filter(computer => computer.status === "INACTIVE")
                        .map(computer => {
                            console.log(`Raw Assigned Assets:`, computer.assigned_assets);
    
                            const assetIds = Array.isArray(computer.assigned_assets?.$values)
                                ? computer.assigned_assets.$values.map(asset => asset.id)
                                : [];
    
                            console.log(`Computer ID: ${computer.id}, Asset IDs:`, assetIds);
                            return {
                                ...computer,
                                asset_ids: assetIds
                            };
                        });
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
    



    private _filterAutocompleteOptions(value: string): Observable<Assets[]> {
        const filterValue = value.toLowerCase();
        return of(
            this.computersData.filter((option) =>
                option.asset_barcode.toLowerCase().includes(filterValue)
            )
        );
    }

    onTypeSelected(option: Assets): void {
        if (option) {
            // Store both ID and display value
            this.eventForm.patchValue({
                typeComputerControl: option.id
            });
            
            this.selectedComputer = option;  // Store the selected computer
            
            this.computerService.getComputersById(option.id).subscribe({
                next: (details: Assets) => {
                    this.selectedComputer = details;
                },
                error: (error) => {
                    console.error('Error fetching computer details:', error);
                },
            });
        }
    }

    allTypes: string[] = []; // Store unique type values
    departments: Department[] = []; // Holds the fetched departments
    dataSource = new MatTableDataSource<Department>();
    private loadDepartments(): void {
        this.departmentService.getDepartments().subscribe({
            next: (data) => {
                this.departments = data; // Populate departments for the select
                this.dataSource.data = this.departments;
    
                // Extract unique department codes (if needed elsewhere)
                this.allTypes = [...new Set(data.map((dept) => dept.code))];
    
                console.log("Departments Loaded:", this.departments); // Debugging log
            },
            error: (error) => {
                console.error('Error fetching departments', error);
            },
        });
    }
    

    onSubmit(): void {
        this.eventForm.markAllAsTouched(); // ✅ Force validation to show errors
        this.eventForm.updateValueAndValidity();
    
        console.log('Form Status:', this.eventForm.status);
        console.log('Form Controls:', this.eventForm.controls);
        console.log('Form Errors:', this.eventForm.errors);
    
        if (this.eventForm.invalid) {
            Object.keys(this.eventForm.controls).forEach(key => {
                console.log(`Field: ${key}, Status: ${this.eventForm.controls[key].status}, Errors:`, this.eventForm.controls[key].errors);
            });
    
            this.alertService.triggerError('Please fill in all required fields.');
            return;
        }
        
        const formData = this.eventForm.value;
        console.log('Form Data:', formData);
    
        const payload = {
            owner_id: 0,
            asset_ids: this.selectedComputer?.asset_ids || [],
            computer_ids: [this.eventForm.value.typeComputerControl],
            employee_id: this.eventForm.value.employee_id,
            name: this.eventForm.value.name,
            department: this.eventForm.value.department?.code,
            date_hired: this.eventForm.value.date_hired,
            date_resignation: '',
            company: this.eventForm.value.company,
            designation: this.eventForm.value.designation,
            // business_unit: this.eventForm.value.business_unit,
            is_deleted: "false"
        };
    
        console.log('Payload being submitted:', payload);
    
        this.accountabilityService.postEvent(payload).subscribe({
            next: (response) => {
                console.log('Successfully submitted:', response);
                this.alertService.triggerSuccess('Accountability successfully added!');
    
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            },
            error: (error) => {
                console.error('Error submitting data:', error);
                this.alertService.triggerError('Failed to submit accountability.');
            },
        });
    }
    
    
}