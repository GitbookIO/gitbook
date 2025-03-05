import type { DocumentBlockOpenAPI, DocumentBlockOpenAPIOperation } from '@gitbook/api';
import type { Filesystem, OpenAPIParseError, OpenAPIV3xDocument } from '@gitbook/openapi-parser';
import type { OpenAPIModelsData, OpenAPIOperationData } from '@gitbook/react-openapi';
import type { GitBookAnyContext } from '@v2/lib/context';

//!!TODO: Add DocumentBlockOpenAPIModels when available in @gitbook/api
export type AnyOpenAPIBlock = DocumentBlockOpenAPI | DocumentBlockOpenAPIOperation;

/**
 * Arguments for resolving OpenAPI block.
 */
export type ResolveOpenAPIBlockArgs = {
    block: AnyOpenAPIBlock;
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
 * Resolved OpenAPI models block result.
 */
export type ResolveOpenAPIModelsBlockResult =
    | { error?: undefined; data: OpenAPIModelsData | null; specUrl: string | null }
    | ResolveOpenAPIBlockError;

/**
 * Resolved OpenAPI operation block result.
 */
export type ResolveOpenAPIOperationBlockResult =
    | { error?: undefined; data: OpenAPIOperationData | null; specUrl: string | null }
    | ResolveOpenAPIBlockError;

/**
 * Resolved OpenAPI block error.
 */
type ResolveOpenAPIBlockError = {
    error: OpenAPIParseError;
    data?: undefined;
    specUrl?: undefined;
};
