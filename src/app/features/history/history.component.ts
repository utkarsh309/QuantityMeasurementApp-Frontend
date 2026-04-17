import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { QuantityService } from '../../core/services/quantity.service';
import { HistoryItem } from '../../shared/models/quantity.models';

@Component({
  selector: 'app-history',
  standalone: false,
  templateUrl: './history.component.html'
})
export class HistoryComponent implements OnInit {

  isLoggedIn  = false;
  loading     = false;
  historyItems: HistoryItem[] = [];
  activeFilter = 'all';
  errorMsg = '';

  readonly filters = ['all', 'convert', 'compare', 'add', 'subtract', 'divide'];

  constructor(
    public authService: AuthService,
    private quantityService: QuantityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.loadHistory('all');
    }
  }

  loadHistory(operation: string): void {
    this.activeFilter = operation;
    this.loading      = true;
    this.historyItems = [];
    this.errorMsg     = '';

    this.quantityService.getHistory(operation).subscribe({
      next: (data) => {
        this.historyItems = Array.isArray(data) ? data : [];
        this.loading      = false;
      },
      error: (err) => {
        this.loading = false;
        if (err?.status === 401 || err?.status === 403) {
          this.authService.clearToken();
          this.router.navigate(['/auth/login']);
        } else {
          this.errorMsg = 'Could not reach server. Make sure the backend is running.';
        }
      }
    });
  }

  formatEntry(h: HistoryItem): { op: string; type: string; fromStr: string; result: string } {
    const op     = h.operation || h.operationType || h.op || 'OP';
    const type   = h.type || (h.operand1 as any)?.type || '—';
    const result = h.result || h.resultValue || '—';
    const op1    = h.operand1 ? `${h.operand1.value} ${h.operand1.unit}` : '—';
    const op2    = h.operand2 ? `${h.operand2.value} ${h.operand2.unit}` : null;
    const fromStr = op2 ? `${op1} & ${op2}` : op1;
    return { op, type, fromStr, result };
  }

  goToLogin(): void { this.router.navigate(['/auth/login']); }
}
