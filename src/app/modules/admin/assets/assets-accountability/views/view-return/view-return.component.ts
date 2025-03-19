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
  styleUrls: ['./view-return.component.scss']
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
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.accountabilityId = +id;
        this.loadReturnItems(this.accountabilityId);
        this.getReturnItemApproval(this.accountabilityId);
      }
    });
  }

  loadReturnItems(accountabilityId: number): void {
    this.returnAccountabilityItemsService.getReturnItemsByAccountabilityId(accountabilityId)
      .subscribe({
        next: (data: any) => {
          if (data && data.$values) {
            this.returnItems = data.$values;
            
            // 🔹 Filter items based on their `item_type`
            this.computers = this.returnItems.filter(item => item.item_type === 'Computers');
            this.components = this.returnItems.filter(item => item.item_type === 'Components');
            this.assets = this.returnItems.filter(item => item.item_type === 'Assets');

            console.log('Computers:', this.computers);
            console.log('Components:', this.components);
            console.log('Assets:', this.assets);
          } else {
            this.returnItems = [];
          }
        },
        error: (error) => {
          console.error('Error fetching return items:', error);
        }
      });
  }

  getReturnItemApproval(accountabilityId: number): void {
    this.returnItemApprovalService.getApprovalByAccountabilityId(accountabilityId)
      .subscribe({
        next: (data: any) => {
          this.ReturnItemsApproval = data;
          console.log('Return Item Approval:', this.ReturnItemsApproval);
        },
        error: (error) => {
          console.error('Error fetching return item approval:', error);
        }
      });
  }

  sanitizeImagePath(imagePath: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(`${this.imageUrl}/${imagePath}`);
  }
  //Return
  checkByUser(): void {
    const accountabilityId = this.accountabilityId;
    const userId = this.user?.id;

    if (!accountabilityId || isNaN(accountabilityId) || !userId) {
      this.showSnackbar(' Accountability ID or User ID is missing', true);
      return;
    }

    this.returnItemApprovalService.checkByUser(accountabilityId, userId.toString()).subscribe(
      response => {
        this.showSnackbar(` Checked by ${this.user?.name || 'User'}`, false);
        this.getReturnItemApproval(accountabilityId);
      },
      error => {
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

    this.returnItemApprovalService.receiveByUser(id, userId.toString()).subscribe(
      response => {
        this.showSnackbar(` Received by ${this.user?.name || 'User'}`, false);
        this.getReturnItemApproval(this.accountabilityId);
      },
      error => {
        this.showSnackbar(' Error receiving item', true);
      }
    );
  }

  confirmByUser(): void {
    const id = this.ReturnItemsApproval?.id;
    const userId = this.user?.id;

    if (!id || isNaN(id) || !userId) {
      this.showSnackbar(' Accountability ID or User ID is missing for confirm', true);
      return;
    }

    this.returnItemApprovalService.confirmByUser(id, userId.toString()).subscribe(
      response => {
        this.showSnackbar(` Confirmed by ${this.user?.name || 'User'}`, false);
        this.getReturnItemApproval(this.accountabilityId);
      },
      error => {
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
      @ViewChild('acknowledgmentSection') acknowledgmentSection!: ElementRef;
      asset!: Accountability;
      
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
}
