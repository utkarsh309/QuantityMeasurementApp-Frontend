import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { OperationRequest, OperationResponse, HistoryItem, OperationType } from '../../shared/models/quantity.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class QuantityService {

  private readonly apiBase = environment.apiBase;

  private readonly endpoints: Record<OperationType, string> = {
    CONVERT:  '/api/v1/quantities/convert',
    COMPARE:  '/api/v1/quantities/compare',
    ADD:      '/api/v1/quantities/add',
    SUBTRACT: '/api/v1/quantities/subtract',
    DIVIDE:   '/api/v1/quantities/divide'
  };

  constructor(private http: HttpClient, private authService: AuthService) {}

  // ── Build auth headers ───────────────────────────────────────
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const token = this.authService.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // ── Core API Call ────────────────────────────────────────────
  performOperation(op: OperationType, body: OperationRequest): Observable<OperationResponse> {
    const url = `${this.apiBase}${this.endpoints[op]}`;
    return this.http.post<OperationResponse>(url, body, { headers: this.getHeaders() }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  // ── History ──────────────────────────────────────────────────
  getHistory(operation: string): Observable<HistoryItem[]> {
    const url = `${this.apiBase}/api/v1/quantities/history/${operation}`;
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()!}` });
    return this.http.get<HistoryItem[]>(url, { headers }).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
