import { jsXml } from 'json-xml-parse';

/**
 * This function converts an object to XML.
 */
export function json2xml(data: Record<string, any>) {
    return jsXml.toXmlString(data, { beautify: true });
}
