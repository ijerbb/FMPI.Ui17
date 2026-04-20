import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomerService } from '../../../services/customer.service';
import { AlertService } from '../../../services/alert.service';
import { UniversalMasterDto, UniversalMasterSaveDto } from '../../../models/dto/universalMasterDto';
import { ResponseDto } from '../../../models/dto/responseDto';
import { ActionMenuComponent } from '../action-menu/action-menu.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ActionMenuComponent],
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.css']
})
export class CustomerDetailComponent implements OnInit {
  customer: UniversalMasterDto = {
    userPK: '',
    name: '',
    tINVATNumber: '',
    module: 'CUST'
  };

  sysPk: number | null = null;
  isEditMode: boolean = false;
  loading: boolean = false;
  activeTab: 'moreInfo' | 'systemInfo' = 'moreInfo';
  private routeSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    // Subscribe to route parameter changes to handle navigation between different customers
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
    this.customer = {
      userPK: '',
      name: '',
      tINVATNumber: '',
      module: 'CUST'
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
      // New customers start in edit mode
      this.isEditMode = true;
      this.customer = {
        userPK: '',
        name: '',
        tINVATNumber: '',
        module: 'CUST'
      };
    } else if (id && !isNaN(Number(id))) {
      // Existing customers start in view mode
      this.sysPk = +id;
      this.isEditMode = false;
      this.loadCustomer();
    } else {
      // Defer navigation to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.alertService.setCustomErrorAlert('Invalid customer ID: ' + id);
        this.router.navigate(['/settings/customer']);
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
      // Reload the customer to reset any changes
      if (this.sysPk) {
        this.loadCustomer();
      }
    } else {
      // Currently in view mode, enable edit mode
      this.isEditMode = true;
    }
  }

  /**
   * Handle add button click - navigate to new customer
   */
  onAdd(): void {
    this.router.navigate(['/settings/customer/new']);
  }

  loadCustomer(): void {
    if (!this.sysPk) {
      this.alertService.setCustomErrorAlert('Invalid customer ID');
      this.router.navigate(['/settings/customer']);
      return;
    }

    this.loading = true;
    this.customerService.getCustomerById(this.sysPk).subscribe({
      next: (result) => {
        this.customer = result;
        this.loading = false;
      },
      error: (error) => {
        this.alertService.setCustomErrorAlert('Failed to load customer');
        this.loading = false;
        this.router.navigate(['/settings/customer']);
      }
    });
  }

  /**
   * Save customer
   */
  save(): void {
    // Validation
    if (!this.customer.userPK?.trim()) {
      this.alertService.setCustomErrorAlert('User PK is required');
      return;
    }

    if (!this.customer.name?.trim()) {
      this.alertService.setCustomErrorAlert('Name is required');
      return;
    }

    this.loading = true;

    const saveDto: UniversalMasterSaveDto = {
      sysPk: this.sysPk || undefined,
      userPK: this.customer.userPK.trim(),
      name: this.customer.name.trim(),
      tINVATNumber: this.customer.tINVATNumber?.trim(),
      module: 'CUST'
    };

    this.customerService.saveCustomer(saveDto).subscribe({
      next: (response: ResponseDto) => {
        this.loading = false;
        if (response.success) {
          this.alertService.setCustomSuccessAlert(
            'Customer saved successfully'
          );
          this.router.navigate(['/settings/customer']);
        } else {
          this.alertService.setCustomErrorAlert(
            response.data?.toString() || 'Failed to save customer'
          );
        }
      },
      error: (error) => {
        this.loading = false;
        this.alertService.setCustomErrorAlert('Failed to save customer');
      }
    });
  }

  /**
   * Delete customer
   */
  delete(): void {
    if (!this.sysPk) return;

    const confirmed = confirm('Are you sure you want to delete this customer?');
    if (!confirmed) return;

    this.loading = true;
    this.customerService.deleteCustomer(this.sysPk).subscribe({
      next: (response: ResponseDto) => {
        this.loading = false;
        if (response.success) {
          this.alertService.setCustomSuccessAlert('Customer deleted successfully');
          this.router.navigate(['/settings/customer']);
        } else {
          this.alertService.setCustomErrorAlert('Failed to delete customer');
        }
      },
      error: (error) => {
        this.loading = false;
        this.alertService.setCustomErrorAlert('Failed to delete customer');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/settings/customer']);
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
