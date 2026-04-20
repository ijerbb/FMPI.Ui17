import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { StockTakeSessionDto } from '../../../models/dto/stockTakeSessionDto';
import { ResponseListDto } from '../../../models/dto/responseListDto';
import { PaginationComponent } from '../../../components/shared/pagination/pagination.component';

interface BulkAction {
  label: string;
  action: string;
}

@Component({
  selector: 'app-inventory-stock-take',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './inventory-stock-take.component.html',
  styleUrls: ['./inventory-stock-take.component.css']
})
export class InventoryStockTakeComponent implements OnInit {
  sessions: ResponseListDto<StockTakeSessionDto> = new ResponseListDto<StockTakeSessionDto>();
  filteredSessions: StockTakeSessionDto[] = [];
  loading = false;
  headerText: string = "";
  statusItems = [ { id: 1, name: 'Draft' }, { id: 2, name: 'In-Progress' }, { id: 3, name: 'Review' }, { id: 4, name: 'Posted' }  ];
  typeItems = [ { id: 1, name: 'Partial' }, { id: 2, name: 'Full' } ];
  
  // Search
  searchStr: string = '';
  
  // Bulk selection
  selectedItems: Set<number> = new Set();
  selectAll: boolean = false;
  showBulkActionDropdown: boolean = false;
  bulkActions: BulkAction[] = [
    { label: 'Delete Selected', action: 'delete' }
  ];

  constructor(private httpService: HttpService, private router: Router) {}

  ngOnInit(): void {
    this.loadList();
    this.headerText = 'Stock Take Sessions';
  }

  getTypeName(typeId: any) {
    const id = Number(typeId);
    const t = this.typeItems.find(x => x.id === id);
    return t ? t.name : typeId;
  }

  getStatusName(statusId: any) {
    const id = Number(statusId);
    const s = this.statusItems.find(x => x.id === id);
    return s ? s.name : statusId;
  }

  loadList(pageNo: number = 1) {
    this.loading = true;
    this.httpService.listStockTakeSessions().subscribe(res => {
      this.sessions = res || new ResponseListDto<StockTakeSessionDto>();
      this.loading = false;
      const formattedList = (res?.lists || []).map((x: any) => ({
        id: (x as any).Id ?? (x as any).id,
        name: (x as any).Name ?? (x as any).name,
        type: (x as any).Type ?? (x as any).type,
        status: (x as any).Status ?? (x as any).status,
        createdDate: x?.createdDate ? new Date(x.createdDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : ''
      }));
      this.sessions.lists = formattedList as unknown as StockTakeSessionDto[];
      this.filteredSessions = this.sessions.lists;
      this.selectedItems.clear();
      this.selectAll = false;
    }, _ => this.loading = false);
  }

  onSearch(): void {
    if (!this.searchStr) {
      this.filteredSessions = this.sessions.lists;
    } else {
      const searchLower = this.searchStr.toLowerCase();
      this.filteredSessions = this.sessions.lists.filter(s => 
        s.name?.toLowerCase().includes(searchLower)
      );
    }
  }

  onClearSearch(): void {
    this.searchStr = '';
    this.onSearch();
  }

  // Bulk selection methods
  toggleSelection(id: number | null | undefined): void {
    if (!id) return;
    if (this.selectedItems.has(id)) {
      this.selectedItems.delete(id);
    } else {
      this.selectedItems.add(id);
    }
    this.updateSelectAll();
  }

  toggleSelectAll(): void {
    this.selectedItems.clear();
    if (this.selectAll) {
      this.filteredSessions.forEach(s => {
        if (s.id) this.selectedItems.add(s.id);
      });
    }
    this.updateSelectAll();
  }

  updateSelectAll(): void {
    this.selectAll = this.filteredSessions.length > 0 && 
      this.filteredSessions.every(s => s.id && this.selectedItems.has(s.id));
  }

  toggleBulkActionDropdown(): void {
    this.showBulkActionDropdown = !this.showBulkActionDropdown;
  }

  onBulkAction(action: string): void {
    switch (action) {
      case 'delete':
        this.handleBulkDelete();
        break;
    }
    this.showBulkActionDropdown = false;
  }

  handleBulkDelete(): void {
    if (this.selectedItems.size === 0) return;
    const confirmed = confirm(`Are you sure you want to delete ${this.selectedItems.size} session(s)?`);
    if (!confirmed) return;
    // TODO: Implement bulk delete API call
    console.log('Delete sessions:', Array.from(this.selectedItems));
  }

  clickPageTasks(pageNo:number){
    this.loadList(pageNo);
  }

  edit(s: StockTakeSessionDto) {
    this.router.navigate(['/inventorystocktakedetails', s.id]);
  }

  addNew() {
    this.router.navigate(['/inventorystocktakedetails', 'new']);
  }
}
