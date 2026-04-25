/**
 * SIS Core Logic: Year 8 Strategic Calculation Engine
 * 役割: 属性値の1.5倍化、エスカレーション耐性計算、データマージ
 */

export const SIS_CORE = {
    // 2026年パッチ 8.1 規格
    CONSTANTS: {
        PROTOTYPE_MULTIPLIER: 1.5,
        MAX_EXPERTISE: 30,
        TIER_SCALING_BASE: 0.12, // Tier1ごとに敵の有効HPが12%増加
        CRIT_CAP: 0.60,
        HEADSHOT_DIMINISHING_RETURN: 0.8 // エスカレーション後半でのヘッドショット減衰
    },

    /**
     * 1. 属性変換プロセッサ
     * スプレッドシートの数値をYear 8のプロトタイプ品質に変換する
     */
    processAttribute(baseValue, attributeType, isPrototype = false) {
        let value = parseFloat(baseValue) || 0;

        if (isPrototype) {
            // プロトタイプ装備は全属性1.5倍（小数点第2位切り捨て）
            value = Math.floor(value * this.CONSTANTS.PROTOTYPE_MULTIPLIER * 100) / 100;
        }

        // 特定属性のキャップ調整
        if (attributeType === 'CHC') {
            value = Math.min(value, this.CONSTANTS.CRIT_CAP);
        }

        return value;
    },

    /**
     * 2. エスカレーション・ダメージ・シミュレーター
     * 特定のTierにおける武器の「実質的な威力」を算出
     */
    calculateEffectiveDPS(baseDPS, tier, isPrototype = false) {
        const expertiseBonus = 1 + (this.CONSTANTS.MAX_EXPERTISE * 0.01); // Expertise 30 = +30%
        const prototypeBonus = isPrototype ? this.CONSTANTS.PROTOTYPE_MULTIPLIER : 1;
        
        // 基礎火力 = (ベース * エキスパート) * プロトタイプ
        const rawPower = (baseDPS * expertiseBonus) * prototypeBonus;

        // エスカレーション耐性による減衰
        // Tier 10では敵の耐久が大幅に上がるため、相対的な効率を計算
        const resistance = 1 + (tier * this.CONSTANTS.TIER_SCALING_BASE);
        const effectiveEfficiency = (rawPower / resistance).toFixed(0);

        return {
            raw: rawPower.toFixed(0),
            efficiency: effectiveEfficiency,
            status: this.getEfficiencyStatus(effectiveEfficiency / baseDPS)
        };
    },

    /**
     * 3. 効率ステータスの判定
     */
    getEfficiencyStatus(ratio) {
        if (ratio > 1.2) return { label: 'OPTIMAL', color: 'text-green-400' };
        if (ratio > 0.8) return { label: 'VIABLE', color: 'text-proto-blue' };
        return { label: 'CRITICAL_LOW', color: 'text-red-500' };
    },

    /**
     * 4. インテリジェンス・マージャー
     * スプレッドシートの武器データと、Year 8のメタ情報を統合
     */
    mergeIntel(sheetData, overrides) {
        return sheetData.map(item => {
            const override = overrides.find(o => o.id === item.id || o.name === item.name);
            return {
                ...item,
                ...override,
                is_prototype_compatible: String(item.rarity ?? '').toLowerCase() === 'exotic' || item.isNamed === true,
                last_synced: new Date().toISOString()
            };
        });
    }
};

/**
 * 5. ビルド・アナライザー (Augmentation Logic)
 * 2026年導入の「アグメンテーション」によるシナジー計算
 */
export const SYNERGY_ENGINE = {
    checkCompatibility(gearSetId, augmentType) {
        const synergies = {
            'core_strength': 'Quantum', // コアストレングスはクォンタムと相性良
            'strikers_remastered': 'Echo',
            'aegis_reflector': 'Atomize'
        };
        return synergies[gearSetId] === augmentType;
    }
};