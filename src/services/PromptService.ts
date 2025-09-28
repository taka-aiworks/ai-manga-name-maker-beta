// src/services/PromptService.ts - 8カテゴリ完全対応版
import { Panel, Character, SpeechBubble, BackgroundElement, EffectElement, CharacterSettings } from '../types';

export interface Project {
  panels: Panel[];
  characters: Character[];
  speechBubbles: SpeechBubble[];
  backgrounds: BackgroundElement[];
  effects: EffectElement[];
  characterSettings?: Record<string, CharacterSettings>;
}

export interface CharacterPrompt {
  id: string;
  name: string;
  role: string;
  basePrompt: string;
  scenePrompt: string;
  fullPrompt: string;
  qualityScore: number; // 🆕 品質スコア追加
}

export interface ScenePrompt {
  panelId: number;
  sceneType: string;
  backgroundPrompt?: string;
  effectsPrompt?: string;
  compositionPrompt?: string;
  panelCharacters: CharacterPrompt[];
}

export interface PromptOutput {
  characters: CharacterPrompt[];
  scenes: ScenePrompt[];
  storyFlow: string;
  technicalNotes: string;
  overallQuality: number; // 🆕 全体品質スコア追加
}

class PromptService {
  /**
   * 🆕 未選択値判定の厳密関数（8カテゴリ対応）
   */
  private isValidValue(value: any): boolean {
    if (!value) return false;
    if (typeof value !== 'string') return false;
    
    const trimmed = value.trim();
    if (!trimmed) return false;
    
    // 🔧 未選択を示すキーワードを完全除外
    const unselectedKeywords = [
      '未選択', '選択してください', '未設定', 'none', 'null', 'undefined',
      'default', 'normal', 'front', 'basic', 'standard', 'regular'
    ];
    
    return !unselectedKeywords.includes(trimmed.toLowerCase());
  }

  /**
   * 🆕 8カテゴリ対応の辞書データを取得
   */
  private getDictionary(): any {
    if (typeof window !== 'undefined' && window.DEFAULT_SFW_DICT) {
      return window.DEFAULT_SFW_DICT.SFW;
    }
    
    // 🆕 8カテゴリ対応のフォールバック辞書
    return {
      expressions: [
        { tag: "neutral_expression", label: "普通の表情" },
        { tag: "smiling", label: "笑顔" },
        { tag: "happy", label: "嬉しい" },
        { tag: "sad", label: "悲しい" },
        { tag: "angry", label: "怒り" },
        { tag: "surprised", label: "驚き" },
        { tag: "embarrassed", label: "恥ずかしい" },
        { tag: "serious", label: "真剣" },
        { tag: "worried", label: "心配" },
        { tag: "confused", label: "困惑" }
      ],
      pose_manga: [
        { tag: "standing", label: "立ち" },
        { tag: "sitting", label: "座り" },
        { tag: "walking", label: "歩く" },
        { tag: "running", label: "走る" },
        { tag: "arms_crossed", label: "腕組み" },
        { tag: "hands_on_hips", label: "腰に手" },
        { tag: "pointing", label: "指差し" },
        { tag: "waving", label: "手を振る" },
        { tag: "leaning", label: "もたれかかる" },
        { tag: "kneeling", label: "ひざまずく" }
      ],
      gaze: [
        { tag: "at_viewer", label: "こちらを見る" },
        { tag: "to_side", label: "横を見る" },
        { tag: "away", label: "そっぽを向く" },
        { tag: "down", label: "下を見る" },
        { tag: "up", label: "上を見る" },
        { tag: "looking_back", label: "振り返る" },
        { tag: "sideways_glance", label: "横目" },
        { tag: "distant_gaze", label: "遠くを見る" }
      ],
      eye_state: [
        { tag: "eyes_open", label: "目を開ける" },
        { tag: "eyes_closed", label: "目を閉じる" },
        { tag: "wink_left", label: "左ウインク" },
        { tag: "wink_right", label: "右ウインク" },
        { tag: "half_closed_eyes", label: "半目" },
        { tag: "wide_eyes", label: "目を見開く" },
        { tag: "sleepy_eyes", label: "眠そうな目" },
        { tag: "sparkling_eyes", label: "キラキラした目" }
      ],
      mouth_state: [
        { tag: "mouth_closed", label: "口を閉じる" },
        { tag: "open_mouth", label: "口を開ける" },
        { tag: "slight_smile", label: "微笑み" },
        { tag: "grin", label: "歯を見せて笑う" },
        { tag: "frown", label: "しかめ面" },
        { tag: "pouting", label: "ふくれっ面" },
        { tag: "lips_pursed", label: "唇をすぼめる" },
        { tag: "tongue_out", label: "舌を出す" }
      ],
      hand_gesture: [
        { tag: "peace_sign", label: "ピースサイン" },
        { tag: "pointing", label: "指差し" },
        { tag: "waving", label: "手を振る" },
        { tag: "thumbs_up", label: "サムズアップ" },
        { tag: "clenched_fist", label: "握りこぶし" },
        { tag: "open_palm", label: "手のひらを向ける" },
        { tag: "covering_mouth", label: "口を覆う" },
        { tag: "hands_clasped", label: "手を合わせる" }
      ],
      emotion_primary: [
        { tag: "joy", label: "喜び" },
        { tag: "anger", label: "怒り" },
        { tag: "sadness", label: "悲しみ" },
        { tag: "fear", label: "恐れ" },
        { tag: "surprise", label: "驚き" },
        { tag: "disgust", label: "嫌悪" },
        { tag: "contempt", label: "軽蔑" },
        { tag: "love", label: "愛情" },
        { tag: "anticipation", label: "期待" },
        { tag: "trust", label: "信頼" }
      ],
      physical_state: [
        { tag: "healthy", label: "健康" },
        { tag: "tired", label: "疲れた" },
        { tag: "sick", label: "体調不良" },
        { tag: "energetic", label: "元気" },
        { tag: "exhausted", label: "疲労困憊" },
        { tag: "sleepy", label: "眠い" },
        { tag: "dizzy", label: "めまい" },
        { tag: "injured", label: "怪我" },
        { tag: "sweating", label: "汗をかく" },
        { tag: "trembling", label: "震えている" }
      ],
      composition: [
        { tag: "close-up", label: "顔のみ" },
        { tag: "upper_body", label: "上半身" },
        { tag: "full_body", label: "全身" }
      ]
    };
  }

