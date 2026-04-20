import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { StockTakeSessionDto } from '../../../models/dto/stockTakeSessionDto';
import { StockTakeTaskDto } from '../../../models/dto/stockTakeTaskDto';
import { StockCountEntryDto } from '../../../models/dto/stockCountEntryDto';
import { ActionMenuComponent } from "../../settings/action-menu/action-menu.component";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ResponseListDto } from '../../../models/dto/responseListDto';
import { AlertService } from '../../../services/alert.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ProductDto } from '../../../models/dto/productDto';
import { CryptoService } from '../../../services/crypto.service';
import { StockTakeTaskStatus } from '../../../models/constants/stock-take-status';
import { PaginationComponent } from '../../../components/shared/pagination/pagination.component';
import * as CryptoJS from 'crypto-js'; // Move to Security Helper

// Declare bootstrap global
declare var bootstrap: any;

@Component({
  selector: 'app-inventory-stock-take-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ActionMenuComponent, NgbModule, PaginationComponent],
  templateUrl: './inventory-stock-take-detail.component.html',
  styleUrls: ['../../settings/main/main.component.css', './inventory-stock-take-detail.component.css']
})
export class InventoryStockTakeDetailComponent implements OnInit {
  session: StockTakeSessionDto = new StockTakeSessionDto();
  loadedSessionStatus: number | null = null; // Track the original status when loaded
  loading = false;
  tasksRes: ResponseListDto<StockTakeTaskDto> = new ResponseListDto<StockTakeTaskDto>();
  searchBarcode: string = '';
  filteredTasks: StockTakeTaskDto[] = [];
  foundTask?: StockTakeTaskDto;
  foundDescription: any = '';
  stockTakeEntryProdDto: ProductDto = null as any;
  taskCounts: { 
    pending: number; pendingValue: number;
    autoCounted: number; autoCountedValue: number;
    counted: number; countedValue: number;
    verified: number; verifiedValue: number;
    reviewed: number; reviewedValue: number;
    autoReviewed: number; autoReviewedValue: number;
    total: number; totalValue: number;
  } = { 
    pending: 0, pendingValue: 0,
    autoCounted: 0, autoCountedValue: 0,
    counted: 0, countedValue: 0,
    verified: 0, verifiedValue: 0,
    reviewed: 0, reviewedValue: 0,
    autoReviewed: 0, autoReviewedValue: 0,
    total: 0, totalValue: 0
  };
  countedQty: number | null = 0;
  countNotes: string = '';
  pendingCreateDto: any = null;
  pendingCreateMessage: string = '';

  // Discrepancy tracking
  discrepancyData: any = null;
  hasDiscrepancy = false;
  pendingCountDto: StockCountEntryDto | null = null;
  pendingCounterUserId: number = 0;

  // Admin features
  isAdmin = false;
  isAdministrator = false; // Check if current user is "Administrator"
  mismatchedTasks: StockTakeTaskDto[] = [];
  currentMismatchedIndex = 0;
  showingMismatchedTasks = false;
  searchingMismatches = false;
  adminPasswordInput: string = '';
  encryptedAdminPassword: string = '';

  // Syncing inventory
  isSyncingInventory = false;

  // Standardized loading system
  isLoading = false;
  loadingMessage = '';

  // Batch processing for missing adjustments (temporary cleanup tool)
  isBatchProcessing = false;
  batchMessage = '';

  // Review status accordion
  showReviewAccordion = false;
  expandedTaskId: number | null = null;

  // User cache (for current session only)
  cachedUserId: number | null = null;

  // Filter section
  selectedStatusFilter: string = 'All';
  allTasksLoaded: StockTakeTaskDto[] = []; // Store all tasks from all pages

  statusItems: any[] = [];
  typeItems = [ { id: 1, name: 'Partial' }, { id: 2, name: 'Full' } ];

  togSave = new EventEmitter<boolean>();
  togPrint = new EventEmitter<boolean>();

  // Pending task for accept confirmation
  pendingAcceptTask: StockTakeTaskDto | null = null;

  constructor(private route: ActivatedRoute, 
    private router: Router, 
    private httpService: HttpService,
    private alertService: AlertService,
    private sanitizer: DomSanitizer,
    private cryptoService: CryptoService) {}

  ngOnInit(): void {
    // Check if user is admin and if user is "Administrator"
    this.checkAdminStatus();
    this.checkIsAdministrator();

    const id = this.route.snapshot.paramMap.get('id') ?? '';
    if (id === 'new') {
      this.session = new StockTakeSessionDto();
    } else {
      this.loadSession(Number(id));
    }

  }

  checkAdminStatus(): void {
    const token = localStorage.getItem('sessionToken') || '';

    if (token) {
      // Check if user ID is cached
      if (this.cachedUserId !== null) {
        this.httpService.verifyAccessRights(token, 'IsUserAdmin').subscribe(response => {
          const wasAdmin = this.isAdmin;
          this.isAdmin = response.success === true;
          this.updateStatusItems();
          // If admin status changed and session is loaded, load values
          if (this.isAdministrator && this.session?.id) {
            this.loadTaskValues(this.session.id);
          }
        }, err => {
          console.error('Failed to verify admin status', err);
          this.isAdmin = false;
          this.updateStatusItems();
        });
        return;
      }

      // Verify admin status from API
      this.httpService.getUserId(token).subscribe(response => {
        this.cachedUserId = Number(response.data) || 0;
        this.httpService.verifyAccessRights(token, 'IsUserAdmin').subscribe(response => {
          const wasAdmin = this.isAdmin;
          this.isAdmin = response.success === true;
          this.updateStatusItems();
          // If admin status changed and session is loaded, load values
          if (this.isAdministrator && this.session?.id) {
            this.loadTaskValues(this.session.id);
          }
        }, err => {
          console.error('Failed to verify admin status', err);
          this.isAdmin = false;
          this.updateStatusItems();
        });
      }, err => {
        console.error('Failed to get user id', err);
        this.isAdmin = false;
        this.updateStatusItems();
      });
    } else {
      this.isAdmin = false;
      this.updateStatusItems();
    }
  }

  /**
   * Check if current user is "Administrator"
   */
  checkIsAdministrator(): void {
    const token = localStorage.getItem('sessionToken') || '';

    if (token) {
      // Get user ID first
      const checkUserName = (userId: number) => {
        this.httpService.getUser(userId).subscribe(
          response => {
            this.isAdministrator = response?.code === 'Administrator';
            // If session is loaded, trigger value loading
            if (this.isAdministrator && this.session?.id) {
              this.loadTaskValues(this.session.id);
            }
          },
          err => {
            console.error('Failed to get user info', err);
            this.isAdministrator = false;
          }
        );
      };

      // Check cache first
      if (this.cachedUserId !== null) {
        checkUserName(this.cachedUserId);
      } else {
        this.httpService.getUserId(token).subscribe(
          response => {
            const userId = Number(response.data) || 0;
            this.cachedUserId = userId;
            checkUserName(userId);
          },
          err => {
            console.error('Failed to get user id', err);
            this.isAdministrator = false;
          }
        );
      }
    } else {
      this.isAdministrator = false;
    }
  }

  /**
   * Get cached user ID or fetch from server if not cached
   */
  getCachedUserId(token: string, callback: (userId: number) => void): void {
    // Check cache first
    if (this.cachedUserId !== null) {
      callback(this.cachedUserId);
      return;
    }

    // Fetch from server and cache
    this.httpService.getUserId(token).subscribe(
      response => {
        this.cachedUserId = Number(response.data) || 0;
        callback(this.cachedUserId);
      },
      err => {
        console.error('Failed to get user id', err);
        const fallbackUserId = Number(localStorage.getItem('sessionUserId') || localStorage.getItem('userId') || 0);
        callback(fallbackUserId);
      }
    );
  }

