export type IntegrationScript = {
    script: string;
    cookies?: boolean;
};

/**
 * Keep only the scripts that are currently allowed to run.
 */
export function filterScriptsByConsent(
    scripts: IntegrationScript[],
    hasExplicitCookieConsent: boolean
): IntegrationScript[] {
    return scripts.filter((script) => !script.cookies || hasExplicitCookieConsent);
}
