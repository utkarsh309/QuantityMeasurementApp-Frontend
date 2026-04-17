import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { QuantityService } from '../../core/services/quantity.service';
import {
  MeasurementType, OperationType, UNITS,
  SessionHistoryEntry, OperationRequest
} from '../../shared/models/quantity.models';

@Component({
  selector: 'app-operations',
  standalone: false,
  templateUrl: './operations.component.html'
})
export class OperationsComponent implements OnInit {

  // ── State ──────────────────────────────────────────────────
  currentType: MeasurementType = 'LENGTH';
  currentOp: OperationType     = 'CONVERT';
  sessionHistory: SessionHistoryEntry[] = [];

  // ── Alert ──────────────────────────────────────────────────
  alertMsg  = '';
  alertType = 'error';

  // ── Loading per operation ──────────────────────────────────
  loading: Record<OperationType, boolean> = {
    CONVERT: false, COMPARE: false, ADD: false, SUBTRACT: false, DIVIDE: false
  };

  // ── Unit selects ───────────────────────────────────────────
  units: string[]               = [];
  unitDisplay: Record<string, string> = {};

  // ── Convert ────────────────────────────────────────────────
  cvFromVal = ''; cvFromUnit = ''; cvToUnit = ''; cvToVal = '';

  // ── Compare ────────────────────────────────────────────────
  cmpVal1 = ''; cmpUnit1 = ''; cmpVal2 = ''; cmpUnit2 = '';

  // ── Add ────────────────────────────────────────────────────
  addVal1 = ''; addUnit1 = ''; addVal2 = ''; addUnit2 = '';

  // ── Subtract ───────────────────────────────────────────────
  subVal1 = ''; subUnit1 = ''; subVal2 = ''; subUnit2 = '';

  // ── Divide ─────────────────────────────────────────────────
  divVal1 = ''; divUnit1 = ''; divVal2 = ''; divUnit2 = '';

  // ── Results ────────────────────────────────────────────────
  results: Record<string, string | null> = {
    CONVERT: null, ADD: null, SUBTRACT: null, DIVIDE: null
  };
  compareResult: { text: string; cls: string; icon: string } | null = null;

  readonly measurementTypes: MeasurementType[] = ['LENGTH', 'TEMPERATURE', 'VOLUME', 'WEIGHT'];
  readonly operationTypes: OperationType[]     = ['CONVERT', 'COMPARE', 'ADD', 'SUBTRACT', 'DIVIDE'];

  readonly opIcons: Record<OperationType, string> = {
    CONVERT: '🔄', COMPARE: '⚖️', ADD: '➕', SUBTRACT: '➖', DIVIDE: '➗'
  };

  readonly typeIcons: Record<MeasurementType, string> = {
    LENGTH: '📏', TEMPERATURE: '🌡️', VOLUME: '🧪', WEIGHT: '⚖️'
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private quantityService: QuantityService
  ) {}

  ngOnInit(): void {
    this.selectType('LENGTH');
    this.selectOp('CONVERT');
  }

  // ── Type & Op selection ────────────────────────────────────
  selectType(type: MeasurementType): void {
    this.currentType = type;
    const cfg = UNITS[type];
    this.units       = cfg.units;
    this.unitDisplay = cfg.display;
    // Reset unit selects to first/second unit
    const [u0, u1] = cfg.units;
    this.cvFromUnit = u0; this.cvToUnit   = u1 ?? u0;
    this.cmpUnit1   = u0; this.cmpUnit2   = u1 ?? u0;
    this.addUnit1   = u0; this.addUnit2   = u1 ?? u0;
    this.subUnit1   = u0; this.subUnit2   = u1 ?? u0;
    this.divUnit1   = u0; this.divUnit2   = u1 ?? u0;
    this.clearAllResults();
  }

  selectOp(op: OperationType): void {
    this.currentOp = op;
    this.clearAlert();
  }

  // ── Operations ─────────────────────────────────────────────
  async handleConvert(): Promise<void> {
    const val = parseFloat(this.cvFromVal);
    if (this.cvFromVal === '' || isNaN(val)) { this.showAlert('Enter a valid number.'); return; }

    if (this.cvFromUnit === this.cvToUnit) {
      this.cvToVal = String(val);
      this.results['CONVERT'] = `${val} ${this.cvToUnit}`;
      this.addToHistory('CONVERT', `${val} ${this.cvFromUnit}`, `${val} ${this.cvToUnit}`);
      return;
    }

    const body: OperationRequest = {
      operand1: { value: val, unit: this.cvFromUnit, type: this.currentType },
      targetUnit: this.cvToUnit,
      operationType: 'CONVERT'
    };
    await this.callApi('CONVERT', body, (r) => {
      this.cvToVal = r;
      this.results['CONVERT'] = r;
      this.addToHistory('CONVERT', `${val} ${this.cvFromUnit}`, r);
    });
  }

  async handleCompare(): Promise<void> {
    const v1 = parseFloat(this.cmpVal1), v2 = parseFloat(this.cmpVal2);
    if (isNaN(v1) || isNaN(v2)) { this.showAlert('Enter valid numbers for both quantities.'); return; }

    const body: OperationRequest = {
      operand1: { value: v1, unit: this.cmpUnit1, type: this.currentType },
      operand2: { value: v2, unit: this.cmpUnit2, type: this.currentType },
      operationType: 'COMPARE'
    };
    await this.callApi('COMPARE', body, (r) => {
      this.compareResult = this.buildCompareBadge(r);
      this.addToHistory('COMPARE', `${v1} ${this.cmpUnit1} vs ${v2} ${this.cmpUnit2}`, r);
    });
  }

