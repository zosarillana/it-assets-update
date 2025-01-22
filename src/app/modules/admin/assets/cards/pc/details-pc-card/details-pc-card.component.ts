import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardPcs } from 'app/models/Card';
import { CardService } from 'app/services/card.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-details-pc-card',
  templateUrl: './details-pc-card.component.html',
  styleUrls: ['./details-pc-card.component.scss']
})
export class DetailsPcCardComponent implements OnInit {
  cardData: CardPcs[] | null = null;

  constructor(
    private route: ActivatedRoute,
    private cardPcsService: CardService // Inject the service
  ) {}

  ngOnInit(): void {
    // Get the 'id' parameter from the route
    const id = this.route.snapshot.paramMap.get('id');
    
    // Fetch data if the id exists
    if (id) {
      this.cardPcsService.getCardDataId(id).subscribe((data: CardPcs[]) => {
        this.cardData = data;
      });
    }

    
  }
}
