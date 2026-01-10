import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { StockTakeSessionDto } from '../../../models/dto/stockTakeSessionDto';
import { StateService } from '../../../services/state.service';
import { ResponseListDto } from '../../../models/dto/responseListDto';

@Component({
  selector: 'app-stock-take',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './stock-take.component.html',
  styleUrls: ['./stock-take.component.css']
})
export class StockTakeComponent implements OnInit {
  sessions: ResponseListDto<StockTakeSessionDto> = new ResponseListDto<StockTakeSessionDto>();
  current: StockTakeSessionDto = new StockTakeSessionDto();
  loading = false;

  constructor(private httpService: HttpService, private stateService: StateService) {
  }

  ngOnInit(): void {
    this.loadList();
  }

  loadList() {
    this.loading = true;
    this.httpService.listStockTakeSessions().subscribe(result => {
      this.sessions = result || [];
      this.loading = false;
    }, error => { console.error(error); this.loading = false; });
  }

  selectSession(s: StockTakeSessionDto) {
    this.current = { ...s };
  }

  newSession() {
    this.current = new StockTakeSessionDto();
  }

  saveSession() {
    if (this.current.id && this.current.id > 0) {
      this.httpService.updateStockTakeSession(this.current).subscribe(_ => this.loadList(), err => console.error(err));
    } else {
      this.httpService.createStockTakeSession(this.current).subscribe(_ => this.loadList(), err => console.error(err));
    }
  }
}
