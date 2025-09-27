import en from "./locales/en.json";
import ja from "./locales/ja.json";

export default defineI18nConfig(()=> ({
    fallbackLocale: "en",
    locale: "en",
    messages: {
        en,
        ja,
    },
}));
