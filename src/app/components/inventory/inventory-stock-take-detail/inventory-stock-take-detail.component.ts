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

@Component({
  selector: 'app-inventory-stock-take-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ActionMenuComponent, NgbModule],
  templateUrl: './inventory-stock-take-detail.component.html',
  styleUrls: ['../../settings/main/main.component.css', './inventory-stock-take-detail.component.css']
})
export class InventoryStockTakeDetailComponent implements OnInit {
  session: StockTakeSessionDto = new StockTakeSessionDto();
  loading = false;
  tasksRes: ResponseListDto<StockTakeTaskDto> = new ResponseListDto<StockTakeTaskDto>();
  searchBarcode: string = '';
  filteredTasks: StockTakeTaskDto[] = [];
  foundTask?: StockTakeTaskDto;
  foundDescription: any = '';
  stockTakeEntryProdDto: ProductDto = null as any;
  taskCounts: { pending: number; counted: number; verified: number; total: number } = { pending: 0, counted: 0, verified: 0, total: 0 };
  countedQty: number | null = 0;
  countNotes: string = '';
  pendingCreateDto: any = null;
  pendingCreateMessage: string = '';

  statusItems = [ { id: 1, name: 'Draft' }, { id: 2, name: 'In-Progress' }, { id: 3, name: 'Review' }, { id: 3, name: 'Posted' }  ];
  typeItems = [ { id: 1, name: 'Partial' }, { id: 2, name: 'Full' } ];
  
  togSave = new EventEmitter<boolean>();
  togPrint = new EventEmitter<boolean>(); 

  constructor(private route: ActivatedRoute, 
    private router: Router, 
    private httpService: HttpService,
    private alertService: AlertService,
    private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    if (id === 'new') {
      this.session = new StockTakeSessionDto();
    } else {
      this.loadSession(Number(id));
    }

  }

  fetchTaskCounts(sessionId: number) {
    if (!sessionId) return;
    this.httpService.countTasksBySession(sessionId).subscribe(res => {
      try {
        console.log('CountTasksBySession response:', res);
        const obj = JSON.parse(res.data || '{}');
        this.taskCounts.pending = obj.Pending ?? 0;
        this.taskCounts.counted = obj.Counted ?? 0;
        this.taskCounts.verified = obj.Verified ?? 0;
        this.taskCounts.total = obj.Total ?? (this.taskCounts.pending + this.taskCounts.counted + this.taskCounts.verified);
      } catch (e) {
        console.error('Failed parsing CountTasksBySession response', e, res);
      }
    }, err => {
      console.error('Failed loading task counts', err);
    });
  }

