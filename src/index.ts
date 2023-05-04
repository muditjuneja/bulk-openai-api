
import { RequestOptions } from './types/request-options';
import { RequestResult } from './types/result';
import fetch from 'node-fetch';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import Papa from 'papaparse';

export class BulkOpenAIApi {
    private readonly apiKey: string;
    private readonly apiUrl: string = 'https://api.openai.com/v1/chat/completions';
    private db: sqlite3.Database | null = null;

    constructor(apiKey: string, dbPath: string = 'responses.db', recreateDB: boolean = false) {
        this.apiKey = apiKey;
        if (dbPath) {
            if (recreateDB) {
                this.deleteDB(dbPath);
                this.initDatabase(dbPath);
            } else {
                this.initDatabase(dbPath);
            }
        }
    }

    private initDatabase(dbPath: string) {
        this.db = new sqlite3.Database(dbPath, async (err) => {
            if (err) {
                console.error(`Error opening database: ${err.message}`);
            } else {
                console.log('Connected to the SQLite database.');
            }
        });
        if (this.db) {
            this.createResponsesTable(this.db);
        }
    }

    private createResponsesTable(db: sqlite3.Database): void {
        db.run(`
            CREATE TABLE IF NOT EXISTS responses (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              gptPrompt TEXT,
              response TEXT,
              model TEXT,
              maxTokens INTEGER
            )
          `, (err) => {
            if (err) {
                console.error(`Error creating table: ${err.message}`);
            } else {
                console.log('Responses table created');
            }
        });
    }

    private deleteDB(dbPath: string): void {
        try {
            fs.unlinkSync(dbPath);
            console.log('Database file deleted for recreation.');
        } catch (err) {
            if (err instanceof Error) {
                const error = err as Error;
                console.error(`Error deleting database file: ${error.message}`);
            }
        }
    }


    async makeRequest(options: RequestOptions & { model: string }): Promise<RequestResult> {
        const { prompt, endpoint, model, maxTokens, ...params } = options;
        const url = this.apiUrl;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages: [{ role: "user", content: prompt }],
                ...params,
            }),
        });

        const data = await response.json();
        if (data.error) {
            console.error(`API request failed: ${data.error.message}`);
            return { prompt, error: data.error.message };
        }

        return { prompt, response: data.choices[0].message.content, ...params };
    }


    async makeNRequests(prompts: string[], options: RequestOptions): Promise<(RequestResult | null)[]> {
        const requests = prompts.map(async (prompt) => {
            try {
                const response = await this.makeRequest({ ...options, prompt, model: 'gpt-3.5-turbo' });

                if (response.error) {
                    console.error(response.error);
                } else {

                    const result = { gptPrompt: prompt, response: response.response, ...options };
                    if (this.db) {
                        this.writeResponseToDB(result);
                    }
                    return result;
                }
            } catch (error) {
                console.error(`Error making API request: ${(error as Error).message}`);
            }
            return null;
        });

        const responses = await Promise.all(requests);
        return responses;
    }

    private writeResponseToDB(response: RequestResult): void {
        console.log("Writing for : ", response.gptPrompt)
        if (response.gptPrompt && this.db) {
            this.db.run(
                `INSERT INTO responses (gptPrompt, response, model, maxTokens)
             VALUES (?, ?, ?, ?)`,
                [response.gptPrompt, response.response, response.model, response.maxTokens],
                (err) => {
                    if (err) {
                        console.error(`Error writing response to database: ${err.message}`);
                    } else {
                        console.log(`Successfully wrote response to database for prompt: ${response.gptPrompt}`);
                    }
                }
            );
        }

    }


    async writeDataToCsv(path: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database is not initialized'));
                return;
            }
            this.db.all(`SELECT * FROM responses`, [], (err, rows: Record<string, unknown>[]) => {
                if (err) {
                    console.error(`Error reading data from database: ${err.message}`);
                    reject(err);
                } else {
                    const data = rows.map(row => {
                        return {
                            gptPrompt: row.gptPrompt,
                            response: row.response,
                            model: row.model,
                            maxTokens: row.maxTokens,
                        }
                    });
                    const csv = Papa.unparse(data, { header: true });
                    fs.writeFile(path, csv, (err) => {
                        if (err) {
                            console.error(`Error writing data to CSV file: ${err.message}`);
                            reject(err);
                        } else {
                            console.log(`Successfully wrote data to CSV file: ${path}`);
                            resolve();
                        }
                    });
                }
            });
        });
    }




}
