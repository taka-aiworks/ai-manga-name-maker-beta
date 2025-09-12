// src/components/CanvasArea/renderers/CharacterRenderer/utils/CharacterBounds.ts
// 🎯 キャラクター境界・当たり判定専用クラス

import { Character, Panel, CharacterBounds as CharacterBoundsType } from "../../../../../types"; // ← こちらも確認
import { CharacterUtils } from "./CharacterUtils";

export class CharacterBounds {
  
  // 🎯 キャラクター境界情報取得
  static getCharacterBounds(
    character: Character,
    panel: Panel
  ): CharacterBoundsType {
    const { charX, charY, charWidth, charHeight } = 
      CharacterUtils.calculateDrawingCoordinates(character, panel);
    
    return {
      x: charX,
      y: charY,
      width: charWidth,
      height: charHeight,
      centerX: charX + charWidth / 2,
      centerY: charY + charHeight / 2
    };
  }

  // 🎯 回転を考慮したキャラクター境界
  static getRotatedCharacterBounds(
    character: Character,
    panel: Panel
  ): {
    original: CharacterBoundsType;
    rotated: {
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
      width: number;
      height: number;
    };
  } {
    const original = CharacterBounds.getCharacterBounds(character, panel);
    const rotation = character.rotation || 0;
    
    if (rotation === 0) {
      return {
        original,
        rotated: {
          minX: original.x,
          minY: original.y,
          maxX: original.x + original.width,
          maxY: original.y + original.height,
          width: original.width,
          height: original.height
        }
      };
    }
    
    const rotated = CharacterUtils.calculateRotatedBounds(
      original.x,
      original.y,
      original.width,
      original.height,
      rotation
    );
    
    return { original, rotated };
  }

  // 🎯 キャラクタークリック判定（回転対応）
  static isCharacterClicked(
    mouseX: number,
    mouseY: number,
    character: Character,
    panel: Panel
  ): boolean {
    const rotation = character.rotation || 0;
    
    if (rotation === 0) {
      // 通常の矩形判定
      const bounds = CharacterBounds.getCharacterBounds(character, panel);
      return (
        mouseX >= bounds.x &&
        mouseX <= bounds.x + bounds.width &&
        mouseY >= bounds.y &&
        mouseY <= bounds.y + bounds.height
      );
    } else {
      // 回転している場合の判定
      return CharacterBounds.isRotatedCharacterClicked(mouseX, mouseY, character, panel);
    }
  }

  // 🎯 回転キャラクターのクリック判定
  static isRotatedCharacterClicked(
    mouseX: number,
    mouseY: number,
    character: Character,
    panel: Panel
  ): boolean {
    const bounds = CharacterBounds.getCharacterBounds(character, panel);
    const rotation = character.rotation || 0;
    
    // マウス座標を逆回転させてキャラクターローカル座標で判定
    const reversedPoint = CharacterUtils.rotatePoint(
      mouseX,
      mouseY,
      bounds.centerX,
      bounds.centerY,
      -rotation // 逆回転
    );
    
    // 逆回転した座標で通常の矩形判定
    return (
      reversedPoint.x >= bounds.x &&
      reversedPoint.x <= bounds.x + bounds.width &&
      reversedPoint.y >= bounds.y &&
      reversedPoint.y <= bounds.y + bounds.height
    );
  }

  // 🎯 複数キャラクターからクリック対象を検索
  static findCharacterAt(
    mouseX: number,
    mouseY: number,
    characters: Character[],
    panels: Panel[]
  ): Character | null {
    // 後ろから検索（上に描画されたものを優先）
    for (let i = characters.length - 1; i >= 0; i--) {
      const character = characters[i];
      const panel = panels.find((p) => p.id === character.panelId);
      
      if (!panel) {
        console.warn(`⚠️ パネル未発見 - キャラクター: ${character.name}, パネルID: ${character.panelId}`);
        continue;
      }

      if (CharacterBounds.isCharacterClicked(mouseX, mouseY, character, panel)) {
        console.log(`🎯 キャラクタークリック検出: ${character.name} (rotation: ${character.rotation || 0}°)`);
        return character;
      }
    }
    
    return null;
  }