  getDisplayedTasks(): StockTakeTaskDto[] {
    return (this.filteredTasks && this.filteredTasks.length > 0) ? this.filteredTasks : this.tasksRes.lists;
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
        this.httpService.getTaskBySessionAndProduct(this.session.id!, pid).subscribe(task => {
          if (task && task.id) {
            this.foundTask = task;
            this.filteredTasks = [task];
            // fetch product details for found task and show description in modal
            this.httpService.getProductByBarcode(this.searchBarcode).subscribe(prodRes => {
              const p = (prodRes && prodRes.lists && prodRes.lists.length > 0) ? prodRes.lists[0] : null;
              if (p) {
                (this.foundTask as any).productDto = p;
                //this.foundDescription = p.description || p.cDescription || ('Product ' + (task.productId ?? ''));
                //this.foundDescription = this.sanitizer.bypassSecurityTrustHtml("<b>Part No:</b>" + (p.partNo || '') + "<br><b>CDesc: </b>" + (p.cDescription || '') + "<br><b>Brand: </b>" + (p.brand || '') + "<br><b>CCode: </b>" + (p.cCode || '') + "<br><b>Application: </b>" + (p.application || '') + ", MainGroup: </b>" + (p.mainGroup || '') + ", ARef: </b>" + (p.aRef || ''));
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
          this.httpService.getTaskBySessionAndProduct(this.session!.id!, product.id ?? 0).subscribe(task => {
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
          }, err => {
            console.error(err);
            this.alertService.setCustomErrorAlert('Failed searching for task');
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

    // First get current count entries for this task to compute the next stockCount
    const taskId = this.foundTask?.id ?? 0;
    this.httpService.getCountsByTask(taskId).subscribe(current => {
      const nextCount = (current.totalRecords ?? 0) + 1;
      dto.countNumber = nextCount;
        // set timestamp
        dto.timestamp = new Date().toISOString();

        // resolve counterId via API using stored session token, fallback to localStorage keys
        const token = localStorage.getItem('sessionToken') || '';
        const finalizeAndPost = (counterIdVal: number) => {
          dto.counterId = Number(counterIdVal) || 0;
          this.httpService.recordStockCountEntry(dto).subscribe(_ => {
            // close modal
            document.getElementById('modalCloseCount')?.click();
            // refresh current page tasks
            if (this.session && this.session.id) this.loadTasks(this.session.id, this.tasksRes.pageNum || 1);

            // clear search / state
            this.searchBarcode = '';
            this.filteredTasks = [];
            this.foundTask = undefined;
            this.foundDescription = '';
            this.countedQty = 0;
            this.countNotes = '';
            this.alertService.setSuccessAlert();
            this.fetchTaskCounts(this.session.id!);
          }, err => {
            console.error(err);
            this.alertService.setCustomErrorAlert('Failed to record stock count entry');
          });
        };

        if (token) {
          this.httpService.getUserId(token).subscribe(resUser => {
            const uid = Number(resUser.data) || Number(localStorage.getItem('sessionUserId') || localStorage.getItem('userId') || 0);
            finalizeAndPost(uid);
          }, err => {
            console.error(err);
            const fallback = Number(localStorage.getItem('sessionUserId') || localStorage.getItem('userId') || 0);
            finalizeAndPost(fallback);
          });
        } else {
          const fallback = Number(localStorage.getItem('sessionUserId') || localStorage.getItem('userId') || 0);
          finalizeAndPost(fallback);
        }

      
    }, err => {
      console.error(err);
      this.alertService.setCustomErrorAlert('Failed to retrieve counts for task');
    });
  }

  canOpenCountModal(task: StockTakeTaskDto): boolean {
    if (!task) return false;
    const sc = task.stockCount ?? 0;
    const status = (task.status || '').toString().toLowerCase();
    // treat stockCount == 2 or status == Verified as the same block condition
    if (sc === 2 || status === 'verified') {
      this.alertService.setCustomErrorAlert('Cannot add count — task already verified');
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
      this.loading = false;
      if (this.session && this.session.id) {
        this.loadTasks(this.session.id, 1);
      }
    }, _ => this.loading = false);
  }

  loadTasks(sessionId: number, pageNo: number){
    this.tasksRes.lists = [];
    this.httpService.getTasksBySession(sessionId, pageNo).subscribe(result => {
      this.tasksRes.pageStart = result.pageStart;
      this.tasksRes.pageEnd = result.pageEnd;
      this.tasksRes.pageNum = result.pageNum;
      this.tasksRes.totalRecords = result.totalRecords;
      var tempPageStart = this.tasksRes.pageStart;
      this.tasksRes.pageNoList = Array((this.tasksRes.pageEnd + 1) - this.tasksRes.pageStart).fill(this.tasksRes.pageStart).map((x, i) => tempPageStart++);
      this.tasksRes.lists = result.lists;
      // attach productDto for display by fetching product details for each task's productId
      for (let t of this.tasksRes.lists) {
        if (t.productId) {
          this.httpService.getProductByBarcode(t.productId.toString()).subscribe(prodRes => {
            const p = (prodRes && prodRes.lists && prodRes.lists.length > 0) ? prodRes.lists[0] : null;
            if (p) (t as any).productDto = p;
          }, err => console.error(err));
        }
      }
      // fetch counts summary for the session
      this.fetchTaskCounts(sessionId);
    }, error => console.error(error));
  }

  clickPageTasks(pageNo:number){
    if(!this.session || !this.session.id) return;
    this.loadTasks(this.session.id, pageNo);
  }

  save() {
    if (this.session.id && this.session.id > 0) {
      this.httpService.updateStockTakeSession(this.session).subscribe(_ => this.router.navigate(['/inventorystocktake']));
    } else {
      this.httpService.createStockTakeSession(this.session).subscribe( res => {
        //_ => this.router.navigate(['/inventorystocktake'])
      });
    }
  }

  cancel() {
    this.router.navigate(['/inventorystocktake']);
  }
  
  onPrint() {
    // Implement print functionality if needed
  }
}
