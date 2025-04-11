/**
 * Copy a response to make sure it can be mutated by the rest of the middleware.
 * To avoid errors "Can't modify immutable headers".
 */
export function copyImageResponse(response: Response) {
    return new Response(response.body, response);
}
