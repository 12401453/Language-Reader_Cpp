const dictLookupPONS = (word, dict_url) => {
    let send_data = dict_url+encodeURIComponent(word);
    const httpRequest = (method, url) => {
        const xhttp = new XMLHttpRequest();
        xhttp.open(method, url, true);
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhttp.responseType = 'text';
        xhttp.onreadystatechange = () => { 
            if (xhttp.readyState == 4) {
            scrapePONS(xhttp.responseText);
            console.log("curl complete");
            unPackPONSResult(dict_result_PONS);
            }
        }; 
        xhttp.send(send_data);
    };  
    httpRequest("POST", "curl_lookup.php");  
};

const dictLookupWiktionary = (word, dict_url, Wk_langname) => {
    let send_data = dict_url+encodeURIComponent(word);
    const httpRequest = (method, url) => {
        const xhttp = new XMLHttpRequest();
        xhttp.open(method, url, true);
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhttp.responseType = 'text';
        xhttp.onreadystatechange = () => { 
            if (xhttp.readyState == 4) {
            scrapeWiktionary(xhttp.responseText, Wk_langname);
            console.log("curl complete");
            unPackWikResult(dict_result_Wk);
            }
        }; 
        xhttp.send(send_data);
    };  
    httpRequest("POST", "curl_lookup.php");  
};


let dict_func = dictLookupPONS;
let dict_url = "url=https://de.pons.com/%C3%BCbersetzung/polnisch-deutsch/";
const submitDict = (event) => {
    if(event.key == "Enter") {
        dict_func(event.target.value.trim(), dict_url, Wk_langname);
        document.getElementById("dict_body").innerHTML = "";
        document.getElementById("dict_body").style.display = "flex";
        event.preventDefault();
        //event.target.value = "";
        event.target.select();
    }
};
document.getElementById("dict_searchbox").addEventListener("keydown", submitDict);

let dict_result_PONS = Object.create(null);

const scrapePONS = (PONS_html) => {
    dict_result_PONS = {
        beispielsaetze: {
        },
    };
    const parser = new DOMParser();
    const PONS_page = parser.parseFromString(PONS_html, "text/html");

    if(PONS_page.getElementsByClassName("fuzzysearch").length > 0) {
        console.log("exact word not found");
        return;
    }

    const extractText = (node_list) => {
        let text = "";
        node_list.forEach(node => {
        if(node.nodeType == 1 && node.matches(".case, .info, .rhetoric, .genus, .style, .topic, .restriction, .complement, .region")) {
            text += "[" + node.textContent + "]";
        }
        else if(node.nodeType == 1 && node.matches(".collocator")) {
            text += "(" + node.textContent + ")";
        }
        else if(/^\s+$/.test(node.textContent)) {        
            text += " ";
        }
        else {
            text += node.textContent;
        }
        });
        return text.trim();
    };

    let meaning_sections = PONS_page.querySelectorAll(".rom"); //it can occur that no .rom exists but a single transation is given (Ru. хуй), so need to add a check for it
    let rom_lngth = meaning_sections.length;
    for(let i = 0; i < rom_lngth; i++) {
        if(meaning_sections[i].querySelector(".signature-od") == null) {
            dict_result_PONS[i] = {};
            let blocks = meaning_sections[i].querySelectorAll(".translations"); //.opened"); this second .opened class seems to not appear when cURL-ing the page
            let block_lngth = blocks.length;
            for(let j = 0; j < block_lngth; j++) {
                if(blocks[j].querySelector("h3").textContent.trim() == "Wendungen:") {
                    dict_result_PONS[i].wendungen = {};
                    let entries_pl = blocks[j].querySelectorAll(".dt-inner > .source"); //the > means get only the first child with specified class instead of further grandchildren
                    let entries_eng = blocks[j].querySelectorAll(".dd-inner > .target");
                    let entries_lngth = entries_pl.length;
                    for(let k = 0; k < entries_lngth; k++) {                      
                        let pl_entry = extractText(entries_pl[k].childNodes);
                        let eng_entry = extractText(entries_eng[k].childNodes);
                        dict_result_PONS[i].wendungen[k] = [pl_entry, eng_entry];
                    }
                }
                else {
                    dict_result_PONS[i][j] = {};
                    let entries_pl = blocks[j].querySelectorAll(".dt-inner > .source");
                    let entries_eng = blocks[j].querySelectorAll(".dd-inner > .target");
                    let entries_lngth = entries_pl.length;
                    for(let k = 0; k < entries_lngth; k++) {   
                        let pl_entry = extractText(entries_pl[k].childNodes);
                        let eng_entry = extractText(entries_eng[k].childNodes);
                        dict_result_PONS[i][j][k] = [pl_entry, eng_entry];
                    }
                }
            }
        }
    }
    let beispielsatz_block = PONS_page.querySelector(".results-dict-examples");
    if(beispielsatz_block != null) {
        let beispiele_pl = beispielsatz_block.querySelectorAll(".dt-inner > .source");
        let beispiele_eng = beispielsatz_block.querySelectorAll(".dd-inner > .target");
        let beispiele_lngth = beispiele_pl.length;
        for(let i = 0; i < beispiele_lngth; i++) {
            dict_result_PONS.beispielsaetze[i] = [extractText(beispiele_pl[i].childNodes), extractText(beispiele_eng[i].childNodes)];
        }
    }
};

