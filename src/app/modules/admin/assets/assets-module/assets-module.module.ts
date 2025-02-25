import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryTableComponent } from '../profiles/inventory/inventory-table/inventory-table.component';
import { Route, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AssetImportComponent } from '../profiles/import/asset-import/asset-import.component';
import { AssetExportComponent } from '../profiles/export/asset-export/asset-export.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FuseCardModule } from '@fuse/components/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { PeripheralsDetailsComponent } from '../details/peripherals/peripherals-details/peripherals-details.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { ImportPeripheralsComponent } from '../profiles/import/import-peripherals/import-peripherals.component';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { ModalCreateUserAddComponent } from '../cards/user/modal-create-user-add/modal-create-user-add.component';
import { ModalUniversalComponent } from '../components/modal/modal-universal/modal-universal.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { SharedModule } from 'app/shared/shared.module';
import { FuseHighlightModule } from '@fuse/components/highlight';
import { DetailsPcCardComponent } from '../cards/pc/details-pc-card/details-pc-card.component';
import { FuseAlertModule } from '@fuse/components/alert';
import { ModalCreatePcCardComponent } from '../cards/pc/modal-create-pc-card/modal-create-pc-card.component';
import { SidePanelPcCardComponent } from '../cards/pc/side-panel-pc-card/side-panel-pc-card.component';
import { SidePanelPcsComponent } from '../details/pc/side-panel-pcs/side-panel-pcs.component';
import { SidePanelPeripheralsComponent } from '../details/peripherals/peripherals-details/side-panel-peripherals/side-panel-peripherals.component';
import { PcDetailsComponent } from '../details/pc/pc-details/pc-details.component';
import { PcCardComponent } from '../cards/pc/pc-card/pc-card.component';
import { UserCardComponent } from '../cards/user/user-card/user-card.component';
import { PcModalCreateComponent } from '../details/pc/pc-modal-create/pc-modal-create.component';
import { PeripheralModalCreateComponent } from '../details/peripherals/peripherals-details/peripheral-modal-create/peripheral-modal-create.component';
import { MonitorDetailsComponent } from '../details/peripherals/monitor-details/monitor-details.component';
import { MonitorModalCreateComponent } from '../details/peripherals/monitor-details/monitor-modal-create/monitor-modal-create.component';
import { SidePanelMonitorComponent } from '../details/peripherals/monitor-details/side-panel-monitor/side-panel-monitor.component';
import { ImportAssetsComponent } from '../profiles/import-assets/import-assets.component';
import { ImportMasterdataComponent } from '../profiles/import/import-masterdata/import-masterdata.component';
import { InventoryListComponent } from '../assets-inventory/inventory-list/inventory-list.component';
import { InventoryAddComponent } from '../assets-inventory/inventory-add/inventory-add.component';
import { FuseScrollbarModule } from '@fuse/directives/scrollbar';
import { InventoryViewComponent } from '../assets-inventory/inventory-view/inventory-view.component';
import { AccountabilityListComponent } from '../assets-accountability/accountability-list/accountability-list.component';
import { AccountabilityFormComponent } from '../assets-accountability/forms/accountability-form/accountability-form.component';
import { AccoundabilityAddComponent } from '../assets-accountability/create-accountability/accountability-add.component';
import { InventoryEditComponent } from '../assets-inventory/inventory-edit/inventory-edit.component';
import { ComputersListComponent } from '../assets-computers/computers-list/computers-list.component';
import { ComputersViewComponent } from '../assets-computers/computers-view/computers-view.component';
import { ComputersEditComponent } from '../assets-computers/computers-edit/computers-edit.component';
import { ComputersAddComponent } from '../assets-computers/computers-add/computers-add.component';
import { ComponentsViewComponent } from '../assets-components/components-view/components-view.component';
import { ComponentsAddComponent } from '../assets-components/components-add/components-add.component';
import { ComponentsEditComponent } from '../assets-components/components-edit/components-edit.component';
import { ComponentsListComponent } from '../assets-components/components-list/components-list.component';
import { ErrorPageComponent } from '../error-page/error-page.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card'; 
import { ComputerComponentAddModalComponent } from '../assets-computers/computers-add/computer-component-add-modal/computer-component-add-modal.component';
import { CopmuterAssetsAddModalComponent } from '../assets-computers/computers-add/copmuter-assets-add-modal/copmuter-assets-add-modal.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';

