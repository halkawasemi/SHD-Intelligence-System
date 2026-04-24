/**
 * SHD Intelligence System - Calculation Engine
 * エスカレーション Tier スケーリングと武器効率の推定
 */

/**
 * 各 Tier での敵アーマー/ダメージ係数 (Tier 1 を基準 1.00 とした乗数)
 * Tier 1-3: 低難易度、Tier 4-6: 中難易度、Tier 7-9: 高難易度、Tier 10: レジェンダリー
 */
const TIER_MULTIPLIERS = [1.00, 1.05, 1.12, 1.20, 1.30, 1.42, 1.56, 1.72, 1.90, 2.10];

/**
 * 指定した Escalation Tier における武器の推定有効ダメージを返す。
 * 敵のアーマー係数の増加を考慮し、同等の効率を維持するために
 * 必要な実効ダメージを算出する。
 *
 * @param {number} tier - Escalation Tier (1〜10)
 * @param {number} baseDamage - Tier 1 基準の武器ダメージ数値
 * @returns {number} 推定有効ダメージ (整数)
 */
export function estimateEfficiency(tier, baseDamage) {
    const clampedTier = Math.max(1, Math.min(10, Math.floor(tier)));
    const multiplier = TIER_MULTIPLIERS[clampedTier - 1];
    return Math.round(baseDamage * multiplier);
}

/**
 * Tier に対応する CSS カラー変数名を返す。
 * @param {number} tier
 * @returns {string} CSS color value
 */
export function getTierColor(tier) {
    if (tier <= 3) return 'var(--tier-low)';
    if (tier <= 6) return 'var(--tier-mid)';
    if (tier <= 9) return 'var(--tier-high)';
    return 'var(--tier-legendary)';
}

/**
 * Tier の難易度ラベルを返す。
 * @param {number} tier
 * @returns {string}
 */
export function getTierLabel(tier) {
    if (tier <= 3) return 'LOW';
    if (tier <= 6) return 'MODERATE';
    if (tier <= 9) return 'HIGH';
    return 'LEGENDARY';
}
