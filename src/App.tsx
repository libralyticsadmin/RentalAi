import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { TodayDashboard } from './components/TodayDashboard';
import { UnifiedInbox } from './components/UnifiedInbox';
import { TaskBoard } from './components/TaskBoard';
import { KnowledgeBase } from './components/KnowledgeBase';
import { AgentConsole } from './components/AgentConsole';
import { ActivityLog } from './components/ActivityLog';

import {
  INITIAL_TENANT,
  INITIAL_PROPERTIES,
  INITIAL_RESERVATIONS,
  INITIAL_THREADS,
  INITIAL_MESSAGES,
  INITIAL_TASKS,
  INITIAL_COMMITMENTS,
  INITIAL_READINESS_LIST,
  INITIAL_TURNOVER_RISKS,
  INITIAL_AGENTS,
  INITIAL_PROPOSED_ACTIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_KNOWLEDGE_DOCS,
} from './services/pmsService';

import { AgentEngine } from './services/agentEngine';

import {
  Tenant,
  Property,
  Reservation,
  ConversationThread,
  GuestMessage,
  OperationalTask,
  Commitment,
  ArrivalReadiness,
  TurnoverConflict,
  AgentDefinition,
  ProposedAction,
  AuditEvent,
  KnowledgeDocument,
  AgentType,
  AgentMode,
  TaskStatus,
} from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('today');

  // Application State
  const [tenant, setTenant] = useState<Tenant>(INITIAL_TENANT);
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [threads, setThreads] = useState<ConversationThread[]>(INITIAL_THREADS);
  const [messages, setMessages] = useState<Record<string, GuestMessage[]>>(INITIAL_MESSAGES);
  const [tasks, setTasks] = useState<OperationalTask[]>(INITIAL_TASKS);
  const [commitments, setCommitments] = useState<Commitment[]>(INITIAL_COMMITMENTS);
  const [readinessList, setReadinessList] = useState<ArrivalReadiness[]>(INITIAL_READINESS_LIST);
  const [turnoverConflicts, setTurnoverConflicts] = useState<TurnoverConflict[]>(INITIAL_TURNOVER_RISKS);
  const [agents, setAgents] = useState<AgentDefinition[]>(INITIAL_AGENTS);
  const [proposedActions, setProposedActions] = useState<ProposedAction[]>(INITIAL_PROPOSED_ACTIONS);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(INITIAL_AUDIT_LOGS);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(INITIAL_KNOWLEDGE_DOCS);

  // Compute live shift brief using the Shift Brief Agent
  const shiftBrief = AgentEngine.generateShiftBrief(
    properties,
    reservations,
    tasks,
    commitments,
    readinessList
  );

  // 1. Emergency Kill Switch Handler (PRD FR-06 & Section 7)
  const handleToggleKillSwitch = () => {
    const newState = !tenant.emergencyKillSwitchActive;
    setTenant(prev => ({ ...prev, emergencyKillSwitchActive: newState }));

    const audit: AuditEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Admin / Manager (Manual)',
      action: newState ? 'Kill Switch ENGAGED' : 'Kill Switch Disengaged',
      details: newState
        ? 'Emergency organization-wide kill switch engaged. All autonomous agent side effects blocked immediately.'
        : 'Emergency kill switch deactivated. Standard autonomy policies restored.',
      status: newState ? 'warning' : 'success',
      tokenUsage: 0,
      costThb: 0,
    };

    setAuditLogs(prev => [audit, ...prev]);
  };

  // 2. Human Takeover Handler (PRD FR-06)
  const handleToggleTakeover = (threadId: string) => {
    setThreads(prev =>
      prev.map(t => {
        if (t.id === threadId) {
          const newTakeoverState = !t.humanTakeoverActive;
          return {
            ...t,
            humanTakeoverActive: newTakeoverState,
            // If taking over, immediately cancel any pending AI draft!
            pendingAiDraft: newTakeoverState ? undefined : t.pendingAiDraft,
          };
        }
        return t;
      })
    );

    const targetThread = threads.find(t => t.id === threadId);
    if (targetThread) {
      const willBeActive = !targetThread.humanTakeoverActive;
      const audit: AuditEvent = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Guest Services (Staff)',
        action: willBeActive ? 'Human Takeover Activated' : 'Human Takeover Released',
        details: willBeActive
          ? `Thread ${targetThread.externalThreadId} paused. Pending AI drafts canceled.`
          : `Thread ${targetThread.externalThreadId} returned to AI Assist mode.`,
        status: 'success',
      };
      setAuditLogs(prev => [audit, ...prev]);
    }
  };

  // 3. Send Manual Message
  const handleSendMessage = (threadId: string, text: string) => {
    const targetThread = threads.find(t => t.id === threadId);
    if (!targetThread) return;

    const newMsg: GuestMessage = {
      id: `msg-${Date.now()}`,
      threadId,
      propertyId: targetThread.propertyId,
      reservationId: targetThread.reservationId,
      sender: 'staff',
      senderName: 'Somchai Prasert (Villa Manager)',
      text,
      language: /[\u0E00-\u0E7F]/.test(text) ? 'th' : 'en',
      timestamp: new Date().toISOString(),
      deliveryStatus: 'delivered',
      staffApproved: true,
    };

    setMessages(prev => ({
      ...prev,
      [threadId]: [...(prev[threadId] || []), newMsg],
    }));

    setThreads(prev =>
      prev.map(t =>
        t.id === threadId
          ? {
              ...t,
              lastMessageText: text,
              lastMessageTimestamp: new Date().toISOString(),
              unreadCount: 0,
              pendingAiDraft: undefined,
            }
          : t
      )
    );

    const audit: AuditEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Somchai Prasert (Staff)',
      action: 'Outbound Message Sent',
      details: `Delivered message to guest ${targetThread.guestName} via Guesty Open API adapter.`,
      status: 'success',
      tokenUsage: 110,
      costThb: 0.04,
    };

    setAuditLogs(prev => [audit, ...prev]);
  };

  // 4. Approve Grounded AI Draft
  const handleApproveDraft = (threadId: string) => {
    const targetThread = threads.find(t => t.id === threadId);
    if (!targetThread || !targetThread.pendingAiDraft) return;

    const draft = targetThread.pendingAiDraft;

    const newMsg: GuestMessage = {
      id: `msg-${Date.now()}`,
      threadId,
      propertyId: targetThread.propertyId,
      reservationId: targetThread.reservationId,
      sender: 'ai',
      senderName: 'Rental AI Assistant',
      text: draft.proposedText,
      translatedText: draft.language === 'th' ? 'Translated: ' + draft.proposedText : undefined,
      language: draft.language,
      timestamp: new Date().toISOString(),
      deliveryStatus: 'delivered',
      aiSuggested: true,
      staffApproved: true,
    };

    setMessages(prev => ({
      ...prev,
      [threadId]: [...(prev[threadId] || []), newMsg],
    }));

    setThreads(prev =>
      prev.map(t =>
        t.id === threadId
          ? {
              ...t,
              lastMessageText: draft.proposedText,
              lastMessageTimestamp: new Date().toISOString(),
              unreadCount: 0,
              pendingAiDraft: undefined,
            }
          : t
      )
    );

    // Increment tenant spent
    setTenant(prev => ({
      ...prev,
      spentCurrentMonthThb: prev.spentCurrentMonthThb + 0.18,
    }));

    const audit: AuditEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Guest Services / Staff Approval',
      agentType: 'guest_reply',
      action: 'Approved & Sent AI Draft',
      details: `Grounded draft for ${targetThread.guestName} approved and dispatched. Receipt token verified.`,
      status: 'success',
      tokenUsage: 450,
      costThb: 0.18,
    };

    setAuditLogs(prev => [audit, ...prev]);
  };

  // 5. Discard AI Draft
  const handleDiscardDraft = (threadId: string) => {
    setThreads(prev =>
      prev.map(t => (t.id === threadId ? { ...t, pendingAiDraft: undefined } : t))
    );

    const audit: AuditEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Staff Reviewer',
      agentType: 'guest_reply',
      action: 'Draft Discarded',
      details: `Staff member discarded proposed draft for thread ${threadId}.`,
      status: 'warning',
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  // 6. Update Task Status (Staff View)
  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : t.completedAt,
            completionNote:
              newStatus === 'completed'
                ? 'Work inspected and signed off by staff. Verification evidence logged.'
                : t.completionNote,
          };
        }
        return t;
      })
    );

    const targetTask = tasks.find(t => t.id === taskId);
    const audit: AuditEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Operations Staff / Technician',
      action: `Task ${newStatus.toUpperCase()}`,
      details: `Task [${targetTask?.title}] updated to status ${newStatus}.`,
      status: 'success',
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  // 7. Add Operational Task
  const handleAddTask = (newTaskData: Partial<OperationalTask>) => {
    const task: OperationalTask = {
      id: `task-${Date.now()}`,
      propertyId: properties[0].id,
      propertyName: newTaskData.propertyName || properties[0].name,
      title: newTaskData.title || 'Operational Task',
      titleThai: newTaskData.titleThai || 'งานปฏิบัติการ',
      category: newTaskData.category || 'maintenance',
      priority: newTaskData.priority || 'medium',
      status: 'pending',
      assigneeName: newTaskData.assigneeName || 'Staff Member',
      dueTime: newTaskData.dueTime || 'Today 18:00',
      createdAt: new Date().toISOString(),
      accessInstructions: newTaskData.accessInstructions,
    };

    setTasks(prev => [task, ...prev]);

    const audit: AuditEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Coordinator (Manual)',
      action: 'Created Operational Task',
      details: `Task [${task.title}] assigned to ${task.assigneeName}.`,
      status: 'success',
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  // 8. Resolve Turnover Conflict
  const handleResolveConflict = (conflictId: string) => {
    setTurnoverConflicts(prev =>
      prev.map(c => (c.id === conflictId ? { ...c, resolved: true } : c))
    );

    const audit: AuditEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Resident Manager (Somchai)',
      action: 'Turnover Conflict Mitigated',
      details: 'Assigned 4 housekeepers to team Alpha; luggage storage pre-arranged for arriving Stern family.',
      status: 'success',
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  // 9. Update Agent Mode
  const handleUpdateAgentMode = (agentId: AgentType, newMode: AgentMode) => {
    setAgents(prev =>
      prev.map(a => (a.id === agentId ? { ...a, mode: newMode } : a))
    );

    const targetAgent = agents.find(a => a.id === agentId);
    const audit: AuditEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Admin / Manager',
      agentType: agentId,
      action: `Agent Mode Set to ${newMode.toUpperCase()}`,
      details: `${targetAgent?.name} autonomy mode shifted to ${newMode}.`,
      status: 'success',
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  // 10. Approve Proposed Action in Approvals Queue
  const handleApproveAction = (actionId: string) => {
    setProposedActions(prev =>
      prev.map(a => (a.id === actionId ? { ...a, status: 'approved' } : a))
    );

    const targetAction = proposedActions.find(a => a.id === actionId);
    if (targetAction && targetAction.payload?.threadId) {
      handleApproveDraft(targetAction.payload.threadId);
    }
  };

  // 11. Reject Proposed Action
  const handleRejectAction = (actionId: string) => {
    setProposedActions(prev =>
      prev.map(a => (a.id === actionId ? { ...a, status: 'rejected' } : a))
    );
  };

  // 12. Publish Knowledge Document
  const handlePublishDocument = (docId: string) => {
    setDocuments(prev =>
      prev.map(d =>
        d.id === docId
          ? {
              ...d,
              status: 'published',
              publishedAt: new Date().toISOString(),
              publisherName: 'Somchai Prasert',
            }
          : d
      )
    );

    const targetDoc = documents.find(d => d.id === docId);
    const audit: AuditEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Property Manager',
      action: 'Published Knowledge Document',
      details: `Document [${targetDoc?.title}] published into active retrieval index.`,
      status: 'success',
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  // 13. Update Structured Facts (Truth)
  const handleUpdateStructuredFacts = (propertyId: string, updatedFacts: any) => {
    setProperties(prev =>
      prev.map(p =>
        p.id === propertyId
          ? {
              ...p,
              structuredFacts: updatedFacts,
              lastSyncedAt: new Date().toISOString(),
            }
          : p
      )
    );

    const targetProp = properties.find(p => p.id === propertyId);
    const audit: AuditEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Property Manager',
      action: 'Updated Structured Truth Facts',
      details: `Authoritative facts updated for ${targetProp?.name}. Precedence enforced over documents.`,
      status: 'success',
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const pendingApprovalsCount = proposedActions.filter(a => a.status === 'awaiting_approval').length;
  const unreadInboxCount = threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0);
  const urgentTasksCount = tasks.filter(t => t.priority === 'critical' && t.status !== 'completed').length;

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tenant={tenant}
        onToggleKillSwitch={handleToggleKillSwitch}
        pendingApprovalsCount={pendingApprovalsCount}
        unreadInboxCount={unreadInboxCount}
        urgentTasksCount={urgentTasksCount}
      />

      <main className="main-content">
        {activeTab === 'today' && (
          <TodayDashboard
            properties={properties}
            reservations={reservations}
            tasks={tasks}
            commitments={commitments}
            turnoverConflicts={turnoverConflicts}
            readinessList={readinessList}
            shiftBrief={shiftBrief}
            onNavigate={setActiveTab}
            onResolveConflict={handleResolveConflict}
          />
        )}

        {activeTab === 'inbox' && (
          <UnifiedInbox
            threads={threads}
            messages={messages}
            reservations={reservations}
            properties={properties}
            onSendMessage={handleSendMessage}
            onApproveDraft={handleApproveDraft}
            onDiscardDraft={handleDiscardDraft}
            onToggleTakeover={handleToggleTakeover}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskBoard
            tasks={tasks}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onAddTask={handleAddTask}
          />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeBase
            properties={properties}
            documents={documents}
            onPublishDocument={handlePublishDocument}
            onUpdateStructuredFacts={handleUpdateStructuredFacts}
          />
        )}

        {activeTab === 'agents' && (
          <AgentConsole
            agents={agents}
            proposedActions={proposedActions}
            onUpdateAgentMode={handleUpdateAgentMode}
            onApproveAction={handleApproveAction}
            onRejectAction={handleRejectAction}
            killSwitchActive={tenant.emergencyKillSwitchActive}
          />
        )}

        {activeTab === 'approvals' && (
          <AgentConsole
            agents={agents}
            proposedActions={proposedActions}
            onUpdateAgentMode={handleUpdateAgentMode}
            onApproveAction={handleApproveAction}
            onRejectAction={handleRejectAction}
            killSwitchActive={tenant.emergencyKillSwitchActive}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityLog
            auditLogs={auditLogs}
            tenant={tenant}
          />
        )}
      </main>
    </div>
  );
}

export default App;
