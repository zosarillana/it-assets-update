// import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
// import { MatDrawer } from '@angular/material/sidenav';
// import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
// import { Subject } from 'rxjs';
// import { takeUntil } from 'rxjs/operators';

// @Component({
//   selector: 'app-user-setttings',
//   templateUrl: './user-setttings.component.html',
//   styleUrls: ['./user-setttings.component.scss']
// })
// export class UserSetttingsComponent implements OnInit, OnDestroy
//   {
//     @ViewChild('drawer') drawer: MatDrawer;
//     drawerMode: 'over' | 'side' = 'side';
//     drawerOpened: boolean = true;
//     panels: any[] = [];
//     selectedPanel: string = 'account';
//     private _unsubscribeAll: Subject<any> = new Subject<any>();

//     /**
//      * Constructor
//      */
//     constructor(
//         private _changeDetectorRef: ChangeDetectorRef,
//         private _fuseMediaWatcherService: FuseMediaWatcherService
//     )
//     {
//     }

//     // -----------------------------------------------------------------------------------------------------
//     // @ Lifecycle hooks
//     // -----------------------------------------------------------------------------------------------------

//     /**
//      * On init
//      */
//     ngOnInit(): void
//     {
//         // Setup available panels
//         this.panels = [
//             {
//                 id         : 'account',
//                 icon       : 'heroicons_outline:user-circle',
//                 // title      : 'Account',
//                 description: 'Manage your public profile and private information'
//             },
//             {
//                 id         : 'security',
//                 icon       : 'heroicons_outline:lock-closed',
//                 // title      : 'Security',
//                 description: 'Manage your password'
//             },            
//         ];

//         // Subscribe to media changes
//         this._fuseMediaWatcherService.onMediaChange$
//             .pipe(takeUntil(this._unsubscribeAll))
//             .subscribe(({matchingAliases}) => {

//                 // Set the drawerMode and drawerOpened
//                 if ( matchingAliases.includes('lg') )
//                 {
//                     this.drawerMode = 'side';
//                     this.drawerOpened = true;
//                 }
//                 else
//                 {
//                     this.drawerMode = 'over';
//                     this.drawerOpened = false;
//                 }

//                 // Mark for check
//                 this._changeDetectorRef.markForCheck();
//             });
//     }

//     /**
//      * On destroy
//      */
//     ngOnDestroy(): void
//     {
//         // Unsubscribe from all subscriptions
//         this._unsubscribeAll.next();
//         this._unsubscribeAll.complete();
//     }

//     // -----------------------------------------------------------------------------------------------------
//     // @ Public methods
//     // -----------------------------------------------------------------------------------------------------

//     /**
//      * Navigate to the panel
//      *
//      * @param panel
//      */
//     goToPanel(panel: string): void
//     {
//         this.selectedPanel = panel;

//         // Close the drawer on 'over' mode
//         if ( this.drawerMode === 'over' )
//         {
//             this.drawer.close();
//         }
//     }

//     /**
//      * Get the details of the panel
//      *
//      * @param id
//      */
//     getPanelInfo(id: string): any
//     {
//         return this.panels.find(panel => panel.id === id);
//     }

//     /**
//      * Track by function for ngFor loops
//      *
//      * @param index
//      * @param item
//      */
//     trackByFn(index: number, item: any): any
//     {
//         return item.id || index;
//     }
// }