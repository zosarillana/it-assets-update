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
import { environment } from 'environments/environment';

interface Accountability {
    user_accountability_list: {
        id: number;
        accountability_code: string;
        tracking_code: string;
        date_created: string;
        owner: {
            id: number;
            name: string;
            company: string;
            department: string;
            employee_id: string | null;
            designation: string | null;
        };
    };
    computers: Array<ComputerData>;
}

interface ComputerData {
    id: number;
    type: string;
    asset_barcode: string;
    brand: string;
    model: string;
    size: string;
    color: string;
    serial_no: string | null;
    date_created: string;
    date_acquired: string;
    status: string;
    history: null | {
        $values: string[];
    };
    assignedAssetDetails: AssignedAssetData[];
    components: {
        BOARD?: Array<ComponentDetail>;
        RAM?: Array<ComponentDetail>;
        HDD?: Array<ComponentDetail>;
        SSD?: Array<ComponentDetail>;
        GPU?: Array<ComponentDetail>;
    };
}

interface ComponentDetail {
    id: number;
    uid: string;
    description: string;
    date_acquired: string;
    asset_barcode: string;
    cost: number;
    status: string;
}

interface AssignedAssetData {
    id: number;
    type: string;
    asset_barcode: string;
    brand: string;
    model: string;
    date_acquired: string;
    status: string;
    history_details: any[];
    root_history: any[];
}


