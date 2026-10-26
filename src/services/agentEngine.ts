// Rental AI — The 6 Operational AI Agents Engine (PRD Section 7 & 10)

import {
  AgentType,
  AgentMode,
  ConversationThread,
  GuestMessage,
  OperationalTask,
  Commitment,
  ArrivalReadiness,
  TurnoverConflict,
  ProposedAction,
  AuditEvent,
  ShiftBrief,
  Property,
  Reservation
} from '../types';

export class AgentEngine {
  /**
   * Evaluates an inbound guest message with the Guest Reply Agent
   */
  static evaluateGuestReply(
    thread: ConversationThread,
    inboundMsg: GuestMessage,
    property: Property,
    reservation?: Reservation,
    agentMode: AgentMode = 'assist',
    killSwitchActive: boolean = false
  ): { draft?: any; auditEvent: AuditEvent; blockedReason?: string } {
    // Safety check 1: Emergency Kill Switch
    if (killSwitchActive) {
      return {
        auditEvent: {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Guest Reply Agent',
          agentType: 'guest_reply',
          action: 'Execution Blocked by Emergency Kill Switch',
          details: `Inbound message from ${thread.guestName} skipped because the organization kill switch is active.`,
          status: 'blocked',
          tokenUsage: 0,
          costThb: 0,
        },
        blockedReason: 'Emergency Kill Switch is currently active.',
      };
    }

    // Safety check 2: Human takeover
    if (thread.humanTakeoverActive) {
      return {
        auditEvent: {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Guest Reply Agent',
          agentType: 'guest_reply',
          action: 'Execution Suppressed (Human Takeover Active)',
          details: `Staff member has active takeover for thread ${thread.externalThreadId}. Agent proposed draft withheld.`,
          status: 'warning',
          tokenUsage: 45,
          costThb: 0.02,
        },
        blockedReason: 'Human Takeover is active on this thread.',
      };
    }

    // Safety check 3: Stale PMS data (PRD Section 9: must be refreshed < 5 mins)
    const lastSyncMs = Date.now() - new Date(property.lastSyncedAt).getTime();
    if (lastSyncMs > 5 * 60 * 1000) {
      return {
        auditEvent: {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Guest Reply Agent',
          agentType: 'guest_reply',
          action: 'Execution Deferred (Stale PMS Data)',
          details: `Property data is ${Math.round(lastSyncMs / 60000)} minutes old. Freshness limit is 5 minutes.`,
          status: 'warning',
          tokenUsage: 60,
          costThb: 0.03,
        },
        blockedReason: 'Property sync data is stale (> 5 minutes). Manual staff review required.',
      };
    }

    // Grounding analysis: Check topic
    const textLower = inboundMsg.text.toLowerCase();
    const isThai = /[\u0E00-\u0E7F]/.test(inboundMsg.text);

    // Wi-Fi topic
    if (textLower.includes('wifi') || textLower.includes('wi-fi') || textLower.includes('password') || textLower.includes('ไวไฟ') || textLower.includes('รหัสผ่าน')) {
      const draft = {
        id: `draft-${Date.now()}`,
        category: 'wifi_access',
        language: isThai ? 'th' : 'en',
        confidence: 0.99,
        proposedText: isThai
          ? `สวัสดีครับคุณ${thread.guestName} สำหรับสัญญาณ Wi-Fi ความเร็วสูงของ ${property.name} ชื่อเครือข่ายคือ "${property.structuredFacts.wifiSsid}" และรหัสผ่านคือ "${property.structuredFacts.wifiPassword}" ครับ หากต้องการความช่วยเหลือเพิ่มเติมสามารถแจ้งได้ตลอดเวลานะครับ`
          : `Hello ${thread.guestName}! The high-speed Wi-Fi network for ${property.name} is "${property.structuredFacts.wifiSsid}" and the password is "${property.structuredFacts.wifiPassword}". Please let us know if you need anything else!`,
        sources: [
          {
            sourceType: 'structured_fact',
            sourceTitle: `${property.name} Structured Facts`,
            valueExcerpt: `SSID: ${property.structuredFacts.wifiSsid}, Password: ${property.structuredFacts.wifiPassword}`,
          },
        ],
        generatedAt: new Date().toISOString(),
        status: agentMode === 'autopilot' ? 'approved' : 'awaiting_approval',
      };

      return {
        draft,
        auditEvent: {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Guest Reply Agent (v1.2)',
          agentType: 'guest_reply',
          action: agentMode === 'autopilot' ? 'Autonomous Auto-Reply Dispatched' : 'Grounded Draft Proposed',
          details: `Grounded Wi-Fi answer generated for ${thread.guestName}. Mode: ${agentMode}.`,
          status: 'success',
          tokenUsage: 380,
          costThb: 0.15,
        },
      };
    }

    // Pool or AC topic
    if (textLower.includes('pool') || textLower.includes('สระ') || textLower.includes('ว่ายน้ำ')) {
      const draft = {
        id: `draft-${Date.now()}`,
        category: 'pool_rules',
        language: isThai ? 'th' : 'en',
        confidence: 0.95,
        proposedText: isThai
          ? `สวัสดีครับคุณ${thread.guestName} สระว่ายน้ำของ ${property.name} เปิดให้บริการช่วงเวลา ${property.structuredFacts.poolHours} ความลึก ${property.structuredFacts.poolDepth} เพื่อความปลอดภัยกรุณาหลีกเลี่ยงการนำภาชนะแก้วลงสระนะครับ`
          : `Hello ${thread.guestName}! The pool hours at ${property.name} are ${property.structuredFacts.poolHours} (Depth: ${property.structuredFacts.poolDepth}). For your safety, please avoid glassware in and around the pool deck.`,
        sources: [
          {
            sourceType: 'structured_fact',
            sourceTitle: `${property.name} Structured Facts`,
            valueExcerpt: `Pool Hours: ${property.structuredFacts.poolHours}, Depth: ${property.structuredFacts.poolDepth}`,
          },
        ],
        generatedAt: new Date().toISOString(),
        status: agentMode === 'autopilot' ? 'approved' : 'awaiting_approval',
      };

      return {
        draft,
        auditEvent: {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Guest Reply Agent (v1.2)',
          agentType: 'guest_reply',
          action: 'Grounded Draft Proposed',
          details: `Grounded Pool info draft prepared for ${thread.guestName}.`,
          status: 'success',
          tokenUsage: 410,
          costThb: 0.16,
        },
      };
    }

    // Default polite acknowledgement routing to staff
    const draft = {
      id: `draft-${Date.now()}`,
      category: 'general_concierge',
      language: isThai ? 'th' : 'en',
      confidence: 0.88,
      proposedText: isThai
        ? `สวัสดีครับคุณ${thread.guestName} ทางทีมงานได้รับข้อความเรียบร้อยแล้วครับ ผู้จัดการวิลล่ากำลังตรวจสอบและจะติดต่อกลับโดยเร็วที่สุดครับ`
        : `Hello ${thread.guestName}, thank you for reaching out. Our villa manager has received your message and will follow up with you shortly.`,
      sources: [
        {
          sourceType: 'general_policy',
          sourceTitle: 'Guest Concierge Response Policy',
          valueExcerpt: 'Acknowledge guest inquiry and escalate non-routine requests to assigned Villa Manager.',
        },
      ],
      generatedAt: new Date().toISOString(),
      status: 'awaiting_approval',
    };

    return {
      draft,
      auditEvent: {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Guest Reply Agent (v1.2)',
        agentType: 'guest_reply',
        action: 'Review Draft Proposed (Complex Intent)',
        details: `Complex query routed to human review for thread ${thread.externalThreadId}.`,
        status: 'success',
        tokenUsage: 490,
        costThb: 0.19,
      },
    };
  }

