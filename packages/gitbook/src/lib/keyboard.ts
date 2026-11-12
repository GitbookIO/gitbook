/**
 * Whether a keydown belongs to an in-progress IME composition and must not trigger a submit.
 */
export function isComposingKeyEvent(event: {
    nativeEvent: Pick<KeyboardEvent, 'isComposing' | 'keyCode'>;
}): boolean {
    // Safari fires `compositionend` before the confirming keydown, so `isComposing` is already
    // false there; keyCode 229 is the only remaining signal.
    return event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229;
}