  /**
   * 🔧 8カテゴリ対応: 辞書から英語タグを取得（未選択時はnull返却）
   */
  private getEnglishTag(category: string, key: string): string | null {
    if (!this.isValidValue(key)) {
      return null;
    }
    
    const dict = this.getDictionary();
    const categoryData = dict[category] || [];
    
    const found = categoryData.find((item: any) => 
      item.tag === key || item.label === key
    );
    
    return found ? found.tag : null;
  }

  /**
   * 辞書から日本語ラベルを取得
   */
  private getJapaneseLabel(category: string, key: string): string {
    if (!this.isValidValue(key)) {
      return '';
    }
    
    const dict = this.getDictionary();
    const categoryData = dict[category] || [];
    
    const found = categoryData.find((item: any) => item.tag === key);
    return found ? found.label : key;
  }

  /**
   * 🆕 8項目品質スコア計算
   */
  private calculateCharacterQualityScore(character: Character): number {
    const settings = [
      character.expression,
      character.action,
      character.facing,
      (character as any).eyeState,
      (character as any).mouthState,
      (character as any).handGesture,
      (character as any).emotion_primary,
      (character as any).physical_state
    ];
    
    const validSettings = settings.filter(s => this.isValidValue(s)).length;
    return Math.round((validSettings / 8) * 100);
  }

  /**
   * プロジェクト全体からAI用プロンプトを生成
   */
  public generatePrompts(project: Project, characterAssignments?: Map<number, Character[]>): PromptOutput {
    console.log('📊 PromptService受信データ確認 (8カテゴリ対応版):', {
      panels: project.panels?.length || 0,
      characters: project.characters?.length || 0,
      characterSettings: project.characterSettings,
      characterSettingsKeys: Object.keys(project.characterSettings || {}),
      hasCharacterAssignments: !!characterAssignments
    });

    // 🔍 統合テンプレートで生成されたキャラクターの設定値を詳細確認
    project.characters.forEach((char, index) => {
      console.log(`🔍 キャラクター${index + 1}詳細設定:`, {
        id: char.id,
        name: char.name,
        panelId: char.panelId,
        expression: char.expression,
        action: char.action,
        facing: char.facing,
        eyeState: (char as any).eyeState,
        mouthState: (char as any).mouthState,
        handGesture: (char as any).handGesture,
        emotion_primary: (char as any).emotion_primary,
        physical_state: (char as any).physical_state,
        // 🔍 追加デバッグ情報
        allProperties: Object.keys(char),
        rawCharacter: char
      });
    });

    const characters = this.extractCharacterPrompts(project);
    const scenes = this.extractScenePrompts(project, characters, characterAssignments);
    const storyFlow = this.generateStoryFlow(project);
    const technicalNotes = this.generateTechnicalNotes();

    // 🆕 全体品質スコア計算
    const overallQuality = characters.length > 0 ? 
      Math.round(characters.reduce((sum, char) => sum + char.qualityScore, 0) / characters.length) : 0;

    return {
      characters,
      scenes,
      storyFlow,
      technicalNotes,
      overallQuality
    };
  }

