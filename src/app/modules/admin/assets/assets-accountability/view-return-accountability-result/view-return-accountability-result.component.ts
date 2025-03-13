import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReturnAccountabilityItemsService } from '../../../../../services/accountability/return-accountability-items.service'; // Adjust the path as needed
import { UsersService } from 'app/services/user/users.service';
import { ReturnItemApprovalService } from 'app/services/accountability/return-item-approval.service';

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
  currentUser: any;
  ReturnItemsApproval: any;



  constructor(
    private route: ActivatedRoute,
    private returnAccountabilityItemsService: ReturnAccountabilityItemsService,
    private usersService: UsersService,
    private returnItemApprovalService: ReturnItemApprovalService


  ) {}

  ngOnInit(): void {
    // Get the accountability ID from the route parameters
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.accountabilityId = +id;
        console.log(`Accountability ID passed to component: ${this.accountabilityId}`);

        this.loadReturnItems(this.accountabilityId);
        this.getReturnItemApproval(this.accountabilityId);

      }
    });


    // Fetch the current logged-in user
    this.usersService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        console.log('Current User:', this.currentUser);
      },
      error: (error) => {
        console.error('Error fetching current user:', error);
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


  checkByUser(): void {
    const accountabilityId = this.accountabilityId;
    const userId = this.currentUser?.id;

    console.log('Accountability ID:', accountabilityId, typeof accountabilityId);
    console.log('User ID:', userId, typeof userId);

    if (!accountabilityId || isNaN(accountabilityId) || !userId) {
      console.error('Accountability ID or User ID is missing');
      return;
    }

    this.returnItemApprovalService.checkByUser(accountabilityId, userId).subscribe(
      response => {
        console.log('Check by User response:', response);
        // Refresh data after successful check
        this.getReturnItemApproval(accountabilityId);
      },
      error => {
        console.error('Error:', error);
      }
    );
  }

  receiveByUser(): void {
    const id = this.ReturnItemsApproval?.id;
    const userId = this.currentUser?.id;

    console.log('ID for receive:', id, typeof id);
    console.log('User ID for receive:', userId, typeof userId);

    if (!id || isNaN(id) || !userId) {
      console.error('ID or User ID is missing for receive');
      return;
    }

    this.returnItemApprovalService.receiveByUser(id, userId).subscribe(
      response => {
        console.log('Received by User response:', response);
        // Refresh data after successful receive
        this.getReturnItemApproval(this.accountabilityId);
      },
      error => {
        console.error('Error in receive:', error);
      }
    );
  }

  confirmByUser(): void {
    const id = this.ReturnItemsApproval?.id;
    const userId = this.currentUser?.id;

    console.log('Accountability ID for confirm:', id, typeof id);
    console.log('User ID for confirm:', userId, typeof userId);

    if (!id || isNaN(id) || !userId) {
      console.error('Accountability ID or User ID is missing for confirm');
      return;
    }

    this.returnItemApprovalService.confirmByUser(id, userId).subscribe(
      response => {
        console.log('Confirmed by User response:', response);
        // Refresh data after successful confirm
        this.getReturnItemApproval(this.accountabilityId);
      },
      error => {
        console.error('Error in confirm:', error);
      }
    );
  }
  
  
}
