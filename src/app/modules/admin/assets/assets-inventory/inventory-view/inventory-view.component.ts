import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Assets } from 'app/models/Inventory/Asset';
import { AssetsService } from 'app/services/assets/assets.service';

@Component({
  selector: 'app-view-inventory',
  templateUrl: './inventory-view.component.html',
  styleUrls: ['./inventory-view.component.scss']
})
export class InventoryViewComponent implements OnInit {
  asset!: Assets;

  constructor(private route: ActivatedRoute, private assetsService: AssetsService) {}

  ngOnInit(): void {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (id) {
          this.assetsService.getAssetById(id).subscribe({
              next: (data) => this.asset = data,
              error: (err) => console.error('Error fetching asset', err)
          });
      }
  }

}
