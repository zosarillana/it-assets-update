import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { AccountabilityService } from 'app/services/accountability/accountability.service';
import { PdfService } from 'app/services/pdf.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas'; // ✅ Import it properly
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AccountabilityApprovalService } from 'app/services/accountability/accountability-approval.service';
import { MatSnackBar } from '@angular/material/snack-bar';

// Interfaces
interface Accountability {
    // userAccountabilityList: any;
    owner: any;
    assets: {
        $id: string;
        $values: AssetData[];
    };
    computers: {
        $id: string;
        $values: ComputerData[];
    };
    user_accountability_list: { id?: number };
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
    user: User;
    dataSourceAssets = new MatTableDataSource<AssetData>();
    dataSourceComputers = new MatTableDataSource<ComputerData>();
    dataSourceAssignedAssets = new MatTableDataSource<AssignedAssetData>();
    dataSourceAssignedComponents = new MatTableDataSource<ComponentDetail>();
    datenow: string;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        private route: ActivatedRoute,
        private _service: AccountabilityService,
        private pdfService: PdfService,
        private _userService: UserService,
        private accountabilityApprovalService: AccountabilityApprovalService,
        private snackBar: MatSnackBar
    ) {}

    @ViewChild('paginatorAssets') paginatorAssets!: MatPaginator;
    @ViewChild('paginatorComputers') paginatorComputers!: MatPaginator;
    @ViewChild('paginatorAssignedAssets')
    paginatorAssignedAssets!: MatPaginator;

    @ViewChild('paginator1') paginator1!: MatPaginator;
    @ViewChild('paginator2') paginator2!: MatPaginator;
    @ViewChild('sort1') sort1!: MatSort;
    @ViewChild('sort2') sort2!: MatSort;

    //pdf
    @ViewChild('pdfFormArea') pdfFormArea!: ElementRef;
    @ViewChild('acknowledgmentSection') acknowledgmentSection!: ElementRef;
    asset!: Accountability;

    ngOnInit() {
        this.getAccountabilityApproval(); // Load data automatically on component initialization
    
        this.datenow = new Date().toLocaleString(); // You can adjust this format
    
        // Subscribe to the user service to get user data
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll)) // Auto-unsubscribe when component is destroyed
            .subscribe((user: User) => {
                this.user = user;
                this.userId = user?.id ? Number(user.id) : null; // Convert to number
                console.log('🟢 User data loaded:', user);
            });
    
        const id = Number(this.route.snapshot.paramMap.get('id'));
    
        if (id) {
            this._service.getAccountabilityById(id).subscribe({
                next: (data: any) => {
                    console.log('Fetched Data:', data);
                    this.asset = data;
    
                    if (this.asset?.assets?.$values?.length) {
                        this.dataSourceAssets.data = this.asset.assets.$values;
                    }
                    console.log('Assets Data Source:', this.dataSourceAssets.data);
    
                    if (this.asset?.computers?.$values?.length) {
                        this.dataSourceComputers.data = this.asset.computers.$values;
                    }
                    console.log('Computers Data Source:', this.dataSourceComputers.data);
    
                    if (this.asset?.user_accountability_list?.id) {
                        console.log("✅ Accountability ID Loaded:", this.asset.user_accountability_list.id);
                        this.getAccountabilityApproval(); // Call here!
                    }
    
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
                        componentTypes.forEach((type) => {
                            const componentData = computer.components?.[type];
                            if (componentData?.values?.$values?.length) {
                                assignedComponents.push(
                                    ...componentData.values.$values.map((component) => ({
                                        ...component,
                                        type: type.toUpperCase(),
                                    }))
                                );
                            }
                        });
                    });
                    this.dataSourceAssignedComponents.data = assignedComponents;
                    console.log('Assigned Components Data Source:', this.dataSourceAssignedComponents.data);
                },
                error: (err) => console.error('Error fetching asset', err),
            });
        }
    }

    // Function to generate the PDF
    pdfForm(): void {
        setTimeout(() => {
            if (this.pdfFormArea && this.acknowledgmentSection) {
                // First, convert both sections to canvas
                Promise.all([
                    html2canvas(this.pdfFormArea.nativeElement, {
                        scale: 2,
                        useCORS: true,
                    }),
                    html2canvas(this.acknowledgmentSection.nativeElement, {
                        scale: 2,
                        useCORS: true,
                    }),
                ])
                    .then(([mainCanvas, ackCanvas]) => {
                        const mainImgData = mainCanvas.toDataURL('image/png');
                        const ackImgData = ackCanvas.toDataURL('image/png');

                        const pdf = new jsPDF({
                            orientation: 'portrait',
                            unit: 'px',
                            format: 'a4',
                        });

                        // Define margin and usable page dimensions
                        const margin = 20;
                        const pageWidth = pdf.internal.pageSize.getWidth();
                        const pageHeight = pdf.internal.pageSize.getHeight();
                        const usableWidth = pageWidth - 2 * margin;
                        const usableHeight = pageHeight - 2 * margin;

                        // Calculate scaled dimensions for main content
                        const mainRatio = usableWidth / mainCanvas.width;
                        const mainHeight = mainCanvas.height * mainRatio;

                        // Calculate scaled dimensions for acknowledgment content
                        const ackRatio = usableWidth / ackCanvas.width;
                        const ackHeight = ackCanvas.height * ackRatio;

                        // Check if both sections can fit on one page
                        if (mainHeight + ackHeight <= usableHeight) {
                            // Both sections fit on one page
                            // Add main content at the top
                            pdf.addImage(
                                mainImgData,
                                'PNG',
                                margin,
                                margin,
                                usableWidth,
                                mainHeight
                            );

                            // Add acknowledgment section below the main content with a small gap
                            const ackYPosition = margin + mainHeight + 10; // 10px gap between sections
                            pdf.addImage(
                                ackImgData,
                                'PNG',
                                margin,
                                ackYPosition,
                                usableWidth,
                                ackHeight
                            );
                        } else {
                            // Sections don't fit on one page, place on separate pages

                            // Add main content on first page
                            pdf.addImage(
                                mainImgData,
                                'PNG',
                                margin,
                                margin,
                                usableWidth,
                                mainHeight
                            );

                            // If main content overflows, handle pagination
                            if (mainHeight > usableHeight) {
                                let remainingHeight = mainHeight - usableHeight;
                                let offsetY = usableHeight;

                                while (remainingHeight > 0) {
                                    pdf.addPage();
                                    pdf.addImage(
                                        mainImgData,
                                        'PNG',
                                        margin,
                                        -offsetY + margin,
                                        usableWidth,
                                        mainHeight
                                    );
                                    offsetY += usableHeight;
                                    remainingHeight -= usableHeight;
                                }
                            }

                            // Add acknowledgment on a new page
                            pdf.addPage();
                            pdf.addImage(
                                ackImgData,
                                'PNG',
                                margin,
                                margin,
                                usableWidth,
                                ackHeight
                            );
                        }

                        // Save the PDF
                        pdf.save('accountability-form.pdf');
                    })
                    .catch((error) => {
                        console.error('Error generating PDF:', error);
                    });
            } else {
                console.error('Required elements not found');
            }
        }, 500);
    }

    // Handle content overflow and move to next page if necessary
    private handleOverflow(): void {
        const pdfFormArea = document.querySelector('#pdfFormArea');

        if (pdfFormArea) {
            // Function to check if an element overflows
            function isOverflowing(element: Element): boolean {
                return (
                    element.scrollHeight > element.clientHeight ||
                    element.scrollWidth > element.clientWidth
                );
            }

            if (isOverflowing(pdfFormArea)) {
                // Forcing page break by adding a CSS class or dynamically splitting content
                // If needed, you can add more complex logic here to split your content
                pdfFormArea.classList.add('page-break'); // Custom class to handle page breaks
            }
        } else {
            console.error('pdfFormArea element not found');
        }
    }

    printForm() {
        const printContents =
            document.getElementById('printableArea')?.innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContents || '';
        window.print();
        document.body.innerHTML = originalContents;
    }

    //Approving document
    userId!: number;
    accountabilityApproval: any = null;

    setAsset(data: any) {
        this.asset = data;
        
        if (this.asset?.user_accountability_list?.id) {
            console.log("✅ Accountability ID Loaded:", this.asset.user_accountability_list.id);
            this.getAccountabilityApproval(); // Call here!
        }
    }

 getAccountabilityApproval(): void {
    const accountabilityId = this.asset?.user_accountability_list?.id
        ? Number(this.asset.user_accountability_list.id)
        : null;

    if (!accountabilityId || isNaN(accountabilityId)) {
        return;
    }

    this.accountabilityApprovalService.getByAccountabilityId(accountabilityId).subscribe(
        (response) => {
            if (!response || (Array.isArray(response) && response.length === 0)) {
                return;
            }

            // If response is an array, filter to get the correct entry
            this.accountabilityApproval = Array.isArray(response)
                ? response.find((item) => item.accountability_id === accountabilityId)
                : response;

            // Ensure checkedByUser is correctly assigned
            if (this.accountabilityApproval?.checked_by_user_id) {
                this.accountabilityApproval.checkedByUser = {
                    id: this.accountabilityApproval.checked_by_user_id,
                    name: this.accountabilityApproval.checkedByUser?.name || 'N/A',
                    designation: this.accountabilityApproval.checkedByUser?.designation || 'N/A',
                    e_signature: this.accountabilityApproval.checkedByUser?.e_signature || null,
                };
            }
        },
        (error) => {
            console.error('Error fetching accountability approval:', error);
        }
    );
}


    

