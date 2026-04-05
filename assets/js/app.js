/**
 * SHD Intelligence System - Main Application Logic
 */

import { UI } from './ui.js';

class SISApp {
    constructor() {
        this.version = "0.0.1";
        this.isReady = false;
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
    }

    async loadInitialData() {
        // プレースホルダー: data/*.json からのフェッチを想定
        return new Promise(resolve => setTimeout(resolve, 500));
    }
}

// アプリケーション起動
const app = new SISApp();
document.addEventListener('DOMContentLoaded', () => app.init());
