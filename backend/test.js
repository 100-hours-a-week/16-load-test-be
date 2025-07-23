const drawService = require('./services/drawService');

( async () => {
    try {
        const userMessage = "노래하는 장원영을 그려줘";
        console.log("메시지: ", userMessage);

        const prompt = await drawService.createPrompt(userMessage);
        console.log("프롬프트: ", prompt);

        const savedPrompt = await drawService.savePrompt(userMessage);
        console.log("저장된 프롬프트: ", savedPrompt);

        process.exit(0);
    } catch (err) {
        console.error("오류 발생: ", err);
        process.exit(1);
    }
})();
