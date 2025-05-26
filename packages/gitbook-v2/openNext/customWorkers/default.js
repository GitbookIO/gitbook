export default {
    async fetch() {
        return new Response('Hello World', {
            headers: {
                'Content-Type': 'text/plain',
            },
        });
    },
};
