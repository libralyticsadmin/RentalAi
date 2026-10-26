import React from 'react';
import { 
  Building2, 
  LayoutDashboard, 
  Inbox, 
  CheckSquare, 
  BookOpen, 
  Bot, 
  ShieldAlert, 
  History, 
  CheckCircle2,
  RefreshCw,
  Power
} from 'lucide-react';
import { Tenant } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tenant: Tenant;
  onToggleKillSwitch: () => void;
  pendingApprovalsCount: number;
  unreadInboxCount: number;
  urgentTasksCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  tenant,
  onToggleKillSwitch,
  pendingApprovalsCount,
  unreadInboxCount,
  urgentTasksCount,
}) => {
  return (
    <header className="header-bar">
      <div className="brand-section">
        <div className="brand-logo-badge">
          <Building2 size={20} />
        </div>
        <div>
          <div className="brand-name">
            Rental AI
            <span className="brand-tag">Phuket P0</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            {tenant.name} · Asia/Bangkok
          </div>
        </div>
      </div>

      <nav className="nav-links">
        <button
          className={`nav-item ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          <LayoutDashboard size={16} />
          Today
          {urgentTasksCount > 0 && (
            <span className="badge badge-rose" style={{ padding: '0.1rem 0.35rem', fontSize: '0.65rem' }}>
              {urgentTasksCount}
            </span>
          )}
        </button>

        <button
          className={`nav-item ${activeTab === 'inbox' ? 'active' : ''}`}
          onClick={() => setActiveTab('inbox')}
        >
          <Inbox size={16} />
          Inbox
          {unreadInboxCount > 0 && (
            <span className="badge badge-cyan" style={{ padding: '0.1rem 0.35rem', fontSize: '0.65rem' }}>
              {unreadInboxCount}
            </span>
          )}
        </button>

        <button
          className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <CheckSquare size={16} />
          Tasks
        </button>

        <button
          className={`nav-item ${activeTab === 'knowledge' ? 'active' : ''}`}
          onClick={() => setActiveTab('knowledge')}
        >
          <BookOpen size={16} />
          Knowledge
        </button>

        <button
          className={`nav-item ${activeTab === 'agents' ? 'active' : ''}`}
          onClick={() => setActiveTab('agents')}
        >
          <Bot size={16} />
          Agents (6)
        </button>

        <button
          className={`nav-item ${activeTab === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveTab('approvals')}
        >
          <CheckCircle2 size={16} />
          Approvals
          {pendingApprovalsCount > 0 && (
            <span className="badge badge-amber" style={{ padding: '0.1rem 0.35rem', fontSize: '0.65rem' }}>
              {pendingApprovalsCount}
            </span>
          )}
        </button>

        <button
          className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <History size={16} />
          Audit & Costs
        </button>
      </nav>

      <div className="header-controls">
        <div className="sync-status-badge" title="Guesty Open API Connector Freshness">
          <span className="sync-dot"></span>
          <span style={{ fontSize: '0.72rem' }}>Guesty Sync: Fresh</span>
          <span className="code-tag" style={{ fontSize: '0.65rem' }}>
            {tenant.rateLimitUsedCurrentMinute}/{tenant.rateLimitCeilingPerMinute} rpm
          </span>
        </div>

        <button
          className={`kill-switch-btn ${tenant.emergencyKillSwitchActive ? 'active' : ''}`}
          onClick={onToggleKillSwitch}
          title="PRD FR-06 & Section 7: Immediate Organization-wide Kill Switch for Autonomous AI Actions"
        >
          <Power size={13} />
          {tenant.emergencyKillSwitchActive ? 'KILL SWITCH ENGAGED' : 'Kill Switch'}
        </button>
      </div>
    </header>
  );
};
