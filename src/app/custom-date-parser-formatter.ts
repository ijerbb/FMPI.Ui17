import { Injectable } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {

  // Format: DD/MM/YYYY
  parse(value: string): NgbDateStruct | null {
    if (!value) return null;
    const parts = value.split('/');
    return {
      day:   +parts[0],
      month: +parts[1],
      year:  +parts[2]
    };
  }

  format(date: NgbDateStruct | null): string {
    if (!date) return '';
    const day = String(date.day).padStart(2, '0');
    const month = String(date.month).padStart(2, '0');
    return `${day}/${month}/${date.year}`;
  }

  dateToString(date: NgbDateStruct): string | null {
    if (!date) {
      return null;
    }
    // Ensure month and day have leading zeros for standard format (YYYY-MM-DD)
    const month = date.month.toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    return `${date.year}-${month}-${day}`;
  }
}
