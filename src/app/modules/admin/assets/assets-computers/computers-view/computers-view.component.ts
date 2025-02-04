import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Assets } from 'app/models/Inventory/Asset';
import { AssetsService } from 'app/services/assets/assets.service';
import { ComputerService } from 'app/services/computer/computer.service';

@Component({
  selector: 'app-computers-view',
  templateUrl: './computers-view.component.html',
  styleUrls: ['./computers-view.component.scss']
})
export class ComputersViewComponent implements OnInit {
//  asset!: Assets;
asset: any;
 displayedColumns: string[] = ['component', 'description', 'uid', 'history'];
 dataSource: any[] = [];
    constructor(
        private route: ActivatedRoute,
        private assetsService: ComputerService
    ) {}

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) {
            this.assetsService.getComputersById(id).subscribe({
                next: (data) => {
                    this.asset = data;
                    this.dataSource = [
                        { name: 'Ram', icon: 'feather:server', description: this.asset?.ram?.description || null, uid: this.asset?.ram?.uid || null, history: this.asset?.ram?.history || null },
                        { name: 'SSD', icon: 'feather:hard-drive', description: this.asset?.ssd?.description || null, uid: this.asset?.ssd?.uid || null, history: this.asset?.ssd?.history || null },
                        { name: 'HDD', icon: 'feather:hard-drive', description: this.asset?.hhd?.description || null, uid: this.asset?.hhd?.uid || null, history: this.asset?.hhd?.history || null },
                        { name: 'GPU', icon: 'feather:monitor', description: this.asset?.gpu?.description || null, uid: this.asset?.gpu?.uid || null, history: this.asset?.gpu?.history || null }
                    ];
                },
                error: (err) => console.error('Error fetching asset', err),
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
  }