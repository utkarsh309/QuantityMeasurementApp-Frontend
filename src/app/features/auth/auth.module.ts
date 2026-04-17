import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { SharedModule } from '../../shared/shared.module';
import { GuestGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  { path: 'login',  component: LoginComponent,  canActivate: [GuestGuard] },
  { path: 'signup', component: SignupComponent,  canActivate: [GuestGuard] },
  { path: '',       redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  declarations: [LoginComponent, SignupComponent],
  imports: [CommonModule, FormsModule, SharedModule, HttpClientModule, RouterModule.forChild(routes)]
})
export class AuthModule {}
