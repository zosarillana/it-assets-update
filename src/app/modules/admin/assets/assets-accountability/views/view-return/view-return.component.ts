import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ReturnService } from 'app/services/accountability/return.service';
import { ReturnItemService } from 'app/services/accountability/return-item.service';
import { Accountability } from 'app/models/Accountability/Accountability';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-view-return',
    templateUrl: './view-return.component.html',
    styleUrls: ['./view-return.component.scss'],
})
export class ViewReturnComponent implements OnInit {
    returnItems: any[] = [];
    computers: any[] = [];
    components: any[] = [];
    assets: any[] = [];
    accountabilityId!: number;
    user: User;
    ReturnItemsApproval: any;
  
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // Image base URL
    public imageUrl: string = 'https://localhost:7062/api/images/esignature';

    constructor(
        private route: ActivatedRoute,
        private returnAccountabilityItemsService: ReturnService,
        private returnItemApprovalService: ReturnItemService,
        private _userService: UserService,
        private sanitizer: DomSanitizer,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        // Subscribe to the user service to get user data
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll)) // Auto-unsubscribe when component is destroyed
            .subscribe((user: User) => {
                this.user = user;
                console.log('🟢 User data loaded:', user);
            });

        // Get the accountability ID from the route parameters
        this.route.paramMap.subscribe((params) => {
            const id = params.get('id');
            if (id) {
                this.accountabilityId = +id;
                this.loadReturnItems(this.accountabilityId);
                this.getReturnItemApproval(this.accountabilityId);
            }
        });
    }
    
    loading: boolean = false; // Add this line
    loadReturnItems(accountabilityId: number): void {
        this.loading = true; // Show loader before API call

        this.returnAccountabilityItemsService
            .getReturnItemsByAccountabilityId(accountabilityId)
            .subscribe({
                next: (data: any) => {
                    if (data && data.$values) {
                        this.returnItems = data.$values;

                        // 🔹 Filter items based on their `item_type`
                        this.computers = this.returnItems.filter(
                            (item) => item.item_type === 'Computers'
                        );
                        this.components = this.returnItems.filter(
                            (item) => item.item_type === 'Components'
                        );
                        this.assets = this.returnItems.filter(
                            (item) => item.item_type === 'Assets'
                        );

                        console.log('Computers:', this.computers);
                        console.log('Components:', this.components);
                        console.log('Assets:', this.assets);
                    } else {
                        this.returnItems = [];
                    }
                    this.loading = false; // Hide loader on error
                },
                error: (error) => {
                    console.error('Error fetching return items:', error);
                    this.loading = false; // Hide loader on error
                },
            });
    }

    getReturnItemApproval(accountabilityId: number): void {
        this.returnItemApprovalService
            .getApprovalByAccountabilityId(accountabilityId)
            .subscribe({
                next: (data: any) => {
                    this.ReturnItemsApproval = data;
                    console.log(
                        'Return Item Approval:',
                        this.ReturnItemsApproval
                    );
                },
                error: (error) => {
                    console.error(
                        'Error fetching return item approval:',
                        error
                    );
                },
            });
    }

    sanitizeImagePath(imagePath: string): SafeUrl {
        return this.sanitizer.bypassSecurityTrustUrl(
            `${this.imageUrl}/${imagePath}`
        );
    }
    //Return
    checkByUser(): void {
        const accountabilityId = this.accountabilityId;
        const userId = this.user?.id;

        if (!accountabilityId || isNaN(accountabilityId) || !userId) {
            this.showSnackbar(' Accountability ID or User ID is missing', true);
            return;
        }

        this.returnItemApprovalService
            .checkByUser(accountabilityId, userId.toString())
            .subscribe(
                (response) => {
                    this.showSnackbar(
                        ` Checked by ${this.user?.name || 'User'}`,
                        false
                    );
                    this.getReturnItemApproval(accountabilityId);
                },
                (error) => {
                    this.showSnackbar(' Error checking item', true);
                }
            );
    }

    receiveByUser(): void {
        const id = this.ReturnItemsApproval?.id;
        const userId = this.user?.id;

        if (!id || isNaN(id) || !userId) {
            this.showSnackbar(' ID or User ID is missing for receive', true);
            return;
        }

        this.returnItemApprovalService
            .receiveByUser(id, userId.toString())
            .subscribe(
                (response) => {
                    this.showSnackbar(
                        ` Received by ${this.user?.name || 'User'}`,
                        false
                    );
                    this.getReturnItemApproval(this.accountabilityId);
                },
                (error) => {
                    this.showSnackbar(' Error receiving item', true);
                }
            );
    }

    confirmByUser(): void {
        const id = this.ReturnItemsApproval?.id;
        const userId = this.user?.id;

        if (!id || isNaN(id) || !userId) {
            this.showSnackbar(
                ' Accountability ID or User ID is missing for confirm',
                true
            );
            return;
        }

        this.returnItemApprovalService
            .confirmByUser(id, userId.toString())
            .subscribe(
                (response) => {
                    this.showSnackbar(
                        ` Confirmed by ${this.user?.name || 'User'}`,
                        false
                    );
                    this.getReturnItemApproval(this.accountabilityId);
                },
                (error) => {
                    this.showSnackbar(' Error confirming item', true);
                }
            );
    }

    showSnackbar(message: string, isError: boolean): void {
        this.snackBar.open(message, '', {
            duration: 3000,
            verticalPosition: 'bottom',
            horizontalPosition: 'center',
            panelClass: isError ? ['snackbar-error'] : ['snackbar-success'],
        });
    }

    //print

    // Function to generate the PDF
    //pdf
    @ViewChild('pdfFormArea') pdfFormArea!: ElementRef;
    asset!: Accountability;

    pdfForm(): void {
        setTimeout(() => {
            if (this.pdfFormArea) {
                // Convert the main section to canvas
                html2canvas(this.pdfFormArea.nativeElement, {
                    scale: 2,
                    useCORS: true,
                })
                    .then((mainCanvas) => {
                        const mainImgData = mainCanvas.toDataURL('image/png');

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

                        // Ensure content fits within a single page
                        const scaledHeight = Math.min(mainHeight, usableHeight);

                        pdf.addImage(
                            mainImgData,
                            'PNG',
                            margin,
                            margin,
                            usableWidth,
                            scaledHeight
                        );

                        pdf.save('return-form.pdf');
                    })
                    .catch((error) => {
                        console.error('Error generating PDF:', error);
                    });
            } else {
                console.error('Required element not found');
            }
        }, 500);
    }

    printForm() {
        const printContents =
            document.getElementById('printableArea')?.innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContents || '';
        window.print();
        document.body.innerHTML = originalContents;
    }
}
