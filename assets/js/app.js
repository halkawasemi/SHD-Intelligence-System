/**
 * SHD Intelligence System - Core Engine v0.0.2
 */
import { UI } from './ui.js';
import { DataService } from './DataService.js'; // 前回の提案に基づき作成

class SISApp {
    constructor() {
        this.dataService = new DataService();
        this.intel = { weapons: [], gear: [], exotics: [] };
        this.state = { currentTier: 5, showPrototype: false };
    }

    async init() {
        UI.init();
        // ローディング画面の表示
        UI.render('app-container', '<div class="animate-pulse font-isac">DOWNLOADING ENCRYPTED DATA...</div>');

        try {
            // スプレッドシートとローカルJSONの並列ロード
            const [sheetWeapons, localExotics] = await Promise.all([
                this.dataService.fetchWeapons(),
                fetch('data/exotics.json').then(res => res.json())
            ]);

            this.intel.weapons = sheetWeapons;
            this.intel.exotics = localExotics.exotics;

            this.renderDashboard();
            console.log("Strategic Intel Synced.");
        } catch (error) {
            UI.render('app-container', `<div class="text-red-500">ERROR: DATA CORRUPTION DETECTED.</div>`);
        }
    }

    // Year 8 プロトタイプ計算ロジック
    calculatePrototypeStat(baseValue) {
        return (parseFloat(baseValue) * 1.5).toFixed(1);
    }

    renderDashboard() {
        // UI.js を介して、変換後のデータをダッシュボードに反映
        const latestExotic = this.intel.exotics[0];
        const html = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="isac-panel p-6 border-l-4 border-proto-blue">
                    <h2 class="font-isac text-xl text-proto-blue">FIELD ANALYSIS: ${latestExotic.name}</h2>
                    <p class="text-xs mt-2">${latestExotic.talent}</p>
                    <div class="mt-4 text-[10px] text-isac-text/40">
                        SOURCE: <span class="text-white">${latestExotic.drop_source}</span>
                    </div>
                </div>
            </div>
        `;
        UI.render('app-container', html);
    }
}