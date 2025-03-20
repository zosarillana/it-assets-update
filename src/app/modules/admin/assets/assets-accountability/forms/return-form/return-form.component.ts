import { Component, OnInit } from '@angular/core';
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
  styleUrls: ['./return-form.component.scss']
})
export class ReturnFormComponent implements OnInit {
  asset: any;
  accountabilityItem: any = { computers: { $values: [] } };
  isSubmitting: boolean = false;
  user: User;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

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
    private router: Router
  ) { }

  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchAccountabilityItem(Number(id));
      }
    });

    this._userService.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user: User) => {
        this.user = user;
        console.log('🟢 User data loaded:', user);
      });
  }

  fetchAccountabilityItem(id: number): void {
    this.accountabilityService.getAccountabilityById(id).subscribe({
      next: (data) => {
        if (!data) {
          console.error('Error: Received null or undefined accountability data.');
          return;
        }
  
        this.accountabilityItem = data;
        console.log('✅ Accountability Item:', JSON.stringify(this.accountabilityItem, null, 2));
  
        // Initialize checkbox values for computers and their components
        this.initializeCheckboxValues();
  
        // Separate deep copies for both tables
        this.flattenComponents();
        this.dataSource = new MatTableDataSource(
          JSON.parse(JSON.stringify(this.accountabilityItem.computers.$values)) // Deep copy for computers
        );

        // Extract assigned assets from each computer and populate assetDataSource
        const assignedAssets = this.accountabilityItem.computers.$values.flatMap((computer: any) => computer.assignedAssetDetails?.$values ?? []);
        console.log('✅ Assigned Assets:', assignedAssets);

        this.assetDataSource = new MatTableDataSource(assignedAssets);
        console.log('✅ Asset Data Source:', this.assetDataSource.data);
      },
      error: (error) => {
        console.error('Error fetching accountability item:', error);
        alert(`Failed to load accountability details: ${error.message}`);
      }
    });
  }

  initializeCheckboxValues(): void {
    this.accountabilityItem.computers?.$values?.forEach((computer: any) => {
      computer.checked = false; // Default value for checkboxes
      
      // Initialize assigned assets
      computer.assignedAssetDetails?.$values?.forEach((asset: any) => {
        asset.checked = false; // Default value for assets
      });
      
      // Initialize components with checked property
      if (computer.components && typeof computer.components === 'object') {
        const componentTypes = Object.keys(computer.components);
        
        for (const compType of componentTypes) {
          const componentType = computer.components[compType];
          
          // Handle different possible component structures
          if (componentType?.values?.$values && Array.isArray(componentType.values.$values)) {
            componentType.values.$values.forEach((component: any) => {
              component.checked = false; // Initialize component checkbox
            });
          } else if (componentType?.$values && Array.isArray(componentType.$values)) {
            componentType.$values.forEach((component: any) => {
              component.checked = false;
            });
          } else if (Array.isArray(componentType)) {
            componentType.forEach((component: any) => {
              component.checked = false;
            });
          }
        }
      }
    });
    
    // Initialize direct assets
    this.accountabilityItem.assets?.$values?.forEach((asset: any) => {
      asset.checked = false;
    });
  }

  allCheckboxesChecked(): boolean {
    // Check if there are no assets or computers to validate
    if ((!this.accountabilityItem.assets?.$values || this.accountabilityItem.assets.$values.length === 0) &&
        (!this.accountabilityItem.computers?.$values || this.accountabilityItem.computers.$values.length === 0)) {
      return false;
    }
  
    // Check if all assets are checked
    const allAssetsChecked = !this.accountabilityItem.assets?.$values?.length || 
      this.accountabilityItem.assets.$values.every((asset: any) => asset.checked);
  
    // Check if all assigned assets are checked
    const allAssignedAssetsChecked = !this.assetDataSource?.data.length || 
      this.assetDataSource?.data.every((asset: any) => asset.checked);
  
    // Check if all computers are checked
    const allComputersChecked = !this.accountabilityItem.computers?.$values?.length || 
      this.accountabilityItem.computers.$values.every((computer: any) => computer.checked);
  
    // Check if all components are checked
    const allComponentsChecked = !this.flattenedComponents.length || 
      this.flattenedComponents.every((component: any) => component.checked);
  
    return allAssetsChecked && allAssignedAssetsChecked && allComputersChecked && allComponentsChecked;
  }
  
  flattenComponents(): void {
    this.flattenedComponents = [];

    if (this.accountabilityItem?.computers?.$values) {
      this.accountabilityItem.computers.$values.forEach(computer => {
        ['RAM', 'SSD', 'HDD', 'GPU', 'BOARD'].forEach(componentType => {
          if (computer.components?.[componentType]?.$values?.length > 0) {
            computer.components[componentType].$values.forEach(component => {
              this.flattenedComponents.push({
                componentType,
                computer_id: computer.id, // ✅ Make sure each component knows which computer it belongs to
                ...JSON.parse(JSON.stringify(component)) // Deep copy each component
              });
            });
          }
        });
      });
    }

    console.log("✅ Flattened Components Data:", this.flattenedComponents);
  }

  submitReturnChecklist(): void {
    console.log("🔍 Debug: Flattened Components:", this.flattenedComponents);

    if (!this.accountabilityItem) {
      console.error('Error: Accountability item is missing.');
      alert('Error: Accountability details are not loaded.');
      return;
    }

    this.isSubmitting = true;

    try {
      // ✅ Process direct assets
      const assetChecklist = (this.accountabilityItem.assets?.$values ?? []).map((asset: any) => ({
        accountability_id: this.accountabilityItem.user_accountability_list?.id ?? null,
        user_id: this.user?.id ?? null,
        asset_id: asset.id,
        computer_id: null,
        component_id: null,
        item_type: "Assets",
        status: asset.checked ? asset.condition : 'missing',
        remarks: asset.remarks || '',
        validated_by: 1,
      }));

      // ✅ Process assigned assets from computers
      const assignedAssetChecklist: any[] = [];
      if (this.accountabilityItem.computers?.$values) {
        for (const computer of this.accountabilityItem.computers.$values) {
          if (computer.assignedAssetDetails?.$values) {
            for (const asset of computer.assignedAssetDetails.$values) {
              assignedAssetChecklist.push({
                accountability_id: this.accountabilityItem.user_accountability_list?.id ?? null,
                user_id: this.user?.id ?? null,
                asset_id: asset.id,
                computer_id: computer.id,
                component_id: null,
                item_type: "Assets",
                status: asset.checked ? asset.condition : 'missing',
                remarks: asset.remarks || '',
                validated_by: 1,
              });
            }
          }
        }
      }

      // ✅ Process computers
      const computerChecklist = (this.accountabilityItem.computers?.$values ?? []).map((computer: any) => ({
        accountability_id: this.accountabilityItem.user_accountability_list?.id ?? null,
        user_id: this.user?.id ?? null,
        asset_id: null,
        computer_id: computer.id,
        component_id: null,
        item_type: "Computers",
        status: computer.checked ? computer.condition : 'missing',
        remarks: computer.remarks || '',
        validated_by: 1,
      }));

      // ✅ Process components  
      const componentChecklist = this.flattenedComponents.map(component => ({
        accountability_id: this.accountabilityItem.user_accountability_list?.id ?? null,
        user_id: this.user?.id ?? null,
        asset_id: null,
        computer_id: component.computer_id,
        component_id: component.id,
        item_type: "Components",
        status: component.checked ? component.condition : 'missing',
        remarks: component.remarks || '',
        validated_by: 1,
      }));

      // ✅ Combine all checklists  
      const checklist = [...assetChecklist, ...assignedAssetChecklist, ...computerChecklist, ...componentChecklist];

      console.log('Checklist items being sent:', checklist);

      if (!checklist.length) {
        throw new Error('No items to return.');
      }

      // ✅ Send data to API
      const promises: Promise<any>[] = checklist.map(item =>
        new Promise<any>((resolve, reject) => {
          this.returnItemService.createReturnItem(item).subscribe({
            next: (response) => {
              console.log('Item submitted successfully:', response);
              resolve(response);
            },
            error: (error) => {
              console.error('Error submitting item:', error);
              reject(error);
            }
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
          alert(`Error during submission: ${error.message}`);
          this.isSubmitting = false;
        });

    } catch (error: any) {
      console.error('Unexpected error while preparing return checklist:', error);
      alert(`Unexpected error: ${error.message}`);
      this.isSubmitting = false;
    }
  }
}