/**
 * SHD Intelligence System - UI Logic
 */

export const UI = {
    init() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        console.log("ISAC UI System Initialized.");
    },

    updateClock() {
        const clockEl = document.getElementById('clock');
        if (clockEl) {
            const now = new Date();
            clockEl.textContent = now.toLocaleTimeString('ja-JP', { hour12: false });
        }
    },

    /**
     * 特定のコンテナにコンテンツを描画する
     * @param {string} containerId 
     * @param {string} html 
     */
    render(containerId, html) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = html;
        }
    }
};
