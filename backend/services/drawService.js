const axios = require('axios');
const { openaiApiKey } = require('../config/keys');
const redisClient = require('../utils/redisClient');

class DrawService {
    constructor() {
        this.openaiClient = axios.create({
            baseURL: 'https://api.openai.com/v1',
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }
    
    async createPrompt(userMessage) {
        const systemPrompt = `
        당신은 Stable Diffusion XL용 프롬프트 작성 전문가입니다.
        사용자의 요청을 받아, 영어로 된 SDXL 모델에 최적화된 60token 이하의 프롬프트를 작성해주세요.

        답변 시 주의사향:
        1. 사용자의 설명을 그대로 반영하되, 영어 SDXL 프롬프트로 재구성하세요.
        2. 오직 프롬프트 텍스트만, 그 외 설명은 생략하고 영어로만 내보내세요.
        3. 프롬프트는 60token 이하로 작성하세요.
        4. 모델이 잘 이해할 수 있도록 구체적이고 명확하게 작성해주세요.
        `.trim();

        const response = await this.openaiClient.post('/chat/completions', {
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            max_tokens: 60,
            temperature: 0.7
        })

        return response.data.choices[0].message.content.trim();
    }

    async savePrompt(userMessage) {
        const promptText = await this.createPrompt(userMessage);

        const payload = {
            id: `prompt-${Date.now()}`,
            userMessage,
            promptText: `MSPaint drawing of ${promptText}`,
            createdAt: new Date().toISOString()
        }

        // await redisClient.rpush(
        //     `sdxl:prompts`,
        //     JSON.stringify(payload)
        // );

        return payload;
    }
}

module.exports = new DrawService();