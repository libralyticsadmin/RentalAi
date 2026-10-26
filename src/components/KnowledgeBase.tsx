import React, { useState } from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Upload, 
  Plus, 
  Layers, 
  Wifi, 
  Lock, 
  Clock, 
  Info,
  Check
} from 'lucide-react';
import { Property, KnowledgeDocument } from '../types';

interface KnowledgeBaseProps {
  properties: Property[];
  documents: KnowledgeDocument[];
  onPublishDocument: (docId: string) => void;
  onUpdateStructuredFacts: (propertyId: string, updatedFacts: any) => void;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  properties,
  documents,
  onPublishDocument,
  onUpdateStructuredFacts,
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'structured' | 'documents'>('structured');

  const selectedProperty = properties.find(p => p.id === selectedPropertyId) || properties[0];
  const propertyDocs = documents.filter(d => d.propertyId === selectedProperty?.id);

  // Editable structured facts state
  const [wifiSsid, setWifiSsid] = useState(selectedProperty?.structuredFacts.wifiSsid || '');
  const [wifiPassword, setWifiPassword] = useState(selectedProperty?.structuredFacts.wifiPassword || '');
  const [gateCode, setGateCode] = useState(selectedProperty?.structuredFacts.gateCode || '');
  const [quietHours, setQuietHours] = useState(selectedProperty?.structuredFacts.quietHours || '');
  const [poolHours, setPoolHours] = useState(selectedProperty?.structuredFacts.poolHours || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when property changes
  React.useEffect(() => {
    if (selectedProperty) {
      setWifiSsid(selectedProperty.structuredFacts.wifiSsid);
      setWifiPassword(selectedProperty.structuredFacts.wifiPassword);
      setGateCode(selectedProperty.structuredFacts.gateCode);
      setQuietHours(selectedProperty.structuredFacts.quietHours);
      setPoolHours(selectedProperty.structuredFacts.poolHours);
      setSavedSuccess(false);
    }
  }, [selectedPropertyId]);

  const handleSaveFacts = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStructuredFacts(selectedProperty.id, {
      ...selectedProperty.structuredFacts,
      wifiSsid,
      wifiPassword,
      gateCode,
      quietHours,
      poolHours,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Property Selector Bar */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'var(--bg-surface)',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            SELECT VILLA:
          </span>
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-medium)',
              color: '#fff',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              outline: 'none',
              fontWeight: 600,
            }}
          >
            {properties.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.zone})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            className={`btn btn-sm ${activeTab === 'structured' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('structured')}
          >
            <ShieldCheck size={14} /> Tier 1: Structured Facts
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'documents' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('documents')}
          >
            <FileText size={14} /> Tier 2: Knowledge Documents ({propertyDocs.length})
          </button>
        </div>
      </div>

      {/* Precedence Banner (PRD Section 7: Grounding & Evidence Precedence) */}
      <div
        style={{
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.8rem',
          color: '#E0F2FE',
        }}
      >
        <Info size={18} color="var(--cyan-500)" style={{ flexShrink: 0 }} />
        <div>
          <strong>PRD Grounding Precedence Rule:</strong> Structured Property Facts strictly override any conflicting freeform document text or guest claims. Only <strong>published</strong> documents enter AI model context.
        </div>
      </div>

      {activeTab === 'structured' ? (
        /* Structured Facts Editor */
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>
                Structured Property Truth ({selectedProperty.name})
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Authoritative source for Wi-Fi, door locks, quiet hours, and pool safety rules.
              </div>
            </div>

            {savedSuccess && (
              <span className="badge badge-emerald">
                <Check size={12} /> Truth Updated & Synced
              </span>
            )}
          </div>

          <form onSubmit={handleSaveFacts} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Wi-Fi Network Name (SSID)
              </label>
              <input
                type="text"
                value={wifiSsid}
                onChange={(e) => setWifiSsid(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-medium)',
                  padding: '0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  marginTop: '0.25rem',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Wi-Fi Password
              </label>
              <input
                type="text"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-medium)',
                  padding: '0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  marginTop: '0.25rem',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Security Gate / Keypad Code
              </label>
              <input
                type="text"
                value={gateCode}
                onChange={(e) => setGateCode(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-medium)',
                  padding: '0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  marginTop: '0.25rem',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Estate Quiet Hours
              </label>
              <input
                type="text"
                value={quietHours}
                onChange={(e) => setQuietHours(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-medium)',
                  padding: '0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  marginTop: '0.25rem',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Swimming Pool Operating Hours & Depth
              </label>
              <input
                type="text"
                value={poolHours}
                onChange={(e) => setPoolHours(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-medium)',
                  padding: '0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  marginTop: '0.25rem',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Emergency Manager Hotline
              </label>
              <input
                type="text"
                disabled
                value={selectedProperty.structuredFacts.emergencyContact}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-subtle)',
                  padding: '0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-muted)',
                  marginTop: '0.25rem',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">
                Save & Update Grounding Truth
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Knowledge Documents Section */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
            {propertyDocs.map(doc => (
              <div key={doc.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span className="code-tag" style={{ fontSize: '0.65rem' }}>
                      {doc.category.toUpperCase()} · v{doc.version}
                    </span>

                    {doc.status === 'published' ? (
                      <span className="badge badge-emerald">Published</span>
                    ) : (
                      <span className="badge badge-amber">Draft</span>
                    )}
                  </div>

                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', marginBottom: '0.4rem' }}>
                    {doc.title}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#CBD5E1', lineHeight: '1.5', marginBottom: '0.75rem' }}>
                    {doc.content}
                  </div>
                </div>

                <div 
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Published by {doc.publisherName || 'Staff'}
                  </span>

                  {doc.status === 'draft' ? (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onPublishDocument(doc.id)}
                    >
                      <CheckCircle2 size={12} /> Publish to AI Agents
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: 'var(--emerald-500)', fontWeight: 600 }}>
                      ✓ Active in AI Context
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
