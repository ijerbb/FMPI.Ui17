import { ResponseDto } from '../../src/app/models/dto/responseDto';
import { DatabaseConfig } from '../../src/app/models/dto/databaseConfig';
import https from 'https';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export async function getAvailableDatabases(apiUrl: string): Promise<DatabaseConfig[] | null> {
  try {
    const response = await fetch(`${apiUrl}/api/Settings/GetAvailableDatabases`, { agent: (parsedUrl: any) => parsedUrl.protocol === 'https:' ? httpsAgent : undefined });
    if (!response.ok) return null;
    const result: ResponseDto = await response.json();
    if (result.success && result.data) {
      return JSON.parse(result.data as string);
    }
    return null;
  } catch (err) {
    console.error('Failed to get available databases:', err);
    return null;
  }
}

export async function clearTestSessions(baseURL: string): Promise<void> {
  // No cleanup needed for auth E2E tests
  // Inventory/stock take sessions would be cleaned up here for Phase D
}

export async function seedProduct(baseURL: string, token: string, productData: any): Promise<boolean> {
  try {
    const response = await fetch(`${baseURL}/api/Products/PatchProduct`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Token': token,
      },
      body: JSON.stringify(productData),
    });
    return response.ok;
  } catch (err) {
    console.error('Failed to seed product:', err);
    return false;
  }
}

export async function seedCustomer(baseURL: string, token: string, customerData: any): Promise<boolean> {
  try {
    const response = await fetch(`${baseURL}/api/Customer/Save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Token': token,
      },
      body: JSON.stringify(customerData),
    });
    return response.ok;
  } catch (err) {
    console.error('Failed to seed customer:', err);
    return false;
  }
}

export async function getSessionInfo(baseURL: string, token: string): Promise<any | null> {
  try {
    const response = await fetch(`${baseURL}/api/Settings/GetSessionInfo?token=${encodeURIComponent(token)}`);
    if (!response.ok) return null;
    const result: ResponseDto = await response.json();
    if (result.success && result.data) {
      return JSON.parse(result.data as string);
    }
    return null;
  } catch (err) {
    console.error('Failed to get session info:', err);
    return null;
  }
}
