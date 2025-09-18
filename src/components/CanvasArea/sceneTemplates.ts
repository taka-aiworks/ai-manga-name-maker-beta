// src/components/CanvasArea/sceneTemplates.ts - 辞書対応版（修正版）
import { Character, SpeechBubble, BackgroundElement, EffectElement, ToneElement } from "../../types";

export interface EnhancedSceneTemplate {
  name: string;
  description: string;
  category: 'basic' | 'emotion' | 'action' | 'daily' | 'special';
  characters: Omit<Character, "id">[];
  speechBubbles: Omit<SpeechBubble, "id">[];
  backgrounds?: Omit<BackgroundElement, "id">[];
  effects?: Omit<EffectElement, "id">[];
  tones?: Omit<ToneElement, "id">[];
}

// 辞書データ取得ヘルパー
const getDictionaryData = () => {
  if (typeof window !== 'undefined' && window.DEFAULT_SFW_DICT?.SFW) {
    return window.DEFAULT_SFW_DICT.SFW;
  }
  
  // フォールバック辞書（正しい辞書タグ使用）
  return {
    expressions: [
      { tag: "smiling", label: "笑顔" },
      { tag: "sad", label: "悲しい" },
      { tag: "angry", label: "怒り" },
      { tag: "surprised", label: "驚き" },
      { tag: "worried", label: "心配" },
      { tag: "neutral_expression", label: "普通" }
    ],
    pose_manga: [
      { tag: "standing", label: "立ち" },
      { tag: "sitting", label: "座り" },
      { tag: "walking", label: "歩く" },
      { tag: "running", label: "走る" },
      { tag: "arms_crossed", label: "腕組み" },
      { tag: "pointing", label: "指差し" },
      { tag: "waving", label: "手を振る" }
    ],
    gaze: [
      { tag: "looking_at_viewer", label: "正面" },
      { tag: "looking_to_the_side", label: "横向き" },
      { tag: "looking_away", label: "そっぽ向く" },
      { tag: "looking_down", label: "下向き" },
      { tag: "looking_up", label: "上向き" }
    ]
  };
};

// ==========================================
// 辞書ベース動的シーンテンプレート生成
// ==========================================

// 基本シーン生成関数
const createBaseScene = (
  sceneName: string,
  description: string,
  category: EnhancedSceneTemplate['category'],
  characterConfigs: Array<{
    type: string;
    name: string;
    expression: string;
    action: string;
    facing: string;
    viewType: "face" | "upper_body" | "full_body";
    position: { x: number; y: number }; // 相対位置（0-1）
    scale: number;
  }>,
  bubbleConfigs: Array<{
    type: string;
    text: string;
    position: { x: number; y: number }; // 相対位置（0-1）
    size: { width: number; height: number };
  }>,
  backgroundConfig?: {
    type: 'solid' | 'gradient';
    colors: string[];
    opacity: number;
  },
  effectConfig?: {
    type: 'speed' | 'focus' | 'explosion' | 'flash';
    position: { x: number; y: number; width: number; height: number }; // 相対位置
    intensity: number;
    direction: string;
  },
  toneConfig?: {
    pattern: string;
    density: number;
    opacity: number;
    coverage: { x: number; y: number; width: number; height: number }; // 相対位置
  }
): EnhancedSceneTemplate => {
  // キャラクター生成
  const characters = characterConfigs.map((config, index) => ({
    panelId: 1,
    characterId: `character_${index + 1}`, // 汎用的なID: character_1, character_2, ...
    type: `character_${index + 1}`,        // typeも汎用的に
    name: config.name,
    x: config.position.x * 600, // 相対→絶対座標変換（600px基準）
    y: config.position.y * 300, // 相対→絶対座標変換（300px基準）
    scale: config.scale,
    facing: config.facing,
    expression: config.expression,
    action: config.action,
    viewType: config.viewType,
    isGlobalPosition: false,
  } as Omit<Character, "id">));

  // 吹き出し生成
  const speechBubbles = bubbleConfigs.map((config) => ({
    panelId: 1,
    type: config.type,
    text: config.text,
    x: config.position.x * 600,
    y: config.position.y * 300,
    scale: 1.0,
    width: config.size.width,
    height: config.size.height,
    vertical: true,
    isGlobalPosition: false,
  } as Omit<SpeechBubble, "id">));

  // 背景生成（コマ全体にフィット）
  const backgrounds: Omit<BackgroundElement, "id">[] = backgroundConfig ? [{
    panelId: 1,
    type: backgroundConfig.type,
    x: 0,
    y: 0,
    width: 600, // コマ幅にぴったり
    height: 300, // コマ高さにぴったり
    rotation: 0,
    zIndex: -10,
    opacity: backgroundConfig.opacity,
    solidColor: backgroundConfig.type === 'solid' ? backgroundConfig.colors[0] : undefined,
    gradientType: backgroundConfig.type === 'gradient' ? 'linear' : undefined,
    gradientColors: backgroundConfig.type === 'gradient' ? backgroundConfig.colors : undefined,
    gradientDirection: 90,
  }] : [];

  // 効果線生成（コマサイズに合わせて配置）
  const effects: Omit<EffectElement, "id">[] = effectConfig ? [{
    panelId: 1,
    type: effectConfig.type as any,
    x: effectConfig.position.x * 600,
    y: effectConfig.position.y * 300,
    width: effectConfig.position.width * 600,
    height: effectConfig.position.height * 300,
    direction: effectConfig.direction as any,
    intensity: effectConfig.intensity,
    density: 0.7,
    length: 30,
    angle: 0,
    color: "#333333",
    opacity: 0.6,
    blur: 0,
    selected: false,
    zIndex: 5,
    isGlobalPosition: false,
  }] : [];

  // トーン生成（コマ全体または指定範囲にフィット）
  const tones: Omit<ToneElement, "id">[] = toneConfig ? [{
    panelId: 1,
    type: "halftone",
    pattern: toneConfig.pattern as any,
    x: toneConfig.coverage.x,
    y: toneConfig.coverage.y,
    width: toneConfig.coverage.width,
    height: toneConfig.coverage.height,
    density: toneConfig.density,
    opacity: toneConfig.opacity,
    rotation: 0,
    scale: 1.0,
    blendMode: "multiply",
    contrast: 1.0,
    brightness: 0,
    invert: false,
    maskEnabled: false,
    maskShape: "rectangle",
    maskFeather: 0,
    selected: false,
    zIndex: 3,
    isGlobalPosition: false,
    visible: true,
  }] : [];

  return {
    name: sceneName,
    description: description,
    category: category,
    characters: characters,
    speechBubbles: speechBubbles,
    backgrounds: backgrounds,
    effects: effects,
    tones: tones,
  };
};

