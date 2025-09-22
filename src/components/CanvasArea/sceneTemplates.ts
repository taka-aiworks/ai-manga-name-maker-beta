// src/components/CanvasArea/sceneTemplates.ts - 統一ファクトリー版（超簡素化）

import { Character, SpeechBubble, BackgroundElement, EffectElement, ToneElement } from "../../types";
import { 
  scenePresets, 
  createUnifiedScene,
  addElementIds,
  characterPresets,
  bubblePresets,
  backgroundPresets,
  effectPresets,
  tonePresets,
  type UnifiedSceneConfig
} from "../../utils/elementFactory";

export interface EnhancedSceneTemplate {
  name: string;
  description: string;
  category: 'basic' | 'emotion' | 'action' | 'daily' | 'special';
  characters: Omit<Character, "id" | "panelId">[];
  speechBubbles: Omit<SpeechBubble, "id" | "panelId">[];
  backgrounds?: Omit<BackgroundElement, "id" | "panelId">[];
  effects?: Omit<EffectElement, "id" | "panelId">[];
  tones?: Omit<ToneElement, "id" | "panelId">[];
}

// ==========================================
// 🎯 統一ファクトリー版シーンテンプレート
// ==========================================

// 🔧 統一ファクトリーを使用したシーン生成（超簡素版）
const createFactoryScene = (
  name: string,
  description: string,
  category: EnhancedSceneTemplate['category'],
  config: UnifiedSceneConfig
): EnhancedSceneTemplate => {
  const scene = createUnifiedScene(config);
  
  return {
    name,
    description,
    category,
    characters: scene.characters,
    speechBubbles: scene.speechBubbles,
    backgrounds: scene.backgrounds,
    effects: scene.effects,
    tones: scene.tones,
  };
};

// ==========================================
// 🎭 感情カテゴリのシーン（統一ファクトリー版）
// ==========================================
export const createEmotionScenes = (): Record<string, EnhancedSceneTemplate> => {
  return {
    // 😊 基本的な嬉しいシーン
    happy_basic: createFactoryScene(
      "😊 嬉しい表情",
      "キャラクターの基本的な喜びの表現",
      'emotion',
      {
        characters: [{ preset: 'happy' }],
        bubbles: [{ preset: 'normal', text: 'やったー！' }],
        // 🔧 背景削除: ユーザーが手動選択
        effects: [{ preset: 'flash' }]
      }
    ),

    // 😢 悲しい・落ち込みシーン  
    sad_basic: createFactoryScene(
      "😢 悲しみ・落ち込み",
      "キャラクターの悲しい感情表現",
      'emotion',
      {
        characters: [{ preset: 'sad' }],
        bubbles: [{ preset: 'thought', text: 'つらい...' }],
        // 🔧 背景削除: ユーザーが手動選択
        tones: [{ preset: 'shadow' }]
      }
    ),

    // 😡 怒り・イライラシーン
    angry_basic: createFactoryScene(
      "😡 怒り・イライラ",
      "キャラクターの怒りの感情表現",
      'emotion',
      {
        characters: [{ preset: 'angry' }],
        bubbles: [{ preset: 'shout', text: 'もう！' }],
        // 🔧 背景削除: ユーザーが手動選択
        effects: [{ preset: 'explosion' }]
      }
    ),

    // 😲 驚き・ショックシーン
    surprise_basic: createFactoryScene(
      "😲 驚き・ショック", 
      "キャラクターの驚きの表現",
      'emotion',
      {
        characters: [{ 
          preset: 'surprised',
          overrides: { viewType: 'face', scale: 2.8 }
        }],
        bubbles: [{ 
          preset: 'shout', 
          text: 'えっ！？',
          overrides: { x: 0.1, y: 0.05, width: 100, height: 80 }
        }],
        effects: [{ preset: 'focus' }]
      }
    ),

    // 😰 心配・不安シーン
    worried_basic: createFactoryScene(
      "😰 心配・不安",
      "キャラクターの心配している表現", 
      'emotion',
      {
        characters: [{ preset: 'worried' }],
        bubbles: [{ 
          preset: 'thought', 
          text: '大丈夫かな...',
          overrides: { width: 85, height: 65 }
        }],
        // 🔧 背景削除: ユーザーが手動選択
        tones: [{ 
          preset: 'texture',
          overrides: { pattern: 'lines_diagonal', density: 0.2, opacity: 0.3 }
        }]
      }
    )
  };
};

