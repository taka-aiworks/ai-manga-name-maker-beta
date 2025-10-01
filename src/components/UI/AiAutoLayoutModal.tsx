import React, { useState, useEffect } from 'react';
import { requestAiLayout } from '../../services/AiLayoutService';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onApply: (result: any) => void;
  existingCharacters: string[];
  selectedTemplateId: string;
  panelCount: number;
};

export const AiAutoLayoutModal: React.FC<Props> = ({ isOpen, onClose, onApply, existingCharacters, selectedTemplateId, panelCount }) => {
  const [sceneBrief, setSceneBrief] = useState('');
  const [panelBriefs, setPanelBriefs] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [showPanelInputs, setShowPanelInputs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPanelBriefs(Array(panelCount).fill(''));
    }
  }, [isOpen, panelCount]);

  if (!isOpen) return null;

  const toggle = (name: string) => {
    setSelected(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const handlePropose = async () => {
    if (!sceneBrief.trim()) {
      setError('シーン全体の説明を入力してください');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const filteredPanelBriefs = panelBriefs.filter(b => b.trim());
      const res = await requestAiLayout({ 
        sceneBrief, 
        characters: selected, 
        options: { 
          templateId: selectedTemplateId,
          panelBriefs: filteredPanelBriefs.length > 0 ? filteredPanelBriefs : undefined
        } 
      });
      onApply(res);
      onClose();
    } catch (e: any) {
      setError('配置提案の取得に失敗しました。しばらくしてからお試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ width: 'min(720px, 96vw)', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: 16 }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginBottom: 12 }}>AI配置アシスト（{panelCount}コマ）</h3>
        
        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>シーン全体の説明（必須・1〜2文）</label>
        <textarea
          value={sceneBrief}
          onChange={(e) => setSceneBrief(e.target.value)}
          rows={3}
          placeholder="放課後、主人公が告白するが軽くかわされてしまう"
          style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
        />

        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>登場キャラ（任意）</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {existingCharacters.map((name) => (
              <button key={name} onClick={() => toggle(name)} className="control-btn" style={{ background: selected.includes(name) ? 'var(--accent-color)' : 'var(--bg-secondary)', color: selected.includes(name) ? '#fff' : 'var(--text-primary)' }}>
                {name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <button 
            className="control-btn" 
            onClick={() => setShowPanelInputs(!showPanelInputs)}
            style={{ fontSize: 12, padding: '6px 10px' }}
          >
            {showPanelInputs ? '▼ コマごとの説明を閉じる' : '▶ コマごとの説明を入力（任意）'}
          </button>
        </div>

        {showPanelInputs && (
          <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-secondary)', borderRadius: 6 }}>
            {Array.from({ length: panelCount }).map((_, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>コマ{i + 1}の説明（任意）</label>
                <input
                  type="text"
                  value={panelBriefs[i] || ''}
                  onChange={(e) => {
                    const updated = [...panelBriefs];
                    updated[i] = e.target.value;
                    setPanelBriefs(updated);
                  }}
                  placeholder={`例: 緊張した主人公が立つ`}
                  style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 12 }}
                />
              </div>
            ))}
          </div>
        )}

        {error && <div style={{ color: 'var(--danger-color)', fontSize: 12, marginTop: 8 }}>{error}</div>}

        <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="control-btn" onClick={onClose} disabled={loading}>キャンセル</button>
          <button className="control-btn" onClick={handlePropose} disabled={loading} style={{ background: 'var(--accent-color)', color: '#fff' }}>{loading ? '配置提案中…' : 'AI配置提案'}</button>
        </div>
      </div>
    </div>
  );
};

export default AiAutoLayoutModal;