  async handleAdd(): Promise<void> {
    const v1 = parseFloat(this.addVal1), v2 = parseFloat(this.addVal2);
    if (isNaN(v1) || isNaN(v2)) { this.showAlert('Enter valid numbers for both quantities.'); return; }
    const body: OperationRequest = {
      operand1: { value: v1, unit: this.addUnit1, type: this.currentType },
      operand2: { value: v2, unit: this.addUnit2, type: this.currentType },
      operationType: 'ADD'
    };
    await this.callApi('ADD', body, (r) => {
      this.results['ADD'] = r;
      this.addToHistory('ADD', `${v1} ${this.addUnit1} + ${v2} ${this.addUnit2}`, r);
    });
  }

  async handleSubtract(): Promise<void> {
    const v1 = parseFloat(this.subVal1), v2 = parseFloat(this.subVal2);
    if (isNaN(v1) || isNaN(v2)) { this.showAlert('Enter valid numbers for both quantities.'); return; }
    const body: OperationRequest = {
      operand1: { value: v1, unit: this.subUnit1, type: this.currentType },
      operand2: { value: v2, unit: this.subUnit2, type: this.currentType },
      operationType: 'SUBTRACT'
    };
    await this.callApi('SUBTRACT', body, (r) => {
      this.results['SUBTRACT'] = r;
      this.addToHistory('SUBTRACT', `${v1} ${this.subUnit1} − ${v2} ${this.subUnit2}`, r);
    });
  }

  async handleDivide(): Promise<void> {
    const v1 = parseFloat(this.divVal1), v2 = parseFloat(this.divVal2);
    if (isNaN(v1) || isNaN(v2)) { this.showAlert('Enter valid numbers for both quantities.'); return; }
    if (v2 === 0) { this.showAlert('Cannot divide by zero.'); return; }
    const body: OperationRequest = {
      operand1: { value: v1, unit: this.divUnit1, type: this.currentType },
      operand2: { value: v2, unit: this.divUnit2, type: this.currentType },
      operationType: 'DIVIDE'
    };
    await this.callApi('DIVIDE', body, (r) => {
      this.results['DIVIDE'] = r;
      this.addToHistory('DIVIDE', `${v1} ${this.divUnit1} ÷ ${v2} ${this.divUnit2}`, r);
    });
  }

  // ── Shared API caller ──────────────────────────────────────
  private async callApi(op: OperationType, body: OperationRequest, onSuccess: (r: string) => void): Promise<void> {
    this.loading[op] = true;
    this.clearAlert();

    try {
      const data: any = await this.quantityService.performOperation(op, body).toPromise();

      if (data?.error === true) {
        this.showAlert(data.errorMessage || 'Operation failed on server.');
        return;
      }
      onSuccess(data?.result ?? '');

    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        this.authService.clearToken();
        this.showAlert('Session expired. Please login again.');
        setTimeout(() => this.router.navigate(['/auth/login']), 1400);
      } else if (err?.status === 0) {
        this.showAlert('Cannot reach server. Make sure the backend is running on port 8090.');
      } else {
        const msg = err?.error?.message || err?.error?.errorMessage || `Server error ${err?.status}`;
        this.showAlert(msg);
      }
    } finally {
      this.loading[op] = false;
    }
  }

  // ── Compare badge builder ──────────────────────────────────
  private buildCompareBadge(result: string): { text: string; cls: string; icon: string } {
    const upper = result.toUpperCase();
    if (upper.includes('GREATER') || upper.includes('LARGER') || upper.includes('MORE'))
      return { text: result, cls: 'greater', icon: '⬆️' };
    if (upper.includes('LESS') || upper.includes('SMALLER') || upper.includes('LOWER'))
      return { text: result, cls: 'less', icon: '⬇️' };
    return { text: result, cls: 'equal', icon: '🟰' };
  }

  // ── Session history ────────────────────────────────────────
  addToHistory(op: OperationType, fromStr: string, resultStr: string): void {
    this.sessionHistory.unshift({
      op, type: this.currentType, fromStr, resultStr,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    if (this.sessionHistory.length > 30) this.sessionHistory.pop();
  }

  clearHistory(): void { this.sessionHistory = []; }

  // ── Helpers ────────────────────────────────────────────────
  clearAllResults(): void {
    this.results = { CONVERT: null, ADD: null, SUBTRACT: null, DIVIDE: null };
    this.compareResult = null;
    this.cvToVal = '';
  }

  showAlert(msg: string, type = 'error'): void { this.alertMsg = msg; this.alertType = type; }
  clearAlert(): void { this.alertMsg = ''; }

  runCurrent(): void {
    const map: Record<OperationType, () => Promise<void>> = {
      CONVERT: () => this.handleConvert(),
      COMPARE: () => this.handleCompare(),
      ADD:     () => this.handleAdd(),
      SUBTRACT: () => this.handleSubtract(),
      DIVIDE:  () => this.handleDivide()
    };
    map[this.currentOp]();
  }
}