  // 🎯 リサイズハンドル境界計算
  static getResizeHandleBounds(
    character: Character,
    panel: Panel
  ): Array<{
    direction: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }> {
    const bounds = CharacterBounds.getCharacterBounds(character, panel);
    const handleSize = 16;
    
    return [
      // 角ハンドル（四角）
      { direction: "nw", x: bounds.x - handleSize/2, y: bounds.y - handleSize/2, width: handleSize, height: handleSize },
      { direction: "ne", x: bounds.x + bounds.width - handleSize/2, y: bounds.y - handleSize/2, width: handleSize, height: handleSize },
      { direction: "se", x: bounds.x + bounds.width - handleSize/2, y: bounds.y + bounds.height - handleSize/2, width: handleSize, height: handleSize },
      { direction: "sw", x: bounds.x - handleSize/2, y: bounds.y + bounds.height - handleSize/2, width: handleSize, height: handleSize },
      
      // 辺ハンドル（丸 - 円として扱う）
      { direction: "n", x: bounds.x + bounds.width/2 - handleSize/2, y: bounds.y - handleSize/2, width: handleSize, height: handleSize },
      { direction: "e", x: bounds.x + bounds.width - handleSize/2, y: bounds.y + bounds.height/2 - handleSize/2, width: handleSize, height: handleSize },
      { direction: "s", x: bounds.x + bounds.width/2 - handleSize/2, y: bounds.y + bounds.height - handleSize/2, width: handleSize, height: handleSize },
      { direction: "w", x: bounds.x - handleSize/2, y: bounds.y + bounds.height/2 - handleSize/2, width: handleSize, height: handleSize }
    ];
  }

  // 🎯 リサイズハンドルクリック判定
  static isResizeHandleClicked(
    mouseX: number,
    mouseY: number,
    character: Character,
    panel: Panel
  ): { isClicked: boolean; direction: string } {
    const handles = CharacterBounds.getResizeHandleBounds(character, panel);
    const tolerance = 10; // クリック判定を広く
    
    for (const handle of handles) {
      const inRangeX = mouseX >= handle.x - tolerance && 
                      mouseX <= handle.x + handle.width + tolerance;
      const inRangeY = mouseY >= handle.y - tolerance && 
                      mouseY <= handle.y + handle.height + tolerance;
      
      if (inRangeX && inRangeY) {
        console.log(`🔧 リサイズハンドル ${handle.direction} クリック検出!`);
        return { isClicked: true, direction: handle.direction };
      }
    }

    return { isClicked: false, direction: "" };
  }

  // 🎯 回転ハンドル境界計算
  static getRotationHandleBounds(
    character: Character,
    panel: Panel
  ): { x: number; y: number; radius: number } {
    const bounds = CharacterBounds.getCharacterBounds(character, panel);
    const handleDistance = 35;
    // CharacterBounds.tsのgetRotationHandleBoundsで
const handleRadius = 50; // 12から50に変更（テスト用）
    
    // ここにデバッグログを追加
    console.log("🔍 判定用ハンドル座標:", {
      bounds,
      calculation: `${bounds.y} - ${handleDistance} = ${bounds.y - handleDistance}`
    });
    
    return {
      x: bounds.centerX,                // キャラクター中心X（変更なし）
      y: bounds.y - 35,                 // キャラクター上部35px上（修正済み）
      radius: 12                        // クリック判定半径を12pxに縮小（精度向上）
    };
  }

  // 🎯 回転ハンドルクリック判定
  static isRotationHandleClicked(
    mouseX: number,
    mouseY: number,
    character: Character,
    panel: Panel
  ): boolean {
    const handle = CharacterBounds.getRotationHandleBounds(character, panel);
    const distance = CharacterUtils.calculateDistance(mouseX, mouseY, handle.x, handle.y);
    
    const isClicked = distance <= handle.radius;

    console.log("🔍 回転ハンドル判定詳細:", {
      mousePos: { x: mouseX, y: mouseY },
      handlePos: { x: handle.x, y: handle.y },
      distance,
      radius: handle.radius
    });
    
    if (isClicked) {
      console.log("🔄 回転ハンドルクリック検出!", {
        mousePos: { x: mouseX, y: mouseY },
        handlePos: { x: handle.x, y: handle.y },
        distance,
        radius: handle.radius
      });
    }
    
    return isClicked;
  }

