import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SupplierService } from '../../../services/supplier.service';
import { AlertService } from '../../../services/alert.service';
import { UniversalMasterDto, UniversalMasterSaveDto } from '../../../models/dto/universalMasterDto';
import { ResponseDto } from '../../../models/dto/responseDto';
import { ActionMenuComponent } from '../action-menu/action-menu.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-supplier-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ActionMenuComponent],
  templateUrl: './supplier-detail.component.html',
  styleUrls: ['./supplier-detail.component.css']
})
export class SupplierDetailComponent implements OnInit, OnDestroy {
  supplier: UniversalMasterDto = {
    userPK: '',
    name: '',
    tINVATNumber: '',
    module: 'SUPL'
  };

  sysPk: number | null = null;
  isEditMode: boolean = false;
  loading: boolean = false;
  activeTab: 'moreInfo' | 'systemInfo' = 'moreInfo';
  private routeSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supplierService: SupplierService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    // Subscribe to route parameter changes to handle navigation between different suppliers
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
    this.supplier = {
      userPK: '',
      name: '',
      tINVATNumber: '',
      module: 'SUPL'
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
      // New suppliers start in edit mode
      this.isEditMode = true;
      this.supplier = {
        userPK: '',
        name: '',
        tINVATNumber: '',
        module: 'SUPL'
      };
    } else if (id && !isNaN(Number(id))) {
      // Existing suppliers start in view mode
      this.sysPk = +id;
      this.isEditMode = false;
      this.loadSupplier();
    } else {
      // Defer navigation to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.alertService.setCustomErrorAlert('Invalid supplier ID: ' + id);
        this.router.navigate(['/settings/supplier']);
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
      // Reload the supplier to reset any changes
      if (this.sysPk) {
        this.loadSupplier();
      }
    } else {
      // Currently in view mode, enable edit mode
      this.isEditMode = true;
    }
  }

  /**
   * Handle add button click - navigate to new supplier
   */
  onAdd(): void {
    this.router.navigate(['/settings/supplier/new']);
  }

  loadSupplier(): void {
    if (!this.sysPk) {
      this.alertService.setCustomErrorAlert('Invalid supplier ID');
      this.router.navigate(['/settings/supplier']);
      return;
    }

    this.loading = true;
    this.supplierService.getSupplierById(this.sysPk).subscribe({
      next: (result) => {
        this.supplier = result;
        this.loading = false;
      },
      error: (error) => {
        this.alertService.setCustomErrorAlert('Failed to load supplier');
        this.loading = false;
        this.router.navigate(['/settings/supplier']);
      }
    });
  }

  /**
   * Save supplier
   */
  save(): void {
    // Validation
    if (!this.supplier.userPK?.trim()) {
      this.alertService.setCustomErrorAlert('Code is required');
      return;
    }

    if (!this.supplier.name?.trim()) {
      this.alertService.setCustomErrorAlert('Name is required');
      return;
    }

    this.loading = true;

    const saveDto: UniversalMasterSaveDto = {
      sysPk: this.sysPk || undefined,
      userPK: this.supplier.userPK.trim(),
      name: this.supplier.name.trim(),
      tINVATNumber: this.supplier.tINVATNumber?.trim(),
      module: 'SUPL'
    };

    this.supplierService.saveSupplier(saveDto).subscribe({
      next: (response: ResponseDto) => {
        this.loading = false;
        if (response.success) {
          this.alertService.setCustomSuccessAlert(
            'Supplier saved successfully'
          );
          this.router.navigate(['/settings/supplier']);
        } else {
          this.alertService.setCustomErrorAlert(
            response.data?.toString() || 'Failed to save supplier'
          );
        }
      },
      error: (error) => {
        this.loading = false;
        this.alertService.setCustomErrorAlert('Failed to save supplier');
      }
    });
  }

  /**
   * Delete supplier
   */
  delete(): void {
    if (!this.sysPk) return;

    const confirmed = confirm('Are you sure you want to delete this supplier?');
    if (!confirmed) return;

    this.loading = true;
    this.supplierService.deleteSupplier(this.sysPk).subscribe({
      next: (response: ResponseDto) => {
        this.loading = false;
        if (response.success) {
          this.alertService.setCustomSuccessAlert('Supplier deleted successfully');
          this.router.navigate(['/settings/supplier']);
        } else {
          this.alertService.setCustomErrorAlert('Failed to delete supplier');
        }
      },
      error: (error) => {
        this.loading = false;
        this.alertService.setCustomErrorAlert('Failed to delete supplier');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/settings/supplier']);
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
