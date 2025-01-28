import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Asset } from '../forms/accountability-form/accountability-form.component';

interface AssetItem {
    id: string;
    assetBarcode: string;
    type?: string;
    dateAcquired?: Date;
    brand?: string;
    model?: string;
    serialNumber?: string;
    status?: string;
}

@Component({
    selector: 'app-accountability-add',
    templateUrl: './accountability-add.component.html',
    styleUrls: ['./accountability-add.component.scss'],
})
export class AccoundabilityAddComponent implements OnInit {
    @ViewChild('pcInput') pcInput!: ElementRef<HTMLInputElement>;
    @ViewChild('fruitInput') fruitInput!: ElementRef<HTMLInputElement>;
  
    accountabilityForm: FormGroup;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    
    selectedPcs: AssetItem[] = [];
    selectedPeris: AssetItem[] = [];
    
    filteredPcs: AssetItem[] = [];
    filteredFruits: AssetItem[] = [];
    
    allPcs: AssetItem[] = [];
    allPeripherals: AssetItem[] = [];
  
    constructor(private fb: FormBuilder) {
        this.accountabilityForm = this.fb.group({
            assign_pc: ['', Validators.required],
            assign_peripherals: ['']
        });
    }
  
    ngOnInit(): void {
        this.loadAssets();
    }
  
    
    private loadAssets(): void {
        // Mock data using the new interface
        this.allPcs = [
            {
                id: '1',
                assetBarcode: 'PC001',
                type: 'Desktop',
                // dateAcquired: new Date('2024-01-01'),
                brand: 'Dell',
                model: 'OptiPlex 7090',
                serialNumber: 'DELL123456',
                status: 'Available'
            },
            {
                id: '2',
                assetBarcode: 'PC002',
                type: 'Laptop',
                // dateAcquired: new Date('2024-01-15'),
                brand: 'HP',
                model: 'EliteBook 850',
                serialNumber: 'HP789012',
                status: 'Available'
            }
        ];
        
        this.allPeripherals = [
            {
                id: '1',
                assetBarcode: 'PER001',
                type: 'Monitor',
                // dateAcquired: new Date('2024-01-01'),
                brand: 'Dell',
                model: 'P2419H',
                serialNumber: 'MON123456',
                status: 'Available'
            },
            {
                id: '2',
                assetBarcode: 'PER002',
                type: 'Keyboard',
                // dateAcquired: new Date('2024-01-15'),
                brand: 'Logitech',
                model: 'MK270',
                serialNumber: 'LOG789012',
                status: 'Available'
            }
        ];
    }
  
    filterPCs(value: string): void {
        const filterValue = value.toLowerCase();
        this.filteredPcs = this.allPcs.filter(pc => 
            pc.assetBarcode.toLowerCase().includes(filterValue)
        );
    }
  
    filterFruits(value: string): void {
        const filterValue = value.toLowerCase();
        this.filteredFruits = this.allPeripherals.filter(peripheral => 
            peripheral.assetBarcode.toLowerCase().includes(filterValue)
        );
    }
  
    addPc(event: MatChipInputEvent): void {
        if (event.value) {
            event.chipInput!.clear();
        }
    }
  
    add(event: MatChipInputEvent): void {
        if (event.value) {
            event.chipInput!.clear();
        }
    }
  
    selectedPc(event: MatAutocompleteSelectedEvent): void {
        const selectedAsset = this.allPcs.find(pc => pc.assetBarcode === event.option.value);
        if (selectedAsset && !this.selectedPcs.includes(selectedAsset)) {
            this.selectedPcs.push(selectedAsset);
        }
        this.pcInput.nativeElement.value = '';
        this.accountabilityForm.get('assign_pc')?.setValue(null);
    }
  
    selectedPeripherals(event: MatAutocompleteSelectedEvent): void {
        const selectedAsset = this.allPeripherals.find(p => p.assetBarcode === event.option.value);
        if (selectedAsset && !this.selectedPeris.includes(selectedAsset)) {
            this.selectedPeris.push(selectedAsset);
        }
        this.fruitInput.nativeElement.value = '';
        this.accountabilityForm.get('assign_peripherals')?.setValue(null);
    }
  
    removePc(pc: AssetItem): void {
        const index = this.selectedPcs.indexOf(pc);
        if (index >= 0) {
            this.selectedPcs.splice(index, 1);
        }
    }
  
    remove(peripheral: AssetItem): void {
        const index = this.selectedPeris.indexOf(peripheral);
        if (index >= 0) {
            this.selectedPeris.splice(index, 1);
        }
    }
}