'use client';

import Image from 'next/image';

import { useState, useEffect, useCallback } from 'react';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle,
  DrawerDescription
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CoinService } from '@/lib/coins';
import { CollaborationService } from '@/lib/collaborationService';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  User, 
  MessageSquare, 
  Check, 
  X, 
  Clock,
  Mail,
  Coins
} from 'lucide-react';

interface CollaborationRequest {
  id: string;
  projectId: string;
  projectTitle: string;
  projectImage?: string;
  applicantId: string;
  applicantName: string;
  applicantUsername: string;
  applicantImage?: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

interface CollaborationRequestsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}

export function CollaborationRequestsDrawer({
  isOpen,
  onClose,
  currentUserId
}: CollaborationRequestsDrawerProps) {
  const { refreshCoinBalance } = useAuth();
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [requests, setRequests] = useState<CollaborationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const loadCollaborationRequests = useCallback(async () => {
    try {
      setLoading(true);
      if (!currentUserId) { setRequests([]); return; }
      const apiRequests = await CollaborationService.getCollaborationRequests(currentUserId, undefined, 50);
      const uiRequests: CollaborationRequest[] = apiRequests.map((r) => ({
        id: r.id,
        projectId: r.project?.id || r.project_id,
        projectTitle: r.project?.title || 'Project',
        projectImage: undefined,
        applicantId: r.requester?.id || r.requester_id,
        applicantName: r.requester?.username || 'Member',
        applicantUsername: r.requester?.discord_username || r.requester?.username || 'member',
        applicantImage: r.requester?.avatar_url,
        message: r.intro_message,
        status: (r.status === 'accepted' ? 'accepted' : r.status === 'denied' ? 'rejected' : 'pending'),
        createdAt: r.created_at
      }));
      setRequests(uiRequests);
    } catch (error: unknown) {
      console.error('Error loading collaboration requests:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (isOpen) {
      loadCollaborationRequests();
      // Load current user's coin balance for button disable state
      if (currentUserId) {
        CoinService.getUserBalance(currentUserId)
          .then((b) => setUserBalance(b.balance))
          .catch(() => setUserBalance(null));
      }
    }
  }, [isOpen, currentUserId, loadCollaborationRequests]);

  const handleAccept = async (requestId: string) => {
    try {
      // Find the request to get details
      const request = requests.find(req => req.id === requestId);
      if (!request || !currentUserId) {
        console.error('Request or current user not found');
        return;
      }

      // Ensure payer (project owner) has at least 1 coin before attempting transfer
      try {
        const balance = await CoinService.getUserBalance(currentUserId);
        if (!balance || balance.balance < 1) {
          toast.error('Insufficient Continental Coins. You need at least 1 coin to accept a collaboration.');
          return;
        }
      } catch (e) {
        console.warn('Could not fetch coin balance before transfer:', e);
        // Proceeding might produce an RPC error; prefer to stop with a friendly message
        toast.error('Unable to verify your coin balance. Please try again shortly.');
        return;
      }

      console.log('Accepting request:', requestId);
      
      // Handle coin transfer: applicant gets 1 coin, project owner pays 1 coin
      const coinTransferResult = await CoinService.handleCollaborationAccept(
        request.applicantId,        // Helper gets the coin
        currentUserId,              // Project owner pays the coin
        request.projectId,
        request.projectTitle,
        requestId
      );

      if (!coinTransferResult.success) {
        const reason = coinTransferResult.error || 'Transfer failed';
        toast.error(reason.includes('Insufficient balance') ? 'Insufficient Continental Coins.' : `Collaboration transfer failed: ${reason}`);
        return;
      } else {
        console.log('✅ Coin transfer successful:', coinTransferResult.transaction);
        // Refresh coin balance
        if (refreshCoinBalance) {
          refreshCoinBalance();
        }
        toast.success(`🏛️ Continental Transaction Complete!\n\n1 Continental Coin has been transferred to ${request.applicantName}.\n\n"Honor demands payment. The service is rendered, the coin is earned." - The Continental`);

        // Persist request status change only on successful transfer
        try {
          await CollaborationService.acceptCollaborationRequest(requestId);
        } catch (e) {
          console.error('Error persisting request acceptance:', e);
          toast.error('Coin transferred, but failed to update request status. Please refresh.');
        }
      }

      // Update request status in UI after success
      setRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: 'accepted' as const } : req));

    } catch (error: unknown) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept collaboration request. Please try again.');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      // TODO: Send rejection to backend
      console.log('Rejecting request:', requestId);
      
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'rejected' as const }
            : req
        )
      );
      toast.info(`Collaboration request for ${requests.find(r => r.id === requestId)?.projectTitle} has been declined.`);
    } catch (error: unknown) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject collaboration request. Please try again.');
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const createdDate = new Date(dateString);
    const diffTime = now.getTime() - createdDate.getTime();
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'Just now';
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const respondedRequests = requests.filter(req => req.status !== 'pending');

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent className="fixed bottom-0 right-0 top-0 mt-0 w-full md:w-[400px] rounded-t-[0px]">
        <DrawerHeader className="px-4">
          <DrawerTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Collaboration Requests
          </DrawerTitle>
          <DrawerDescription className="text-sm text-muted-foreground">
            Manage collaboration requests for your projects
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Pending Requests ({pendingRequests.length})
              </h3>
              
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <Card key={request.id} className="border-l-4 border-l-primary/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {/* Applicant Avatar */}
                          {request.applicantImage ? (
                            <Image
                              src={request.applicantImage}
                              alt={request.applicantName || 'Applicant avatar'}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover border-2 border-border"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center border-2 border-border text-foreground/60">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                          
                          {/* Request Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-base">
                                <button onClick={() => router.push(`/profile/${request.applicantId}`)} className="hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded-sm -ml-0.5 -mr-0.5 px-0.5 py-0.5">
                                  {request.applicantName}
                                </button>
                              </h4>
                              <span className="text-xs text-muted-foreground">
                                @{request.applicantUsername}
                              </span>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              Wants to collaborate on 
                              <button onClick={() => router.push(`/projects/${request.projectId}`)} className="font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded-sm -ml-0.5 -mr-0.5 px-0.5 py-0.5">
                                {request.projectTitle}
                              </button>
                            </p>
                            
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {getTimeAgo(request.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {/* Message */}
                      <div className="bg-muted/50 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">Message</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">
                          {request.message}
                        </p>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          onClick={() => handleAccept(request.id)}
                          className="flex-1 min-w-0 bg-emerald-500 hover:bg-emerald-600 text-white"
                          size="sm"
                          title={userBalance !== null && userBalance < 1 
                            ? 'You need at least 1 Continental Coin to accept.' 
                            : 'Sacred Continental Rule: Every collaboration = 1 coin'}
                          disabled={userBalance !== null && userBalance < 1}
                        >
                          <Check className="w-4 h-4 mr-2 shrink-0" />
                          <span className="inline sm:hidden flex-1 truncate">Accept</span>
                          <span className="hidden sm:inline flex-1 truncate">Accept & Collaborate</span>
                          <div className="ml-2 hidden sm:flex items-center gap-1 bg-emerald-400/30 px-2 py-0.5 rounded text-xs">
                            <Coins className="w-3 h-3" />
                            <span>-1 Continental</span>
                          </div>
                        </Button>
                        <Button
                          onClick={() => handleReject(request.id)}
                          variant="outline"
                          className="flex-1 min-w-0 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                          size="sm"
                        >
                          <X className="w-4 h-4 mr-2 shrink-0" />
                          <span className="inline sm:hidden flex-1 truncate">Reject</span>
                          <span className="hidden sm:inline flex-1 truncate">Not This Time</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Responded Requests */}
          {respondedRequests.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Recent Responses ({respondedRequests.length})
              </h3>
              
              <div className="space-y-3">
                {respondedRequests.map((request) => (
                  <Card 
                    key={request.id} 
                    className={`border-l-4 ${
                      request.status === 'accepted' 
                        ? 'border-l-emerald-200 dark:border-l-emerald-800' 
                        : 'border-l-red-200 dark:border-l-red-800'
                    } bg-background/50 text-muted-foreground`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {request.applicantImage ? (
                            <Image
                              src={request.applicantImage}
                              alt={request.applicantName || 'Applicant avatar'}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full border"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center border text-foreground/60">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                          
                          <div>
                            <h4 className="font-medium text-sm">{request.applicantName}</h4>
                            <p className="text-xs text-muted-foreground">
                              {request.projectTitle}
                            </p>
                          </div>
                        </div>
                        
                        <Badge 
                          variant={request.status === 'accepted' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {request.status === 'accepted' ? 'Accepted' : 'Declined'}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {requests.length === 0 && !loading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No collaboration requests</h3>
              <p className="text-muted-foreground text-sm">
                When people apply to collaborate on your projects, they&#39;ll appear here.
              </p>
            </div>
          )}
          
          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">Loading requests...</p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}