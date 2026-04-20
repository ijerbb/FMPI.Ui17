import { Component, OnInit, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApplicationConfigurationService } from '../../../services/application-configuration.service';
import { AlertService } from '../../../services/alert.service';
import { ApplicationConfigurationDto, ApplicationConfigurationSaveDto } from '../../../models/dto/applicationConfigurationDto';
import { ResponseDto } from '../../../models/dto/responseDto';
import { ActionMenuComponent } from '../action-menu/action-menu.component';

@Component({
  selector: 'app-appconfig-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ActionMenuComponent],
  templateUrl: './appconfig-detail.component.html',
  styleUrls: ['./appconfig-detail.component.css']
})
export class AppconfigDetailComponent implements OnInit {
  config: ApplicationConfigurationDto = {
    key: '',
    value: '{}',
    description: '',
    category: 'Setting'
  };
  
  sysPk: number | null = null;
  isEditMode: boolean = false;
  loading: boolean = false;
  activeTab: 'form' | 'json' = 'form';
  
  // JSON Editor
  jsonValue: string = '{}';
  jsonError: string | null = null;
  jsonValid: boolean = true;
  
  // Dynamic Form
  formFields: any = {};

  // Category options
  categories = ['Feature', 'Setting', 'UI', 'System'];

  // Modal properties
  newFieldName: string = '';
  newFieldType: string = 'string';
  fieldToDelete: string = '';
  private backdropElement: HTMLElement | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private configService: ApplicationConfigurationService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    // Get ID from route parameters
    const idFromParamMap = this.route.snapshot.paramMap.get('id');
    const idFromParams = this.route.snapshot.params['id'];
    const urlSegments = this.route.snapshot.url.map(segment => segment.path).join('/');
    
    // Extract ID from multiple sources
    let id = idFromParamMap || idFromParams;
    if (!id && urlSegments.includes('/new')) {
      id = 'new';
    }