// ==========================================
// 辞書データ活用の豊富なシーンテンプレート
// ==========================================

// 感情カテゴリのシーン
export const createEmotionScenes = (): Record<string, EnhancedSceneTemplate> => {
  return {
    // 😊 嬉しいシーン
    happy_scene: createBaseScene(
      "😊 嬉しいシーン",
      "キャラクターが喜んでいるシーン",
      'emotion',
      [{
        type: "character_1", // 汎用的なtype
        name: "主人公",
        expression: "smiling",  // 辞書対応: happy → smiling
        action: "standing",
        facing: "looking_at_viewer",  // 辞書対応: at_viewer → looking_at_viewer
        viewType: "upper_body",
        position: { x: 0.5, y: 0.6 },
        scale: 2.2
      }],
      [{
        type: "普通",
        text: "やったー！",
        position: { x: 0.15, y: 0.15 },
        size: { width: 80, height: 60 }
      }],
      {
        type: 'gradient',
        colors: ['#fffacd', '#ffebcd'],
        opacity: 0.3
      },
      {
        type: 'flash',
        position: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 },
        intensity: 0.6,
        direction: 'radial'
      }
    ),

    // 😢 悲しいシーン
    sad_scene: createBaseScene(
      "😢 悲しいシーン",
      "キャラクターが悲しんでいるシーン",
      'emotion',
      [{
        type: "character_1", // 汎用的なtype
        name: "ヒロイン",
        expression: "sad",
        action: "sitting",
        facing: "looking_down",  // 辞書対応: down → looking_down
        viewType: "upper_body",
        position: { x: 0.5, y: 0.65 },
        scale: 2.0
      }],
      [{
        type: "心の声",
        text: "つらい...",
        position: { x: 0.7, y: 0.2 },
        size: { width: 70, height: 50 }
      }],
      {
        type: 'solid',
        colors: ['#e6f3ff'],
        opacity: 0.4
      },
      undefined,
      {
        pattern: 'dots_85',
        density: 0.3,
        opacity: 0.4,
        coverage: { x: 0, y: 0, width: 600, height: 300 }
      }
    ),

    // 😡 怒りシーン
    angry_scene: createBaseScene(
      "😡 怒りシーン",
      "キャラクターが怒っているシーン",
      'emotion',
      [{
        type: "character_1",
        name: "主人公",
        expression: "angry",
        action: "arms_crossed",
        facing: "looking_at_viewer",  // 辞書対応
        viewType: "upper_body",
        position: { x: 0.5, y: 0.6 },
        scale: 2.3
      }],
      [{
        type: "叫び",
        text: "許さない！",
        position: { x: 0.15, y: 0.1 },
        size: { width: 90, height: 70 }
      }],
      {
        type: 'gradient',
        colors: ['#ffe4e1', '#ffcccb'],
        opacity: 0.4
      },
      {
        type: 'explosion',
        position: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
        intensity: 0.8,
        direction: 'radial'
      }
    ),

    // 😲 驚きシーン（改良版）
    surprise_enhanced: createBaseScene(
      "😲 大驚きシーン",
      "キャラクターが大きく驚くシーン",
      'emotion',
      [{
        type: "character_1",
        name: "主人公",
        expression: "surprised",
        action: "standing",
        facing: "looking_at_viewer",  // 辞書対応
        viewType: "face",
        position: { x: 0.5, y: 0.6 },
        scale: 2.8
      }],
      [{
        type: "叫び",
        text: "えええ！？",
        position: { x: 0.1, y: 0.05 },
        size: { width: 100, height: 80 }
      }],
      undefined,
      {
        type: 'focus',
        position: { x: 0.15, y: 0.15, width: 0.7, height: 0.7 },
        intensity: 0.9,
        direction: 'radial'
      }
    ),

    // 😟 心配シーン
    worried_scene: createBaseScene(
      "😟 心配シーン",
      "キャラクターが心配しているシーン",
      'emotion',
      [{
        type: "character_1",
        name: "ヒロイン",
        expression: "worried",
        action: "standing",
        facing: "looking_away",  // 辞書対応: away → looking_away
        viewType: "upper_body",
        position: { x: 0.5, y: 0.6 },
        scale: 2.1
      }],
      [{
        type: "心の声",
        text: "大丈夫かな...",
        position: { x: 0.65, y: 0.15 },
        size: { width: 85, height: 65 }
      }],
      {
        type: 'solid',
        colors: ['#f0f8ff'],
        opacity: 0.3
      },
      undefined,
      {
        pattern: 'lines_diagonal',
        density: 0.2,
        opacity: 0.3,
        coverage: { x: 0, y: 0, width: 600, height: 200 }
      }
    )
  };
};

