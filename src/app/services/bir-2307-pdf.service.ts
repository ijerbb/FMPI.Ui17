import { Injectable } from '@angular/core';
import { PdfTemplateService, PdfTemplateConfig, FieldPosition } from './pdf-template.service';
import { BirSlspFormData } from '../models/dto/birTransactionDto';
import { ApplicationConfigurationService } from './application-configuration.service';

/**
 * BIR Information from Application Configuration
 */
interface BirInformation {
  SignatoryName: string;
  SignatoryDesignation: string;
  SignatoryTinNo: string;
  PayorName: string;
  PayorAddress: string;
  PayorTinNo: string;
  PayorZipCode: string;
}

/**
 * BIR Form 2307 PDF Service
 *
 * Extends the generic PdfTemplateService with BIR Form 2307 specific logic.
 * Handles field mapping, data transformation, and form-specific formatting.
 *
 * Template Location: FMPI.Ui/src/assets/templates/2307.pdf
 */
@Injectable({
  providedIn: 'root'
})
export class Bir2307PdfService extends PdfTemplateService {
  private static readonly BIR_INFO_CONFIG_KEY = 'BIRInformation';

  /** BIR 2307 template configuration */
  protected override config: PdfTemplateConfig = {
    templatePath: 'assets/templates/2307.pdf',
    fieldPositions: {
      // Period Section
      periodFrom: { x: 154, y: 820 },
      periodTo: { x: 402, y: 820 },

      // Payee Information
      payeeTinNo: { x: 210, y: 788 },
      payeeName: { x: 50, y: 760 },
      payeeRegisteredAddress: { x: 50, y: 732 },
      payeeZipCode: { x: 546, y: 732 },

      // Payor Information
      payorTinNo: { x: 210, y: 672 },
      payorName: { x: 50, y: 644 },
      payorRegisteredAddress: { x: 50, y: 617 },
      payorZipCode: { x: 546, y: 617 },

      // Authorized Person Information
      authorizedPersonDesignation: { x: 350, y: 195 },
      authorizedPersonTitle: { x: 50, y: 195 },
      authorizedPersonTIN: { x: 200, y: 195 },

      // Quarterly Summary
      ATCCode: { x: 180, y: 560 },
      firstMonthOfQuarter: { x: 240, y: 560, align: 'right', width: 45 },
      secondMonthOfQuarter: { x: 290, y: 560, align: 'right', width: 45 },
      thirdMonthOfQuarter: { x: 340, y: 560, align: 'right', width: 45 },
      monthTotal: { x: 480, y: 560, align: 'right', width: 25 },
      taxWithheld: { x: 560, y: 560, align: 'right', width: 25 },
      grandTotal: { x: 480, y: 255, align: 'right', width: 25 },
      taxWithheldTotal: { x: 560, y: 255, align: 'right', width: 25 }
    },
    boldFields: [
      'periodFrom', 'periodTo',
      'payeeTinNo', 'payeeName', 'payeeRegisteredAddress', 'payeeZipCode',
      'payorTinNo', 'payorName', 'payorRegisteredAddress', 'payorZipCode',
      'authorizedPersonDesignation', 'authorizedPersonTitle', 'authorizedPersonTIN',
      'ATCCode', 'firstMonthOfQuarter', 'secondMonthOfQuarter', 'thirdMonthOfQuarter', 'monthTotal', 'taxWithheld', 'grandTotal', 'taxWithheldTotal'
    ],
    defaultFontSize: 10,
    defaultColor: { r: 0, g: 0, b: 0 }
  };

  // Cached BIR information
  private birInformation: BirInformation | null = null;
  private birInfoLoadPromise: Promise<BirInformation> | null = null;

  constructor(private appConfigService: ApplicationConfigurationService) {
    super();
    // Subscribe to configuration changes to clear cache
    this.appConfigService.configurationChanged$.subscribe(() => {
      this.clearCache();
    });
  }

  /**
   * Clear the cached BIR information
   * Call this when you want to force reload from Application Configuration
   */
  clearCache(): void {
    this.birInformation = null;
    this.birInfoLoadPromise = null;
  }

