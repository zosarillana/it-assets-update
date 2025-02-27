import { Component, OnInit } from '@angular/core';
import { ModalUniversalComponent } from '../../components/modal/modal-universal/modal-universal.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Assets } from 'app/models/Inventory/Asset';
import { AlertService } from 'app/services/alert.service';
import { ComponentsService } from 'app/services/components/components.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-components-edit',
  templateUrl: './components-edit.component.html',
  styleUrls: ['./components-edit.component.scss']
})
export class ComponentsEditComponent  implements OnInit {
    // asset!: Assets;
    asset: Assets | null = null;
     eventForm!: FormGroup;  
    constructor(
        private route: ActivatedRoute,
        private assetsService: ComponentsService,
        private dialog: MatDialog,
        private alertService:AlertService,
        private router: Router,
        private _formBuilder: FormBuilder
    ) {}
 private initializeForm(): void {
        // Parse the date string into a Date object
        let dateAcquired = null;
        if (this.asset?.date_acquired) {
            // Parse the MM/DD/YYYY format into a Date object
            const dateParts = this.asset.date_acquired.split('/');
            if (dateParts.length === 3) {
                // Month is 0-indexed in JavaScript Date
                dateAcquired = new Date(
                    parseInt(dateParts[2]), // Year
                    parseInt(dateParts[0]) - 1, // Month (0-indexed)
                    parseInt(dateParts[1]) // Day
                );
            }
        }

        this.eventForm = this._formBuilder.group({
            image: [null],
            serial_number: [
                this.asset?.serial_no || 'N/A',
                Validators.required,
            ],
        
            asset_barcode: [
                this.asset?.asset_barcode || '',
                [Validators.required],
            ],
            description: [this.asset?.description || 'N/A', [Validators.required]],
            color: [this.asset?.color || 'N/A', [Validators.required]],
            
        });
    }
    ngOnInit(): void {
      const uid = this.route.snapshot.paramMap.get('uid');
      const asset_barcode = this.route.snapshot.paramMap.get('asset_barcode');

        if (uid) {
            this.assetsService.getComponentsById(uid).subscribe({
                next: (data) => (this.asset = data),
                error: (err) => console.error('Error fetching asset', err),
            });
        }

        this.initializeForm();
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
          data: { name: 'Are you sure you want to delete this item?' }
        });
        
        dialogRef.afterClosed().subscribe(result => {
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
          }
        });
      }


      
}
