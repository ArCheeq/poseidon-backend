export function generateSlug(str: string) {
    return str
        .toLowerCase()
        .trim()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
}
