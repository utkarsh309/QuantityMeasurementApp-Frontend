import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html'
})
export class SignupComponent implements OnInit {
  username  = '';
  password  = '';
  password2 = '';
  loading   = false;
  alertMsg  = '';
  alertType = 'error';

  private readonly apiBase = environment.apiBase;

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

  async onSubmit(): Promise<void> {
    this.clearAlert();

    if (!this.username.trim() || !this.password || !this.password2) {
      this.showAlert('Please fill in all fields.');
      return;
    }
    if (this.username.trim().length < 3) {
      this.showAlert('Username must be at least 3 characters.');
      return;
    }
    if (this.password.length < 6) {
      this.showAlert('Password must be at least 6 characters.');
      return;
    }
    if (this.password !== this.password2) {
      this.showAlert('Passwords do not match.');
      return;
    }

    this.loading = true;

    try {
      await this.http.post(
        `${this.apiBase}/auth/register`,
        { username: this.username.trim(), password: this.password },
        { responseType: 'text' }
      ).toPromise();

      this.showAlert('Account created! Redirecting to login...', 'success');
      setTimeout(() => this.router.navigate(['/auth/login']), 1200);

    } catch (err: any) {
      const msg = err?.error?.message || err?.error?.error || 'Registration failed. Try a different username.';
      const isNetwork = err?.status === 0;
      this.showAlert(isNetwork ? 'Cannot reach server. Make sure the backend is running on port 8090.' : msg);
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
