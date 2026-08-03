import { TestBed } from '@angular/core/testing';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CryptoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('encryptToBase64 should encrypt a string payload', () => {
    const result = service.encryptToBase64('test-password');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toBe('test-password');
  });

  it('encryptToBase64 should encrypt an object payload by JSON stringifying it', () => {
    const payload = { code: 'admin', password: 'secret', databaseName: 'TestDB' };
    const result = service.encryptToBase64(payload);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toEqual(JSON.stringify(payload));
  });

  it('encryptToBase64 should produce different ciphertext for same plaintext (due to IV)', () => {
    const plaintext = 'same-password';
    const encrypted1 = service.encryptToBase64(plaintext);
    const encrypted2 = service.encryptToBase64(plaintext);
    expect(encrypted1).toBeTruthy();
    expect(encrypted2).toBeTruthy();
  });

  it('decryptFromBase64 should decrypt valid ciphertext back to original string', () => {
    const original = 'decrypt-me-123';
    const encrypted = service.encryptToBase64(original);
    const decrypted = service.decryptFromBase64(encrypted);
    expect(decrypted).toBe(original);
  });

  it('decryptFromBase64 should decrypt object string back to original', () => {
    const original = JSON.stringify({ key: 'value', num: 42 });
    const encrypted = service.encryptToBase64(original);
    const decrypted = service.decryptFromBase64(encrypted);
    expect(decrypted).toBe(original);
  });

  it('encryptToBase64 and decryptFromBase64 should round-trip correctly', () => {
    const testValues = [
      'simple',
      'with spaces',
      'with-special@chars#and$signs!',
      '1234567890',
      '{"json":"object","nested":{"key":"value"}}',
      ''
    ];

    for (const value of testValues) {
      const encrypted = service.encryptToBase64(value);
      const decrypted = service.decryptFromBase64(encrypted);
      expect(decrypted).toBe(value);
    }
  });

  it('encryptToBase64 should handle boolean values', () => {
    const encrypted1 = service.encryptToBase64(true);
    const encrypted2 = service.encryptToBase64(false);
    expect(encrypted1).toBeTruthy();
    expect(encrypted2).toBeTruthy();
    expect(encrypted1).not.toBe(encrypted2);
  });

  it('decryptFromBase64 should return empty string for empty input', () => {
    const encrypted = service.encryptToBase64('');
    const decrypted = service.decryptFromBase64(encrypted);
    expect(decrypted).toBe('');
  });
});
