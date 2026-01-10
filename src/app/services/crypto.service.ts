import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  constructor() { }

  private keyHex = '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff';
  private ivHex  = '0102030405060708090a0b0c0d0e0f10';

  encryptToBase64(payload: unknown): string {
    const key = CryptoJS.enc.Hex.parse(this.keyHex);
    const iv  = CryptoJS.enc.Hex.parse(this.ivHex);
    const plaintext = typeof payload === 'string' ? payload : JSON.stringify(payload);

    const cipher = CryptoJS.AES.encrypt(plaintext, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // Send as Base64 string
    return cipher.toString();
  }

  // Optional: for local testing
  decryptFromBase64(cipherB64: string): string {
    const key = CryptoJS.enc.Hex.parse(this.keyHex);
    const iv  = CryptoJS.enc.Hex.parse(this.ivHex);

    const decrypted = CryptoJS.AES.decrypt(cipherB64, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
  
}
