import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { AccountabilityApprovalService } from 'app/services/accountability/accountability-approval.service';
import { AccountabilityService } from 'app/services/accountability/accountability.service';
import { UsersService } from 'app/services/user/users.service';

// Interfaces
interface Accountability {
    $id: string;
    user_accountability_list: { id?: number };
    owner: any;
    assets: {
        $id: string;
        $values: AssetData[];
    };
    computers: {
        $id: string;
        $values: ComputerData[];
    };
}

interface AssetData {
    id: number;
    type: string;
    asset_barcode: string;
    brand: string;
    model: string;
    date_created: string;
    history: {
        $id: string;
        $values: string[];
    };
    is_deleted: boolean;
}

interface AssignedAssetData {
    id: number;
    type: string;
    asset_barcode: string;
    brand: string;
    model: string;
    date_acquired: string;
    status: string;
}

interface ComputerData {
    id: number;
    type: string;
    asset_barcode: string;
    brand: string;
    model: string;
    date_created: string;
    history: {
        $id: string;
        $values: string[];
    };
    is_deleted: boolean;
    assignedAssetDetails?: { 
        $id: string;
        $values: AssignedAssetData[];
    };
    components?: {
        ram?: ComponentData;
        ssd?: ComponentData;
        hdd?: ComponentData;
        gpu?: ComponentData;
        board?: ComponentData;
    };
}

interface ComponentData {
    idProperty: string;
    values: {
        $id: string;
        $values: ComponentDetail[];
    };
}

interface ComponentDetail {
    id: number;
    description: string;
    uid: string;
    status: string;
}

@Component({
    selector: 'app-accountability-form',
    templateUrl: './accountability-form.component.html',
    styleUrls: ['./accountability-form.component.scss'],
})
export class AccountabilityFormComponent implements OnInit {
    displayedColumns: string[] = [
        'type',
        'dateAcquired',
        'assetBarcode',
        'brand',
        'model',
        'personalHistory',
        'status',
    ];

    dataSourceAssets = new MatTableDataSource<AssetData>();
    dataSourceComputers = new MatTableDataSource<ComputerData>();
    dataSourceAssignedAssets = new MatTableDataSource<AssignedAssetData>();
    dataSourceAssignedComponents = new MatTableDataSource<ComponentDetail>();

    constructor(
        private route: ActivatedRoute,
        private _service: AccountabilityService,
        private accountabilityApprovalService: AccountabilityApprovalService,
        private usersService: UsersService
    ) {}

    @ViewChild('paginatorAssets') paginatorAssets!: MatPaginator;
    @ViewChild('paginatorComputers') paginatorComputers!: MatPaginator;
    @ViewChild('paginatorAssignedAssets') paginatorAssignedAssets!: MatPaginator;
    @ViewChild('paginator1') paginator1!: MatPaginator;
    @ViewChild('paginator2') paginator2!: MatPaginator;
    @ViewChild('sort1') sort1!: MatSort;
    @ViewChild('sort2') sort2!: MatSort;

    asset!: Accountability;
    userId!: number;
    accountabilityApproval: any = null;


    ngOnInit() {
        // Get current user first
        this.usersService.getCurrentUser().subscribe({
            next: (user: any) => {
                this.userId = user.id;
                console.log('Current User ID:', this.userId);
                
                // After getting user, fetch accountability data
                this.loadAccountabilityData();
            },
            error: (err) => console.error('Error fetching user', err),
        });
    }
    
