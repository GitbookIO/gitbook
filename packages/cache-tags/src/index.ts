/**
 * Get a stringified cache tag for a given object.
 */
export function getCacheTag(
    spec: /**
     * All data related to a user
     * @deprecated - in v2, no tag as this is an immutable data
     */
        | {
              tag: 'user';
              user: string;
          }
        /**
         * All data related to a space
         */
        | {
              tag: 'space';
              space: string;
          }
        /**
         * All data related to an integration.
         */
        | {
              tag: 'integration';
              integration: string;
          }
        /**
         * All data related to a change request
         */
        | {
              tag: 'change-request';
              space: string;
              changeRequest: string;
          }
        /**
         * Immutable data related to a revision
         * @deprecated - in v2, no tag as this is an immutable data
         */
        | {
              tag: 'revision';
              space: string;
              revision: string;
          }
        /**
         * Immutable data related to a document
         * @deprecated - in v2, no tag as this is an immutable data
         */
        | {
              tag: 'document';
              space: string;
              document: string;
          }
        /**
         * Immutable data related to a computed document
         * @deprecated - in v2, no tag as this is an immutable data
         */
        | {
              tag: 'computed-document';
              space: string;
              integration: string;
          }
        /**
         * All data related to the URL of a content
         */
        | {
              tag: 'url';
              hostname: string;
          }
        /**
         * All data related to a collection
         * @deprecated - in v2, we no longer use collections
         */
        | {
              tag: 'collection';
              collection: string;
          }
        /**
         * All data related to a site
         */
        | {
              tag: 'site';
              site: string;
          }
        /**
         * All data related to an OpenAPI spec
         */
        | {
              tag: 'openapi';
              organization: string;
              openAPISpec: string;
          }
): string {
    switch (spec.tag) {
        case 'user':
            return `user:${spec.user}`;
        case 'url':
            return `url:${spec.hostname}`;
        case 'space':
            return `space:${spec.space}`;
        case 'change-request':
            return `space:${spec.space}:change-request:${spec.changeRequest}`;
        case 'revision':
            return `space:${spec.space}:revision:${spec.revision}`;
        case 'document':
            return `space:${spec.space}:document:${spec.document}`;
        case 'computed-document':
            return `space:${spec.space}:computed-document:${spec.integration}`;
        case 'collection':
            return `collection:${spec.collection}`;
        case 'site':
            return `site:${spec.site}`;
        case 'integration':
            return `integration:${spec.integration}`;
        case 'openapi':
            return `organization:${spec.organization}:openapi:${spec.openAPISpec}`;
        default:
            throw new Error(`Unknown cache tag: ${spec}`);
    }
}