    if (id === 'new') {
      // New configs start in edit mode
      this.isEditMode = true;
      this.config = {
        key: '',
        value: '{}',
        description: '',
        category: 'Setting'
      };
      this.jsonValue = '{}';
      this.parseJsonToForm();
    } else if (id && !isNaN(Number(id))) {
      // Existing configs start in view mode
      this.sysPk = +id;
      this.isEditMode = false;
      this.loadConfiguration();
    } else {
      // Defer navigation to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.alertService.setCustomErrorAlert('Invalid configuration ID: ' + id);
        this.router.navigate(['/settings/appconfig']);
      }, 0);
    }
    
    // Emit toggle states to action-menu
    // toggleSave = isEditMode, toggleEdit = !isEditMode
  }
  
  /**
   * Handle edit button click (toggles between Edit and Cancel)
   */
  onEdit(): void {
    if (this.isEditMode) {
      // Currently in edit mode, cancel and go back to view mode
      this.isEditMode = false;
      // Reload the configuration to reset any changes
      if (this.sysPk) {
        this.loadConfiguration();
      }
    } else {
      // Currently in view mode, enable edit mode
      this.isEditMode = true;
    }
  }
  
  /**
   * Handle add button click - navigate to new configuration
   */
  onAdd(): void {
    this.router.navigate(['/settings/appconfig/new']);
  }

  loadConfiguration(): void {
    if (!this.sysPk) {
      this.alertService.setCustomErrorAlert('Invalid configuration ID');
      this.router.navigate(['/settings/appconfig']);
      return;
    }

    this.loading = true;
    this.configService.getConfigById(this.sysPk).subscribe({
      next: (result) => {
        this.config = result;
        this.jsonValue = result.value || '{}';
        this.parseJsonToForm();
        this.loading = false;
      },
      error: (error) => {
        this.alertService.setCustomErrorAlert('Failed to load configuration');
        this.loading = false;
        this.router.navigate(['/settings/appconfig']);
      }
    });
  }

  /**
   * Parse JSON to form fields for Smart Form tab
   */
  parseJsonToForm(): void {
    try {
      this.formFields = JSON.parse(this.jsonValue);
      this.jsonError = null;
      this.jsonValid = true;
    } catch (e) {
      this.jsonError = 'Invalid JSON format';
      this.jsonValid = false;
      this.formFields = {};
    }
  }

  /**
   * Update JSON from form fields
   */
  updateJsonFromForm(): void {
    this.jsonValue = JSON.stringify(this.formFields, null, 2);
    this.validateJson();
  }

  /**
   * Validate JSON string
   */
  validateJson(): void {
    try {
      JSON.parse(this.jsonValue);
      this.jsonError = null;
      this.jsonValid = true;
    } catch (e) {
      this.jsonError = 'Invalid JSON format';
      this.jsonValid = false;
    }
  }

  /**
   * Switch to Smart Form tab
   */
  switchToFormTab(): void {
    if (!this.jsonValid) {
      const confirmed = confirm('JSON is invalid. Switching may lose data. Continue?');
      if (!confirmed) return;
    }
    this.parseJsonToForm();
    this.activeTab = 'form';
  }

  /**
   * Switch to JSON Editor tab
   */
  switchToJsonTab(): void {
    this.updateJsonFromForm();
    this.activeTab = 'json';
  }

  /**
   * Add new field in Smart Form
   */
  addField(): void {
    this.newFieldName = '';
    this.newFieldType = 'string';
    this.showAddFieldModal();
  }

  /**
   * Show add field modal
   */
  showAddFieldModal(): void {
    const modal = document.getElementById('addFieldModal');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';

      // Add backdrop
      this.backdropElement = document.createElement('div');
      this.backdropElement.className = 'modal-backdrop fade show';
      this.backdropElement.setAttribute('data-bs-dismiss', 'modal');
      this.backdropElement.addEventListener('click', () => this.closeAddFieldModal());
      document.body.appendChild(this.backdropElement);
    }
  }

  /**
   * Close add field modal
   */
  closeAddFieldModal(): void {
    const modal = document.getElementById('addFieldModal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    }

    // Remove backdrop
    if (this.backdropElement) {
      this.backdropElement.remove();
      this.backdropElement = null;
    }

    this.newFieldName = '';
    this.newFieldType = 'string';
  }

  /**
   * Confirm add field
   */
  confirmAddField(): void {
    if (!this.newFieldName || this.formFields.hasOwnProperty(this.newFieldName)) {
      this.alertService.setCustomErrorAlert('Invalid or duplicate field name');
      return;
    }

    let defaultValue: any = false;

    switch (this.newFieldType) {
      case 'string':
        defaultValue = '';
        break;
      case 'number':
        defaultValue = 0;
        break;
      case 'boolean':
        defaultValue = false;
        break;
      default:
        defaultValue = '';
    }

    this.formFields[this.newFieldName] = defaultValue;
    this.updateJsonFromForm();
    this.closeAddFieldModal();
  }

  /**
   * Remove field from Smart Form
   */
  removeField(fieldName: string): void {
    this.fieldToDelete = fieldName;
    this.showDeleteFieldModal();
  }

  /**
   * Show delete field modal
   */
  showDeleteFieldModal(): void {
    const modal = document.getElementById('deleteFieldModal');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';

      // Add backdrop
      this.backdropElement = document.createElement('div');
      this.backdropElement.className = 'modal-backdrop fade show';
      this.backdropElement.setAttribute('data-bs-dismiss', 'modal');
      this.backdropElement.addEventListener('click', () => this.closeDeleteFieldModal());
      document.body.appendChild(this.backdropElement);
    }
  }

  /**
   * Close delete field modal
   */
  closeDeleteFieldModal(): void {
    const modal = document.getElementById('deleteFieldModal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    }

    // Remove backdrop
    if (this.backdropElement) {
      this.backdropElement.remove();
      this.backdropElement = null;
    }

    this.fieldToDelete = '';
  }

  /**
   * Confirm delete field
   */
  confirmDeleteField(): void {
    if (!this.fieldToDelete) return;

    delete this.formFields[this.fieldToDelete];
    this.updateJsonFromForm();
    this.closeDeleteFieldModal();
  }

  /**
   * Update field value in Smart Form
   */
  updateFieldValue(fieldName: string, value: any): void {
    this.formFields[fieldName] = value;
    this.updateJsonFromForm();
  }

  /**
   * Format JSON (beautify)
   */
  formatJson(): void {
    try {
      const parsed = JSON.parse(this.jsonValue);
      this.jsonValue = JSON.stringify(parsed, null, 2);
      this.jsonError = null;
      this.jsonValid = true;
    } catch (e) {
      this.jsonError = 'Cannot format invalid JSON';
    }
  }

  /**
   * Save configuration
   */
  save(): void {
    // Validation
    if (!this.config.key?.trim()) {
      this.alertService.setCustomErrorAlert('Key is required');
      return;
    }

    // Final JSON validation before save
    let finalValue: string;
    try {
      if (this.activeTab === 'form') {
        finalValue = JSON.stringify(this.formFields);
      } else {
        finalValue = this.jsonValue;
        JSON.parse(finalValue); // Validate
      }
    } catch (e) {
      this.alertService.setCustomErrorAlert('Invalid JSON format. Please fix before saving.');
      return;
    }

    this.loading = true;

    const saveDto: ApplicationConfigurationSaveDto = {
      sysPk: this.sysPk || undefined,
      key: this.config.key.trim(),
      value: finalValue,
      description: this.config.description,
      category: this.config.category
    };

    this.configService.saveConfig(saveDto).subscribe({
      next: (response: ResponseDto) => {
        this.loading = false;
        if (response.success) {
          this.alertService.setCustomSuccessAlert(
            'Configuration saved successfully'
          );
          this.router.navigate(['/settings/appconfig']);
        } else {
          this.alertService.setCustomErrorAlert(
            response.data?.toString() || 'Failed to save configuration'
          );
        }
      },
      error: (error) => {
        this.loading = false;
        this.alertService.setCustomErrorAlert('Failed to save configuration');
      }
    });
  }

  /**
   * Delete configuration
   */
  delete(): void {
    if (!this.sysPk) return;

    const confirmed = confirm('Are you sure you want to delete this configuration?');
    if (!confirmed) return;

    this.loading = true;
    this.configService.deleteConfig(this.sysPk).subscribe({
      next: (response: ResponseDto) => {
        this.loading = false;
        if (response.success) {
          this.alertService.setCustomSuccessAlert('Configuration deleted successfully');
          this.router.navigate(['/settings/appconfig']);
        } else {
          this.alertService.setCustomErrorAlert('Failed to delete configuration');
        }
      },
      error: (error) => {
        this.loading = false;
        this.alertService.setCustomErrorAlert('Failed to delete configuration');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/settings/appconfig']);
  }

  /**
   * Get field type from value
   */
  getFieldType(value: any): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }
  
  /**
   * Get keys from formFields object
   */
  getFormFieldKeys(): string[] {
    return Object.keys(this.formFields);
  }
}
