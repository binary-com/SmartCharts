// A quick little script that imports ChartIQ's translations (chartiq-translations.csv
// is taken directly from chartiq's translations.js file) and places them to their
// respective places in the corresponding po files.

var fs = require('fs');

const languages = [
    'en',
    'ar',
    'bn',
    'fr',
    'de',
    'hu',
    'it',
    'km',
    'ko',
    'mn',
    'pt',
    'ru',
    'si',
    'sw',
    'tr',
    'es',
    'zh_cn',
    'ja',
];
const lang_map = {};
let i = 0;
for (const l of languages) {
    lang_map[l] = i++;
}
const chartiqTranslations = {};
const strings = fs.readFileSync('./scripts/chartiq-translations.csv').toString().split('\n');
for (const s of strings) {
    const arr = s.split(',');
    if (arr.length < 1) continue;
    chartiqTranslations[arr[0]] = arr;
}

function fillTranslations(poDir, idx) {
    const poFile = fs.readFileSync(poDir).toString().split('\n');
    let output = '';
    let msgid;
    for (const line of poFile) {
        if (msgid) {
            output += `msgstr "${chartiqTranslations[msgid][idx]}"\n`;
            msgid = undefined;
            continue;
        }
        if (line.startsWith('msgid ')) {
            let txt = line.slice(7, -1);
            if (txt !== '' && chartiqTranslations[txt]) {
                msgid = txt;
            }
        }
        output += `${line}\n`;
    }
    fs.writeFileSync(poDir, output);
}

let found = [];
let notFound = [];
for (const f of fs.readdirSync('./translation/')) {
    if (f.slice(-3) === '.po') {
        const locale = f.slice(0, -3);

        if (lang_map[locale]) {
            found.push(f);
            fillTranslations(`./translation/${locale}.po`, lang_map[locale]);
        } else {
            notFound.push(f);
        }
    }
}

console.log('Translations have been successfully imported from chartiq for the following files:');
for (const f of found) {
    console.log(` - ${f}`);
}
console.log('\nNo translations are available for the following languages:');
for (const f of notFound) {
    console.log(` - ${f}`);
}
