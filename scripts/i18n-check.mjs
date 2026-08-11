import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const localesDir = join(fileURLToPath(new URL(".", import.meta.url)), "..", "public", "locales");

const flatten = (obj, prefix = "") => {
    const out = {};
    for (const [key, value] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === "object" && !Array.isArray(value)) {
            Object.assign(out, flatten(value, path));
        } else {
            out[path] = value;
        }
    }
    return out;
};

const readNs = (lng, ns) => {
    try {
        return flatten(JSON.parse(readFileSync(join(localesDir, lng, ns), "utf8")));
    } catch {
        return {};
    }
};

const languages = readdirSync(localesDir).filter((entry) => {
    try {
        return readdirSync(join(localesDir, entry)).length >= 0;
    } catch {
        return false;
    }
});

if (languages.length < 2) {
    console.log(`i18n-check: only ${languages.length} language(s) found, nothing to compare.`);
    process.exit(0);
}

const [reference, ...others] = languages;
const namespaces = readdirSync(join(localesDir, reference)).filter((f) => f.endsWith(".json"));

let problems = 0;

for (const ns of namespaces) {
    const refKeys = new Set(Object.keys(readNs(reference, ns)));

    for (const lng of others) {
        const keys = new Set(Object.keys(readNs(lng, ns)));

        const missing = [...refKeys].filter((k) => !keys.has(k));
        const extra = [...keys].filter((k) => !refKeys.has(k));

        if (missing.length || extra.length) {
            problems += missing.length + extra.length;
            console.error(`\n[${ns}] ${lng} vs ${reference}`);
            for (const k of missing) console.error(`  missing in ${lng}: ${k}`);
            for (const k of extra) console.error(`  extra in ${lng}:   ${k}`);
        }
    }
}

if (problems) {
    console.error(`\ni18n-check: ${problems} key mismatch(es) found.`);
    process.exit(1);
}

console.log(`i18n-check: OK — ${namespaces.length} namespace(s), ${languages.length} languages, keys aligned.`);
