#!/usr/bin/node

const fs = require("node:fs");
const readline = require("node:readline");

const latin_cyrillic_uzbek_array = new Array(
    [/(?<=^|[^\p{L}]|[АаЕеЭэИиОоУуЎў])Е/gu, "Ye"], [/(?<=^|[^\p{L}]|[АаЕеЭэИиОоУуЎў])е/gu, "ye"], ["А", "A"], ["а", "a"], ["Б", "B"], ["б", "b"], ["В", "V"], ["в", "v"], ["Г", "G"], ["г", "g"], ["Д", "D"], ["д", "d"], ["Е", "E"], ["е", "e"], ["Ё", "Yo"], ["ё", "yo"], ["Ж", "J"], ["ж", "j"], ["З", "Z"], ["з", "z"], ["И", "I"], ["и", "i"], ["Й", "Y"], ["й", "y"], ["К", "K"], ["к", "k"], ["Л", "L"], ["л", "l"], ["М", "M"], ["м", "m"], ["Н", "N"], ["н", "n"], ["О", "O"], ["о", "o"], ["П", "P"], ["п", "p"], ["Р", "R"], ["р", "r"], ["С", "S"], ["с", "s"], ["Т", "T"], ["т", "t"], ["У", "U"], ["у", "u"], ["Ф", "F"], ["ф", "f"], ["Х", "X"], ["х", "x"], ["Ц", "S"], ["ц", "s"], ["Ч", "Ch"], ["ч", "ch"], ["Ш", "Sh"], ["ш", "sh"], ["ь", ""], ["ъ", "\'"], ["Э", "E"], ["э", "e"], ["Ю", "Yu"], ["ю", "yu"], ["Я", "Ya"], ["я", "ya"], ["Ў", "O‘"], ["ў", "o‘"], ["Қ", "Q"], ["қ", "q"], ["Ғ", "G‘"], ["ғ", "g‘"], ["Ҳ", "H"], ["ҳ", "h"], ["Щ", "Shch"], ["щ", "shch"], ["ы", "i"]
);
const latiniseUzbek = (cyrillic_uzbek) => {
    let latinised_uzbek = cyrillic_uzbek;
    for(const replacement_pair of latin_cyrillic_uzbek_array) {
        latinised_uzbek = latinised_uzbek.replaceAll(replacement_pair[0], replacement_pair[1]);
    }
    return latinised_uzbek;
};

const cyrillic_latin_uzbek_array = [["O’", "O‘"],["o’", "o‘"],["G’", "G‘"],["g’", "g‘"],["O\'", "O‘"],["o\'", "o‘"],["G\'", "G‘"],["g\'", "g‘"],["Shch", "Щ"],["shch", "щ"],["Yo‘", "Йў"],["yo‘", "йў"],["Yo", "Ё"],["yo", "ё"],["Ye", "Е"],["ye", "е"],["Ch", "Ч"],["ch", "ч"],["Sh", "Ш"],["sh", "ш"],["Yu", "Ю"],["yu", "ю"],["Ya", "Я"],["ya", "я"],["O‘", "Ў"],["o‘", "ў"],["G‘", "Ғ"],["g‘", "ғ"],[/(?<=^|[^\p{L}])E/gu, "Э"],[/(?<=^|[^\p{L}])e/gu, "э"],["A", "А"],["a", "а"],["B", "Б"],["b", "б"],["V", "В"],["v", "в"],["G", "Г"],["g", "г"],["D", "Д"],["d", "д"],["E", "Е"],["e", "е"],["J", "Ж"],["j", "ж"],["Z", "З"],["z", "з"],["I", "И"],["i", "и"],["Y", "Й"],["y", "й"],["K", "К"],["k", "к"],["L", "Л"],["l", "л"],["M", "М"],["m", "м"],["N", "Н"],["n", "н"],["O", "О"],["o", "о"],["P", "П"],["p", "п"],["R", "Р"],["r", "р"],["S", "С"],["s", "с"],["T", "Т"],["t", "т"],["U", "У"],["u", "у"],["F", "Ф"],["f", "ф"],["X", "Х"],["x", "х"],["S", "Ц"],["s", "ц"],["'", "ъ"],["’", "ъ"],["Q", "Қ"],["q", "қ"],["H", "Ҳ"],["h", "ҳ"]];

const cyrilliciseUzbek = (latin_uzbek) => {
    latin_uzbek = latin_uzbek.replaceAll("о", "o").replaceAll("е", "e").replaceAll("О", "O").replaceAll("Е", "E").replaceAll("А", "A").replaceAll("а", "a");

    let cyrillicised_uzbek = latin_uzbek;
    for(const replacement_pair of cyrillic_latin_uzbek_array) {
        cyrillicised_uzbek = cyrillicised_uzbek.replaceAll(replacement_pair[0], replacement_pair[1]);
    }
    return cyrillicised_uzbek;
};

const arg_path = process.argv[2];
if(process.argv.length < 3){
    console.log("Must provide input file-path");
    process.exit(1);
}
const in_file = fs.createReadStream(arg_path);

const rl = readline.createInterface({input: in_file});

rl.on("line", line => console.log(cyrilliciseUzbek(line)));
rl.on("close", () => {
    in_file.close();
});
