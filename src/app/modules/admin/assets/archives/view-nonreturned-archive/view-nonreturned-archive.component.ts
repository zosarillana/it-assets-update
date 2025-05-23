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
import { environment } from 'environments/environment';
import { ArchivedAccountabilityService } from 'app/services/archive/archived-accountability.service';

@Component({
    selector: 'app-view-nonreturned-archive',
    templateUrl: './view-nonreturned-archive.component.html',
    styleUrls: ['./view-nonreturned-archive.component.scss'],
})
export class ViewNonreturnedArchiveComponent implements OnInit {
    returnItems: any[] = [];
    computers: any[] = [];
    components: any[] = [];
    assets: any[] = [];
    accountabilityId!: number;
    user: User;
    ReturnItemsApproval: any;
    preparedByUser: any;
    approvedByUser: any;
    preparedDate: string | null = null;
    approvedDate: string | null = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private route: ActivatedRoute,
        private _service: ArchivedAccountabilityService,
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
                // console.log('🟢 User data loaded:', user);
            });

        // Get the accountability ID from the route parameters
        this.route.paramMap.subscribe((params) => {
            const id = params.get('id');
            if (id) {
                this.accountabilityId = +id;
                this.loadReturnItems(this.accountabilityId);
            }
        });
    }

    loading: boolean = false; // Add this line
    loadReturnItems(accountabilityId: number): void {
        this.loading = true;

        this._service.getArchivedDetails(accountabilityId).subscribe({
            next: (data: any) => {
                // ✅ Log the full response to see what the API sends
                console.log('📦 API response:', data);
                this.preparedByUser = data.prepared_by_user;
                this.approvedByUser = data.approved_by_user;
                this.preparedDate = data.prepared_date;
                this.approvedDate = data.approved_date;
                // Store the accountability data
                this.returnItems = [
                    {
                        accountability: {
                            tracking_code: data.accountability.tracking_code,
                            accountability_code:
                                data.accountability.accountability_code,
                            owner: {
                                name:
                                    data.accountability.owner?.name ||
                                    'Unknown',
                                employee_id:
                                    data.accountability.owner?.employee_id ||
                                    '-',
                                designation:
                                    data.accountability.owner?.designation ||
                                    '-',
                                company:
                                    data.accountability.owner?.company || '-',
                                department:
                                    data.accountability.owner?.department ||
                                    '-',
                            },
                        },
                        return_date: data.dateCreated, // Using dateCreated as return date
                    },
                ];

                // Store the computer data
                this.computers = data.computer
                    ? [
                          {
                              computer: {
                                  type: data.computer.type,
                                  model: data.computer.model,
                                  asset_barcode: data.computer.asset_barcode,
                                  brand: data.computer.brand,
                                  serial_no: data.computer.serial_no,
                              },
                              status: '-', // Default status since it's archived
                              remarks: data.computer.remarks || '-',
                          },
                      ]
                    : [];

                // Map components from the data
                this.components =
                    data.components?.map((component: any) => ({
                        components: {
                            type: component.type,
                            uid: component.uid,
                            description: component.description,
                            cost: component.cost,
                        },
                        status: '-', // Default status
                        remarks: '-', // No remarks in the response
                    })) || [];

                // Map assets from the data
                this.assets =
                    data.assignedAssets?.map((asset: any) => ({
                        asset: {
                            type: asset.type,
                            brand: asset.brand,
                            asset_barcode: asset.asset_barcode,
                            model: asset.model,
                        },
                        status: '-', // Default status
                        remarks: asset.remarks || '-',
                    })) || [];

                this.loading = false;
            },
            error: (error) => {
                console.error('Error fetching return items:', error);
                this.loading = false;
            },
        });
    }

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