// アクションカテゴリのシーン
export const createActionScenes = (): Record<string, EnhancedSceneTemplate> => {
  return {
    // 🏃 走るシーン
    running_scene: createBaseScene(
      "🏃 走るシーン",
      "キャラクターが走っているシーン",
      'action',
      [{
        type: "character_1",
        name: "主人公",
        expression: "neutral_expression",
        action: "running",
        facing: "looking_to_the_side",  // 辞書対応: to_side → looking_to_the_side
        viewType: "full_body",
        position: { x: 0.4, y: 0.7 },
        scale: 2.0
      }],
      [{
        type: "叫び",
        text: "急がなきゃ！",
        position: { x: 0.1, y: 0.1 },
        size: { width: 85, height: 60 }
      }],
      undefined,
      {
        type: 'speed',
        position: { x: 0.05, y: 0.3, width: 0.5, height: 0.4 },
        intensity: 0.8,
        direction: 'horizontal'
      }
    ),

    // 👉 指差しシーン
    pointing_scene: createBaseScene(
      "👉 指差しシーン",
      "キャラクターが何かを指差すシーン",
      'action',
      [{
        type: "character_1",
        name: "主人公",
        expression: "surprised",
        action: "pointing",
        facing: "looking_to_the_side",  // 辞書対応
        viewType: "upper_body",
        position: { x: 0.4, y: 0.6 },
        scale: 2.2
      }],
      [{
        type: "普通",
        text: "あそこだ！",
        position: { x: 0.1, y: 0.15 },
        size: { width: 75, height: 55 }
      }],
      {
        type: 'gradient',
        colors: ['#f0ffff', '#e0ffff'],
        opacity: 0.2
      },
      {
        type: 'focus',
        position: { x: 0.6, y: 0.2, width: 0.3, height: 0.6 },
        intensity: 0.5,
        direction: 'radial'
      }
    ),

    // 🤝 握手シーン
    handshake_scene: createBaseScene(
      "🤝 握手シーン",
      "二人が握手するシーン",
      'action',
      [
        {
          type: "character_1",
          name: "主人公",
          expression: "smiling",
          action: "standing",
          facing: "looking_to_the_side",  // 辞書対応
          viewType: "upper_body",
          position: { x: 0.3, y: 0.6 },
          scale: 1.8
        },
        {
          type: "character_2",
          name: "ヒロイン",
          expression: "smiling",
          action: "standing",
          facing: "looking_to_the_side",  // 辞書対応
          viewType: "upper_body",
          position: { x: 0.7, y: 0.6 },
          scale: 1.8
        }
      ],
      [{
        type: "普通",
        text: "よろしく！",
        position: { x: 0.4, y: 0.1 },
        size: { width: 80, height: 60 }
      }],
      {
        type: 'gradient',
        colors: ['#fffaf0', '#fff8dc'],
        opacity: 0.3
      }
    )
  };
};