  private extractCharacterPrompts(project: Project): CharacterPrompt[] {
    // 🔧 修正: 統合テンプレートで生成されたキャラクターも個別に処理
    console.log('🎭 プロンプト生成対象キャラクター (8カテゴリ対応):', project.characters.length, '体');
    console.log('🔍 extractCharacterPrompts関数開始:', {
      charactersCount: project.characters.length,
      characters: project.characters.map(c => ({ id: c.id, name: c.name, panelId: c.panelId }))
    });
    
    // 🔍 キャラクター詳細確認
    project.characters.forEach((char, index) => {
      console.log(`🔍 キャラクター${index + 1}処理開始:`, {
        id: char.id,
        characterId: char.characterId,
        name: char.name,
        panelId: char.panelId,
        expression: char.expression,
        action: char.action,
        facing: char.facing
      });
    });

    return project.characters.map(char => {
      const characterType = char.type || char.characterId || char.id;
      const settingsData = project.characterSettings?.[characterType] as any;
      
      console.log('🔍 キャラクター設定データ取得:', {
        characterType,
        settingsData,
        hasAppearance: !!settingsData?.appearance,
        hasBasePrompt: !!settingsData?.appearance?.basePrompt
      });

      let basePrompt = '';
      if (settingsData?.appearance?.basePrompt) {
        basePrompt = settingsData.appearance.basePrompt;
        console.log('✅ basePrompt取得成功:', basePrompt.substring(0, 50));
      } else {
        console.log('❌ basePrompt取得失敗: データが見つかりません');
      }

      const settings = {
        id: char.characterId || char.id,
        name: char.name || 'キャラクター',
        role: settingsData?.role || '主人公',
        gender: 'female' as const,
        basePrompt
      };

      const scenePrompt = this.generateScenePrompt(char);
      const fullPrompt = this.generateFullPrompt(settings.basePrompt, char);
      const qualityScore = this.calculateCharacterQualityScore(char); // 🆕 品質スコア

      console.log(`👤 キャラクター "${settings.name}" プロンプト生成完了 (品質スコア: ${qualityScore}%):`, {
        basePrompt: settings.basePrompt.substring(0, 30) + (settings.basePrompt.length > 30 ? '...' : ''),
        scenePrompt: scenePrompt,
        fullPrompt: fullPrompt.substring(0, 50) + (fullPrompt.length > 50 ? '...' : ''),
        qualityScore: qualityScore
      });

      return {
        id: char.id,
        name: settings.name,
        role: settings.role,
        basePrompt: settings.basePrompt,
        scenePrompt: scenePrompt,
        fullPrompt: fullPrompt,
        qualityScore: qualityScore // 🆕 品質スコア追加
      };
    });
  }

