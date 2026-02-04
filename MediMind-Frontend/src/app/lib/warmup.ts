export const warmUpAIInstance = async () => {
    try {
        fetch(process.env.NEXT_PUBLIC_AI_URL as string, {
            method: 'GET',
            keepalive: true, // important for background requests
        });
    } catch {
        // intentionally silent
    }
};