// 日常カテゴリのシーン
export const createDailyScenes = (): Record<string, EnhancedSceneTemplate> => {
  return {
    // 🍽️ 食事シーン
    eating_scene: createBaseScene(
      "🍽️ 食事シーン",
      "キャラクターが食事しているシーン",
      'daily',
      [{
        type: "character_1",
        name: "ヒロイン",
        expression: "smiling",  // 辞書対応: happy → smiling
        action: "sitting",
        facing: "looking_at_viewer",  // 辞書対応
        viewType: "upper_body",
        position: { x: 0.5, y: 0.65 },
        scale: 2.0
      }],
      [{
        type: "普通",
        text: "美味しい♪",
        position: { x: 0.15, y: 0.15 },
        size: { width: 80, height: 60 }
      }],
      {
        type: 'solid',
        colors: ['#fafafa'],
        opacity: 0.3
      },
      undefined,
      {
        pattern: 'dots_120',
        density: 0.15,
        opacity: 0.2,
        coverage: { x: 0, y: 200, width: 600, height: 100 }
      }
    ),

    // 📚 勉強シーン
    studying_scene: createBaseScene(
      "📚 勉強シーン",
      "キャラクターが勉強しているシーン",
      'daily',
      [{
        type: "character_1",
        name: "主人公",
        expression: "neutral_expression",
        action: "sitting",
        facing: "looking_down",  // 辞書対応
        viewType: "upper_body",
        position: { x: 0.5, y: 0.7 },
        scale: 2.0
      }],
      [{
        type: "心の声",
        text: "集中集中...",
        position: { x: 0.65, y: 0.2 },
        size: { width: 75, height: 55 }
      }],
      {
        type: 'solid',
        colors: ['#f5f5f5'],
        opacity: 0.4
      },
      undefined,
      {
        pattern: 'lines_horizontal',
        density: 0.1,
        opacity: 0.15,
        coverage: { x: 0, y: 0, width: 600, height: 300 }
      }
    ),

    // 💬 基本会話（改良版）
    conversation_enhanced: createBaseScene(
      "💬 基本会話",
      "二人の日常的な会話シーン",
      'daily',
      [
        {
          type: "character_1",
          name: "主人公",
          expression: "smiling",
          action: "standing",
          facing: "looking_to_the_side",  // 辞書対応
          viewType: "upper_body",
          position: { x: 0.25, y: 0.6 },
          scale: 2.0
        },
        {
          type: "character_2",
          name: "ヒロイン",
          expression: "smiling",
          action: "standing",
          facing: "looking_to_the_side",  // 辞書対応
          viewType: "upper_body",
          position: { x: 0.75, y: 0.6 },
          scale: 2.0
        }
      ],
      [
        {
          type: "普通",
          text: "おはよう",
          position: { x: 0.05, y: 0.15 },
          size: { width: 70, height: 50 }
        },
        {
          type: "普通",
          text: "おはよう♪",
          position: { x: 0.82, y: 0.15 },
          size: { width: 75, height: 50 }
        }
      ],
      {
        type: 'gradient',
        colors: ['#ffffff', '#f8f8ff'],
        opacity: 0.2
      }
    )
  };
};

// 特殊カテゴリのシーン
export const createSpecialScenes = (): Record<string, EnhancedSceneTemplate> => {
  return {
    // ✨ 魔法シーン
    magic_scene: createBaseScene(
      "✨ 魔法シーン",
      "魔法を使っているシーン",
      'special',
      [{
        type: "character_1",
        name: "魔法使い",
        expression: "neutral_expression",
        action: "standing",
        facing: "looking_at_viewer",  // 辞書対応
        viewType: "full_body",
        position: { x: 0.5, y: 0.7 },
        scale: 2.0
      }],
      [{
        type: "普通",
        text: "エイッ！",
        position: { x: 0.15, y: 0.1 },
        size: { width: 60, height: 50 }
      }],
      {
        type: 'gradient',
        colors: ['#e6e6fa', '#dda0dd'],
        opacity: 0.4
      },
      {
        type: 'flash',
        position: { x: 0.3, y: 0.2, width: 0.4, height: 0.6 },
        intensity: 0.7,
        direction: 'radial'
      },
      {
        pattern: 'dots_60',
        density: 0.2,
        opacity: 0.3,
        coverage: { x: 100, y: 50, width: 400, height: 200 }
      }
    ),

    // 🌟 決意シーン
    determination_scene: createBaseScene(
      "🌟 決意シーン",
      "キャラクターが決意を固めるシーン",
      'special',
      [{
        type: "character_1",
        name: "主人公",
        expression: "neutral_expression",
        action: "arms_crossed",
        facing: "looking_at_viewer",  // 辞書対応
        viewType: "upper_body",
        position: { x: 0.5, y: 0.6 },
        scale: 2.4
      }],
      [{
        type: "心の声",
        text: "やってやる！",
        position: { x: 0.65, y: 0.15 },
        size: { width: 90, height: 65 }
      }],
      {
        type: 'gradient',
        colors: ['#fffacd', '#ffd700'],
        opacity: 0.3
      },
      {
        type: 'focus',
        position: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 },
        intensity: 0.6,
        direction: 'radial'
      }
    )
  };
};

