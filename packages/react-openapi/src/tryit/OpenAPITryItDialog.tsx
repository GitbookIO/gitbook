'use client';

import clsx from 'classnames';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import type { OpenAPIClientContext } from '../context';
import { OpenAPIMethodBadge } from '../OpenAPIMethodBadge';
import { useOpenAPIPrefillContext } from '../OpenAPIPrefillContextProvider';
import { t } from '../translate';
import type { TranslationKey } from '../translations';
import type { OpenAPICustomSecurityScheme, OpenAPIOperationData } from '../types';
import { interpolateServerURL, isValidServerHost } from '../util/server';
import { resolveTryItPrefillForOperation, resolveTryItServers } from '../util/tryit-prefill';
import { getStatusCodeClassName } from '../utils';
import {
    type TryItExtraParameter,
    type TryItValues,
    authKey,
    buildTryItRequest,
    fieldKey,
    prefillAuthValues,
    resolveServerURL,
    toProxyRequest,
} from './request';
import { type TryItResponse, formatBytes, readTryItResponse } from './response';
import {
    getTryItApiScope,
    getTryItApiSession,
    getTryItOperationSession,
    saveTryItOperationSession,
} from './session';
import type { TryItField, TryItOperation, TryItParameterLocation } from './types';

export interface OpenAPITryItDialogProps {
    operation: TryItOperation;
    securities: OpenAPIOperationData['securities'];
    servers: OpenAPIOperationData['servers'];
    withProxy: boolean;
    context: OpenAPIClientContext;
    onClose: () => void;
}

type ResponseState =
    | { type: 'idle' }
    | { type: 'sending' }
    | { type: 'error'; message: string }
    | { type: 'done'; response: TryItResponse };

const PARAMETER_SECTIONS: { in: TryItParameterLocation; label: TranslationKey }[] = [
    { in: 'path', label: 'path_parameters' },
    { in: 'query', label: 'query_parameters' },
    { in: 'header', label: 'header_parameters' },
    { in: 'cookie', label: 'cookie_parameters' },
];

let unscopedDialogs = 0;

