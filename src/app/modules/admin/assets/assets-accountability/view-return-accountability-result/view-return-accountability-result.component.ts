import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReturnAccountabilityItemsService } from '../../../../../services/accountability/return-accountability-items.service'; // Adjust the path as needed

@Component({
  selector: 'app-view-return-accountability-result',
  templateUrl: './view-return-accountability-result.component.html',
  styleUrls: ['./view-return-accountability-result.component.scss']
})
export class ViewReturnAccountabilityResultComponent implements OnInit {
  returnItems: any[] = [];
  computers: any[] = [];
  components: any[] = [];
  assets: any[] = [];
  accountabilityId!: number;

  constructor(
    private route: ActivatedRoute,
    private returnAccountabilityItemsService: ReturnAccountabilityItemsService
  ) {}

  ngOnInit(): void {
    // Get the accountability ID from the route parameters
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.accountabilityId = +id;
        this.loadReturnItems(this.accountabilityId);
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
  
  
}
