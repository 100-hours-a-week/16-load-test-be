const aiService = require('./services/aiService');
const config = require('./config/keys');
const { createClient } = require('redis');


( async () => {
    const redisClient = createClient({
            socket: {
                host: config.redisHost,
                port: Number(config.redisPort),
            },
            ...(config.redispassword && { password: config.redispassword }),
        });

    try {
        await redisClient.connect();
        const userMessage = "개발에 지친 개발자 그려줘";
        console.log("메시지: ", userMessage);

        const payload = await aiService.createDrawingPrompt(userMessage);
        console.log("payload.json: ", payload);

        await redisClient.rPush('test:image:make', JSON.stringify(payload));

        const completionQueue = `completed:image:${payload.id}`;

        const result = await redisClient.blPop(completionQueue, 0);
        if (!result) {
            throw new Error("BLPOP failed")
        }
        const img_url = result.element;
        console.log("이미지 URL: ", img_url);

        await redisClient.quit();
        process.exit(0);
    } catch (err) {
        console.error("오류 발생: ", err);
        process.exit(1);
    }
})();