  /**
   * 🔧 8カテゴリ完全対応版: 詳細設定からシーンプロンプト生成
   */
  private generateScenePrompt(character: Character): string {
    const validTags: string[] = [];

    console.log('🎭 8カテゴリプロンプト生成用キャラクターデータ:', {
      id: character.id,
      name: character.name,
      viewType: (character as any).viewType,
      expression: character.expression,
      action: character.action,
      facing: character.facing,
      eyeState: (character as any).eyeState,
      mouthState: (character as any).mouthState,
      handGesture: (character as any).handGesture,
      emotion_primary: (character as any).emotion_primary,
      physical_state: (character as any).physical_state
    });

    // 🔧 1. 表示タイプ（構図）- 有効値のみ追加
    const viewType = (character as any).viewType;
    if (this.isValidValue(viewType)) {
      const viewTypeMapping: Record<string, string> = {
        'face': 'close-up',
        'upper_body': 'upper_body',
        'full_body': 'full_body'
      };
      const compositionTag = viewTypeMapping[viewType];
      if (compositionTag) {
        validTags.push(compositionTag);
        console.log('📐 構図タグ追加:', compositionTag);
      }
    } else {
      console.log('📐 構図: 未選択のためスキップ');
    }

    // 🔧 2. 表情 - 有効値のみ追加
    if (this.isValidValue(character.expression)) {
      const expressionTag = this.getEnglishTag('expressions', character.expression);
      if (expressionTag) {
        validTags.push(expressionTag);
        console.log('😊 表情タグ追加:', expressionTag);
      } else {
        console.log('😊 表情タグ無効:', character.expression);
      }
    } else {
      console.log('😊 表情: 未選択のためスキップ');
    }

    // 🔧 3. 動作・ポーズ - 有効値のみ追加
    if (this.isValidValue(character.action)) {
      const actionTag = this.getEnglishTag('pose_manga', character.action);
      if (actionTag) {
        validTags.push(actionTag);
        console.log('🤸 動作タグ追加:', actionTag);
      } else {
        console.log('🤸 動作タグ無効:', character.action);
      }
    } else {
      console.log('🤸 動作: 未選択のためスキップ');
    }

    // 🔧 4. 体の向き・視線 - 有効値のみ追加
    if (this.isValidValue(character.facing)) {
      const facingTag = this.getEnglishTag('gaze', character.facing);
      if (facingTag) {
        validTags.push(facingTag);
        console.log('🔄 向きタグ追加:', facingTag);
      } else {
        console.log('🔄 向きタグ無効:', character.facing);
      }
    } else {
      console.log('🔄 向き: 未選択のためスキップ');
    }

    // 🔧 5. 目の状態 - 有効値のみ追加
    const eyeState = (character as any).eyeState;
    if (this.isValidValue(eyeState)) {
      const eyeTag = this.getEnglishTag('eye_state', eyeState);
      if (eyeTag) {
        validTags.push(eyeTag);
        console.log('👀 目の状態タグ追加:', eyeTag);
      } else {
        console.log('👀 目の状態タグ無効:', eyeState);
      }
    } else {
      console.log('👀 目の状態: 未選択のためスキップ');
    }

    // 🆕 6. 口の状態 - 新規カテゴリ
    const mouthState = (character as any).mouthState;
    if (this.isValidValue(mouthState)) {
      const mouthTag = this.getEnglishTag('mouth_state', mouthState);
      if (mouthTag) {
        validTags.push(mouthTag);
        console.log('👄 口の状態タグ追加:', mouthTag);
      } else {
        console.log('👄 口の状態タグ無効:', mouthState);
      }
    } else {
      console.log('👄 口の状態: 未選択のためスキップ');
    }

    // 🆕 7. 手の動作 - 新規カテゴリ
    const handGesture = (character as any).handGesture;
    if (this.isValidValue(handGesture)) {
      const handTag = this.getEnglishTag('hand_gesture', handGesture);
      if (handTag) {
        validTags.push(handTag);
        console.log('✋ 手の動作タグ追加:', handTag);
      } else {
        console.log('✋ 手の動作タグ無効:', handGesture);
      }
    } else {
      console.log('✋ 手の動作: 未選択のためスキップ');
    }

    // 🆕 8. 基本感情 - 新規カテゴリ
    const emotionPrimary = (character as any).emotion_primary;
    if (this.isValidValue(emotionPrimary)) {
      const emotionTag = this.getEnglishTag('emotion_primary', emotionPrimary);
      if (emotionTag) {
        validTags.push(emotionTag);
        console.log('💗 基本感情タグ追加:', emotionTag);
      } else {
        console.log('💗 基本感情タグ無効:', emotionPrimary);
      }
    } else {
      console.log('💗 基本感情: 未選択のためスキップ');
    }

    // 🆕 9. 体調・状態 - 新規カテゴリ
    const physicalState = (character as any).physical_state;
    if (this.isValidValue(physicalState)) {
      const physicalTag = this.getEnglishTag('physical_state', physicalState);
      if (physicalTag) {
        validTags.push(physicalTag);
        console.log('🏃 体調・状態タグ追加:', physicalTag);
      } else {
        console.log('🏃 体調・状態タグ無効:', physicalState);
      }
    } else {
      console.log('🏃 体調・状態: 未選択のためスキップ');
    }

    const result = validTags.join(', ');
    console.log(`🎯 生成された8カテゴリシーンプロンプト (${validTags.length}個の有効タグ):`, result || '(設定なし)');
    
    return result;
  }

