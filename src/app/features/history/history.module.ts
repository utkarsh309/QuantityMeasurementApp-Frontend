import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { HistoryComponent } from './history.component';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [{ path: '', component: HistoryComponent }];

@NgModule({
  declarations: [HistoryComponent],
  imports: [CommonModule, SharedModule, HttpClientModule, RouterModule.forChild(routes)]
})
export class HistoryModule {}
