/**
 * SHD Intelligence System - Core Engine v0.0.2
 */

import { DataService } from './data-service.js';
import { Year8Engine } from './engine.js';
import { UI } from './ui.js';

class SISCore {
    constructor() {
        this.data = new DataService();
        this.state = {
            prototypeMode: false,
            currentTier: 5,
            intel: []
        };
    }

    async init() {
        UI.bootSequence();
        
        // データの並列ロード
        const [weapons, localData] = await Promise.all([
            this.data.fetchFromSheet('weapons'),
            fetch('data/exotics.json').then(res => res.json())
        ]);

        this.state.intel = weapons;
        this.renderWeaponList();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // プロトタイプ・トグルの監視
        document.getElementById('proto-toggle')?.addEventListener('change', (e) => {
            this.state.prototypeMode = e.target.checked;
            this.renderWeaponList();
        });
    }

    renderWeaponList() {
        const container = document.getElementById('weapon-grid');
        const listHtml = this.state.intel.slice(0, 10).map(w => {
            const dmg = Year8Engine.calculateStat(w.baseDamage, this.state.prototypeMode);
            return UI.components.weaponCard(w.name, dmg, this.state.prototypeMode);
        }).join('');
        
        UI.render('weapon-grid', listHtml);
    }
}

const app = new SISCore();
window.addEventListener('DOMContentLoaded', () => app.init());