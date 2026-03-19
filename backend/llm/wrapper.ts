import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { Response } from 'express';

dotenv.config({ path: '.env.local' });

// Determine the active provider
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'gemini'; // Default to gemini to ensure it runs

// Initialize OpenAI
const getOpenAIClient = () => {
    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || 'fake-key-for-tests',
        baseURL: process.env.OPENAI_BASE_URL,
    });
};

// Initialize Gemini
const getGeminiClient = () => {
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || 'fake-key-for-tests');
};

const defaultOpenAIModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const defaultGeminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

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
    const retries = options.retries ?? 2;
    const timeoutMs = options.timeoutMs ?? 30000;

    let lastError = null;

    for (let i = 0; i <= retries; i++) {
        try {
            if (LLM_PROVIDER === 'gemini') {
                return await generateGeminiCompletion(systemPrompt, userPrompt, history, options, timeoutMs);
            } else {
                return await generateOpenAICompletion(systemPrompt, userPrompt, history, options, timeoutMs);
            }
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

const generateOpenAICompletion = async (
    systemPrompt: string,
    userPrompt: string,
    history: any[],
    options: CompletionOptions,
    timeoutMs: number
): Promise<string> => {
    const openai = getOpenAIClient();
    const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userPrompt }
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const completion = await openai.chat.completions.create({
        model: options.model || defaultOpenAIModel,
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
};

function validateContents(contents: any[]) {
    if (!contents.length || contents[0].role !== "user") {
        throw new Error("Gemini requires first role to be 'user'");
    }
}

const generateGeminiCompletion = async (
    systemPrompt: string,
    userPrompt: string,
    history: any[],
    options: CompletionOptions,
    timeoutMs: number
): Promise<string> => {
    console.log("Using Gemini API...");
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
        model: options.model || defaultGeminiModel,
        systemInstruction: systemPrompt,
    });

    // Map history to Gemini format
    let contents = history.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
    }));

    // Always append the current user prompt
    contents.push({
        role: 'user',
        parts: [{ text: userPrompt }]
    });

    // Remove any leading messages that are not from the user
    while (contents.length > 0 && contents[0].role !== 'user') {
        contents.shift();
    }

    validateContents(contents);

    console.log("Gemini Request:", JSON.stringify(contents, null, 2));

    const controller = new AbortController();
    let timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const resultPromise = model.generateContent({
        contents,
        generationConfig: {
            temperature: options.temperature ?? 0.1,
            maxOutputTokens: options.maxTokens,
            responseMimeType: options.jsonMode ? "application/json" : "text/plain",
        }
    });
    const timeoutPromise = new Promise((_, reject) => {
        clearTimeout(timeoutId); // Clear the initial one so we don't leak it
        timeoutId = setTimeout(() => reject(new Error('AbortError')), timeoutMs);
    });

    try {
        const result: any = await Promise.race([resultPromise, timeoutPromise]);
        clearTimeout(timeoutId);
        return result.response.text();
    } catch (error) {
        console.error("Gemini Error:", error);
        clearTimeout(timeoutId);
        throw error;
    }
};


export const streamCompletion = async (
    systemPrompt: string,
    userPrompt: string,
    history: any[] = [],
    res: Response,
    options: CompletionOptions = {}
) => {
    const timeoutMs = options.timeoutMs ?? 60000;

    try {
        if (LLM_PROVIDER === 'gemini') {
            await streamGeminiCompletion(systemPrompt, userPrompt, history, res, options, timeoutMs);
        } else {
            await streamOpenAICompletion(systemPrompt, userPrompt, history, res, options, timeoutMs);
        }
    } catch (error: any) {
        console.error(`[LLM Stream Error] ${error.message}`);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
};

const streamOpenAICompletion = async (
    systemPrompt: string,
    userPrompt: string,
    history: any[],
    res: Response,
    options: CompletionOptions,
    timeoutMs: number
) => {
    const openai = getOpenAIClient();
    const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userPrompt }
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const stream = await openai.chat.completions.create({
        model: options.model || defaultOpenAIModel,
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
};

const streamGeminiCompletion = async (
    systemPrompt: string,
    userPrompt: string,
    history: any[],
    res: Response,
    options: CompletionOptions,
    timeoutMs: number
) => {
    console.log("Using Gemini API...");
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
        model: options.model || defaultGeminiModel,
        systemInstruction: systemPrompt,
    });

    let contents = history.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
    }));

    contents.push({
        role: 'user',
        parts: [{ text: userPrompt }]
    });

    while (contents.length > 0 && contents[0].role !== 'user') {
        contents.shift();
    }

    validateContents(contents);

    console.log("Gemini Request:", JSON.stringify(contents, null, 2));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const result = await model.generateContentStream({
            contents,
            generationConfig: {
                temperature: options.temperature ?? 0.7,
                maxOutputTokens: options.maxTokens,
            }
        });

        for await (const chunk of result.stream) {
            const content = chunk.text();
            if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }
    } catch (error) {
        console.error("Gemini Error:", error);
        res.write(`data: ${JSON.stringify({ error: "AI processing failed. Please retry." })}\n\n`);
    } finally {
        clearTimeout(timeoutId);
        res.write('data: [DONE]\n\n');
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