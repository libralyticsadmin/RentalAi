import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  Calendar, 
  ShieldAlert,
  Flame,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { 
  Property, 
  Reservation, 
  OperationalTask, 
  Commitment, 
  TurnoverConflict, 
  ArrivalReadiness, 
  ShiftBrief 
} from '../types';

interface TodayDashboardProps {
  properties: Property[];
  reservations: Reservation[];
  tasks: OperationalTask[];
  commitments: Commitment[];
  turnoverConflicts: TurnoverConflict[];
  readinessList: ArrivalReadiness[];
  shiftBrief: ShiftBrief;
  onNavigate: (tab: string) => void;
  onResolveConflict: (conflictId: string) => void;
}

export const TodayDashboard: React.FC<TodayDashboardProps> = ({
  properties,
  reservations,
  tasks,
  commitments,
  turnoverConflicts,
  readinessList,
  shiftBrief,
  onNavigate,
  onResolveConflict,
}) => {
  const unresolvedConflicts = turnoverConflicts.filter(c => !c.resolved);
  const urgentTasks = tasks.filter(t => t.priority === 'critical' && t.status !== 'completed');
  const openCommitments = commitments.filter(c => c.status === 'pending');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Alert Banner if there are Turnover Conflicts */}
      {unresolvedConflicts.length > 0 && (
        <div 
          style={{
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.18), rgba(245, 158, 11, 0.12))',
            border: '1px solid var(--rose-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            boxShadow: '0 4px 20px rgba(244, 63, 94, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div 
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'var(--rose-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexShrink: 0,
              }}
            >
              <Flame size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>
                  Critical Turnover Conflict Detected
                </span>
                <span className="badge badge-rose">Buffer Shortfall: 60 Min</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#CBD5E1', marginTop: '0.2rem' }}>
                <strong>{unresolvedConflicts[0].propertyName}</strong> — Departing guest ({unresolvedConflicts[0].departingGuestName}) checks out at {unresolvedConflicts[0].departingCheckOutTime}. 
                Arriving family ({unresolvedConflicts[0].arrivingGuestName}) lands at 13:30. Villa cleaning buffer requires 3.5 hours.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexShrink: 0 }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('tasks')}
            >
              View Cleaning Task
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onResolveConflict(unresolvedConflicts[0].id)}
            >
              Mark Buffer Mitigated
            </button>
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">
            <span>Arrivals Today</span>
            <Calendar size={15} color="var(--cyan-500)" />
          </div>
          <div className="kpi-value">{shiftBrief.totalArrivals}</div>
          <div className="kpi-subtitle">
            {shiftBrief.arrivalsList.map(a => a.guestName).join(', ') || 'No arrivals today'}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Departures Today</span>
            <Clock size={15} color="var(--amber-500)" />
          </div>
          <div className="kpi-value">{shiftBrief.totalDepartures}</div>
          <div className="kpi-subtitle">Standard checkout: 11:00 AM</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Critical Tasks</span>
            <AlertTriangle size={15} color="var(--rose-500)" />
          </div>
          <div className="kpi-value" style={{ color: urgentTasks.length > 0 ? 'var(--rose-500)' : '#fff' }}>
            {urgentTasks.length}
          </div>
          <div className="kpi-subtitle">1 AC Repair, 1 Turnover Deep Clean</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Tracked Promises</span>
            <Sparkles size={15} color="var(--emerald-500)" />
          </div>
          <div className="kpi-value">{openCommitments.length}</div>
          <div className="kpi-subtitle">Luggage hold & AC technician dispatch</div>
        </div>
      </div>

      {/* Main 2-Column Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '1.5rem' }}>
        {/* Left Column: Shift Brief & Arrival Readiness */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Executive Shift Brief */}
          <div className="glass-panel">
            <div className="panel-header">
              <div className="panel-title">
                <Sparkles size={18} color="var(--cyan-500)" />
                24-Hour Executive Shift Brief
                <span className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>AI Generated</span>
              </div>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigate('inbox')}
              >
                Go to Inbox <ArrowRight size={13} />
              </button>
            </div>
            <div className="panel-body">
              <div 
                style={{
                  background: 'rgba(2, 132, 199, 0.08)',
                  border: '1px solid rgba(2, 132, 199, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  lineHeight: '1.6',
                  color: '#E2E8F0',
                }}
              >
                <strong>Operational Focus:</strong> {shiftBrief.operationalSummaryNote}
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                PRIORITY ACTION CHECKLIST:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {shiftBrief.urgentAttentionItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.property} · {item.action}
                      </div>
                    </div>
                    <span className="badge badge-amber">Action Needed</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Arrival Readiness Checklist */}
          <div className="glass-panel">
            <div className="panel-header">
              <div className="panel-title">
                <UserCheck size={18} color="var(--emerald-500)" />
                Arrival Readiness Verification (Next 48 Hours)
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Evaluated hourly by Arrival Readiness Agent
              </span>
            </div>

            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {readinessList.map(rd => (
                <div 
                  key={rd.reservationId}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#fff' }}>
                        {rd.guestName}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.6rem' }}>
                        {rd.propertyName} · ETA {rd.checkInTime}
                      </span>
                    </div>

                    {rd.overallStatus === 'pass' && (
                      <span className="badge badge-emerald">
                        <CheckCircle2 size={12} /> Ready for Arrival
                      </span>
                    )}
                    {rd.overallStatus === 'fail' && (
                      <span className="badge badge-rose">
                        <XCircle size={12} /> Readiness Failed
                      </span>
                    )}
                    {rd.overallStatus === 'unknown' && (
                      <span className="badge badge-amber" title="PRD Section 10: Missing integration data never counts as pass">
                        <HelpCircle size={12} /> Data Incomplete (Unknown)
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                    {rd.checks.map((chk, i) => (
                      <div 
                        key={i}
                        style={{
                          background: 'rgba(0, 0, 0, 0.25)',
                          padding: '0.55rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.2rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {chk.label}
                          </span>
                          {chk.status === 'pass' && <CheckCircle2 size={12} color="var(--emerald-500)" />}
                          {chk.status === 'fail' && <XCircle size={12} color="var(--rose-500)" />}
                          {chk.status === 'unknown' && <HelpCircle size={12} color="var(--amber-500)" />}
                        </div>
                        <span style={{ fontSize: '0.68rem', color: chk.status === 'fail' ? 'var(--rose-500)' : 'var(--text-muted)' }}>
                          {chk.details}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Properties Overview & Quick Ops */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Properties in Portfolio */}
          <div className="glass-panel">
            <div className="panel-header">
              <div className="panel-title">
                Managed Properties (Phuket)
              </div>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigate('knowledge')}
              >
                Knowledge Base <ChevronRight size={13} />
              </button>
            </div>

            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {properties.map(p => (
                <div 
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <img 
                    src={p.imageUrl} 
                    alt={p.name} 
                    style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} 
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {p.zone} · {p.bedrooms} Beds · Buffer: {p.cleaningBufferHours}h
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                      {p.knowledgeCompletenessScore}% Knowledge
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guest Commitment Tracker Card */}
          <div className="glass-panel">
            <div className="panel-header">
              <div className="panel-title">
                Active Guest Commitments
              </div>
              <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>Tracker Agent</span>
            </div>

            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {commitments.map(c => (
                <div
                  key={c.id}
                  style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    <span>{c.propertyName}</span>
                    <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>Due {c.dueTime}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#E2E8F0', fontStyle: 'italic', marginBottom: '0.35rem' }}>
                    "{c.promiseText}"
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    Promised by: <strong>{c.promisedBy.toUpperCase()}</strong> · Assigned to: {c.assigneeName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
