import type { GitBookAnyContext } from '@/lib/context';
import type {
    DocumentBlockOpenAPI,
    DocumentBlockOpenAPIOperation,
    DocumentBlockOpenAPISchemas,
    DocumentBlockOpenAPIWebhook,
} from '@gitbook/api';
import type { Filesystem, OpenAPIParseError, OpenAPIV3xDocument } from '@gitbook/openapi-parser';

/**
 * Type for both OpenAPI & OpenAPIOperation block
 */
export type AnyOpenAPIOperationsBlock = DocumentBlockOpenAPI | DocumentBlockOpenAPIOperation;

/**
 * Type for OpenAPI Schemas block
 */
export type OpenAPISchemasBlock = DocumentBlockOpenAPISchemas;

/**
 * Type for OpenAPI Webhook block
 */
export type OpenAPIWebhookBlock = DocumentBlockOpenAPIWebhook;

/**
 * Arguments for resolving OpenAPI block.
 */
export type ResolveOpenAPIBlockArgs<T> = {
    block: T;
    context: GitBookAnyContext;
};

/**
 * Fetch OpenAPI filesystem result.
 */
export type FetchOpenAPIFilesystemResult =
    | {
          error?: undefined;
          filesystem: Filesystem<OpenAPIV3xDocument> | null;
          specUrl: string | null;
      }
    | FetchOpenAPIFilesystemError;

/**
 * Fetch OpenAPI filesystem error.
 */
type FetchOpenAPIFilesystemError = {
    error: OpenAPIParseError;
    filesystem?: undefined;
    specUrl?: undefined;
};

/**
 * Resolved OpenAPI block result.
 */
export type ResolveOpenAPIBlockResult<T> =
    | { error?: undefined; data: T | null; specUrl: string | null }
    | ResolveOpenAPIBlockError;

/**
 * Resolved OpenAPI block error.
 */
type ResolveOpenAPIBlockError = {
    error: OpenAPIParseError;
    data?: undefined;
    specUrl?: undefined;
};
