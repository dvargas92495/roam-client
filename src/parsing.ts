export const Dropdown = {
    getSelectedValue(text: string) {
        // Explicitly getting only first "or" block, for now contract is that we only
        const regex = /{{\[?\[?or]?]?:([^|]+)\|?[^}]*}}/
        return text.match(regex)?.[1].trim()
    },
    // todo getOptions
}
