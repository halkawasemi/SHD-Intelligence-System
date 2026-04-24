export class DataService {
    constructor() {
        // スプレッドシートのCSV出力URL
        this.SHEET_URLS = {
            weapons: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTJEX5DerCvOj3a_m36TRy1gPBAUvrduOIdmXI9j1Y0MpQk1wIXaZ9KOcPa7HzXzp_N5qGmjDj6yEfL/pub?gid=2130349603&output=csv",
            exotics: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTJEX5DerCvOj3a_m36TRy1gPBAUvrduOIdmXI9j1Y0MpQk1wIXaZ9KOcPa7HzXzp_N5qGmjDj6yEfL/pub?gid=603810878&output=csv"
        };
    }

    /**
     * CSVデータを取得しJSONに変換する
     * Gemini CLIで拡張可能: 他のタブ(gid)を追加するだけで全データ取得可能
     */
    async fetchFromSheet(type) {
        const response = await fetch(this.SHEET_URLS[type]);
        const csv = await response.text();
        return this.parseCSV(csv);
    }

    parseCSV(csv) {
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        return lines.slice(1).map(line => {
            const values = line.split(',');
            return headers.reduce((obj, header, i) => {
                obj[header] = values[i]?.trim();
                return obj;
            }, {});
        });
    }
}