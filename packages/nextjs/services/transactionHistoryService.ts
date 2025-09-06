import { formatUnits, parseUnits } from 'viem';
import { p2pService, P2PTransfer } from './p2pService';

export interface TransactionHistoryItem {
  id: string;
  type: 'payment' | 'p2p_send' | 'p2p_receive' | 'faucet' | 'vendor_payment';
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  amountWei: string;
  currency: 'GHS' | 'USDC';
  fromAddress: string;
  toAddress: string;
  timestamp: number;
  blockNumber?: number;
  transactionHash?: string;
  message?: string;
  vendorName?: string;
  vendorEns?: string;
  gasUsed?: string;
  gasPrice?: string;
  // Additional metadata
  metadata?: {
    vendorId?: string;
    menuItemId?: string;
    qrCodeId?: string;
    nfcData?: string;
  };
}

export interface TransactionFilters {
  type?: string;
  status?: string;
  dateFrom?: number;
  dateTo?: number;
  minAmount?: number;
  maxAmount?: number;
}

class TransactionHistoryService {
  private readonly STORAGE_KEY = 'tapngo_transaction_history';

  // Get all transactions (blockchain + P2P)
  async getAllTransactions(userAddress: string): Promise<TransactionHistoryItem[]> {
    try {
      // Get P2P transactions
      const p2pTransactions = await this.getP2PTransactions(userAddress);
      
      // Get blockchain transactions (from local storage for now)
      const blockchainTransactions = await this.getBlockchainTransactions(userAddress);
      
      // Combine and sort by timestamp
      const allTransactions = [...p2pTransactions, ...blockchainTransactions];
      return allTransactions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  // Get P2P transactions
  async getP2PTransactions(userAddress: string): Promise<TransactionHistoryItem[]> {
    try {
      const p2pTransfers = await p2pService.getTransferHistory();
      
      return p2pTransfers
        .filter(transfer => 
          transfer.fromAddress.toLowerCase() === userAddress.toLowerCase() ||
          transfer.toAddress.toLowerCase() === userAddress.toLowerCase()
        )
        .map(transfer => ({
          id: transfer.id,
          type: transfer.fromAddress.toLowerCase() === userAddress.toLowerCase() 
            ? 'p2p_send' as const 
            : 'p2p_receive' as const,
          status: transfer.status as 'pending' | 'completed' | 'failed',
          amount: transfer.amount,
          amountWei: transfer.amountWei,
          currency: 'GHS' as const,
          fromAddress: transfer.fromAddress,
          toAddress: transfer.toAddress,
          timestamp: transfer.timestamp,
          message: transfer.message,
        }));
    } catch (error) {
      console.error('Error fetching P2P transactions:', error);
      return [];
    }
  }

  // Get blockchain transactions from local storage
  async getBlockchainTransactions(userAddress: string): Promise<TransactionHistoryItem[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const transactions: TransactionHistoryItem[] = JSON.parse(stored);
      return transactions.filter(tx => 
        tx.fromAddress.toLowerCase() === userAddress.toLowerCase() ||
        tx.toAddress.toLowerCase() === userAddress.toLowerCase()
      );
    } catch (error) {
      console.error('Error fetching blockchain transactions:', error);
      return [];
    }
  }

  // Save a blockchain transaction
  async saveBlockchainTransaction(transaction: TransactionHistoryItem): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const transactions: TransactionHistoryItem[] = stored ? JSON.parse(stored) : [];
      
      // Check if transaction already exists
      const exists = transactions.some(tx => tx.id === transaction.id);
      if (!exists) {
        transactions.push(transaction);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(transactions));
      }
    } catch (error) {
      console.error('Error saving blockchain transaction:', error);
    }
  }

  // Filter transactions
  filterTransactions(
    transactions: TransactionHistoryItem[], 
    filters: TransactionFilters
  ): TransactionHistoryItem[] {
    return transactions.filter(tx => {
      if (filters.type && tx.type !== filters.type) return false;
      if (filters.status && tx.status !== filters.status) return false;
      if (filters.dateFrom && tx.timestamp < filters.dateFrom) return false;
      if (filters.dateTo && tx.timestamp > filters.dateTo) return false;
      if (filters.minAmount && tx.amount < filters.minAmount) return false;
      if (filters.maxAmount && tx.amount > filters.maxAmount) return false;
      return true;
    });
  }

  // Get transaction statistics
  getTransactionStats(transactions: TransactionHistoryItem[]) {
    const stats = {
      totalTransactions: transactions.length,
      totalSent: 0,
      totalReceived: 0,
      totalSpent: 0,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      byMonth: {} as Record<string, number>,
    };

    transactions.forEach(tx => {
      // Amount calculations
      if (tx.type === 'p2p_send' || tx.type === 'payment') {
        stats.totalSent += tx.amount;
        stats.totalSpent += tx.amount;
      } else if (tx.type === 'p2p_receive' || tx.type === 'faucet') {
        stats.totalReceived += tx.amount;
      }

      // Count by type
      stats.byType[tx.type] = (stats.byType[tx.type] || 0) + 1;
      
      // Count by status
      stats.byStatus[tx.status] = (stats.byStatus[tx.status] || 0) + 1;
      
      // Count by month
      const month = new Date(tx.timestamp).toISOString().slice(0, 7);
      stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
    });

    return stats;
  }

  // Get recent transactions (last 10)
  getRecentTransactions(transactions: TransactionHistoryItem[], limit: number = 10): TransactionHistoryItem[] {
    return transactions.slice(0, limit);
  }

  // Search transactions
  searchTransactions(transactions: TransactionHistoryItem[], query: string): TransactionHistoryItem[] {
    const lowercaseQuery = query.toLowerCase();
    return transactions.filter(tx => 
      tx.transactionHash?.toLowerCase().includes(lowercaseQuery) ||
      tx.fromAddress.toLowerCase().includes(lowercaseQuery) ||
      tx.toAddress.toLowerCase().includes(lowercaseQuery) ||
      tx.vendorName?.toLowerCase().includes(lowercaseQuery) ||
      tx.vendorEns?.toLowerCase().includes(lowercaseQuery) ||
      tx.message?.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Export transactions to CSV
  exportToCSV(transactions: TransactionHistoryItem[]): string {
    const headers = [
      'Date',
      'Type',
      'Status',
      'Amount (GHS)',
      'From Address',
      'To Address',
      'Transaction Hash',
      'Message',
      'Vendor Name'
    ];

    const rows = transactions.map(tx => [
      new Date(tx.timestamp).toISOString(),
      tx.type,
      tx.status,
      tx.amount.toString(),
      tx.fromAddress,
      tx.toAddress,
      tx.transactionHash || '',
      tx.message || '',
      tx.vendorName || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // Clear all transaction history
  clearHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const transactionHistoryService = new TransactionHistoryService();
