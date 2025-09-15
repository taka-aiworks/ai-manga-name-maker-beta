// src/App.tsx (トーン機能統合版)
import React, { useState, useEffect, useCallback, useMemo } from "react";
import CanvasComponent from "./components/CanvasComponent";
import CharacterDetailPanel from "./components/UI/CharacterDetailPanel";
import { Panel, Character, SpeechBubble, SnapSettings, BackgroundElement, EffectElement, ToneElement, BackgroundTemplate } from "./types";
import { templates } from "./components/CanvasArea/templates";
import { sceneTemplates, applySceneTemplate } from "./components/CanvasArea/sceneTemplates";
import { ExportPanel } from './components/UI/ExportPanel';
import { useRef } from 'react';
import "./App.css";

// 必要なimport（トーン機能含む）
import useProjectSave from './hooks/useProjectSave';
import ProjectPanel from './components/UI/ProjectPanel';
import BackgroundPanel from './components/UI/BackgroundPanel';
import EffectPanel from './components/UI/EffectPanel';
import TonePanel from './components/UI/TonePanel';

function App() {
  // デフォルトダークモード設定
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  // 基本状態管理
  const [selectedTemplate, setSelectedTemplate] = useState<string>("4koma");
  const [panels, setPanels] = useState<Panel[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [speechBubbles, setSpeechBubbles] = useState<SpeechBubble[]>([]);
  const [backgrounds, setBackgrounds] = useState<BackgroundElement[]>([]);
  const [effects, setEffects] = useState<EffectElement[]>([]);
  const [tones, setTones] = useState<ToneElement[]>([]); // 🆕 トーン状態管理
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<EffectElement | null>(null);
  const [selectedTone, setSelectedTone] = useState<ToneElement | null>(null); // 🆕 トーン選択状態
  const [dialogueText, setDialogueText] = useState<string>("");

  // UI状態管理
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [selectedScene, setSelectedScene] = useState<string>("");
  const [showCharacterPanel, setShowCharacterPanel] = useState<boolean>(false);
  const [isPanelEditMode, setIsPanelEditMode] = useState<boolean>(false);
  const [showProjectPanel, setShowProjectPanel] = useState<boolean>(false);
  const [showBackgroundPanel, setShowBackgroundPanel] = useState<boolean>(false);
  const [showEffectPanel, setShowEffectPanel] = useState<boolean>(false);
  const [showTonePanel, setShowTonePanel] = useState<boolean>(false); // 🆕 トーンパネル表示制御

  // スナップ設定の状態管理
  const [snapSettings, setSnapSettings] = useState<SnapSettings>({
    enabled: true,
    gridSize: 20,
    sensitivity: 'medium',
    gridDisplay: 'edit-only'
  });

  // プロジェクト保存hook（トーンデータ対応）
  const settings = useMemo(() => ({ 
    snapEnabled: snapSettings.enabled, 
    snapSize: snapSettings.gridSize, 
    darkMode: isDarkMode 
  }), [snapSettings.enabled, snapSettings.gridSize, isDarkMode]);

  const canvasSize = useMemo(() => ({ 
    width: 800, 
    height: 600 
  }), []);

  const projectSave = useProjectSave({ 
    panels, 
    characters, 
    bubbles: speechBubbles,
    backgrounds,
    effects,
    tones, // 🆕 トーンデータを保存対象に追加
    canvasSize, 
    settings 
  });

  // 機能コールバック用の状態
  const [addCharacterFunc, setAddCharacterFunc] = useState<((type: string) => void) | null>(null);
  const [addBubbleFunc, setAddBubbleFunc] = useState<((type: string, text: string) => void) | null>(null);

  // アンドゥ/リドゥ機能（トーン対応）
  const [operationHistory, setOperationHistory] = useState<{
    characters: Character[][];
    speechBubbles: SpeechBubble[][];
    panels: Panel[][];
    backgrounds: BackgroundElement[][];
    effects: EffectElement[][];
    tones: ToneElement[][]; // 🆕 トーン履歴追加
    currentIndex: number;
  }>({
    characters: [[]],
    speechBubbles: [[]],
    panels: [[]],
    backgrounds: [[]],
    effects: [[]],
    tones: [[]], // 🆕 トーン履歴初期化
    currentIndex: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 履歴保存の最適化 - 依存関係を文字列で管理（トーン対応）
  const charactersSignature = useMemo(() => 
    characters.map(char => `${char.id}-${char.x}-${char.y}-${char.scale}`).join(','), 
    [characters]
  );
  
  const bubblesSignature = useMemo(() => 
    speechBubbles.map(bubble => `${bubble.id}-${bubble.x}-${bubble.y}-${bubble.width}-${bubble.height}`).join(','), 
    [speechBubbles]
  );
  
  const panelsSignature = useMemo(() => 
    panels.map(panel => `${panel.id}-${panel.x}-${panel.y}-${panel.width}-${panel.height}`).join(','), 
    [panels]
  );

  const backgroundsSignature = useMemo(() => 
    backgrounds.map(bg => `${bg.id}-${bg.x}-${bg.y}-${bg.width}-${bg.height}-${bg.opacity}`).join(','), 
    [backgrounds]
  );

  const effectsSignature = useMemo(() => 
    effects.map(effect => `${effect.id}-${effect.x}-${effect.y}-${effect.intensity}-${effect.density}`).join(','), 
    [effects]
  );

  const tonesSignature = useMemo(() => 
    tones.map(tone => `${tone.id}-${tone.x}-${tone.y}-${tone.density}-${tone.opacity}`).join(','), 
    [tones]
  ); // 🆕 トーンの変更検知

  // 履歴保存関数（トーン対応）
  const saveToHistory = useCallback((
    newCharacters: Character[], 
    newBubbles: SpeechBubble[], 
    newPanels: Panel[], 
    newBackgrounds: BackgroundElement[],
    newEffects: EffectElement[],
    newTones: ToneElement[] // 🆕 トーン引数追加
  ) => {
    setOperationHistory(prev => {
      const newHistory = {
        characters: [...prev.characters.slice(0, prev.currentIndex + 1), [...newCharacters]],
        speechBubbles: [...prev.speechBubbles.slice(0, prev.currentIndex + 1), [...newBubbles]],
        panels: [...prev.panels.slice(0, prev.currentIndex + 1), [...newPanels]],
        backgrounds: [...prev.backgrounds.slice(0, prev.currentIndex + 1), [...newBackgrounds]],
        effects: [...prev.effects.slice(0, prev.currentIndex + 1), [...newEffects]],
        tones: [...prev.tones.slice(0, prev.currentIndex + 1), [...newTones]], // 🆕 トーン履歴追加
        currentIndex: prev.currentIndex + 1,
      };
      
      // 履歴上限管理
      if (newHistory.characters.length > 50) {
        newHistory.characters = newHistory.characters.slice(1);
        newHistory.speechBubbles = newHistory.speechBubbles.slice(1);
        newHistory.panels = newHistory.panels.slice(1);
        newHistory.backgrounds = newHistory.backgrounds.slice(1);
        newHistory.effects = newHistory.effects.slice(1);
        newHistory.tones = newHistory.tones.slice(1); // 🆕 トーン履歴管理
        newHistory.currentIndex = Math.max(0, newHistory.currentIndex - 1);
      }
      
      return newHistory;
    });
  }, []);

  // 履歴保存のタイミング（トーン対応）
  useEffect(() => {
    // 空の状態では履歴保存しない
    if (characters.length === 0 && speechBubbles.length === 0 && panels.length === 0 && 
        backgrounds.length === 0 && effects.length === 0 && tones.length === 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      saveToHistory(characters, speechBubbles, panels, backgrounds, effects, tones);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [charactersSignature, bubblesSignature, panelsSignature, backgroundsSignature, effectsSignature, tonesSignature, saveToHistory]);

  // アンドゥ/リドゥ処理（トーン対応）
  const handleUndo = useCallback(() => {
    if (operationHistory.currentIndex > 0) {
      const newIndex = operationHistory.currentIndex - 1;
      setCharacters([...operationHistory.characters[newIndex]]);
      setSpeechBubbles([...operationHistory.speechBubbles[newIndex]]);
      setPanels([...operationHistory.panels[newIndex]]);
      setBackgrounds([...operationHistory.backgrounds[newIndex]]);
      setEffects([...operationHistory.effects[newIndex]]);
      setTones([...operationHistory.tones[newIndex]]); // 🆕 トーンアンドゥ
      setOperationHistory(prev => ({ ...prev, currentIndex: newIndex }));
    }
  }, [operationHistory]);

  const handleRedo = useCallback(() => {
    if (operationHistory.currentIndex < operationHistory.characters.length - 1) {
      const newIndex = operationHistory.currentIndex + 1;
      setCharacters([...operationHistory.characters[newIndex]]);
      setSpeechBubbles([...operationHistory.speechBubbles[newIndex]]);
      setPanels([...operationHistory.panels[newIndex]]);
      setBackgrounds([...operationHistory.backgrounds[newIndex]]);
      setEffects([...operationHistory.effects[newIndex]]);
      setTones([...operationHistory.tones[newIndex]]); // 🆕 トーンリドゥ
      setOperationHistory(prev => ({ ...prev, currentIndex: newIndex }));
    }
  }, [operationHistory]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedCharacter) {
      const newCharacters = characters.filter(char => char.id !== selectedCharacter.id);
      setCharacters(newCharacters);
      setSelectedCharacter(null);
    }
  }, [selectedCharacter, characters]);

  // キーボードイベント処理（トーン対応）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleDeleteSelected();
      }
      
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        handleRedo();
      }
      
      if (e.key === 'e' && e.ctrlKey) {
        e.preventDefault();
        setIsPanelEditMode(prev => !prev);
      }

      // 背景パネル表示ショートカット
      if (e.key === 'b' && e.ctrlKey) {
        e.preventDefault();
        setShowBackgroundPanel(prev => !prev);
      }

      // 効果線パネル表示ショートカット
      if (e.key === 'f' && e.ctrlKey) {
        e.preventDefault();
        setShowEffectPanel(prev => !prev);
      }

      // 🆕 トーンパネル表示ショートカット
      if (e.key === 't' && e.ctrlKey) {
        e.preventDefault();
        setShowTonePanel(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDeleteSelected, handleUndo, handleRedo]);

  // スナップ設定ハンドラー
  const handleSnapToggle = useCallback(() => {
    setSnapSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  const handleGridSizeChange = useCallback((size: number) => {
    setSnapSettings(prev => ({ ...prev, gridSize: size }));
  }, []);

  const handleSensitivityChange = useCallback((sensitivity: 'weak' | 'medium' | 'strong') => {
    setSnapSettings(prev => ({ ...prev, sensitivity }));
  }, []);

  const handleGridDisplayChange = useCallback((display: 'always' | 'edit-only' | 'hidden') => {
    setSnapSettings(prev => ({ ...prev, gridDisplay: display }));
  }, []);

  // ダークモード切り替え
  const toggleTheme = useCallback(() => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute("data-theme", newTheme);
  }, [isDarkMode]);

  // テンプレート変更処理（トーンクリア対応）
  const handleTemplateClick = useCallback((template: string) => {
    setSelectedTemplate(template);
    setSelectedCharacter(null);
    setSelectedPanel(null);
    setSelectedEffect(null);
    setSelectedTone(null); // 🆕 トーン選択もクリア
    
    const newPanels = [...templates[template].panels];
    setPanels(newPanels);
    
    setCharacters([]);
    setSpeechBubbles([]);
    setBackgrounds([]);
    setEffects([]);
    setTones([]); // 🆕 トーンもクリア
  }, []);

  // シーンテンプレート適用
  const handleSceneClick = useCallback((sceneType: string) => {
    if (!panels || panels.length === 0) {
      return;
    }

    setSelectedScene(sceneType);
    
    const { characters: newCharacters, speechBubbles: newBubbles } = applySceneTemplate(
      sceneType,
      panels,
      characters,
      speechBubbles,
      selectedPanel
    );
    
    setCharacters(newCharacters);
    setSpeechBubbles(newBubbles);
  }, [panels, characters, speechBubbles, selectedPanel]);

  // キャラクター操作
  const handleCharacterClick = useCallback((charType: string) => {
    if (addCharacterFunc) {
      addCharacterFunc(charType);
    }
  }, [addCharacterFunc]);

  // 吹き出し操作
  const handleBubbleClick = useCallback((bubbleType: string) => {
    if (addBubbleFunc) {
      const text = dialogueText || "ダブルクリックで編集";
      addBubbleFunc(bubbleType, text);
      setDialogueText("");
    }
  }, [addBubbleFunc, dialogueText]);

  // キャラクター詳細更新
  const handleCharacterUpdate = useCallback((updatedCharacter: Character) => {
    setCharacters(prev => prev.map(char => 
      char.id === updatedCharacter.id ? updatedCharacter : char
    ));
    setSelectedCharacter(updatedCharacter);
  }, []);

  // キャラクター削除機能
  const handleCharacterDelete = useCallback((characterToDelete: Character) => {
    const newCharacters = characters.filter(char => char.id !== characterToDelete.id);
    setCharacters(newCharacters);
    setSelectedCharacter(null);
  }, [characters]);

  // キャラクター詳細パネルを閉じる
  const handleCharacterPanelClose = useCallback(() => {
    setSelectedCharacter(null);
  }, []);

  // パネル操作ハンドラー
  const handlePanelUpdate = useCallback((updatedPanels: Panel[]) => {
    setPanels(updatedPanels);
  }, []);

  // コマ追加機能
  const handlePanelAdd = useCallback((targetPanelId: string, position: 'above' | 'below' | 'left' | 'right') => {
    const targetPanel = panels.find(p => p.id.toString() === targetPanelId);
    if (!targetPanel) return;

    const maxId = Math.max(...panels.map(p => typeof p.id === 'string' ? parseInt(p.id) : p.id), 0);
    const newPanelId = maxId + 1;

    let newPanel: Panel;
    const spacing = 10;

    switch (position) {
      case 'above':
        newPanel = { id: newPanelId, x: targetPanel.x, y: targetPanel.y - targetPanel.height - spacing, width: targetPanel.width, height: targetPanel.height };
        break;
      case 'below':
        newPanel = { id: newPanelId, x: targetPanel.x, y: targetPanel.y + targetPanel.height + spacing, width: targetPanel.width, height: targetPanel.height };
        break;
      case 'left':
        newPanel = { id: newPanelId, x: targetPanel.x - targetPanel.width - spacing, y: targetPanel.y, width: targetPanel.width, height: targetPanel.height };
        break;
      case 'right':
        newPanel = { id: newPanelId, x: targetPanel.x + targetPanel.width + spacing, y: targetPanel.y, width: targetPanel.width, height: targetPanel.height };
        break;
      default:
        return;
    }

    setPanels(prevPanels => [...prevPanels, newPanel]);
    console.log(`✅ コマ追加完了: ${newPanelId} (${position})`);
  }, [panels]);

  // コマ削除機能（トーンも削除）
  const handlePanelDelete = useCallback((panelId: string) => {
    if (panels.length <= 1) {
      console.log(`⚠️ 最後のコマは削除できません`);
      return;
    }

    if (window.confirm(`コマ${panelId}を削除しますか？`)) {
      const panelIdNum = parseInt(panelId);
      setCharacters(prev => prev.filter(char => char.panelId !== panelIdNum));
      setSpeechBubbles(prev => prev.filter(bubble => bubble.panelId !== panelIdNum));
      setBackgrounds(prev => prev.filter(bg => bg.panelId !== panelIdNum));
      setEffects(prev => prev.filter(effect => effect.panelId !== panelIdNum));
      setTones(prev => prev.filter(tone => tone.panelId !== panelIdNum)); // 🆕 トーンも削除
      setPanels(prev => prev.filter(panel => panel.id !== panelIdNum));
      setSelectedPanel(null);
      setSelectedEffect(null);
      setSelectedTone(null); // 🆕 トーン選択もクリア
      console.log(`🗑️ コマ削除: ${panelId}`);
    }
  }, [panels.length]);

  // パネル分割機能（隙間付き版）
  const handlePanelSplit = useCallback((panelId: number, direction: "horizontal" | "vertical") => {
    const panelToSplit = panels.find(p => p.id === panelId);
    if (!panelToSplit) return;

    const gap = 10;
    const maxId = Math.max(...panels.map(p => p.id), 0);
    const newId = maxId + 1;

    let newPanels: Panel[];
    if (direction === "horizontal") {
      const availableHeight = panelToSplit.height - gap;
      const halfHeight = availableHeight / 2;
      
      const topPanel: Panel = {
        ...panelToSplit,
        height: halfHeight,
      };
      const bottomPanel: Panel = {
        ...panelToSplit,
        id: newId,
        y: panelToSplit.y + halfHeight + gap,
        height: halfHeight,
      };
      newPanels = panels.map(p => p.id === panelId ? topPanel : p).concat([bottomPanel]);
    } else {
      const availableWidth = panelToSplit.width - gap;
      const halfWidth = availableWidth / 2;
      
      const leftPanel: Panel = {
        ...panelToSplit,
        width: halfWidth,
      };
      const rightPanel: Panel = {
        ...panelToSplit,
        id: newId,
        x: panelToSplit.x + halfWidth + gap,
        width: halfWidth,
      };
      newPanels = panels.map(p => p.id === panelId ? leftPanel : p).concat([rightPanel]);
    }

    setPanels(newPanels);
    console.log(`${direction}分割完了（隙間: ${gap}px）`);
  }, [panels]);

  // 全てクリア機能（トーン対応）
  const handleClearAll = useCallback(() => {
    if (window.confirm("全ての要素をクリアしますか？")) {
      setCharacters([]);
      setSpeechBubbles([]);
      setBackgrounds([]);
      setEffects([]);
      setTones([]); // 🆕 トーンもクリア
      setSelectedCharacter(null);
      setSelectedPanel(null);
      setSelectedEffect(null);
      setSelectedTone(null); // 🆕 トーン選択もクリア
    }
  }, []);

  // エクスポート機能
  const handleExport = useCallback((format: string) => {
    alert(`${format}でのエクスポート機能は実装予定です`);
  }, []);

  const handleCharacterRightClick = useCallback((character: Character) => {
    setSelectedCharacter(character);
    setShowCharacterPanel(true);
  }, []);

  // 編集モード切り替え関数
  const handlePanelEditModeToggle = (enabled: boolean) => {
    setIsPanelEditMode(enabled);
  };

  // 背景テンプレート適用ハンドラー
  const handleBackgroundAdd = useCallback((template: BackgroundTemplate) => {
    console.log(`背景テンプレート「${template.name}」を適用しました`);
  }, []);

  // 効果線テンプレート適用ハンドラー
  const handleEffectAdd = useCallback((effect: EffectElement) => {
    setEffects([...effects, effect]);
    setSelectedEffect(effect);
    console.log(`効果線「${effect.type}」を追加しました`);
  }, [effects]);

  const handleEffectUpdate = useCallback((updatedEffect: EffectElement) => {
    setEffects(prev => prev.map(effect => 
      effect.id === updatedEffect.id ? updatedEffect : effect
    ));
    setSelectedEffect(updatedEffect);
  }, []);

  // 🆕 トーンテンプレート適用ハンドラー
  const handleToneAdd = useCallback((tone: ToneElement) => {
    setTones([...tones, tone]);
    setSelectedTone(tone);
    console.log(`トーン「${tone.type}」を追加しました`);
  }, [tones]);

  const handleToneUpdate = useCallback((updatedTone: ToneElement) => {
    setTones(prev => prev.map(tone => 
      tone.id === updatedTone.id ? updatedTone : tone
    ));
    setSelectedTone(updatedTone);
  }, []);

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
      {/* ヘッダー */}
      <header className="header">
        <h1>📖 ネーム制作ツール</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button 
            className={`control-btn ${isPanelEditMode ? 'active' : ''}`}
            onClick={() => setIsPanelEditMode(!isPanelEditMode)}
            title="コマ編集モード (Ctrl+E)"
            style={{
              background: isPanelEditMode ? "#ff8833" : "var(--bg-tertiary)",
              color: isPanelEditMode ? "white" : "var(--text-primary)",
              border: `1px solid ${isPanelEditMode ? "#ff8833" : "var(--border-color)"}`,
            }}
          >
            🔧 {isPanelEditMode ? "編集中" : "編集"}
          </button>

          {/* 背景ボタン */}
          <button 
            className="control-btn"
            onClick={() => setShowBackgroundPanel(true)}
            title="背景設定 (Ctrl+B)"
            style={{
              background: backgrounds.length > 0 ? "#9c27b0" : "var(--bg-tertiary)",
              color: backgrounds.length > 0 ? "white" : "var(--text-primary)",
              border: `1px solid ${backgrounds.length > 0 ? "#9c27b0" : "var(--border-color)"}`,
            }}
          >
            🎨 背景
            {backgrounds.length > 0 && <span style={{ marginLeft: "4px" }}>({backgrounds.length})</span>}
          </button>

          {/* 効果線ボタン */}
          <button 
            className="control-btn"
            onClick={() => setShowEffectPanel(true)}
            title="効果線設定 (Ctrl+F)"
            style={{
              background: effects.length > 0 ? "#ff5722" : "var(--bg-tertiary)",
              color: effects.length > 0 ? "white" : "var(--text-primary)",
              border: `1px solid ${effects.length > 0 ? "#ff5722" : "var(--border-color)"}`,
            }}
          >
            ⚡ 効果線
            {effects.length > 0 && <span style={{ marginLeft: "4px" }}>({effects.length})</span>}
          </button>

          {/* 🆕 トーンボタン */}
          <button 
            className="control-btn"
            onClick={() => setShowTonePanel(true)}
            title="トーン設定 (Ctrl+T)"
            style={{
              background: tones.length > 0 ? "#795548" : "var(--bg-tertiary)",
              color: tones.length > 0 ? "white" : "var(--text-primary)",
              border: `1px solid ${tones.length > 0 ? "#795548" : "var(--border-color)"}`,
            }}
          >
            🎯 トーン
            {tones.length > 0 && <span style={{ marginLeft: "4px" }}>({tones.length})</span>}
          </button>

          {/* プロジェクトボタン */}
          <button 
            className="control-btn"
            onClick={() => setShowProjectPanel(true)}
            title="プロジェクト管理"
            style={{
              background: projectSave.hasUnsavedChanges ? "#ff6b6b" : "var(--bg-tertiary)",
              color: projectSave.hasUnsavedChanges ? "white" : "var(--text-primary)",
              border: `1px solid ${projectSave.hasUnsavedChanges ? "#ff6b6b" : "var(--border-color)"}`,
            }}
          >
            💾 プロジェクト
            {projectSave.hasUnsavedChanges && <span style={{ marginLeft: "4px" }}>●</span>}
          </button>

          {/* スナップ設定UI */}
          <button 
            className={`control-btn ${snapSettings.enabled ? 'active' : ''}`}
            onClick={handleSnapToggle}
            title="スナップ機能のON/OFF"
            style={{
              background: snapSettings.enabled ? "#4CAF50" : "var(--bg-tertiary)",
              color: snapSettings.enabled ? "white" : "var(--text-primary)",
              border: `1px solid ${snapSettings.enabled ? "#4CAF50" : "var(--border-color)"}`,
            }}
          >
            ✅ スナップ
          </button>

          <select 
            value={snapSettings.gridSize}
            onChange={(e) => handleGridSizeChange(Number(e.target.value))}
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              fontSize: "12px",
            }}
            title="グリッドサイズ"
          >
            <option value={10}>10px</option>
            <option value={20}>20px</option>
            <option value={40}>40px</option>
          </select>

          <select 
            value={snapSettings.sensitivity}
            onChange={(e) => handleSensitivityChange(e.target.value as 'weak' | 'medium' | 'strong')}
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              fontSize: "12px",
            }}
            title="スナップ感度"
          >
            <option value="weak">弱</option>
            <option value="medium">中</option>
            <option value="strong">強</option>
          </select>

          <select 
            value={snapSettings.gridDisplay}
            onChange={(e) => handleGridDisplayChange(e.target.value as 'always' | 'edit-only' | 'hidden')}
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              fontSize: "12px",
            }}
            title="グリッド表示"
          >
            <option value="always">📐 常時</option>
            <option value="edit-only">📐 編集時</option>
            <option value="hidden">📐 非表示</option>
          </select>
          
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            title={`${isDarkMode ? 'ライト' : 'ダーク'}モードに切り替え`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <div className="main-content">
        {/* 左サイドバー */}
        <div className="sidebar left-sidebar">
          {/* パネルテンプレート */}
          <div className="section">
            <h3>📐 パネルテンプレート</h3>
            <div className="template-grid">
              {Object.keys(templates).map((template) => (
                <div
                  key={template}
                  className={`template-card ${selectedTemplate === template ? 'selected' : ''}`}
                  onClick={() => handleTemplateClick(template)}
                >
                  <div className="template-preview">
                    {templates[template].panels.length}コマ
                  </div>
                  <span>{template}</span>
                </div>
              ))}
            </div>
            <div className="section-info">
              ✨ キャラクターと吹き出しも自動配置されます
            </div>
          </div>

          {/* コマ操作パネル */}
          {isPanelEditMode && (
            <div className="section" style={{ 
              border: "2px solid #ff8833",
              background: "var(--bg-tertiary)",
            }}>
              <h3>🔧 コマ操作</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <button 
                  className="btn btn-secondary"
                  onClick={handleClearAll}
                  title="全要素をクリア"
                >
                  🧹 全クリア
                </button>
                <div style={{ 
                  fontSize: "11px", 
                  color: "var(--text-muted)",
                  padding: "8px",
                  background: "var(--bg-primary)",
                  borderRadius: "4px",
                  lineHeight: "1.4",
                }}>
                  <strong>操作方法:</strong><br/>
                  • コマを選択してハンドルで操作<br/>
                  • 🔵 移動 / 🟧 リサイズ / 🟣 分割<br/>
                  • Ctrl+E でモード切替
                </div>
              </div>
            </div>
          )}

          {/* シーンテンプレート */}
          <div className="section">
            <h3>🎭 シーンテンプレート</h3>
            <div className="scene-grid">
              {[
                { key: 'daily', icon: '🌅', name: '日常' },
                { key: 'dialogue', icon: '💬', name: '会話' },
                { key: 'action', icon: '⚡', name: 'アクション' },
                { key: 'emotional', icon: '😢', name: '感情' },
                { key: 'comedy', icon: '😄', name: 'コメディ' },
                { key: 'romance', icon: '💕', name: '恋愛' },
                { key: 'tension', icon: '😰', name: '緊張' },
                { key: 'surprise', icon: '😲', name: '驚き' },
              ].map((scene) => (
                <div
                  key={scene.key}
                  className={`scene-card ${selectedScene === scene.key ? 'selected' : ''}`}
                  onClick={() => handleSceneClick(scene.key)}
                  title={`${scene.name}シーン`}
                >
                  <div className="scene-icon">
                    {scene.icon}
                  </div>
                  <span>{scene.name}</span>
                </div>
              ))}
            </div>
            <div className="scene-info">
              💡 キャラクターと吹き出しが自動配置されます
            </div>
          </div>
        </div>

        {/* メインエリア */}
        <div className="canvas-area">
          {/* キャンバス上部コントロール */}
          <div className="canvas-controls">
            <div className="undo-redo-buttons">
              <button 
                className="control-btn"
                onClick={handleUndo}
                disabled={operationHistory.currentIndex <= 0}
                title="元に戻す (Ctrl+Z)"
              >
                ↶ 戻す
              </button>
              <button 
                className="control-btn"
                onClick={handleRedo}
                disabled={operationHistory.currentIndex >= operationHistory.characters.length - 1}
                title="やり直し (Ctrl+Y)"
              >
                ↷ 進む
              </button>
              <button 
                className="control-btn delete-btn"
                onClick={handleDeleteSelected}
                disabled={!selectedCharacter}
                title="選択要素を削除 (Backspace)"
              >
                🗑️ 削除
              </button>
            </div>
            <div className="canvas-info">
              操作履歴: {operationHistory.currentIndex + 1} / {operationHistory.characters.length}
              {selectedCharacter && <span> | 選択中: {selectedCharacter.name}</span>}
              {selectedPanel && <span> | パネル{selectedPanel.id}選択中</span>}
              {selectedEffect && <span> | 効果線選択中</span>}
              {selectedTone && <span> | トーン選択中</span>} {/* 🆕 トーン選択状態表示 */}
              {isPanelEditMode && <span> | 🔧 コマ編集モード</span>}
              {snapSettings.enabled && <span> | ⚙️ スナップ: {snapSettings.gridSize}px ({snapSettings.sensitivity})</span>}
              {projectSave.isAutoSaving && <span> | 💾 自動保存中...</span>}
              {projectSave.hasUnsavedChanges && <span> | ⚠️ 未保存</span>}
              {backgrounds.length > 0 && <span> | 🎨 背景: {backgrounds.length}個</span>}
              {effects.length > 0 && <span> | ⚡ 効果線: {effects.length}個</span>}
              {tones.length > 0 && <span> | 🎯 トーン: {tones.length}個</span>} {/* 🆕 トーン状態表示 */}
            </div>
          </div>

          {/* キャンバス */}
          <CanvasComponent
            ref={canvasRef}
            selectedTemplate={selectedTemplate}
            panels={panels}
            setPanels={handlePanelUpdate}
            characters={characters}
            setCharacters={setCharacters}
            speechBubbles={speechBubbles}
            setSpeechBubbles={setSpeechBubbles}
            backgrounds={backgrounds}
            setBackgrounds={setBackgrounds}
            effects={effects}
            setEffects={setEffects}
            // 🆕 トーン関連プロパティ追加（これが不足していた）
            tones={tones}
            setTones={setTones}
            selectedTone={selectedTone}
            onToneSelect={setSelectedTone}
            showTonePanel={showTonePanel}
            onTonePanelToggle={() => setShowTonePanel(!showTonePanel)}
            // 既存のプロパティ
            onCharacterAdd={(func: (type: string) => void) => setAddCharacterFunc(() => func)}
            onBubbleAdd={(func: (type: string, text: string) => void) => setAddBubbleFunc(() => func)}
            onPanelSelect={(panel: Panel | null) => setSelectedPanel(panel)}
            onCharacterSelect={(character: Character | null) => setSelectedCharacter(character)}
            onCharacterRightClick={handleCharacterRightClick}
            isPanelEditMode={isPanelEditMode}
            onPanelSplit={handlePanelSplit}
            onPanelEditModeToggle={handlePanelEditModeToggle}
            onPanelAdd={handlePanelAdd}
            onPanelDelete={handlePanelDelete}
            snapSettings={snapSettings}
          />
        </div>

        {/* 右サイドバー */}
        <div className="sidebar right-sidebar">
          {/* キャラクター */}
          <div className="section">
            <h3>👥 キャラクター</h3>
            <div className="character-grid">
              {[
                { type: 'hero', icon: '🦸‍♂️', name: '主人公' },
                { type: 'heroine', icon: '🦸‍♀️', name: 'ヒロイン' },
                { type: 'rival', icon: '😤', name: 'ライバル' },
                { type: 'friend', icon: '😊', name: '友人' }
              ].map((char) => (
                <div
                  key={char.type}
                  className="char-btn"
                  onClick={() => handleCharacterClick(char.type)}
                >
                  <div className="char-icon">{char.icon}</div>
                  <span>{char.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* セリフ・吹き出し */}
          <div className="section">
            <h3>💬 セリフ・吹き出し</h3>
            <textarea 
              className="dialogue-input" 
              placeholder="セリフを入力してください..."
              value={dialogueText}
              onChange={(e) => setDialogueText(e.target.value)}
            />
            
            <div className="bubble-types">
              {[
                { id: 'normal', icon: '💬', name: '普通' },
                { id: 'shout', icon: '❗', name: '叫び' },
                { id: 'whisper', icon: '💭', name: '小声' },
                { id: 'thought', icon: '☁️', name: '心の声' }
              ].map(bubble => (
                <div 
                  key={bubble.id}
                  className="bubble-btn"
                  onClick={() => handleBubbleClick(bubble.name)}
                >
                  {bubble.icon} {bubble.name}
                </div>
              ))}
            </div>
          </div>

          {/* 背景セクション */}
          <div className="section">
            <h3>🎨 背景</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <button 
                className="btn btn-primary"
                onClick={() => setShowBackgroundPanel(true)}
                title="背景設定パネルを開く (Ctrl+B)"
                style={{
                  background: "var(--accent-color)",
                  color: "white",
                  border: "1px solid var(--accent-color)",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                🎨 背景設定
              </button>
              
              {backgrounds.length > 0 && (
                <div style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  padding: "8px",
                  fontSize: "12px",
                  color: "var(--text-muted)"
                }}>
                  <strong>現在の背景:</strong><br/>
                  {backgrounds.length}個の背景要素
                  <br/>
                  <small>• パネルを選択して背景設定</small>
                </div>
              )}
              
              {selectedPanel && (
                <div style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--accent-color)",
                  borderRadius: "6px",
                  padding: "8px",
                  fontSize: "12px",
                  color: "var(--accent-color)"
                }}>
                  📍 パネル{selectedPanel.id}選択中<br/>
                  <small>背景設定パネルから背景を追加できます</small>
                </div>
              )}
            </div>
          </div>

          {/* 効果線セクション */}
          <div className="section">
            <h3>⚡ 効果線</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <button 
                className="btn btn-primary"
                onClick={() => setShowEffectPanel(true)}
                title="効果線設定パネルを開く (Ctrl+F)"
                style={{
                  background: "var(--accent-color)",
                  color: "white",
                  border: "1px solid var(--accent-color)",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                ⚡ 効果線設定
              </button>
              
              {effects.length > 0 && (
                <div style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  padding: "8px",
                  fontSize: "12px",
                  color: "var(--text-muted)"
                }}>
                  <strong>現在の効果線:</strong><br/>
                  {effects.length}個の効果線要素
                  <br/>
                  <small>• パネルを選択して効果線設定</small>
                </div>
              )}
              
              {selectedPanel && (
                <div style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--accent-color)",
                  borderRadius: "6px",
                  padding: "8px",
                  fontSize: "12px",
                  color: "var(--accent-color)"
                }}>
                  📍 パネル{selectedPanel.id}選択中<br/>
                  <small>効果線設定パネルから効果線を追加できます</small>
                </div>
              )}
            </div>
          </div>

          {/* 🆕 トーンセクション */}
          <div className="section">
            <h3>🎯 トーン</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <button 
                className="btn btn-primary"
                onClick={() => setShowTonePanel(true)}
                title="トーン設定パネルを開く (Ctrl+T)"
                style={{
                  background: "var(--accent-color)",
                  color: "white",
                  border: "1px solid var(--accent-color)",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                🎯 トーン設定
              </button>
              
              {tones.length > 0 && (
                <div style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  padding: "8px",
                  fontSize: "12px",
                  color: "var(--text-muted)"
                }}>
                  <strong>現在のトーン:</strong><br/>
                  {tones.length}個のトーン要素
                  <br/>
                  <small>• パネルを選択してトーン設定</small>
                </div>
              )}
              
              {selectedPanel && (
                <div style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--accent-color)",
                  borderRadius: "6px",
                  padding: "8px",
                  fontSize: "12px",
                  color: "var(--accent-color)"
                }}>
                  📍 パネル{selectedPanel.id}選択中<br/>
                  <small>トーン設定パネルからトーンを追加できます</small>
                </div>
              )}
            </div>
          </div>

          {/* 出力 */}
          <div className="section">
            <h3>📤 出力</h3>
            <ExportPanel
              panels={panels}
              characters={characters}
              bubbles={speechBubbles}
              backgrounds={backgrounds}
              effects={effects}
              tones={tones} // 🆕 トーンデータも出力対象に
              canvasRef={canvasRef}
            />
          </div>
        </div>
      </div>

      {/* キャラクター詳細パネル */}
      {showCharacterPanel && selectedCharacter && (
        <CharacterDetailPanel
          selectedCharacter={selectedCharacter}
          onCharacterUpdate={handleCharacterUpdate}
          onCharacterDelete={handleCharacterDelete}
          onClose={handleCharacterPanelClose}
        />
      )}

      {/* 背景設定パネル */}
      <BackgroundPanel
        isOpen={showBackgroundPanel}
        onClose={() => setShowBackgroundPanel(false)}
        backgrounds={backgrounds}
        setBackgrounds={setBackgrounds}
        selectedPanel={selectedPanel}
        onBackgroundAdd={handleBackgroundAdd}
      />

      {/* 効果線設定パネル */}
      <EffectPanel
        isOpen={showEffectPanel}
        onClose={() => setShowEffectPanel(false)}
        onAddEffect={handleEffectAdd}
        selectedEffect={selectedEffect}
        onUpdateEffect={handleEffectUpdate}
        isDarkMode={isDarkMode}
        selectedPanel={selectedPanel}
        effects={effects}
      />

      {/* 🆕 トーン設定パネル */}
      <TonePanel
        isOpen={showTonePanel}
        onClose={() => setShowTonePanel(false)}
        onAddTone={handleToneAdd}
        selectedTone={selectedTone}
        onUpdateTone={handleToneUpdate}
        isDarkMode={isDarkMode}
        selectedPanel={selectedPanel}
        tones={tones}
      />

      {/* プロジェクト管理パネル */}
      <ProjectPanel
        isOpen={showProjectPanel}
        onClose={() => setShowProjectPanel(false)}
        onLoadProject={(projectId) => {
          const project = projectSave.loadProject(projectId);
          if (project) {
            setPanels(project.data.panels);
            setCharacters(project.data.characters);
            setSpeechBubbles(project.data.bubbles);
            setBackgrounds(project.data.backgrounds || []);
            setEffects(project.data.effects || []);
            setTones(project.data.tones || []); // 🆕 トーンデータも復元
            // 設定も復元
            setSnapSettings(prev => ({
              ...prev,
              enabled: project.data.settings.snapEnabled,
              gridSize: project.data.settings.snapSize
            }));
            setIsDarkMode(project.data.settings.darkMode);
            // テーマも更新
            document.documentElement.setAttribute("data-theme", project.data.settings.darkMode ? "dark" : "light");
          }
        }}
        onNewProject={() => {
          projectSave.newProject();
          setPanels([]);
          setCharacters([]);
          setSpeechBubbles([]);
          setBackgrounds([]);
          setEffects([]);
          setTones([]); // 🆕 トーンもクリア
          setSelectedCharacter(null);
          setSelectedPanel(null);
          setSelectedEffect(null);
          setSelectedTone(null); // 🆕 トーン選択もクリア
        }}
        currentProjectId={projectSave.currentProjectId}
        saveStatus={projectSave.saveStatus}
        onSaveProject={projectSave.saveProject}
      />
    </div>
  );
}

export default App;