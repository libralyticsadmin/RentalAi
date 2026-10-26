import React, { useState } from 'react';
import { 
  CheckSquare, 
  Clock, 
  Wrench, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Play, 
  RotateCcw, 
  Smartphone,
  Plus,
  Key,
  UserCheck
} from 'lucide-react';
import { OperationalTask, TaskCategory, TaskStatus } from '../types';

interface TaskBoardProps {
  tasks: OperationalTask[];
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask: (newTask: Partial<OperationalTask>) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onUpdateTaskStatus,
  onAddTask,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [mobilePreviewMode, setMobilePreviewMode] = useState<boolean>(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState<boolean>(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newTitleThai, setNewTitleThai] = useState('');
  const [newProperty, setNewProperty] = useState('Villa Amanzi Kamala');
  const [newCategory, setNewCategory] = useState<TaskCategory>('maintenance');
  const [newDueTime, setNewDueTime] = useState('Today 17:00');
  const [newAssignee, setNewAssignee] = useState('Prasit V. (Technician)');

  const filteredTasks = tasks.filter(t => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle,
      titleThai: newTitleThai || newTitle,
      propertyName: newProperty,
      category: newCategory,
      priority: 'high',
      status: 'pending',
      assigneeName: newAssignee,
      dueTime: newDueTime,
      accessInstructions: 'Gate code provided in property facts. Wear uniform.',
    });

    setNewTitle('');
    setNewTitleThai('');
    setShowNewTaskModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Task Controls & Mobile Switcher */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['all', 'maintenance', 'turnover', 'cleaning', 'concierge'].map(cat => (
            <button
              key={cat}
              className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'all' ? 'All Tasks (ทั้งหมด)' : cat.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <button
            className={`btn btn-sm ${mobilePreviewMode ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMobilePreviewMode(!mobilePreviewMode)}
            title="PRD UX Requirement: Responsive layouts support a 360px-wide staff task view for cleaners and technicians"
          >
            <Smartphone size={14} />
            {mobilePreviewMode ? 'Exit Mobile 360px View' : 'Simulate 360px Mobile Staff View'}
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowNewTaskModal(true)}
          >
            <Plus size={14} /> New Task
          </button>
        </div>
      </div>

      {/* Task Board Container */}
      <div 
        style={{
          maxWidth: mobilePreviewMode ? '380px' : '100%',
          margin: mobilePreviewMode ? '0 auto' : '0',
          transition: 'all 0.3s ease',
          background: mobilePreviewMode ? '#000' : 'transparent',
          padding: mobilePreviewMode ? '1.5rem 0.75rem' : '0',
          borderRadius: mobilePreviewMode ? '36px' : '0',
          border: mobilePreviewMode ? '8px solid #262626' : 'none',
          boxShadow: mobilePreviewMode ? '0 20px 40px rgba(0,0,0,0.8)' : 'none',
        }}
      >
        {mobilePreviewMode && (
          <div style={{ textAlign: 'center', marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
            📱 Mobile Staff View (360px - Cleaners & Technicians)
          </div>
        )}

        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: mobilePreviewMode ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1rem',
          }}
        >
          {filteredTasks.map(task => {
            const isCompleted = task.status === 'completed';
            const isInProgress = task.status === 'in_progress';
            const isCritical = task.priority === 'critical';

            return (
              <div
                key={task.id}
                className="glass-panel"
                style={{
                  borderLeft: isCritical ? '4px solid var(--rose-500)' : '4px solid var(--cyan-500)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  opacity: isCompleted ? 0.7 : 1,
                  background: isCompleted ? 'rgba(14, 22, 38, 0.4)' : 'var(--bg-surface)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <span className="code-tag" style={{ fontSize: '0.65rem' }}>
                      {task.category.toUpperCase()}
                    </span>

                    {task.status === 'pending' && <span className="badge badge-amber">Pending (รอดำเนินการ)</span>}
                    {task.status === 'in_progress' && <span className="badge badge-cyan">In Progress (กำลังทำ)</span>}
                    {task.status === 'completed' && <span className="badge badge-emerald">Done (เสร็จสิ้น)</span>}
                  </div>

                  {/* Primary English & Thai Task Titles */}
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#fff', marginBottom: '0.2rem' }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--cyan-500)', fontWeight: 600, marginBottom: '0.5rem' }}>
                    {task.titleThai}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    📍 <strong>{task.propertyName}</strong> · Due: <span style={{ color: isCritical ? 'var(--rose-500)' : '#CBD5E1', fontWeight: 700 }}>{task.dueTime}</span>
                  </div>

                  {task.accessInstructions && (
                    <div 
                      style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '0.55rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.72rem',
                        color: '#E2E8F0',
                        marginBottom: '0.75rem',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <Key size={11} style={{ display: 'inline', marginRight: '4px', color: 'var(--gold-500)' }} />
                      <strong>Access Note:</strong> {task.accessInstructions}
                    </div>
                  )}

                  {task.completionNote && (
                    <div 
                      style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        padding: '0.55rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.72rem',
                        color: 'var(--emerald-500)',
                        marginBottom: '0.75rem',
                        border: '1px solid var(--emerald-border)',
                      }}
                    >
                      ✓ <strong>Completion Evidence:</strong> {task.completionNote}
                    </div>
                  )}
                </div>

                {/* Footer & Staff Actions */}
                <div 
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '0.5rem',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    👤 {task.assigneeName || 'Unassigned'}
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {task.status === 'pending' && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onUpdateTaskStatus(task.id, 'in_progress')}
                      >
                        <Play size={12} /> Start (เริ่มงาน)
                      </button>
                    )}

                    {task.status === 'in_progress' && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => onUpdateTaskStatus(task.id, 'completed')}
                      >
                        <CheckCircle2 size={12} /> Complete (เสร็จ)
                      </button>
                    )}

                    {task.status === 'completed' && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onUpdateTaskStatus(task.id, 'reopened')}
                        title="Reopen if guest reports issue persists (PRD Journey C)"
                      >
                        <RotateCcw size={12} /> Reopen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for Creating New Task */}
      {showNewTaskModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '1.5rem' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', marginBottom: '1rem' }}>
              Create Operational Task (สร้างงานใหม่)
            </div>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Title (English)</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Inspect Infinity Pool Pump Filter"
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-medium)',
                    padding: '0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    marginTop: '0.25rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Title (Thai - สำหรับพนักงาน)</label>
                <input
                  type="text"
                  value={newTitleThai}
                  onChange={(e) => setNewTitleThai(e.target.value)}
                  placeholder="e.g. ตรวจสอบปั๊มกรองน้ำสระว่ายน้ำ"
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-medium)',
                    padding: '0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    marginTop: '0.25rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TaskCategory)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-medium)',
                      padding: '0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      color: '#fff',
                      marginTop: '0.25rem',
                    }}
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="turnover">Turnover Cleaning</option>
                    <option value="cleaning">Daily Cleaning</option>
                    <option value="concierge">Concierge</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Due Time</label>
                  <input
                    type="text"
                    value={newDueTime}
                    onChange={(e) => setNewDueTime(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-medium)',
                      padding: '0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      color: '#fff',
                      marginTop: '0.25rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowNewTaskModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