    loadAccountabilityData() {
        const id = Number(this.route.snapshot.paramMap.get('id'));

        if (id) {
            this._service.getAccountabilityById(id).subscribe({
                next: (data: any) => {
                    console.log('Fetched Data:', data);
                    this.asset = data;

                    console.log('Accountability ID from API:', data.user_accountability_list?.id);
                    if (data.$id) {
                        this.asset.$id = data.$id;
                    } else {
                        console.error('Accountability ID is missing in the API response');
                    }

                    if (this.asset?.assets?.$values?.length) {
                        this.dataSourceAssets.data = this.asset.assets.$values;
                    }
                    console.log('Assets Data Source:', this.dataSourceAssets.data);

                    if (this.asset?.computers?.$values?.length) {
                        this.dataSourceComputers.data = this.asset.computers.$values;
                    }
                    console.log('Computers Data Source:', this.dataSourceComputers.data);

                    let assignedAssets: AssignedAssetData[] = [];
                    this.asset.computers?.$values.forEach((computer) => {
                        if (computer.assignedAssetDetails?.$values?.length) {
                            assignedAssets.push(...computer.assignedAssetDetails.$values);
                        }
                    });
                    this.dataSourceAssignedAssets.data = assignedAssets;
                    console.log('Assigned Assets Data Source:', this.dataSourceAssignedAssets.data);

                    let assignedComponents: ComponentDetail[] = [];
                    this.asset.computers?.$values.forEach((computer) => {
                        const componentTypes = ['ram', 'ssd', 'hdd', 'gpu', 'board'];
                        componentTypes.forEach(type => {
                            const componentData = computer.components?.[type];
                            if (componentData?.values?.$values?.length) {
                                assignedComponents.push(...componentData.values.$values.map(component => ({
                                    ...component,
                                    type: type.toUpperCase()
                                })));
                            }
                        });
                    });
                    this.dataSourceAssignedComponents.data = assignedComponents;
                    console.log('Assigned Components Data Source:', this.dataSourceAssignedComponents.data);
                    
                    // Now that we have the asset data, fetch accountability approval
                    this.getAccountabilityApproval();
                },
                error: (err) => console.error('Error fetching asset', err),
            });
        }
    }

    getAccountabilityApproval(): void {
        const accountabilityId = this.asset?.user_accountability_list?.id 
            ? Number(this.asset.user_accountability_list.id) 
            : null;
    
        console.log('Accountability ID:', accountabilityId, typeof accountabilityId);
    
        if (!accountabilityId || isNaN(accountabilityId)) {
            console.error('❌ Accountability ID is missing');
            return;
        }
    
        this.accountabilityApprovalService.getByAccountabilityId(accountabilityId).subscribe(
            response => {
                console.log('✅ Accountability approval data received:', response);
                console.log('🔎 Checking properties:', {
                    checkedByUser: response?.checkedByUser,
                    receivedByUser: response?.receivedByUser,
                    confirmedByUser: response?.confirmedByUser
                });
    
                this.accountabilityApproval = response;
            },
            error => {
                console.error('❌ Error fetching accountability approval:', error);
            }
        );
    }
    

    printForm() {
        const printContents =
            document.getElementById('printableArea')?.innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContents || '';
        window.print();
        document.body.innerHTML = originalContents;
    }

    checkByUser(): void {
        const accountabilityId = this.asset?.user_accountability_list?.id 
            ? Number(this.asset.user_accountability_list.id) 
            : null;
    
        const userId = String(this.userId);
    
        console.log('Accountability ID from API:', accountabilityId, typeof accountabilityId);
        console.log('User ID:', userId, typeof userId);
    
        if (!accountabilityId || isNaN(accountabilityId) || !userId) {
            console.error('Accountability ID or User ID is missing');
            return;
        }
    
        this.accountabilityApprovalService.checkByUser(accountabilityId, userId).subscribe(
            response => {
                console.log('Check by User response:', response);
                // Refresh approval data after successful check
                this.getAccountabilityApproval();
            },
            error => {
                console.error('Error:', error);
            }
        );
    }
    
    receiveByUser(): void {
        const id = this.accountabilityApproval?.id; // ✅ Use the correct primary key ID
        const userId = String(this.userId);
        
        console.log('ID for receive:', id, typeof id);
        console.log('User ID for receive:', userId, typeof userId);
        
        if (!id || isNaN(id) || !userId) {
            console.error('ID or User ID is missing for receive');
            return;
        }
    
        this.accountabilityApprovalService.receiveByUser(id, userId).subscribe(
            response => {
                console.log('Received by User response:', response);
                this.getAccountabilityApproval(); // Refresh after success
            },
            error => {
                console.error('Error in receive:', error);
            }
        );
    }
    
    confirmByUser(): void {
        const id = this.accountabilityApproval?.id; // ✅ Use the correct primary key ID
        const userId = String(this.userId);
        
        console.log('Accountability ID for confirm:', id, typeof id);
        console.log('User ID for confirm:', userId, typeof userId);
        
        if (!id || isNaN(id) || !userId) {
            console.error('Accountability ID or User ID is missing for confirm');
            return;
        }
    
        this.accountabilityApprovalService.confirmByUser(id, userId).subscribe(
            response => {
                console.log('Confirmed by User response:', response);
                this.getAccountabilityApproval(); // Refresh after success
            },
            error => {
                console.error('Error in confirm:', error);
            }
        );
    }
    
}