  updateStatusItems(): void {
    if (this.isAdmin) {
      this.statusItems = [ { id: 1, name: 'Draft' }, { id: 2, name: 'In-Progress' }, { id: 3, name: 'Review' }, { id: 4, name: 'Posted' } ];
    } else {
      this.statusItems = [ { id: 1, name: 'Draft' }, { id: 2, name: 'In-Progress' } ];
    }
  }

  private startLoading(message: string): void {
    this.loadingMessage = message;
    this.isLoading = true;
  }

  private stopLoading(): void {
    this.isLoading = false;
    this.loadingMessage = '';
  }

  fetchTaskCounts(sessionId: number) {
    if (!sessionId) return;
    
    // Step 1: Load counts first (fast)
    this.httpService.countTasksBySession(sessionId).subscribe(res => {
      try {
        console.log('CountTasksBySession response:', res);
        const obj = JSON.parse(res.data || '{}');
        this.taskCounts.pending = obj.Pending ?? 0;
        this.taskCounts.autoCounted = obj.AutoCounted ?? 0;
        this.taskCounts.counted = obj.Counted ?? 0;
        this.taskCounts.verified = obj.Verified ?? 0;
        this.taskCounts.reviewed = obj.Reviewed ?? 0;
        this.taskCounts.autoReviewed = obj.AutoReviewed ?? 0;
        this.taskCounts.total = obj.Total ?? (this.taskCounts.pending + this.taskCounts.autoCounted + this.taskCounts.counted + this.taskCounts.verified + this.taskCounts.reviewed + this.taskCounts.autoReviewed);
        
        // Step 2: Lazy load values in background (only if user is "Administrator")
        if (this.isAdministrator) {
          this.loadTaskValues(sessionId);
        }
      } catch (e) {
        console.error('Failed parsing CountTasksBySession response', e, res);
      }
    }, err => {
      console.error('Failed loading task counts', err);
    });
  }

  /**
   * Lazy load values for Counted and Auto-Counted status
   */
  loadTaskValues(sessionId: number) {
    if (!sessionId || !this.isAdministrator) return;
    
    this.httpService.getTaskValuesBySession(sessionId).subscribe(res => {
      try {
        console.log('GetTaskValuesBySession response:', res);
        const obj = JSON.parse(res.data || '{}');
        this.taskCounts.countedValue = obj.CountedValue ?? 0;
        this.taskCounts.autoCountedValue = obj.AutoCountedValue ?? 0;
      } catch (e) {
        console.error('Failed parsing GetTaskValuesBySession response', e, res);
      }
    }, err => {
      console.error('Failed loading task values', err);
    });
  }

  getDisplayedTasks(): StockTakeTaskDto[] {
    const tasks = (this.filteredTasks && this.filteredTasks.length > 0) ? this.filteredTasks : this.tasksRes.lists;
    return tasks;
  }

  /**
   * Handle click on total values in the Totals section
   */
  onTotalClick(status: string): void {
    if (!this.session || !this.session.id) return;

    // If already filtered by this status, clear the filter
    if (this.selectedStatusFilter === status && status !== 'All') {
      this.clearFilter();
      return;
    }

    // Apply the filter
    this.selectedStatusFilter = status;

    // If "All" is selected, reload without filter
    if (status === 'All') {
      this.loadTasks(this.session.id, 1);
      return;
    }

    // Load first page of filtered tasks (with pagination support)
    this.loadTasksByStatus(this.session.id, status, 1);
  }

  /**
   * Clear the active filter and reload all tasks
   */
  clearFilter(): void {
    this.selectedStatusFilter = 'All';
    this.allTasksLoaded = []; // Clear cached tasks
    if (this.session && this.session.id) {
      this.loadTasks(this.session.id, this.tasksRes.pageNum || 1);
    }
  }

  /**
   * Load tasks filtered by status with pagination (only loads requested page)
   */
  private loadTasksByStatus(sessionId: number, status: string, pageNum: number): void {
    this.startLoading('Loading tasks...');
    
    this.httpService.getTasksBySessionAndStatus(sessionId, status, pageNum).subscribe(
      result => {
        this.tasksRes.pageStart = result.pageStart;
        this.tasksRes.pageEnd = result.pageEnd;
        this.tasksRes.pageNum = result.pageNum;
        this.tasksRes.totalRecords = result.totalRecords;
        this.tasksRes.lists = result.lists;
        
        // Generate smart page numbers (2 before and 2 after current page)
        const totalPages = Math.ceil(result.totalRecords / 10);
        this.tasksRes.pageNoList = this.generateSmartPageNumbers(result.pageNum, totalPages);
        
        this.stopLoading();
      },
      error => {
        console.error(error);
        this.stopLoading();
        this.alertService.setCustomErrorAlert('Failed to load tasks by status');
      }
    );
  }

  /**
   * Generate smart pagination list showing 2 pages before and 2 pages after current page
   */
  private generateSmartPageNumbers(currentPage: number, totalPages: number): number[] {
    if (totalPages <= 0) return [];
    if (totalPages <= 5) {
      // If 5 or fewer pages, show all
      return Array(totalPages).fill(1).map((_, i) => i + 1);
    }

    const pageNumbers: number[] = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  }

