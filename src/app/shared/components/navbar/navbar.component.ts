import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  username   = '';
  avatarLetter = '';

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.isLoggedIn  = this.authService.isLoggedIn();
    this.username    = this.authService.getUsername();
    this.avatarLetter = this.authService.getAvatarLetter();
  }

  logout(): void {
    this.authService.logout();
    this.refresh();
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }
}