checkByUser(): void {
    const accountabilityId = this.asset?.user_accountability_list?.id
        ? Number(this.asset.user_accountability_list.id)
        : null;

    const userId = String(this.userId); // Convert to string for consistency

    if (!accountabilityId || isNaN(accountabilityId) || !userId) {
        this.snackBar.open('Invalid accountability data. Please contact IT.', '', {
            duration: 4000,
            verticalPosition: 'bottom',
            horizontalPosition: 'center',
            panelClass: ['snackbar-error']
        });
        return;
    }

    this.accountabilityApprovalService.checkByUser(accountabilityId, userId).subscribe(
        () => {
            this.getAccountabilityApproval(); // Refresh data

            // Show success MatSnackBar
            this.snackBar.open(`Checked by ${this.user?.name}`, '', {
                duration: 3000,
                verticalPosition: 'bottom',
                horizontalPosition: 'center',
                panelClass: ['snackbar-success']
            });
        },
        () => {
            // Show error MatSnackBar on API failure
            this.snackBar.open('Check failed. Please try again or contact support.', '', {
                duration: 4000,
                verticalPosition: 'bottom',
                horizontalPosition: 'right',
                panelClass: ['snackbar-error']
            });
        }
    );
}


    receiveByUser(): void {
        const id = this.accountabilityApproval?.id
            ? Number(this.accountabilityApproval.id)
            : null; // Convert to number
        const userId = this.userId ? String(this.userId) : null; // Convert userId to a string
    
        console.log('ID for receive:', id, typeof id);
        console.log('User ID for receive:', userId, typeof userId);
    
        // Show Snackbar if id or userId is invalid
        if (!id || isNaN(id) || !userId) {
            console.error('Accountability ID or User ID is missing or invalid for confirm');
    
            // Show error MatSnackBar immediately
            this.snackBar.open('Needs to be approved by an upper level (e.g., IT MANAGER)', '', {
                duration: 4000,
                verticalPosition: 'bottom',
                horizontalPosition: 'center',
                panelClass: ['snackbar-error'] // This applies the custom styles
            });
            
    
            return; // Stop execution
        }
    
        this.accountabilityApprovalService.receiveByUser(id, userId).subscribe(
            (response) => {
                console.log('Received by User response:', response);
                this.getAccountabilityApproval(); // Refresh after success
    
                // Show success MatSnackBar
                this.snackBar.open(`Approved by ${this.user?.name}`, '', {
                    duration: 3000,
                    verticalPosition: 'bottom',
                    horizontalPosition: 'center',
                    panelClass: ['snackbar-success']
                });
            },
            (error) => {
                console.error('Error in receive:', error);
                console.log('Executing snackbar error'); // Debugging line
    
                // Show error MatSnackBar on API error
                this.snackBar.open('Needs to be approved by an upper level (e.g., IT MANAGER)', '', {
                    duration: 4000,
                    verticalPosition: 'bottom',
                    horizontalPosition: 'center',
                    panelClass: ['snackbar-error']
                });
            }
        );
    }
    


    confirmByUser(): void {
        const id = this.accountabilityApproval?.id
            ? Number(this.accountabilityApproval.id)
            : null; // Ensure ID is a number
        const userId = this.userId ? String(this.userId) : null; // Convert userId to a string

        console.log('Accountability ID for confirm:', id, typeof id);
        console.log('User ID for confirm:', userId, typeof userId);

        if (!id || isNaN(id) || !userId) {
            console.error(
                'Accountability ID or User ID is missing or invalid for confirm')

                 // Show error MatSnackBar immediately
            this.snackBar.open('Needs to be approved by an upper level (e.g., IT MANAGER)', '', {
                duration: 4000,
                verticalPosition: 'bottom',
                horizontalPosition: 'center',
                panelClass: ['snackbar-error'] // This applies the custom styles
            });
            
    
            return; // Stop execution
         
        }

        this.accountabilityApprovalService.confirmByUser(id, userId).subscribe(
            (response) => {
                console.log('Confirmed by User response:', response);
                this.getAccountabilityApproval(); // Refresh after success
                  // Show success MatSnackBar
                  this.snackBar.open(`Approved by ${this.user?.name}`, '', {
                    duration: 3000,
                    verticalPosition: 'bottom',
                    horizontalPosition: 'center',
                    panelClass: ['snackbar-success']
                });
            },
            (error) => {
                console.error('Error in receive:', error);
                console.log('Executing snackbar error'); // Debugging line
    
                // Show error MatSnackBar on API error
                this.snackBar.open('Needs to be approved by an upper level (e.g., IT MANAGER)', '', {
                    duration: 4000,
                    verticalPosition: 'bottom',
                    horizontalPosition: 'center',
                    panelClass: ['snackbar-error']
                });
            }
        );
    }
}
