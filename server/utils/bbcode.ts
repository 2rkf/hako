export function parseBBCode(text: string): string {
    function parse(input: string): string {
        return input
            .replace(/\[b\](.*?)\[\/b\]/gis, (_, inner) => `<strong>${parse(inner)}</strong>`)
            .replace(/\[i\](.*?)\[\/i\]/gis, (_, inner) => `<em>${parse(inner)}</em>`)
            .replace(/\[u\](.*?)\[\/u\]/gis, (_, inner) => `<u>${parse(inner)}</u>`)
            .replace(/\[s\](.*?)\[\/s\]/gis, (_, inner) => `<s>${parse(inner)}</s>`)
            .replace(/\[code\](.*?)\[\/code\]/gis, (_, inner) => `<code class="bg-midnight-100 dark:bg-midnight-800 px-1 rounded">${inner}</code>`)
            .replace(/\[url=(.*?)\](.*?)\[\/url\]/gis, (_, href, inner) => `<a href="${href}" target="_blank" class="text-secondary hover:underline">${parse(inner)}</a>`)
            .replace(/\[quote\](.*?)\[\/quote\]/gis, (_, inner) => `<blockquote class="border-l-4 border-gray-400 pl-4 italic opacity-80">${parse(inner)}</blockquote>`)
            .replace(/\[spoiler\](.*?)\[\/spoiler\]/gis, (_, inner) => `<span class="bg-gray-800 text-gray-800 hover:text-white transition-colors px-1 rounded cursor-help">${parse(inner)}</span>`)
            .replace(/\[list(?:=(1|a|A|i|I))?\](.*?)\[\/list\]/gis, (_, type, inner: string) => {
                const items = inner
                    .split(/\s*\[\*\]\s*/)
                    .map(item => item.trim())
                    .filter(item => item.length > 0)
                    .map(item => `<li style="margin-left: 24px;">${parse(item)}</li>`)
                    .join("");

                if (!items) return "";

                switch (type) {
                    case "1":
                        return `<ol class="space-y-1" style="list-style-type: decimal;">${items}</ol>`;
                    case "a":
                        return `<ol class="space-y-1" style="list-style-type: lower-alpha;">${items}</ol>`;
                    case "A":
                        return `<ol class="space-y-1" style="list-style-type: upper-alpha;">${items}</ol>`;
                    case "i":
                        return `<ol class="space-y-1" style="list-style-type: lower-roman;">${items}</ol>`;
                    case "I":
                        return `<ol class="space-y-1" style="list-style-type: upper-roman;">${items}</ol>`;
                    default:
                        return `<ul class="space-y-1" style="list-style-type: disc;">${items}</ul>`;
                }
            })
            .replace(/\[br\]/gi, "<br>")
            .replace(/\n/g, "<br>")
            .replace(
                /(?<!["'>])(https?:\/\/[^\s<]+)/gi,
                `<a href="$1" target="_blank" class="text-secondary hover:underline">$1</a>`
            );
    }

    return parse(text);
}