// ==========================================
// ⚡ アクションカテゴリのシーン（統一ファクトリー版）
// ==========================================
export const createActionScenes = (): Record<string, EnhancedSceneTemplate> => {
  return {
    // 🏃 走る・急ぐシーン
    running_basic: createFactoryScene(
      "🏃 走る・急ぐ",
      "キャラクターが急いでいるシーン",
      'action',
      {
        characters: [{ preset: 'running' }],
        bubbles: [{ 
          preset: 'shout', 
          text: '急がなきゃ！',
          overrides: { x: 0.1, y: 0.1, width: 85, height: 60 }
        }],
        effects: [{ preset: 'speed_horizontal' }]
      }
    ),

    // 👉 指差し・発見シーン
    pointing_basic: createFactoryScene(
      "👉 指差し・発見",
      "何かを指差して発見するシーン",
      'action',
      {
        characters: [{ 
          preset: 'pointing',
          overrides: { x: 0.4, y: 0.6 }
        }],
        bubbles: [{ 
          preset: 'normal', 
          text: 'あそこだ！',
          overrides: { x: 0.1, y: 0.15, width: 75, height: 55 }
        }],
        // 🔧 背景削除: ユーザーが手動選択
        effects: [{ preset: 'focus' }]
      }
    ),

    // 💥 衝撃・ぶつかるシーン
    impact_basic: createFactoryScene(
      "💥 衝撃・ぶつかる",
      "衝撃や衝突の表現",
      'action',
      {
        characters: [{ 
          preset: 'surprised',
          overrides: { y: 0.7, scale: 2.1, viewType: 'upper_body' }
        }],
        bubbles: [{ 
          preset: 'shout', 
          text: 'うわー！',
          overrides: { x: 0.15, y: 0.1, width: 80, height: 65 }
        }],
        effects: [{ preset: 'explosion' }]
      }
    ),

    // 🤝 二人の会話・対話シーン
    dialogue_basic: createFactoryScene(
      "🤝 二人の対話",
      "二人のキャラクターの会話シーン",
      'action',
      {
        characters: [
          { preset: 'dialogue_left' },
          { preset: 'dialogue_right' }
        ],
        bubbles: [
          { preset: 'left', text: 'こんにちは' },
          { preset: 'right', text: 'こんにちは！' }
        ],
        background: { preset: 'calm' }
      }
    )
  };
};

// ==========================================
// 🏠 日常カテゴリのシーン（統一ファクトリー版）
// ==========================================
export const createDailyScenes = (): Record<string, EnhancedSceneTemplate> => {
  return {
    // 🍽️ 食べる・飲むシーン
    eating_basic: createFactoryScene(
      "🍽️ 食べる・飲む",
      "食事や飲み物のシーン",
      'daily',
      {
        characters: [{ preset: 'eating' }],
        bubbles: [{ 
          preset: 'normal', 
          text: '美味しい♪',
          overrides: { x: 0.15, y: 0.15 }
        }],
        // 🔧 背景削除: ユーザーが手動選択
        tones: [{ 
          preset: 'highlight',
          overrides: { pattern: 'dots_120', density: 0.15, opacity: 0.2 }
        }]
      }
    ),

    // 📱 電話・スマホシーン
    phone_basic: createFactoryScene(
      "📱 電話・スマホ",
      "電話やスマホを使うシーン",
      'daily',
      {
        characters: [{ preset: 'phone' }],
        bubbles: [{ 
          preset: 'normal', 
          text: 'もしもし',
          overrides: { x: 0.65, y: 0.2, width: 70, height: 50 }
        }]
        // 🔧 背景削除: ユーザーが手動選択
      }
    ),

    // 🚶 歩く・移動シーン
    walking_basic: createFactoryScene(
      "🚶 歩く・移動",
      "歩いたり移動したりするシーン",
      'daily',
      {
        characters: [{ preset: 'walking' }],
        bubbles: [{ 
          preset: 'thought', 
          text: 'さて...',
          overrides: { width: 60, height: 45 }
        }]
        // 🔧 背景削除: ユーザーが手動選択
      }
    ),

    // 💭 考える・悩むシーン
    thinking_basic: createFactoryScene(
      "💭 考える・悩む",
      "考え事や悩んでいるシーン",
      'daily',
      {
        characters: [{ preset: 'thoughtful' }],
        bubbles: [{ preset: 'thought', text: 'うーん...' }],
        // 🔧 背景削除: ユーザーが手動選択
        tones: [{ preset: 'texture' }]
      }
    )
  };
};

