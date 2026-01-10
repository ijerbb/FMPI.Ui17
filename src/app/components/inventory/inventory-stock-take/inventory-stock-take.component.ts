import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { StockTakeSessionDto } from '../../../models/dto/stockTakeSessionDto';
import { ResponseListDto } from '../../../models/dto/responseListDto';

@Component({
  selector: 'app-inventory-stock-take',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './inventory-stock-take.component.html',
  styleUrls: ['../../settings/main/main.component.css', './inventory-stock-take.component.css']
})
export class InventoryStockTakeComponent implements OnInit {
  sessions: ResponseListDto<StockTakeSessionDto> = new ResponseListDto<StockTakeSessionDto>();
  loading = false;
  headerText: string = "";
  statusItems = [ { id: 1, name: 'Draft' }, { id: 2, name: 'In-Progress' }, { id: 3, name: 'Review' }, { id: 4, name: 'Posted' }  ];
  typeItems = [ { id: 1, name: 'Partial' }, { id: 2, name: 'Full' } ];

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
        //createdDate: (x as any).createdDate ?? (x as any).CreatedDate ?? (x as any).date ?? (x as any).Date,
        //displayDate: x?.createdDate ? new Date(x.createdDate).toLocaleDateString('en-US') : ''
      }));
      this.sessions.lists = formattedList as unknown as StockTakeSessionDto[];
    }, _ => this.loading = false);
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
