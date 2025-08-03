'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { 
  CollaborationRequest, 
  CollaborationType 
} from '@/types/project';
import { 
  Bell, 
  X, 
  Check, 
  MessageSquare, 
  User, 
  Clock,
  Archive,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface CollaborationSidebarProps {
  requests: CollaborationRequest[];
  isOpen: boolean;
  onToggle: () => void;
  onAcceptRequest: (requestId: string) => Promise<void>;
  onDenyRequest: (requestId: string) => Promise<void>;
  onArchiveRequest: (requestId: string) => Promise<void>;
  onRefresh: () => void;
}

export function CollaborationSidebar({
  requests,
  isOpen,
  onToggle,
  onAcceptRequest,
  onDenyRequest,
  onArchiveRequest,
  onRefresh
}: CollaborationSidebarProps) {
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const recentAccepted = requests.filter(r => r.status === 'accepted');
  
  const unreadCount = pendingRequests.length;

  const handleAccept = async (requestId: string) => {
    setProcessingRequests(prev => new Set([...prev, requestId]));
    try {
      await onAcceptRequest(requestId);
      toast.success('Collaboration request accepted! 🎉');
      onRefresh();
    } catch (error) {
      toast.error('Failed to accept request');
      console.error('Accept request error:', error);
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleDeny = async (requestId: string) => {
    setProcessingRequests(prev => new Set([...prev, requestId]));
    try {
      await onDenyRequest(requestId);
      toast.success('Request declined');
      onRefresh();
    } catch (error) {
      toast.error('Failed to decline request');
      console.error('Deny request error:', error);
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleArchive = async (requestId: string) => {
    setProcessingRequests(prev => new Set([...prev, requestId]));
    try {
      await onArchiveRequest(requestId);
      toast.success('Request archived');
      onRefresh();
    } catch (error) {
      toast.error('Failed to archive request');
      console.error('Archive request error:', error);
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };



  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`fixed top-1/2 -translate-y-1/2 z-50 bg-primary text-primary-foreground p-2 rounded-l-lg shadow-lg transition-all duration-300 ${
          isOpen ? 'right-96' : 'right-0'
        }`}
      >
        <div className="flex items-center gap-2">
          {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </button>

      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-background border-l shadow-xl z-40 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Collaboration Requests</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={onToggle}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {unreadCount} new request{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No collaboration requests</h3>
                <p className="text-sm text-muted-foreground">
                  When people request to collaborate on your projects, they&apos;ll appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-950/20 border-b">
                      <h3 className="font-medium text-sm text-yellow-800 dark:text-yellow-200">
                        Pending ({pendingRequests.length})
                      </h3>
                    </div>
                    {pendingRequests.map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        isProcessing={processingRequests.has(request.id)}
                        onAccept={() => handleAccept(request.id)}
                        onDeny={() => handleDeny(request.id)}
                        getCollaborationType={() => ({ label: 'Collaboration', icon: () => null })}
                      />
                    ))}
                  </div>
                )}

                {/* Recent Accepted */}
                {recentAccepted.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-green-50 dark:bg-green-950/20 border-b">
                      <h3 className="font-medium text-sm text-green-800 dark:text-green-200">
                        Recently Accepted
                      </h3>
                    </div>
                    {recentAccepted.slice(0, 3).map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        isProcessing={processingRequests.has(request.id)}
                        onArchive={() => handleArchive(request.id)}
                        getCollaborationType={() => ({ label: 'Collaboration', icon: () => null })}
                        isAccepted
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30"
          onClick={onToggle}
        />
      )}
    </>
  );
}

interface RequestCardProps {
  request: CollaborationRequest;
  isProcessing: boolean;
  onAccept?: () => void;
  onDeny?: () => void;
  onArchive?: () => void;
  getCollaborationType: (typeId: CollaborationType) => { label: string; icon: React.ComponentType } | undefined;
  isAccepted?: boolean;
}

function RequestCard({
  request,
  isProcessing,
  onAccept,
  onDeny,
  onArchive,
  getCollaborationType,
  isAccepted = false
}: RequestCardProps) {
  const collaborationType = getCollaborationType(request.collaboration_type);
  const timeAgo = formatDistanceToNow(new Date(request.created_at), { addSuffix: true });

  return (
    <div className="p-4 border-b hover:bg-muted/30 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">{request.requester?.username}</p>
            <p className="text-xs text-muted-foreground">{request.project?.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {timeAgo}
        </div>
      </div>

      {/* Collaboration Type */}
      {collaborationType && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">🤝</span>
          <Badge variant="secondary" className="text-xs">
            {collaborationType.label}
          </Badge>
        </div>
      )}

      {/* Message */}
      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
        &quot;{request.intro_message}&quot;
      </p>

      {/* Discord Info */}
      {request.requester?.discord_username && (
        <div className="text-xs text-blue-600 dark:text-blue-400 mb-3">
          💬 Discord: {request.requester.discord_username}
        </div>
      )}

      {/* Actions */}
      {!isAccepted ? (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onAccept}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-3 h-3 mr-1" />
                Accept
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDeny}
            disabled={isProcessing}
            className="flex-1"
          >
            <X className="w-3 h-3 mr-1" />
            Decline
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          onClick={onArchive}
          disabled={isProcessing}
          className="w-full text-xs"
        >
          <Archive className="w-3 h-3 mr-1" />
          Mark as Done & Archive
        </Button>
      )}
    </div>
  );
}