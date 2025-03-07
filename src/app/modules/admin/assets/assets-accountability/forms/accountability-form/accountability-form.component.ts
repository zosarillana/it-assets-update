import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { AccountabilityService } from 'app/services/accountability/accountability.service';
import { PdfService } from 'app/services/pdf.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas'; // ✅ Import it properly

// Interfaces
interface Accountability {
    userAccountabilityList: any;
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
    datenow: string;
    constructor(
        private route: ActivatedRoute,
        private _service: AccountabilityService,
        private pdfService: PdfService
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
        this.handleOverflow();
        this.datenow = new Date().toLocaleString();  // You can adjust this format
        const id = Number(this.route.snapshot.paramMap.get('id'));

        if (id) {
            this._service.getAccountabilityById(id).subscribe({
                next: (data: any) => {
                    console.log('Fetched Data:', data);
                    this.asset = data;

                    if (this.asset?.assets?.$values?.length) {
                        this.dataSourceAssets.data = this.asset.assets.$values;
                    }
                    console.log(
                        'Assets Data Source:',
                        this.dataSourceAssets.data
                    );

                    if (this.asset?.computers?.$values?.length) {
                        this.dataSourceComputers.data =
                            this.asset.computers.$values;
                    }
                    console.log(
                        'Computers Data Source:',
                        this.dataSourceComputers.data
                    );

                    let assignedAssets: AssignedAssetData[] = [];
                    this.asset.computers?.$values.forEach((computer) => {
                        if (computer.assignedAssetDetails?.$values?.length) {
                            assignedAssets.push(
                                ...computer.assignedAssetDetails.$values
                            );
                        }
                    });
                    this.dataSourceAssignedAssets.data = assignedAssets;
                    console.log(
                        'Assigned Assets Data Source:',
                        this.dataSourceAssignedAssets.data
                    );

                    let assignedComponents: ComponentDetail[] = [];
                    this.asset.computers?.$values.forEach((computer) => {
                        const componentTypes = [
                            'ram',
                            'ssd',
                            'hdd',
                            'gpu',
                            'board',
                        ];
                        componentTypes.forEach((type) => {
                            const componentData = computer.components?.[type];
                            if (componentData?.values?.$values?.length) {
                                assignedComponents.push(
                                    ...componentData.values.$values.map(
                                        (component) => ({
                                            ...component,
                                            type: type.toUpperCase(),
                                        })
                                    )
                                );
                            }
                        });
                    });
                    this.dataSourceAssignedComponents.data = assignedComponents;
                    console.log(
                        'Assigned Components Data Source:',
                        this.dataSourceAssignedComponents.data
                    );
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
              html2canvas(this.pdfFormArea.nativeElement, { scale: 2, useCORS: true }),
              html2canvas(this.acknowledgmentSection.nativeElement, { scale: 2, useCORS: true })
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
                pdf.addImage(mainImgData, 'PNG', margin, margin, usableWidth, mainHeight);
                
                // Add acknowledgment section below the main content with a small gap
                const ackYPosition = margin + mainHeight + 10; // 10px gap between sections
                pdf.addImage(ackImgData, 'PNG', margin, ackYPosition, usableWidth, ackHeight);
              } else {
                // Sections don't fit on one page, place on separate pages
                
                // Add main content on first page
                pdf.addImage(mainImgData, 'PNG', margin, margin, usableWidth, mainHeight);
                
                // If main content overflows, handle pagination
                if (mainHeight > usableHeight) {
                  let remainingHeight = mainHeight - usableHeight;
                  let offsetY = usableHeight;
                  
                  while (remainingHeight > 0) {
                    pdf.addPage();
                    pdf.addImage(mainImgData, 'PNG', margin, -offsetY + margin, usableWidth, mainHeight);
                    offsetY += usableHeight;
                    remainingHeight -= usableHeight;
                  }
                }
                
                // Add acknowledgment on a new page
                pdf.addPage();
                pdf.addImage(ackImgData, 'PNG', margin, margin, usableWidth, ackHeight);
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
        return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
      }

      if (isOverflowing(pdfFormArea)) {
        // Forcing page break by adding a CSS class or dynamically splitting content
        // If needed, you can add more complex logic here to split your content
        pdfFormArea.classList.add('page-break');  // Custom class to handle page breaks
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