let dict_result_Wk = Object.create(null);
const scrapeWiktionary = (Wk_html, Wk_langname) => {
  dict_result_Wk = {};

  const parser = new DOMParser();
  const Wk_page = parser.parseFromString(Wk_html, "text/html");

  if (Wk_page.getElementById(Wk_langname) == null) {
    console.log("No " + Wk_langname +" Definitions Found");
    return;
    
  }
  else {
    let pos = "";
    let langFlag = true; 
    let el = Wk_page.getElementById(Wk_langname).parentNode.nextElementSibling;
    console.log(Wk_langname + " Dictionary Entries Found:");
    
    let pos_counters = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    let pos_index = 0;
    while(el && langFlag) {
        
      if(el.nodeName != "H2") {

        if(el.nodeName == "H4" || el.nodeName == "H3") {
          
          pos = el.querySelector(".mw-headline").textContent;
          if(pos.includes("Noun")) {pos_index = 0; pos_counters[pos_index] = pos_counters[pos_index] + 1;}
          else if (pos.includes("Verb")) {pos_index = 1; pos_counters[pos_index] = pos_counters[pos_index] + 1;}
          else if (pos.includes("Adverb")) {pos_index = 2; pos_counters[pos_index] = pos_counters[pos_index] + 1;}
          else if (pos.includes("Adjective")) {pos_index = 3; pos_counters[pos_index] = pos_counters[pos_index] + 1;}
          else if (pos.includes("Conjunction")) {pos_index = 4; pos_counters[pos_index] = pos_counters[pos_index] + 1;}
          else if (pos.includes("Preposition")) {pos_index = 5; pos_counters[pos_index] = pos_counters[pos_index] + 1;}
          else if (pos.includes("Interjection")) {pos_index = 6; pos_counters[pos_index] = pos_counters[pos_index] + 1;}
          else if (pos.includes("Particle")) {pos_index = 7; pos_counters[pos_index] = pos_counters[pos_index] + 1;}
          else if (pos.includes("Determiner")) {pos_index = 8; pos_counters[pos_index] = pos_counters[pos_index] + 1;}
          else if (pos.includes("Pronoun")) {pos_index = 9; pos_counters[pos_index] = pos_counters[pos_index] + 1;}
          else if (pos.includes("Participle")) {pos_index = 10; pos_counters[pos_index] = pos_counters[pos_index] + 1;}
          else if (pos.includes("Postposition")) {pos_index = 11; pos_counters[pos_index] = pos_counters[pos_index] + 1;}
          else if (pos.includes("Letter")) {pos_index = 12; pos_counters[pos_index] = pos_counters[pos_index] + 1;}
          else if (pos.includes("Predicative")) {pos_index = 13; pos_counters[pos_index] = pos_counters[pos_index] + 1;}
          else if (pos.includes("Prefix")) {pos_index = 14; pos_counters[pos_index] = pos_counters[pos_index] + 1;}
          else if (pos.includes("Numeral")) {pos_index = 15; pos_counters[pos_index] = pos_counters[pos_index] + 1;}
          else if (pos.includes("Article")) {pos_index = 16; pos_counters[pos_index] = pos_counters[pos_index] + 1;}
          else if (pos.includes("Contraction")) {pos_index = 17; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
          /*else if (pos.includes("Noun")) pos_index = 18;
          else if (pos.includes("Noun")) pos_index = 19; */     
        }
        
        if(el.nodeName == "OL") {
          let definition_array = new Array();
          
          el1 = el.firstElementChild;
          while (el1 != null) {
            let def = "";
    
            el1.childNodes.forEach(node => {
              if(node.nodeName == 'DL' || node.className == "nyms-toggle" || node.nodeName == 'UL' || node.className == "HQToggle" || node.nodeName == 'OL') {;}
              else if(node.className == "use-with-mention") {
                def += "[" + node.textContent + "]";
              }
              else {
                def += node.textContent;
              }
            });
            def = def.trim();
            //console.log(def);
            if(def != "") definition_array.push(def);
            el1 = el1.nextElementSibling;
          }
          if(dict_result_Wk[pos] == undefined) {
            dict_result_Wk[pos] = definition_array;      
          }
          else {
            dict_result_Wk[pos+String(pos_counters[pos_index])] = definition_array;
          }
        }
    
      } 
      else { 
        langFlag = false;
      } 
      el = el.nextElementSibling;   
    }
    console.log(pos_counters);
  }
};

const unPackPONSResult = (dict_result) => {
    let dict_body = document.getElementById("dict_body");
    for(let i in dict_result) {
        if(i == "beispielsaetze") {
        for(let x in dict_result.beispielsaetze) {
            //console.log(dict_result.beispielsaetze[x][0] + " => " + dict_result.beispielsaetze[x][1]);
            dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell left">'+dict_result.beispielsaetze[x][0]+'</div><div class="dict_cell right">'+dict_result.beispielsaetze[x][1]+'</div></div>'));
        }
        }
        else {
        for(let j in dict_result[i]) {
            for(let k in dict_result[i][j]) {
            //console.log(dict_result[i][j][k][0] + " => " + dict_result[i][j][k][1]);
            dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell left">'+dict_result[i][j][k][0]+'</div><div class="dict_cell right">'+dict_result[i][j][k][1]+'</div></div>'));
            }
        }
        }
    }
};

const unPackWikResult = (dict_result_Wk) => {
    let dict_body = document.getElementById("dict_body");
    for(let pos in dict_result_Wk) {
        dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell dict_pos">'+pos+'</div></div>'));
        dict_result_Wk[pos].forEach(def => {
            dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell Wk">'+def+'</div></div>'));
        });
    }
};

document.getElementById("dict_close").addEventListener('click', () => {
    let dict_body = document.getElementById("dict_body");
    if(dict_body.style.display == "flex") dict_body.style.display = "none";
    else dict_body.style.display = "flex";
});

let logo = 1;
const switchDict = (event) => {
    let dict_id = event.target.id;

    switch(dict_id) {
        case "PONS-pl-en":
            //dict_func = dictLookupPONS_pl_en;
            dict_func = dictLookupPONS;
            document.getElementById("dict_logo").src = "PONS.png";
            document.getElementById("dict_logo").title = "PONS.com";
            dict_url = "url=https://de.pons.com/%C3%BCbersetzung/polnisch-englisch/"
            console.log("pl-en");
            break;
        case "PONS-pl-de":
            //dict_func = dictLookupPONS_pl_de;
            dict_func = dictLookupPONS;
            document.getElementById("dict_logo").src = "PONS.png";
            document.getElementById("dict_logo").title = "PONS.com";
            dict_url = "url=https://de.pons.com/%C3%BCbersetzung/polnisch-deutsch/";
            console.log("pl-de");
            break;
        case "PONS-da-de":
            //dict_func = dictLookupPONS_da_de;
            dict_func = dictLookupPONS;
            document.getElementById("dict_logo").src = "PONS.png";
            document.getElementById("dict_logo").title = "PONS.com";
            dict_url = "url=https://de.pons.com/%C3%BCbersetzung/d%C3%A4nisch-deutsch/";
            console.log("da-de");
            break;
        case "PONS-ru-de":
            //dict_func = dictLookupPONS_ru_de;
            dict_func = dictLookupPONS;
            document.getElementById("dict_logo").src = "PONS.png";
            document.getElementById("dict_logo").title = "PONS.com";
            dict_url = "url=https://de.pons.com/%C3%BCbersetzung/russisch-deutsch/";
            console.log("ru-de");
            break;
        case "PONS-sv-de":
            //dict_func = dictLookupPONS_sv_de;
            dict_func = dictLookupPONS;
            document.getElementById("dict_logo").src = "PONS.png";
            document.getElementById("dict_logo").title = "PONS.com";
            dict_url = "url=https://de.pons.com/%C3%BCbersetzung/schwedisch-deutsch/";
            console.log("sv-de");
            break;
        case "PONS-de-en":
            //dict_func = dictLookupPONS_de_en;
            dict_func = dictLookupPONS;
            document.getElementById("dict_logo").src = "PONS.png";
            document.getElementById("dict_logo").title = "PONS.com";
            dict_url = "url=https://de.pons.com/%C3%BCbersetzung/deutsch-englisch/";
            console.log("de-en");
            break;
        case "Wk":
            dict_func = dictLookupWiktionary;
            document.getElementById("dict_logo").src = "enwiktionary_grey.png";
            document.getElementById("dict_logo").title = "Wiktionary";
            dict_url = "url=https://en.wiktionary.org/wiki/";
            setWkLangName();
            console.log("Wk");
            break;
    }
    event.target.parentElement.style.visibility = "hidden";
};

document.getElementById("dict_logo").addEventListener('click', () => {
    let dict_select = document.getElementById("dict_select");
    if(dict_select.style.visibility == "hidden") dict_select.style.visibility = "visible";
    else dict_select.style.visibility = "hidden";
});

for(let dict_entry of document.getElementsByClassName("dict_name")) {
    dict_entry.addEventListener('click', switchDict);
}