import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Assets } from 'app/models/Inventory/Asset';
import { AlertService } from 'app/services/alert.service';
import { ComponentsService } from 'app/services/components/components.service';
import { ComputerService } from 'app/services/computer/computer.service';
import { ModalUniversalComponent } from '../../components/modal/modal-universal/modal-universal.component';

@Component({
    selector: 'app-components-view',
    templateUrl: './components-view.component.html',
    styleUrls: ['./components-view.component.scss'],
})
export class ComponentsViewComponent implements OnInit {
    // asset!: Assets;
    asset: Assets | null = null;
    loading: boolean = false; // Add this line
    constructor(
        private route: ActivatedRoute,
        private assetsService: ComponentsService,
        private dialog: MatDialog,
        private alertService: AlertService,
        private router: Router
    ) {}

    ngOnInit(): void {
        const uid = this.route.snapshot.paramMap.get('uid');
        const asset_barcode = this.route.snapshot.paramMap.get('asset_barcode');

        if (uid) {
            this.loading = true; // Show loader before API call
            this.assetsService.getComponentsById(uid).subscribe({
                next: (data) => {
                    (this.asset = data), (this.loading = false);
                },
                error: (err) => {
                    console.error('Error fetching asset', err);
                    this.loading = false; // Hide loader on error
                },
            });
        }
    }
    previewSelectedImage(event: Event): void {
        const input = event.target as HTMLInputElement;

        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            const reader = new FileReader();

            reader.onload = (e: ProgressEvent<FileReader>) => {
                const previewImage = document.getElementById(
                    'preview-image'
                ) as HTMLImageElement;
                if (previewImage) {
                    previewImage.src = e.target?.result as string;
                }
            };

            reader.readAsDataURL(file);
        }
    }

    openDeleteDialog(id: string): void {
        const dialogRef = this.dialog.open(ModalUniversalComponent, {
            width: '400px',
            data: { name: 'Are you sure you want to delete this item?' },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.deleteItem(id);
            }
        });
    }

    private deleteItem(id: string): void {
        this.assetsService.deleteEvent(id).subscribe({
            next: () => {
                this.alertService.triggerSuccess('Item deleted successfully!');
                // Redirect to '/assets/components' on success
                this.router.navigate(['/assets/components']);
            },
            error: (err) => {
                console.error('Error deleting item:', err);
                this.alertService.triggerError('Failed to delete item.');
            },
        });
    }
}
