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
    accountabilityItem: any = { computers: { $values: [] } };
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
              console.log('Fetched accountability item:', data);
              
              if (!data) {
                  this.loading = false;
                  return;
              }
  
              this.accountabilityItem = data;
  
              // ✅ Log the entire accountability item to check its structure
              console.log('Accountability Item Structure:', this.accountabilityItem);
              console.log('Assets:', this.accountabilityItem.assets?.$values);
              console.log('Computers:', this.accountabilityItem.computers?.$values);
              
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
              
              console.log('Processed Computers Array:', computersArray);
  
              // Create deep copy safely
              try {
                  this.dataSource = new MatTableDataSource(
                      JSON.parse(JSON.stringify(computersArray))
                  );
                  console.log('DataSource initialized successfully');
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
                  console.log('Processed Assigned Assets:', assignedAssets);
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
              console.log('Initializing computer:', computer.id);
              computer.checked = false;
              computer.condition = computer.condition || 'good'; // Default condition
  
              // Initialize assigned assets
              if (computer.assignedAssetDetails?.$values) {
                  computer.assignedAssetDetails.$values.forEach((asset: any) => {
                      console.log('Initializing assigned asset:', asset.id);
                      asset.checked = false;
                      asset.condition = asset.condition || 'good';
                  });
              }
  
              // Initialize components
              if (computer.components && typeof computer.components === 'object') {
                  const componentTypes = Object.keys(computer.components);
  
                  for (const compType of componentTypes) {
                      const componentType = computer.components[compType];
                      console.log(`Initializing ${compType} components...`);
  
                      // Handle different possible component structures
                      if (componentType?.values?.$values && Array.isArray(componentType.values.$values)) {
                          componentType.values.$values.forEach((component: any) => {
                              console.log('Initializing component:', component.id);
                              component.checked = false;
                              component.condition = component.condition || 'good';
                          });
                      } else if (componentType?.$values && Array.isArray(componentType.$values)) {
                          componentType.$values.forEach((component: any) => {
                              console.log('Initializing component:', component.id);
                              component.checked = false;
                              component.condition = component.condition || 'good';
                          });
                      } else if (Array.isArray(componentType)) {
                          componentType.forEach((component: any) => {
                              console.log('Initializing component:', component.id);
                              component.checked = false;
                              component.condition = component.condition || 'good';
                          });
                      }
                  }
              }
          });
      }
  
      // Initialize direct assets
      if (this.accountabilityItem.assets?.$values) {
          this.accountabilityItem.assets.$values.forEach((asset: any) => {
              console.log('Initializing direct asset:', asset.id);
              asset.checked = false;
              asset.condition = asset.condition || 'good';
          });
      }
  
      console.log('Checkbox initialization complete');
      this.cdr.detectChanges(); // Force UI update
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

    this.isSubmitting = true;

    try {
        console.log('Starting checklist submission...');

        // ✅ Ensure assets and computers data exist
        console.log('Assets:', this.accountabilityItem.assets?.$values);
        console.log('Computers:', this.accountabilityItem.computers?.$values);

        // ✅ Process direct assets
        const assetChecklist = (this.accountabilityItem.assets?.$values ?? []).map((asset: any) => {
            const assetItem = {
                accountability_id: this.accountabilityItem.user_accountability_list?.id ?? null,
                user_id: this.user?.id ?? null,
                asset_id: asset.id,
                computer_id: null,
                component_id: null,
                item_type: 'Assets',
                status: asset.checked !== undefined ? (asset.checked ? asset.condition : 'missing') : 'unchecked',
                remarks: asset.remarks || '',
                validated_by: 1,
            };
            console.log('Processing asset:', assetItem);
            return assetItem;
        });

        // ✅ Process assigned assets from computers
        const assignedAssetChecklist: any[] = [];
        if (this.accountabilityItem.computers?.$values) {
            for (const computer of this.accountabilityItem.computers.$values) {
                if (computer.assignedAssetDetails?.$values) {
                    for (const asset of computer.assignedAssetDetails.$values) {
                        const assignedAssetItem = {
                            accountability_id: this.accountabilityItem.user_accountability_list?.id ?? null,
                            user_id: this.user?.id ?? null,
                            asset_id: asset.id,
                            computer_id: computer.id,
                            component_id: null,
                            item_type: 'Assets',
                            status: asset.checked !== undefined ? (asset.checked ? asset.condition : 'missing') : 'unchecked',
                            remarks: asset.remarks || '',
                            validated_by: 1,
                        };
                        console.log('Processing assigned asset:', assignedAssetItem);
                        assignedAssetChecklist.push(assignedAssetItem);
                    }
                }
            }
        }

        // ✅ Process computers
        const computerChecklist = (this.accountabilityItem.computers?.$values ?? []).map((computer: any) => {
            const computerItem = {
                accountability_id: this.accountabilityItem.user_accountability_list?.id ?? null,
                user_id: this.user?.id ?? null,
                asset_id: null,
                computer_id: computer.id,
                component_id: null,
                item_type: 'Computers',
                status: computer.checked !== undefined ? (computer.checked ? computer.condition : 'missing') : 'unchecked',
                remarks: computer.remarks || '',
                validated_by: 1,
            };
            console.log('Processing computer:', computerItem);
            return computerItem;
        });

        // ✅ Process components
        const componentChecklist = this.flattenedComponents.map((component) => {
            const componentItem = {
                accountability_id: this.accountabilityItem.user_accountability_list?.id ?? null,
                user_id: this.user?.id ?? null,
                asset_id: null,
                computer_id: component.computer_id,
                component_id: component.id,
                item_type: 'Components',
                status: component.checked !== undefined ? (component.checked ? component.condition : 'missing') : 'unchecked',
                remarks: component.remarks || '',
                validated_by: 1,
            };
            console.log('Processing component:', componentItem);
            return componentItem;
        });

        // ✅ Combine all checklists
        const checklist = [...assetChecklist, ...assignedAssetChecklist, ...computerChecklist, ...componentChecklist];
        console.log('Final checklist to be submitted:', checklist);

        if (!checklist.length) {
            throw new Error('No items to return.');
        }

        // ✅ Send data to API with better error handling
        const promises: Promise<any>[] = checklist.map((item) =>
            new Promise<any>((resolve) => {
                console.log(`Submitting item of type ${item.item_type}:`, item);
                this.returnItemService.createReturnItem(item).subscribe({
                    next: (response) => {
                        console.log('Successfully submitted item:', {
                            type: item.item_type,
                            id: item.computer_id || item.asset_id || item.component_id,
                            response,
                        });
                        resolve(response);
                    },
                    error: (error) => {
                        console.error('Failed to submit item:', {
                            type: item.item_type,
                            id: item.computer_id || item.asset_id || item.component_id,
                            error,
                        });
                        resolve(null); // ✅ Ensures Promise.all() continues even if one item fails
                    },
                });
            })
        );

        // ✅ Handle API responses
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
    console.log('🚀 Button state after detection:', this.allCheckboxesChecked());
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
