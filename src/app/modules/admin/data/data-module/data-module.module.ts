import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovementTableComponent } from '../movement/movement-table/movement-table.component';
import { Route, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule} from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
const dataRoute:Route[]=[
  {
    path: 'movement',
    component: MovementTableComponent
  },
]

@NgModule({
  declarations: [
    MovementTableComponent
  ],
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatRippleModule,
    MatIconModule,
    CommonModule,
    MatPaginatorModule,  
    MatTableModule,  
    MatSortModule,
    RouterModule.forChild(dataRoute)
  ]
})
export class DataModuleModule { }
