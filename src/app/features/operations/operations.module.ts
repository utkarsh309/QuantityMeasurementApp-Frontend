import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { OperationsComponent } from './operations.component';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [{ path: '', component: OperationsComponent }];

@NgModule({
  declarations: [OperationsComponent],
  imports: [CommonModule, FormsModule, SharedModule, HttpClientModule, RouterModule.forChild(routes)]
})
export class OperationsModule {}