  // CharacterBounds.ts の getHandleClickInfo メソッドを修正
    // 🎯 統合ハンドルクリック判定（修正版）
    static getHandleClickInfo(
    mouseX: number,
    mouseY: number,
    character: Character,
    panel: Panel
    ): { 
    isClicked: boolean; 
    type: "none" | "resize" | "rotate"; // ← ここに"none"追加
    direction?: string 
    } {
    // 以下は既存コード（変更なし）
    if (CharacterBounds.isRotationHandleClicked(mouseX, mouseY, character, panel)) {
        return { isClicked: true, type: "rotate" };
    }
    
    const resizeResult = CharacterBounds.isResizeHandleClicked(mouseX, mouseY, character, panel);
    if (resizeResult.isClicked) {
        return { 
        isClicked: true, 
        type: "resize", 
        direction: resizeResult.direction 
        };
    }
    
    return { isClicked: false, type: "none" };
    }

  // 🎯 キャラクター境界とパネル境界の重複判定
  static isCharacterInPanel(
    character: Character,
    panel: Panel
  ): boolean {
    const charBounds = CharacterBounds.getCharacterBounds(character, panel);
    
    // パネル境界内かチェック
    return (
      charBounds.x >= panel.x &&
      charBounds.y >= panel.y &&
      charBounds.x + charBounds.width <= panel.x + panel.width &&
      charBounds.y + charBounds.height <= panel.y + panel.height
    );
  }

  // 🎯 キャラクター同士の重複判定
  static areCharactersOverlapping(
    character1: Character,
    character2: Character,
    panels: Panel[]
  ): boolean {
    const panel1 = panels.find(p => p.id === character1.panelId);
    const panel2 = panels.find(p => p.id === character2.panelId);
    
    if (!panel1 || !panel2) return false;
    
    const bounds1 = CharacterBounds.getCharacterBounds(character1, panel1);
    const bounds2 = CharacterBounds.getCharacterBounds(character2, panel2);
    
    // 矩形重複判定
    return !(
      bounds1.x + bounds1.width < bounds2.x ||
      bounds2.x + bounds2.width < bounds1.x ||
      bounds1.y + bounds1.height < bounds2.y ||
      bounds2.y + bounds2.height < bounds1.y
    );
  }

  // 🎯 スナップ位置計算
  static calculateSnapPosition(
    character: Character,
    panel: Panel,
    snapSettings: { enabled: boolean; gridSize: number; sensitivity: number }
  ): { x: number; y: number } {
    if (!snapSettings.enabled) {
      return { x: character.x, y: character.y };
    }
    
    const bounds = CharacterBounds.getCharacterBounds(character, panel);
    const { gridSize } = snapSettings;
    
    // グリッドに最も近い位置を計算
    const snappedX = Math.round(bounds.centerX / gridSize) * gridSize;
    const snappedY = Math.round(bounds.centerY / gridSize) * gridSize;
    
    // キャラクター座標系に戻す
    if (character.isGlobalPosition) {
      return { x: snappedX, y: snappedY };
    } else {
      return {
        x: (snappedX - panel.x) / panel.width,
        y: (snappedY - panel.y) / panel.height
      };
    }
  }

  // 🎯 デバッグ用境界情報出力
  static debugBoundsInfo(
    character: Character,
    panel: Panel,
    operation: string
  ): void {
    const bounds = CharacterBounds.getCharacterBounds(character, panel);
    const rotation = character.rotation || 0;
    
    console.log(`🔍 境界デバッグ [${operation}]:`, {
      character: character.name,
      bounds: {
        x: Math.round(bounds.x),
        y: Math.round(bounds.y),
        width: Math.round(bounds.width),
        height: Math.round(bounds.height),
        centerX: Math.round(bounds.centerX),
        centerY: Math.round(bounds.centerY)
      },
      rotation: Math.round(rotation),
      panel: {
        id: panel.id,
        x: panel.x,
        y: panel.y,
        width: panel.width,
        height: panel.height
      }
    });
  }
}