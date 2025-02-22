import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Assets } from 'app/models/Inventory/Asset';
import { AlertService } from 'app/services/alert.service';
import { AssetsService } from 'app/services/assets/assets.service';
import { ModalUniversalComponent } from '../../components/modal/modal-universal/modal-universal.component';

@Component({
  selector: 'app-view-inventory',
  templateUrl: './inventory-view.component.html',
  styleUrls: ['./inventory-view.component.scss']
})
export class InventoryViewComponent implements OnInit {
  asset!: Assets;

  constructor(private route: ActivatedRoute, 
    private assetsService: AssetsService,
    private alertService: AlertService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (id) {
          this.assetsService.getAssetById(id).subscribe({
              next: (data) => this.asset = data,
              error: (err) => console.error('Error fetching asset', err)
          });
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
              this.router.navigate(['/assets/inventory']);
            },
            error: (err) => {
              console.error('Error deleting item:', err);
              this.alertService.triggerError('Failed to delete item.');
            }
          });
        }
}
