import { http, HttpResponse } from 'msw';

export const handlers = [
    // Mock GET /tasks
    http.get('*/tasks', () => {
        return HttpResponse.json([
            { id: 1, title: 'Mock Task 1', status: 'TODO', projectId: 10 },
            { id: 2, title: 'Mock Task 2', status: 'IN_PROGRESS', projectId: 10 },
        ]);
    }),

    // Mock POST /auth/login
    http.post('*/auth/login', async ({ request }) => {
        const info = await request.json();

        // @ts-ignore
        if (info.username === 'error') {
            return new HttpResponse(null, { status: 401 });
        }

        return HttpResponse.json({
            accessToken: 'mock-access-token',
            idToken: 'mock-id-token',
            // @ts-ignore
            username: info.username
        });
    }),
];