// ==========================================
// ✨ 特殊カテゴリのシーン（統一ファクトリー版）
// ==========================================
export const createSpecialScenes = (): Record<string, EnhancedSceneTemplate> => {
  return {
    // ✨ 決意・やる気シーン
    determination_basic: createFactoryScene(
      "✨ 決意・やる気",
      "決意を固めたりやる気を出すシーン",
      'special',
      {
        characters: [{ preset: 'determined' }],
        bubbles: [{ 
          preset: 'thought', 
          text: 'よし！',
          overrides: { width: 60, height: 50 }
        }],
        // 🔧 背景削除: ユーザーが手動選択
        effects: [{ preset: 'focus' }]
      }
    ),

    // 🌟 ひらめき・発見シーン
    idea_basic: createFactoryScene(
      "🌟 ひらめき・発見",
      "何かをひらめいたり発見したりするシーン",
      'special',
      {
        characters: [{ 
          preset: 'pointing',
          overrides: { 
            expression: 'surprised',
            facing: 'up',
            scale: 2.2
          }
        }],
        bubbles: [{ 
          preset: 'normal', 
          text: 'そうか！',
          overrides: { x: 0.15, y: 0.1, width: 70, height: 55 }
        }],
        // 🔧 背景削除: ユーザーが手動選択
        effects: [{ preset: 'flash' }]
      }
    ),

    // 😴 疲れ・眠いシーン
    tired_basic: createFactoryScene(
      "😴 疲れ・眠い",
      "疲れていたり眠かったりするシーン",
      'special',
      {
        characters: [{ 
          preset: 'sad', // 疲れた表情として代用
          overrides: { action: 'sitting', y: 0.65 }
        }],
        bubbles: [{ 
          preset: 'thought', 
          text: '眠い...',
          overrides: { width: 65, height: 50 }
        }],
        // 🔧 背景削除: ユーザーが手動選択
        tones: [{ 
          preset: 'mood',
          overrides: { pattern: 'dots_60', density: 0.2, opacity: 0.3 }
        }]
      }
    ),

    // 💪 頑張る・努力シーン
    effort_basic: createFactoryScene(
      "💪 頑張る・努力",
      "頑張ったり努力したりするシーン",
      'special',
      {
        characters: [{ 
          preset: 'determined',
          overrides: { scale: 2.3 }
        }],
        bubbles: [{ 
          preset: 'shout', 
          text: '頑張る！',
          overrides: { x: 0.15, y: 0.1, width: 80, height: 60 }
        }]
        // 🔧 背景削除: ユーザーが手動選択
      }
    )
  };
};

// ==========================================
// 🔧 統合・管理関数（統一ファクトリー版）
// ==========================================

// 全シーンテンプレート取得（統一ファクトリー版）
export const getAllSceneTemplates = (): Record<string, EnhancedSceneTemplate> => {
  const emotionScenes = createEmotionScenes();
  const actionScenes = createActionScenes();
  const dailyScenes = createDailyScenes();
  const specialScenes = createSpecialScenes();
  
  return {
    // 統一ファクトリー版テンプレート
    ...emotionScenes,
    ...actionScenes,
    ...dailyScenes,
    ...specialScenes,
  };
};

