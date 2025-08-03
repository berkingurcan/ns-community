'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CoinService } from '@/lib/coins';
import { CoinTransaction } from '@/types/coin';
import { Loader2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function CoinsPage() {
  const { userProfile, coinBalance, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = useCallback(async () => {
    if (userProfile?.id) {
      setLoading(true);
      try {
        const userTransactions = await CoinService.getUserTransactions(userProfile.id);
        setTransactions(userTransactions);
      } catch (error) {
        console.error("Failed to load transactions:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [userProfile?.id]);

  useEffect(() => {
    if (!authLoading && userProfile) {
      loadTransactions();
    }
  }, [authLoading, userProfile, loadTransactions]);


  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2">My Coins</h1>
      <p className="text-muted-foreground mb-6">
        Here&apos;s your transaction history in the NSphere ecosystem.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-sm font-medium text-muted-foreground">Current Balance</h2>
          <p className="text-3xl font-bold">{coinBalance?.balance ?? 0}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-sm font-medium text-muted-foreground">Total Earned</h2>
          <p className="text-3xl font-bold text-green-500">{coinBalance?.totalEarned ?? 0}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-sm font-medium text-muted-foreground">Total Spent</h2>
          <p className="text-3xl font-bold text-red-500">{coinBalance?.totalSpent ?? 0}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
      <div className="bg-card rounded-lg border">
        {transactions.length > 0 ? (
          <ul>
            {transactions.map((tx) => (
              <li key={tx.id} className="flex justify-between items-center p-4 border-b last:border-b-0">
                <div>
                  <p className="font-semibold">{tx.type.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className={`flex items-center font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {tx.amount > 0 ? <ArrowUpRight className="mr-2 h-4 w-4" /> : <ArrowDownLeft className="mr-2 h-4 w-4" />}
                  {tx.amount}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-4 text-muted-foreground">No transactions yet.</p>
        )}
      </div>
    </div>
  );
}
