'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CoinService } from '@/lib/coins';
import { CoinTransaction, COIN_CONFIG, COIN_TRANSACTION_LABELS, COIN_TRANSACTION_COLORS } from '@/types/coin';
import withAuth from '@/hoc/withAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Calendar,
  RefreshCw,
  Loader2,
  Gift,
  HandHeart,
  Trophy
} from 'lucide-react';

const CoinsPage = () => {
  const { userProfile, coinBalance, refreshCoinBalance } = useAuth();
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [userProfile]);

  const loadTransactions = async () => {
    if (!userProfile) return;
    
    try {
      setLoading(true);
      const userTransactions = await CoinService.getUserTransactions(userProfile.id);
      setTransactions(userTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

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
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-lg text-muted-foreground">Loading coin system...</span>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl border-2 border-amber-200">
              <Coins className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-4xl font-extrabold text-foreground">
              Continental Coins
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            <strong className="text-amber-600">Every collaboration = 1 coin.</strong> Like John Wick's Continental Hotel - 
            sacred, valuable, and non-negotiable. No matter the complexity, every favor earns exactly one coin.
          </p>
          <p className="text-sm text-muted-foreground mt-2 italic">
            "The Continental. Neutral ground. And every service... has its price." - 1 Coin
          </p>
        </div>

        {/* Coin Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Balance */}
          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">Current Balance</CardTitle>
              <Coins className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-800">
                {coinBalance?.balance ?? 0}
              </div>
              <p className="text-xs text-amber-600 mt-1">NS Coins available</p>
            </CardContent>
          </Card>

          {/* Total Earned */}
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">Total Earned</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-800">
                {coinBalance?.totalEarned ?? 0}
              </div>
              <p className="text-xs text-emerald-600 mt-1">From collaborations</p>
            </CardContent>
          </Card>

          {/* Total Spent */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Spent</CardTitle>
              <TrendingDown className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-800">
                {coinBalance?.totalSpent ?? 0}
              </div>
              <p className="text-xs text-blue-600 mt-1">For getting help</p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="mb-8 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              How Continental Coins Work
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              The sacred rules of the Continental. Honor demands payment.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Registration Bonus */}
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Get Started</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Receive <span className="font-bold">{COIN_CONFIG.REGISTRATION_BONUS} coins</span> when you join the platform
                </p>
              </div>

              {/* Earn Coins */}
              <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <HandHeart className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">The Sacred Service</h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Earn <span className="font-bold text-amber-600">{COIN_CONFIG.COLLABORATION_REWARD} Continental Coin</span> for every collaboration - no matter the complexity
                </p>
              </div>

              {/* Spend Coins */}
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Get Help</h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Spend <span className="font-bold">{COIN_CONFIG.COLLABORATION_REWARD} coin</span> to get collaboration help
                </p>
              </div>
            </div>

            {/* Step by Step */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-lg p-6 border border-amber-200">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-600" />
                The Continental Process - Sacred Rules
              </h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-amber-600">1</span>
                  </div>
                  <p>Post your project on the <strong>Opportunities</strong> page and mark it as "Open for Collaboration"</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-amber-600">2</span>
                  </div>
                  <p>Other developers can apply to help you with a 140-character message</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-amber-600">3</span>
                  </div>
                  <p>When you accept someone's help, <strong className="text-amber-600">exactly 1 Continental Coin</strong> is automatically transferred from you to them</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-amber-600">4</span>
                  </div>
                  <p>The sacred transaction is complete. Honor demands payment. The Continental's rules are absolute.</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/20 rounded border border-amber-300 dark:border-amber-700">
                <p className="text-xs text-amber-800 dark:text-amber-200 italic font-medium">
                  "No matter the favor, no matter the complexity - every service rendered at the Continental is worth exactly one coin. 
                  This is the way." - The Manager
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Transaction History
            </CardTitle>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <History className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                <p className="text-muted-foreground text-sm">
                  Start helping other developers or request help to see your coin transactions here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      {/* Transaction Icon */}
                      <div className={`p-2 rounded-full ${
                        transaction.amount > 0 
                          ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                          : 'bg-orange-100 dark:bg-orange-900/30'
                      }`}>
                        {transaction.amount > 0 ? (
                          <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        )}
                      </div>

                      {/* Transaction Details */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className={`text-xs ${COIN_TRANSACTION_COLORS[transaction.type]}`}
                          >
                            {COIN_TRANSACTION_LABELS[transaction.type]}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground font-medium">
                          {transaction.description}
                        </p>
                        {transaction.metadata?.projectTitle && (
                          <p className="text-xs text-muted-foreground">
                            Project: {transaction.metadata.projectTitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Amount and Date */}
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        transaction.amount > 0 ? 'text-emerald-600' : 'text-orange-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(transaction.createdAt)}
                      </div>
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