// カテゴリ別取得（統一ファクトリー版）
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

// 🔧 統一ファクトリー版シーンテンプレート適用関数（座標変換修正版）
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
  console.log(`🎭 統一ファクトリー版テンプレート適用: ${template.name} → パネル${targetPanel.id}`);

  // 既存のパネル内要素をクリア
  const filteredCharacters = existingCharacters.filter(char => char.panelId !== targetPanel.id);
  const filteredBubbles = existingSpeechBubbles.filter(bubble => bubble.panelId !== targetPanel.id);
  const filteredBackgrounds = existingBackgrounds.filter(bg => bg.panelId !== targetPanel.id);
  const filteredEffects = existingEffects.filter(effect => effect.panelId !== targetPanel.id);
  const filteredTones = existingTones.filter(tone => tone.panelId !== targetPanel.id);

  // 🔧 キャラクター生成（相対座標→絶対座標変換）
  const newCharacters = template.characters.map((char, index) => {
    const uniqueId = `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${index}`;
    
    // 🔧 相対座標→絶対座標変換
    const absoluteX = targetPanel.x + (char.x * targetPanel.width);
    const absoluteY = targetPanel.y + (char.y * targetPanel.height);
    
    console.log(`👤 キャラクター座標変換: ${char.name || 'キャラクター'}`);
    console.log(`   相対座標: (${char.x}, ${char.y}) → 絶対座標: (${absoluteX.toFixed(1)}, ${absoluteY.toFixed(1)})`);
    
    return {
      ...char,
      id: uniqueId,
      panelId: targetPanel.id,
      x: absoluteX,
      y: absoluteY,
      isGlobalPosition: true, // 絶対座標に変換済み
    };
  });

  // 🔧 吹き出し生成（相対座標→絶対座標変換）
  const newSpeechBubbles = template.speechBubbles.map((bubble, index) => {
    const uniqueId = `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${index}`;
    
    // 🔧 相対座標→絶対座標変換
    const absoluteX = targetPanel.x + (bubble.x * targetPanel.width);
    const absoluteY = targetPanel.y + (bubble.y * targetPanel.height);
    
    console.log(`💬 吹き出し座標変換: "${bubble.text}"`);
    console.log(`   相対座標: (${bubble.x}, ${bubble.y}) → 絶対座標: (${absoluteX.toFixed(1)}, ${absoluteY.toFixed(1)})`);
    
    return {
      ...bubble,
      id: uniqueId,
      panelId: targetPanel.id,
      x: absoluteX,
      y: absoluteY,
      isGlobalPosition: true, // 絶対座標に変換済み
    };
  });

  // 🔧 背景生成（相対座標のまま）
  const newBackgrounds = (template.backgrounds || []).map((bg, index) => {
    const uniqueId = `bg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${index}`;
    
    console.log(`🎨 背景生成: ${bg.type}`);
    console.log(`   相対座標: (${bg.x}, ${bg.y}, ${bg.width}, ${bg.height})`);
    
    return {
      ...bg,
      id: uniqueId,
      panelId: targetPanel.id,
      // 背景は相対座標のまま（パネル全体）
    };
  });

  // 🔧 効果線生成（相対座標のまま）
  const newEffects = (template.effects || []).map((effect, index) => {
    const uniqueId = `effect_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${index}`;
    
    console.log(`⚡ 効果線生成: ${effect.type}`);
    
    return {
      ...effect,
      id: uniqueId,
      panelId: targetPanel.id,
      selected: false,
      isGlobalPosition: false, // 効果線は相対座標
    };
  });

  // 🔧 トーン生成（相対座標のまま）
  const newTones = (template.tones || []).map((tone, index) => {
    const uniqueId = `tone_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${index}`;
    
    console.log(`🎯 トーン生成: ${tone.pattern}`);
    
    return {
      ...tone,
      id: uniqueId,
      panelId: targetPanel.id,
      selected: false,
      isGlobalPosition: false, // トーンは相対座標
      visible: true,
    };
  });

  console.log(`✅ 統一ファクトリー版で要素生成完了:`);
  console.log(`   キャラクター: ${newCharacters.length}個（絶対座標・編集可能）`);
  console.log(`   吹き出し: ${newSpeechBubbles.length}個（絶対座標・編集可能）`);
  console.log(`   背景: ${newBackgrounds.length}個（相対座標）`);
  console.log(`   効果線: ${newEffects.length}個（相対座標）`);
  console.log(`   トーン: ${newTones.length}個（相対座標）`);

  return {
    characters: [...filteredCharacters, ...newCharacters],
    speechBubbles: [...filteredBubbles, ...newSpeechBubbles],
    backgrounds: [...filteredBackgrounds, ...newBackgrounds],
    effects: [...filteredEffects, ...newEffects],
    tones: [...filteredTones, ...newTones],
  };
};

