import { SpendCategory, EfacturaSyncRun, EfacturaConnection } from '../types';

export interface EfacturaRawMessage {
  id: string; // ANAF message ID
  data_creare: string;
  cui_emitent: string; // Seller CUI
  cui_destinatar: string; // Buyer CUI
  tip: 'FACTURA PRIMITA' | 'FACTURA TRIMISA';
  id_descarcare: string;
  xmlContent?: string;
}

export interface EfacturaSyncOptions {
  organizationId: string;
  organizationCui: string;
  daysToSync?: number;
  includeSent?: boolean;
}

export interface EfacturaSyncResult {
  success: boolean;
  syncRun: EfacturaSyncRun;
  importedInvoices: Array<{
    documentId: string;
    invoiceNumber: string;
    supplierName: string;
    supplierCui: string;
    amount: number;
    currency: string;
    category: SpendCategory;
  }>;
  duplicatesSkipped: number;
  mismatchedCuiCount: number;
  errors: string[];
}

export interface AnafOAuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  scope: string;
  createdAt: number;
}
