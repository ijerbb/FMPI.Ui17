import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpService } from './http.service';
import { environment } from '../../environments/environment';
import { ResponseListDto } from '../models/dto/responseListDto';
import { ResponseDto } from '../models/dto/responseDto';
import { ProductDto } from '../models/dto/productDto';
import { UserDto } from '../models/dto/userDto';
import { ProductSearchDto } from '../models/dto/productSearchDto';
import { ProductPricesDto } from '../models/dto/productPricesDto';
import { productInquiryDto } from '../models/dto/productInquiryDto';
import { ProductBarcodeDto } from '../models/dto/productBarcodeDto';
import { StockTakeSessionDto } from '../models/dto/stockTakeSessionDto';
import { StockTakeTaskDto } from '../models/dto/stockTakeTaskDto';
import { StockCountEntryDto } from '../models/dto/stockCountEntryDto';
import { BirTransactionDto, BirTransactionFilterDto, RemoveTransactionRequest, TransactionHeaderForBirDto } from '../models/dto/birTransactionDto';
import { TransactionHeaderDto } from '../models/dto/transactionHeaderDto';
import { TransactionHistoryDto } from '../models/dto/transactionHistoryDto';

const emptyListResponse = <T>() => ({
  lists: [] as T[],
  pageStart: 1,
  pageEnd: 5,
  pageNum: 1,
  pageSize: 20,
  totalRecords: 0,
  pageNoList: []
});

const okResponse = (data: string): ResponseDto => ({
  success: true,
  data,
  rawData: ''
});

