import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountabilityService } from 'app/services/accountability/accountability.service';
import { ReturnService } from 'app/services/accountability/return.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-return-form',
  templateUrl: './return-form.component.html',
  styleUrls: ['./return-form.component.scss']
})
export class ReturnFormComponent implements OnInit {
  accountabilityItem: any;
  isSubmitting: boolean = false;
  user: User;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private route: ActivatedRoute,
    private accountabilityService: AccountabilityService,
    private returnItemService: ReturnService,
    private _userService: UserService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchAccountabilityItem(Number(id)); // Convert id to number
      }
    });

    // Subscribe to the user service to get user data
    this._userService.user$
      .pipe(takeUntil(this._unsubscribeAll)) // Auto-unsubscribe when component is destroyed
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
        }
        this.accountabilityItem = data;

        // Initialize checkbox values for computers and their assets
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
      },
      error: (error) => {
        console.error('Error fetching accountability item:', error);
        alert(`Failed to load accountability details: ${error.message}`);
      }
    });
  }

  submitReturnChecklist(): void {
    if (!this.accountabilityItem) {
      console.error('Error: Accountability item is missing.');
      alert('Error: Accountability details are not loaded.');
      return;
    }

    this.isSubmitting = true;

    try {
      // Process direct assets from accountabilityItem.assets.$values
      const assetChecklist = (this.accountabilityItem.assets?.$values ?? []).map((asset: any) => ({
        accountability_id: this.accountabilityItem.user_accountability_list?.id ?? null,
        user_id: this.user?.id ?? null, // Use the user ID from the user service
        asset_id: asset.id,
        computer_id: null,
        component_id: null,
        item_type: "Assets",
        status: asset.checked ? asset.condition : 'missing',
        remarks: asset.remarks || '',
        validated_by: 1,
      }));

      // Process computer-assigned assets
      const assignedAssetChecklist: any[] = [];
      if (this.accountabilityItem.computers?.$values) {
        for (const computer of this.accountabilityItem.computers.$values) {
          if (computer.assignedAssetDetails?.$values) {
            for (const asset of computer.assignedAssetDetails.$values) {
              assignedAssetChecklist.push({
                accountability_id: this.accountabilityItem.user_accountability_list?.id ?? null,
                user_id: this.user?.id ?? null, // Use the user ID from the user service
                asset_id: asset.id,
                computer_id: computer.id, // Link to the parent computer
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

      // Process computers
      const computerChecklist = (this.accountabilityItem.computers?.$values ?? []).map((computer: any) => ({
        accountability_id: this.accountabilityItem.user_accountability_list?.id ?? null,
        user_id: this.user?.id ?? null, // Use the user ID from the user service
        asset_id: null,
        computer_id: computer.id,
        component_id: null,
        item_type: "Computers",
        status: computer.checked ? computer.condition : 'missing',
        remarks: computer.remarks || '',
        validated_by: 1,
      }));

      // Process components - MODIFIED SECTION
      const componentChecklist: any[] = [];
      if (this.accountabilityItem.computers?.$values) {
        for (const computer of this.accountabilityItem.computers.$values) {
          if (computer.components && typeof computer.components === 'object') {
            const componentTypes = Object.keys(computer.components);
            console.log('Component types found:', componentTypes);

            for (const compType of componentTypes) {
              const componentType = computer.components[compType];
              console.log(`Components of type ${compType}:`, componentType);
              
              // Try to locate components in multiple possible locations in the structure
              let componentArray: any[] = [];
              
              // Check if components are in values.$values
              if (componentType?.values?.$values && Array.isArray(componentType.values.$values)) {
                componentArray = componentType.values.$values;
              } 
              // Check if components are directly in $values
              else if (componentType?.$values && Array.isArray(componentType.$values)) {
                componentArray = componentType.$values;
              }
              // Check if componentType itself is an array
              else if (Array.isArray(componentType)) {
                componentArray = componentType;
              }
              // Check if in .components property
              else if (componentType?.components?.$values && Array.isArray(componentType.components.$values)) {
                componentArray = componentType.components.$values;
              }
              
              console.log(`Component array for ${compType}:`, componentArray);
              
              // Process the found components
              for (const component of componentArray) {
                if (component && component.id) {
                  console.log(`Processing component: ${component.id}`, component);
                  componentChecklist.push({
                    accountability_id: this.accountabilityItem.user_accountability_list?.id ?? null,
                    user_id: this.user?.id ?? null,
                    asset_id: null,
                    computer_id: computer.id,
                    component_id: component.id,
                    item_type: "Components",
                    status: component.checked ? component.condition : 'missing',
                    remarks: component.remarks || '',
                    validated_by: 1,
                  });
                }
              }
            }
          }
        }
      }
      
      console.log('Processed component checklist:', componentChecklist);

      // Combine all checklists
      const checklist = [...assetChecklist, ...assignedAssetChecklist, ...computerChecklist, ...componentChecklist];

      console.log('Checklist items being sent:', checklist);

      if (!checklist.length) {
        throw new Error('No items to return.');
      }

      // Use Promise.all to track all API calls
      const promises: Promise<any>[] = [];

      for (const item of checklist) {
        console.log('Submitting item:', item);
        const promise = new Promise<any>((resolve, reject) => {
          this.returnItemService.createReturnItem(item).subscribe({
            next: (response) => {
              console.log('Item submitted successfully:', response);
              resolve(response);
            },
            error: (error) => {
              console.error('Error submitting item:', error);
              console.error('Request payload:', item); // Log the request payload
              reject(error);
            }
          });
        });
        promises.push(promise);
      }

      // Wait for all submissions to complete
      Promise.all(promises)
        .then(() => {
          this.isSubmitting = false;
          alert('Return process completed successfully!');
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