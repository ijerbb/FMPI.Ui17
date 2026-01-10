import { Injectable } from "@angular/core";
import { NgbDateAdapter, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

@Injectable()
export class NgbDateStringAdapter extends NgbDateAdapter<string> {
  readonly DELIMITER = '-';

  // Converts string from model to NgbDateStruct for UI
  fromModel(value: string | null): NgbDateStruct | null {
    // if (!value) return null;
    // const date = value.split(this.DELIMITER);
    // return { year: + date[0], month: + date[1], day: +date[2] };

    if (!value) return null; 

    const [year, month, day] = value.split("T")[0].split(this.DELIMITER).map(x => +x); 
    
    return { year, month, day };
  }

  // Converts NgbDateStruct from UI to string for model
  toModel(date: NgbDateStruct | null): string | null {
    if (!date) return null; 
    const year = date.year; const month = String(date.month).padStart(2, '0'); const day = String(date.day).padStart(2, '0'); 
    return `${year}${this.DELIMITER}${month}${this.DELIMITER}${day}`;

    //return date ? `${date.year}${this.DELIMITER}${date.month}${this.DELIMITER}${date.day}` : null;
  }
}