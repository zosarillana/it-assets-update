import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
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
import { DOCUMENT } from '@angular/common';
import { MatTabGroup } from '@angular/material/tabs';

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
    datenow: string;
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _formBuilder: FormBuilder,
        private computerService: ComputerService,
        private userService: UsersService,
        private alertService: AlertService,
        private accountabilityService: AccountabilityService,
        private departmentService: DepartmentService,
        private _changeDetectorRef: ChangeDetectorRef
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
        this.datenow = new Date().toLocaleString();  // You can adjust this format
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
    
    getComponentKeys(computer: any): string[] {
        if (!computer) return [];
        
        const componentKeys = ["ram", "ssd", "hdd", "gpu", "board"];
        
        // Filter out null values and return only the keys that exist
        return componentKeys.filter(key => computer[key]?.values?.$values?.length);
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
    
    //course dummy data 

    course = {
        title: 'Master Angular Development',
        description: 'Learn the ins and outs of Angular development, from beginner to advanced.',
        duration: 120,
        totalSteps: 5,
        category: {
          slug: 'web',
          title: 'Web Development',
        },
        steps: [
          {
            order: 0,
            title: 'Introduction to Angular',
            subtitle: 'Get familiar with Angular framework basics.',
            content: '<p>This is the content for step 1. It introduces Angular fundamentals.</p>',
          },
          {
            order: 1,
            title: 'Components and Modules',
            subtitle: 'Learn about creating and structuring Angular components and modules.',
            content: '<p>This step covers components and module concepts in Angular.</p>',
          },
          {
            order: 2,
            title: 'Services and Dependency Injection',
            subtitle: 'Understand services and how to use dependency injection in Angular.',
            content: '<p>This step dives into services and dependency injection in Angular applications.</p>',
          },
          {
            order: 3,
            title: 'Routing and Navigation',
            subtitle: 'Learn how to handle routing and navigation between components.',
            content: '<p>This step covers routing and navigation concepts in Angular.</p>',
          },
          {
            order: 4,
            title: 'Advanced Angular Techniques',
            subtitle: 'Explore advanced Angular concepts for better app architecture.',
            content: '<p>This step discusses advanced techniques in Angular, such as lazy loading and state management.</p>',
          },
        ],
      };

    //drawer 
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    currentStep: number = 0
    @ViewChild('courseSteps', {static: true}) courseSteps: MatTabGroup;

    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }
    
    goToStep(step: number): void
    {
        // Set the current step
        this.currentStep = step;

        // Go to the step
        this.courseSteps.selectedIndex = this.currentStep;

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Go to previous step
     */
    goToPreviousStep(): void
    {
        // Return if we already on the first step
        if ( this.currentStep === 0 )
        {
            return;
        }

        // Go to step
        this.goToStep(this.currentStep - 1);

        // Scroll the current step selector from sidenav into view
        this._scrollCurrentStepElementIntoView();
    }

    /**
     * Go to next step
     */
    goToNextStep(): void
    {
        // Return if we already on the last step
        if ( this.currentStep === this.course.totalSteps - 1 )
        {
            return;
        }

        // Go to step
        this.goToStep(this.currentStep + 1);

        // Scroll the current step selector from sidenav into view
        this._scrollCurrentStepElementIntoView();
    }
   /**
     * Scrolls the current step element from
     * sidenav into the view. This only happens when
     * previous/next buttons pressed as we don't want
     * to change the scroll position of the sidebar
     * when the user actually clicks around the sidebar.
     *
     * @private
     */
   private _scrollCurrentStepElementIntoView(): void
   {
       // Wrap everything into setTimeout so we can make sure that the 'current-step' class points to correct element
       setTimeout(() => {

           // Get the current step element and scroll it into view
           const currentStepElement = this._document.getElementsByClassName('current-step')[0];
           if ( currentStepElement )
           {
               currentStepElement.scrollIntoView({
                   behavior: 'smooth',
                   block   : 'start'
               });
           }
       });
   }
}