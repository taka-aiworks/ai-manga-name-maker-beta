// ===== 変更1: import追加 =====
import { Panel, Character, SpeechBubble, BackgroundElement, EffectElement, ToneElement, Page, CanvasSettings } from '../types';


// 🔧 ProjectData interface を拡張
// ===== 変更2: ProjectData interface拡張（5行追加） =====
export interface ProjectData {
  id: string;
  name: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  data: {
    // 🆕 ページ対応プロパティ（追加）
    pages?: Page[];
    currentPageIndex?: number;
    
    // 既存プロパティ（後方互換性のため維持）
    panels: Panel[];
    characters: Character[];
    bubbles: SpeechBubble[];
    backgrounds: BackgroundElement[];
    effects: EffectElement[];
    tones: ToneElement[];
    canvasSize: { width: number; height: number };
    settings: {
      snapEnabled: boolean;
      snapSize: number;
      darkMode: boolean;
    };
    characterNames?: Record<string, string>;
    characterSettings?: Record<string, any>;
    canvasSettings?: CanvasSettings;  // ← この行を追加
  };
}

export interface ProjectMetadata {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
}

export class SaveService {
  private static readonly STORAGE_KEY = 'name_tool_projects';
  private static readonly CURRENT_PROJECT_KEY = 'name_tool_current_project';
  private static readonly VERSION = '1.0.0';

  // SaveService.ts の saveProject メソッドにデバッグログ追加
  static saveProject(
    name: string,
    panels: Panel[],
    characters: Character[],
    bubbles: SpeechBubble[],
    backgrounds: BackgroundElement[],
    effects: EffectElement[],
    tones: ToneElement[],
    canvasSize: { width: number; height: number },
    settings: { snapEnabled: boolean; snapSize: number; darkMode: boolean },
    projectId?: string,
    characterNames?: Record<string, string>,
    characterSettings?: Record<string, any>,
    pages?: Page[],
    currentPageIndex?: number,
    canvasSettings?: CanvasSettings  // ← この行を追加
  ): string {
    try {
      console.log('💾 SaveService.saveProject開始');
      console.log('📝 引数確認:', {
        name,
        panelsCount: panels.length,
        charactersCount: characters.length,
        bubblesCount: bubbles.length,
        backgroundsCount: backgrounds.length,
        effectsCount: effects.length,
        tonesCount: tones.length,
        projectId: projectId || 'new'
      });

      const id = projectId || this.generateId();
      const now = new Date().toISOString();
      
      console.log('🆔 プロジェクトID:', id);
      
      const projectData: ProjectData = {
        id,
        name,
        version: this.VERSION,
        createdAt: projectId ? this.getProject(projectId)?.createdAt || now : now,
        updatedAt: now,
        data: {
          // 🆕 ページデータ保存（存在する場合のみ）
          ...(pages && { pages: JSON.parse(JSON.stringify(pages)) }),
          ...(currentPageIndex !== undefined && { currentPageIndex }),
          
          // 既存データ（後方互換性維持）
          panels: JSON.parse(JSON.stringify(panels)),
          characters: JSON.parse(JSON.stringify(characters)),
          bubbles: JSON.parse(JSON.stringify(bubbles)),
          backgrounds: JSON.parse(JSON.stringify(backgrounds)),
          effects: JSON.parse(JSON.stringify(effects)),
          tones: JSON.parse(JSON.stringify(tones)),
          canvasSize,
          settings,
          characterNames,
          characterSettings,
          canvasSettings  // ← この行を追加
        }
      };

      console.log('📦 作成したプロジェクトデータ:', {
        id: projectData.id,
        name: projectData.name,
        dataKeys: Object.keys(projectData.data)
      });

      // 既存の保存ロジック
      const projects = this.getAllProjects();
      console.log('📊 既存プロジェクト数:', projects.length);
      
      const existingIndex = projects.findIndex(p => p.id === id);
      console.log('🔍 既存インデックス:', existingIndex);
      
      if (existingIndex >= 0) {
        console.log('🔄 既存プロジェクトを更新');
        projects[existingIndex] = projectData;
      } else {
        console.log('🆕 新規プロジェクトを追加');
        projects.push(projectData);
      }

      console.log('📊 更新後プロジェクト数:', projects.length);

      const dataToSave = JSON.stringify(projects);
      console.log('💾 保存するデータサイズ:', dataToSave.length + '文字');
      
      localStorage.setItem(this.STORAGE_KEY, dataToSave);
      localStorage.setItem(this.CURRENT_PROJECT_KEY, id);
      
      console.log('✅ localStorage保存完了');

      // 即座に確認
      const verification = localStorage.getItem(this.STORAGE_KEY);
      console.log('🔍 保存確認:', verification ? `${verification.length}文字で保存済み` : '保存されていません！');

      console.log(`✅ プロジェクト "${name}" を保存しました (ID: ${id})${pages ? ` - ${pages.length}ページ` : ''}`);
      return id;

        } catch (error) {
      console.error('❌ プロジェクト保存エラー:', error);
      
      // 🔧 TypeScriptエラー対応：errorの型をチェック
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      console.error('❌ エラー詳細:', errorMessage);
      if (errorStack) {
        console.error('❌ スタックトレース:', errorStack);
      }
      
      throw new Error('プロジェクトの保存に失敗しました');
    }
  }