  /**
   * 🔧 改良版: フルプロンプト生成（8カテゴリ対応）
   */
  private generateFullPrompt(basePrompt: string, character: Character): string {
    const scenePrompt = this.generateScenePrompt(character);
    
    const validParts: string[] = [];
    
    // 🆕 basePromptの有効性チェック
    if (this.isValidValue(basePrompt)) {
      validParts.push(basePrompt.trim());
    }
    
    // 🆕 scenePromptの有効性チェック
    if (this.isValidValue(scenePrompt)) {
      validParts.push(scenePrompt.trim());
    }

    const result = validParts.join(', ');
    console.log(`🔗 統合プロンプト生成 (${validParts.length}部分):`, result || '(基本設定のみ)');
    
    return result;
  }

  // 🔧 修正: extractScenePromptsにcharacterAssignmentsを追加
  private extractScenePrompts(project: Project, allCharacters: CharacterPrompt[], characterAssignments?: Map<number, Character[]>): ScenePrompt[] {
    return project.panels.map(panel => {
      let panelCharacters: CharacterPrompt[] = [];
      
      if (characterAssignments) {
        // 🔧 座標ベースの割り当てを使用
        const assignedCharacters = characterAssignments.get(panel.id) || [];
        panelCharacters = allCharacters.filter(char => 
          assignedCharacters.some(assigned => assigned.id === char.id)
        );
        
        console.log(`📐 Panel ${panel.id}: 座標ベースで ${panelCharacters.length}体のキャラクターを配置`);
      } else {
        // 🔧 フォールバック: 従来のpanelIdベース
        const panelCharacterIds = project.characters
          .filter(char => char.panelId === panel.id)
          .map(char => char.id);
        
        panelCharacters = allCharacters.filter(char => 
          panelCharacterIds.includes(char.id)
        );
        
        console.log(`📐 Panel ${panel.id}: panelIdベースで ${panelCharacters.length}体のキャラクターを配置`);
      }

      return {
        panelId: panel.id,
        sceneType: this.analyzeSceneType(panel, project),
        backgroundPrompt: this.generateBackgroundPrompt(panel, project),
        effectsPrompt: this.generateEffectsPrompt(panel, project),
        compositionPrompt: this.generateCompositionPrompt(panel, project),
        panelCharacters
      };
    });
  }

  private generateBackgroundPrompt(panel: Panel, project: Project): string | undefined {
    const backgrounds = project.backgrounds.filter(bg => bg.panelId === panel.id);
    if (backgrounds.length === 0) return undefined;
    return backgrounds[0].type;
  }

  private generateEffectsPrompt(panel: Panel, project: Project): string | undefined {
    const effects = project.effects.filter(effect => effect.panelId === panel.id);
    if (effects.length === 0) return undefined;
    
    return effects.map(effect => {
      const mapping: Record<string, string> = {
        'speed': 'speed lines',
        'focus': 'focus lines',
        'explosion': 'explosion effect',
        'flash': 'flash effect'
      };
      return mapping[effect.type] || effect.type;
    }).join(', ');
  }

  private generateCompositionPrompt(panel: Panel, project: Project): string | undefined {
    const characterCount = project.characters.filter(char => char.panelId === panel.id).length;
    
    if (characterCount === 1) return 'single character';
    if (characterCount === 2) return 'two characters';
    if (characterCount > 2) return 'group shot';
    return undefined;
  }

  private analyzeSceneType(panel: Panel, project: Project): string {
    const characterCount = project.characters.filter(char => char.panelId === panel.id).length;
    const bubbleCount = project.speechBubbles.filter(bubble => bubble.panelId === panel.id).length;
    const hasEffects = project.effects.filter(effect => effect.panelId === panel.id).length > 0;

    if (hasEffects) return 'action';
    if (characterCount > 1) return 'dialogue';
    if (bubbleCount > 0) return 'speech';
    return 'scene';
  }

  private generateStoryFlow(project: Project): string {
    const panelCount = project.panels.length;
    const totalDialogue = project.speechBubbles.length;
    const characterCount = new Set(project.characters.map(c => c.characterId)).size;
    
    return `${panelCount} panels, ${characterCount} characters, ${totalDialogue} dialogue bubbles`;
  }

  private generateTechnicalNotes(): string {
    return [
      "Generated by ネーム制作ツール v1.2.0 - 8カテゴリ対応版",
      "🆕 8-category character detail system with quality scoring",
      "Character-based prompt system with advanced settings",
      "✅ Unselected values completely excluded",
      "🔧 Clean prompt generation without default values",
      "Recommended: High quality anime/manga style",
      "Use negative prompts for optimal results"
    ].join('\n');
  }

