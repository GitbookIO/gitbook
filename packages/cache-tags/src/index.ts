import type { ComputedContentSource } from '@gitbook/api';
import assertNever from 'assert-never';

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
              sourceType: string;
          }
        /**
         * All data related to the URL of a content
         */
        | {
              tag: 'url';
              hostname: string;
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
        /**
         * All data related to a translation
         */
        | {
              tag: 'translation';
              organization: string;
              translation: string;
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
            return `space:${spec.space}:computed-document:${spec.sourceType}`;
        case 'site':
            return `site:${spec.site}`;
        case 'integration':
            return `integration:${spec.integration}`;
        case 'openapi':
            return `organization:${spec.organization}:openapi:${spec.openAPISpec}`;
        case 'translation':
            return `organization:${spec.organization}:translation:${spec.translation}`;
        default:
            assertNever(spec);
    }
}

/**
 * Get the tags for a computed content source.
 */
export function getComputedContentSourceCacheTags(
    inContext: {
        spaceId: string;
        organizationId: string;
    },
    source: ComputedContentSource
) {
    const tags: string[] = [];

    if (!('dependencies' in source)) {
        return tags;
    }

    // We add the dependencies as tags, to ensure that the computed content is invalidated
    // when the dependencies are updated.
    const dependencies = Object.values(source.dependencies ?? {});
    if (dependencies.length > 0) {
        dependencies.forEach((dependency) => {
            switch (dependency.ref.kind) {
                case 'space':
                    tags.push(
                        getCacheTag({
                            tag: 'space',
                            space: dependency.ref.space,
                        })
                    );
                    break;
                case 'openapi':
                    tags.push(
                        getCacheTag({
                            tag: 'openapi',
                            organization: inContext.organizationId,
                            openAPISpec: dependency.ref.spec,
                        })
                    );
                    break;
                case 'translation':
                    tags.push(
                        getCacheTag({
                            tag: 'translation',
                            organization: inContext.organizationId,
                            translation: dependency.ref.translation,
                        })
                    );
                    break;
                default:
                    // Do not throw for unknown dependency types
                    // as it might mean we are lagging behind the API version
                    break;
            }
        });
    } else {
        // Push a dummy tag, as the v1 is only using the first tag
        tags.push(
            getCacheTag({
                tag: 'computed-document',
                space: inContext.spaceId,
                sourceType: source.type,
            })
        );
    }

    // We invalidate the computed content when a new version of the integration is deployed.
    if (source.type.startsWith('integration:')) {
        const integration = source.type.split(':')[1]!;
        tags.push(
            getCacheTag({
                tag: 'integration',
                integration,
            })
        );
    }

    return tags;
}
