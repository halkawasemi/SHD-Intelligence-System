import { SIS_CORE } from './core-logic.js';

export class DataService {
    constructor() {
        // スプレッドシートのCSV出力URL
        this.SHEET_URLS = {
            weapons: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTJEX5DerCvOj3a_m36TRy1gPBAUvrduOIdmXI9j1Y0MpQk1wIXaZ9KOcPa7HzXzp_N5qGmjDj6yEfL/pubhtml#gid=1653126375&output=csv",
            exotics: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTJEX5DerCvOj3a_m36TRy1gPBAUvrduOIdmXI9j1Y0MpQk1wIXaZ9KOcPa7HzXzp_N5qGmjDj6yEfL/pub?gid=603810878&output=csv"
        };

        // キャッシュ有効期限: 30分
        this.CACHE_TTL_MS = 30 * 60 * 1000;

        /**
         * スキーマ正規化マッピング
         * スプレッドシートのヘッダー名 → { key: camelCaseキー, type: 変換型 }
         * type: 'string' | 'number' | 'boolean'
         */
        this.fieldMappings = {
            weapons: {
                'Weapon Name':  { key: 'name',          type: 'string'  },
                'Weapon':       { key: 'name',          type: 'string'  },
                'Damage':       { key: 'baseDamage',    type: 'number'  },
                'RPM':          { key: 'rpm',           type: 'number'  },
                'Magazine':     { key: 'magazine',      type: 'number'  },
                'Reload Speed': { key: 'reloadSpeed',   type: 'number'  },
                'Range':        { key: 'range',         type: 'number'  },
                'Accuracy':     { key: 'accuracy',      type: 'number'  },
                'Stability':    { key: 'stability',     type: 'number'  },
                'Handling':     { key: 'handling',      type: 'number'  },
                'Rarity':       { key: 'rarity',        type: 'string'  },
                'Type':         { key: 'category',      type: 'string'  },
                'Category':     { key: 'category',      type: 'string'  },
                'Named':        { key: 'isNamed',       type: 'boolean' },
                'Talent':       { key: 'talent',        type: 'string'  },
                'Talent Name':  { key: 'talentName',    type: 'string'  },
                'Mod Slots':    { key: 'modSlots',      type: 'number'  },
                'Source':       { key: 'dropSource',    type: 'string'  },
                'Drop Source':  { key: 'dropSource',    type: 'string'  },
            },
            exotics: {
                'Name':         { key: 'name',          type: 'string'  },
                'Weapon Name':  { key: 'name',          type: 'string'  },
                'Category':     { key: 'category',      type: 'string'  },
                'Type':         { key: 'category',      type: 'string'  },
                'Talent':       { key: 'talent',        type: 'string'  },
                'Talent Name':  { key: 'talentName',    type: 'string'  },
                'Damage':       { key: 'baseDamage',    type: 'number'  },
                'RPM':          { key: 'rpm',           type: 'number'  },
                'Magazine':     { key: 'magazine',      type: 'number'  },
                'Drop Source':  { key: 'dropSource',    type: 'string'  },
                'Source':       { key: 'dropSource',    type: 'string'  },
                'Named':        { key: 'isNamed',       type: 'boolean' },
                'Rarity':       { key: 'rarity',        type: 'string'  },
            },
            gearSets: {
                'Set Name':      { key: 'name',              type: 'string'  },
                'Name':          { key: 'name',              type: 'string'  },
                'Type':          { key: 'type',              type: 'string'  },
                'Set Bonus (2)': { key: '_bonus2',           type: 'string'  },
                'Set Bonus (3)': { key: '_bonus3',           type: 'string'  },
                'Set Bonus (4)': { key: '_bonus4',           type: 'string'  },
                'Set Bonus (6)': { key: '_bonus6',           type: 'string'  },
                'Prototype':     { key: '_protoCompatible',  type: 'boolean' },
            }
        };
    }

    // ─────────────────────────────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────────────────────────────

    /**
     * fetch → CSV parse → Standardize (JSON変換) → Cache のフローで実行
     * @param {string} type - シートタイプ ('weapons' | 'exotics' | 'gearSets')
     * @returns {Promise<Object[]>} SIS標準JSON形式に変換されたオブジェクトの配列
     */
    async fetchFromSheet(type) {
        // 1. ローカルキャッシュを確認
        const cached = this._loadCache(type);
        if (cached) return cached;

        // 2. CSVフェッチ
        const response = await fetch(this.SHEET_URLS[type]);
        const csv = await response.text();

        // 3. CSVパース → 生の行オブジェクト配列
        const rawRows = this.parseCSV(csv);

        // 4. 標準化 (スキーマ正規化 + 型変換 + ネスト構築 + Year 8フラグ付与)
        const standardized = this._standardize(rawRows, type);

        // 5. 変換済みデータをキャッシュに保存
        this._saveCache(type, standardized);

        return standardized;
    }

