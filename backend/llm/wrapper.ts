import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { Response } from 'express';

dotenv.config({ path: '.env.local' });

const getClient = () => {
    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || process.env.VITE_GEMINI_API_KEY || 'fake-key-for-tests',
        baseURL: process.env.OPENAI_BASE_URL,
    });
};

const defaultModel = process.env.MODEL || 'gpt-4o-mini';

interface CompletionOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    retries?: number;
    timeoutMs?: number;
    jsonMode?: boolean;
}

export const generateCompletion = async (
    systemPrompt: string,
    userPrompt: string,
    history: any[] = [],
    options: CompletionOptions = {}
): Promise<string> => {
    const openai = getClient();
    const retries = options.retries ?? 2;
    const timeoutMs = options.timeoutMs ?? 30000;

    let lastError = null;

    const messages = [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userPrompt }
    ];

    for (let i = 0; i <= retries; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            const completion = await openai.chat.completions.create({
                model: options.model || defaultModel,
                messages: messages as any,
                temperature: options.temperature ?? 0.1,
                max_tokens: options.maxTokens,
                response_format: options.jsonMode ? { type: 'json_object' } : undefined
            }, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (completion.usage) {
                console.log(`[LLM Token Usage] Prompt: ${completion.usage.prompt_tokens}, Completion: ${completion.usage.completion_tokens}, Total: ${completion.usage.total_tokens}`);
            }

            return completion.choices[0].message.content || '';
        } catch (error: any) {
            lastError = error;
            console.warn(`[LLM Error] Attempt ${i + 1}/${retries + 1} failed: ${error.message}`);
            if (error.name === 'AbortError') {
                console.warn('[LLM Error] Request timed out.');
            }
            if (i === retries) break;
            await new Promise(res => setTimeout(res, 1000 * Math.pow(2, i)));
        }
    }

    throw new Error(`Failed to generate completion after ${retries + 1} attempts. Last error: ${lastError?.message}`);
};

export const streamCompletion = async (
    systemPrompt: string,
    userPrompt: string,
    history: any[] = [],
    res: Response,
    options: CompletionOptions = {}
) => {
    const openai = getClient();
    const timeoutMs = options.timeoutMs ?? 60000;

    const messages = [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userPrompt }
    ];

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const stream = await openai.chat.completions.create({
            model: options.model || defaultModel,
            messages: messages as any,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens,
            stream: true,
        }, {
            signal: controller.signal
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

        clearTimeout(timeoutId);
        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error: any) {
        console.error(`[LLM Stream Error] ${error.message}`);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
};

export const parseJSONResponse = (response: string): any => {
    try {
        const match = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const jsonString = match ? match[1] : response;
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Failed to parse LLM JSON response:", response);
        return null;
    }
}
