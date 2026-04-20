export interface UniversalMasterDto {
  sysPk?: number;
  userPK: string;
  name: string;
  tINVATNumber?: string;
  module: string;  // 'CUST', 'SUPL', or 'SUPLNT'
}

export interface UniversalMasterSaveDto {
  sysPk?: number;
  userPK: string;
  name: string;
  tINVATNumber?: string;
  module: string;
}