  searchBarcodeSubmit() {
    if (!this.searchBarcode || this.searchBarcode.trim().length === 0) {
      // empty search -> clear filter / refresh current page
      this.filteredTasks = [];
      if (this.session && this.session.id) this.loadTasks(this.session.id, this.tasksRes.pageNum || 1);
      return;
    }

    this.httpService.isBarcodeExist(this.searchBarcode).subscribe(res => {
      if (!res || res.success) {
        this.alertService.setCustomErrorAlert('Barcode does not exist');
        this.filteredTasks = [];
        return;
      }

      const msg = (res.data || '').toString().trim();

      // If API indicates internal code -> treat as product id (likely in rawData)
      if (msg === 'Barcode is an internal code.') {
        let productId: number | null = null;
        if (res.rawData) {
          try {
            const parsed = JSON.parse(res.rawData);
            if (parsed && (parsed.productId || parsed.id)) productId = Number(parsed.productId ?? parsed.id);
          } catch (e) {
            if (!isNaN(Number(res.rawData))) productId = Number(res.rawData);
          }
        }

        if (!this.session || !this.session.id) {
          this.alertService.setCustomErrorAlert('No active session to search tasks');
          return;
        }

        const pid = productId ?? (isNaN(Number(this.searchBarcode)) ? null : Number(this.searchBarcode));
        if (pid === null) {
          this.alertService.setCustomErrorAlert('Unable to determine product id from response');
          return;
        }

        // call API to get a task by session and product
        const token = localStorage.getItem('sessionToken') || '';
        this.getCachedUserId(token, (userId) => {
          this.httpService.getTaskBySessionAndProductAndUserId(this.session.id!, pid, userId).subscribe(task => {
            if (task && task.id) {
              this.foundTask = task;
              this.filteredTasks = [task];
              // fetch product details for found task and show description in modal
              this.httpService.getProductByBarcode(this.searchBarcode).subscribe(prodRes => {
                const p = (prodRes && prodRes.lists && prodRes.lists.length > 0) ? prodRes.lists[0] : null;
                if (p) {
                  (this.foundTask as any).productDto = p;
                  this.stockTakeEntryProdDto = p;
                } else {
                  this.foundDescription = this.foundDescription || ('Product ' + (task.productId ?? ''));
                }
                if (this.canOpenCountModal(task)) setTimeout(() => document.getElementById('btnCountConfirm')?.click(), 50);
              }, err => {
                console.error(err);
                this.foundDescription = this.foundDescription || ('Product ' + (task.productId ?? ''));
                if (this.canOpenCountModal(task)) setTimeout(() => document.getElementById('btnCountConfirm')?.click(), 50);
              });
              return;
            }
            // if no task returned, ask user to create one via modal
            this.pendingCreateDto = { sessionId: this.session!.id, productId: pid };
            this.pendingCreateMessage = 'No task found for this product in the session. Create a new task?';
            setTimeout(() => document.getElementById('btnOpenCreateTaskConfirm')?.click(), 50);
          }, err => {
            console.error(err);
            this.alertService.setCustomErrorAlert('Failed searching for task');
          });
        });

        return;
      }

      // If API indicates supplier barcode -> fetch product details and match by product id via API paging
      if (msg === 'Barcode already exist.') {
        if (!this.session || !this.session.id) {
          this.alertService.setCustomErrorAlert('No active session to search tasks');
          return;
        }
        this.httpService.getProductByBarcode(this.searchBarcode).subscribe(prodRes => {
          const product = (prodRes && prodRes.lists && prodRes.lists.length > 0) ? prodRes.lists[0] : null;
          if (!product) {
            this.alertService.setCustomErrorAlert('Barcode exists but product details not found');
            this.filteredTasks = [];
            return;
          }

          // use API to find task for this product/session
          const token = localStorage.getItem('sessionToken') || '';
          this.getCachedUserId(token, (userId) => {
            this.httpService.getTaskBySessionAndProductAndUserId(this.session!.id!, product.id ?? 0, userId).subscribe(task => {
              if (task && task.id) {
                this.foundTask = task;
                // attach the product we already fetched
                (task as any).productDto = product;
                this.foundDescription = product.description || product.cDescription || ('Product ' + (product.id ?? ''));
                this.filteredTasks = [task];
                if (this.canOpenCountModal(task)) setTimeout(() => document.getElementById('btnCountConfirm')?.click(), 50);
                return;
              }

              this.pendingCreateDto = { sessionId: this.session!.id, productId: product.id };
              this.pendingCreateMessage = 'No task found for this product in the session. Create a new task?';
              setTimeout(() => document.getElementById('btnOpenCreateTaskConfirm')?.click(), 50);
            });
          });
        }, err => {
          console.error(err);
          this.alertService.setCustomErrorAlert('Failed to load product for supplier barcode');
          this.filteredTasks = [];
        });
        return;
      }

      // Fallback: try to parse res.data as JSON or id/description
      let productId: number | null = null;
      try {
        const parsed = JSON.parse(res.data || '');
        if (parsed && parsed.productId) productId = Number(parsed.productId);
        if (parsed && parsed.description) this.foundDescription = parsed.description;
      } catch (e) {
        if (!isNaN(Number(res.data))) {
          productId = Number(res.data);
        } else {
          this.foundDescription = res.data || '';
        }
      }

      const matched: StockTakeTaskDto | undefined = (productId !== null)
        ? this.tasksRes.lists.find(x => x.productId === productId)
        : this.tasksRes.lists.find(x => String(x.productId) === this.searchBarcode || (x.locationId && x.locationId === this.searchBarcode));

      if (!matched) {
        this.alertService.setCustomErrorAlert('Barcode exists but no matching task in this session');
        this.filteredTasks = [];
        return;
      }

      this.foundTask = matched;
      // ensure productDto is present for matched task (may have been attached during loadTasks)
      if (!(matched as any).productDto && matched.productId) {
        const prodSearch: any = { productId: matched.productId, pageNo: 1 };
        this.httpService.getProduct(prodSearch).subscribe(prodRes => {
          const p = (prodRes && prodRes.lists && prodRes.lists.length > 0) ? prodRes.lists[0] : null;
          if (p) {
            (matched as any).productDto = p;
            this.foundDescription = p.description || p.cDescription || ('Product ' + (matched.productId ?? ''));
          } else if (!this.foundDescription) {
            this.foundDescription = 'Product ' + (matched.productId ?? '');
          }
          this.filteredTasks = [matched];
          if (this.canOpenCountModal(matched)) setTimeout(() => document.getElementById('btnCountConfirm')?.click(), 50);
        }, err => {
          console.error(err);
          if (!this.foundDescription) this.foundDescription = 'Product ' + (matched.productId ?? '');
          this.filteredTasks = [matched];
          if (this.canOpenCountModal(matched)) setTimeout(() => document.getElementById('btnCountConfirm')?.click(), 50);
        });
      } else {
        if (!this.foundDescription) this.foundDescription = 'Product ' + (matched.productId ?? '');
        this.filteredTasks = [matched];
        if (this.canOpenCountModal(matched)) setTimeout(() => document.getElementById('btnCountConfirm')?.click(), 50);
      }
    }, err => {
      console.error(err);
      this.alertService.setCustomErrorAlert('Barcode does not exist');
      this.filteredTasks = [];
    });
  }

  submitStockCountEntry() {
    if (!this.foundTask) {
      this.alertService.setCustomErrorAlert('No task selected'); 
      return;
    }
    if (this.countedQty === null || this.countedQty === undefined) {
      this.alertService.setCustomErrorAlert('Please enter counted quantity'); 
      return;
    }

    const dto: StockCountEntryDto = {
      taskId: this.foundTask.id,
      countedQty: this.countedQty ?? undefined,
      notes: this.countNotes,
      timestamp: new Date().toISOString()
    };

    // resolve counterId via API using stored session token, fallback to localStorage keys
    const token = localStorage.getItem('sessionToken') || '';
    const finalizeAndPost = (counterIdVal: number) => {
      dto.counterId = Number(counterIdVal) || 0;
      this.httpService.recordStockCountEntry(dto).subscribe(response => {
        // Check if response contains discrepancy
        if (!response.success && response.data) {
          try {
            const discrepancyInfo = JSON.parse(response.data);
            if (discrepancyInfo.IsDiscrepancy) {
              // Store discrepancy data and pending count dto for later retry
              this.discrepancyData = discrepancyInfo;
              this.hasDiscrepancy = true;
              this.pendingCountDto = dto;
              this.pendingCounterUserId = counterIdVal;

              // Show discrepancy modal on top of count modal
              setTimeout(() => document.getElementById('btnOpenDiscrepancyModal')?.click(), 50);
              return;
            }
          } catch (e) {
            console.error('Failed to parse discrepancy response', e);
            this.alertService.setCustomErrorAlert('Failed to record stock count entry');
            return;
          }
        }

        // If successful, close modals
        document.getElementById('modalCloseCount')?.click();
        
        // Refresh the entire session detail page to show updated task status (e.g., Auto-Reviewed)
        // and adjusting entry information
        if (this.session && this.session.id) {
          this.loadSession(this.session.id);
        }

        // clear search / state
        this.searchBarcode = '';
        this.filteredTasks = [];
        this.foundTask = undefined;
        this.foundDescription = '';
        this.countedQty = 0;
        this.countNotes = '';
        this.alertService.setCustomSuccessAlert('Stock count entry saved successfully!');
        this.fetchTaskCounts(this.session.id!);
      }, err => {
        console.error(err);
        this.alertService.setCustomErrorAlert('Failed to record stock count entry');
      });
    };

    // Use cached user ID
    this.getCachedUserId(token, (uid) => {
      finalizeAndPost(uid);
    });
  }

  canOpenCountModal(task: StockTakeTaskDto): boolean {
    if (!task) return false;
    // If there are already 2 counts, block further counts
    if (Array.isArray(task.stockCountEntries) && task.stockCountEntries.length === 0 && task.totalStockCountEntries === 2) {
      this.alertService.setCustomErrorAlert('Cannot add count — this item has already reached the maximum allowed stock take counts per user (2).');
      return false;
    }
    return true;
  }

