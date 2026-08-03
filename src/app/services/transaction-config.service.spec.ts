import { TestBed } from '@angular/core/testing';
import { TransactionConfigService, MODULE_TYPE_NAMES, MODULE_CATEGORIES } from './transaction-config.service';
import { TransactionListConfig } from '../models/dto/transactionListConfigDto';

describe('TransactionConfigService', () => {
  let service: TransactionConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getConfig', () => {
    it('should return config for CUST module type', () => {
      const config = service.getConfig('CUST');
      expect(config).toBeTruthy();
      expect(config!.moduleType).toBe('CUST');
      expect(config!.title).toBe('Customer');
      expect(config!.columns.length).toBeGreaterThan(0);
    });

    it('should return config for SUPL module type', () => {
      const config = service.getConfig('SUPL');
      expect(config).toBeTruthy();
      expect(config!.moduleType).toBe('SUPL');
      expect(config!.title).toBe('Supplier');
    });

    it('should return config for SUPLNT module type', () => {
      const config = service.getConfig('SUPLNT');
      expect(config).toBeTruthy();
      expect(config!.moduleType).toBe('SUPLNT');
      expect(config!.title).toBe('Payee');
    });

    it('should return config for OTHERADJ module type', () => {
      const config = service.getConfig('OTHERADJ');
      expect(config).toBeTruthy();
      expect(config!.moduleType).toBe('OTHERADJ');
      expect(config!.title).toBe('Other Adjustment');
    });

    it('should return config for APPCONFIG module type', () => {
      const config = service.getConfig('APPCONFIG');
      expect(config).toBeTruthy();
      expect(config!.moduleType).toBe('APPCONFIG');
    });

    it('should return config for CSHINVC module type', () => {
      const config = service.getConfig('CSHINVC');
      expect(config).toBeTruthy();
      expect(config!.moduleType).toBe('CSHINVC');
    });

    it('should return config for CHGINVC module type', () => {
      const config = service.getConfig('CHGINVC');
      expect(config).toBeTruthy();
      expect(config!.moduleType).toBe('CHGINVC');
    });

    it('should return null for unknown module type', () => {
      const config = service.getConfig('UNKNOWN');
      expect(config).toBeNull();
    });

    it('should return null for empty string module type', () => {
      const config = service.getConfig('');
      expect(config).toBeNull();
    });
  });

  describe('getConfigsByCategory', () => {
    it('should return Setup configs for category Setup', () => {
      const configs = service.getConfigsByCategory('Setup');
      expect(configs.length).toBeGreaterThan(0);
      expect(configs.every(c => c.moduleType === 'CUST' || c.moduleType === 'SUPL' || c.moduleType === 'SUPLNT')).toBe(true);
    });

    it('should return Inventory configs for category Inventory', () => {
      const configs = service.getConfigsByCategory('Inventory');
      expect(configs.length).toBeGreaterThan(0);
    });

    it('should return Sales configs for category Sales', () => {
      const configs = service.getConfigsByCategory('Sales');
      expect(configs.length).toBeGreaterThan(0);
    });

    it('should return configs for Inventory category', () => {
      const configs = service.getConfigsByCategory('Inventory');
      expect(configs.length).toBeGreaterThan(0);
    });

    it('should return configs for Setup category', () => {
      const configs = service.getConfigsByCategory('Setup');
      expect(configs.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown category', () => {
      const configs = service.getConfigsByCategory('UnknownCategory');
      expect(configs).toEqual([]);
    });
  });

  describe('getModuleName', () => {
    it('should return display name for known module type', () => {
      expect(service.getModuleName('CUST')).toBe('Customer');
      expect(service.getModuleName('SUPL')).toBe('Supplier');
      expect(service.getModuleName('SUPLNT')).toBe('Payee');
      expect(service.getModuleName('OTHERADJ')).toBe('Other Adjustment');
      expect(service.getModuleName('CSHINVC')).toBe('Cash Invoice');
    });

    it('should return the module type itself for unknown module type', () => {
      expect(service.getModuleName('UNKNOWN')).toBe('UNKNOWN');
    });

    it('should return the empty string for empty module type', () => {
      expect(service.getModuleName('')).toBe('');
    });
  });

  describe('getModuleCategory', () => {
    it('should return category for known module type', () => {
      expect(service.getModuleCategory('CUST')).toBe('Setup');
      expect(service.getModuleCategory('SUPL')).toBe('Setup');
      expect(service.getModuleCategory('SUPLNT')).toBe('Setup');
      expect(service.getModuleCategory('OTHERADJ')).toBe('Inventory');
      expect(service.getModuleCategory('CSHINVC')).toBe('Sales');
    });

    it('should return Other for unknown module type', () => {
      expect(service.getModuleCategory('UNKNOWN')).toBe('Other');
    });

    it('should return Other for empty module type', () => {
      expect(service.getModuleCategory('')).toBe('Other');
    });
  });

  describe('MODULE_TYPE_NAMES constant', () => {
    it('should contain all expected mappings', () => {
      expect(MODULE_TYPE_NAMES['CUST']).toBe('Customer');
      expect(MODULE_TYPE_NAMES['SUPL']).toBe('Supplier');
      expect(MODULE_TYPE_NAMES['SUPLNT']).toBe('Payee');
      expect(MODULE_TYPE_NAMES['OTHERADJ']).toBe('Other Adjustment');
    });
  });

  describe('MODULE_CATEGORIES constant', () => {
    it('should contain all expected categories', () => {
      expect(MODULE_CATEGORIES['CUST']).toBe('Setup');
      expect(MODULE_CATEGORIES['OTHERADJ']).toBe('Inventory');
      expect(MODULE_CATEGORIES['CSHINVC']).toBe('Sales');
    });
  });

  describe('config column definitions', () => {
    it('should have proper column definitions for CUST config', () => {
      const config = service.getConfig('CUST');
      expect(config!.columns.length).toBe(3);
      expect(config!.columns[0].field).toBe('userPK');
      expect(config!.columns[0].header).toBe('Code');
      expect(config!.columns[1].field).toBe('name');
      expect(config!.columns[1].header).toBe('Name');
    });

    it('should have proper column definitions for OTHERADJ config', () => {
      const config = service.getConfig('OTHERADJ');
      expect(config!.columns.length).toBe(5);
      expect(config!.columns[0].field).toBe('dateIssue');
      expect(config!.columns[0].type).toBe('date');
      expect(config!.columns[4].field).toBe('totalAmount');
      expect(config!.columns[4].type).toBe('currency');
    });

    it('should have actions and routes for APPCONFIG config', () => {
      const config = service.getConfig('APPCONFIG');
      expect(config!.newRoute).toBe('/settings/appconfig/new');
      expect(config!.detailRoutePrefix).toBe('/settings/appconfig/');
      expect(config!.enableBulkActions).toBe(true);
    });
  });
});
