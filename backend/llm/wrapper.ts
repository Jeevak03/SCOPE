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
            console.error(`[LLM Error] Attempt ${i + 1}/${retries + 1} failed:`, error.message);

            // Smart Retry Strategy: Only retry for network errors
            if (error.message && (error.message.includes("fetch failed") || error.name === 'AbortError' || error.message.includes("network"))) {
                if (error.name === 'AbortError') {
                    console.warn('[LLM Error] Request timed out.');
                }
                if (i === retries) {
                    console.error("❌ Max retries reached for network failure. Applying fallback.");
                    return JSON.stringify({
                        fallback: true,
                        message: "I'm unable to access live AI services right now, but I can still assist with basic logic."
                    });
                }

                // Exponential backoff
                await new Promise(res => setTimeout(res, 1000 * Math.pow(2, i)));
            } else {
                // Not a network error, don't retry, just break out
                console.error("Non-network error encountered, skipping retry.");
                break;
            }
        }
    }

    // If we've exhausted retries or broken out early due to a non-network error
    // For Gemini/LLM, we want to NEVER crash the system. Provide a fallback response.
    return JSON.stringify({
        fallback: true,
        message: "I'm unable to access live AI services right now, but I can still assist with basic logic."
    });
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

    try {
    console.log("Calling Gemini...");
    console.log("Network status: attempting request...");
        const result = await model.generateContent({
            contents,
            generationConfig: {
                temperature: options.temperature ?? 0.1,
                maxOutputTokens: options.maxTokens,
                responseMimeType: options.jsonMode ? "application/json" : "text/plain",
            }
        }, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        console.log("✅ Gemini text generation request successful.");
        return result.response.text();
    } catch (error) {
        console.error("❌ Gemini text generation request failed:", error);
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
    const retries = options.retries ?? 2;

    let lastError = null;

    for (let i = 0; i <= retries; i++) {
        try {
            if (LLM_PROVIDER === 'gemini') {
                await streamGeminiCompletion(systemPrompt, userPrompt, history, res, options, timeoutMs);
            } else {
                await streamOpenAICompletion(systemPrompt, userPrompt, history, res, options, timeoutMs);
            }
            if (!res.writableEnded) {
                res.write('data: [DONE]\n\n');
                res.end();
            }
            return; // success, break out of retry loop
        } catch (error: any) {
            lastError = error;
            console.error(`[LLM Stream Error] Attempt ${i + 1}/${retries + 1} failed:`, error.message);

            // Handle specific network errors for retry
            if (error.message && (error.message.includes("fetch failed") || error.name === 'AbortError' || error.message.includes("network"))) {
                if (error.name === 'AbortError') {
                    console.warn('[LLM Stream Error] Request timed out.');
                }

                if (i === retries) {
                    console.error("❌ Max retries reached for network failure in stream. Applying fallback.");
                    const fallbackObj = {
                        fallback: true,
                        message: "I'm unable to access live AI services right now, but I can still assist with basic logic."
                    };
                    res.write(`data: ${JSON.stringify({ content: JSON.stringify(fallbackObj) })}\n\n`);
                    res.write('data: [DONE]\n\n');
                    res.end();
                    return;
                }

                // Exponential backoff
                await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
            } else {
                // Not a network error, no retry
                console.error("Non-network error in stream, skipping retry.");
                break;
            }
        }
    }

    // Fallback if all retries fail or loop broken
    const fallbackObj = {
        fallback: true,
        message: "I'm unable to access live AI services right now, but I can still assist with basic logic."
    };
    if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ content: JSON.stringify(fallbackObj) })}\n\n`);
        res.write('data: [DONE]\n\n');
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
        console.log("Calling Gemini for Stream...");
        console.log("Network status: attempting stream request...");
        const result = await model.generateContentStream({
            contents,
            generationConfig: {
                temperature: options.temperature ?? 0.7,
                maxOutputTokens: options.maxTokens,
            }
        }, {
            signal: controller.signal
        });

        for await (const chunk of result.stream) {
            const content = chunk.text();
            if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }
        console.log("✅ Gemini stream request completed successfully.");
    } catch (error) {
        console.error("❌ Gemini stream request failed:", error);
        throw error; // Rethrow to let `streamCompletion` handle retry or fallback logic
    } finally {
        clearTimeout(timeoutId);
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