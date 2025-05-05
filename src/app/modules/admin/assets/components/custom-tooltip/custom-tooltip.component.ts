import { Component, Input, OnDestroy, OnInit } from '@angular/core';

@Component({
    selector: 'app-custom-tooltip',
    templateUrl: './custom-tooltip.component.html',
    styleUrls: ['./custom-tooltip.component.scss'],
})
export class CustomTooltipComponent implements OnDestroy {
    @Input() text: string = '';
    positionX: number = 0;
    positionY: number = 0;
    visible: boolean = false;

    showTooltip(x: number, y: number): void {
        this.positionX = x + 10; // Add offset to avoid overlapping the cursor
        this.positionY = y + 10;
        this.visible = true;
    }

    hideTooltip(): void {
        this.visible = false;
    }

    ngOnDestroy(): void {
        this.hideTooltip(); // Ensure the tooltip is hidden when the component is destroyed
    }
}