// ==========================================
// 統合・管理関数（辞書対応版）
// ==========================================

// 全シーンテンプレート取得（辞書ベース + 既存）
export const getAllSceneTemplates = (): Record<string, EnhancedSceneTemplate> => {
  const emotionScenes = createEmotionScenes();
  const actionScenes = createActionScenes();
  const dailyScenes = createDailyScenes();
  const specialScenes = createSpecialScenes();
  
  return {
    // 辞書ベーステンプレート
    ...emotionScenes,
    ...actionScenes,
    ...dailyScenes,
    ...specialScenes,
    
    // 既存テンプレート（後方互換性）
    basic_dialogue: {
      name: "💬 基本会話（旧）",
      description: "2人の会話シーン（従来版）",
      category: 'basic',
      characters: [
        {
          panelId: 1,
          characterId: "character_1", // 汎用的なID
          type: "character_1",
          name: "主人公",
          x: 150,
          y: 180,
          scale: 2.0,
          facing: "looking_to_the_side",  // 辞書対応
          expression: "neutral_expression",
          action: "standing",
          viewType: "upper_body",
          isGlobalPosition: false,
        },
        {
          panelId: 1,
          characterId: "character_2", // 汎用的なID
          type: "character_2", 
          name: "ヒロイン",
          x: 450,
          y: 180,
          scale: 2.0,
          facing: "looking_to_the_side",  // 辞書対応
          expression: "neutral_expression",
          action: "standing",
          viewType: "upper_body",
          isGlobalPosition: false,
        },
      ],
      speechBubbles: [
        {
          panelId: 1,
          type: "普通",
          text: "こんにちは",
          x: 100,
          y: 50,
          scale: 1.0,
          width: 80,
          height: 60,
          vertical: true,
          isGlobalPosition: false,
        },
        {
          panelId: 1,
          type: "普通",
          text: "こんにちは",
          x: 500,
          y: 50,
          scale: 1.0,
          width: 80,
          height: 60,
          vertical: true,
          isGlobalPosition: false,
        },
      ],
    } as EnhancedSceneTemplate
  };
};

// カテゴリ別取得（拡張版）
export const getTemplatesByCategory = (category: EnhancedSceneTemplate['category']): Record<string, EnhancedSceneTemplate> => {
  const allTemplates = getAllSceneTemplates();
  const filtered: Record<string, EnhancedSceneTemplate> = {};
  
  Object.entries(allTemplates).forEach(([key, template]) => {
    if (template.category === category) {
      filtered[key] = template;
    }
  });
  
  return filtered;
};

