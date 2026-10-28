import { handleOpenAPIProxyOptions, handleOpenAPIProxyRequest } from '@/routes/openapi-proxy';

export const dynamic = 'force-dynamic';

export {
    handleOpenAPIProxyRequest as GET,
    handleOpenAPIProxyRequest as POST,
    handleOpenAPIProxyRequest as PUT,
    handleOpenAPIProxyRequest as DELETE,
    handleOpenAPIProxyRequest as PATCH,
    handleOpenAPIProxyRequest as HEAD,
    handleOpenAPIProxyOptions as OPTIONS,
};
