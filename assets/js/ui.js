/**
 * SHD Intelligence System - UI Logic
 */

export const UI = {
    render(id, html) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    },

    components: {
        weaponCard(name, damage, isProto) {
            const borderClass = isProto ? 'border-proto-blue shadow-[0_0_10px_#00D1FF]' : 'border-isac-orange/30';
            const textClass = isProto ? 'text-proto-blue' : 'text-isac-orange';

            return `
                <div class="isac-panel p-4 border ${borderClass} transition-all duration-500">
                    <div class="flex justify-between items-start">
                        <h3 class="font-isac text-sm">${name}</h3>
                        ${isProto ? '<span class="text-[8px] bg-proto-blue/20 p-1">PROTOTYPE</span>' : ''}
                    </div>
                    <div class="mt-4">
                        <span class="text-[10px] opacity-50">ESTIMATED DMG (Y8):</span>
                        <div class="text-2xl font-bold ${textClass}">${damage}</div>
                    </div>
                </div>
            `;
        }
    },

    bootSequence() {
        console.log("ISAC: System Boot Initiated...");
        // 起動演出などをここに実装
    }
};