// 統合テンプレート適用関数（コマフィット版）
// 🔧 既存Character型対応版 - applyEnhancedSceneTemplate関数の修正
export const applyEnhancedSceneTemplate = (
  templateKey: string,
  panels: any[],
  existingCharacters: any[],
  existingSpeechBubbles: any[],
  existingBackgrounds: any[],
  existingEffects: any[],
  existingTones: any[],
  selectedPanel?: any
): {
  characters: any[];
  speechBubbles: any[];
  backgrounds: any[];
  effects: any[];
  tones: any[];
} => {
  const template = getAllSceneTemplates()[templateKey];
  if (!template || panels.length === 0) {
    console.error(`❌ テンプレート適用失敗: ${templateKey}`);
    return {
      characters: existingCharacters,
      speechBubbles: existingSpeechBubbles,
      backgrounds: existingBackgrounds,
      effects: existingEffects,
      tones: existingTones,
    };
  }

  const targetPanel = selectedPanel || panels[0];
  console.log(`🎭 座標修正版テンプレート適用: ${template.name} → パネル${targetPanel.id}`);
  console.log(`📐 パネル情報:`, { x: targetPanel.x, y: targetPanel.y, width: targetPanel.width, height: targetPanel.height });

  // 🔧 既存のパネル内要素をクリア
  const filteredCharacters = existingCharacters.filter(char => char.panelId !== targetPanel.id);
  const filteredBubbles = existingSpeechBubbles.filter(bubble => bubble.panelId !== targetPanel.id);
  const filteredBackgrounds = existingBackgrounds.filter(bg => bg.panelId !== targetPanel.id);
  const filteredEffects = existingEffects.filter(effect => effect.panelId !== targetPanel.id);
  const filteredTones = existingTones.filter(tone => tone.panelId !== targetPanel.id);

  // 🔧 キャラクター生成（既存型のみ使用・エラー回避）
  const newCharacters = template.characters.map((char, index) => {
    const uniqueId = `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${index}`;
    
    // 🔧 座標を相対座標（0-1）に正規化
    let relativeX, relativeY;
    
    if (char.x <= 1 && char.y <= 1) {
      // 既に相対座標の場合（0-1の範囲）
      relativeX = char.x;
      relativeY = char.y;
    } else {
      // 絶対座標の場合（600x300基準で相対座標に変換）
      relativeX = char.x / 600;
      relativeY = char.y / 300;
    }
    
    console.log(`👤 キャラクター生成: ${char.name}`);
    console.log(`   テンプレート座標: (${char.x}, ${char.y})`);
    console.log(`   相対座標: (${relativeX.toFixed(3)}, ${relativeY.toFixed(3)})`);
    
    // 🔧 viewType の正規化（型安全・文字列比較修正）
    let normalizedViewType: "face" | "upper_body" | "full_body" = "upper_body";
    const viewTypeString = String(char.viewType); // any型を文字列に変換
    
    if (viewTypeString === "face") {
      normalizedViewType = "face";
    } else if (viewTypeString === "upper_body" || viewTypeString === "halfBody") {
      normalizedViewType = "upper_body";
    } else if (viewTypeString === "full_body" || viewTypeString === "fullBody") {
      normalizedViewType = "full_body";
    }
    
    // 🔧 既存Character型のプロパティのみ使用
    const newCharacter: any = {
      id: uniqueId,
      panelId: targetPanel.id,
      characterId: char.characterId || char.type || `character_${index + 1}`,
      
      // 配置情報
      x: relativeX,      // 🔧 相対座標で保存
      y: relativeY,      // 🔧 相対座標で保存
      width: char.width || 80,
      height: char.height || 120,
      scale: char.scale || 1.8,
      rotation: char.rotation || 0,
      isGlobalPosition: char.isGlobalPosition ?? false,
      
      // 既存型の必須プロパティのみ
      name: char.name || "キャラクター",
      type: char.type || `character_${index + 1}`,
      expression: char.expression || "neutral_expression",
      action: char.action || "standing",
      facing: char.facing || "looking_at_viewer",
      viewType: normalizedViewType,
    };
    
    // 🔧 既存型のオプショナルプロパティのみ
    // eyeState, mouthState, handGesture のみ設定
    if (char.expression === "surprised") {
      newCharacter.eyeState = "wide";
    }
    if (char.expression === "sad") {
      newCharacter.mouthState = "frown";
    }
    if (char.action === "pointing") {
      newCharacter.handGesture = "pointing";
    }
    
    return newCharacter;
  });

  // 🔧 吹き出し生成（位置を適切に調整）
  const newSpeechBubbles = template.speechBubbles.map((bubble, index) => {
    const uniqueId = `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${index}`;
    
    // 🔧 吹き出し位置の計算を改善
    let relativeX, relativeY;
    
    if (bubble.x <= 1 && bubble.y <= 1) {
      // 既に相対座標の場合
      relativeX = bubble.x;
      relativeY = bubble.y;
    } else {
      // 絶対座標の場合：より適切な位置に調整
      relativeX = bubble.x / 600;
      relativeY = bubble.y / 300;
      
      // 🔧 位置が左端すぎる場合は中央寄りに調整
      if (relativeX < 0.2) {
        relativeX = 0.4; // 中央寄り
      }
      if (relativeY < 0.1) {
        relativeY = 0.15; // 上端から少し下
      }
    }
    
    // 🔧 キャラクターの右隣に配置するロジック
    if (template.characters.length > 0) {
      const firstChar = template.characters[0];
      let charRelativeX, charRelativeY;
      
      if (firstChar.x <= 1) {
        charRelativeX = firstChar.x;
        charRelativeY = firstChar.y;
      } else {
        charRelativeX = firstChar.x / 600;
        charRelativeY = firstChar.y / 300;
      }
      
      // キャラクターの右隣に配置（重ならないように調整）
      if (index === 0) {
        relativeX = Math.min(charRelativeX + 0.3, 0.85); // 右隣、パネル端は避ける
        relativeY = Math.max(charRelativeY - 0.2, 0.05); // 少し上、パネル上端は避ける
      } else if (index === 1) {
        relativeX = Math.max(charRelativeX - 0.25, 0.05); // 左隣
        relativeY = Math.max(charRelativeY - 0.15, 0.05); // 少し上
      } else {
        // 3個目以降は中央上部
        relativeX = 0.5;
        relativeY = 0.1;
      }
    } else {
      // キャラクターがいない場合は中央に
      relativeX = 0.5;
      relativeY = 0.2;
    }
    
    console.log(`💬 吹き出し生成: "${bubble.text}"`);
    console.log(`   元座標: (${bubble.x}, ${bubble.y})`);
    console.log(`   調整後相対座標: (${relativeX.toFixed(3)}, ${relativeY.toFixed(3)})`);
    
    return {
      ...bubble,
      id: uniqueId,
      panelId: targetPanel.id,
      x: relativeX,      // 🔧 調整済み相対座標
      y: relativeY,      // 🔧 調整済み相対座標
      type: bubble.type || "普通",
      text: bubble.text || "",
      width: bubble.width || 80,
      height: bubble.height || 60,
      scale: bubble.scale || 1.0,
      vertical: bubble.vertical ?? true,
      isGlobalPosition: bubble.isGlobalPosition ?? false,
    };
  });

  // 🔧 背景生成（パネル全体にフィット）
  const newBackgrounds = (template.backgrounds || []).map((bg, index) => {
    const uniqueId = `bg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${index}`;
    
    console.log(`🎨 背景生成: ${bg.type}`);
    
    return {
      ...bg,
      id: uniqueId,
      panelId: targetPanel.id,
      x: 0,    // 🔧 パネル全体を覆う相対座標
      y: 0,    // 🔧 パネル全体を覆う相対座標
      width: 1,  // 🔧 パネル幅の100%
      height: 1, // 🔧 パネル高さの100%
    };
  });

  // 🔧 効果線生成（相対座標で配置）
  const newEffects = (template.effects || []).map((effect, index) => {
    const uniqueId = `effect_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${index}`;
    
    // 座標を相対座標に正規化
    let relativeX, relativeY, relativeWidth, relativeHeight;
    
    if (effect.x <= 1 && effect.y <= 1) {
      // 既に相対座標の場合
      relativeX = effect.x;
      relativeY = effect.y;
      relativeWidth = effect.width <= 1 ? effect.width : effect.width / 600;
      relativeHeight = effect.height <= 1 ? effect.height : effect.height / 300;
    } else {
      // 絶対座標の場合
      relativeX = effect.x / 600;
      relativeY = effect.y / 300;
      relativeWidth = effect.width / 600;
      relativeHeight = effect.height / 300;
    }
    
    console.log(`⚡ 効果線生成: ${effect.type} (${relativeX.toFixed(3)}, ${relativeY.toFixed(3)})`);
    
    return {
      ...effect,
      id: uniqueId,
      panelId: targetPanel.id,
      x: relativeX,      // 🔧 相対座標
      y: relativeY,      // 🔧 相対座標
      width: relativeWidth,  // 🔧 相対サイズ
      height: relativeHeight, // 🔧 相対サイズ
    };
  });

  // 🔧 トーン生成（相対座標で配置）
  const newTones = (template.tones || []).map((tone, index) => {
    const uniqueId = `tone_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${index}`;
    
    // 座標を相対座標に正規化
    let relativeX, relativeY, relativeWidth, relativeHeight;
    
    if (tone.x <= 1 && tone.y <= 1) {
      // 既に相対座標の場合
      relativeX = tone.x;
      relativeY = tone.y;
      relativeWidth = tone.width <= 1 ? tone.width : tone.width / 600;
      relativeHeight = tone.height <= 1 ? tone.height : tone.height / 300;
    } else {
      // 絶対座標の場合
      relativeX = tone.x / 600;
      relativeY = tone.y / 300;
      relativeWidth = tone.width / 600;
      relativeHeight = tone.height / 300;
    }
    
    console.log(`🎯 トーン生成: ${tone.pattern} (${relativeX.toFixed(3)}, ${relativeY.toFixed(3)})`);
    
    return {
      ...tone,
      id: uniqueId,
      panelId: targetPanel.id,
      x: relativeX,      // 🔧 相対座標
      y: relativeY,      // 🔧 相対座標
      width: relativeWidth,  // 🔧 相対サイズ
      height: relativeHeight, // 🔧 相対サイズ
    };
  });

  console.log(`✅ 座標修正版要素追加完了:`);
  console.log(`   キャラクター: ${newCharacters.length}個`);
  console.log(`   吹き出し: ${newSpeechBubbles.length}個`);
  console.log(`   背景: ${newBackgrounds.length}個`);
  console.log(`   効果線: ${newEffects.length}個`);
  console.log(`   トーン: ${newTones.length}個`);

  return {
    characters: [...filteredCharacters, ...newCharacters],
    speechBubbles: [...filteredBubbles, ...newSpeechBubbles], 
    backgrounds: [...filteredBackgrounds, ...newBackgrounds],
    effects: [...filteredEffects, ...newEffects],
    tones: [...filteredTones, ...newTones],
  };
};

