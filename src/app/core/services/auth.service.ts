import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private router: Router) {}

  // ── Token Helpers ────────────────────────────────────────────
  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  getUsername(): string {
    return localStorage.getItem('username') || 'User';
  }

  saveToken(token: string, username: string): void {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('username', username);
  }

  clearToken(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('username');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    this.clearToken();
    this.router.navigate(['/auth/login']);
  }

  // ── OAuth Helpers ────────────────────────────────────────────
  /**
   * Called on the home page (or any OAuth callback landing page).
   * Reads ?token= from the URL, saves it, cleans the URL, navigates to operations.
   * Returns true if a token was found.
   */
  handleOAuthCallback(): boolean {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token') || params.get('jwt');
    const name   = params.get('email') || params.get('name') || 'Google User';

    if (!token) return false;

    this.saveToken(token, decodeURIComponent(name));
    window.history.replaceState({}, document.title, window.location.pathname);
    this.router.navigate(['/operations']);
    return true;
  }

  getAvatarLetter(): string {
    return this.getUsername().charAt(0).toUpperCase();
  }
}
