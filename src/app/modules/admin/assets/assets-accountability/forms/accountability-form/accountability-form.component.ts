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

    asset!: Accountability;

    ngOnInit() {
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

    @ViewChild('pdfFormArea') pdfFormArea!: ElementRef;
    pdfForm(): void {
        setTimeout(() => {
            if (this.pdfFormArea) {
                html2canvas(this.pdfFormArea.nativeElement, {
                    scale: 2,
                    useCORS: true,
                })
                    .then((canvas) => {
                        const imgData = canvas.toDataURL('image/png');
                        const pdf = new jsPDF({
                            orientation: 'portrait',
                            unit: 'px',
                            format: 'a4',
                        });

                        const imgWidth = canvas.width;
                        const imgHeight = canvas.height;
                        const pageWidth = pdf.internal.pageSize.getWidth();
                        const pageHeight = pdf.internal.pageSize.getHeight();

                        const ratio = Math.min(
                            pageWidth / imgWidth,
                            pageHeight / imgHeight
                        );
                        const width = imgWidth * ratio;
                        const height = imgHeight * ratio;

                        pdf.addImage(
                            imgData,
                            'PNG',
                            (pageWidth - width) / 2,
                            (pageHeight - height) / 200,
                            width,
                            height
                        );

                        pdf.save('accountability-form.pdf');
                    })
                    .catch((error) => {
                        console.error('Error generating PDF:', error);
                    });
            } else {
                console.error('PDF content element not found');
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
