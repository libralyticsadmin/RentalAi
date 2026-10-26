import React from 'react';
import { 
  History, 
  Coins, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Filter,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { AuditEvent, Tenant } from '../types';

interface ActivityLogProps {
  auditLogs: AuditEvent[];
  tenant: Tenant;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ auditLogs, tenant }) => {
  const budgetPercent = Math.min(100, Math.round((tenant.spentCurrentMonthThb / tenant.monthlyBudgetThb) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Unit Economics & Inference Budget Card (PRD Section 16) */}
      <div 
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(14, 22, 38, 0.9), rgba(2, 132, 199, 0.12))',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Coins size={20} color="var(--gold-500)" />
              <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>
                AI Inference Unit Economics & Budget Tracker
              </span>
              <span className="brand-tag">PRD Section 16</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Blended inference cost tracked per message handling (Baseline: THB 0.20 / message)
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
              THB {tenant.spentCurrentMonthThb.toLocaleString()} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ THB {tenant.monthlyBudgetThb.toLocaleString()}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--emerald-500)', fontWeight: 600 }}>
              {budgetPercent}% of monthly spending threshold utilized
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div 
          style={{
            width: '100%',
            height: '8px',
            background: 'rgba(0,0,0,0.4)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}
        >
          <div 
            style={{
              width: `${budgetPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--cyan-500), var(--emerald-500))',
              borderRadius: 'var(--radius-full)',
            }}
          />
        </div>
      </div>

      {/* Audit Log Table (PRD FR-16: 100% of external side effects recorded) */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title">
            <History size={18} color="var(--cyan-500)" />
            Immutable Audit Trail & Execution Receipts
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Total Recorded Events: {auditLogs.length}
          </span>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp (Bangkok)</th>
                <th>Actor / Agent</th>
                <th>Action</th>
                <th>Execution Details</th>
                <th>Status</th>
                <th>Tokens</th>
                <th>Cost (THB)</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(log => {
                return (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td style={{ fontWeight: 700, color: '#fff' }}>
                      {log.actor}
                    </td>
                    <td style={{ color: 'var(--cyan-500)', fontWeight: 600 }}>
                      {log.action}
                    </td>
                    <td style={{ maxWidth: '380px', color: '#CBD5E1', fontSize: '0.78rem' }}>
                      {log.details}
                    </td>
                    <td>
                      {log.status === 'success' && <span className="badge badge-emerald">Success</span>}
                      {log.status === 'warning' && <span className="badge badge-amber">Warning</span>}
                      {log.status === 'blocked' && <span className="badge badge-rose">Blocked</span>}
                      {log.status === 'error' && <span className="badge badge-rose">Error</span>}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                      {log.tokenUsage || '-'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--gold-500)' }}>
                      {log.costThb ? `฿${log.costThb.toFixed(2)}` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
