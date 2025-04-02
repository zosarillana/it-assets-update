import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountabilityService } from 'app/services/accountability/accountability.service';
import { ReturnService } from 'app/services/accountability/return.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-return-form',
    templateUrl: './return-form.component.html',
    styleUrls: ['./return-form.component.scss'],
})
export class ReturnFormComponent implements OnInit {
    asset: any;
    accountabilityItem: any = { computers: { $values: [] }, assets: { $values: [] } };
    isSubmitting: boolean = false;
    user: User;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    loading: boolean = false; // Add this line
    // Mat-Table Configuration
    dataSource: MatTableDataSource<any>;
    assetDataSource: MatTableDataSource<any>;
    // Flattened components list
    flattenedComponents: any[] = [];
    constructor(
        private route: ActivatedRoute,
        private accountabilityService: AccountabilityService,
        private returnItemService: ReturnService,
        private _userService: UserService,
        private snackBar: MatSnackBar,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.route.paramMap.subscribe((params) => {
            const id = params.get('id');
            if (id) {
                this.fetchAccountabilityItem(Number(id));
            }
        });

        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;
                // console.log('🟢 User data loaded:', user);
            });
    }

    fetchAccountabilityItem(id: number): void {
        this.loading = true;
    
        this.accountabilityService.getAccountabilityById(id).subscribe({
            next: (data) => {
                // console.log('Fetched accountability item:', data);
                
                if (!data) {
                    this.loading = false;
                    return;
                }
    
                this.accountabilityItem = data;
    
                // ✅ Log the entire accountability item to check its structure
                // console.log('Accountability Item Structure:', this.accountabilityItem);
                // console.log('Assets:', this.accountabilityItem.assets?.$values || 'No assets found');
                // console.log('Computers:', this.accountabilityItem.computers?.$values || 'No computers found');
                // console.log('Components:', this.accountabilityItem.computers?.map((computer: any) => computer.components));
    
                // Initialize checkbox values for computers and their components
                this.initializeCheckboxValues();
                
                // Separate deep copies for both tables
                this.flattenComponents();
    
                // ✅ Check the structure of computers data
                const computersArray =
                    Array.isArray(this.accountabilityItem.computers)
                        ? this.accountabilityItem.computers
                        : this.accountabilityItem.computers?.$values
                        ? this.accountabilityItem.computers.$values
                        : [];
                
                // console.log('Processed Computers Array:', computersArray);
    
                // ✅ Check the structure of components data
                const componentsArray = computersArray.flatMap(computer => {
                    const { BOARD, HDD, RAM, SSD } = computer.components;
                    return [...(BOARD || []), ...(HDD || []), ...(RAM || []), ...(SSD || [])];
                });
                // console.log('Processed Components Array:', componentsArray);
    
                // Create deep copy safely
                try {
                    this.dataSource = new MatTableDataSource(
                        JSON.parse(JSON.stringify(computersArray))
                    );
                    // console.log('DataSource initialized successfully');
                } catch (e) {
                    console.error('Error creating data source:', e);
                    this.dataSource = new MatTableDataSource([]);
                }
    
                // ✅ Extract assigned assets with better error handling
                try {
                    const assignedAssets = [].concat(
                        ...computersArray.map(
                            (computer: any) =>
                                computer.assignedAssetDetails?.$values ||
                                (Array.isArray(computer.assignedAssetDetails)
                                    ? computer.assignedAssetDetails
                                    : [])
                        )
                    );
                    // console.log('Processed Assigned Assets:', assignedAssets);
                    this.assetDataSource = new MatTableDataSource(assignedAssets);
                } catch (e) {
                    console.error('Error processing assigned assets:', e);
                    this.assetDataSource = new MatTableDataSource([]);
                }
    
                this.loading = false;
            },
            error: (error) => {
                alert(`Failed to load accountability details: ${error.message}`);
                this.loading = false;
            },
        });
    }

    initializeCheckboxValues(): void {
        // Initialize computers
        if (this.accountabilityItem.computers?.$values) {
            this.accountabilityItem.computers.$values.forEach((computer: any) => {
                computer.checked = false;
                computer.condition = computer.condition || 'good';
    
                // Initialize assigned assets
                if (computer.assignedAssetDetails?.$values) {
                    computer.assignedAssetDetails.$values.forEach((asset: any) => {
                        asset.checked = false;
                        asset.condition = asset.condition || 'good';
                    });
                }
    
                // Initialize components
                if (computer.components && typeof computer.components === 'object') {
                    Object.keys(computer.components).forEach((compType) => {
                        const componentType = computer.components[compType];
                        if (Array.isArray(componentType)) {
                            componentType.forEach((component: any) => {
                                component.checked = false;
                                component.condition = component.condition || 'good';
                            });
                        }
                    });
                }
            });
        }
    
        // Initialize direct assets
        if (this.accountabilityItem.assets?.$values) {
            this.accountabilityItem.assets.$values.forEach((asset: any) => {
                asset.checked = false;
                asset.condition = asset.condition || 'good';
            });
        }
    }

    allCheckboxesChecked(): boolean {
  
      const assets = this.accountabilityItem?.assets?.$values || [];
      const computers = this.accountabilityItem?.computers?.$values || [];
      const assignedAssets = this.assetDataSource?.data || [];
      const components = this.flattenedComponents || [];
  
      // Check if all assets are checked
      const allAssetsChecked = assets.length === 0 || assets.every(a => a.checked);
  
      // Check if all assigned assets are checked
      const allAssignedAssetsChecked = assignedAssets.length === 0 || assignedAssets.every(a => a.checked);
  
      // Check if all computers are checked
      const allComputersChecked = computers.length === 0 || computers.every(c => c.checked);
  
      // Check if all components are checked
      const allComponentsChecked = components.length === 0 || components.every(c => c.checked);
  
      const result = allAssetsChecked && allAssignedAssetsChecked && allComputersChecked && allComponentsChecked;
  
      return result;
  }
  

    flattenComponents(): void {
      this.flattenedComponents = [];
  
      if (this.accountabilityItem?.computers?.length) {
          this.accountabilityItem.computers.forEach((computer) => {
              Object.keys(computer.components).forEach((componentType) => {
                  if (Array.isArray(computer.components[componentType])) {
                      computer.components[componentType].forEach((component) => {
                          this.flattenedComponents.push({
                              ...component,
                              type: componentType, // Add component type (GPU, RAM, etc.)
                          });
                      });
                  }
              });
          });
      }
  
      // Assign to MatTableDataSource
      this.assetDataSource = new MatTableDataSource(this.flattenedComponents);
  }

  submitReturnChecklist(): void {
    if (!this.accountabilityItem) {
        console.error('Error: Accountability item is missing.');
        alert('Error: Accountability details are not loaded.');
        return;
    }

    const ownerId = this.accountabilityItem.user_accountability_list?.owner_id ?? null;

    this.isSubmitting = true;

    try {
        // console.log('Starting checklist submission...');

        // Ensure computers data exist
        // console.log('Accountability Item:', this.accountabilityItem);
        // console.log('Computers:', this.accountabilityItem.computers || 'No computers found');

        // Process computers along with their assigned assets and components
        const checklist: any[] = [];
        if (this.accountabilityItem.computers && Array.isArray(this.accountabilityItem.computers)) {
            for (const computer of this.accountabilityItem.computers) {
                // console.log('Processing computer:', computer);

                // Process the computer itself
                const computerItem = {
                    accountability_id: this.accountabilityItem.user_accountability_list?.id ?? null,
                    user_id: ownerId,
                    asset_id: null,
                    computer_id: computer.id,
                    component_id: null,
                    item_type: 'Computers',
                    status: computer.checked ? computer.condition : 'missing',
                    remarks: computer.remarks || '',
                    validated_by: 1,
                };
                // console.log('Computer item:', computerItem);
                checklist.push(computerItem);

                // Process assigned assets
                if (computer.assignedAssetDetails && Array.isArray(computer.assignedAssetDetails)) {
                    for (const asset of computer.assignedAssetDetails) {
                        const assignedAssetItem = {
                            accountability_id: this.accountabilityItem.user_accountability_list?.id ?? null,
                            user_id: ownerId,
                            asset_id: asset.id,
                            computer_id: computer.id,
                            component_id: null,
                            item_type: 'Assets',
                            status: asset.checked ? asset.condition : 'missing',
                            remarks: asset.remarks || '',
                            validated_by: 1,
                        };
                        // console.log('Assigned asset item:', assignedAssetItem);
                        checklist.push(assignedAssetItem);
                    }
                }

                // Process components
                const { BOARD, HDD, RAM, SSD, GPU } = computer.components;
                const componentsArray = [...(BOARD || []), ...(HDD || []), ...(RAM || []), ...(SSD || []), ...(GPU || [])];
                for (const component of componentsArray) {
                    const componentItem = {
                        accountability_id: this.accountabilityItem.user_accountability_list?.id ?? null,
                        user_id: ownerId,
                        asset_id: null,
                        computer_id: computer.id,
                        component_id: component.id,
                        item_type: 'Components',
                        status: component.checked ? component.condition : 'missing',
                        remarks: component.remarks || '',
                        validated_by: 1,
                    };
                    // console.log('Component item:', componentItem);
                    checklist.push(componentItem);
                }
            }
        }

        // console.log('Final checklist to be submitted:', checklist);

        if (!checklist.length) {
            throw new Error('No items to return.');
        }

        // Send data to API with better error handling
        const promises: Promise<any>[] = checklist.map((item) =>
            new Promise<any>((resolve) => {
                // console.log(`Submitting item of type ${item.item_type}:`, item);
                this.returnItemService.createReturnItem(item).subscribe({
                    next: (response) => {
                        // console.log('Successfully submitted item:', {
                        //     type: item.item_type,
                        //     id: item.computer_id || item.asset_id || item.component_id,
                        //     response,
                        // });
                        resolve(response);
                    },
                    error: (error) => {
                        console.error('Failed to submit item:', {
                            type: item.item_type,
                            id: item.computer_id || item.asset_id || item.component_id,
                            error,
                        });
                        resolve(null); // Ensures Promise.all() continues even if one item fails
                    },
                });
            })
        );

        // Handle API responses
        Promise.all(promises)
            .then(() => {
                this.isSubmitting = false;
                this.snackBar.open('Return process completed successfully!', 'Close', {
                    duration: 3000,
                });
                this.router.navigate(['/assets/accountability']);
            })
            .catch((error) => {
                console.error('Error in batch submission:', error);
                this.snackBar.open(`Error during submission: ${error.message}`, 'Close', {
                    duration: 5000,
                });
                this.isSubmitting = false;
            });
    } catch (error: any) {
        console.error('Unexpected error while preparing return checklist:', error);
        this.snackBar.open(`Unexpected error: ${error.message}`, 'Close', {
            duration: 5000,
        });
        this.isSubmitting = false;
    }
}

    getComponentType(type: string): string {
      const validTypes = ['GPU', 'RAM', 'SSD', 'HDD', 'BOARD'];
      return validTypes.includes(type) ? type : 'Unknown';
  }

  updateButtonState(): void {
    this.cdr.detectChanges(); // Force UI update
    // console.log('🚀 Button state after detection:', this.allCheckboxesChecked());
}


private validateItemsBeforeSubmission(): boolean {
  let isValid = true;
  const errors: string[] = [];

  // Validate computers
  if (this.accountabilityItem.computers?.$values) {
      this.accountabilityItem.computers.$values.forEach((computer: any) => {
          if (computer.checked && !computer.condition) {
              errors.push(`Computer ${computer.id || 'unknown'} is checked but has no condition`);
              isValid = false;
          }
      });
  }

  // Validate assets
  if (this.accountabilityItem.assets?.$values) {
      this.accountabilityItem.assets.$values.forEach((asset: any) => {
          if (asset.checked && !asset.condition) {
              errors.push(`Asset ${asset.id || 'unknown'} is checked but has no condition`);
              isValid = false;
          }
      });
  }

  // Validate components
  this.flattenedComponents.forEach((component: any) => {
      if (component.checked && !component.condition) {
          errors.push(`Component ${component.id || 'unknown'} is checked but has no condition`);
          isValid = false;
      }
  });

  if (!isValid) {
      console.error('Validation errors:', errors);
      this.snackBar.open(
          `Please fix the following issues:\n${errors.join('\n')}`,
          'Close',
          { duration: 5000 }
      );
  }

  return isValid;
}


  
}