import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  username  = '';
  password  = '';
  loading   = false;
  alertMsg  = '';
  alertType = 'error';

  private readonly apiBase        = environment.apiBase;
  private readonly authServiceBase = environment.authServiceBase;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/operations']);
    }
  }

  loginWithGoogle(): void {
    window.location.href = `${this.authServiceBase}/oauth2/authorization/google`;
  }

  async onSubmit(): Promise<void> {
    this.clearAlert();

    if (!this.username.trim() || !this.password) {
      this.showAlert('Please fill in all fields.');
      return;
    }

    this.loading = true;

    try {
      const res: any = await this.http.post(
        `${this.apiBase}/auth/login`,
        { username: this.username.trim(), password: this.password }
      ).toPromise();

      const token = res?.token || res?.jwt || res?.accessToken || res?.access_token;

      if (!token) {
        this.showAlert('Login succeeded but no token received.');
        this.loading = false;
        return;
      }

      this.authService.saveToken(token, this.username.trim());
      this.showAlert('Login successful! Redirecting...', 'success');
      setTimeout(() => this.router.navigate(['/operations']), 800);

    } catch (err: any) {
      const msg = err?.error?.message || err?.error?.error || 'Invalid username or password.';
      const isNetwork = err?.status === 0;
      this.showAlert(isNetwork ? 'Cannot reach server. Is the backend running on port 8090?' : msg);
      this.loading = false;
    }
  }

  showAlert(msg: string, type = 'error'): void {
    this.alertMsg  = msg;
    this.alertType = type;
  }

  clearAlert(): void { this.alertMsg = ''; }

  navigate(path: string): void { this.router.navigate([path]); }
}
