import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { ProductTileComponent } from '../components/product-tile/product-tile.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatNativeDateModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { SortByPipe } from './sort-by.pipe';
import { ReservationComponent } from '../components/reservation/reservation.component';
import { UserDataComponent } from '../components/user-data/user-data.component';
import { KeyPipe } from './key.pipe';
import { FormatTablePipe } from './format-table.pipe';
import { ListItemPipe } from './list-item.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({

  declarations: [
    ProductTileComponent,
    ReservationComponent,
    UserDataComponent,
    SortByPipe,
    KeyPipe,
    FormatTablePipe,
    ListItemPipe
  ],
  imports: [
    MatMenuModule,
    CommonModule,
    MatCardModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    // MatRadioModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatStepperModule,
    MatExpansionModule,
    MatTableModule,
    MatSnackBarModule,
    ReactiveFormsModule,
  ],
  exports: [
    MatMenuModule,
    MatCardModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    // MatRadioModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatStepperModule,
    MatExpansionModule,
    MatTableModule,
    MatSnackBarModule,
    ReactiveFormsModule,

    ProductTileComponent,
    ReservationComponent,
    UserDataComponent,
    SortByPipe,
    KeyPipe,
    ListItemPipe,
    FormatTablePipe
  ],
  providers: [
    MatDatepickerModule
  ]
})
export class SharedModule { }
