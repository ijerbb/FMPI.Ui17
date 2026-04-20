import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PayeeService } from '../../../services/payee.service';
import { AlertService } from '../../../services/alert.service';
import { UniversalMasterDto, UniversalMasterSaveDto } from '../../../models/dto/universalMasterDto';
import { ResponseDto } from '../../../models/dto/responseDto';
import { ActionMenuComponent } from '../action-menu/action-menu.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-payee-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ActionMenuComponent],
  templateUrl: './payee-detail.component.html',
  styleUrls: ['./payee-detail.component.css']
})
export class PayeeDetailComponent implements OnInit, OnDestroy {
  payee: UniversalMasterDto = {
    userPK: '',
    name: '',
    tINVATNumber: '',
    module: 'SUPLNT'
  };

  sysPk: number | null = null;
  isEditMode: boolean = false;
  loading: boolean = false;
  activeTab: 'moreInfo' | 'systemInfo' = 'moreInfo';
  private routeSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private payeeService: PayeeService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    // Subscribe to route parameter changes to handle navigation between different payees
    this.routeSubscription = this.route.paramMap.subscribe(() => {
      this.loadFromRoute();
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  loadFromRoute(): void {
    // Reset component state
    this.sysPk = null;
    this.isEditMode = false;
    this.loading = false;
    this.activeTab = 'moreInfo';
    this.payee = {
      userPK: '',
      name: '',
      tINVATNumber: '',
      module: 'SUPLNT'
    };

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
      // New payees start in edit mode
      this.isEditMode = true;
      this.payee = {
        userPK: '',
        name: '',
        tINVATNumber: '',
        module: 'SUPLNT'
      };
    } else if (id && !isNaN(Number(id))) {
      // Existing payees start in view mode
      this.sysPk = +id;
      this.isEditMode = false;
      this.loadPayee();
    } else {
      // Defer navigation to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.alertService.setCustomErrorAlert('Invalid payee ID: ' + id);
        this.router.navigate(['/settings/payee']);
      }, 0);
    }
  }

  /**
   * Handle edit button click (toggles between Edit and Cancel)
   */
  onEdit(): void {
    if (this.isEditMode) {
      // Currently in edit mode, cancel and go back to view mode
      this.isEditMode = false;
      // Reload the payee to reset any changes
      if (this.sysPk) {
        this.loadPayee();
      }
    } else {
      // Currently in view mode, enable edit mode
      this.isEditMode = true;
    }
  }

  /**
   * Handle add button click - navigate to new payee
   */
  onAdd(): void {
    this.router.navigate(['/settings/payee/new']);
  }

  loadPayee(): void {
    if (!this.sysPk) {
      this.alertService.setCustomErrorAlert('Invalid payee ID');
      this.router.navigate(['/settings/payee']);
      return;
    }

    this.loading = true;
    this.payeeService.getPayeeById(this.sysPk).subscribe({
      next: (result) => {
        this.payee = result;
        this.loading = false;
      },
      error: (error) => {
        this.alertService.setCustomErrorAlert('Failed to load payee');
        this.loading = false;
        this.router.navigate(['/settings/payee']);
      }
    });
  }

  /**
   * Save payee
   */
  save(): void {
    // Validation
    if (!this.payee.userPK?.trim()) {
      this.alertService.setCustomErrorAlert('Code is required');
      return;
    }

    if (!this.payee.name?.trim()) {
      this.alertService.setCustomErrorAlert('Name is required');
      return;
    }

    this.loading = true;

    const saveDto: UniversalMasterSaveDto = {
      sysPk: this.sysPk || undefined,
      userPK: this.payee.userPK.trim(),
      name: this.payee.name.trim(),
      tINVATNumber: this.payee.tINVATNumber?.trim(),
      module: 'SUPLNT'
    };

    this.payeeService.savePayee(saveDto).subscribe({
      next: (response: ResponseDto) => {
        this.loading = false;
        if (response.success) {
          this.alertService.setCustomSuccessAlert(
            'Payee saved successfully'
          );
          this.router.navigate(['/settings/payee']);
        } else {
          this.alertService.setCustomErrorAlert(
            response.data?.toString() || 'Failed to save payee'
          );
        }
      },
      error: (error) => {
        this.loading = false;
        this.alertService.setCustomErrorAlert('Failed to save payee');
      }
    });
  }

  /**
   * Delete payee
   */
  delete(): void {
    if (!this.sysPk) return;

    const confirmed = confirm('Are you sure you want to delete this payee?');
    if (!confirmed) return;

    this.loading = true;
    this.payeeService.deletePayee(this.sysPk).subscribe({
      next: (response: ResponseDto) => {
        this.loading = false;
        if (response.success) {
          this.alertService.setCustomSuccessAlert('Payee deleted successfully');
          this.router.navigate(['/settings/payee']);
        } else {
          this.alertService.setCustomErrorAlert('Failed to delete payee');
        }
      },
      error: (error) => {
        this.loading = false;
        this.alertService.setCustomErrorAlert('Failed to delete payee');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/settings/payee']);
  }

  /**
   * Switch to More Info tab
   */
  switchToMoreInfoTab(): void {
    this.activeTab = 'moreInfo';
  }

  /**
   * Switch to System Info tab
   */
  switchToSystemInfoTab(): void {
    this.activeTab = 'systemInfo';
  }
}