interface AccountabilityApproval {
    id: number;
    accountability_id: number;
    prepared_by_user_id?: number;
    checked_by_user_id?: number;
    approved_by_user_id?: number;
    prepared_date?: string;
    checked_date?: string;
    approved_date?: string;
    preparedByUser?: {
        id: number;
        name: string;
        designation: string;
        e_signature: string;
    };
    checkedByUser?: {
        id: number;
        name: string;
        designation: string;
        e_signature: string;
    };
    approvedByUser?: {
        id: number;
        name: string;
        designation: string;
        e_signature: string;
    };
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
        // 'personalHistory',
        'status',
    ];
    user: User;
    // dataSourceAssets = new MatTableDataSource<AssetData>();
    dataSourceComputers = new MatTableDataSource<ComputerData>();
    dataSourceAssignedAssets = new MatTableDataSource<AssignedAssetData>();
    dataSourceAssignedComponents = new MatTableDataSource<ComponentDetail>();
    datenow: string;

    loading: boolean = false; // Add this line
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
        // Get user data first
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;
                this.userId = user?.id ? Number(user.id) : null;
            });
    
        // Get the ID from route
        const id = Number(this.route.snapshot.paramMap.get('id'));
    
        if (id) {
            this.loading = true;
    
            // Get accountability data
            this._service.getAccountabilityById(id).subscribe({
                next: (data: any) => {
                    this.asset = data;
                    
                    // Only call getAccountabilityApproval after asset is loaded
                    if (this.asset?.user_accountability_list?.id) {
                        this.getAccountabilityApproval();
                    }
    
                    // Update table data sources
                    if (this.asset?.computers?.length) {
                        this.dataSourceComputers.data = this.asset.computers;
                    }
    
                    let assignedAssets: AssignedAssetData[] = [];
                    this.asset?.computers?.forEach(computer => {
                        if (computer.assignedAssetDetails?.length) {
                            assignedAssets.push(...computer.assignedAssetDetails);
                        }
                    });
                    this.dataSourceAssignedAssets.data = assignedAssets;
    
                    let assignedComponents: ComponentDetail[] = [];
                    this.asset?.computers?.forEach(computer => {
                        if (computer.components) {
                            Object.entries(computer.components).forEach(([type, components]) => {
                                if (Array.isArray(components)) {
                                    assignedComponents.push(...components.map(component => ({
                                        ...component,
                                        type: type.toUpperCase()
                                    })));
                                }
                            });
                        }
                    });
                    this.dataSourceAssignedComponents.data = assignedComponents;
    
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Error fetching asset', err);
                    this.loading = false;
                }
            });
        }
    }
    
    getAccountabilityApproval(): void {
        const accountabilityId = this.asset?.user_accountability_list?.id;
    
        if (!accountabilityId) {
            console.warn('No accountability ID available');
            return;
        }
    
        this.accountabilityApprovalService
            .getByAccountabilityId(accountabilityId)
            .subscribe({
                next: (response: any) => {
                    if (!response) {
                        this.accountabilityApproval = null;
                        return;
                    }
    
                    // Map the response to match your interface
                    this.accountabilityApproval = {
                        id: response.id,
                        accountability_id: response.accountability_id,
                        prepared_by_user_id: response.prepared_by_user_id ? Number(response.prepared_by_user_id) : undefined,
                        approved_by_user_id: response.approved_by_user_id ? Number(response.approved_by_user_id) : undefined,
                        prepared_date: response.prepared_date,
                        approved_date: response.approved_date,
                        preparedByUser: response.preparedByUser ? {
                            id: Number(response.preparedByUser.employee_id), // Using employee_id as id
                            name: response.preparedByUser.name,
                            designation: response.preparedByUser.designation,
                            e_signature: response.preparedByUser.e_signature
                        } : undefined,
                        approvedByUser: response.approvedByUser ? {
                            id: Number(response.approvedByUser.employee_id),
                            name: response.approvedByUser.name,
                            designation: response.approvedByUser.designation,
                            e_signature: response.approvedByUser.e_signature
                        } : undefined
                    };
    
                    // console.log('Mapped accountability approval:', this.accountabilityApproval);
                },
                error: (error) => {
                    console.error('Error fetching accountability approval:', error);
                    this.accountabilityApproval = null;
                }
            });
    }
    
    // Add helper method for handling file paths
    getFileName(path: string | undefined): string {
        if (!path) return '';
        // Extract just the filename from the full path
        const parts = path.split('\\');
        return parts[parts.length - 1];
    }

    // Function to generate the PDF
    pdfForm(): void {
        setTimeout(() => {
          if (this.pdfFormArea) {
            // Convert the main section to canvas
            html2canvas(this.pdfFormArea.nativeElement, {
              scale: 2, // Increased scale for better resolution
              useCORS: true,
            })
              .then((mainCanvas) => {
                const pdf = new jsPDF({
                  orientation: 'portrait',
                  unit: 'px',
                  format: 'a4',
                });
    
                // Define page dimensions with different margins for X and Y
                const marginX = 10; // Reduced horizontal margin
                const marginY = 20; // Reduced vertical margin
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const usableWidth = pageWidth - 2 * marginX;
                const usableHeight = pageHeight - 2 * marginY;
    
                // Calculate scale ratio to fit content to page width
                const widthRatio = usableWidth / mainCanvas.width;
                const heightRatio = usableHeight / mainCanvas.height;
    
                // Use the smaller ratio to ensure content fits in both dimensions
                const ratio = Math.min(widthRatio, heightRatio);
    
                // Calculate dimensions that will fit on one page
                const scaledWidth = mainCanvas.width * ratio;
                const scaledHeight = mainCanvas.height * ratio;
    
                // Center the content on the page
                const xPosition = marginX + (usableWidth - scaledWidth) / 2;
                const yPosition = marginY + (usableHeight - scaledHeight) / 2;
    
                // Add the image to PDF
                pdf.addImage(
                  mainCanvas.toDataURL('image/png'),
                  'PNG',
                  xPosition,
                  yPosition,
                  scaledWidth,
                  scaledHeight
                );
    
                pdf.save('accountability-form.pdf');
              })
              .catch((error) => {
                console.error('Error generating PDF:', error);
              });
          } else {
            console.error('Required element not found');
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
            // console.log(
            //     '✅ Accountability ID Loaded:',
            //     this.asset.user_accountability_list.id
            // );
            this.getAccountabilityApproval(); // Call here!
        }
    }

    // getAccountabilityApproval(): void {
    //     const accountabilityId = this.asset?.user_accountability_list?.id
    //         ? Number(this.asset.user_accountability_list.id)
    //         : null;
    
    //     if (!accountabilityId || isNaN(accountabilityId)) {
    //         return;
    //     }
    
    //     this.accountabilityApprovalService
    //         .getByAccountabilityId(accountabilityId)
    //         .subscribe({
    //             next: (response: any) => {
    //                 if (!response || (Array.isArray(response) && response.length === 0)) {
    //                     this.accountabilityApproval = null;
    //                     return;
    //                 }
    
    //                 // If response is an array, get the correct entry
    //                 const approval = Array.isArray(response)
    //                     ? response.find(item => item.accountability_id === accountabilityId)
    //                     : response;
    
    //                 if (!approval) {
    //                     this.accountabilityApproval = null;
    //                     return;
    //                 }
    
    //                 // Map the response to match our interface
    //                 this.accountabilityApproval = {
    //                     ...approval,
    //                     preparedByUser: approval.prepared_by_user ? {
    //                         id: approval.prepared_by_user.id,
    //                         name: approval.prepared_by_user.name || 'N/A',
    //                         designation: approval.prepared_by_user.designation || 'N/A',
    //                         e_signature: approval.prepared_by_user.e_signature || null
    //                     } : null,
    //                     checkedByUser: approval.checked_by_user ? {
    //                         id: approval.checked_by_user.id,
    //                         name: approval.checked_by_user.name || 'N/A',
    //                         designation: approval.checked_by_user.designation || 'N/A',
    //                         e_signature: approval.checked_by_user.e_signature || null
    //                     } : null
    //                 };
    
    //                 console.log('Mapped accountability approval:', this.accountabilityApproval);
    //             },
    //             error: (error) => {
    //                 console.error('Error fetching accountability approval:', error);
    //                 this.accountabilityApproval = null;
    //             }
    //         });
    // }

    preparedByUser(): void {
        // console.log(
        //     '🔵 Accountability Approval Object:',
        //     this.accountabilityApproval
        // );

        // Ensure accountabilityId is always an integer
        const accountabilityId: number = this.accountabilityApproval?.id
            ? Number(this.accountabilityApproval.id)
            : this.asset?.user_accountability_list?.id
            ? Number(this.asset.user_accountability_list.id)
            : 0;

        // console.log('🟡 ID for prepared by user:', accountabilityId);

        if (!accountabilityId || accountabilityId === 0) {
            console.error('❌ Error: Accountability ID is missing or 0!');
            return;
        }

        // Ensure userId is a string before passing it to the service
        const userId: string = this.userId ? String(this.userId) : '0';

        // console.log(
        //     '🟢 Final Accountability ID:',
        //     accountabilityId,
        //     typeof accountabilityId
        // );
        // console.log('🟢 Final User ID:', userId, typeof userId);

        this.accountabilityApprovalService
            .preparedByUser(accountabilityId, userId)
            .subscribe(
                (response) => {
                    // console.log('✅ Prepared by User response:', response);
                    this.getAccountabilityApproval();

                    this.snackBar.open(
                        `Prepared by ${this.user?.name || 'Unknown User'}`,
                        '',
                        {
                            duration: 3000,
                            verticalPosition: 'bottom',
                            horizontalPosition: 'center',
                            panelClass: ['snackbar-success'],
                        }
                    );
                },
                (error) => {
                    console.error('❌ Error in prepared by user:', error);

                    this.snackBar.open(
                        'An error occurred while preparing the approval.',
                        '',
                        {
                            duration: 4000,
                            verticalPosition: 'bottom',
                            horizontalPosition: 'center',
                            panelClass: ['snackbar-error'],
                        }
                    );
                }
            );
    }

    approvedByUser(): void {
        const id = this.accountabilityApproval?.id
            ? Number(this.accountabilityApproval.id)
            : null; // Ensure ID is a number
        const userId = this.userId ? String(this.userId) : null; // Convert userId to a string

        // console.log('Accountability ID for approve:', id, typeof id);
        // console.log('User ID for approve:', userId, typeof userId);

        if (!id || isNaN(id) || !userId) {
            console.error(
                'Accountability ID or User ID is missing or invalid for approve'
            );

            // Show error MatSnackBar immediately
            this.snackBar.open(
                'Prepared by needs to be signed before procceeding',
                '',
                {
                    duration: 4000,
                    verticalPosition: 'bottom',
                    horizontalPosition: 'center',
                    panelClass: ['snackbar-error'], // This applies the custom styles
                }
            );

            return; // Stop execution
        }

        this.accountabilityApprovalService.approvedByUser(id, userId).subscribe(
            (response) => {
                // console.log('Approved by User response:', response);
                this.getAccountabilityApproval(); // Refresh after success
                // Show success MatSnackBar
                this.snackBar.open(`Approved by ${this.user?.name}`, '', {
                    duration: 3000,
                    verticalPosition: 'bottom',
                    horizontalPosition: 'center',
                    panelClass: ['snackbar-success'],
                });
            },
            (error) => {
                // console.error('Error in approve:', error);
                // console.log('Executing snackbar error'); // Debugging line

                // Show error MatSnackBar on API error
                this.snackBar.open(
                    'Needs to be approved by an upper level (e.g., IT MANAGER)',
                    '',
                    {
                        duration: 4000,
                        verticalPosition: 'bottom',
                        horizontalPosition: 'center',
                        panelClass: ['snackbar-error'],
                    }
                );
            }
        );
    }

    // Use the environment's apiUrl to construct the imageUrl
    public imageUrl: string = `${environment.apiUrl}/Image/esignature`;

    public getSignatureUrl(eSignaturePath: string): string {
        if (!eSignaturePath) {
            return '';
        }

        // Extract the file name from the full path
        const fileName = eSignaturePath.split('/').pop()?.split('\\').pop();
        return `${this.imageUrl}/${fileName}`;
    }
}