  // SaveService.ts に追加するloadProject関数

  /**
   * プロジェクトを読み込み（ページ対応版）
   */
  static loadProject(projectId: string): ProjectData | null {
    try {
      const projects = this.getAllProjects();
      const project = projects.find(p => p.id === projectId);
      
      if (project) {
        // 🔧 後方互換性：各種データがない場合は空配列で初期化
        if (!project.data.effects) {
          project.data.effects = [];
        }
        if (!project.data.tones) {
          project.data.tones = [];
        }
        if (!project.data.characterNames) {
          project.data.characterNames = {
            hero: '主人公',
            heroine: 'ヒロイン',
            rival: 'ライバル',
            friend: '友人'
          };
        }
        if (!project.data.characterSettings) {
          project.data.characterSettings = {
            hero: { appearance: null, role: '主人公' },
            heroine: { appearance: null, role: 'ヒロイン' },
            rival: { appearance: null, role: 'ライバル' },
            friend: { appearance: null, role: '友人' }
          };
        }
        
        // 🆕 ページデータの後方互換性：ない場合は既存データから生成
        if (!project.data.pages) {
          project.data.pages = [{
            id: `page_${Date.now()}`,
            title: 'ページ 1',
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            panels: project.data.panels,
            characters: project.data.characters,
            bubbles: project.data.bubbles,
            backgrounds: project.data.backgrounds,
            effects: project.data.effects,
            tones: project.data.tones
          }];
          project.data.currentPageIndex = 0;
        }
        
        localStorage.setItem(this.CURRENT_PROJECT_KEY, projectId);
        console.log(`プロジェクト "${project.name}" を読み込みました${project.data.pages ? ` - ${project.data.pages.length}ページ` : ''}`);
        return project;
      }
      
      return null;
    } catch (error) {
      console.error('プロジェクト読み込みエラー:', error);
      return null;
    }
  }

  /**
   * 現在のプロジェクトIDを取得
   */
  static getCurrentProjectId(): string | null {
    return localStorage.getItem(this.CURRENT_PROJECT_KEY);
  }

  /**
   * 現在のプロジェクトを取得
   */
  static getCurrentProject(): ProjectData | null {
    const currentId = this.getCurrentProjectId();
    return currentId ? this.loadProject(currentId) : null;
  }

  // SaveService.ts の getAllProjects メソッドにデバッグログ追加

  /**
   * プロジェクト一覧を取得（トーン対応版 + デバッグ）
   */
  static getAllProjects(): ProjectData[] {
    try {
      console.log('🔍 getAllProjects開始 - ストレージキー:', this.STORAGE_KEY);
      
      const data = localStorage.getItem(this.STORAGE_KEY);
      console.log('💾 ストレージから取得:', data ? `データあり(${data.length}文字)` : 'データなし');
      
      if (!data) {
        console.log('📝 初回起動 - 空配列を返します');
        return [];
      }
      
      const projects = JSON.parse(data);
      console.log('✅ JSON解析成功:', Array.isArray(projects) ? `${projects.length}個のプロジェクト` : 'プロジェクトは配列ではありません');
      
      if (Array.isArray(projects) && projects.length > 0) {
        projects.forEach((project, index) => {
          console.log(`  ${index + 1}. ${project.name || 'Unknown'} (ID: ${project.id || 'Unknown'})`);
        });
      }
      
      // 🔧 後方互換性：既存プロジェクトに効果線・トーン・キャラクター名前データを追加
      const processedProjects = projects.map((project: ProjectData) => {
        if (!project.data.effects) {
          project.data.effects = [];
        }
        if (!project.data.tones) {
          project.data.tones = [];
        }
        // 🆕 キャラクター名前・設定データの後方互換性
        if (!project.data.characterNames) {
          project.data.characterNames = {
            hero: '主人公',
            heroine: 'ヒロイン',
            rival: 'ライバル',
            friend: '友人'
          };
        }
        if (!project.data.characterSettings) {
          project.data.characterSettings = {
            hero: { appearance: null, role: '主人公' },
            heroine: { appearance: null, role: 'ヒロイン' },
            rival: { appearance: null, role: 'ライバル' },
            friend: { appearance: null, role: '友人' }
          };
        }
        return project;
      });
      
      console.log('🔧 後方互換性処理完了:', processedProjects.length + '個のプロジェクト');
      return Array.isArray(processedProjects) ? processedProjects : [];
      
    } catch (error) {
      console.error('❌ プロジェクト一覧取得エラー:', error);
      return [];
    }
  }