  /**
   * Request Dispatcher Agent: Turns guest complaints into operational tasks
   */
  static evaluateRequestDispatcher(
    thread: ConversationThread,
    inboundMsg: GuestMessage,
    property: Property
  ): { task?: OperationalTask; auditEvent: AuditEvent } {
    const textLower = inboundMsg.text.toLowerCase();
    const isMaintenance = 
      textLower.includes('air') || textLower.includes('ac') || textLower.includes('แอร์') ||
      textLower.includes('water') || textLower.includes('leak') || textLower.includes('น้ำรั่ว') ||
      textLower.includes('toilet') || textLower.includes('ชักโครก') || textLower.includes('ไฟดับ');

    if (isMaintenance) {
      const task: OperationalTask = {
        id: `task-${Date.now()}`,
        propertyId: property.id,
        propertyName: property.name,
        reservationId: thread.reservationId,
        title: `Maintenance Request: In-Suite Air/Water Check (${thread.guestName})`,
        titleThai: `งานซ่อมบำรุงด่วน: ตรวจสอบระบบแอร์/น้ำประปา (${thread.guestName})`,
        category: 'maintenance',
        priority: 'critical',
        status: 'pending',
        assigneeName: 'Prasit V. (ประสิทธิ์)',
        assigneeRole: 'Technician',
        dueTime: 'Within 1 Hour',
        createdAt: new Date().toISOString(),
        sourceMessageId: inboundMsg.id,
        accessInstructions: `Guest in-suite. Gate code: ${property.structuredFacts.gateCode}. Contact resident manager prior to entry.`,
      };

      return {
        task,
        auditEvent: {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Request Dispatcher Agent',
          agentType: 'request_dispatcher',
          action: 'Auto-Dispatched Maintenance Task',
          details: `Created critical task [${task.id}] from guest message on thread ${thread.externalThreadId}.`,
          status: 'success',
          tokenUsage: 290,
          costThb: 0.11,
        },
      };
    }

    return {
      auditEvent: {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Request Dispatcher Agent',
        agentType: 'request_dispatcher',
        action: 'No Task Required',
        details: 'Inbound message classified as non-operational conversational text.',
        status: 'success',
        tokenUsage: 120,
        costThb: 0.05,
      },
    };
  }

