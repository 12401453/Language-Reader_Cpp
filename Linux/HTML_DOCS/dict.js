const dictLookupPONS_pl_en = (word) => {
    let send_data = "url=https://de.pons.com/%C3%BCbersetzung/polnisch-englisch/"+encodeURIComponent(word);
    const httpRequest = (method, url) => {
        const xhttp = new XMLHttpRequest();
        xhttp.open(method, url, true);
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhttp.responseType = 'text';
        xhttp.onreadystatechange = () => { 
            if (xhttp.readyState == 4) {
            scrapePONS(xhttp.responseText);
            console.log("curl complete");
            unpackDictResult(dict_result_PONS);
            }
        } 
        xhttp.send(send_data);
    };  
    httpRequest("POST", "curl_lookup.php");  
    };

    const dictLookupPONS_pl_de = (word) => {
    let send_data = "url=https://de.pons.com/%C3%BCbersetzung/polnisch-deutsch/"+encodeURIComponent(word);
    const httpRequest = (method, url) => {
        const xhttp = new XMLHttpRequest();
        xhttp.open(method, url, true);
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhttp.responseType = 'text';
        xhttp.onreadystatechange = () => { 
            if (xhttp.readyState == 4) {
            scrapePONS(xhttp.responseText);
            console.log("curl complete");
            unpackDictResult(dict_result_PONS);
            }
        } 
        xhttp.send(send_data);
    };  
    httpRequest("POST", "curl_lookup.php");  
    };

    const dictLookupPONS_da_de = (word) => {
    let send_data = "url=https://de.pons.com/%C3%BCbersetzung/d%C3%A4nisch-deutsch/"+encodeURIComponent(word);
    const httpRequest = (method, url) => {
        const xhttp = new XMLHttpRequest();
        xhttp.open(method, url, true);
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhttp.responseType = 'text';
        xhttp.onreadystatechange = () => { 
            if (xhttp.readyState == 4) {
            scrapePONS(xhttp.responseText);
            console.log("curl complete");
            unpackDictResult(dict_result_PONS);
            }
        } 
        xhttp.send(send_data);
    };  
    httpRequest("POST", "curl_lookup.php");  
    };

    const dictLookupPONS_ru_de = (word) => {
    let send_data = "url=https://de.pons.com/%C3%BCbersetzung/russisch-deutsch/"+encodeURIComponent(word);
    const httpRequest = (method, url) => {
        const xhttp = new XMLHttpRequest();
        xhttp.open(method, url, true);
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhttp.responseType = 'text';
        xhttp.onreadystatechange = () => { 
            if (xhttp.readyState == 4) {
            scrapePONS(xhttp.responseText);
            console.log("curl complete");
            unpackDictResult(dict_result_PONS);
            }
        } 
        xhttp.send(send_data);
    };  
    httpRequest("POST", "curl_lookup.php");  
    };

    const dictLookupPONS_sv_de = (word) => {
    let send_data = "url=https://de.pons.com/%C3%BCbersetzung/schwedisch-deutsch/"+encodeURIComponent(word);
    const httpRequest = (method, url) => {
        const xhttp = new XMLHttpRequest();
        xhttp.open(method, url, true);
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhttp.responseType = 'text';
        xhttp.onreadystatechange = () => { 
            if (xhttp.readyState == 4) {
            scrapePONS(xhttp.responseText);
            console.log("curl complete");
            unpackDictResult(dict_result_PONS);
            }
        } 
        xhttp.send(send_data);
    };  
    httpRequest("POST", "curl_lookup.php");  
    };

    const dictLookupPONS_de_en = (word) => {
    let send_data = "url=https://de.pons.com/%C3%BCbersetzung/deutsch-englisch/"+encodeURIComponent(word);
    const httpRequest = (method, url) => {
        const xhttp = new XMLHttpRequest();
        xhttp.open(method, url, true);
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhttp.responseType = 'text';
        xhttp.onreadystatechange = () => { 
            if (xhttp.readyState == 4) {
            scrapePONS(xhttp.responseText);
            console.log("curl complete");
            unpackDictResult(dict_result_PONS);
            }
        } 
        xhttp.send(send_data);
    };  
    httpRequest("POST", "curl_lookup.php");  
    };


    let dict_func = dictLookupPONS_pl_de;
    const submitDict = (event) => {
        if(event.key == "Enter") {
            dict_func(event.target.value.trim());
            document.getElementById("dict_body").innerHTML = "";
            document.getElementById("dict_body").style.display = "flex";
            event.preventDefault();
            event.target.value = "";
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
            if(node.nodeType == 1 && node.matches(".case, .info, .rhetoric, .genus, .style, .topic, .restriction")) {
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

        let meaning_sections = PONS_page.querySelectorAll(".rom");
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

    const unpackDictResult = (dict_result) => {
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
                dict_func = dictLookupPONS_pl_en;
                document.getElementById("dict_logo").src = "PONS.ico";
                console.log("pl-en");
                break;
            case "PONS-pl-de":
                dict_func = dictLookupPONS_pl_de;
                document.getElementById("dict_logo").src = "PONS.ico";
                console.log("pl-de");
                break;
            case "PONS-da-de":
                dict_func = dictLookupPONS_da_de;
                document.getElementById("dict_logo").src = "PONS.ico";
                console.log("da-de");
                break;
            case "PONS-ru-de":
                dict_func = dictLookupPONS_ru_de;
                document.getElementById("dict_logo").src = "PONS.ico";
                console.log("ru-de");
                break;
            case "PONS-sv-de":
                dict_func = dictLookupPONS_sv_de;
                document.getElementById("dict_logo").src = "PONS.ico";
                console.log("sv-de");
                break;
            case "PONS-de-en":
                dict_func = dictLookupPONS_de_en;
                document.getElementById("dict_logo").src = "PONS.ico";
                console.log("de-en");
                break;
            case "Wk":
                dict_func = (word) => console.log("Wiktionary support unavailable");
                document.getElementById("dict_logo").src = "enwiktionary_grey.png";
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