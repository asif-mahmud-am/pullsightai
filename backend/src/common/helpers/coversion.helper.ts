export function extractDomainFromUrl(inputUrl: string): string {
    try {
        const url = new URL(inputUrl)
        return url.hostname
    } catch (e) {
        return ''
    }
}
