export interface ApplicationConfigurationDto {
  sysPk?: number;
  key: string;
  value: string;  // JSON string
  description?: string;
  category?: string;
}

export interface ApplicationConfigurationSaveDto {
  sysPk?: number;
  key: string;
  value: string;
  description?: string;
  category?: string;
}

export interface AppConfigDefinition {
  key: string;
  label: string;
  description?: string;
  category?: 'Feature' | 'Setting' | 'UI' | 'System';
  schema?: AppConfigSchema;
}

export interface AppConfigSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  properties?: Record<string, AppConfigProperty>;
  items?: AppConfigSchema;
}

export interface AppConfigProperty {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  label: string;
  description?: string;
  enum?: any[];
  min?: number;
  max?: number;
  required?: boolean;
}
