export const Year8Engine = {
    // 2026年パッチノートに基づく定数
    PROTOTYPE_MULTIPLIER: 1.5,
    MAX_EXPERTISE: 30,

    /**
     * 属性値をYear 8基準に変換
     * @param {number} value - 元の属性値
     * @param {boolean} isPrototype - プロトタイプ化フラグ
     */
    calculateStat(value, isPrototype = false) {
        const base = parseFloat(value) || 0;
        return isPrototype ? (base * this.PROTOTYPE_MULTIPLIER).toFixed(1) : base;
    },

    /**
     * エスカレーション難易度における有効ダメージを推測
     */
    estimateEfficiency(damage, tier) {
        const damageReduction = tier * 0.08; // Tierごとに敵の耐性が8%上昇
        return (damage * (1 - damageReduction)).toFixed(0);
    }
};