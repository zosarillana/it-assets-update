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
    accountabilityItem: any = {
        computers: { $values: [] },
        assets: { $values: [] },
    };
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
                const computersArray = Array.isArray(
                    this.accountabilityItem.computers
                )
                    ? this.accountabilityItem.computers
                    : this.accountabilityItem.computers?.$values
                    ? this.accountabilityItem.computers.$values
                    : [];

                // console.log('Processed Computers Array:', computersArray);

                // ✅ Check the structure of components data
                const componentsArray = computersArray.flatMap((computer) => {
                    const {
                        BOARD,
                        HDD,
                        RAM,
                        SSD,
                        GPU,
                        PSU,
                        CPU,
                        CPU_FAN,
                        CD_ROM,
                        BATTERY,
                    } = computer.components;
                    return [
                        ...(BOARD || []),
                        ...(HDD || []),
                        ...(RAM || []),
                        ...(SSD || []),
                        ...(GPU || []),
                        ...(PSU || []),
                        ...(CPU || []),
                        ...(CPU_FAN || []),
                        ...(CD_ROM || []),
                        ...(BATTERY || []),
                    ];
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
                    this.assetDataSource = new MatTableDataSource(
                        assignedAssets
                    );
                } catch (e) {
                    console.error('Error processing assigned assets:', e);
                    this.assetDataSource = new MatTableDataSource([]);
                }

                this.loading = false;
            },
            error: (error) => {
                alert(
                    `Failed to load accountability details: ${error.message}`
                );
                this.loading = false;
            },
        });
    }

    initializeCheckboxValues(): void {
        // Initialize computers
        if (this.accountabilityItem.computers?.$values) {
            this.accountabilityItem.computers.$values.forEach(
                (computer: any) => {
                    computer.checked = false;
                    computer.condition = computer.condition || 'good';

                    // Initialize assigned assets
                    if (computer.assignedAssetDetails?.$values) {
                        computer.assignedAssetDetails.$values.forEach(
                            (asset: any) => {
                                asset.checked = false;
                                asset.condition = asset.condition || 'good';
                            }
                        );
                    }

                    // Initialize components
                    if (
                        computer.components &&
                        typeof computer.components === 'object'
                    ) {
                        Object.keys(computer.components).forEach((compType) => {
                            const componentType = computer.components[compType];
                            if (Array.isArray(componentType)) {
                                componentType.forEach((component: any) => {
                                    component.checked = false;
                                    component.condition =
                                        component.condition || 'good';
                                });
                            }
                        });
                    }
                }
            );
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
        const allAssetsChecked =
            assets.length === 0 || assets.every((a) => a.checked);

        // Check if all assigned assets are checked
        const allAssignedAssetsChecked =
            assignedAssets.length === 0 ||
            assignedAssets.every((a) => a.checked);

        // Check if all computers are checked
        const allComputersChecked =
            computers.length === 0 || computers.every((c) => c.checked);

        // Check if all components are checked
        const allComponentsChecked =
            components.length === 0 || components.every((c) => c.checked);

        const result =
            allAssetsChecked &&
            allAssignedAssetsChecked &&
            allComputersChecked &&
            allComponentsChecked;

        return result;
    }

    flattenComponents(): void {
        this.flattenedComponents = [];

        if (this.accountabilityItem?.computers?.length) {
            this.accountabilityItem.computers.forEach((computer) => {
                Object.keys(computer.components).forEach((componentType) => {
                    if (Array.isArray(computer.components[componentType])) {
                        computer.components[componentType].forEach(
                            (component) => {
                                // Add reference to the original component
                                component.type = componentType; // Add component type
                                this.flattenedComponents.push(component);
                            }
                        );
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
            // Prepare the return payload
            const returnPayload = {
                accountability_id:
                    this.accountabilityItem.user_accountability_list?.id ??
                    null,
                items_to_return: [] as any[],
            };

            // Process computers
            if (
                this.accountabilityItem.computers &&
                Array.isArray(this.accountabilityItem.computers)
            ) {
                for (const computer of this.accountabilityItem.computers) {
                    if (computer.checked) {
                        returnPayload.items_to_return.push({
                            item_type: 'Computer',
                            item_id: computer.id,
                            remarks: computer.remarks || 'Returned for repairs',
                            status: computer.condition || 'Damaged',
                            validated_by: this.user.id,
                            return_date: new Date().toISOString(),
                        });
                    }
                }
            }

            // Process assets (both direct and assigned)
            // Direct assets
            if (this.accountabilityItem.assets?.$values) {
                for (const asset of this.accountabilityItem.assets.$values) {
                    if (asset.checked) {
                        returnPayload.items_to_return.push({
                            item_type: 'Asset',
                            item_id: asset.id,
                            remarks: asset.remarks || 'Returned asset',
                            status: asset.condition || 'Damaged',
                            validated_by: this.user.id,
                            return_date: new Date().toISOString(),
                        });
                    }
                }
            }

            // Assigned assets (from computers)
            if (
                this.accountabilityItem.computers &&
                Array.isArray(this.accountabilityItem.computers)
            ) {
                for (const computer of this.accountabilityItem.computers) {
                    if (
                        computer.assignedAssetDetails &&
                        Array.isArray(computer.assignedAssetDetails)
                    ) {
                        for (const asset of computer.assignedAssetDetails) {
                            if (asset.checked) {
                                returnPayload.items_to_return.push({
                                    item_type: 'Asset',
                                    item_id: asset.id,
                                    remarks: asset.remarks || 'Returned asset',
                                    status: asset.condition || 'Damaged',
                                    validated_by: this.user.id,
                                    return_date: new Date().toISOString(),
                                });
                            }
                        }
                    }
                }
            }

            // Process components
            for (const component of this.flattenedComponents) {
                if (component.checked) {
                    returnPayload.items_to_return.push({
                        item_type: 'Component',
                        item_id: component.id,
                        remarks:
                            component.remarks ||
                            `Returned ${component.type.toLowerCase()}`,
                        status: component.condition || 'Damaged',
                        validated_by: this.user.id,
                        return_date: new Date().toISOString(),
                    });
                }
            }

            console.log('Final return payload:', returnPayload);

            if (!returnPayload.items_to_return.length) {
                throw new Error('No items selected for return.');
            }

            // Send data to API
            this.returnItemService.createReturnItem(returnPayload).subscribe({
                next: (response) => {
                    this.isSubmitting = false;
                    this.snackBar.open(
                        'Return process completed successfully!',
                        'Close',
                        {
                            duration: 3000,
                        }
                    );
                    this.router.navigate(['/assets/accountability']);
                },
                error: (error) => {
                    console.error('Failed to submit return:', error);
                    this.snackBar.open(
                        `Error during submission: ${error.message}`,
                        'Close',
                        {
                            duration: 5000,
                        }
                    );
                    this.isSubmitting = false;
                },
            });
        } catch (error: any) {
            console.error(
                'Unexpected error while preparing return checklist:',
                error
            );
            this.snackBar.open(`Unexpected error: ${error.message}`, 'Close', {
                duration: 5000,
            });
            this.isSubmitting = false;
        }
    }

    getComponentType(type: string): string {
        const validTypes = [
            'GPU',
            'RAM',
            'SSD',
            'HDD',
            'BOARD',
            'PSU',
            'CPU',
            'CPU FAN',
            'CD ROM',
            'BATTERY',
        ];
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
            this.accountabilityItem.computers.$values.forEach(
                (computer: any) => {
                    if (computer.checked && !computer.condition) {
                        errors.push(
                            `Computer ${
                                computer.id || 'unknown'
                            } is checked but has no condition`
                        );
                        isValid = false;
                    }
                }
            );
        }

        // Validate assets
        if (this.accountabilityItem.assets?.$values) {
            this.accountabilityItem.assets.$values.forEach((asset: any) => {
                if (asset.checked && !asset.condition) {
                    errors.push(
                        `Asset ${
                            asset.id || 'unknown'
                        } is checked but has no condition`
                    );
                    isValid = false;
                }
            });
        }

        // Validate components
        this.flattenedComponents.forEach((component: any) => {
            if (component.checked && !component.condition) {
                errors.push(
                    `Component ${
                        component.id || 'unknown'
                    } is checked but has no condition`
                );
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