  /**
   * Generates Executive 24-Hour Shift Briefing
   */
  static generateShiftBrief(
    properties: Property[],
    reservations: Reservation[],
    tasks: OperationalTask[],
    commitments: Commitment[],
    readinessList: ArrivalReadiness[]
  ): ShiftBrief {
    const todayStr = new Date().toISOString().split('T')[0];
    const arrivalsToday = reservations.filter(r => r.checkInDate === todayStr);
    const departuresToday = reservations.filter(r => r.checkOutDate === todayStr);
    const urgentTasks = tasks.filter(t => t.priority === 'critical' && t.status !== 'completed');
    const openCommitments = commitments.filter(c => c.status !== 'fulfilled');

    const arrivalsList = arrivalsToday.map(r => {
      const readiness = readinessList.find(rd => rd.reservationId === r.id);
      return {
        guestName: r.guestName,
        property: r.propertyName,
        time: r.checkInTime,
        readiness: readiness ? readiness.overallStatus : 'unknown',
      };
    });

    const departuresList = departuresToday.map(r => ({
      guestName: r.guestName,
      property: r.propertyName,
      time: r.checkOutTime,
    }));

    const urgentAttentionItems = [
      ...urgentTasks.map(t => ({
        id: t.id,
        title: t.title,
        property: t.propertyName,
        action: `Assigned to ${t.assigneeName || 'Unassigned'} — Due ${t.dueTime}`,
      })),
      ...openCommitments.map(c => ({
        id: c.id,
        title: `Commitment: ${c.promiseText}`,
        property: c.propertyName,
        action: `Owner: ${c.assigneeName} — Due ${c.dueTime}`,
      })),
    ];

    return {
      generatedAt: new Date().toISOString(),
      shiftWindow: 'Next 24 Hours (Asia/Bangkok)',
      propertyScope: `${properties.length} Active Phuket Luxury Properties`,
      totalArrivals: arrivalsToday.length,
      totalDepartures: departuresToday.length,
      urgentIncidentsCount: urgentTasks.length,
      overdueTasksCount: tasks.filter(t => t.dueTime.includes('Buffer Shortfall') || t.status === 'reopened').length,
      openCommitmentsCount: openCommitments.length,
      arrivalsList,
      departuresList,
      urgentAttentionItems,
      operationalSummaryNote: `Today requires high operational coordination at Villa Amanzi Kamala due to same-day turnover and arriving family party at 13:30. Surin Heights AC technician inspection scheduled for 15:30.`,
    };
  }
}
