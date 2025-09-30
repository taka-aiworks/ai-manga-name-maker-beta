import React, { useState } from 'react';
import { requestAiLayout } from '../../services/AiLayoutService';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onApply: (result: { templateId: string }) => void;
  existingCharacters: string[];
};

export const AiAutoLayoutModal: React.FC<Props> = ({ isOpen, onClose, onApply, existingCharacters }) => {
  const [sceneBrief, setSceneBrief] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggle = (name: string) => {
    setSelected(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const handlePropose = async () => {
    if (!sceneBrief.trim()) {
      setError('シーン説明を入力してください');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await requestAiLayout({ sceneBrief, characters: selected, options: { desiredPanels: 'auto' } });
      onApply({ templateId: res.templateId });
      onClose();
    } catch (e: any) {
      setError('提案の取得に失敗しました。しばらくしてからお試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 'min(720px, 96vw)', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: 16 }}>
        <h3 style={{ marginBottom: 12 }}>AIで自動配置</h3>
        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>シーン説明（1〜2文）</label>
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

        {error && <div style={{ color: 'var(--danger-color)', fontSize: 12, marginTop: 8 }}>{error}</div>}

        <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="control-btn" onClick={onClose} disabled={loading}>キャンセル</button>
          <button className="control-btn" onClick={handlePropose} disabled={loading} style={{ background: 'var(--accent-color)', color: '#fff' }}>{loading ? '提案中…' : 'AI提案'}</button>
        </div>
      </div>
    </div>
  );
};

export default AiAutoLayoutModal;


