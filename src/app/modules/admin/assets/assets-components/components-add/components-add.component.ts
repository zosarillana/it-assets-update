import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-components-add',
  templateUrl: './components-add.component.html',
  styleUrls: ['./components-add.component.scss']
})
export class ComponentsAddComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
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