// ==========================================
// 後方互換性のための既存関数（修正版）
// ==========================================

export interface SceneTemplate {
  characters: Omit<Character, "id" | "panelId">[];
  speechBubbles: Omit<SpeechBubble, "id" | "panelId">[];
}

// 🔧 後方互換用（統一ファクトリーベースに変更）
export const sceneTemplates: Record<string, SceneTemplate> = {
  daily: {
    characters: [characterPresets.happy({
      characterId: "character_1",
      type: "character_1",
      name: "主人公",
      x: 0.25,
      y: 0.6,
      scale: 2.0,
      viewType: "upper_body",
    })],
    speechBubbles: [bubblePresets.normal("こんにちは", {
      x: 0.167,
      y: 0.167,
      width: 80,
      height: 60
    })]
  },
  
  action: {
    characters: [characterPresets.running({
      characterId: "character_1",
      type: "character_1",
      name: "主人公",
      x: 0.333,
      y: 0.667,
      scale: 2.3,
      viewType: "full_body",
    })],
    speechBubbles: [bubblePresets.shout("行くぞ！", {
      x: 0.167,
      y: 0.167,
      width: 70,
      height: 60
    })]
  },
  
  emotional: {
    characters: [characterPresets.worried({
      characterId: "character_1",
      type: "character_1",
      name: "ヒロイン",
      x: 0.45,
      y: 0.6,
      scale: 2.2,
      viewType: "upper_body",
    })],
    speechBubbles: [bubblePresets.thought("どうしよう...", {
      x: 0.667,
      y: 0.267,
      width: 90,
      height: 70
    })]
  },
  
  surprise: {
    characters: [characterPresets.surprised({
      characterId: "character_1",
      type: "character_1",
      name: "主人公",
      x: 0.5,
      y: 0.6,
      scale: 2.5,
      viewType: "face",
    })],
    speechBubbles: [bubblePresets.shout("えっ！？", {
      x: 0.25,
      y: 0.167,
      scale: 1.2,
      width: 80,
      height: 70
    })]
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

  // 🔧 相対座標→絶対座標変換付きで生成
  const newCharacters = template.characters.map((char, index) => {
    const uniqueId = `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${index}`;
    
    // 🔧 相対座標→絶対座標変換
    const absoluteX = targetPanel.x + (char.x * targetPanel.width);
    const absoluteY = targetPanel.y + (char.y * targetPanel.height);
    
    return {
      ...char,
      id: uniqueId,
      panelId: targetPanel.id,
      x: absoluteX,
      y: absoluteY,
      isGlobalPosition: true,
    };
  });

  const newSpeechBubbles = template.speechBubbles.map((bubble, index) => {
    const uniqueId = `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${index}`;
    
    // 🔧 相対座標→絶対座標変換
    const absoluteX = targetPanel.x + (bubble.x * targetPanel.width);
    const absoluteY = targetPanel.y + (bubble.y * targetPanel.height);
    
    return {
      ...bubble,
      id: uniqueId,
      panelId: targetPanel.id,
      x: absoluteX,
      y: absoluteY,
      isGlobalPosition: true,
    };
  });

  return {
    characters: [...existingCharacters, ...newCharacters],
    speechBubbles: [...existingSpeechBubbles, ...newSpeechBubbles],
  };
};