  /**
   * 🔧 8カテゴリ対応版プロンプト出力
   */
  public formatPromptOutput(promptData: PromptOutput): string {
    let output = "=== AI画像生成用プロンプト（8カテゴリ対応版） ===\n\n";

    // 🆕 全体品質スコア表示
    output += `🎯 全体品質スコア: ${promptData.overallQuality}% `;
    if (promptData.overallQuality >= 80) {
      output += "✨ 最高品質！\n";
    } else if (promptData.overallQuality >= 60) {
      output += "🌟 高品質！\n";
    } else if (promptData.overallQuality >= 40) {
      output += "👍 良好\n";
    } else {
      output += "⚠️ 改善推奨\n";
    }
    output += "\n";

    promptData.scenes.forEach((scene, index) => {
      output += `━━━ Panel ${index + 1} ━━━\n`;
      
      const panelCharacters = scene.panelCharacters;

      if (panelCharacters.length === 0) {
        output += `【背景のみのパネル】\n`;
        const bgPrompt = scene.backgroundPrompt || 'simple background';
        output += `masterpiece, best quality, ${bgPrompt}, no humans, anime style\n`;
        output += `\n───────────────────\n\n`;
        return;
      }

      // 🔧 正プロンプト生成（8カテゴリ対応）
      const validParts = ['masterpiece, best quality'];
      
      panelCharacters.forEach(char => {
        console.log(`🎯 Panel ${index + 1} - ${char.name} プロンプト構成 (品質: ${char.qualityScore}%):`, {
          basePrompt: char.basePrompt,
          scenePrompt: char.scenePrompt,
          fullPrompt: char.fullPrompt,
          qualityScore: char.qualityScore
        });
        
        // 🆕 fullPromptの厳密チェック
        if (this.isValidValue(char.fullPrompt)) {
          validParts.push(char.fullPrompt);
        } else {
          // フォールバック: 個別チェック
          if (this.isValidValue(char.basePrompt)) {
            validParts.push(char.basePrompt);
          }
          if (this.isValidValue(char.scenePrompt)) {
            validParts.push(char.scenePrompt);
          }
        }
      });

      if (scene.backgroundPrompt && this.isValidValue(scene.backgroundPrompt)) {
        validParts.push(scene.backgroundPrompt);
      }
      
      if (scene.effectsPrompt && this.isValidValue(scene.effectsPrompt)) {
        validParts.push(scene.effectsPrompt);
      }
      
      if (scene.compositionPrompt && this.isValidValue(scene.compositionPrompt)) {
        validParts.push(scene.compositionPrompt);
      }

      validParts.push('anime style');

      const positivePrompt = validParts.join(', ');
      output += `【Positive Prompt】\n${positivePrompt}\n\n`;

      const japaneseDesc = this.buildJapaneseDescription(panelCharacters, scene);
      output += `【日本語説明】\n${japaneseDesc}\n\n`;

      const negativePrompt = this.buildNegativePrompt();
      output += `【Negative Prompt】\n${negativePrompt}\n\n`;

      // 🆕 8カテゴリ設定完成度情報
      output += `【8カテゴリ設定完成度】\n`;
      panelCharacters.forEach(char => {
        const validSceneTags = char.scenePrompt ? 
          char.scenePrompt.split(', ').filter(tag => this.isValidValue(tag)).length : 0;
        const hasValidBase = this.isValidValue(char.basePrompt);
        
        output += `• ${char.name} (品質スコア: ${char.qualityScore}%): `;
        const details = [];
        if (hasValidBase) {
          details.push('基本設定✓');
        }
        if (validSceneTags > 0) {
          details.push(`詳細設定${validSceneTags}/8項目✓`);
        }
        if (details.length === 0) {
          details.push('基本設定のみ（詳細設定推奨）');
        }
        
        // 🆕 品質スコア別のアドバイス
        if (char.qualityScore >= 80) {
          details.push('✨最高品質');
        } else if (char.qualityScore >= 60) {
          details.push('🌟高品質');
        } else if (char.qualityScore >= 40) {
          details.push('👍普通');
        } else {
          details.push('⚠️要改善');
        }
        
        output += details.join(', ') + '\n';
      });
      output += '\n';

      output += `【推奨設定】\n`;
      output += `• Steps: 20-30\n`;
      output += `• CFG Scale: 7-11\n`;
      output += `• サイズ: 512x768 (縦) または 768x512 (横)\n`;
      output += `• サンプラー: DPM++ 2M Karras\n\n`;

      output += `───────────────────\n\n`;
    });

    // 🆕 8カテゴリキャラクター設定詳細情報
    output += "=== 8カテゴリキャラクター詳細設定 ===\n\n";
    promptData.characters.forEach((char, index) => {
      output += `${index + 1}. ${char.name} (${char.role}) - 品質スコア: ${char.qualityScore}%:\n`;
      
      if (this.isValidValue(char.basePrompt)) {
        output += `   基本設定: ${char.basePrompt}\n`;
      } else {
        output += `   基本設定: 未設定（CharacterSettingsPanelで設定推奨）\n`;
      }
      
      if (this.isValidValue(char.scenePrompt)) {
        output += `   詳細設定: ${char.scenePrompt}\n`;
        
        const validItems = char.scenePrompt.split(', ').filter(item => this.isValidValue(item));
        if (validItems.length > 0) {
          output += `   有効項目 (${validItems.length}/8): ${validItems.join(' | ')}\n`;
        }
      } else {
        output += `   詳細設定: 未設定（CharacterDetailPanelで8カテゴリ設定推奨）\n`;
      }
      
      if (this.isValidValue(char.fullPrompt)) {
        output += `   統合プロンプト: ${char.fullPrompt}\n`;
      } else {
        output += `   統合プロンプト: 設定が必要です\n`;
      }

      // 🆕 品質スコア別改善提案
      if (char.qualityScore < 40) {
        output += `   💡 改善提案: 基本4項目（表情・動作・視線・目）の設定を推奨\n`;
      } else if (char.qualityScore < 80) {
        output += `   💡 改善提案: 拡張4項目（口・手・感情・状態）の設定でさらに高品質に\n`;
      } else {
        output += `   ✨ 完璧な設定！商用レベルの画像生成が期待できます\n`;
      }
      
      output += `\n`;
    });

    output += "=== v1.2.0 8カテゴリ対応ガイド ===\n";
    output += "🆕 【基本4項目】\n";
    output += "1. 😊 表情 - キャラクターの表情を詳細に指定\n";
    output += "2. 🤸 動作・ポーズ - 体全体の動きや姿勢\n";
    output += "3. 🔄 体の向き・視線 - どちらを見ているか\n";
    output += "4. 👀 目の状態 - 目の開閉や特殊な状態\n\n";
    
    output += "🆕 【拡張4項目】\n";
    output += "5. 👄 口の状態 - 口の形や開閉\n";
    output += "6. ✋ 手の動作 - 手のジェスチャーや位置\n";
    output += "7. 💗 基本感情 - 喜怒哀楽などの根本的な感情\n";
    output += "8. 🏃 体調・状態 - 健康状態や特殊な身体状況\n\n";
    
    output += "📊 【品質スコア解説】\n";
    output += "• 80-100%: ✨ 最高品質 - 商用レベルの画像生成\n";
    output += "• 60-79%: 🌟 高品質 - 十分に詳細な設定\n";
    output += "• 40-59%: 👍 良好 - 基本的な品質を確保\n";
    output += "• 0-39%: ⚠️ 要改善 - より多くの設定が必要\n\n";
    
    output += "💡 【設定のコツ】\n";
    output += "• 表情と感情を組み合わせると表現力が大幅UP\n";
    output += "• ポーズと手の動作で動きのある構図に\n";
    output += "• 目・口の状態で細かいニュアンスを表現\n";
    output += "• 体調・状態で特殊な演出効果も可能\n\n";

    output += "=== 技術情報 ===\n";
    output += `${promptData.storyFlow}\n`;
    output += `生成日時: ${new Date().toLocaleString()}\n`;
    output += `${promptData.technicalNotes}\n`;
    output += `🆕 8カテゴリ詳細設定システム: v1.2.0対応\n`;
    output += `🎯 全体品質スコア: ${promptData.overallQuality}%\n`;

    return output;
  }

