'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CoinService } from '@/lib/coins';
import { CoinTransaction, COIN_CONFIG } from '@/types/coin';
import withAuth from '@/hoc/withAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/Button';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  History, 
  Award, 
  Users, 
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Loader2,
  Gift,
  HandHeart,
  Trophy
} from 'lucide-react';

const CoinsPage = () => {
  const { userProfile, coinBalance, refreshCoinBalance, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshCoinBalance(),
      loadTransactions()
    ]);
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) return `${diffDays}d ago`;
    
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours > 0) return `${diffHours}h ago`;

    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    
    return 'Just now';
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-lg text-muted-foreground">Loading Coin System...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4 md:p-8">
        
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-card border rounded-lg mb-4">
            <Coins className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Continental Coins
          </h1>
          <p className="mt-4 text-lg max-w-2xl mx-auto text-muted-foreground">
            <strong className="text-primary">Every collaboration is a contract, paid in coin.</strong> 
            This is the currency of reciprocity. Sacred, valuable, and non-negotiable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{coinBalance?.balance ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Coins available for contracts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Earned</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{coinBalance?.totalEarned ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">From completed contracts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">{coinBalance?.totalSpent ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">For services rendered</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              The Rules of Engagement
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Honor demands payment. The rules are absolute.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-background rounded-lg border">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Get Started</h3>
                <p className="text-sm text-muted-foreground">
                  Receive <span className="font-bold text-primary">{COIN_CONFIG.REGISTRATION_BONUS} coins</span> upon entry. A courtesy of the house.
                </p>
              </div>

              <div className="text-center p-4 bg-background rounded-lg border">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <HandHeart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">The Service</h3>
                <p className="text-sm text-muted-foreground">
                  Earn <span className="font-bold text-primary">{COIN_CONFIG.COLLABORATION_REWARD} Continental Coin</span> for every contract fulfilled.
                </p>
              </div>

              <div className="text-center p-4 bg-background rounded-lg border">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">The Contract</h3>
                <p className="text-sm text-muted-foreground">
                  Spend <span className="font-bold text-primary">{COIN_CONFIG.COLLABORATION_REWARD} coin</span> to engage another&apos;s services.
                </p>
              </div>
            </div>

            <div className="bg-background rounded-lg p-6 border">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                The Process
              </h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p><strong>1.</strong> Post a project on the <strong>Opportunities</strong> page, open for collaboration.</p>
                <p><strong>2.</strong> Review applications. Choose your collaborator.</p>
                <p><strong>3.</strong> Upon acceptance, <strong className="text-primary">1 Continental Coin</strong> is transferred. The contract is sealed.</p>
                <p><strong>4.</strong> The transaction is complete. Honor is satisfied.</p>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground italic">
                  &quot;No matter the task, the price is the price. One coin. This is the way.&quot; - The Manager
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Transaction Ledger
            </CardTitle>
            <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="ml-2">Refresh</span>
            </Button>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-10">
                <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">The Ledger is Clear</h3>
                <p className="text-muted-foreground text-sm">No contracts have been written yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                        {tx.amount > 0 
                          ? <ArrowUpRight className="w-4 h-4 text-green-500" /> 
                          : <ArrowDownLeft className="w-4 h-4 text-red-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{tx.type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-muted-foreground">{tx.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </div>
                      <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default withAuth(CoinsPage);
