const AI_BASE_URL = process.env.NEXT_PUBLIC_AI_URL;

export const warmUpAIInstance = () => {
    if (!AI_BASE_URL) return;

    try {
        void fetch(`${AI_BASE_URL}/health`, {
            method: 'GET',
            keepalive: true,
        });
    } catch {
        console.warn('Failed to warm up AI instance');
    }
};