/** Loaded only after a reader opens Try it. */
export function OpenAPITryItDialog(props: OpenAPITryItDialogProps) {
    const { operation, securities, servers, withProxy, context, onClose } = props;
    const { translation } = context;
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const getPrefillInputContext = useOpenAPIPrefillContext();

    // Prefill is read once, when the dialog opens, like a form's initial values.
    const [initial] = useState(() => {
        const prefillInputContext = getPrefillInputContext();
        const prefill = resolveTryItPrefillForOperation({
            operation: { securities, servers },
            prefillInputContext,
        });
        return {
            // The button shows when any server is usable; relative ones can't be called from here.
            servers: resolveTryItServers({ servers, prefillInputContext }).filter((server) =>
                isValidServerHost(interpolateServerURL(server))
            ),
            auth: prefillAuthValues(prefill.authentication?.securitySchemes),
        };
    });

    const [saved] = useState(() => {
        // Without a concrete host, use a scope of its own so nothing is shared or restored.
        const scope = getTryItApiScope(servers) ?? `unscoped:${++unscopedDialogs}`;
        const savedOperation = getTryItOperationSession(scope, operation);
        const savedMediaTypeIndex =
            operation.body?.mediaTypes.findIndex(
                (item) => item.mediaType === savedOperation?.mediaType
            ) ?? -1;
        return {
            scope,
            api: getTryItApiSession(scope),
            operation: savedOperation,
            // Body values only apply to the media type they were typed for.
            mediaTypeIndex: savedMediaTypeIndex >= 0 ? savedMediaTypeIndex : null,
        };
    });
    const { api } = saved;

    const [serverIndex, setServerIndex] = useState(() =>
        Math.max(
            0,
            initial.servers.findIndex((item) => item.url === api.serverURL)
        )
    );
    const server = initial.servers[serverIndex];
    const [serverVariables, setServerVariables] = useState<Record<string, string>>(
        () => (server?.url ? api.serverVariables[server.url] : undefined) ?? {}
    );
    const [securityIndex, setSecurityIndex] = useState(0);
    // What the reader typed earlier wins over prefill.
    const [auth, setAuth] = useState(() => ({ ...initial.auth, ...api.auth }));
    const [parameters, setParameters] = useState(() => {
        const defaults = Object.fromEntries(
            operation.parameters
                .filter((parameter) => parameter.required && parameter.defaultValue !== undefined)
                .map((parameter) => [fieldKey(parameter), parameter.defaultValue ?? ''])
        );
        return { ...defaults, ...saved.operation?.parameters };
    });
    const [mediaTypeIndex, setMediaTypeIndex] = useState(() => saved.mediaTypeIndex ?? 0);
    const mediaType = operation.body?.mediaTypes[mediaTypeIndex];
    const restoreBody = saved.mediaTypeIndex !== null;
    const [bodyText, setBodyText] = useState(() =>
        restoreBody && saved.operation
            ? saved.operation.bodyText
            : (mediaType?.examples[0]?.value ?? '')
    );
    const [bodyFields, setBodyFields] = useState<Record<string, string>>(() =>
        restoreBody && saved.operation
            ? saved.operation.bodyFields
            : initialFieldValues(mediaType?.fields ?? [])
    );
    const [bodyFiles, setBodyFiles] = useState<Record<string, File[]>>({});
    const [extraParameters, setExtraParameters] = useState<TryItExtraParameter[]>(
        () => saved.operation?.extraParameters ?? []
    );

    useEffect(() => {
        saveTryItOperationSession(saved.scope, operation, {
            parameters,
            mediaType: mediaType?.mediaType ?? null,
            bodyText,
            bodyFields,
            extraParameters,
        });
    }, [saved.scope, operation, parameters, mediaType, bodyText, bodyFields, extraParameters]);

    // API-wide values are saved only when the reader changes them, so prefill and defaults
    // never get frozen into the session.
    const updateAuth = (key: string, value: string) => {
        setAuth((current) => ({ ...current, [key]: value }));
        if (value) {
            api.auth[key] = value;
        } else {
            delete api.auth[key];
        }
    };
    const updateServerVariables = (variables: Record<string, string>) => {
        setServerVariables(variables);
        if (server?.url) {
            api.serverVariables[server.url] = variables;
        }
    };
    const [state, setState] = useState<ResponseState>({ type: 'idle' });
    const [showMissing, setShowMissing] = useState(false);
    const abortRef = useRef<AbortController | null>(null);
    const pressedBackdropRef = useRef(false);

    const securitiesByName = useMemo(() => new Map(securities), [securities]);
    const securityOption = operation.securityOptions[securityIndex];
    const schemes = (securityOption?.schemes ?? []).flatMap(
        (name): [string, OpenAPICustomSecurityScheme][] => {
            const scheme = securitiesByName.get(name);
            return scheme ? [[name, scheme]] : [];
        }
    );

    const values: TryItValues = {
        server,
        serverVariables,
        schemes,
        auth,
        parameters,
        mediaType,
        bodyText,
        bodyFields,
        bodyFiles,
        extraParameters,
    };
    const request = buildTryItRequest(operation, values);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (dialog && !dialog.open) {
            dialog.showModal();
        }
        return () => abortRef.current?.abort();
    }, []);

    const blobUrl = state.type === 'done' ? state.response.blobUrl : null;
    useEffect(() => {
        return () => {
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
            }
        };
    }, [blobUrl]);

    const send = async () => {
        if (request.missing.length > 0) {
            setShowMissing(true);
            return;
        }
        setShowMissing(false);
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const finalRequest =
            withProxy && context.proxyUrl ? toProxyRequest(request, context.proxyUrl) : request;
        setState({ type: 'sending' });
        const startedAt = performance.now();
        try {
            const response = await fetch(finalRequest.url, {
                method: finalRequest.method,
                headers: finalRequest.headers,
                body: finalRequest.body,
                signal: controller.signal,
            });
            const result = await readTryItResponse(response, startedAt);
            if (controller.signal.aborted) {
                if (result.blobUrl) {
                    URL.revokeObjectURL(result.blobUrl);
                }
                return;
            }
            setState({ type: 'done', response: result });
        } catch (error) {
            if (controller.signal.aborted) {
                return;
            }
            setState({
                type: 'error',
                message: error instanceof Error ? error.message : String(error),
            });
        }
    };

    const updateParameter = (key: string, value: string) =>
        setParameters((current) => ({ ...current, [key]: value }));

    return (
        <dialog
            ref={dialogRef}
            className="openapi-tryit"
            aria-labelledby={titleId}
            onClose={onClose}
            // A click on the backdrop lands on the dialog itself. Both ends must be there, so a
            // text selection dragged out of an input doesn't close the dialog.
            onPointerDown={(event) => {
                pressedBackdropRef.current = event.target === event.currentTarget;
            }}
            onClick={(event) => {
                if (pressedBackdropRef.current && event.target === event.currentTarget) {
                    dialogRef.current?.close();
                }
            }}
        >
            <form
                className="openapi-tryit-layout"
                onSubmit={(event) => {
                    event.preventDefault();
                    void send();
                }}
            >
                <header className="openapi-tryit-header">
                    <OpenAPIMethodBadge method={operation.method} size="medium" />
                    <code id={titleId} className="openapi-tryit-url" title={request.url}>
                        <span className="openapi-tryit-url-server">
                            {resolveServerURL(server, serverVariables)}
                        </span>
                        {operation.path.replace(
                            /{([^}]+)}/g,
                            (match, name: string) => parameters[`path:${name}`] || match
                        )}
                    </code>
                    {state.type === 'sending' ? (
                        <button
                            type="button"
                            className="openapi-tryit-send"
                            onClick={() => {
                                abortRef.current?.abort();
                                setState({ type: 'idle' });
                            }}
                        >
                            {t(translation, 'cancel')}
                        </button>
                    ) : (
                        <button type="submit" className="openapi-tryit-send">
                            {t(translation, 'send')}
                        </button>
                    )}
                    <button
                        type="button"
                        className="openapi-tryit-close"
                        aria-label={String(t(translation, 'close'))}
                        onClick={() => dialogRef.current?.close()}
                    >
                        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
                            <path
                                d="M4 4l8 8M12 4l-8 8"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </header>

                <div className="openapi-tryit-body">
                    <div className="openapi-tryit-request">
                        {showMissing && request.missing.length > 0 ? (
                            <p className="openapi-tryit-alert" role="alert">
                                {t(
                                    translation,
                                    'tryit_missing_required',
                                    request.missing.join(', ')
                                )}
                            </p>
                        ) : null}

                        {initial.servers.length > 0 ? (
                            <Section title={t(translation, 'server')}>
                                {initial.servers.length > 1 ? (
                                    <select
                                        className="openapi-tryit-input"
                                        aria-label={String(t(translation, 'server'))}
                                        value={serverIndex}
                                        onChange={(event) => {
                                            const index = Number(event.target.value);
                                            const next = initial.servers[index];
                                            setServerIndex(index);
                                            api.serverURL = next?.url ?? null;
                                            setServerVariables(
                                                (next?.url
                                                    ? api.serverVariables[next.url]
                                                    : undefined) ?? {}
                                            );
                                        }}
                                    >
                                        {initial.servers.map((item, index) => (
                                            <option key={index} value={index}>
                                                {item.description
                                                    ? `${item.description} (${item.url})`
                                                    : item.url}
                                            </option>
                                        ))}
                                    </select>
                                ) : null}
                                {Object.entries(server?.variables ?? {}).map(([name, variable]) => (
                                    <Field
                                        key={name}
                                        field={{
                                            name,
                                            required: true,
                                            description: variable.description,
                                            enum: variable.enum?.map(String),
                                        }}
                                        value={
                                            serverVariables[name] ?? String(variable.default ?? '')
                                        }
                                        onChange={(value) =>
                                            updateServerVariables({
                                                ...serverVariables,
                                                [name]: value,
                                            })
                                        }
                                    />
                                ))}
                            </Section>
                        ) : null}

                        {operation.securityOptions.length > 0 ? (
                            <Section title={t(translation, 'authorizations')}>
                                {operation.securityOptions.length > 1 ? (
                                    <select
                                        className="openapi-tryit-input"
                                        aria-label={String(t(translation, 'authorizations'))}
                                        value={securityIndex}
                                        onChange={(event) =>
                                            setSecurityIndex(Number(event.target.value))
                                        }
                                    >
                                        {operation.securityOptions.map((option, index) => (
                                            <option key={index} value={index}>
                                                {option.label || t(translation, 'tryit_no_auth')}
                                            </option>
                                        ))}
                                    </select>
                                ) : null}
                                {schemes.map(([name, scheme]) => (
                                    <AuthFields
                                        key={name}
                                        name={name}
                                        scheme={scheme}
                                        values={auth}
                                        translation={translation}
                                        onChange={updateAuth}
                                    />
                                ))}
                            </Section>
                        ) : null}

                        {PARAMETER_SECTIONS.map((section) => {
                            const items = operation.parameters.filter(
                                (parameter) => parameter.in === section.in
                            );
                            if (items.length === 0) {
                                return null;
                            }
                            return (
                                <Section key={section.in} title={t(translation, section.label)}>
                                    {section.in === 'cookie' && !(withProxy && context.proxyUrl) ? (
                                        <p className="openapi-tryit-hint">
                                            {t(translation, 'tryit_cookies_need_proxy')}
                                        </p>
                                    ) : null}
                                    {items.map((parameter) => (
                                        <Field
                                            key={fieldKey(parameter)}
                                            field={parameter}
                                            invalid={showMissing}
                                            value={parameters[fieldKey(parameter)] ?? ''}
                                            onChange={(value) =>
                                                updateParameter(fieldKey(parameter), value)
                                            }
                                        />
                                    ))}
                                </Section>
                            );
                        })}

                        <ExtraParameters
                            items={extraParameters}
                            translation={translation}
                            onChange={setExtraParameters}
                        />

                        {operation.body && mediaType ? (
                            <Section
                                title={t(translation, 'body')}
                                aside={
                                    operation.body.mediaTypes.length > 1 ? (
                                        <select
                                            className="openapi-tryit-input openapi-tryit-input-small"
                                            aria-label="Content-Type"
                                            value={mediaTypeIndex}
                                            onChange={(event) => {
                                                const index = Number(event.target.value);
                                                const next = operation.body?.mediaTypes[index];
                                                setMediaTypeIndex(index);
                                                setBodyText(next?.examples[0]?.value ?? '');
                                                setBodyFields(
                                                    initialFieldValues(next?.fields ?? [])
                                                );
                                                setBodyFiles({});
                                            }}
                                        >
                                            {operation.body.mediaTypes.map((item, index) => (
                                                <option key={item.mediaType} value={index}>
                                                    {item.mediaType}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="openapi-tryit-hint">
                                            {mediaType.mediaType}
                                        </span>
                                    )
                                }
                            >
                                {mediaType.kind === 'raw' ? (
                                    <>
                                        {mediaType.examples.length > 1 ? (
                                            <select
                                                className="openapi-tryit-input openapi-tryit-input-small"
                                                aria-label="Example"
                                                key={mediaTypeIndex}
                                                defaultValue=""
                                                onChange={(event) => {
                                                    const example =
                                                        mediaType.examples[
                                                            Number(event.target.value)
                                                        ];
                                                    if (example) {
                                                        setBodyText(example.value);
                                                    }
                                                }}
                                            >
                                                <option value="" disabled>
                                                    Example
                                                </option>
                                                {mediaType.examples.map((example, index) => (
                                                    <option key={index} value={index}>
                                                        {example.label}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : null}
                                        <textarea
                                            className="openapi-tryit-input openapi-tryit-code"
                                            aria-label={String(t(translation, 'body'))}
                                            spellCheck={false}
                                            rows={Math.min(
                                                18,
                                                Math.max(4, bodyText.split('\n').length + 1)
                                            )}
                                            value={bodyText}
                                            onChange={(event) => setBodyText(event.target.value)}
                                        />
                                    </>
                                ) : mediaType.kind === 'binary' ? (
                                    <input
                                        type="file"
                                        className="openapi-tryit-file"
                                        aria-label={String(t(translation, 'body'))}
                                        onChange={(event) =>
                                            setBodyFiles({
                                                '': Array.from(event.target.files ?? []),
                                            })
                                        }
                                    />
                                ) : (
                                    mediaType.fields.map((field) =>
                                        field.binary ? (
                                            <label key={field.name} className="openapi-tryit-field">
                                                <FieldLabel field={field} />
                                                <input
                                                    type="file"
                                                    multiple
                                                    className="openapi-tryit-file"
                                                    onChange={(event) =>
                                                        setBodyFiles((current) => ({
                                                            ...current,
                                                            [field.name]: Array.from(
                                                                event.target.files ?? []
                                                            ),
                                                        }))
                                                    }
                                                />
                                            </label>
                                        ) : (
                                            <Field
                                                key={field.name}
                                                field={field}
                                                invalid={showMissing}
                                                value={bodyFields[field.name] ?? ''}
                                                onChange={(value) =>
                                                    setBodyFields((current) => ({
                                                        ...current,
                                                        [field.name]: value,
                                                    }))
                                                }
                                            />
                                        )
                                    )
                                )}
                            </Section>
                        ) : null}
                    </div>

                    <ResponsePanel state={state} context={context} />
                </div>
            </form>
        </dialog>
    );
}

function Section(props: {
    title: React.ReactNode;
    aside?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <section className="openapi-tryit-section">
            <div className="openapi-tryit-section-header">
                <h3 className="openapi-tryit-section-title">{props.title}</h3>
                {props.aside}
            </div>
            {props.children}
        </section>
    );
}

function ExtraParameters(props: {
    items: TryItExtraParameter[];
    translation: OpenAPIClientContext['translation'];
    onChange: (items: TryItExtraParameter[]) => void;
}) {
    const { items, translation, onChange } = props;
    const update = (index: number, patch: Partial<TryItExtraParameter>) =>
        onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    const add = (location: TryItExtraParameter['in']) =>
        onChange([...items, { in: location, name: '', value: '' }]);

    return (
        <Section title={t(translation, 'tryit_additional_parameters')}>
            {items.map((item, index) => (
                <div key={index} className="openapi-tryit-extra">
                    <span className="openapi-tryit-extra-location">
                        {t(translation, item.in === 'header' ? 'header' : 'tryit_query')}
                    </span>
                    <input
                        className="openapi-tryit-input"
                        aria-label={String(t(translation, 'name'))}
                        placeholder={String(t(translation, 'name'))}
                        spellCheck={false}
                        autoComplete="off"
                        value={item.name}
                        onChange={(event) => update(index, { name: event.target.value })}
                    />
                    <input
                        className="openapi-tryit-input"
                        aria-label={String(t(translation, 'value'))}
                        placeholder={String(t(translation, 'value'))}
                        spellCheck={false}
                        autoComplete="off"
                        value={item.value}
                        onChange={(event) => update(index, { value: event.target.value })}
                    />
                    <button
                        type="button"
                        className="openapi-tryit-extra-remove"
                        aria-label={String(t(translation, 'tryit_remove'))}
                        onClick={() => onChange(items.filter((_, i) => i !== index))}
                    >
                        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
                            <path
                                d="M4 4l8 8M12 4l-8 8"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>
            ))}
            <div className="openapi-tryit-extra-actions">
                <button type="button" className="openapi-tryit-add" onClick={() => add('header')}>
                    + {t(translation, 'tryit_add_header')}
                </button>
                <button type="button" className="openapi-tryit-add" onClick={() => add('query')}>
                    + {t(translation, 'tryit_add_query_parameter')}
                </button>
            </div>
        </Section>
    );
}

function FieldLabel(props: { field: TryItField }) {
    const { field } = props;
    return (
        <span className="openapi-tryit-field-label">
            <span className="openapi-tryit-field-name">{field.name}</span>
            {field.required ? (
                <span className="openapi-tryit-field-required" aria-hidden="true">
                    *
                </span>
            ) : null}
            {field.description ? (
                <span className="openapi-tryit-field-description">{field.description}</span>
            ) : null}
        </span>
    );
}

function Field(props: {
    field: TryItField;
    value: string;
    invalid?: boolean;
    onChange: (value: string) => void;
}) {
    const { field, value, invalid, onChange } = props;
    const isInvalid = Boolean(invalid && field.required && value === '');
    return (
        <label className="openapi-tryit-field">
            <FieldLabel field={field} />
            {field.enum ? (
                <select
                    className={clsx('openapi-tryit-input', isInvalid && 'openapi-tryit-invalid')}
                    value={value}
                    required={field.required}
                    onChange={(event) => onChange(event.target.value)}
                >
                    <option value="">{field.placeholder ? `${field.placeholder}…` : '—'}</option>
                    {value && !field.enum.includes(value) ? (
                        <option value={value}>{value}</option>
                    ) : null}
                    {field.enum.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    className={clsx('openapi-tryit-input', isInvalid && 'openapi-tryit-invalid')}
                    value={value}
                    placeholder={field.placeholder}
                    aria-invalid={isInvalid || undefined}
                    spellCheck={false}
                    autoComplete="off"
                    onChange={(event) => onChange(event.target.value)}
                />
            )}
        </label>
    );
}

function AuthFields(props: {
    name: string;
    scheme: OpenAPICustomSecurityScheme;
    values: Record<string, string>;
    translation: OpenAPIClientContext['translation'];
    onChange: (key: string, value: string) => void;
}) {
    const { name, scheme, values, translation, onChange } = props;
    const isBasic = scheme.type === 'http' && scheme.scheme?.toLowerCase().includes('basic');

    if (isBasic) {
        return (
            <div className="openapi-tryit-auth">
                <Field
                    field={{ name: `${name} · ${t(translation, 'username')}`, required: false }}
                    value={values[authKey(name, 'username')] ?? ''}
                    onChange={(value) => onChange(authKey(name, 'username'), value)}
                />
                <label className="openapi-tryit-field">
                    <span className="openapi-tryit-field-label">
                        <span className="openapi-tryit-field-name">
                            {name} · {t(translation, 'password')}
                        </span>
                    </span>
                    <input
                        type="password"
                        className="openapi-tryit-input"
                        autoComplete="off"
                        value={values[authKey(name, 'password')] ?? ''}
                        onChange={(event) =>
                            onChange(authKey(name, 'password'), event.target.value)
                        }
                    />
                </label>
            </div>
        );
    }

    const label =
        scheme.type === 'apiKey'
            ? `${scheme.name ?? name} (${scheme.in})`
            : scheme.type === 'http'
              ? `Authorization (${scheme.scheme})`
              : 'Authorization (Bearer)';

    return (
        <Field
            field={{
                name: label,
                required: false,
                description: scheme.description,
                placeholder: placeholderForScheme(scheme),
            }}
            value={values[authKey(name)] ?? ''}
            onChange={(value) => onChange(authKey(name), value)}
        />
    );
}

function placeholderForScheme(scheme: OpenAPICustomSecurityScheme) {
    switch (scheme.type) {
        case 'apiKey':
            return 'YOUR_API_KEY';
        case 'oauth2':
        case 'openIdConnect':
            return 'YOUR_OAUTH2_TOKEN';
        default:
            return 'YOUR_SECRET_TOKEN';
    }
}

function ResponsePanel(props: { state: ResponseState; context: OpenAPIClientContext }) {
    const { state, context } = props;
    const { translation } = context;
    const [tab, setTab] = useState<'body' | 'headers'>('body');

    if (state.type === 'idle' || state.type === 'sending') {
        return (
            <div className="openapi-tryit-response openapi-tryit-response-empty" aria-live="polite">
                {state.type === 'sending' ? (
                    <span className="openapi-tryit-spinner" aria-hidden="true" />
                ) : (
                    t(translation, 'tryit_no_response')
                )}
            </div>
        );
    }

    if (state.type === 'error') {
        return (
            <div className="openapi-tryit-response" aria-live="polite">
                <p className="openapi-tryit-alert" role="alert">
                    {t(translation, 'tryit_request_failed')}
                </p>
                <pre className="openapi-tryit-response-body">{state.message}</pre>
            </div>
        );
    }

    const { response } = state;
    return (
        <div className="openapi-tryit-response" aria-live="polite">
            <div className="openapi-tryit-response-meta">
                <span
                    className={clsx(
                        'openapi-statuscode',
                        // The badge styles name the 3xx class `redirection`.
                        `openapi-statuscode-${getStatusCodeClassName(response.status).replace('redirect', 'redirection')}`
                    )}
                >
                    {response.status} {response.statusText}
                </span>
                <span>{response.durationMs} ms</span>
                <span>{formatBytes(response.size)}</span>
                <div className="openapi-tryit-tabs" role="tablist">
                    {(['body', 'headers'] as const).map((key) => (
                        <button
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={tab === key}
                            className="openapi-tryit-tab"
                            onClick={() => setTab(key)}
                        >
                            {t(translation, key)}
                            {key === 'headers' ? ` (${response.headers.length})` : null}
                        </button>
                    ))}
                </div>
            </div>
            {tab === 'headers' ? (
                <dl className="openapi-tryit-headers">
                    {response.headers.map(([name, value]) => (
                        <div key={name}>
                            <dt>{name}</dt>
                            <dd>{value}</dd>
                        </div>
                    ))}
                </dl>
            ) : response.blobUrl ? (
                <div className="openapi-tryit-binary">
                    {response.isImage ? <img src={response.blobUrl} alt="" /> : null}
                    <p>
                        {t(translation, 'tryit_binary_response', formatBytes(response.size))}{' '}
                        <a href={response.blobUrl} download>
                            {t(translation, 'tryit_download')}
                        </a>
                    </p>
                </div>
            ) : (
                <>
                    {response.truncated ? (
                        <p className="openapi-tryit-hint">
                            {t(translation, 'tryit_truncated', formatBytes(512 * 1024))}
                        </p>
                    ) : null}
                    <pre className="openapi-tryit-response-body">
                        {response.text || t(translation, 'no_content')}
                    </pre>
                </>
            )}
        </div>
    );
}

function initialFieldValues(fields: TryItField[]) {
    return Object.fromEntries(
        fields
            .filter((field) => field.required && field.defaultValue !== undefined)
            .map((field) => [field.name, field.defaultValue ?? ''])
    );
}
