// DataService.js (新規想定)
export class DataService {
    constructor() {
        // スプレッドシートのCSV出力URL (Weaponsタブの例)
        this.SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-...-yEfL/pub?gid=2130349603&output=csv";
    }

    async fetchWeapons() {
        try {
            const response = await fetch(this.SHEET_URL);
            const csvText = await response.text();
            return this.parseCSV(csvText);
        } catch (error) {
            console.error("Intel Acquisition Failed:", error);
            return [];
        }
    }

    parseCSV(csv) {
        // CSVパースロジック（簡易版）
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        return lines.slice(1).map(line => {
            const values = line.split(',');
            return headers.reduce((obj, header, i) => {
                obj[header.trim()] = values[i]?.trim();
                return obj;
            }, {});
        });
    }
}

// app.js での利用
import { DataService } from './DataService.js';

// init内での呼び出し例
const dataService = new DataService();
const weaponIntel = await dataService.fetchWeapons();
console.log(`Detected ${weaponIntel.length} weapons in field manual.`);