  confirmAndSave() {
    if (!this.foundTask) {
      this.alertService.setCustomErrorAlert('No task selected');
      return;
    }
    if (this.countedQty === null || this.countedQty === undefined) {
      this.alertService.setCustomErrorAlert('Please enter counted quantity');
      return;
    }

    // open bootstrap confirm modal instead of window.confirm
    setTimeout(() => document.getElementById('btnOpenConfirm')?.click(), 50);
  }

  createTaskConfirmed() {
    if (!this.pendingCreateDto) return;
    this.httpService.createStockTakeTask(this.pendingCreateDto).subscribe(created => {
      this.foundTask = created;
      this.filteredTasks = [created];
      // fetch product details for created task and update description
      if (created.productId) {
        const prodSearch: any = { productId: created.productId, pageNo: 1 };
        this.httpService.getProduct(prodSearch).subscribe(prodRes => {
          const p = (prodRes && prodRes.lists && prodRes.lists.length > 0) ? prodRes.lists[0] : null;
          if (p) {
            (this.foundTask as any).productDto = p;
            this.foundDescription = p.description || p.cDescription || ('Product ' + created.productId);
          } else {
            this.foundDescription = this.foundDescription || (created.productId ? ('Product ' + created.productId) : '');
          }
              // open count modal if allowed
              if (this.canOpenCountModal(created)) setTimeout(() => document.getElementById('btnCountConfirm')?.click(), 50);
        }, err => {
          console.error(err);
          this.foundDescription = this.foundDescription || (created.productId ? ('Product ' + created.productId) : '');
          if (this.canOpenCountModal(created)) setTimeout(() => document.getElementById('btnCountConfirm')?.click(), 50);
        });
      } else {
        this.foundDescription = this.foundDescription || (created.productId ? ('Product ' + created.productId) : '');
        if (this.canOpenCountModal(created)) setTimeout(() => document.getElementById('btnCountConfirm')?.click(), 50);
      }
      this.pendingCreateDto = null;
      this.pendingCreateMessage = '';
    }, err => {
      console.error(err);
      this.alertService.setCustomErrorAlert('Failed to create task');
    });
  }

  cancelCreateTask() {
    this.pendingCreateDto = null;
    this.pendingCreateMessage = '';
  }

  

  ngAfterViewInit(): void {
    this.togSave.emit(true);
  }

  loadSession(id: number) {
    this.loading = true;
    this.httpService.listStockTakeSessions().subscribe(res => {
      this.session = (res.lists || []).find(x => x.id === id) ?? new StockTakeSessionDto();
      this.loadedSessionStatus = this.session.status ?? null;
      this.loading = false;
      if (this.session && this.session.id) {
        this.loadTasks(this.session.id, 1);
      }
    }, _ => this.loading = false);
  }

  loadTasks(sessionId: number, pageNo: number): void {
    // If a filter is active, reapply the filter instead of loading a specific page
    if (this.selectedStatusFilter !== 'All') {
      // Reapply filter to get updated data
      this.loadTasksByStatus(sessionId, this.selectedStatusFilter, pageNo);
      return;
    }

    this.tasksRes.lists = [];
    this.httpService.getTasksBySession(sessionId, pageNo).subscribe(result => {
      this.tasksRes.pageStart = result.pageStart;
      this.tasksRes.pageEnd = result.pageEnd;
      this.tasksRes.pageNum = result.pageNum;
      this.tasksRes.totalRecords = result.totalRecords;
      var tempPageStart = this.tasksRes.pageStart;
      this.tasksRes.pageNoList = Array((this.tasksRes.pageEnd + 1) - this.tasksRes.pageStart).fill(this.tasksRes.pageStart).map((x, i) => tempPageStart++);
      this.tasksRes.lists = result.lists;
      // fetch counts summary for the session
      this.fetchTaskCounts(sessionId);
    }, error => console.error(error));
  }

  clickPageTasks(pageNo: number): void {
    if (!this.session || !this.session.id) return;

    // If a filter is active, use filtered pagination (load from API)
    if (this.selectedStatusFilter !== 'All') {
      this.loadTasksByStatus(this.session.id, this.selectedStatusFilter, pageNo);
    } else {
      // Otherwise, use regular pagination
      this.loadTasks(this.session.id, pageNo);
    }
  }

  save() {
    // Store the previous status to detect changes
    const previousStatus = this.session.id && this.session.id > 0
      ? this.loadedSessionStatus
      : null;

    if (this.session.id && this.session.id > 0) {
      this.httpService.updateStockTakeSession(this.session).subscribe(
        _ => {
          // Check if status was changed to Review (id = 3)
          if (previousStatus !== 3 && this.session.status == 3) {
            this.syncActualInventory();
          } else {
            this.alertService.setCustomSuccessAlert('Session updated successfully');
            //this.router.navigate(['/inventorystocktake']);
          }
          this.loadedSessionStatus = this.session.status ?? null;
        },
        err => {
          console.error('Error updating session', err);
          this.alertService.setCustomErrorAlert('Failed to update session');
        }
      );
    } else {
      this.httpService.createStockTakeSession(this.session).subscribe( res => {
        //_ => this.router.navigate(['/inventorystocktake'])
      });
    }
  }

  private syncActualInventory() {
    if (!this.session.id) return;

    this.startLoading('Retrieving Actual Inventory from system. Please wait...');

    // Get current user ID using cache
    const token = localStorage.getItem('sessionToken') || '';

    if (token) {
      this.getCachedUserId(token, (uid) => {
        this.callSyncActualInventory(uid);
      });
    } else {
      this.callSyncActualInventory(0);
    }
  }

  private callSyncActualInventory(userId: number) {
    this.httpService.syncActualInventory(this.session.id!, userId > 0 ? userId : undefined).subscribe(
      response => {
        this.stopLoading();
        if (response.success) {
          this.alertService.setCustomSuccessAlert('Inventory synced successfully');
        } else {
          this.alertService.setCustomErrorAlert('Failed to sync inventory: ' + response.data);
        }
      },
      err => {
        this.stopLoading();
        console.error('Error syncing inventory', err);
        this.alertService.setCustomErrorAlert('Error syncing inventory');
      }
    );
  }