    /**
     * 指定シートのローカルキャッシュを削除する（強制リフレッシュ用）
     * @param {string} [type] - 省略時は全シートのキャッシュを削除
     */
    clearCache(type) {
        if (type) {
            localStorage.removeItem(this._cacheKey(type));
        } else {
            Object.keys(this.SHEET_URLS).forEach(t => localStorage.removeItem(this._cacheKey(t)));
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // CSV パーサー
    // ─────────────────────────────────────────────────────────────────

    /**
     * CSV文字列を生の行オブジェクト配列に変換する
     */
    parseCSV(csv) {
        const lines = csv.split('\n').filter(l => l.trim());
        if (lines.length < 2) return [];
        const headers = this._splitCSVLine(lines[0]);
        return lines.slice(1).map(line => {
            const values = this._splitCSVLine(line);
            return headers.reduce((obj, header, i) => {
                obj[header] = values[i] ?? '';
                return obj;
            }, {});
        }).filter(row => Object.values(row).some(v => v !== ''));
    }

    /**
     * RFC 4180 準拠のCSV行分割: ダブルクォートで囲まれたカンマを正しく処理する
     */
    _splitCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    // エスケープされたダブルクォート ("") → リテラルの " として扱い次の " をスキップ
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (ch === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += ch;
            }
        }
        result.push(current.trim());
        return result;
    }

    // ─────────────────────────────────────────────────────────────────
    // 標準化エンジン
    // ─────────────────────────────────────────────────────────────────

    /**
     * 生の行オブジェクト配列をSIS標準JSON形式に変換する
     * スキーマ正規化・型変換・ネスト構築・Year 8フラグ付与を一括で処理する
     */
    _standardize(rawRows, type) {
        const mapping = this.fieldMappings[type] ?? {};
        return rawRows.map(raw => {
            const out = {};
            for (const [header, rawVal] of Object.entries(raw)) {
                const def = mapping[header];
                if (!def) continue; // マッピング未定義のヘッダーはスキップ
                out[def.key] = this._convertType(rawVal, def.type);
            }

            // ギアセット専用: ボーナスのネスト構造を構築
            if (type === 'gearSets') {
                out.bonuses = {};
                for (const pieceKey of ['_bonus2', '_bonus3', '_bonus4', '_bonus6']) {
                    if (out[pieceKey] !== undefined && out[pieceKey] !== '') {
                        const pieceNum = pieceKey.replace('_bonus', '');
                        out.bonuses[`piece${pieceNum}`] = out[pieceKey];
                    }
                    delete out[pieceKey];
                }
                // _protoCompatible を標準キー名に昇格
                out.isPrototypeCompatible = out._protoCompatible ?? false;
                delete out._protoCompatible;
            }

            // Year 8 互換フラグ (武器・エキゾチック)
            if (type === 'weapons' || type === 'exotics') {
                out.isPrototypeCompatible = this._checkPrototypeCompatibility(out);
            }

            // 同期タイムスタンプ
            out.last_synced = new Date().toISOString();
            return out;
        }).filter(item => item.name); // name が空の不完全な行を除外
    }

    /**
     * 型変換プロセッサ
     * @param {string} value - 変換前の文字列値
     * @param {'string'|'number'|'boolean'} type - 変換後の型
     * @returns {string|number|boolean|null}
     */
    _convertType(value, type) {
        if (value === undefined || value === null || value === '') {
            if (type === 'number' || type === 'boolean') return null;
            return '';
        }
        switch (type) {
            case 'number': {
                const n = parseFloat(String(value).replace(/,/g, ''));
                return isNaN(n) ? null : n;
            }
            case 'boolean':
                return /^yes$/i.test(String(value).trim()) ? true
                    : /^no$/i.test(String(value).trim()) ? false
                    : null;
            default:
                return String(value);
        }
    }

    /**
     * SIS_CORE ロジックを参照し isPrototypeCompatible フラグを判定する
     * Year 8 仕様: Rarity が Exotic、または Named アイテムがプロトタイプ化の対象
     */
    _checkPrototypeCompatibility(item) {
        const isExotic = String(item.rarity ?? '').toLowerCase() === 'exotic';
        const isNamed  = item.isNamed === true;
        // SIS_CORE の PROTOTYPE_MULTIPLIER が有効 (>1) な場合のみ互換性フラグを立てる
        return (isExotic || isNamed) && SIS_CORE.CONSTANTS.PROTOTYPE_MULTIPLIER > 1;
    }

    // ─────────────────────────────────────────────────────────────────
    // ローカルキャッシュ
    // ─────────────────────────────────────────────────────────────────

    _cacheKey(type) {
        return `sis_cache_${type}`;
    }

    /**
     * キャッシュを読み込む。有効期限切れまたは破損している場合は null を返す。
     */
    _loadCache(type) {
        try {
            const raw = localStorage.getItem(this._cacheKey(type));
            if (!raw) return null;
            const { data, last_synced } = JSON.parse(raw);
            const age = Date.now() - new Date(last_synced).getTime();
            if (age > this.CACHE_TTL_MS) return null;
            return data;
        } catch {
            return null;
        }
    }

    /**
     * 変換済みデータを last_synced タイムスタンプ付きでキャッシュに保存する。
     */
    _saveCache(type, data) {
        try {
            const entry = { data, last_synced: new Date().toISOString() };
            localStorage.setItem(this._cacheKey(type), JSON.stringify(entry));
        } catch {
            // localStorage が利用不可の環境 (プライベートブラウジング等) では無視
        }
    }
}