// ==========================================
// 後方互換性のための既存関数（維持）
// ==========================================

export interface SceneTemplate {
  characters: Omit<Character, "id">[];
  speechBubbles: Omit<SpeechBubble, "id">[];
}

export const sceneTemplates: Record<string, SceneTemplate> = {
  daily: {
    characters: [
      {
        panelId: 1,
        characterId: "character_1",
        type: "character_1",
        name: "主人公",
        x: 150,
        y: 180,
        scale: 2.0,
        facing: "looking_to_the_side",
        expression: "neutral_expression",
        action: "standing",
        viewType: "upper_body",
        isGlobalPosition: false,
      }
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "普通",
        text: "こんにちは",
        x: 100,
        y: 50,
        scale: 1.0,
        width: 80,
        height: 60,
        vertical: true,
        isGlobalPosition: false,
      }
    ],
  },
  action: {
    characters: [
      {
        panelId: 1,
        characterId: "character_1",
        type: "character_1",
        name: "主人公",
        x: 200,
        y: 200,
        scale: 2.3,
        facing: "looking_to_the_side",
        expression: "neutral_expression",
        action: "running",
        viewType: "full_body",
        isGlobalPosition: false,
      }
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "叫び",
        text: "行くぞ！",
        x: 100,
        y: 50,
        scale: 1.1,
        width: 70,
        height: 60,
        vertical: true,
        isGlobalPosition: false,
      }
    ],
  },
  emotional: {
    characters: [
      {
        panelId: 1,
        characterId: "character_1",
        type: "character_1",
        name: "ヒロイン",
        x: 270,
        y: 180,
        scale: 2.2,
        facing: "looking_down",
        expression: "worried",
        action: "standing",
        viewType: "upper_body",
        isGlobalPosition: false,
      }
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "心の声",
        text: "どうしよう...",
        x: 400,
        y: 80,
        scale: 1.0,
        width: 90,
        height: 70,
        vertical: true,
        isGlobalPosition: false,
      }
    ],
  },
  surprise: {
    characters: [
      {
        panelId: 1,
        characterId: "character_1",
        type: "character_1",
        name: "主人公",
        x: 300,
        y: 180,
        scale: 2.5,
        facing: "looking_at_viewer",
        expression: "surprised",
        action: "standing",
        viewType: "face",
        isGlobalPosition: false,
      }
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "叫び",
        text: "えっ！？",
        x: 150,
        y: 50,
        scale: 1.2,
        width: 80,
        height: 70,
        vertical: true,
        isGlobalPosition: false,
      }
    ],
  },
};

export const applySceneTemplate = (
  sceneType: string,
  panels: any[],
  existingCharacters: Character[],
  existingSpeechBubbles: SpeechBubble[],
  selectedPanel?: any
): { characters: Character[], speechBubbles: SpeechBubble[] } => {
  const template = sceneTemplates[sceneType];
  if (!template || panels.length === 0) {
    return { characters: existingCharacters, speechBubbles: existingSpeechBubbles };
  }

  const targetPanel = selectedPanel || panels[0];
  console.log(`🎭 後方互換テンプレート適用: ${sceneType} → パネル${targetPanel.id}`);

  const newCharacters = template.characters.map((char) => ({
    ...char,
    id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id,
    x: (char.x / 600) * targetPanel.width + targetPanel.x,
    y: (char.y / 300) * targetPanel.height + targetPanel.y,
  }));

  const newSpeechBubbles = template.speechBubbles.map((bubble) => ({
    ...bubble,
    id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id,
    x: (bubble.x / 600) * targetPanel.width + targetPanel.x,
    y: (bubble.y / 300) * targetPanel.height + targetPanel.y,
  }));

  return {
    characters: [...existingCharacters, ...newCharacters],
    speechBubbles: [...existingSpeechBubbles, ...newSpeechBubbles],
  };
};