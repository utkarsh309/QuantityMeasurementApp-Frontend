import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Handle Google OAuth redirect: ?token=JWT&email=Name
    this.authService.handleOAuthCallback();
  }

  goToOperations(): void  { this.router.navigate(['/operations']); }
  goToSignup(): void      { this.router.navigate(['/signup']); }
  goToHistory(): void     { this.router.navigate(['/history']); }
  isLoggedIn(): boolean   { return this.authService.isLoggedIn(); }
}