  /**
   * Load BIR Information from Application Configuration
   */
  private async loadBirInformation(): Promise<BirInformation> {
    // Return cached value if available
    if (this.birInformation) {
      return Promise.resolve(this.birInformation);
    }

    // Return existing promise if already loading
    if (this.birInfoLoadPromise) {
      return this.birInfoLoadPromise;
    }

    // Load from API
    this.birInfoLoadPromise = this.appConfigService.getConfigByKey(Bir2307PdfService.BIR_INFO_CONFIG_KEY)
      .toPromise()
      .then(config => {
        if (!config || !config.value) {
          throw new Error('BIRInformation configuration not found');
        }

        const birInfo = JSON.parse(config.value) as BirInformation;
        this.birInformation = birInfo;
        return birInfo;
      })
      .catch(error => {
        throw error;
      })
      .finally(() => {
        this.birInfoLoadPromise = null;
      });

    return this.birInfoLoadPromise;
  }

  /**
   * Generate and download PDF for BIR Form 2307
   * @param formData - The form data to populate
   */
  async generate2307Pdf(formData: BirSlspFormData): Promise<void> {
    const pdfBytes = await this.generate2307PdfInternal(formData);

    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BIR2307_${formData.transNum || 'SLSP'}_${Date.now()}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Generate PDF and return as Blob (for preview modal)
   * @param formData - The form data to populate
   * @returns Promise<Blob> - PDF blob
   */
  async generate2307PdfBlob(formData: BirSlspFormData): Promise<Blob> {
    const pdfBytes = await this.generate2307PdfInternal(formData);
    return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  }

  /**
   * Internal PDF generation for BIR 2307
   */
  private async generate2307PdfInternal(formData: BirSlspFormData): Promise<Uint8Array> {
    try {
      // Load BIR information from configuration
      const birInfo = await this.loadBirInformation();

      // Prepare field values
      const fields = this.prepare2307Fields(formData, birInfo);

      // Use parent class method to generate PDF
      return await this.generatePdfInternal(fields);

    } catch (error: any) {
      throw new Error('Failed to generate BIR 2307 PDF: ' + error.message);
    }
  }

  /**
   * Prepare field values for BIR 2307 form
   */
  private prepare2307Fields(formData: BirSlspFormData, birInfo: BirInformation): Record<string, string> {
    // Field configuration: key -> insertSpacesAt parameters (or null for no formatting)
    const fieldConfig: Record<string, Array<[number, number]> | null> = {
      // Period Section
      periodFrom: [[1, 3], [2, 2], [4, 3], [5, 2], [7, 3], [8, 2], [9, 2]],
      periodTo: [[1, 3], [2, 2], [4, 3], [5, 2], [7, 3], [8, 2], [9, 2]],

      // Payor Information
      payorTinNo: [[1, 3], [2, 3], [3, 7], [4, 3], [5, 2], [6, 7], [7, 3], [8, 3], [9, 7], [10, 3], [11, 4], [12, 3], [13, 3]],
      payorName: null,
      payorRegisteredAddress: null,
      payorZipCode: [[1, 2], [2, 3], [3, 2], [4, 2]],

      // Payee Information
      payeeTinNo: [[1, 3], [2, 3], [3, 7], [4, 3], [5, 2], [6, 7], [7, 3], [8, 3], [9, 7], [10, 3], [11, 4], [12, 3], [13, 3]],
      payeeName: null,
      payeeRegisteredAddress: null,
      payeeZipCode: [[1, 2], [2, 3], [3, 2], [4, 2]],

      // Authorized Person Information
      authorizedPersonDesignation: null,
      authorizedPersonTitle: null,
      authorizedPersonTIN: null,

      // Quarterly Summary
      ATCCode: null,
      firstMonthOfQuarter: null,
      secondMonthOfQuarter: null,
      thirdMonthOfQuarter: null,
      monthTotal: null,
      taxWithheld: null,
      grandTotal: null,
      taxWithheldTotal: null
    };

    // Raw field values before formatting
    const rawFields: Record<string, string> = {
      // Period Section
      periodFrom: this.formatPeriod(formData.year, formData.period, 'from'),
      periodTo: this.formatPeriod(formData.year, formData.period, 'to'),

      // Payor Information (from Application Configuration)
      payorTinNo: this.formatTin(birInfo.PayorTinNo),
      payorName: birInfo.PayorName,
      payorRegisteredAddress: birInfo.PayorAddress,
      payorZipCode: birInfo.PayorZipCode || '',

      // Payee Information (from form data)
      payeeTinNo: this.formatTin(formData.payeeTinNo),
      payeeName: formData.payeeName || '',
      payeeRegisteredAddress: formData.payeeRegisteredAddress || '',
      payeeZipCode: formData.payeeZipCode || '',

      // Authorized Person Information (from Application Configuration)
      authorizedPersonDesignation: birInfo.SignatoryDesignation,
      authorizedPersonTitle: birInfo.SignatoryName,
      authorizedPersonTIN: birInfo.SignatoryTinNo || '',

      // Quarterly Summary
      ATCCode: formData.atcCode || '',
      firstMonthOfQuarter: this.getQuarterMonthAmount(formData.period, 'first', formData.totalAmount),
      secondMonthOfQuarter: this.getQuarterMonthAmount(formData.period, 'second', formData.totalAmount),
      thirdMonthOfQuarter: this.getQuarterMonthAmount(formData.period, 'third', formData.totalAmount),
      monthTotal: this.formatAmount(formData.totalAmount),
      taxWithheld: this.formatAmount(formData.taxWithheld),
      grandTotal: this.formatAmount(formData.totalAmount),
      taxWithheldTotal: this.formatAmount(formData.taxWithheld)
    };

    // Apply formatting based on field configuration
    const fields: Record<string, string> = {};
    for (const [key, value] of Object.entries(rawFields)) {
      const spacingConfig = fieldConfig[key];
      fields[key] = spacingConfig ? this.insertSpacesAt(spacingConfig)(value) : value;
    }

    return fields;
  }

  /**
   * Format period date in MM DD YY format
   * @param type - 'from' returns first day of month, 'to' returns last day of month
   */
  private formatPeriod(year: string | null | undefined, period: string | null | undefined, type: 'from' | 'to'): string {
    if (!year || !period) return 'MM DD YY';
    try {
      const monthNum = this.getMonthNumber(period);
      const mm = monthNum.padStart(2, '0');
      const yy = year;

      if (type === 'from') {
        const dd = '01';
        return `${mm} ${dd} ${yy}`;
      } else {
        const yyyy = parseInt(year);
        const month = parseInt(monthNum);
        const lastDay = new Date(yyyy, month, 0).getDate();
        return `${mm} ${String(lastDay).padStart(2, '0')} ${yy}`;
      }
    } catch {
      return 'MM DD YY';
    }
  }

  /**
   * Format TIN - removes dashes and spaces
   */
  private formatTin(tin: string | null | undefined): string {
    if (!tin) return '';
    return tin.replaceAll('-', '').replaceAll(' ', '');
  }

  /**
   * Get the amount for the correct month within a quarter based on the period
   * @param period - Full month name (e.g., 'January', 'February')
   * @param monthPosition - Position within quarter: 'first', 'second', 'third'
   * @param totalAmount - The total/gross amount
   * @returns Formatted amount or empty string if not the matching month
   */
  private getQuarterMonthAmount(
    period: string | null | undefined,
    monthPosition: 'first' | 'second' | 'third',
    totalAmount: number | null | undefined
  ): string {
    if (!period || !totalAmount) return '';

    // Map month positions to their month numbers within a quarter
    const monthMapping: { [key: string]: number[] } = {
      'first': [1, 4, 7, 10],   // Jan, Apr, Jul, Oct (first month of each quarter)
      'second': [2, 5, 8, 11],  // Feb, May, Aug, Nov (second month of each quarter)
      'third': [3, 6, 9, 12]    // Mar, Jun, Sep, Dec (third month of each quarter)
    };

    const monthNum = parseInt(this.getMonthNumber(period));
    const validMonths = monthMapping[monthPosition];

    if (validMonths.includes(monthNum)) {
      return this.formatAmount(totalAmount);
    }

    return '';
  }
}