const assetRoute: Route[] = [
    // {
    //     path: 'inventory',
    //     component: InventoryTableComponent,
    // },
    {
        path: 'import-assets',
        component: ImportAssetsComponent,
    },
    {
        path: 'error',
        component: ErrorPageComponent,
    },
    {
        path: 'pc',
        component: PcDetailsComponent,
    },
    {
        path: 'peripherals/specification',
        component: PeripheralsDetailsComponent,
    },
    {
        path: 'peripherals/monitor',
        component: MonitorDetailsComponent,
    },
    {
        path: 'cards/users',
        component: UserCardComponent,
    },
    {
        path: 'cards/pcs',
        component: PcCardComponent,
    },
    {
        path: 'inventory',
        component: InventoryListComponent,
    },
    {
        path: 'inventory/add',
        component: InventoryAddComponent,
    },
    {
        path: 'inventory/edit/:id',
        component: InventoryEditComponent,
    },
    {
        path: 'inventory/view/:id',
        component: InventoryViewComponent,
    },

    {
        path: 'accountability',
        component: AccountabilityListComponent,
    },
    {
        path: 'accountability/view/:id',
        component: AccountabilityFormComponent,
    },
    {
        path: 'accountability/add',
        component: AccoundabilityAddComponent,
    },
    {
        path: 'computers',
        component: ComputersListComponent,
    },
    {
        path: 'computers/view/:id',
        component: ComputersViewComponent,
    },
    {
        path: 'computers/add',
        component: ComputersAddComponent,
    },
    {
        path: 'computers/edit/:id',
        component: ComputersEditComponent,
    },
    {
        path: 'components',
        component: ComponentsListComponent,
    },
    // {
    //     path: 'components/view/:uid/:asset_barcode',
    //     component: ComponentsViewComponent,
    // },
    {
        path: 'components/view/:uid',
        component: ComponentsViewComponent,
    },
    {
        path: 'components/add',
        component: ComponentsAddComponent,
    },
    {
        path: 'components/edit/:uid',
        component: ComponentsEditComponent,
    },
];

@NgModule({
    declarations: [
        SidePanelPcCardComponent,
        SidePanelPeripheralsComponent,
        SidePanelPcsComponent,
        ModalUniversalComponent,
        ModalCreateUserAddComponent,
        PcCardComponent,
        UserCardComponent,
        InventoryTableComponent,
        ImportAssetsComponent,
        ImportPeripheralsComponent,
        AssetImportComponent,
        AssetExportComponent,
        PcDetailsComponent,
        PeripheralsDetailsComponent,
        DetailsPcCardComponent,
        ModalCreatePcCardComponent,
        PcModalCreateComponent,
        PeripheralModalCreateComponent,
        MonitorDetailsComponent,
        MonitorModalCreateComponent,
        SidePanelMonitorComponent,
        ImportMasterdataComponent,
        InventoryListComponent,
        InventoryAddComponent,
        InventoryEditComponent,
        InventoryViewComponent,
        AccountabilityListComponent,
        AccountabilityFormComponent,
        AccoundabilityAddComponent,
        ComponentsListComponent,
        ComponentsAddComponent,
        ComponentsViewComponent,
        ComponentsEditComponent,
        ComputersListComponent,
        ComputersEditComponent,
        ComputersAddComponent,
        ComputersViewComponent,
        ComputerComponentAddModalComponent,
        CopmuterAssetsAddModalComponent
        // AlertsComponentComponent,
    ],
    imports: [
        FuseAlertModule,
        MatDividerModule,
        SharedModule,
        FuseHighlightModule,
        MatMomentDateModule,
        MatDatepickerModule,
        MatIconModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatChipsModule,
        MatStepperModule,
        ReactiveFormsModule,
        FormsModule,
        MatDialogModule,
        MatSortModule,
        MatTableModule,
        MatPaginatorModule,
        MatButtonToggleModule,
        MatProgressBarModule,
        FuseCardModule,
        MatMenuModule,
        MatTooltipModule,
        MatIconModule,
        CommonModule,
        MatButtonModule,
        MatSidenavModule,
        MatRadioModule,
        MatCheckboxModule,
        MatDividerModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatMenuModule,
        FuseScrollbarModule,
        MatAutocompleteModule,
        MatTabsModule,        
        MatCardModule,
        MatDialogModule,
        MatSnackBarModule,
        RouterModule.forChild(assetRoute),
    ],
    // schemas: [NO_ERRORS_SCHEMA] // Add this line
})
export class AssetsModuleModule {}
