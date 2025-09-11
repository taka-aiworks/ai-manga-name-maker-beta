// src/types.ts - キャラクターリサイズ対応版

export interface Panel {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Character {
  id: string;
  panelId: number;
  type: string;
  name: string;
  x: number; // パネル内の相対位置 (0-1) または絶対座標
  y: number; // パネル内の相対位置 (0-1) または絶対座標
  scale: number;
  
  // 🆕 縦横自由リサイズ用プロパティ追加
  width?: number;  // 幅（省略時はscaleから計算）
  height?: number; // 高さ（省略時はscaleから計算）
  
  // 旧システム（一時的に残す）
  facing: string;
  gaze: string;
  pose: string;
  expression: string;
  
  // 新システム
  bodyDirection: "front" | "left" | "right" | "back" | "leftFront" | "rightFront" | "leftBack" | "rightBack";
  faceExpression: "normal" | "smile" | "sad" | "angry" | "surprised" | "embarrassed" | "worried" | "sleepy";
  bodyPose: "standing" | "sitting" | "walking" | "running" | "pointing" | "waving" | "thinking" | "arms_crossed";
  eyeDirection: "front" | "left" | "right" | "up" | "down"; // 5方向に簡略化
  
  viewType: "face" | "halfBody" | "fullBody";
  
  // 後方互換性のため残す（将来削除予定）
  faceAngle: "front" | "left" | "right" | "back" | "leftFront" | "rightFront" | "leftBack" | "rightBack";
  
  isGlobalPosition: boolean;
}

export interface SpeechBubble {
  id: string;
  panelId: number;
  type: string;
  text: string;
  x: number;
  y: number;
  scale: number;
  width: number;
  height: number;
  vertical: boolean;
  isGlobalPosition: boolean;
}

// CanvasComponent のプロパティ型（スナップ設定対応）
export interface CanvasComponentProps {
  selectedTemplate: string;
  panels: Panel[];
  setPanels: (panels: Panel[]) => void;
  characters: Character[];
  setCharacters: (characters: Character[]) => void;
  speechBubbles: SpeechBubble[];
  setSpeechBubbles: (speechBubbles: SpeechBubble[]) => void;
  onCharacterAdd: (func: (type: string) => void) => void;
  onBubbleAdd: (func: (type: string, text: string) => void) => void;
  onPanelSelect?: (panel: Panel | null) => void;
  onCharacterSelect?: (character: Character | null) => void;
  onCharacterRightClick?: (character: Character) => void;
  isPanelEditMode?: boolean; // コマ編集モード
  onPanelSplit?: (panelId: number, direction: "horizontal" | "vertical") => void; // 分割ハンドラー
  onPanelEditModeToggle?: (enabled: boolean) => void;
  onPanelAdd?: (targetPanelId: string, position: 'above' | 'below' | 'left' | 'right') => void;
  onPanelDelete?: (panelId: string) => void;
  // 🆕 スナップ設定を追加
  snapSettings?: SnapSettings;
}

// テンプレート定義の型
export interface Template {
  panels: Panel[];
}

export type Templates = Record<string, Template>;

// シーン情報の型
export interface SceneInfo {
  id: string;
  icon: string;
  name: string;
}

// キャラクター情報の型
export interface CharacterInfo {
  id: string;
  icon: string;
  name: string;
}

// 吹き出し情報の型
export interface BubbleInfo {
  id: string;
  icon: string;
  name: string;
}

// テンプレート情報の型
export interface TemplateInfo {
  id: string;
  title: string;
  desc: string;
}

// パネル操作関連の型
export interface PanelHandle {
  type: "resize" | "move" | "split" | "delete"; // 🔧 delete追加
  direction?: "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";
  x: number;
  y: number;
}

export interface PanelOperation {
  type: "move" | "resize" | "split";
  panelId: number;
  data: any;
}

// 履歴管理の型
export interface OperationHistory {
  characters: Character[][];
  speechBubbles: SpeechBubble[][];
  panels: Panel[][];
  currentIndex: number;
}

// 🆕 スナップ設定の型定義
export interface SnapSettings {
  enabled: boolean;
  gridSize: number;
  sensitivity: 'weak' | 'medium' | 'strong';
  gridDisplay: 'always' | 'edit-only' | 'hidden';
}