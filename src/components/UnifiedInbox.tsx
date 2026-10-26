import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  UserCheck, 
  ShieldAlert, 
  Globe, 
  Clock, 
  CheckCheck, 
  AlertCircle, 
  Check, 
  X,
  FileText,
  UserX,
  Lock
} from 'lucide-react';
import { 
  ConversationThread, 
  GuestMessage, 
  Reservation, 
  Property,
  DraftSourceCitation 
} from '../types';

interface UnifiedInboxProps {
  threads: ConversationThread[];
  messages: Record<string, GuestMessage[]>;
  reservations: Reservation[];
  properties: Property[];
  onSendMessage: (threadId: string, text: string) => void;
  onApproveDraft: (threadId: string) => void;
  onDiscardDraft: (threadId: string) => void;
  onToggleTakeover: (threadId: string) => void;
}

export const UnifiedInbox: React.FC<UnifiedInboxProps> = ({
  threads,
  messages,
  reservations,
  properties,
  onSendMessage,
  onApproveDraft,
  onDiscardDraft,
  onToggleTakeover,
}) => {
  const [selectedThreadId, setSelectedThreadId] = useState<string>(threads[0]?.id || '');
  const [inputText, setInputText] = useState('');
  const [showTranslations, setShowTranslations] = useState(true);

  const selectedThread = threads.find(t => t.id === selectedThreadId) || threads[0];
  const currentMessages = selectedThread ? messages[selectedThread.id] || [] : [];
  const currentReservation = reservations.find(r => r.id === selectedThread?.reservationId);
  const currentProperty = properties.find(p => p.id === selectedThread?.propertyId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(selectedThread.id, inputText.trim());
    setInputText('');
  };

  return (
    <div 
      className="glass-panel"
      style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr 280px',
        height: 'calc(100vh - 140px)',
        minHeight: '620px',
      }}
    >
      {/* 1. Threads Sidebar */}
      <div 
        style={{
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(8, 12, 20, 0.5)',
        }}
      >
        <div 
          style={{
            padding: '1rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>
            Guest Inquiries ({threads.length})
          </span>
          <span className="code-tag" style={{ fontSize: '0.65rem' }}>Bilingual EN/TH</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {threads.map(t => {
            const isSelected = t.id === selectedThread?.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedThreadId(t.id)}
                style={{
                  padding: '0.9rem 1rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--bg-card)' : 'transparent',
                  borderLeft: isSelected ? '3px solid var(--cyan-500)' : '3px solid transparent',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: isSelected ? '#fff' : '#E2E8F0' }}>
                    {t.guestName}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {new Date(t.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--cyan-500)', fontWeight: 600, marginBottom: '0.35rem' }}>
                  {t.propertyName} · <span style={{ color: 'var(--text-muted)' }}>{t.guestChannel}</span>
                </div>

                <div 
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: '1.4',
                  }}
                >
                  {t.lastMessageText}
                </div>

                <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.45rem', alignItems: 'center' }}>
                  {t.priority === 'urgent' && <span className="badge badge-rose" style={{ fontSize: '0.62rem' }}>Urgent</span>}
                  {t.humanTakeoverActive && (
                    <span className="badge badge-amber" style={{ fontSize: '0.62rem' }}>
                      <Lock size={10} /> Staff Takeover
                    </span>
                  )}
                  {t.pendingAiDraft && !t.humanTakeoverActive && (
                    <span className="badge badge-cyan" style={{ fontSize: '0.62rem' }}>
                      <Sparkles size={10} /> AI Draft Ready
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Main Chat Conversation */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
        {/* Chat Header */}
        <div 
          style={{
            padding: '0.9rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(14, 22, 38, 0.7)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>
                {selectedThread?.guestName}
              </span>
              <span className="code-tag">{selectedThread?.guestChannel}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {selectedThread?.propertyName}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              className={`btn btn-sm ${showTranslations ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowTranslations(!showTranslations)}
              title="Toggle automatic bilingual English & Thai side-by-side translation"
            >
              <Globe size={13} />
              {showTranslations ? 'Hide Translation' : 'Translate TH/EN'}
            </button>

            {/* Human Takeover Switch (FR-06) */}
            <button
              className={`btn btn-sm ${selectedThread?.humanTakeoverActive ? 'btn-danger' : 'btn-secondary'}`}
              onClick={() => onToggleTakeover(selectedThread.id)}
              title="FR-06: Pause AI automation on this thread. Cancels any pending auto-sends immediately."
            >
              {selectedThread?.humanTakeoverActive ? (
                <>
                  <Lock size={13} /> Takeover Active (AI Paused)
                </>
              ) : (
                <>
                  <UserX size={13} /> Enable Staff Takeover
                </>
              )}
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div 
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {currentMessages.map(msg => {
            const isGuest = msg.sender === 'guest';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isGuest ? 'flex-start' : 'flex-end',
                  maxWidth: '75%',
                  alignSelf: isGuest ? 'flex-start' : 'flex-end',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  {msg.senderName} · {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>

                <div
                  style={{
                    background: isGuest ? 'var(--bg-card)' : 'linear-gradient(135deg, #0284C7, #0D9488)',
                    color: '#fff',
                    padding: '0.75rem 1rem',
                    borderRadius: isGuest ? '0 var(--radius-md) var(--radius-md) var(--radius-md)' : 'var(--radius-md) 0 var(--radius-md) var(--radius-md)',
                    border: isGuest ? '1px solid var(--border-medium)' : 'none',
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                  }}
                >
                  <div>{msg.text}</div>

                  {/* Bilingual translation display */}
                  {showTranslations && msg.translatedText && (
                    <div 
                      style={{
                        marginTop: '0.45rem',
                        paddingTop: '0.45rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                        fontSize: '0.75rem',
                        color: isGuest ? 'var(--cyan-500)' : '#E0F2FE',
                        fontStyle: 'italic',
                      }}
                    >
                      <Globe size={11} style={{ display: 'inline', marginRight: '4px' }} />
                      {msg.translatedText}
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCheck size={12} color="var(--emerald-500)" />
                  {msg.deliveryStatus === 'delivered' ? 'Delivered via Guesty API' : 'Sent'}
                  {msg.staffApproved && ' · Staff Approved'}
                </div>
              </div>
            );
          })}

          {/* AI Grounded Draft Proposal Panel (FR-05) */}
          {selectedThread?.pendingAiDraft && !selectedThread.humanTakeoverActive && (
            <div
              style={{
                background: 'rgba(2, 132, 199, 0.08)',
                border: '1px solid rgba(2, 132, 199, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                margin: '0.5rem 0',
                boxShadow: '0 0 20px rgba(2, 132, 199, 0.15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} color="var(--cyan-500)" />
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff' }}>
                    Grounded AI Draft Proposal
                  </span>
                  <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                    {Math.round(selectedThread.pendingAiDraft.confidence * 100)}% Confidence
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onDiscardDraft(selectedThread.id)}
                    title="Reject draft"
                  >
                    <X size={12} /> Discard
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onApproveDraft(selectedThread.id)}
                    title="Approve and send via Guesty Open API"
                  >
                    <Check size={12} /> Approve & Send
                  </button>
                </div>
              </div>

              <div 
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.84rem',
                  lineHeight: '1.5',
                  color: '#F8FAFC',
                  marginBottom: '0.6rem',
                }}
              >
                {selectedThread.pendingAiDraft.proposedText}
              </div>

              {/* Source Evidence Citations (PRD FR-05) */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  GROUNDED EVIDENCE:
                </span>
                {selectedThread.pendingAiDraft.sources.map((src: DraftSourceCitation, idx: number) => (
                  <span 
                    key={idx}
                    className="badge badge-muted"
                    style={{ fontSize: '0.65rem', border: '1px solid rgba(56, 189, 248, 0.3)' }}
                    title={src.valueExcerpt}
                  >
                    <FileText size={10} color="var(--cyan-500)" />
                    {src.sourceTitle}: {src.valueExcerpt.slice(0, 35)}...
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Takeover Active Warning Notice */}
          {selectedThread?.humanTakeoverActive && (
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid var(--amber-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.65rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.75rem',
                color: 'var(--amber-500)',
              }}
            >
              <AlertCircle size={14} />
              <strong>Staff Takeover Active:</strong> AI automated actions and auto-replies are paused for this guest. Only manual replies will be sent.
            </div>
          )}
        </div>

        {/* Message Input Box */}
        <form 
          onSubmit={handleSend}
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '0.75rem',
            background: 'rgba(8, 12, 20, 0.6)',
          }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Reply to ${selectedThread?.guestName} (English or Thai)...`}
            style={{
              flex: 1,
              background: 'var(--bg-input)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.65rem 1rem',
              color: '#fff',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
            }}
          />

          <button type="submit" className="btn btn-primary">
            <Send size={15} /> Send
          </button>
        </form>
      </div>

      {/* 3. Right Context Drawer: Reservation & Property Details */}
      <div
        style={{
          borderLeft: '1px solid var(--border-subtle)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          background: 'rgba(8, 12, 20, 0.5)',
          overflowY: 'auto',
        }}
      >
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Reservation Details
          </div>

          {currentReservation ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Status: </span>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                  {currentReservation.status.toUpperCase()}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Stay: </span>
                <strong style={{ color: '#fff' }}>{currentReservation.checkInDate} → {currentReservation.checkOutDate}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Guests: </span>
                <span style={{ color: '#fff' }}>{currentReservation.guestCount} Adults ({currentReservation.nights} Nights)</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Total: </span>
                <strong style={{ color: 'var(--emerald-500)' }}>THB {currentReservation.totalAmountThb.toLocaleString()}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Payment: </span>
                <span className="code-tag" style={{ fontSize: '0.68rem' }}>{currentReservation.paymentStatus}</span>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              No reservation linked to this contact.
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Property Structured Facts
          </div>

          {currentProperty && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.75rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Wi-Fi: </span>
                <span className="code-tag">{currentProperty.structuredFacts.wifiSsid}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Pass: </span>
                <span className="code-tag">{currentProperty.structuredFacts.wifiPassword}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Gate Code: </span>
                <span className="code-tag">{currentProperty.structuredFacts.gateCode}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Pool Hours: </span>
                <span style={{ color: '#CBD5E1' }}>{currentProperty.structuredFacts.poolHours}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Manager: </span>
                <span style={{ color: '#CBD5E1' }}>{currentProperty.assignedManagerName}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