describe('HttpService', () => {
  let service: HttpService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(HttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Product methods', () => {
    it('getProducts should GET products with page number', (done) => {
      const mockResponse = emptyListResponse<ProductDto>();
      service.getProducts(1).subscribe(response => {
        expect(response.lists).toEqual([]);
        expect(response.pageNum).toBe(1);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Products/GetAllItems?pageNum=1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('getProductByBarcode should GET product by barcode', (done) => {
      const mockResponse = emptyListResponse<ProductDto>();
      service.getProductByBarcode('TEST123').subscribe(response => {
        expect(response.lists).toEqual([]);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Products/GetProduct?barcode=TEST123`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('getProduct should POST product search with DTO', (done) => {
      const mockResponse = emptyListResponse<ProductDto>();
      const searchDto: ProductSearchDto = {
        barcode: '', searchMode: 'advance', pageNo: 1,
        partNo: 'PART1', cDescription: 'Test', brand: 'Brand',
        cCode: 'C001', application: 'App', mainGroup: 'Group', aRef: 'REF'
      };
      service.getProduct(searchDto).subscribe(response => {
        expect(response.lists).toEqual([]);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Products/GetProduct`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(searchDto);
      req.flush(mockResponse);
    });

    it('getProductAdvanceSearch should GET with multiple query params', (done) => {
      const mockResponse = emptyListResponse<ProductDto>();
      const searchDto: ProductSearchDto = {
        barcode: '', searchMode: 'advance', pageNo: 1,
        partNo: 'PART1', cDescription: 'Test', brand: 'Brand',
        cCode: 'C001', application: 'App', mainGroup: 'Group', aRef: 'REF'
      };
      service.getProductAdvanceSearch(searchDto).subscribe(response => {
        expect(response.lists).toEqual([]);
        done();
      });
      const req = httpMock.expectOne(
        `${environment.apiUrl}/Products/GetProductsByAdvanceSearch?partNo=PART1&cDescription=Test&brand=Brand&cCode=C001&application=App&mainGroup=Group&aRef=REF`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('getProductAdvancedSearch should POST with prices', (done) => {
      const mockResponse = emptyListResponse<ProductPricesDto>();
      const searchDto: ProductSearchDto = {
        barcode: '', searchMode: 'advance', pageNo: 1,
        partNo: 'PART1', cDescription: 'Test', brand: 'Brand',
        cCode: 'C001', application: 'App', mainGroup: 'Group', aRef: 'REF'
      };
      service.getProductAdvancedSearch(searchDto).subscribe(response => {
        expect(response.lists).toEqual([]);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Products/GetProductsByAdvancedSearch`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(searchDto);
      req.flush(mockResponse);
    });

    it('getProductBySearch should GET with searchTerm and pageNo', (done) => {
      const mockResponse = emptyListResponse<ProductPricesDto>();
      service.getProductBySearch('test product', 2).subscribe(response => {
        expect(response.lists).toEqual([]);
        done();
      });
      const req = httpMock.expectOne(
        `${environment.apiUrl}/Products/GetProductsBySearch?searchTerm=test%20product&pageNo=2`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('isBarcodeExist should GET barcode existence check', (done) => {
      service.isBarcodeExist('EXISTING123').subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Products/IsBarcodeExist?barcode=EXISTING123`);
      expect(req.request.method).toBe('GET');
      req.flush(okResponse('true'));
    });

    it('excludeBarcode should PUT to exclude a barcode', (done) => {
      const barcodeDto: ProductBarcodeDto = { barcode: 'EXCL123', isActive: false, isInExclusionList: true };
      service.excludeBarcode(barcodeDto).subscribe(response => {
        expect(response).toBeTruthy();
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Products/ExcludeBarcode`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(barcodeDto);
      req.flush({});
    });

    it('getProductInquiry should GET inquiry with transaction history', (done) => {
      service.getProductInquiry('INQ123', 1).subscribe(response => {
        expect(response).toBeTruthy();
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Products/GetProductInquiry?barcode=INQ123&PageNo=1`);
      expect(req.request.method).toBe('GET');
      req.flush({ product: {}, history: [] });
    });

    it('patchProduct should PATCH product update', (done) => {
      const productDto: Partial<ProductDto> = { id: 1, code: 'C001', description: 'Test Product', partNo: 'PART1' };
      service.patchProduct(productDto as ProductDto).subscribe(response => {
        expect(response).toBeTruthy();
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Products/PatchProduct`);
      expect(req.request.method).toBe('PATCH');
      req.flush({});
    });

    it('recordStockTake should PATCH stock take record', (done) => {
      service.recordStockTake({ id: 1, qtyOnHand: 100, actualQty: 10, transDate: '2024-01-01' }).subscribe(response => {
        expect(response).toBeTruthy();
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Products/RecordProductStockTake`);
      expect(req.request.method).toBe('PATCH');
      req.flush({});
    });
  });

  describe('Stock Take methods', () => {
    it('listStockTakeSessions should GET sessions with pagination', (done) => {
      const mockResponse = emptyListResponse<StockTakeSessionDto>();
      service.listStockTakeSessions(1).subscribe(response => {
        expect(response.lists).toEqual([]);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Inventory/ListSessions?pageNum=1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('createStockTakeSession should POST new session', (done) => {
      const sessionDto: StockTakeSessionDto = { name: 'Test Session' };
      service.createStockTakeSession(sessionDto).subscribe(response => {
        expect(response).toBeTruthy();
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Inventory/CreateSession`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(sessionDto);
      req.flush({});
    });

    it('updateStockTakeSession should PUT updated session', (done) => {
      const sessionDto: StockTakeSessionDto = { id: 1, name: 'Updated' };
      service.updateStockTakeSession(sessionDto).subscribe(response => {
        expect(response).toBeTruthy();
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Inventory/UpdateSession`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(sessionDto);
      req.flush({});
    });

    it('getTasksBySession should GET tasks for a session', (done) => {
      const mockResponse = emptyListResponse<StockTakeTaskDto>();
      service.getTasksBySession(1, 1).subscribe(response => {
        expect(response.lists).toEqual([]);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Inventory/GetTasksBySession?sessionId=1&pageNum=1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('getTasksBySessionAndStatus should GET tasks filtered by status', (done) => {
      const mockResponse = emptyListResponse<StockTakeTaskDto>();
      service.getTasksBySessionAndStatus(1, 'PENDING', 1).subscribe(response => {
        expect(response.lists).toEqual([]);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Inventory/GetTasksBySessionAndStatus?sessionId=1&status=PENDING&pageNum=1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('getTaskBySessionAndProduct should GET task by session and product', (done) => {
      const mockTask: StockTakeTaskDto = { id: 1, sessionId: 1, productId: 100 };
      service.getTaskBySessionAndProduct(1, 100).subscribe(task => {
        expect(task.id).toBe(1);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Inventory/GetTaskBySessionAndProductAndUserId?sessionId=1&productId=100`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTask);
    });

    it('getTaskBySessionAndProductAndUserId should GET task with userId', (done) => {
      const mockTask: StockTakeTaskDto = { id: 1, sessionId: 1, productId: 100, assignedTo: 5 };
      service.getTaskBySessionAndProductAndUserId(1, 100, 5).subscribe(task => {
        expect(task.id).toBe(1);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Inventory/GetTaskBySessionAndProductAndUserId?sessionId=1&productId=100&userId=5`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTask);
    });

    it('createStockTakeTask should POST new task', (done) => {
      const taskDto: StockTakeTaskDto = { sessionId: 1, productId: 100 };
      service.createStockTakeTask(taskDto).subscribe(task => {
        expect(task).toBeTruthy();
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Inventory/AddTask`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(taskDto);
      req.flush({ taskId: 1, sessionId: 1, productId: 100 });
    });

    it('countTasksBySession should GET task count for session', (done) => {
      service.countTasksBySession(1).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Inventory/CountTasksBySession?sessionId=1`);
      expect(req.request.method).toBe('GET');
      req.flush(okResponse('10'));
    });

    it('getTaskValuesBySession should GET task values for session', (done) => {
      service.getTaskValuesBySession(1).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Inventory/GetTaskValuesBySession?sessionId=1`);
      expect(req.request.method).toBe('GET');
      req.flush(okResponse('{"total": 1000}'));
    });

    it('recordStockCountEntry should POST count entry', (done) => {
      const entryDto: StockCountEntryDto = { taskId: 1, countedQty: 50, counterId: 5 };
      service.recordStockCountEntry(entryDto).subscribe(response => {
        expect(response).toBeTruthy();
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Inventory/RecordCountEntry`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(entryDto);
      req.flush({});
    });

    it('getCountsByTask should GET count entries for task', (done) => {
      const mockResponse = emptyListResponse<StockCountEntryDto>();
      service.getCountsByTask(1).subscribe(response => {
        expect(response.lists).toEqual([]);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Inventory/GetCountsByTask?taskId=1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('getTaskById should GET task by ID', (done) => {
      const mockTask: StockTakeTaskDto = { id: 5, sessionId: 1, productId: 100 };
      service.getTaskById(5).subscribe(task => {
        expect(task.id).toBe(5);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Inventory/GetTaskById?taskId=5`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTask);
    });

    it('updateStockTakeTask should PATCH task update', (done) => {
      const taskDto: StockTakeTaskDto = { id: 5, status: 'COMPLETED' };
      service.updateStockTakeTask(taskDto).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Inventory/UpdateTask`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(taskDto);
      req.flush(okResponse(''));
    });

    it('confirmCountAndCreateAdjustment should POST confirmation', (done) => {
      service.confirmCountAndCreateAdjustment(1, 5).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Inventory/ConfirmCountAndCreateAdjustment?taskId=1&userId=5`);
      expect(req.request.method).toBe('POST');
      req.flush(okResponse(''));
    });

    it('batchCreateMissingAdjustments should POST batch operation', (done) => {
      service.batchCreateMissingAdjustments(1, 5).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Inventory/BatchCreateMissingAdjustments?sessionId=1&userId=5`);
      expect(req.request.method).toBe('POST');
      req.flush(okResponse(''));
    });

    it('syncActualInventory should POST with optional userId', (done) => {
      service.syncActualInventory(1, 5).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Inventory/SyncActualInventory?sessionId=1&userId=5`);
      expect(req.request.method).toBe('POST');
      req.flush(okResponse(''));
    });

    it('syncActualInventory should POST without userId when undefined', (done) => {
      service.syncActualInventory(1).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Inventory/SyncActualInventory?sessionId=1`);
      expect(req.request.method).toBe('POST');
      req.flush(okResponse(''));
    });
  });

  describe('User/Settings methods', () => {
    it('getAllUsers should GET user list', (done) => {
      const mockUsers: UserDto[] = [
        { id: 1, code: 'U001', name: 'User One', password: '', confirmpassword: '', token: '', databaseName: '' },
        { id: 2, code: 'U002', name: 'User Two', password: '', confirmpassword: '', token: '', databaseName: '' }
      ];
      service.getAllUsers().subscribe(users => {
        expect(users.length).toBe(2);
        expect(users[0].name).toBe('User One');
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Settings/AllUsers`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('getUser should GET user by ID', (done) => {
      const mockUser: UserDto = { id: 1, code: 'U001', name: 'User One', password: '', confirmpassword: '', token: '', databaseName: '' };
      service.getUser(1).subscribe(user => {
        expect(user.id).toBe(1);
        expect(user.name).toBe('User One');
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Settings/UserById?id=1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('patchUser should PATCH user update', (done) => {
      const userDto: UserDto = { id: 1, code: 'U001', name: 'Updated User', password: '', confirmpassword: '', token: '', databaseName: '' };
      service.patchUser(userDto).subscribe(response => {
        expect(response).toBeTruthy();
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Settings/PatchUser`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(userDto);
      req.flush({});
    });

    it('verifyLogin should POST login credentials', (done) => {
      const userDto: UserDto = { code: 'admin', password: 'encrypted_pass', databaseName: 'TestDB', confirmpassword: '', token: '', name: '' };
      service.verifyLogin(userDto).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data).toBe('session-token-xyz');
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Settings/VerifyLogin`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(userDto);
      req.flush(okResponse('session-token-xyz'));
    });

    it('verifyAccessRights should GET access rights check', (done) => {
      service.verifyAccessRights('token123', 'admin').subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Settings/VerifyAccessRights?token=token123&userAccess=admin`);
      expect(req.request.method).toBe('GET');
      req.flush(okResponse('true'));
    });

    it('verifyOverride should GET override verification', (done) => {
      service.verifyOverride('admin_password').subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Settings/VerifyOverride?requestData=admin_password`);
      expect(req.request.method).toBe('GET');
      req.flush(okResponse('true'));
    });

    it('getMenus should GET menus by token', (done) => {
      service.getMenus('session-token').subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Settings/GetMenus?token=session-token`);
      expect(req.request.method).toBe('GET');
      req.flush(okResponse('{"menus": []}'));
    });

    it('logoutUser should POST logout request', (done) => {
      const userDto: UserDto = { token: 'session-token', code: '', name: '', password: '', confirmpassword: '', databaseName: '' };
      service.logoutUser(userDto).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Settings/LogoutUser`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(userDto);
      req.flush(okResponse(''));
    });

    it('getAvailableDatabases should GET database list', (done) => {
      service.getAvailableDatabases().subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Settings/GetAvailableDatabases`);
      expect(req.request.method).toBe('GET');
      req.flush(okResponse('["DB1","DB2","DB3"]'));
    });

    it('getSessionInfo should GET session info by token', (done) => {
      service.getSessionInfo('token123').subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Settings/GetSessionInfo?token=token123`);
      expect(req.request.method).toBe('GET');
      req.flush(okResponse('{"userId": 1, "databaseName": "TestDB"}'));
    });

    it('switchDatabase should POST database switch request', (done) => {
      const userDto: UserDto = { token: 'token123', databaseName: 'NewDB', code: '', name: '', password: '', confirmpassword: '' };
      service.switchDatabase(userDto).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Settings/SwitchDatabase`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(userDto);
      req.flush(okResponse('new-session-token'));
    });

    it('getUserId should GET user ID from token', (done) => {
      service.getUserId('token123').subscribe(response => {
        expect(response.data).toBe('5');
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Settings/GetUserId?token=token123`);
      expect(req.request.method).toBe('GET');
      req.flush(okResponse('5'));
    });

    it('getTransactionHistoryByProductId should GET transaction history', (done) => {
      const mockHistory: TransactionHistoryDto[] = [{ sysPK_TransH: 1, moduleType: 'SALE', dateIssue: '2024-01-01' }];
      service.getTransactionHistoryByProductId(100).subscribe(history => {
        expect(history.length).toBe(1);
        expect(history[0].sysPK_TransH).toBe(1);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Inventory/GetTransactionHistoryByProductId?productId=100`);
      expect(req.request.method).toBe('GET');
      req.flush(mockHistory);
    });
  });

  describe('BIR Posting methods', () => {
    it('getBirTransactions should POST with filter', (done) => {
      const mockResponse = emptyListResponse<BirTransactionDto>();
      const filter: BirTransactionFilterDto = { year: '2024', period: '1' };
      service.getBirTransactions(filter).subscribe(response => {
        expect(response.lists).toEqual([]);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/BirPosting/GetBirTransactions`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(filter);
      req.flush(mockResponse);
    });

    it('removeBirTransaction should POST remove request', (done) => {
      const request: RemoveTransactionRequest = { id: 1 };
      service.removeBirTransaction(request).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/BirPosting/RemoveBirTransaction`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(okResponse(''));
    });

    it('postBirTransactions should POST transaction IDs array', (done) => {
      service.postBirTransactions([1, 2, 3]).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/BirPosting/PostBirTransactions`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual([1, 2, 3]);
      req.flush(okResponse(''));
    });

    it('getTransactionHeadersByModuleType should GET headers with optional params', (done) => {
      const mockResponse = emptyListResponse<TransactionHeaderForBirDto>();
      service.getTransactionHeadersByModuleType('SALE', 1, '2024', 1).subscribe(response => {
        expect(response.lists).toEqual([]);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/BirPosting/GetTransactionHeadersByModuleType?moduleType=SALE&pageNum=1&year=2024&period=1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('getTransactionHeadersByModuleType should GET without optional params', (done) => {
      const mockResponse = emptyListResponse<TransactionHeaderForBirDto>();
      service.getTransactionHeadersByModuleType('SALE', 1).subscribe(response => {
        expect(response.lists).toEqual([]);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/BirPosting/GetTransactionHeadersByModuleType?moduleType=SALE&pageNum=1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('getBirTransactionTotals should POST totals calculation', (done) => {
      const filter: BirTransactionFilterDto = { year: '2024', period: '1' };
      service.getBirTransactionTotals(filter).subscribe(response => {
        expect(response).toBeTruthy();
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/BirPosting/GetBirTransactionTotals`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(filter);
      req.flush({});
    });

    it('getBirTransactionSummaryReport should POST summary report', (done) => {
      const filter: BirTransactionFilterDto = { year: '2024', period: '1' };
      service.getBirTransactionSummaryReport(filter).subscribe(response => {
        expect(response).toBeTruthy();
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/BirPosting/GetBirTransactionSummaryReport`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(filter);
      req.flush({});
    });

    it('checkExistingTransactionHeaders should GET existing headers check', (done) => {
      service.checkExistingTransactionHeaders('2024', '1', 1).subscribe(response => {
        expect(response.success).toBe(false);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/BirPosting/CheckExistingTransactionHeaders?year=2024&period=1&taxType=1`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: false, data: 'false', rawData: '' });
    });

    it('saveTransactionsToBir should POST save to BIR', (done) => {
      const saveDto: any = { year: '2024', period: '1', taxType: 1, transactionIds: [1, 2] };
      service.saveTransactionsToBir(saveDto).subscribe(response => {
        expect(response).toBeTruthy();
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/BirPosting/SaveTransactionsToBir`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(saveDto);
      req.flush({});
    });

    it('addBirTransaction should POST single transaction', (done) => {
      const addDto: any = { transactionId: 1 };
      service.addBirTransaction(addDto).subscribe(response => {
        expect(response).toBeTruthy();
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/BirPosting/AddBirTransaction`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(addDto);
      req.flush({});
    });
  });

  describe('Transaction methods', () => {
    it('getTransactionsByModuleType should GET when no criteria', (done) => {
      const mockResponse = emptyListResponse<TransactionHeaderDto>();
      service.getTransactionsByModuleType('PURCHASE', 1, 20).subscribe(response => {
        expect(response.lists).toEqual([]);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Transactions/GetByModuleType?moduleType=PURCHASE&pageNum=1&pageSize=20`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('getTransactionsByModuleType should POST when criteria provided', (done) => {
      const mockResponse = emptyListResponse<TransactionHeaderDto>();
      const criteria = { dateFrom: '2024-01-01' };
      service.getTransactionsByModuleType('PURCHASE', 1, 20, criteria).subscribe(response => {
        expect(response.lists).toEqual([]);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Transactions/GetByModuleTypeWithCriteria`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.moduleType).toBe('PURCHASE');
      expect(req.request.body.pageNum).toBe(1);
      expect(req.request.body.pageSize).toBe(20);
      expect(req.request.body.criteria).toEqual(criteria);
      req.flush(mockResponse);
    });

    it('getTransactionById should GET transaction detail', (done) => {
      service.getTransactionById(1).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Transactions/GetDetail?id=1`);
      expect(req.request.method).toBe('GET');
      req.flush(okResponse('{"id": 1, "total": 100}'));
    });

    it('createTransaction should POST new transaction', (done) => {
      const txnDto: any = { moduleType: 'PURCHASE', items: [] };
      service.createTransaction(txnDto).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Transactions/Create`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(txnDto);
      req.flush(okResponse('1'));
    });

    it('updateTransaction should POST updated transaction', (done) => {
      const txnDto: any = { id: 1, moduleType: 'PURCHASE', items: [] };
      service.updateTransaction(txnDto).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Transactions/Update`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(txnDto);
      req.flush(okResponse(''));
    });

    it('voidTransaction should POST void with reason', (done) => {
      service.voidTransaction(1, 'Duplicate entry').subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Transactions/Void?id=1&reason=Duplicate entry`);
      expect(req.request.method).toBe('POST');
      req.flush(okResponse(''));
    });

    it('voidTransaction should POST void without reason', (done) => {
      service.voidTransaction(1).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Transactions/Void?id=1`);
      expect(req.request.method).toBe('POST');
      req.flush(okResponse(''));
    });

    it('printTransaction should GET PDF blob', (done) => {
      const mockBlob = new Blob(['pdf-content'], { type: 'application/pdf' });
      service.printTransaction(1).subscribe(blob => {
        expect(blob).toBeInstanceOf(Blob);
        done();
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Transactions/Print?id=1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBlob, { status: 200, statusText: 'OK' });
    });
  });

  describe('Error handling', () => {
    it('getProducts should handle HTTP errors', (done) => {
      service.getProducts(1).subscribe({
        error: (error: any) => {
          expect(error).toBeTruthy();
          done();
        }
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Products/GetAllItems?pageNum=1`);
      expect(req.request.method).toBe('GET');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('verifyLogin should handle server errors', (done) => {
      const userDto: UserDto = { code: 'admin', password: 'pass', name: '', confirmpassword: '', token: '', databaseName: '' };
      service.verifyLogin(userDto).subscribe({
        error: (error: any) => {
          expect(error).toBeTruthy();
          done();
        }
      });
      const req = httpMock.expectOne(`${environment.apiUrl}/Settings/VerifyLogin`);
      expect(req.request.method).toBe('POST');
      req.flush('Internal Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
