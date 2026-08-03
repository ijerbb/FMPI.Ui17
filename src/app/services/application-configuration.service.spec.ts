import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApplicationConfigurationService } from './application-configuration.service';
import { environment } from '../../environments/environment';
import { ApplicationConfigurationDto, ApplicationConfigurationSaveDto } from '../models/dto/applicationConfigurationDto';
import { ResponseDto } from '../models/dto/responseDto';

const okResponse = (data: string, success = true): ResponseDto => ({ success, data, rawData: '' });

describe('ApplicationConfigurationService', () => {
  let service: ApplicationConfigurationService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl + '/ApplicationConfiguration';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ApplicationConfigurationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllConfigurations', () => {
    it('should GET all configurations from the API', (done) => {
      const mockConfigs: ApplicationConfigurationDto[] = [
        { sysPk: 1, key: 'key1', value: '{"setting": true}', description: 'Config 1' },
        { sysPk: 2, key: 'key2', value: '{"setting": false}', description: 'Config 2' }
      ];

      service.getAllConfigurations().subscribe(configs => {
        expect(configs.length).toBe(2);
        expect(configs[0].key).toBe('key1');
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/GetAll`);
      expect(req.request.method).toBe('GET');
      req.flush(mockConfigs);
    });
  });

  describe('getConfigByKey', () => {
    it('should GET configuration by key', (done) => {
      const mockConfig: ApplicationConfigurationDto = {
        sysPk: 1, key: 'apiUrl', value: '"https://api.example.com"', description: 'API URL'
      };

      service.getConfigByKey('apiUrl').subscribe(config => {
        expect(config.key).toBe('apiUrl');
        expect(config.value).toBe('"https://api.example.com"');
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/GetByKey?key=apiUrl`);
      expect(req.request.method).toBe('GET');
      req.flush(mockConfig);
    });
  });

  describe('getConfigById', () => {
    it('should GET configuration by ID', (done) => {
      const mockConfig: ApplicationConfigurationDto = {
        sysPk: 5, key: 'setting5', value: '{"enabled": true}', description: 'Config 5'
      };

      service.getConfigById(5).subscribe(config => {
        expect(config.sysPk).toBe(5);
        expect(config.key).toBe('setting5');
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/GetById?id=5`);
      expect(req.request.method).toBe('GET');
      req.flush(mockConfig);
    });
  });

  describe('saveConfig', () => {
    it('should POST to save a new configuration', (done) => {
      const configDto: ApplicationConfigurationSaveDto = {
        key: 'newSetting', value: '{"enabled": true}', description: 'New setting'
      };

      service.saveConfig(configDto).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/Save`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(configDto);
      req.flush(okResponse('10'));
    });

    it('should POST to update an existing configuration', (done) => {
      const configDto: ApplicationConfigurationSaveDto = {
        sysPk: 1, key: 'apiUrl', value: '"https://new-api.com"', description: 'Updated URL'
      };

      service.saveConfig(configDto).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/Save`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(configDto);
      req.flush(okResponse('1'));
    });
  });

  describe('deleteConfig', () => {
    it('should DELETE a single configuration by ID', (done) => {
      service.deleteConfig(1).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/Delete/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(okResponse(''));
    });
  });

  describe('deleteMultipleConfigurations', () => {
    it('should POST to delete multiple configurations', (done) => {
      const ids = [1, 2, 3];

      service.deleteMultipleConfigurations(ids).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/DeleteMultiple`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(ids);
      req.flush(okResponse(''));
    });
  });

  describe('validateJson', () => {
    it('should return true for valid JSON', (done) => {
      const validJson = '{"key": "value", "number": 42}';

      service.validateJson(validJson).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(match => match.url.includes('/ValidateJson'));
      expect(req.request.method).toBe('GET');
      req.flush(okResponse('true'));
    });

    it('should return false for invalid JSON', (done) => {
      const invalidJson = '{key: value}';

      service.validateJson(invalidJson).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(match => match.url.includes('/ValidateJson'));
      expect(req.request.method).toBe('GET');
      req.flush(okResponse('false', false));
    });

    it('should return false on HTTP error', (done) => {
      service.validateJson('some json').subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(match => match.url.includes('/ValidateJson'));
      expect(req.request.method).toBe('GET');
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('configurationChanged$ observable', () => {
    it('should emit when configuration is saved successfully', (done) => {
      let emitted = false;
      service.configurationChanged$.subscribe(() => { emitted = true; });

      const configDto: ApplicationConfigurationSaveDto = {
        key: 'newConfig', value: '{"test": true}'
      };

      service.saveConfig(configDto).subscribe(() => {
        expect(emitted).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/Save`);
      req.flush(okResponse('10'));
    });
  });

  describe('error handling', () => {
    it('should propagate HTTP errors', (done) => {
      service.getAllConfigurations().subscribe({
        error: (error: any) => {
          expect(error).toBeTruthy();
          expect(error.status).toBe(500);
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/GetAll`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
