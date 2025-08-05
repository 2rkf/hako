export function parseBBCode(text: string): string {
    return text
        .replace(/\[b\](.*?)\[\/b\]/gi, "<strong>$1</strong>")
        .replace(/\[i\](.*?)\[\/i\]/gi, "<em>$1</em>")
        .replace(/\[u\](.*?)\[\/u\]/gi, "<u>$1</u>")
        .replace(/\[s\](.*?)\[\/s\]/gi, "<s>$1</s>")
        .replace(/\[code\](.*?)\[\/code\]/gis, `<code class="bg-midnight-100 dark:bg-midnight-800 px-1 rounded">$1</code>`)
        .replace(/\[url=(.*?)\](.*?)\[\/url\]/gi, `<a href="$1" target="_blank" class="text-secondary hover:underline">$2</a>`)
        .replace(/\[quote\](.*?)\[\/quote\]/gis, `<blockquote class="border-l-4 border-gray-400 pl-4 italic opacity-80">$1</blockquote>`)
        .replace(/\[spoiler\](.*?)\[\/spoiler\]/gi, `<span class="bg-gray-800 text-gray-800 hover:text-white transition-colors px-1 rounded cursor-help">$1</span>`)
        .replace(/\[br\]/gi, "<br>")
        .replace(/\n/g, "<br>");
}
