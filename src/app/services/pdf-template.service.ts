import { Injectable } from '@angular/core';
import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib';

/**
 * Represents a field position on the PDF page
 * Coordinates are in points (1/72 inch) from bottom-left corner
 */
export interface FieldPosition {
  x: number;
  y: number;
  align?: 'left' | 'right' | 'center';
  width?: number;
}

/**
 * RGB Color type for PDF text
 */
export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Represents a text field to be drawn on the PDF
 */
export interface PdfTextField {
  text: string;
  position: FieldPosition;
  fontSize?: number;
  color?: RgbColor;
  font?: PDFFont;
}

/**
 * Configuration for a PDF template
 */
export interface PdfTemplateConfig {
  /** Path to the PDF template file in assets */
  templatePath: string;
  /** Field positions mapped by field name */
  fieldPositions: Record<string, FieldPosition>;
  /** Default font size */
  defaultFontSize?: number;
  /** Default text color */
  defaultColor?: RgbColor;
  /** Fields that should use bold font */
  boldFields?: string[];
}

/**
 * Generic PDF Template Service
 *
 * Provides reusable functionality for overlaying text fields onto PDF templates.
 * Uses pdf-lib to merge dynamic fields while preserving original PDF quality.
 *
 * @example
 * // Extend this service for specific PDF forms:
 * @Injectable({ providedIn: 'root' })
 * export class MyFormPdfService extends PdfTemplateService {
 *   protected override config: PdfTemplateConfig = {
 *     templatePath: 'assets/templates/myform.pdf',
 *     fieldPositions: {
 *       fieldName: { x: 100, y: 200 },
 *       fieldDate: { x: 300, y: 200 }
 *     }
 *   };
 * }
 */
@Injectable({
  providedIn: 'root'
})
export class PdfTemplateService {
  /** Template configuration - override in derived classes */
  protected config: PdfTemplateConfig = {
    templatePath: '',
    fieldPositions: {},
    defaultFontSize: 10,
    defaultColor: { r: 0, g: 0, b: 0 }
  };

  constructor() {}

