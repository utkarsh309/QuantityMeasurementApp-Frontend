// ── Measurement Types ──────────────────────────────────────────
export type MeasurementType = 'LENGTH' | 'TEMPERATURE' | 'VOLUME' | 'WEIGHT';
export type OperationType   = 'CONVERT' | 'COMPARE' | 'ADD' | 'SUBTRACT' | 'DIVIDE';

// ── Unit Definitions ───────────────────────────────────────────
export interface UnitConfig {
  units: string[];
  display: Record<string, string>;
}

export const UNITS: Record<MeasurementType, UnitConfig> = {
  LENGTH: {
    units: ['INCHES', 'FEET', 'YARDS', 'CENTIMETERS'],
    display: {
      INCHES: 'Inches (in)', FEET: 'Feet (ft)',
      YARDS: 'Yards (yd)', CENTIMETERS: 'Centimeters (cm)'
    }
  },
  TEMPERATURE: {
    units: ['CELSIUS', 'FAHRENHEIT'],
    display: { CELSIUS: 'Celsius (°C)', FAHRENHEIT: 'Fahrenheit (°F)' }
  },
  VOLUME: {
    units: ['LITER', 'MILLILITER', 'GALLON'],
    display: {
      LITER: 'Liter (L)', MILLILITER: 'Milliliter (mL)', GALLON: 'Gallon (gal)'
    }
  },
  WEIGHT: {
    units: ['KILOGRAM', 'GRAM', 'POUND'],
    display: {
      KILOGRAM: 'Kilograms (kg)', GRAM: 'Grams (g)', POUND: 'Pounds (lb)'
    }
  }
};

// ── API Request DTOs ───────────────────────────────────────────
export interface Quantity {
  value: number;
  unit: string;
  type: MeasurementType;
}

export interface OperationRequest {
  operand1: Quantity;
  operand2?: Quantity;
  targetUnit?: string;
  operationType: OperationType;
}

export interface OperationResponse {
  result: string;
  error: boolean;
  errorMessage?: string;
}

// ── History Item ───────────────────────────────────────────────
export interface HistoryItem {
  operation?: string;
  operationType?: string;
  op?: string;
  type?: string;
  result?: string;
  resultValue?: string;
  operand1?: { value: number; unit: string; type: string };
  operand2?: { value: number; unit: string; type: string };
  createdAt?: string;
}

// ── Local Session History ──────────────────────────────────────
export interface SessionHistoryEntry {
  op: OperationType;
  type: MeasurementType;
  fromStr: string;
  resultStr: string;
  time: string;
}