  /**
   * 🆕 8カテゴリ対応の日本語説明生成
   */
  private buildJapaneseDescription(characters: CharacterPrompt[], scene: ScenePrompt): string {
    const parts = [];

    characters.forEach((char, index) => {
      const descriptions = [];
      
      descriptions.push(`${char.name} (${char.role}) [品質: ${char.qualityScore}%]`);
      
      if (this.isValidValue(char.basePrompt)) {
        const shortBase = char.basePrompt.length > 20 ? 
          char.basePrompt.substring(0, 20) + '...' : 
          char.basePrompt;
        descriptions.push(`基本: ${shortBase}`);
      }
      
      // 🔧 8カテゴリ対応のシーンプロンプトを辞書で日本語変換
      if (this.isValidValue(char.scenePrompt)) {
        const scenePartsJapanese = char.scenePrompt.split(', ')
          .filter(part => this.isValidValue(part))
          .map(part => {
            part = part.trim();
            
            // 🆕 8カテゴリすべてをチェック
            let japanese = this.getJapaneseLabel('expressions', part);
            if (japanese === part) japanese = this.getJapaneseLabel('pose_manga', part);
            if (japanese === part) japanese = this.getJapaneseLabel('gaze', part);
            if (japanese === part) japanese = this.getJapaneseLabel('eye_state', part);
            if (japanese === part) japanese = this.getJapaneseLabel('mouth_state', part);
            if (japanese === part) japanese = this.getJapaneseLabel('hand_gesture', part);
            if (japanese === part) japanese = this.getJapaneseLabel('emotion_primary', part);
            if (japanese === part) japanese = this.getJapaneseLabel('physical_state', part);
            if (japanese === part) japanese = this.getJapaneseLabel('composition', part);
            
            if (japanese === part) {
              // 🆕 8カテゴリ対応の特殊変換
              const specialTranslations: Record<string, string> = {
                'close-up': '顔のみ',
                'upper_body': '上半身',
                'full_body': '全身',
                'at_viewer': 'こちらを見る',
                'away': 'そっぽ向く',
                'to_side': '横向き',
                'down': '下を見る',
                'neutral_expression': '普通の表情',
                'smiling': '笑顔',
                'standing': '立ち',
                'sitting': '座り',
                'eyes_open': '目を開ける',
                'mouth_closed': '口を閉じる',
                'single character': '1人',
                'two characters': '2人',
                'group shot': 'グループ',
                // 新規項目の翻訳
                'joy': '喜び',
                'anger': '怒り',
                'sadness': '悲しみ',
                'healthy': '健康',
                'tired': '疲れた',
                'peace_sign': 'ピース',
                'pointing': '指差し',
                'slight_smile': '微笑み',
                'open_mouth': '口開け'
              };
              japanese = specialTranslations[part] || part;
            }
            
            return japanese;
          })
          .filter(j => this.isValidValue(j))
          .join('、');
        
        if (scenePartsJapanese) {
          descriptions.push(`詳細: ${scenePartsJapanese}`);
        }
      }

      const charDescription = descriptions.length > 1 ? 
        `${char.name}: ${descriptions.slice(1).join(' | ')}` : 
        `${char.name}: 基本設定のみ`;
      
      parts.push(charDescription);
    });

    const sceneDetails = [];
    if (scene.backgroundPrompt && this.isValidValue(scene.backgroundPrompt)) {
      sceneDetails.push(`背景: ${scene.backgroundPrompt}`);
    }

    if (scene.effectsPrompt && this.isValidValue(scene.effectsPrompt)) {
      sceneDetails.push(`効果: ${scene.effectsPrompt}`);
    }

    if (scene.compositionPrompt && this.isValidValue(scene.compositionPrompt)) {
      let compositionJapanese = this.getJapaneseLabel('composition', scene.compositionPrompt);
      
      if (compositionJapanese === scene.compositionPrompt) {
        const compositionTranslations: Record<string, string> = {
          'single character': '1人',
          'two characters': '2人',
          'group shot': 'グループ'
        };
        compositionJapanese = compositionTranslations[scene.compositionPrompt] || scene.compositionPrompt;
      }
      
      sceneDetails.push(`構図: ${compositionJapanese}`);
    }

    if (sceneDetails.length > 0) {
      parts.push(`シーン: ${sceneDetails.join('、')}`);
    }

    parts.push("画質: 高品質なアニメ・漫画風イラスト（8カテゴリ対応版）");

    return parts.join('\n');
  }

  private buildNegativePrompt(): string {
    const negativeItems = [
      'lowres', 'bad anatomy', 'bad hands', 'text', 'error',
      'worst quality', 'low quality', 'blurry', 'bad face',
      'extra fingers', 'watermark', 'signature',
      'deformed', 'mutated', 'disfigured', 'bad proportions'
    ];

    return negativeItems.join(', ');
  }

  /**
   * Canvas付きエクスポート（8カテゴリ対応）
   */
  public async exportPromptWithCapture(
    project: Project, 
    canvasElement: HTMLCanvasElement
  ): Promise<{ imageBlob: Blob; promptText: string }> {
    const promptData = this.generatePrompts(project);
    const promptText = this.formatPromptOutput(promptData);

    return new Promise((resolve) => {
      canvasElement.toBlob((blob) => {
        if (blob) {
          resolve({
            imageBlob: blob,
            promptText
          });
        }
      }, 'image/png');
    });
  }
}

export const promptService = new PromptService();