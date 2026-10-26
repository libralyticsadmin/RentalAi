// Rental AI — Core Domain Data Models & Types (PRD Section 11)

export type UserRole = 'admin' | 'manager' | 'guest_services' | 'cleaner_technician' | 'auditor';

export interface User {
  id: string;
  name: string;
  nameThai?: string;
  email: string;
  role: UserRole;
  phone?: string;
  assignedPropertyIds: string[]; // empty means all properties
}

export interface Tenant {
  id: string;
  name: string;
  locale: string;
  currency: 'THB' | 'USD';
  timeZone: string; // e.g., 'Asia/Bangkok'
  emergencyKillSwitchActive: boolean;
  rateLimitUsedCurrentMinute: number;
  rateLimitCeilingPerMinute: number;
  monthlyBudgetThb: number;
  spentCurrentMonthThb: number;
}

export interface StructuredFacts {
  wifiSsid: string;
  wifiPassword: string;
  gateCode: string;
  doorLockType: 'digital_keypad' | 'smart_card' | 'physical_keys';
  quietHours: string;
  poolHours: string;
  poolDepth: string;
  acInstructions: string;
  rubbishDisposal: string;
  emergencyContact: string;
  hospitalDistanceKm: number;
}

export interface Property {
  id: string;
  externalPmsId: string;
  name: string;
  address: string;
  zone: string; // e.g., 'Kamala', 'Surin Beach', 'Bang Tao'
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  standardCheckInTime: string; // '15:00'
  standardCheckOutTime: string; // '11:00'
  cleaningBufferHours: number; // e.g. 3.5 hours
  assignedManagerId: string;
  assignedManagerName: string;
  status: 'active' | 'maintenance' | 'paused';
  syncStatus: 'healthy' | 'degraded' | 'syncing';
  lastSyncedAt: string;
  structuredFacts: StructuredFacts;
  knowledgeCompletenessScore: number; // 0 - 100%
  imageUrl: string;
}

export type ReservationStatus = 'confirmed' | 'checked_in' | 'checked_out' | 'canceled';

export interface Reservation {
  id: string;
  externalPmsId: string;
  propertyId: string;
  propertyName: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  guestNationality?: string;
  checkInDate: string; // YYYY-MM-DD
  checkInTime: string; // '15:00'
  checkOutDate: string; // YYYY-MM-DD
  checkOutTime: string; // '11:00'
  nights: number;
  guestCount: number;
  status: ReservationStatus;
  totalAmountThb: number;
  paymentStatus: 'paid_full' | 'deposit_paid' | 'unpaid' | 'unknown';
  sourceChannel: 'Guesty Direct' | 'Airbnb' | 'Booking.com' | 'Agoda' | 'VRBO';
  specialRequests?: string;
  arrivalEstimatedTime?: string;
}

export interface DraftSourceCitation {
  sourceType: 'structured_fact' | 'published_doc' | 'reservation_field' | 'general_policy';
  sourceTitle: string;
  valueExcerpt: string;
}

export interface AiDraft {
  id: string;
  proposedText: string;
  proposedTextThai?: string;
  language: 'en' | 'th' | 'mixed';
  category: string; // e.g. 'wifi_access', 'ac_issue', 'pool_rules', 'checkout_extension'
  confidence: number; // 0.0 - 1.0
  sources: DraftSourceCitation[];
  generatedAt: string;
  status: 'awaiting_approval' | 'approved' | 'sent' | 'canceled';
  cancelReason?: string;
}

export interface GuestMessage {
  id: string;
  threadId: string;
  propertyId: string;
  reservationId?: string;
  sender: 'guest' | 'staff' | 'ai';
  senderName: string;
  text: string;
  translatedText?: string;
  language: 'en' | 'th' | 'mixed' | 'other';
  timestamp: string;
  deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed';
  aiSuggested?: boolean;
  staffApproved?: boolean;
}

export interface ConversationThread {
  id: string;
  externalThreadId: string;
  propertyId: string;
  propertyName: string;
  reservationId?: string;
  guestName: string;
  guestChannel: string;
  lastMessageText: string;
  lastMessageTimestamp: string;
  unreadCount: number;
  priority: 'urgent' | 'high' | 'normal';
  humanTakeoverActive: boolean; // FR-06: Human takeover pauses AI
  pendingAiDraft?: AiDraft;
}