  // SaveService.ts の getProjectList メソッドのみ修正

  /**
   * プロジェクトメタデータ一覧を取得（デバッグ版）
   */
  static getProjectList(): ProjectMetadata[] {
    console.log('🔍 getProjectList呼び出し開始');
    
    const allProjects = this.getAllProjects();
    console.log('📊 getAllProjectsの結果:', allProjects.length + '個のプロジェクト');
    
    if (allProjects.length > 0) {
      allProjects.forEach((project, index) => {
        console.log(`  ${index + 1}. ${project.name} (ID: ${project.id})`);
      });
    }
    
    const projectList = allProjects.map(project => ({
      id: project.id,
      name: project.name,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    }));
    
    console.log('📋 変換後のプロジェクト一覧:', projectList.length + '個');
    
    return projectList;
  }
  /**
   * プロジェクトを削除
   */
  static deleteProject(projectId: string): boolean {
    try {
      const projects = this.getAllProjects();
      const filteredProjects = projects.filter(p => p.id !== projectId);
      
      if (filteredProjects.length === projects.length) {
        return false;
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredProjects));
      
      if (this.getCurrentProjectId() === projectId) {
        localStorage.removeItem(this.CURRENT_PROJECT_KEY);
      }

      console.log(`プロジェクト (ID: ${projectId}) を削除しました`);
      return true;
    } catch (error) {
      console.error('プロジェクト削除エラー:', error);
      return false;
    }
  }

  /**
   * プロジェクトを複製
   */
  static duplicateProject(projectId: string, newName?: string): string | null {
    try {
      const original = this.getProject(projectId);
      if (!original) return null;

      const newId = this.generateId();
      const now = new Date().toISOString();
      
      const duplicated: ProjectData = {
        ...JSON.parse(JSON.stringify(original)),
        id: newId,
        name: newName || `${original.name} のコピー`,
        createdAt: now,
        updatedAt: now
      };

      const projects = this.getAllProjects();
      projects.push(duplicated);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));

      console.log(`プロジェクト "${original.name}" を複製しました`);
      return newId;
    } catch (error) {
      console.error('プロジェクト複製エラー:', error);
      return null;
    }
  }

  /**
   * プロジェクトをエクスポート（JSON）
   */
  static exportProject(projectId: string): void {
    try {
      const project = this.getProject(projectId);
      if (!project) throw new Error('プロジェクトが見つかりません');

      const dataStr = JSON.stringify(project, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log(`プロジェクト "${project.name}" をエクスポートしました`);
    } catch (error) {
      console.error('プロジェクトエクスポートエラー:', error);
      throw new Error('プロジェクトのエクスポートに失敗しました');
    }
  }

  /**
   * プロジェクトをインポート（JSON）
   */
  static async importProject(file: File): Promise<string | null> {
    try {
      const text = await file.text();
      const projectData: ProjectData = JSON.parse(text);
      
      if (!this.validateProjectData(projectData)) {
        throw new Error('無効なプロジェクトファイルです');
      }

      // 🔧 後方互換性：効果線・トーンデータがない場合は空配列で初期化
      if (!projectData.data.effects) {
        projectData.data.effects = [];
      }
      if (!projectData.data.tones) {
        projectData.data.tones = [];
      }

      const newId = this.generateId();
      const now = new Date().toISOString();
      
      projectData.id = newId;
      projectData.updatedAt = now;

      const projects = this.getAllProjects();
      projects.push(projectData);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));

      console.log(`プロジェクト "${projectData.name}" をインポートしました`);
      return newId;
    } catch (error) {
      console.error('プロジェクトインポートエラー:', error);
      return null;
    }
  }

  /**
   * ストレージ使用量を取得
   */
  static getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY) || '';
      const used = new Blob([data]).size;
      const available = 5 * 1024 * 1024;
      const percentage = (used / available) * 100;

      return { used, available, percentage };
    } catch (error) {
      console.error('ストレージ情報取得エラー:', error);
      return { used: 0, available: 5 * 1024 * 1024, percentage: 0 };
    }
  }

  // Private methods
  private static getProject(projectId: string): ProjectData | null {
    const projects = this.getAllProjects();
    return projects.find(p => p.id === projectId) || null;
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 🔧 トーン対応版バリデーション
  private static validateProjectData(data: any): data is ProjectData {
    return (
      data &&
      typeof data.id === 'string' &&
      typeof data.name === 'string' &&
      typeof data.version === 'string' &&
      data.data &&
      Array.isArray(data.data.panels) &&
      Array.isArray(data.data.characters) &&
      Array.isArray(data.data.bubbles) &&
      Array.isArray(data.data.backgrounds) &&
      // effectsとtonesは後方互換性のため必須ではない
      (data.data.effects === undefined || Array.isArray(data.data.effects)) &&
      (data.data.tones === undefined || Array.isArray(data.data.tones))
    );
  }
}

export default SaveService;