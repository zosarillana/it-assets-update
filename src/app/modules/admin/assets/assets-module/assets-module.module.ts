import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryTableComponent } from '../profiles/inventory/inventory-table/inventory-table.component';
import { Route, RouterModule } from '@angular/router';
import { ImportAssetsComponent } from '../profiles/import/import-assets/import-assets.component';
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
import { AlertsComponentComponent } from '../components/alerts-component/alerts-component.component';
import { MonitorDetailsComponent } from '../details/peripherals/monitor-details/monitor-details.component';
import { MonitorModalCreateComponent } from '../details/peripherals/monitor-details/monitor-modal-create/monitor-modal-create.component';
import { SidePanelMonitorComponent } from '../details/peripherals/monitor-details/side-panel-monitor/side-panel-monitor.component';

const assetRoute: Route[] = [
    {
        path: 'inventory',
        component: InventoryTableComponent,
    },
    {
        path: 'import-assets',
        component: ImportAssetsComponent,
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
        path: 'cards/pcs/details/:id',
        component: DetailsPcCardComponent,
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
        RouterModule.forChild(assetRoute),
    ],
    // schemas: [NO_ERRORS_SCHEMA] // Add this line
})
export class AssetsModuleModule {}
