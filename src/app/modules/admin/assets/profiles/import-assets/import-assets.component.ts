import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Subject } from 'rxjs';
import { MatDrawer } from '@angular/material/sidenav';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-import-assets',
    templateUrl: './import-assets.component.html',
    styleUrls: ['./import-assets.component.scss'],
})
export class ImportAssetsComponent implements OnInit, OnDestroy {

    @ViewChild('drawer') drawer: MatDrawer;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    panels: any[] = [];
    selectedPanel: string = 'import.masterdata';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    ) {}

    ngOnInit(): void {

       // Setup available panels
       this.panels = [
        {
            id         : 'import.masterdata',
            icon       : 'feather:download',
            title      : 'Import Masterdata',
            description: 'Import masterdata from excel to asset inventory, accountability form.'
        },
        {
            id         : 'import',
            icon       : 'feather:download',
            title      : 'Import Assets',
            description: 'Import data from excel files to assets table'
        },
        {
            id         : 'import.peripherals',
            icon       : 'feather:download',
            title      : 'Import Peripherals',
            description: 'Import data from excel files to peripherals table'
        },
        {
            id         : 'export',
            icon       : 'feather:paperclip',
            title      : 'Export Assets',
            description: 'Export data from excel files to assets table'
        },      
    ];

    // Subscribe to media changes
    this._fuseMediaWatcherService.onMediaChange$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(({matchingAliases}) => {

            // Set the drawerMode and drawerOpened
            if ( matchingAliases.includes('lg') )
            {
                this.drawerMode = 'side';
                this.drawerOpened = true;
            }
            else
            {
                this.drawerMode = 'over';
                this.drawerOpened = false;
            }

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    
      }

      /**
       * On destroy
       */
      ngOnDestroy(): void
      {
          // Unsubscribe from all subscriptions
          this._unsubscribeAll.next();
          this._unsubscribeAll.complete();
      }
  
      // -----------------------------------------------------------------------------------------------------
      // @ Public methods
      // -----------------------------------------------------------------------------------------------------
  
      /**
       * Navigate to the panel
       *
       * @param panel
       */
      goToPanel(panel: string): void
      {
          this.selectedPanel = panel;
  
          // Close the drawer on 'over' mode
          if ( this.drawerMode === 'over' )
          {
              this.drawer.close();
          }
      }
  
      /**
       * Get the details of the panel
       *
       * @param id
       */
      getPanelInfo(id: string): any
      {
          return this.panels.find(panel => panel.id === id);
      }
  
      /**
       * Track by function for ngFor loops
       *
       * @param index
       * @param item
       */
      trackByFn(index: number, item: any): any
      {
          return item.id || index;
      }
  }
  