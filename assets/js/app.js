/**
 * SHD Intelligence System - Main Application Logic
 */

import { UI } from './ui.js';
import { estimateEfficiency, getTierColor, getTierLabel } from './engine.js';

/** ダメージ表示に使用するロケール */
const DAMAGE_LOCALE = 'ja-JP';

/** ダメージ推定に使用する武器データ (Tier 1 基準のベースダメージ) */
const WEAPONS = [
    { id: 'agitator',   name: 'Agitator',   category: 'Assault Rifle',    baseDamage: 185_000 },
    { id: 'flatline',   name: 'Flatline',    category: 'Marksman Rifle',   baseDamage: 340_000 },
    { id: 'capacitor',  name: 'Capacitor',   category: 'Assault Rifle',    baseDamage: 172_000 },
    { id: 'chameleon',  name: 'Chameleon',   category: 'Assault Rifle',    baseDamage: 165_000 },
];

class SISApp {
    constructor() {
        this.version = "0.0.1";
        this.isReady = false;
        this.currentTier = 1;
    }

    async init() {
        console.log(`Initializing SIS v${this.version}...`);
        
        // UI初期化
        UI.init();

        // 将来的なデータロード
        try {
            await this.loadInitialData();
            this.isReady = true;
            console.log("System Ready. All Intel loaded.");
        } catch (error) {
            console.error("System Initialization Failed:", error);
        }

        // エスカレーション Tier スライダーの初期化
        this.initTierSlider();
    }

    async loadInitialData() {
        // プレースホルダー: data/*.json からのフェッチを想定
        return new Promise(resolve => setTimeout(resolve, 500));
    }

    /**
     * エスカレーション Tier スライダーをセットアップし、
     * 値変化時に武器カードのダメージ数値を更新する。
     */
    initTierSlider() {
        const slider = document.getElementById('tier-slider');
        if (!slider) return;

        // 初期描画
        this.renderWeaponCards(this.currentTier);

        slider.addEventListener('input', (e) => {
            this.currentTier = parseInt(e.target.value, 10);
            this.updateWeaponCards(this.currentTier);
            this.updateTierDisplay(this.currentTier);
        });
    }

    /**
     * 武器カードを初回描画する。
     * @param {number} tier
     */
    renderWeaponCards(tier) {
        const container = document.getElementById('weapon-cards');
        if (!container) return;

        const color = getTierColor(tier);

        container.innerHTML = WEAPONS.map(w => {
            const damage = estimateEfficiency(tier, w.baseDamage);
            return `
                <div class="weapon-card" data-weapon-id="${w.id}">
                    <div class="text-[9px] text-isac-orange/50 font-isac mb-1">${w.category}</div>
                    <div class="text-xs text-isac-text/80 font-bold mb-2">${w.name}</div>
                    <div class="text-[9px] text-isac-text/40 mb-1">推定有効ダメージ</div>
                    <div class="weapon-damage" style="color: ${color};">${damage.toLocaleString(DAMAGE_LOCALE)}</div>
                </div>`;
        }).join('');
    }

    /**
     * スライダー変化時に武器カードのダメージ数値のみを書き換える。
     * @param {number} tier
     */
    updateWeaponCards(tier) {
        const color = getTierColor(tier);

        WEAPONS.forEach(w => {
            const card = document.querySelector(`[data-weapon-id="${w.id}"]`);
            if (!card) return;
            const damageEl = card.querySelector('.weapon-damage');
            if (!damageEl) return;

            const damage = estimateEfficiency(tier, w.baseDamage);
            damageEl.textContent = damage.toLocaleString(DAMAGE_LOCALE);
            damageEl.style.color = color;
        });
    }

    /**
     * Tier 番号表示・ラベル・カラーを更新する。
     * @param {number} tier
     */
    updateTierDisplay(tier) {
        const color = getTierColor(tier);
        const label = getTierLabel(tier);

        const tierDisplay = document.getElementById('tier-display');
        const tierLabel   = document.getElementById('tier-label');

        if (tierDisplay) {
            tierDisplay.textContent = tier;
            tierDisplay.style.color = color;
            tierDisplay.style.textShadow = `0 0 10px ${color}`;
        }
        if (tierLabel) {
            tierLabel.textContent = label;
            tierLabel.style.color = color;
            tierLabel.style.borderColor = color;
        }
    }
}

// アプリケーション起動
const app = new SISApp();
document.addEventListener('DOMContentLoaded', () => app.init());

