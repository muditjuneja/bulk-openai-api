
import { RequestOptions } from './types/request-options';
import { RequestResult } from './types/result';
import fs from 'fs';
import Papa from 'papaparse';
import { Configuration, OpenAIApi } from 'openai';
import Database from 'better-sqlite3';


export class BulkOpenAIApi {
    private readonly apiKey: string;
    private readonly apiUrl: string = 'https://api.openai.com/v1/chat/completions';
    private db: Database.Database | null = null;
    private openAiClient: OpenAIApi;

    constructor(apiKey: string, dbPath: string = 'responses.db', recreateDB: boolean = false) {
        this.apiKey = apiKey;
        this.openAiClient = new OpenAIApi(new Configuration({
            apiKey: this.apiKey,
        }));

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
        this.db = new Database(dbPath);
        if (this.db) {
            console.log('creating your database');
            this.createResponsesTable(this.db);

        } else {
            throw new Error("Unable to create the db. Something is wrong");
        }
    }

    private createResponsesTable(db: Database.Database): void {
        console.log('creating the table to hold responses');
        try {
            db.prepare(`
            CREATE TABLE IF NOT EXISTS responses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            gptPrompt TEXT,
            response TEXT,
            options BLOB
            )`).run();
        } catch (error) {
            throw error;
        }

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


    buildOpenAiRequestObject(options: RequestOptions) {
        const baseObj = {
            max_tokens: options.maxTokens ? options.maxTokens : 256,
            temperature: options.temperature ? options.temperature : 0,
            top_p: options.top_p,
            n: options.n,
            stream: options.stream,
            stop: options.stop,
            presence_penalty: options.presence_penalty,
            frequency_penalty: options.frequency_penalty,
            logit_bias: options.logit_bias,
            user: options.user,
        }
        if (!options.promptType) {
            const reqObj = {
                ...baseObj,
                model: options.model || "gpt-3.5-turbo",
                messages: options.messages || [{ role: "user", content: options.prompt }],
            }
            return reqObj;
        } else if (options.promptType == 'completion') {
            const reqObj = {
                ...baseObj,
                model: options.model || "text-davinci-003",
                prompt: options.prompt,
            }
            return reqObj;
        }
    }

    async makeChatRequest(reqObj: any): Promise<RequestResult> {
        try {
            console.log("calling chat request with model - ", reqObj.model);
            const completion = await this.openAiClient.createChatCompletion({ ...reqObj });
            let content = completion ? completion.data.choices[0].message?.content : '';
            return { prompt: reqObj.prompt, response: content };

        } catch (error) {
            console.error(`API request failed: ${(error as Error).message}`);
            throw error;
        }
    }


    async makeGenericCompletionRequest(reqObj: any): Promise<RequestResult> {
        try {
            console.log("calling generic completion request with model - ", reqObj.model);
            const response = await this.openAiClient.createCompletion({
                ...reqObj
            });
            let content = response.data.choices[0].text;
            return { prompt: reqObj.prompt, response: content, };

        } catch (error) {
            console.error(`API request failed: ${(error as Error).message}`);
            throw error;
        }
    }


    async makeRequest(options: RequestOptions): Promise<any> {
        const reqObj = this.buildOpenAiRequestObject(options);
        if (!options.promptType) {
            return this.makeChatRequest(reqObj)
        } else if (options.promptType == 'completion') {
            return this.makeGenericCompletionRequest(reqObj)
        }
    }


    async makeNRequests(prompts: string[], options: RequestOptions): Promise<(any | null)[]> {
        if (prompts.length === 0) {
            throw new Error("Empty or no array passed");
        }
        const requests = prompts.map(async (prompt) => {
            try {
                const response = await this.makeRequest({ ...options, prompt });
                const result = { gptPrompt: prompt, response: response.response, options: JSON.stringify({ ...options }) };
                if (this.db) {
                    this.writeResponseToDB(result);
                }
                return result;
            } catch (error) {
                console.error(`Error making API request: ${(error as Error).message}`);
                return null;
            }
        });

        const responses = await Promise.all(requests);
        return responses;
    }

    private writeResponseToDB(response: any): void {
        console.log("Writing response for : ", response.gptPrompt)
        if (response.gptPrompt && this.db) {
            this.db.prepare(
                `INSERT INTO responses (gptPrompt, response, options)
             VALUES (?, ?, ?)`
            ).run(response.gptPrompt, response.response, response.options);
        }

    }


    async writeDataToCsv(path: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database is not initialized'));
                return;
            }
            const data = this.db.prepare(`SELECT * FROM responses`).all();
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
        });
    }





}
