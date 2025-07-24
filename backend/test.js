const aiService = require('./services/aiService');
import { createClient } from 'redis';
const redisClient = createClient( {url: ''});
await redisClient.connect();


( async () => {
    try {
        const userMessage = "노래하는 장원영을 그려줘";
        console.log("메시지: ", userMessage);

        const payload = await aiService.createDrawingPrompt(userMessage);
        console.log("payload.json: ", payload);

        await redisClient.rpush('test:image:make', JSON.stringify(payload));
        await redisClient.quit();

        process.exit(0);
    } catch (err) {
        console.error("오류 발생: ", err);
        process.exit(1);
    }
})();
