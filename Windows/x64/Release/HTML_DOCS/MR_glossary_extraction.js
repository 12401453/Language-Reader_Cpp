//extract a JSON version of the glossary from the ebook's XML files (open the XML file in browser and then run in the devtools console)
let glossary = [];
const entries = document.getElementsByClassName("dialogue");
for (let entry of entries) {
    let link = false;
    entry.childNodes.forEach(node => {
        if(node.nodeType == 3 && node.textContent == ' see ') link  = true;
    });
    if(link) {
        let headword = "";
        let definition = "";
        let flip = false;
        for (let node of entry.childNodes) {
            
            if(node.nodeType == 3 && node.textContent == ' see ') {
                flip = true;
                continue;
            }
            if(flip) definition += node.textContent;
            else headword += node.textContent;

        };
        glossary.push([true, headword, definition])
    }
    else {
        let headword = "";
        let grammar = "";
        let definition = "";
        let part_index = 0;

        for (let node of entry.childNodes) {
            if(part_index == 0 && node.textContent.startsWith(" ") || part_index == 1 && node.nodeName == 'em') {
                part_index++;
            }
            switch(part_index) {
                case 0:
                    headword += node.textContent;
                    break;
                case 1:
                    grammar += node.textContent;
                    break;
                case 2:
                    if(node.nodeName == 'b') definition += "<b>" + node.textContent + "</b>";
                    else if(node.nodeName == 'em') definition += "<em>" + node.textContent + "</em>";
                    else definition += node.textContent;
                    break;
            }   
        }
        grammar = grammar.trim();
        definition = definition.trim();
        glossary.push([false, headword, definition, grammar]);
    }
}
//then do JSON.stringify(glossary) and copy the resulting text into a .json file, removing the single-quotes


//create an entry with a bare (no length or palatalisation-marks) form of each entry for searching on
glossary.forEach(entry => entry.splice(2, 0, entry[1].replaceAll('ð', 'þ').replaceAll('ǣ', 'æ').replaceAll('ā', 'a').replaceAll('ē', 'e').replaceAll('ī', 'i').replaceAll('ȳ', 'y').replaceAll('ō', 'o').replaceAll('ū', 'u').replaceAll('ġ', 'g').replaceAll('ċ', 'c')));


//sort by length of entry
let glossary_sorted = [];
glossary.forEach(entry => {

    for(let i = 0; i < glossary_sorted.length + 1; i++) {
        if(i == glossary_sorted.length) {
            glossary_sorted.push(entry);
            break;
        }
        if(entry[2].length < glossary_sorted[i][2].length) {
            glossary_sorted.splice(i, 0, entry);
            break;
        };

    }
});


//read the on-disk stringified .json file of the glossary into memory as a javascript array
let glossary = [];
const readGlossary = () => {
    fetch("MR_glossary.json")
    .then(response => {
        return response.json();
    })
    .then(response => {
        glossary = response;
    })
};