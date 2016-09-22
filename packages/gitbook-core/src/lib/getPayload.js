
/**
 * Get the payload for a GitBook page
 * @param  {String|DOMDocument} html
 * @return {Object}
 */
function getPayload(html) {
    if (typeof html === 'string') {
        const parser = new DOMParser();
        html = parser.parseFromString(html, 'text/html');
    }

    const script = html.querySelector('script[type="application/payload+json"]');
    const payload = JSON.parse(script.innerHTML);

    return payload;
}

module.exports = getPayload;