export type TaskCategory = 'cleaning' | 'maintenance' | 'turnover' | 'concierge' | 'inspection';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'reopened';

export interface OperationalTask {
  id: string;
  propertyId: string;
  propertyName: string;
  reservationId?: string;
  title: string;
  titleThai: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId?: string;
  assigneeName?: string;
  assigneeRole?: 'Cleaner' | 'Technician' | 'Coordinator' | 'Villa Manager';
  dueTime: string;
  createdAt: string;
  completedAt?: string;
  sourceMessageId?: string;
  accessInstructions?: string;
  completionNote?: string;
  evidenceAttachment?: string;
}

export interface Commitment {
  id: string;
  propertyId: string;
  propertyName: string;
  reservationId?: string;
  sourceMessageId: string;
  promiseText: string;
  promisedBy: 'staff' | 'ai';
  assigneeName: string;
  dueTime: string;
  linkedTaskId?: string;
  status: 'pending' | 'fulfilled' | 'overdue';
  fulfillmentEvidence?: string;
}

export type CheckStatus = 'pass' | 'fail' | 'unknown';

export interface ReadinessCheckItem {
  key: string;
  label: string;
  labelThai: string;
  status: CheckStatus;
  details: string;
  actionRequired?: string;
}

export interface ArrivalReadiness {
  reservationId: string;
  propertyId: string;
  propertyName: string;
  guestName: string;
  checkInDate: string;
  checkInTime: string;
  overallStatus: CheckStatus; // PRD: missing integration data never counts as pass
  checks: ReadinessCheckItem[];
}

export interface TurnoverConflict {
  id: string;
  propertyId: string;
  propertyName: string;
  date: string;
  departingReservationId: string;
  departingGuestName: string;
  departingCheckOutTime: string; // e.g., '11:00'
  arrivingReservationId: string;
  arrivingGuestName: string;
  arrivingCheckInTime: string; // e.g., '14:00'
  turnaroundMinutes: number; // e.g. 180 min
  requiredCleaningMinutes: number; // e.g. 210 min
  bufferShortfallMinutes: number; // e.g. 30 min shortfall
  severity: 'critical' | 'warning';
  assignedTaskId?: string;
  resolved: boolean;
  resolutionNote?: string;
}

export type AgentType = 
  | 'guest_reply' 
  | 'request_dispatcher' 
  | 'arrival_readiness' 
  | 'turnover_conflict' 
  | 'commitment_tracker' 
  | 'shift_brief';

export type AgentMode = 'off' | 'observe' | 'assist' | 'autopilot';

export interface AgentDefinition {
  id: AgentType;
  name: string;
  nameThai: string;
  description: string;
  trigger: string;
  mode: AgentMode;
  propertyScope: 'all' | string[];
  maxP0Autonomy: string;
  lastRunTimestamp: string;
  totalRuns: number;
  successfulRuns: number;
  preventedErrorsCount: number;
}

export interface ProposedAction {
  id: string;
  agentType: AgentType;
  propertyId: string;
  propertyName: string;
  summary: string;
  summaryThai: string;
  payload: any;
  evidenceSources: string[];
  createdAt: string;
  expiresAt: string;
  status: 'awaiting_approval' | 'approved' | 'rejected' | 'expired';
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  agentType?: AgentType;
  action: string;
  details: string;
  status: 'success' | 'blocked' | 'warning' | 'error';
  tokenUsage?: number;
  costThb?: number;
}

export interface ShiftBrief {
  generatedAt: string;
  shiftWindow: string; // e.g., 'Next 24 Hours'
  propertyScope: string;
  totalArrivals: number;
  totalDepartures: number;
  urgentIncidentsCount: number;
  overdueTasksCount: number;
  openCommitmentsCount: number;
  arrivalsList: Array<{ guestName: string; property: string; time: string; readiness: CheckStatus }>;
  departuresList: Array<{ guestName: string; property: string; time: string }>;
  urgentAttentionItems: Array<{ id: string; title: string; property: string; action: string }>;
  operationalSummaryNote: string;
}

export interface KnowledgeDocument {
  id: string;
  propertyId: string;
  title: string;
  category: 'house_rules' | 'amenities' | 'local_guide' | 'emergency';
  content: string;
  version: number;
  status: 'draft' | 'published';
  publishedAt?: string;
  publisherName?: string;
  hasConflictWithStructuredFacts: boolean;
  conflictDetails?: string;
}