  /**
   * Generate and download PDF
   * @param fields - Key-value pairs of field names and their text values
   * @param fileName - Optional custom file name (default: generated timestamp)
   */
  async generatePdf(fields: Record<string, string>, fileName?: string): Promise<void> {
    const pdfBytes = await this.generatePdfInternal(fields);

    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `PDF_${Date.now()}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Generate PDF and return as Blob (for preview modal)
   * @param fields - Key-value pairs of field names and their text values
   * @returns Promise<Blob> - PDF blob
   */
  async generatePdfBlob(fields: Record<string, string>): Promise<Blob> {
    const pdfBytes = await this.generatePdfInternal(fields);
    return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  }

  /**
   * Internal PDF generation - overlays fields onto template
   */
  protected async generatePdfInternal(fields: Record<string, string>): Promise<Uint8Array> {
    try {
      // Fetch the template PDF
      const templateResponse = await fetch(this.config.templatePath);
      const templateArrayBuffer = await templateResponse.arrayBuffer();

      // Load the template PDF
      const pdfDoc = await PDFDocument.load(templateArrayBuffer);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      // Get fonts (regular and bold)
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Draw all fields
      for (const [fieldName, value] of Object.entries(fields)) {
        const position = this.config.fieldPositions[fieldName];
        if (position) {
          const isBold = this.config.boldFields?.includes(fieldName) ?? false;
          this.drawTextField(firstPage, value, position, isBold ? boldFont : font);
        }
      }

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      return pdfBytes;

    } catch (error: any) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF: ' + error.message);
    }
  }

  /**
   * Draw a single text field on the page
   */
  protected drawTextField(
    page: PDFPage,
    text: string,
    position: FieldPosition,
    font: PDFFont,
    fontSize?: number,
    color?: RgbColor
  ): void {
    const finalColor = color ? rgb(color.r, color.g, color.b) : rgb(this.config.defaultColor!.r, this.config.defaultColor!.g, this.config.defaultColor!.b);
    const finalFontSize = fontSize ?? this.config.defaultFontSize ?? 10;

    const textWidth = font.widthOfTextAtSize(text, finalFontSize);
    let xPosition = position.x;

    if (position.align === 'right' && position.width !== undefined) {
      xPosition = position.x + position.width - textWidth;
    } else if (position.align === 'center' && position.width !== undefined) {
      xPosition = position.x + (position.width - textWidth) / 2;
    }

    page.drawText(text, {
      x: xPosition,
      y: position.y,
      size: finalFontSize,
      font,
      color: finalColor
    });
  }

  /**
   * Utility: Format amount with 2 decimal places
   */
  protected formatAmount(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return '0.00';
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /**
   * Utility: Insert spaces at multiple character positions
   * @param positions - Array of tuples: [characterPosition, spaceCount]
   *                    characterPosition: Position after which to insert spaces (1-based)
   *                    spaceCount: Number of spaces to insert
   * @returns Function that takes a string and returns formatted string
   */
  protected insertSpacesAt(positions: Array<[number, number]>): (value: string) => string {
    return (value: string): string => {
      if (!value || !positions || positions.length === 0) return value;

      // Sort positions in descending order to avoid index shifting issues
      const sortedPositions = [...positions].sort((a, b) => b[0] - a[0]);

      let result = value;
      for (const [position, spaceCount] of sortedPositions) {
        const spaces = ' '.repeat(spaceCount);
        result = `${result.slice(0, position)}${spaces}${result.slice(position)}`;
      }

      return result;
    };
  }

  /**
   * Utility: Get month number from month name
   */
  protected getMonthNumber(monthName: string): string {
    const monthMap: { [key: string]: string } = {
      'January': '01', 'February': '02', 'March': '03', 'April': '04',
      'May': '05', 'June': '06', 'July': '07', 'August': '08',
      'September': '09', 'October': '10', 'November': '11', 'December': '12'
    };

    if (!isNaN(parseInt(monthName))) {
      return monthName.padStart(2, '0');
    }

    return monthMap[monthName] || '01';
  }

  /**
   * Utility: Get quarter from month number
   */
  protected getQuarterFromMonth(monthNumber: string | number): string {
    const month = typeof monthNumber === 'string' ? parseInt(monthNumber) : monthNumber;
    if (month <= 3) return 'Q1';
    if (month <= 6) return 'Q2';
    if (month <= 9) return 'Q3';
    return 'Q4';
  }
}

/**
 * ============================================================================
 * TEMPLATE SETUP GUIDE
 * ============================================================================
 *
 * To create a new PDF template service:
 *
 * 1. Create a new service that extends PdfTemplateService:
 *    @Injectable({ providedIn: 'root' })
 *    export class MyFormPdfService extends PdfTemplateService {
 *      protected override config: PdfTemplateConfig = {
 *        templatePath: 'assets/templates/myform.pdf',
 *        fieldPositions: {
 *          fieldName: { x: 100, y: 200 },
 *          fieldDate: { x: 300, y: 200 }
 *        },
 *        defaultFontSize: 10,
 *        defaultColor: rgb(0, 0, 0)
 *      };
 *    }
 *
 * 2. Adjust field positions:
 *    - Coordinates are from BOTTOM-LEFT corner (PDF standard)
 *    - Units: points (1/72 inch)
 *    - A4 landscape = 841.89 x 595.28 points
 *
 * 3. Add custom formatting methods in your derived service if needed
 *
 * 4. Test and adjust:
 *    - Generate PDF
 *    - Check alignment
 *    - Adjust x,y values
 *
 * Position Tips:
 * - x increases → moves RIGHT
 * - y increases → moves UP
 * - Start with approximate positions, then fine-tune
 */
