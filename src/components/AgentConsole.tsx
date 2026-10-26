import React from 'react';
import { 
  Bot, 
  Power, 
  ShieldCheck, 
  ShieldAlert, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Settings2, 
  ArrowRight,
  Eye,
  HandMetal,
  Zap,
  Check,
  X
} from 'lucide-react';
import { AgentDefinition, AgentMode, ProposedAction, AgentType } from '../types';

interface AgentConsoleProps {
  agents: AgentDefinition[];
  proposedActions: ProposedAction[];
  onUpdateAgentMode: (agentId: AgentType, newMode: AgentMode) => void;
  onApproveAction: (actionId: string) => void;
  onRejectAction: (actionId: string) => void;
  killSwitchActive: boolean;
}

export const AgentConsole: React.FC<AgentConsoleProps> = ({
  agents,
  proposedActions,
  onUpdateAgentMode,
  onApproveAction,
  onRejectAction,
  killSwitchActive,
}) => {
  const pendingActions = proposedActions.filter(a => a.status === 'awaiting_approval');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Kill Switch Alert Banner */}
      {killSwitchActive && (
        <div
          style={{
            background: 'var(--rose-bg)',
            border: '2px solid var(--rose-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 0 25px rgba(244, 63, 94, 0.35)',
          }}
        >
          <ShieldAlert size={28} color="var(--rose-500)" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>
              EMERGENCY KILL SWITCH IS ACTIVE
            </div>
            <div style={{ fontSize: '0.8rem', color: '#CBD5E1', marginTop: '0.2rem' }}>
              All 6 agents are currently prevented from performing external side effects or automatic sends. Operations are strictly in Manual Staff mode.
            </div>
          </div>
        </div>
      )}

      {/* Pending Approvals Section if any */}
      {pendingActions.length > 0 && (
        <div className="glass-panel" style={{ border: '1px solid var(--amber-border)' }}>
          <div className="panel-header" style={{ background: 'rgba(245, 158, 11, 0.08)' }}>
            <div className="panel-title" style={{ color: 'var(--amber-500)' }}>
              <Clock size={18} />
              Human Approval Queue ({pendingActions.length} Pending Actions)
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Actions queued in Assist mode
            </span>
          </div>

          <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingActions.map(action => (
              <div
                key={action.id}
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <span className="code-tag">{action.agentType.toUpperCase()}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{action.propertyName}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', marginBottom: '0.25rem' }}>
                    {action.summary}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Evidence Sources: <strong>{action.evidenceSources.join(', ')}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onRejectAction(action.id)}
                  >
                    <X size={12} /> Reject
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onApproveAction(action.id)}
                  >
                    <Check size={12} /> Approve & Dispatch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agents Catalog (The 6 P0 Agents) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#fff' }}>
              P0 Operational AI Agents Catalog
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Configure autonomy modes, triggers, and inspect safety barriers for each agent.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Eye size={12} color="var(--text-muted)" /> Observe
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HandMetal size={12} color="var(--amber-500)" /> Assist
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Zap size={12} color="var(--cyan-500)" /> Autopilot
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {agents.map(agent => (
            <div
              key={agent.id}
              className="glass-panel"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.25rem',
                borderTop: agent.mode === 'autopilot' ? '3px solid var(--cyan-500)' : agent.mode === 'assist' ? '3px solid var(--amber-500)' : '3px solid var(--text-muted)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>
                      {agent.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--cyan-500)', fontWeight: 600 }}>
                      {agent.nameThai}
                    </div>
                  </div>

                  <span 
                    className={`badge ${agent.mode === 'autopilot' ? 'badge-cyan' : agent.mode === 'assist' ? 'badge-amber' : 'badge-muted'}`}
                  >
                    {agent.mode.toUpperCase()}
                  </span>
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '0.75rem' }}>
                  {agent.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.72rem', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Trigger: </span>
                    <span style={{ color: '#E2E8F0' }}>{agent.trigger}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Max Autonomy: </span>
                    <span style={{ color: '#E2E8F0' }}>{agent.maxP0Autonomy}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Runs / Prevented Errors: </span>
                    <strong style={{ color: '#fff' }}>{agent.totalRuns}</strong> runs · <span style={{ color: 'var(--emerald-500)' }}>{agent.preventedErrorsCount} errors caught</span>
                  </div>
                </div>
              </div>

              {/* Mode Control Bar */}
              <div 
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  AUTONOMY MODE:
                </span>

                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {(['off', 'observe', 'assist', 'autopilot'] as AgentMode[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => onUpdateAgentMode(agent.id, mode)}
                      style={{
                        padding: '0.25rem 0.55rem',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        background: agent.mode === mode 
                          ? mode === 'autopilot' ? 'var(--cyan-500)' : mode === 'assist' ? 'var(--amber-500)' : '#475569'
                          : 'rgba(255, 255, 255, 0.05)',
                        color: agent.mode === mode ? '#fff' : 'var(--text-muted)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