  /**
   * Batch create missing adjusting entries for Reviewed/Auto-Reviewed tasks
   * This is a temporary cleanup tool for existing data
   */
  openBatchConfirmModal() {
    if (!this.session || !this.session.id) {
      this.alertService.setCustomErrorAlert('No session selected');
      return;
    }

    // Show confirmation modal
    const modalElement = document.getElementById('batchConfirmModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmBatchProcessing() {
    if (!this.session || !this.session.id) {
      this.alertService.setCustomErrorAlert('No session selected');
      return;
    }

    // Close the modal
    const modalElement = document.getElementById('batchConfirmModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }

    this.isBatchProcessing = true;
    this.batchMessage = 'Fetching tasks that need adjustment entries...';

    const token = localStorage.getItem('sessionToken') || '';
    
    this.getCachedUserId(token, (userId) => {
      const finalUserId = userId || 0;
      
      this.httpService.batchCreateMissingAdjustments(this.session.id!, finalUserId).subscribe(
        response => {
          this.isBatchProcessing = false;
          if (response.success) {
            this.batchMessage = response.data || 'Batch processing complete';
            this.alertService.setCustomSuccessAlert(this.batchMessage);
            
            // Refresh the session to show updated data
            this.loadSession(this.session.id!);
          } else {
            this.batchMessage = 'Error: ' + response.data;
            this.alertService.setCustomErrorAlert(this.batchMessage);
          }
        },
        err => {
          this.isBatchProcessing = false;
          this.batchMessage = 'Error processing batch';
          console.error('Error batch creating adjustments', err);
          this.alertService.setCustomErrorAlert('Error processing batch');
        }
      );
    });
  }

  cancel() {
    this.router.navigate(['/inventorystocktake']);
  }
  
  onPrint() {
    // Implement print functionality if needed
  }

  totalCounted() {
  const sum = this.foundTask?.stockCountEntries?.reduce(
      (s, e) => s + (e.countedQty || 0),
      0
    ) ?? 0;

    return sum + (this.countedQty ?? 0);
  }

  getCounterSummary() {
    if (!this.foundTask?.stockCountEntries || this.foundTask.stockCountEntries.length === 0) {
      return [];
    }

    // Group by counterId and sum countedQty
    const grouped = new Map<number, { counterId: number; totalQty: number; entries: StockCountEntryDto[] }>();

    for (const entry of this.foundTask.stockCountEntries) {
      const counterId = entry.counterId ?? 0;
      if (!grouped.has(counterId)) {
        grouped.set(counterId, {
          counterId,
          totalQty: 0,
          entries: []
        });
      }
      const group = grouped.get(counterId)!;
      group.totalQty += entry.countedQty ?? 0;
      group.entries.push(entry);
    }

    return Array.from(grouped.values());
  }

  getCounterSummaryForTask(task: StockTakeTaskDto) {
    if (!task?.stockCountEntries || task.stockCountEntries.length === 0) {
      return [];
    }

    // Group by counterId and sum countedQty
    const grouped = new Map<number, { counterId: number; totalQty: number; entries: StockCountEntryDto[] }>();

    for (const entry of task.stockCountEntries) {
      const counterId = entry.counterId ?? 0;
      if (!grouped.has(counterId)) {
        grouped.set(counterId, {
          counterId,
          totalQty: 0,
          entries: []
        });
      }
      const group = grouped.get(counterId)!;
      group.totalQty += entry.countedQty ?? 0;
      group.entries.push(entry);
    }

    return Array.from(grouped.values());
  }

  getCounterMaxDate(counterGroup: { counterId: number; totalQty: number; entries: StockCountEntryDto[] }): string {
    if (!counterGroup?.entries || counterGroup.entries.length === 0) {
      return '';
    }
    const maxDate = counterGroup.entries.reduce((max, entry) => {
      const entryDate = entry.timestamp ? new Date(entry.timestamp).getTime() : 0;
      return entryDate > max ? entryDate : max;
    }, 0);
    return maxDate > 0 ? new Date(maxDate).toLocaleString() : '';
  }

  getCounterName(counterId: number): string {
    // Find the counter name from the loaded stock count entries
    // The server populates CounterName for each entry
    for (const task of this.tasksRes.lists) {
      if (task.stockCountEntries) {
        const entry = task.stockCountEntries.find(e => e.counterId === counterId);
        if (entry && entry.counterName) {
          return entry.counterName;
        }
      }
    }
    // Fallback to User {counterId} if not found
    return `User ${counterId}`;
  }

  /**
   * Check if the Confirm Count button should be enabled for a task
   * Returns an object with canConfirm flag and reason message
   */
  canConfirmCount(task: StockTakeTaskDto): { canConfirm: boolean; message: string } {
    if (!task?.stockCountEntries || task.stockCountEntries.length === 0) {
      return { canConfirm: false, message: 'No count entries found' };
    }

    // Group entries by counterId
    const groupedByCounter = new Map<number, StockCountEntryDto[]>();
    for (const entry of task.stockCountEntries) {
      const counterId = entry.counterId ?? 0;
      if (!groupedByCounter.has(counterId)) {
        groupedByCounter.set(counterId, []);
      }
      groupedByCounter.get(counterId)!.push(entry);
    }

    // Check if there's only 1 counter with entries
    if (groupedByCounter.size === 1) {
      const counterId = Array.from(groupedByCounter.keys())[0];
      const entries = groupedByCounter.get(counterId)!;
      
      // Only 1 entry from a single counter - not allowed
      if (entries.length === 1) {
        return { canConfirm: false, message: 'At least 2 counts from different counters or 2 counters\' counts match, are required for verification' };
      }
      
      // Multiple entries from the same counter - check if they all match
      const firstQty = entries[0].countedQty ?? 0;
      const allMatch = entries.every(e => (e.countedQty ?? 0) === firstQty);
      
      if (!allMatch) {
        return { canConfirm: false, message: 'Multiple counts from the same counter do not match' };
      }
    }

    // If we have multiple counters, verify that counts match across counters
    if (groupedByCounter.size > 1) {
      const counterTotals: number[] = [];
      for (const [counterId, entries] of groupedByCounter.entries()) {
        const totalQty = entries.reduce((sum, e) => sum + (e.countedQty ?? 0), 0);
        counterTotals.push(totalQty);
      }
      
      // Check if all counter totals match
      const firstTotal = counterTotals[0];
      const allMatch = counterTotals.every(total => total === firstTotal);
      
      if (!allMatch) {
        return { canConfirm: false, message: 'Counts from different counters do not match' };
      }
    }

    // All validations passed
    return { canConfirm: true, message: '' };
  }

  getCostCode(task: StockTakeTaskDto): string {
    return task.productCostInfo?.costCode || '-';
  }

  getCostPrice(task: StockTakeTaskDto): number {
    return task.productCostInfo?.costPrice || 0;
  }

  getCounterValue(totalQty: number, task: StockTakeTaskDto): number {
    const costPrice = task.productCostInfo?.costPrice || 0;
    return totalQty * costPrice;
  }

  getExpectedQtyValue(expectedQty: number | null | undefined, task: StockTakeTaskDto): number {
    const costPrice = task.productCostInfo?.costPrice || 0;
    const qty = expectedQty || 0;
    return qty * costPrice;
  }

  getUniqueExpectedQty(): number | null | undefined{
    if (!this.foundTask?.stockCountEntries || this.foundTask.stockCountEntries.length === 0) {
      return null;
    }
    // Get the unique expectedQty value (should be the same for all entries)
    const expectedQtys = this.foundTask.stockCountEntries
      .map(e => e.expectedQty)
      .filter(q => q !== null && q !== undefined);
    
    return expectedQtys.length > 0 ? expectedQtys[0] : null;
  }

  getUniqueExpectedQtyForTask(task: StockTakeTaskDto): number | null | undefined {
    if (!task?.stockCountEntries || task.stockCountEntries.length === 0) {
      return null;
    }
    // Get the unique expectedQty value (should be the same for all entries)
    const expectedQtys = task.stockCountEntries
      .map(e => e.expectedQty)
      .filter(q => q !== null && q !== undefined);
    
    return expectedQtys.length > 0 ? expectedQtys[0] : null;
  }

  openAcceptConfirmModal(task: StockTakeTaskDto) {
    if (!task || !task.id) {
      this.alertService.setCustomErrorAlert('No task selected');
      return;
    }

    // Store the task and open the confirmation modal
    this.pendingAcceptTask = task;
    
    // Use Bootstrap modal API to show the modal
    const modalElement = document.getElementById('acceptCountConfirmModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmAcceptCount() {
    if (!this.pendingAcceptTask || !this.pendingAcceptTask.id) {
      this.alertService.setCustomErrorAlert('No task selected');
      return;
    }

    const targetTask = this.pendingAcceptTask;

    // Validation: Check stock count entries
    if (!targetTask.stockCountEntries || targetTask.stockCountEntries.length === 0) {
      this.alertService.setCustomErrorAlert('No stock count entries found. Cannot confirm count.');
      return;
    }

    // Group entries by counterId
    const groupedByCounter = new Map<number, StockCountEntryDto[]>();
    for (const entry of targetTask.stockCountEntries) {
      const counterId = entry.counterId ?? 0;
      if (!groupedByCounter.has(counterId)) {
        groupedByCounter.set(counterId, []);
      }
      groupedByCounter.get(counterId)!.push(entry);
    }

    // Check if there's only 1 counter with entries
    if (groupedByCounter.size === 1) {
      const counterId = Array.from(groupedByCounter.keys())[0];
      const entries = groupedByCounter.get(counterId)!;

      // Only 1 entry from a single counter - not allowed
      if (entries.length === 1) {
        this.alertService.setCustomErrorAlert('Cannot confirm count: At least 2 counts from different counters or 2 counters\' counts match, are required for verification.');
        return;
      }

      // Multiple entries from the same counter - check if they all match
      const firstQty = entries[0].countedQty ?? 0;
      const allMatch = entries.every(e => (e.countedQty ?? 0) === firstQty);

      if (!allMatch) {
        this.alertService.setCustomErrorAlert('Cannot confirm count: Multiple counts from the same counter do not match. Please resolve the discrepancy first.');
        return;
      }
    }

    // If we have multiple counters, verify that counts match across counters
    if (groupedByCounter.size > 1) {
      const counterTotals: number[] = [];
      for (const [counterId, entries] of groupedByCounter.entries()) {
        const totalQty = entries.reduce((sum, e) => sum + (e.countedQty ?? 0), 0);
        counterTotals.push(totalQty);
      }
      
      // Check if all counter totals match
      const firstTotal = counterTotals[0];
      const allMatch = counterTotals.every(total => total === firstTotal);
      
      if (!allMatch) {
        this.alertService.setCustomErrorAlert('Cannot confirm count: Counts from different counters do not match. Please resolve the discrepancy first.');
        return;
      }
    }

    // All validations passed - proceed with updating the task status to Reviewed
    const taskDto = new StockTakeTaskDto();
    taskDto.id = targetTask.id;
    taskDto.sessionId = targetTask.sessionId;
    taskDto.productId = targetTask.productId;
    taskDto.status = StockTakeTaskStatus.Reviewed;
    taskDto.lastUpdated = new Date().toISOString();
    taskDto.assignedTo = targetTask.assignedTo; // Include assignedTo for adjustment creation

    console.log(`[ConfirmCount] Sending task update: id=${taskDto.id}, status=${taskDto.status}, assignedTo=${taskDto.assignedTo}`);

    this.httpService.updateStockTakeTask(taskDto).subscribe(
      response => {
        if (response.success) {
          this.alertService.setCustomSuccessAlert('Count confirmed successfully - Task marked as Reviewed');
          targetTask.status = StockTakeTaskStatus.Reviewed;
          targetTask.lastUpdated = new Date().toISOString();
          
          // Close accordion after accepting
          this.expandedTaskId = null;
          
          // Refresh the session to show updated data
          if (this.session && this.session.id) {
            this.loadSession(this.session.id);
          }
        } else {
          this.alertService.setCustomErrorAlert('Failed to confirm count: ' + response.data);
        }
      },
      err => {
        console.error('Error confirming count', err);
        this.alertService.setCustomErrorAlert('Error confirming count');
      }
    );

    // Close the modal
    const modalElement = document.getElementById('acceptCountConfirmModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }

    // Clear pending task
    this.pendingAcceptTask = null;
  }

  acceptCount(task?: StockTakeTaskDto) {
    const targetTask = task || this.foundTask;

    if (!targetTask || !targetTask.id) {
      this.alertService.setCustomErrorAlert('No task selected');
      return;
    }

    // Update task status to "Reviewed"
    const taskDto = new StockTakeTaskDto();
    taskDto.id = targetTask.id;
    taskDto.sessionId = targetTask.sessionId;
    taskDto.productId = targetTask.productId;
    taskDto.status = StockTakeTaskStatus.Reviewed;
    taskDto.lastUpdated = new Date().toISOString();

    this.httpService.updateStockTakeTask(taskDto).subscribe(
      response => {
        if (response.success) {
          this.alertService.setCustomSuccessAlert('Count accepted successfully');
          targetTask.status = StockTakeTaskStatus.Reviewed;
          targetTask.lastUpdated = new Date().toISOString();
          // Close accordion after accepting
          this.expandedTaskId = null;
        } else {
          this.alertService.setCustomErrorAlert('Failed to accept count: ' + response.data);
        }
      },
      err => {
        console.error('Error accepting count', err);
        this.alertService.setCustomErrorAlert('Error accepting count');
      }
    );
  }

  toggleReviewAccordion() {
    this.showReviewAccordion = !this.showReviewAccordion;
  }

  toggleTaskReview(taskId: number | undefined) {
    if (taskId === undefined) return;

    // If already expanded, collapse it
    if (this.expandedTaskId === taskId) {
      this.expandedTaskId = null;
      return;
    }

    // Expand the new task
    this.expandedTaskId = taskId;

    // Scroll to the bottom of the expanded task after a short delay
    setTimeout(() => {
      this.scrollToExpandedTask();
    }, 100);

    // Lazy load transaction history if not already loaded
    const task = this.tasksRes.lists.find(t => t.id === taskId);
    if (task && task.productId && !task.transactionHistory) {
      this.startLoading('Loading transaction history...');
      this.httpService.getTransactionHistoryByProductId(task.productId).subscribe(
        history => {
          task.transactionHistory = history;
          this.stopLoading();
        },
        err => {
          console.error('Failed to load transaction history', err);
          this.stopLoading();
        }
      );
    }
  }

  scrollToExpandedTask() {
    if (!this.expandedTaskId) return;

    // Find all task rows and find the one that's expanded
    const allTaskRows = document.querySelectorAll('tbody tr:not(.table-light)');
    let expandedRowIndex = -1;

    for (let i = 0; i < allTaskRows.length; i++) {
      const row = allTaskRows[i] as HTMLElement;
      const expandBtn = row.querySelector('.btn-link[title*="Expand/Collapse"]');
      if (expandBtn) {
        const icon = expandBtn.querySelector('i');
        if (icon && icon.classList.contains('bi-chevron-up')) {
          expandedRowIndex = i;
          break;
        }
      }
    }

    // Scroll to the next task row after the expanded section
    if (expandedRowIndex >= 0 && expandedRowIndex < allTaskRows.length - 1) {
      const nextTaskRow = allTaskRows[expandedRowIndex + 1] as HTMLElement;
      if (nextTaskRow) {
        nextTaskRow.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  isTaskExpanded(taskId: number | undefined): boolean {
    return taskId !== undefined && this.expandedTaskId === taskId;
  }

  getOutstandingBalance(transactionHistory: any[]): number {
    if (!transactionHistory || transactionHistory.length === 0) return 0;
    return transactionHistory[transactionHistory.length - 1].runningBalance || 0;
  }

  isSessionInReview(): boolean {
    // Only return true if both current session status AND loaded session status are 3 (Review)
    // This ensures the accordion only shows when the session was saved with Review status
    return Number(this.session?.status) === 3 && Number(this.loadedSessionStatus) === 3;
  }

  acknowledgeDiscrepancy() {
    // User acknowledges the discrepancy and closes the modal
    // They need to go back and fix the count
    this.hasDiscrepancy = false;
    this.discrepancyData = null;
    document.getElementById('modalCloseDiscrepancy')?.click();
  }

  retryAfterReconciliation() {
    // User has reconciled - attempt to save again with same data
    if (!this.pendingCountDto || this.pendingCounterUserId === 0) {
      this.alertService.setCustomErrorAlert('No pending count to retry');
      return;
    }

    const dto = this.pendingCountDto;
    dto.counterId = this.pendingCounterUserId;

    this.httpService.recordStockCountEntry(dto).subscribe(response => {
      if (!response.success && response.data) {
        try {
          const discrepancyInfo = JSON.parse(response.data);
          if (discrepancyInfo.IsDiscrepancy) {
            // Still has discrepancy, keep modal open with updated info
            console.log(discrepancyInfo);
            this.alertService.setCustomErrorAlert('Counts still do not match. Please reconcile and try again.');
            return;
          }
        } catch (e) {
          console.error('Failed to parse discrepancy response', e);
        }
      }

      // If successful, close all modals and refresh
      this.hasDiscrepancy = false;
      this.discrepancyData = null;
      this.pendingCountDto = null;
      document.getElementById('modalCloseDiscrepancy')?.click();
      document.getElementById('modalCloseCount')?.click();

      // Refresh the entire session detail page to show updated task status
      if (this.session && this.session.id) {
        this.loadSession(this.session.id);
      }

      // clear search / state
      this.searchBarcode = '';
      this.filteredTasks = [];
      this.foundTask = undefined;
      this.foundDescription = '';
      this.countedQty = 0;
      this.countNotes = '';
      this.alertService.setCustomSuccessAlert('Stock count entry saved successfully!');
      this.fetchTaskCounts(this.session.id!);
    }, err => {
      console.error(err);
      this.alertService.setCustomErrorAlert('Failed to retry recording stock count entry');
    });
  }

  openAdminPasswordModal() {
    // Reset password input
    this.adminPasswordInput = '';
    // Open the password modal
    const modal = new (window as any).bootstrap.Modal(document.getElementById('adminPasswordModal'));
    modal.show();
  }

  resetPasswordModal() {
    this.adminPasswordInput = '';
  }

  validateAdminPasswordAndOverride() {
    if (!this.adminPasswordInput) {
      this.alertService.setCustomErrorAlert('Please enter admin password');
      return;
    }

    if (!this.pendingCountDto || this.pendingCounterUserId === 0) {
      this.alertService.setCustomErrorAlert('No pending count to override');
      return;
    }

    // Validate admin password
    this.encryptedAdminPassword = this.encryptData(this.adminPasswordInput);
    this.httpService.verifyOverride(this.encryptedAdminPassword).subscribe(response => {
      console.log('Admin password verification response:', response);
      if (response.success) {
        // Password is valid, proceed with override
        this.alertService.setCustomSuccessAlert('Admin password verified. Proceeding with override...');
        
        // Close the password modal
        const modal = document.getElementById('adminPasswordModal');
        if (modal) {
          const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
          if (bootstrapModal) {
            bootstrapModal.hide();
          }
        }

        // Reset password input (but keep encrypted version)
        this.adminPasswordInput = '';

        // Proceed with recording stock count entry without discrepancy check
        this.proceedWithOverride();
      } else {
        // Password is invalid
        this.alertService.setCustomErrorAlert('Invalid admin password. Please try again.');
        this.adminPasswordInput = '';
        this.encryptedAdminPassword = '';
      }
    }, err => {
      console.error('Failed to verify admin password', err);
      this.alertService.setCustomErrorAlert('Error verifying admin password. Please try again.');
      this.adminPasswordInput = '';
      this.encryptedAdminPassword = '';
    });
  }

  encryptData(data: string): string {
    return this.cryptoService.encryptToBase64(data);
  }

  proceedWithOverride() {
    // Record the stock count entry directly without retry mechanism
    if (!this.pendingCountDto || this.pendingCounterUserId === 0) {
      this.alertService.setCustomErrorAlert('No pending count to override');
      return;
    }

    const dto = this.pendingCountDto;
    dto.counterId = this.pendingCounterUserId;

    // Include the encrypted admin password for backend verification
    if (!this.encryptedAdminPassword) {
      this.encryptedAdminPassword = this.encryptData(this.adminPasswordInput);
    }
    dto.overridePassword = this.encryptedAdminPassword;

    this.httpService.recordStockCountEntry(dto).subscribe(response => {
      console.log('Record stock count entry with override response:', response);
      if (!response.success && response.data) {
        try {
          const discrepancyInfo = JSON.parse(response.data);
          if (discrepancyInfo.IsDiscrepancy) {
            // Even with override, still has discrepancy - show message
            this.alertService.setCustomErrorAlert('Override failed: Counts still do not match. Please contact support.');
            return;
          }
        } catch (e) {
          console.error('Failed to parse response', e);
        }
      }

      // If successful, close all modals and refresh
      this.hasDiscrepancy = false;
      this.discrepancyData = null;
      this.pendingCountDto = null;
      this.encryptedAdminPassword = ''; // Clear the encrypted password
      document.getElementById('modalCloseDiscrepancy')?.click();
      document.getElementById('modalCloseCount')?.click();

      // Refresh the entire session detail page to show updated task status
      if (this.session && this.session.id) {
        this.loadSession(this.session.id);
      }

      // clear search / state
      this.searchBarcode = '';
      this.filteredTasks = [];
      this.foundTask = undefined;
      this.foundDescription = '';
      this.countedQty = 0;
      this.countNotes = '';
      this.alertService.setCustomSuccessAlert('Stock count entry saved with admin override!');
      this.fetchTaskCounts(this.session.id!);
    }, err => {
      console.error(err);
      this.alertService.setCustomErrorAlert('Failed to record stock count entry with override');
    });
  }

  searchMismatchedCounts() {
    if (!this.session || !this.session.id) {
      this.alertService.setCustomErrorAlert('No active session to search mismatched counts');
      return;
    }

    this.startLoading('Searching for mismatched counts...');

    // Get first page to determine total records and page count
    var sessionId = this.session.id;
    this.httpService.getTasksBySession(this.session.id, 1).subscribe(firstPageResult => {
      const totalRecords = firstPageResult.totalRecords;
      const pageSize = 10;
      const totalPages = Math.ceil(totalRecords / pageSize);
      
      const allTasks = [...firstPageResult.lists];

      // If only one page, process immediately
      if (totalPages === 1) {
        this.processMismatchedTasks(allTasks);
        return;
      }

      // Fetch all remaining pages
      let pagesLoaded = 1;

      const fetchNextPage = () => {
        if (pagesLoaded >= totalPages) {
          this.processMismatchedTasks(allTasks);
          return;
        }

        pagesLoaded++;
        this.httpService.getTasksBySession(sessionId, pagesLoaded).subscribe(result => {
          allTasks.push(...result.lists);
          fetchNextPage();
        }, err => {
          console.error(err);
          this.stopLoading();
          this.alertService.setCustomErrorAlert('Failed to fetch all tasks for search');
        });
      };

      fetchNextPage();
    }, err => {
      console.error(err);
      this.stopLoading();
      this.alertService.setCustomErrorAlert('Failed to search for mismatched counts');
    });
  }

  processMismatchedTasks(allTasks: StockTakeTaskDto[]) {
    this.mismatchedTasks = [];

    // For each task, check if it has mismatched counts from different users
    console.log('Searching for mismatched counts in tasks:', allTasks);
    for (let task of allTasks) {
      // Skip already reviewed or auto-reviewed tasks
      if (task.status === StockTakeTaskStatus.Reviewed || task.status === StockTakeTaskStatus.AutoReviewed) {
        continue;
      }

      if (task.stockCountEntries && task.stockCountEntries.length >= 2) {
        // Group counts by user
        const userCounts: { [key: number]: number } = {};
        for (let entry of task.stockCountEntries) {
          const userId = Number(entry.counterId) || 0;
          if (!userCounts[userId]) {
            userCounts[userId] = 0;
          }
          userCounts[userId] += entry.countedQty || 0;
        }

        // Check if there are exactly 2 users and their totals don't match
        const userIds = Object.keys(userCounts);
        if (userIds.length === 2) {
          const counts = Object.values(userCounts);
          if (counts[0] !== counts[1]) {
            this.mismatchedTasks.push(task);
          }
        }
      }
    }

    this.stopLoading();

    if (this.mismatchedTasks.length === 0) {
      this.alertService.setCustomSuccessAlert('No mismatched counts found!');
      return;
    }

    this.currentMismatchedIndex = 0;
    this.showingMismatchedTasks = true;
    this.displayMismatchedTask(0);
  }

  displayMismatchedTask(index: number) {
    if (index < 0 || index >= this.mismatchedTasks.length) {
      this.alertService.setCustomSuccessAlert('All mismatched counts have been reviewed!');
      this.showingMismatchedTasks = false;
      this.mismatchedTasks = [];
      return;
    }

    this.currentMismatchedIndex = index;
    const task = this.mismatchedTasks[index];
    
    if (!task.stockCountEntries || task.stockCountEntries.length < 2) {
      this.nextMismatchedTask();
      return;
    }

    // Calculate sum per user
    const userCounts: { [key: number]: { count: number; entries: StockCountEntryDto[] } } = {};
    for (let entry of task.stockCountEntries) {
      const userId = Number(entry.counterId) || 0;
      if (!userCounts[userId]) {
        userCounts[userId] = { count: 0, entries: [] };
      }
      userCounts[userId].count += entry.countedQty || 0;
      userCounts[userId].entries.push(entry);
    }

    const userIds = Object.keys(userCounts);
    if (userIds.length !== 2) {
      this.nextMismatchedTask();
      return;
    }

    const userId1 = Number(userIds[0]);
    const userId2 = Number(userIds[1]);
    const count1 = userCounts[userId1].count;
    const count2 = userCounts[userId2].count;
    
    // Get timestamps from entries
    const timestamp1 = userCounts[userId1].entries.length > 0 
      ? userCounts[userId1].entries[userCounts[userId1].entries.length - 1].timestamp 
      : null;
    const timestamp2 = userCounts[userId2].entries.length > 0
      ? userCounts[userId2].entries[userCounts[userId2].entries.length - 1].timestamp
      : null;

    // Fetch product description
    let productDescription = '';
    let productBarcode = task.productId ? task.productId.toString() : '';
    
    const buildDiscrepancyData = () => {
      this.discrepancyData = {
        IsDiscrepancy: true,
        Message: "Count mismatch found in this item!",
        ProductBarcode: (task.productId ?? 0).toString(),
        ProductDescription: productDescription,
        FirstUserCountQty: count1,
        FirstUserCounterName: `User ${userId1}`,
        FirstUserCountTimestamp: timestamp1,
        CurrentUserCountQty: count2,
        SecondUserName: `User ${userId2}`,
        SecondUserCountTimestamp: timestamp2,
        Notes: `User ${userId1} counted ${count1} units. User ${userId2} counted ${count2} units. Please reconcile the counts.`,
        IsMismatchedTaskReview: true
      };
      this.hasDiscrepancy = true;
      setTimeout(() => document.getElementById('btnOpenDiscrepancyModal')?.click(), 50);
    };

    // Fetch product first
    this.httpService.getProductByBarcode(productBarcode).subscribe(
      prodRes => {
        const product = (prodRes && prodRes.lists && prodRes.lists.length > 0) ? prodRes.lists[0] : null;
        productDescription = product?.description || product?.cDescription || `Product ${task.productId}`;
        buildDiscrepancyData();
      },
      err => {
        console.error('Failed to fetch product details:', err);
        productDescription = `Product ${task.productId}`;
        buildDiscrepancyData();
      }
    );
  }

  nextMismatchedTask() {
    // Fetch latest task data to check if discrepancy is still present
    if (this.currentMismatchedIndex < 0 || this.currentMismatchedIndex >= this.mismatchedTasks.length) {
      this.acknowledgeDiscrepancy();
      this.displayMismatchedTask(this.currentMismatchedIndex + 1);
      return;
    }

    const currentTask = this.mismatchedTasks[this.currentMismatchedIndex];
    if (!currentTask || !currentTask.id) {
      this.acknowledgeDiscrepancy();
      this.displayMismatchedTask(this.currentMismatchedIndex + 1);
      return;
    }

    // Fetch fresh task data from server to check if discrepancy has been resolved
    console.log('Fetching latest data for task id', currentTask.id);
    this.httpService.getTaskById(currentTask.id).subscribe(freshTask => {
      if (!freshTask) {
        this.acknowledgeDiscrepancy();
        this.displayMismatchedTask(this.currentMismatchedIndex + 1);
        return;
      }

      // Update the task with fresh data
      this.mismatchedTasks[this.currentMismatchedIndex] = freshTask;

      // Now check if discrepancy still exists with fresh data
      if (this.currentTaskHasDiscrepancy()) {
        this.alertService.setCustomErrorAlert('Please resolve the current discrepancy before moving to the next item.');
        return;
      }

      // Discrepancy has been resolved, move to next item
      this.acknowledgeDiscrepancy();
      this.displayMismatchedTask(this.currentMismatchedIndex + 1);
    }, err => {
      console.error('Failed to fetch latest task data:', err);
      this.alertService.setCustomErrorAlert('Failed to verify discrepancy status. Please try again.');
    });
  }

  previousMismatchedTask() {
    // Fetch latest task data to check if discrepancy is still present
    if (this.currentMismatchedIndex < 0 || this.currentMismatchedIndex >= this.mismatchedTasks.length) {
      this.acknowledgeDiscrepancy();
      this.displayMismatchedTask(this.currentMismatchedIndex - 1);
      return;
    }

    const currentTask = this.mismatchedTasks[this.currentMismatchedIndex];
    if (!currentTask || !currentTask.id) {
      this.acknowledgeDiscrepancy();
      this.displayMismatchedTask(this.currentMismatchedIndex - 1);
      return;
    }

    // Fetch fresh task data from server to check if discrepancy has been resolved
    this.httpService.getTaskById(currentTask.id).subscribe(freshTask => {
      if (!freshTask) {
        this.acknowledgeDiscrepancy();
        this.displayMismatchedTask(this.currentMismatchedIndex - 1);
        return;
      }

      // Update the task with fresh data
      this.mismatchedTasks[this.currentMismatchedIndex] = freshTask;

      // Now check if discrepancy still exists with fresh data
      if (this.currentTaskHasDiscrepancy()) {
        this.alertService.setCustomErrorAlert('Please resolve the current discrepancy before moving to the previous item.');
        return;
      }

      // Discrepancy has been resolved, move to previous item
      this.acknowledgeDiscrepancy();
      this.displayMismatchedTask(this.currentMismatchedIndex - 1);
    }, err => {
      console.error('Failed to fetch latest task data:', err);
      this.alertService.setCustomErrorAlert('Failed to verify discrepancy status. Please try again.');
    });
  }

  currentTaskHasDiscrepancy(): boolean {
    // Get the current mismatched task
    if (this.currentMismatchedIndex < 0 || this.currentMismatchedIndex >= this.mismatchedTasks.length) {
      return false;
    }

    const currentTask = this.mismatchedTasks[this.currentMismatchedIndex];
    if (!currentTask || !currentTask.stockCountEntries || currentTask.stockCountEntries.length < 2) {
      return false;
    }

    // Calculate sum per user
    const userCounts: { [key: number]: number } = {};
    for (let entry of currentTask.stockCountEntries) {
      const userId = Number(entry.counterId) || 0;
      if (!userCounts[userId]) {
        userCounts[userId] = 0;
      }
      userCounts[userId] += entry.countedQty || 0;
    }

    // Check if there are exactly 2 users and their totals don't match
    const userIds = Object.keys(userCounts);
    if (userIds.length === 2) {
      const counts = Object.values(userCounts);
      return counts[0] !== counts[1]; // Return true if counts still don't match (discrepancy exists)
    }

    return false;
  }

  /**
   * Format the value display for task counts
   * Returns formatted string like "2 (1,234.50)" or just "2" if value is 0
   */
  formatValueDisplay(count: number, value: number): string {
    if (value === 0) {
      return count.toString();
    }
    const formattedValue = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${count} (${formattedValue})`;
  }
}