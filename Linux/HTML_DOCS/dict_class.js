class Dictionary {

    constructor(m_lang_id=lang_id) {
        this.m_lang_id = m_lang_id;
        //default dicts
        switch(this.m_lang_id) {
            case 1:
                this.dict_type = 2;
                this.lang_name = "Russian";
                break;
            case 2:
                this.dict_type = 3;
                this.lang_name = "Kazakh";
                break;
            case 3:
                this.dict_type = 1;
                this.lang_name = "Polish";
                break;
            case 4:
                this.dict_type = 1;
                this.lang_name = "Bulgarian";
                break;
            case 5:
                this.dict_type = 5;
                this.lang_name = "German";
                break;
            case 6:
                this.dict_type = 1;
                this.lang_name = "Swedish";
                break;
            case 7:
                this.dict_type = 1;
                this.lang_name = "Turkish";
                break;
            case 8:
                this.dict_type = 1;
                this.lang_name = "Danish";
                break;
            case 10:
                this.dict_type = 6;
                this.lang_name = "Old English";
                fetch("MR_glossary.json")
                .then(response => {
                    return response.json();
                })
                .then(response => this.OE_glossary = response);
                break;
            case 11: 
                this.dict_type = 2;
                this.lang_name = "Latin";
                break;
            case 12:
                this.dict_type = 2;
                this.lang_name = "Azerbaijani";
        }
        this.PONS_german = this.m_lang_id == 5 ? false : true;
    }

    urlMaker(word, dict_type=this.dict_type, PONS_german=this.PONS_german) {
        if(dict_type == 1) {
            let PONS_lang_dir = "";
            const PONS_target = PONS_german ? "deutsch/" : "englisch/";
            
            switch(this.m_lang_id) {
                case 1:
                    PONS_lang_dir = "russisch-";
                    break;
                case 3:
                    PONS_lang_dir = "polnisch-";
                    break;
                case 4:
                    PONS_lang_dir = "bulgarisch-";
                    break;
                case 5:
                    PONS_lang_dir = "deutsch-";
                    break;
                case 6:
                    PONS_lang_dir = "schwedisch-";
                    break;
                case 7:
                    PONS_lang_dir = "t%C3%BCrkisch-";
                    break;
                case 8:
                    PONS_lang_dir = "d%C3%A4nisch-";
                    break;
            }
            PONS_lang_dir += PONS_target;

            return "https://de.pons.com/%C3%BCbersetzung/" + PONS_lang_dir + encodeURIComponent(word);
        }
        else if(dict_type == 2) {
            if(this.m_lang_id == 10) {
                word = this.wiktionariseOldEnglish(word);
            }
            if(this.m_lang_id == 11) {
                word = this.wiktionariseLatin(word);
            }
            return "https://en.wiktionary.org/wiki/" + encodeURIComponent(word);
        }
        else if(dict_type == 3) {
            return "https://sozdik.kz/translate/kk/ru/"+ encodeURIComponent(word)+ "/";
        }
        else if(dict_type == 4) {
            return "https://sozdik.kz/translate/ru/kk/"+ encodeURIComponent(word)+ "/";
        }
        else if(dict_type == 5) {
            return "https://www.dict.cc/?s=" + encodeURIComponent(word);
        }
        else if(dict_type == 7) {
            return "https://ordnet.dk/ddo/ordbog?query=" + encodeURIComponent(word);
        }
    }
    dict_name = "";
    lang_name = "";
    dict_type = 2;
    //PONS_german = this.m_lang_id == 5 ? false : true;
    bool_displayed = false;
    OE_glossary = [];

    logos = {
        1: {
            logo_url: 'PONS.png" title="PONS.com"',
        },
        2: {
            logo_url: 'enwiktionary_grey.png" title="Wiktionary"',
        },
        3: {
            logo_url: 'sozdik.svg" title="sozdik.kz Kaz-Ru"',
        },
        4: {
            logo_url: 'sozdik.svg" title="sozdik.kz Ru-Kaz"',
        },
        5: {
            logo_url: 'dictcc.png" title="dict.cc"',
        },
        6: {
            logo_url: 'MR_glossary.jpg" title="Glossary from Mitchell&Robinson\'s Guide to Old English"',
        },
        7: {
            logo_url: 'ordnet.jpg" title="Den Danske Ordbog"',
        }
    };
    allowable_dicts = {
        1: [2,1],
        2: [3,4,2],
        3: [1,2],
        4: [1,2,5],
        5: [5,1,2],
        6: [1,2],
        7: [1,2],
        8: [1,2,7,5],
        10: [6,2],
        11: [2],
        12: [2],
    };

    display() {
        let logo_url = this.logos[this.dict_type].logo_url;
        let dict_html = document.createRange().createContextualFragment('<div id="dict_outline"><div id="dict_topbar"><div id="dict_minimise"><div id="minimise"></div></div><div id="dict_close"><svg id="red_cross" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z"/></svg></div></div><div id="dict_body" style="display: flex;"></div><div id="dict_bottombar"><textarea id="dict_searchbox" spellcheck="false"></textarea><img id="dict_logo" src="'+logo_url+' draggable="false"></img></div></div><div id="dict_hidden_box"><div id="dict_hidden_text">Dict</div></div>');
        document.getElementById("spoofspan2").after(dict_html);
        document.getElementById("dict_searchbox").addEventListener("keydown", this.submit);
        document.getElementById("dict_minimise").addEventListener('click', () => {
            let dict_body = document.getElementById("dict_body");
            if(dict_body.style.display == "flex") dict_body.style.display = "none";
            else dict_body.style.display = "flex";
        });
        document.getElementById("dict_hidden_box").addEventListener('click', this.open_smallscreen_dict);
        document.getElementById("dict_close").addEventListener('click', this.close_smallscreen_dict);
        document.getElementById("dict_logo").addEventListener('click', this.switchDict);
        if(this.m_lang_id == 10) {
            document.getElementById("dict_searchbox").addEventListener("beforeinput", this.dictOldEnglishInput);
        }
        this.bool_displayed = true;
    }
    remove() {
        document.getElementById("dict_outline").remove();
        document.getElementById("dict_hidden_box").remove();
        console.log("remove() called");
        this.bool_displayed = false;
    }
    close_smallscreen_dict() {
        document.getElementById("dict_outline").style.display = "none";
        document.getElementById("dict_hidden_box").style.display = "flex";
    }
    open_smallscreen_dict() {
        document.getElementById("dict_outline").style.display = "flex";
        document.getElementById("dict_hidden_box").style.display = "none";
        document.getElementById("dict_searchbox").focus();

    }

    submit = (event) => {
        if(event.key == "Enter") {
            //this.lookUp(event.target.value.trim());
            document.getElementById("dict_body").innerHTML = "";
            document.getElementById("dict_body").style.display = "flex";
            event.preventDefault();
            //event.target.value = "";
            event.target.select();
            this.lookUp(event.target.value.trim());
        }
    };

    switchDict = () => {
        const dicts_arr = this.allowable_dicts[this.m_lang_id];
        this.dict_type = dicts_arr[(dicts_arr.indexOf(this.dict_type) + 1) % dicts_arr.length];
        console.log("dict_type: "+this.dict_type);
        document.getElementById("dict_logo").outerHTML = '<img id="dict_logo" src="' + this.logos[this.dict_type].logo_url + '></img>';
        if(this.dict_type == 4) document.getElementById("dict_logo").style.filter = "hue-rotate(270deg)";
        else document.getElementById("dict_logo").style.filter = "none";
        document.getElementById("dict_logo").addEventListener('click', this.switchDict);
    };
    


    lookUp(word, dict_type=this.dict_type, PONS_german=this.PONS_german) {
        if(this.bool_displayed == false) return;  
        document.getElementById("dict_body").innerHTML = "";
        document.getElementById("dict_body").style.display = "flex";
        if(dict_type == 6) {
            this.MR_glossaryLookup(word);
            return;
        }
        let send_data = "url="+this.urlMaker(word, dict_type, PONS_german); //this has all been URI-encoded already
        const httpRequest = (method, url) => {
            const xhttp = new XMLHttpRequest();
            xhttp.open(method, url, true);
            xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhttp.responseType = 'text';
            xhttp.onreadystatechange = () => { 
                if (xhttp.readyState == 4) {
                    console.log("curl complete");
                    if(xhttp.responseText == "Request timeout") {
                        this.noResultsFound("Dictionary request took more than ten seconds so it was aborted");
                        return;
                    }
                    else if(xhttp.responseText == "curl failure") {
                        this.noResultsFound("Dictionary request has failed");
                        return;
                    }
                    else this.dictResultParse(xhttp.responseText, dict_type);
                }
            }; 
            xhttp.send(send_data);
        };  
        httpRequest("POST", "curl_lookup.php");  
    }
    dictResultParse(response_text, dict_type=this.dict_type) {
        if(dict_type == 3 || dict_type == 4) this.scrapeSozdik(response_text);
        else if(dict_type == 1) this.scrapePONS(response_text);
        else if(dict_type == 2) this.scrapeWiktionary(response_text);
        else if(dict_type == 5) this.scrapeDictCC(response_text);
        else if(dict_type == 7) this.scrapeDanskeOrdbogen(response_text);
    }

    noResultsFound(message="No results found") {
        let dict_body = document.getElementById("dict_body");
        dict_body.innerHTML = "";
        dict_body.style.display = "flex";
        dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell Wk">'+message+'</div></div>'));
    }

    lookUpMouseSelection = (event) => {
        if(event.key == "Enter") {
            event.preventDefault();
            let lemma_tag_area = document.getElementById("lemma_tag");
            const highlighted_text = lemma_tag_area.value.slice(lemma_tag_area.selectionStart, lemma_tag_area.selectionEnd);
            if(highlighted_text.length == 0) return;
            document.getElementById("dict_searchbox").value = highlighted_text;
            this.lookUp(highlighted_text);
            //event.preventDefault();
        }        
    };

    lookUpClick = (event) => {
        if(event.type == 'click') {
            const new_word = event.target.textContent.trim();
            document.getElementById("dict_searchbox").value = new_word;
            this.lookUp(new_word);        
        }
    };

    wiktionariseOldEnglish = (OE_string) => {
        return OE_string.replaceAll('ð', 'þ').replaceAll('ǣ', 'æ').replaceAll('ā', 'a').replaceAll('ē', 'e').replaceAll('ī', 'i').replaceAll('ȳ', 'y').replaceAll('ō', 'o').replaceAll('ū', 'u').replaceAll('ƿ', 'w').replaceAll('ᵹ', 'g').replaceAll('ċ', 'c').replaceAll('ġ', 'g');
    };
    wiktionariseLatin = (Latin_string) => {
        return Latin_string.replaceAll('ā', 'a').replaceAll('ē', 'e').replaceAll('ī', 'i').replaceAll('ȳ', 'y').replaceAll('ō', 'o').replaceAll('ū', 'u');
    };

    /* Dict-type codes:
        PONS: 1
        Wiktionary : 2
        sozdikQaz: 3
        sozdikRus: 4
        dict.cc: 5
        Mitchell&Robinson glossary: 6
    */

    scrapeSozdik(response_text) {
        const sozdik_result = JSON.parse(response_text);
        if(sozdik_result.message == "Human check required") {
            this.noResultsFound("sozdik.kz authentication has failed)");
            return;
        }
        let dict_body = document.getElementById("dict_body");
    
        const parser = new DOMParser();
        const sozdik_result_trans = sozdik_result.data.translation;
        if(sozdik_result_trans == "") {
            this.noResultsFound();
            return;
        }
        const sozdikHTML = parser.parseFromString(sozdik_result_trans, 'text/html');
    
        const details_extractor =  (details_elem) => {
            let summary_text = "";
            details_elem.querySelector('details > summary').childNodes.forEach(childNode => {
                if(childNode.nodeName == "A") {
                    summary_text += "<span class=\"ru_clickable\">"+childNode.textContent+"</span>";
                }
                else if(childNode.nodeType == 3) {
                    summary_text += childNode.textContent;
                }
                else if(childNode.nodeName == "ABBR") {
                    summary_text += childNode.outerHTML.replace("data-title", "title");
                }
                else {
                    summary_text += childNode.outerHTML;
                }
            });
            return summary_text;
        };
    
        let html_str = "";
    
        sozdikHTML.body.querySelectorAll('body > details').forEach( (details_elem, i) => {
    
            let summary_text = details_extractor(details_elem);
            //sozdik_parsed_result[i] = {title: summary_text};
    
            html_str += '<div class="dict_row"><div class="dict_cell sozdik_title">'+summary_text+'</div></div>';
    
            details_elem.querySelectorAll('body > details > p').forEach( (p, x) => {
                //sozdik_parsed_result[i][x] 
                let bilingual_phrase = p.innerHTML.replace("abbr data-title", "abbr title").split("→").map(x => x.trim());
                html_str += '<div class="dict_row"><div class="dict_cell left">'+bilingual_phrase[0]+'</div><div class="dict_cell right">'+bilingual_phrase[1]+'</div></div>';
            });
    
            details_elem.querySelectorAll('body > details > details').forEach( (details_elem_2, j) => {
                let summary_2 = details_extractor(details_elem_2);
                //sozdik_parsed_result[i][j] = {title: summary_2};
                html_str += '<div class="dict_row"><div class="dict_cell sozdik_title">'+summary_2+'</div></div>';
    
                details_elem_2.querySelectorAll('body > details > details > p').forEach( (p, y) => {
                    //sozdik_parsed_result[i][j][y] = 
                    let bilingual_phrase = p.innerHTML.replace("abbr data-title", "abbr title").split("→").map(x => x.trim());
                    html_str += '<div class="dict_row"><div class="dict_cell left">'+bilingual_phrase[0]+'</div><div class="dict_cell right">'+bilingual_phrase[1]+'</div></div>';
                });
                /* this third-level has only existed due to error on the website's part so far */
                details_elem_2.querySelectorAll('body > details > details > details').forEach( (details_elem_3, k) => {
                    let summary_3 = details_extractor(details_elem_3);
                    //sozdik_parsed_result[i][j][k] = {title: summary_3};
    
                    html_str += '<div class="dict_row"><div class="dict_cell sozdik_title">'+summary_3+'</div></div>';
    
                    details_elem_3.querySelectorAll('body > details > details > details > p').forEach( (p, z) => {
                        //sozdik_parsed_result[i][j][k][z] 
                        let bilingual_phrase = p.innerHTML.replace("abbr data-title", "abbr title").split("→").map(x => x.trim());
                        html_str += '<div class="dict_row"><div class="dict_cell left">'+bilingual_phrase[0]+'</div><div class="dict_cell right">'+bilingual_phrase[1]+'</div></div>';
                    });
                }); /* ^^^^^^^^possible bullshit^^^^^^*/
            });
            
        });
    
        if(html_str == "") {
            sozdikHTML.body.querySelectorAll('p').forEach(p => {
                let p_html = "";
                p.childNodes.forEach(childNode => {
                    if(childNode.nodeName == "A") {
                        p_html += "<span class=\"ru_clickable\">"+childNode.textContent+"</span>";
                    }
                    else if(childNode.nodeType == 3) {
                        p_html += childNode.textContent;
                    }
                    else if(childNode.nodeName == "ABBR") {
                        p_html += childNode.outerHTML.replace("data-title", "title");
                    }
                    else {
                        p_html += childNode.outerHTML;
                    }
                });
                html_str += '<div class="dict_row"><div class="dict_cell Wk">'+p_html+'</div></div>';
            })
        }
    
        if(sozdik_result.data.synonyms != "") {
            const synonymHTML = parser.parseFromString(sozdik_result.data.synonyms, 'text/html');
            let synonym_html_str = "";
            const synonym_nodes = synonymHTML.body.childNodes;
            const synonyms_length = synonym_nodes.length;
            let x = 0;
            synonym_nodes.forEach(childNode => {
                if(childNode.firstChild.nodeName == "A") {
                    synonym_html_str += "<span class=\"kaz_clickable\">"+childNode.firstChild.textContent+"</span>";
                }
                else if(childNode.firstChild.nodeType == 3) {
                    synonym_html_str += childNode.firstChild.textContent;
                }
                x++;
                if(x < synonyms_length) synonym_html_str += ", ";
            });
            html_str += '<div class="dict_row"><div class="dict_cell sozdik_synonyms">Synonyms:</div></div>';
            html_str += '<div class="dict_row"><div class="dict_cell Wk">'+synonym_html_str+'</div></div>';
            
        }
        dict_body.innerHTML = "";
        dict_body.style.display = "flex";
        dict_body.appendChild(document.createRange().createContextualFragment(html_str));
        document.querySelectorAll(".kaz_clickable").forEach(synonym => {
                synonym.addEventListener('click', this.lookUpClick);
        });
    }

    dict_result_PONS = Object.create(null);
    scrapePONS(response_text) {
        this.dict_result_PONS = {
            beispielsaetze: {
            },
        };
        const parser = new DOMParser();
        const PONS_page = parser.parseFromString(response_text, "text/html");
    
        if(PONS_page.getElementsByClassName("fuzzysearch").length > 0) {
            this.noResultsFound("exact word not found");
            return;
        }
    
        const extractText = (node_list) => {
            let text = "";
            node_list.forEach(node => {
            if(node.nodeType == 1 && node.matches(".case, .info, .rhetoric, .genus, .style, .topic, .restriction, .complement, .region, .explanation")) {
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
        /*const extractHeaderText = (node_list) => {
            let text = "";
            let span_inserted = false;
            node_list.forEach( (node, i) => {
                if(node.nodeType == 1 && node.className != "headword_attributes" && span_inserted == false && node.className != "separator") {
                    text += '<span class="PONS_title_info">';
                    span_inserted = true;
                }
                else if(node.className == "separator") {
                    text = text.substring(0, text.length - 1);
                    text += node.textContent.trim();
                }
                else if(node.nodeType == 3) {
                    text += node.textContent.trim();
                    text += " ";     
                }
                else {
                    text += node.textContent.trim();
                    text += " ";
                }
            });
            text += '</span>';
            return text;
        }; */
        const extractHeaderText = (node_list) => {
            let text = "";
            node_list.forEach( (node) => {
                if(node.nodeType == 1 && node.nodeName == "SPAN" && node.className != "headword_attributes" && node.className != "headword" && node.className != "headword_spelling") {
                    text += '<span class="PONS_title_info">';
                    const elem = document.createElement("div");
                    elem.append(document.createTextNode(node.textContent.trim()));
                    text += elem.innerHTML;
                    text += '</span>';
                }
                else if(node.nodeType == 1 && node.nodeName == "SPAN" && node.className == "headword_attributes") {
                    text += "<span title=\"" + node.title + "\">" + node.textContent + "</span>";
                }
                else if(node.className == "headword") {
                    const children_nodes = node.childNodes;
                    for(let i = 0; i <children_nodes.length; i++){
                        if(children_nodes[i].nodeType == 3) {
                            text += children_nodes[i].textContent;
                        }
                    }
                }
                else if(node.nodeType == 3) {
                    text += node.textContent;     
                }
            });
            return text.trim();
        };



        const extractH3Text = (node_list) => {
            if(node_list.length < 2) {
                if(node_list.length == 0) return {};
                const h3_text = node_list[0].textContent.trim();
                if(h3_text == "") return {};
                else return '<span class="PONS_title_info">'+h3_text+'</span>';
            }
            let text = '<span class="PONS_title_info">';
            let span_inserted = false;
            node_list.forEach( (node, i) => {
                if(node.className == 'info' || node.className == 'style' || node.className == 'reflection') {
                    text = text.concat('<abbr style="color:#cbd9f4be;">').concat(node.textContent.trim()).concat('</abbr>');
                    text += " ";
                }
                else {
                    text += node.textContent.trim();
                    text += " ";
                }
                
            });
            text += '</span>';
            return text;
        };

        if(this.m_lang_id == 4) {
            //I've given up building the dict_results_PONS object for Bulgarian because the structure of the website-data precludes its saving in a structure that conforms to how the unPackPONSResult() function has to work
            let results_sections = PONS_page.querySelectorAll(".results");
            if(results_sections[0] == undefined) {
                this.noResultsFound("No results found");
                return;
            }
            let entry_sections = results_sections[0].querySelectorAll(".entry");
            entry_sections.forEach((entry, i) => {
                //this.dict_result_PONS[i] = {h2_text: {},};
                //this.dict_result_PONS[i].h2_text = extractHeaderText(entry.querySelector("h2").childNodes);

                //dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell dict_pos">'+extractHeaderText(entry.querySelector("h2").childNodes)+'</div></div>'));
                
                entry.querySelectorAll(".translations").forEach((block, j) => {

                    const previous_sibling = block.previousElementSibling;
                    if(previous_sibling != null && previous_sibling.classList.contains("rom"))
                    {
                        const h2_header_node = previous_sibling.querySelector("h2");
                        if(h2_header_node != null) dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell dict_pos">'+extractHeaderText(h2_header_node.childNodes)+'</div></div>'));
                    }

                    if(block.querySelector("h3").textContent.trim() == "Wendungen:") {
                        //this.dict_result_PONS[i].wendungen = {};

                        dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell dict_pos">'+'Wendungen'+'</div></div>'));

                        const entries_pl = block.querySelectorAll(".dt-inner > .source"); //the > means get only the first child with specified class instead of further grandchildren
                        const entries_eng = block.querySelectorAll(".dd-inner > .target");
                        const entries_lngth = entries_pl.length;
                        for(let k = 0; k < entries_lngth; k++) {                      
                            const pl_entry = extractText(entries_pl[k].childNodes);
                            const eng_entry = extractText(entries_eng[k].childNodes);
                            //this.dict_result_PONS[i].wendungen[k] = [pl_entry, eng_entry];

                            dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell left">'+pl_entry+'</div><div class="dict_cell right">'+eng_entry+'</div></div>'));
                        }
                    }

                    else {
                        //this.dict_result_PONS[i][j] = {h3_text: {},}
                        //this.dict_result_PONS[i][j].h3_text = extractH3Text(block.querySelector("h3").childNodes);

                        const h3_text = extractH3Text(block.querySelector("h3").childNodes);

                        if(typeof(h3_text) == "string") dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell dict_pos">'+h3_text+'</div></div>'));

                        const entries_pl = block.querySelectorAll(".dt-inner > .source"); //the > means get only the first child with specified class instead of further grandchildren
                        const entries_eng = block.querySelectorAll(".dd-inner > .target");
                        const entries_lngth = entries_pl.length;
                        for(let k = 0; k < entries_lngth; k++) {                      
                            const pl_entry = extractText(entries_pl[k].childNodes);
                            const eng_entry = extractText(entries_eng[k].childNodes);
                            //this.dict_result_PONS[i][j][k] = [pl_entry, eng_entry];

                            dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell left">'+pl_entry+'</div><div class="dict_cell right">'+eng_entry+'</div></div>'));
                        }
                    }
                });

            });
            if(entry_sections.length == 0) {
                    const dict_body = document.getElementById("dict_body");
                    dict_body.innerHTML = "";
                    dict_body.style.display = "flex";

                    const dl_sections = results_sections[0].querySelectorAll("dl");
                    dl_sections.forEach(dl_section => {
                        const entries_left = dl_section.querySelectorAll(".dt-inner > .source");
                        const entries_right = dl_section.querySelectorAll(".dd-inner > .target");
                
                        for (let i = 0; i < entries_left.length; i++)
                        {
                            const entry_left = extractText(entries_left[i].childNodes);
                            const entry_right = extractText(entries_right[i].childNodes);
                            
                            dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell left">'+entry_left+'</div><div class="dict_cell right">'+entry_right+'</div></div>'));
                        }
                    });
                    return;
                };
            //this.unPackPONSResult();
            return;
        }
    
        let meaning_sections = PONS_page.querySelectorAll(".rom"); //it can occur that no .rom exists but a single transation is given (Ru. хуй), so need to add a check for it
        let rom_lngth = meaning_sections.length;

        //this is for when PONS probably doesn't have an exact entry for the word but does have the word included in other example sentences/entries; the structure of the HTML is very different so we are just dumping them out without bothering to making a JSON object first
        if(rom_lngth == 0) {
            let results_sections = PONS_page.querySelectorAll(".results");
            let results_lngth = results_sections.length;
            if(results_lngth == 0 || (results_sections.length == 1 && results_sections[0].parentNode.classList.contains("catalog-browse"))) {
                this.noResultsFound();
                return;
            }
            let dict_body = document.getElementById("dict_body");
            dict_body.innerHTML = "";
            dict_body.style.display = "flex";

            for(let i = 0; i < results_lngth && i < 2; i++) {
                const entries_left = results_sections[i].querySelectorAll(".dt-inner > .source");
                const entries_right = results_sections[i].querySelectorAll(".dd-inner > .target");
                for(let j = 0; j < entries_left.length; j++) {
                    dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell left">'+extractText(entries_left[j].childNodes)+'</div><div class="dict_cell right">'+extractText(entries_right[j].childNodes)+'</div></div>'));
                }               
            }
            return;
        } 


        for(let i = 0; i < rom_lngth; i++) {
            if(meaning_sections[i].querySelector(".signature-od") == null) {
                this.dict_result_PONS[i] = {h2_text: {},};
                
                
                this.dict_result_PONS[i].h2_text = extractHeaderText(meaning_sections[i].querySelector("h2").childNodes);


                let blocks = meaning_sections[i].querySelectorAll(".translations"); //.opened"); this second .opened class seems to not appear when cURL-ing the page
                let block_lngth = blocks.length;
                for(let j = 0; j < block_lngth; j++) {
                    if(blocks[j].querySelector("h3").textContent.trim() == "Wendungen:") {
                        this.dict_result_PONS[i].wendungen = {};
                        const entries_pl = blocks[j].querySelectorAll(".dt-inner > .source"); //the > means get only the first child with specified class instead of further grandchildren
                        const entries_eng = blocks[j].querySelectorAll(".dd-inner > .target");
                        const entries_lngth = entries_pl.length;
                        for(let k = 0; k < entries_lngth; k++) {                      
                            const pl_entry = extractText(entries_pl[k].childNodes);
                            const eng_entry = extractText(entries_eng[k].childNodes);
                            this.dict_result_PONS[i].wendungen[k] = [pl_entry, eng_entry];
                        }
                    }
                    else {
                        //this.dict_result_PONS[i][j] = {};
                        this.dict_result_PONS[i][j] = {h3_text: {},};
                        //if(blocks[j].querySelector("h3").className != "empty hidden ") this.dict_result_PONS[i][j].h3_text = extractHeaderText(blocks[j].querySelector("h3").childNodes);
                        this.dict_result_PONS[i][j].h3_text = extractH3Text(blocks[j].querySelector("h3").childNodes);



                        const entries_pl = blocks[j].querySelectorAll(".dt-inner > .source");
                        const entries_eng = blocks[j].querySelectorAll(".dd-inner > .target");
                        const entries_lngth = entries_pl.length;
                        for(let k = 0; k < entries_lngth; k++) {   
                            const pl_entry = extractText(entries_pl[k].childNodes);
                            const eng_entry = extractText(entries_eng[k].childNodes);
                            this.dict_result_PONS[i][j][k] = [pl_entry, eng_entry];
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
                this.dict_result_PONS.beispielsaetze[i] = [extractText(beispiele_pl[i].childNodes), extractText(beispiele_eng[i].childNodes)];
            }
        }
        this.unPackPONSResult();
    };
    unPackPONSResult() {
        let dict_body = document.getElementById("dict_body");
        dict_body.innerHTML = "";
        dict_body.style.display = "flex";

        for(let i in this.dict_result_PONS) {
            if(i == "beispielsaetze") {
                if(Object.keys(this.dict_result_PONS.beispielsaetze).length > 0) {
                    dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell dict_pos">Beispielsätze</div></div>'));
                    for(let x in this.dict_result_PONS.beispielsaetze) {
                        dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell left">'+this.dict_result_PONS.beispielsaetze[x][0]+'</div><div class="dict_cell right">'+this.dict_result_PONS.beispielsaetze[x][1]+'</div></div>'));
                    }
                }
            }
            else {
                dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell dict_pos">'+this.dict_result_PONS[i].h2_text+'</div></div>'));
                for(let j in this.dict_result_PONS[i]) {    
                    if(j == "h2_text") continue;
                    if(j == "wendungen") {
                        dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell dict_pos">Wendungen</div></div>'));
                    }
                    else if(Object.keys(this.dict_result_PONS[i][j].h3_text).length > 0) {
                        dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell dict_pos">'+this.dict_result_PONS[i][j].h3_text+'</div></div>'));
                    }
                    for(let k in this.dict_result_PONS[i][j]) {
                        if(k == "h3_text") continue;
                        else dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell left">'+this.dict_result_PONS[i][j][k][0]+'</div><div class="dict_cell right">'+this.dict_result_PONS[i][j][k][1]+'</div></div>'));
                    }
                
                }
            }
        }
    }

    dict_result_Wk = Object.create(null);
    /*scrapeWiktionary = (response_text) => {
        this.dict_result_Wk = {};

        const parser = new DOMParser();
        const Wk_page = parser.parseFromString(response_text, "text/html");
        const wk_langName = this.lang_name.split(' ').join('_'); //multi-word language names in Wiktionary are joined by underscores for the purposes of element-id

        if (Wk_page.getElementById(wk_langName) == null) {
            this.noResultsFound("No " + this.lang_name + " definitions found");
            return;
        }
        else {
            let pos = "";
            let langFlag = true;
            let el = Wk_page.getElementById(wk_langName).parentNode.nextElementSibling;
            console.log(this.lang_name + " Dictionary Entries Found:");

            let pos_counters = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            let pos_index = 0;
            while (el && langFlag) {

                if (el.nodeName != "H2") {

                    if (el.nodeName == "H4" || el.nodeName == "H3") {

                        pos = el.querySelector(".mw-headline").textContent;
                        if (pos.includes("Noun")) { pos_index = 0; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Verb")) { pos_index = 1; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Adverb")) { pos_index = 2; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Adjective")) { pos_index = 3; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Conjunction")) { pos_index = 4; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Preposition")) { pos_index = 5; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Interjection")) { pos_index = 6; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Particle")) { pos_index = 7; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Determiner")) { pos_index = 8; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Pronoun")) { pos_index = 9; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Participle")) { pos_index = 10; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Postposition")) { pos_index = 11; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Letter")) { pos_index = 12; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Predicative")) { pos_index = 13; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Prefix")) { pos_index = 14; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Numeral")) { pos_index = 15; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Article")) { pos_index = 16; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Contraction")) { pos_index = 17; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        /*else if (pos.includes("Noun")) pos_index = 18;
                        else if (pos.includes("Noun")) pos_index = 19; */
               /*     }

                    if (el.nodeName == "OL") {
                        let definition_array = new Array();

                        let el1 = el.firstElementChild;
                        while (el1 != null) {
                            let def = "";

                            el1.childNodes.forEach(node => {
                                if (node.nodeName == 'DL' || node.className == "nyms-toggle" || node.nodeName == 'UL' || node.className == "HQToggle" || node.nodeName == 'OL') { ; }
                                else if (node.className == "use-with-mention") {
                                    def += "[" + node.textContent + "]";
                                }
                                else {
                                    def += node.textContent;
                                }
                            });
                            def = def.trim();
                            if (def != "") definition_array.push(def);
                            el1 = el1.nextElementSibling;
                        }
                        if (this.dict_result_Wk[pos] == undefined) {
                            this.dict_result_Wk[pos] = definition_array;
                        }
                        else {
                            this.dict_result_Wk[pos + String(pos_counters[pos_index])] = definition_array;
                        }
                    }

                }
                else {
                    langFlag = false;
                }
                el = el.nextElementSibling;
            }
            console.log(pos_counters);
            this.unPackWikResult(this.dict_result_Wk);
        }
    }; */

    scrapeWiktionary = (response_text) => {
        this.dict_result_Wk = {};

        const parser = new DOMParser();
        const Wk_page = parser.parseFromString(response_text, "text/html");
        const wk_langName = this.lang_name.split(' ').join('_'); //multi-word language names in Wiktionary are joined by underscores for the purposes of element-id

        if (Wk_page.getElementById(wk_langName) == null) {
            this.noResultsFound("No " + this.lang_name + " definitions found");
            return;
        }
        else {
            let pos = "";
            let langFlag = true;
            let el = Wk_page.getElementById(wk_langName).parentNode.nextElementSibling;
            console.log(this.lang_name + " Dictionary Entries Found:");

            let pos_counters = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            let pos_index = 0;
            let headword_count = 0;

            let headwords_arr = new Array();
            let headword = "";
            let next_sibling = el.nextElementSibling;
            while(next_sibling != null) {
                if(next_sibling.nodeName == "P") {
                    const headword_elem = next_sibling.querySelector(".headword-line > .headword");
                    
                    if(headword_elem != null) {
                        headword = headword_elem.textContent;
                        headwords_arr.push(headword);
                        headword = "";
                    }
                    
                }
                if(next_sibling.className == "mw-heading mw-heading2") {
                    console.log("reached next language");
                    break;
                }
                next_sibling=next_sibling.nextElementSibling;
            }
            console.log(headwords_arr);

            while (el && langFlag) {

                if (el.className != "mw-heading mw-heading2") {
                    
                    if ((el.className == "mw-heading mw-heading4" || el.className == "mw-heading mw-heading3") && el.firstElementChild.tagName.startsWith("H")) {
                        
                        pos = el.firstElementChild.textContent; //can be h3 or h4
                        if (pos.includes("Noun")) { pos_index = 0; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Verb")) { pos_index = 1; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Adverb")) { pos_index = 2; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Adjective")) { pos_index = 3; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Conjunction")) { pos_index = 4; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Preposition")) { pos_index = 5; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Interjection")) { pos_index = 6; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Particle")) { pos_index = 7; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Determiner")) { pos_index = 8; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Pronoun")) { pos_index = 9; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Participle")) { pos_index = 10; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Postposition")) { pos_index = 11; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Letter")) { pos_index = 12; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Predicative")) { pos_index = 13; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Prefix")) { pos_index = 14; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Numeral")) { pos_index = 15; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Article")) { pos_index = 16; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        else if (pos.includes("Contraction")) { pos_index = 17; pos_counters[pos_index] = pos_counters[pos_index] + 1; }
                        /*else if (pos.includes("Noun")) pos_index = 18;
                        else if (pos.includes("Noun")) pos_index = 19; */
                    
                    }
                                        
                    if (el.nodeName == "OL") {
                        
                        let definition_array = new Array();

                        let el1 = el.firstElementChild;
                        definition_array.push(headwords_arr[headword_count]);
                        headword_count++
                        while (el1 != null) {
                            let def = "";

                            el1.childNodes.forEach(node => {
                                //this is bad because it is using a blacklist rather than a whitelist;
                                if (node.nodeName == 'DL' || node.className == "nyms-toggle" || node.nodeName == 'UL' || node.className == "HQToggle" || node.nodeName == 'OL' || node.nodeName == "STYLE") { ; }
                                else if (node.className == "use-with-mention") {
                                    def += "[" + node.textContent + "]";
                                }
                                else {
                                    def += node.textContent;
                                }
                            });
                            def = def.trim();
                            if (def != "") definition_array.push(def);
                            el1 = el1.nextElementSibling;
                        }
                        if (this.dict_result_Wk[pos] == undefined) {
                            this.dict_result_Wk[pos] = definition_array;
                        }
                        else {
                            this.dict_result_Wk[pos + String(pos_counters[pos_index])] = definition_array;
                        }
                    }

                }
                else {
                    langFlag = false;
                }
                el = el.nextElementSibling;
            }
            console.log(pos_counters);
            this.unPackWikResult(this.dict_result_Wk);
        }
    };

    unPackWikResult() {
        let dict_body = document.getElementById("dict_body");
        dict_body.innerHTML = "";
        dict_body.style.display = "flex";
        for(let pos in this.dict_result_Wk) {
            dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell dict_pos"><span class="wiki_headword">'+this.dict_result_Wk[pos][0]+'</span> <span class="wiki_pos">['+pos+']</span></div></div>'));
            
            /*this.dict_result_Wk[pos].forEach(def => {
                dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell Wk">'+def+'</div></div>'));
            });*/
            const wk_result_array = this.dict_result_Wk[pos];
            for(let i = 1; i < wk_result_array.length; i++) {
                dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell Wk">'+wk_result_array[i]+'</div></div>'));
            }
        }
    }

    dict_result_dictcc = Object.create(null);
    scrapeDictCC = (response_text) => {
        const dict_body = document.getElementById("dict_body");
        const extractText = (element) => {
            let txt = "";
            for(const child of element.childNodes) {
                if(child.nodeName == "DIV" && child.id.startsWith("elliwrap")) txt += child.textContent;
                else if(child.nodeName == "SPAN" && child.style.top == "-3px") txt += "<sup>" + child.textContent + "</sup>";  
                else if(child.textContent.trim() == "Unverified" && child.style.backgroundColor == "red") {
                    txt += "<span style=\"color:red;\"><i>unverified</i></span>";
                }
                else if(child.nodeName == "SUP") {
                    txt += "[<i>" + child.textContent + "</i>]"; //for the Dat. or Akk. superscripts indicating the case of 'sich' and such
                }
                else if(child.nodeName != "DFN" && child.nodeName != "DIV") txt += child.textContent;                
            }
            return txt.trim();
        }

        this.dict_result_dictcc = {};
        const parser = new DOMParser();
        const dictcc_pg = parser.parseFromString(response_text, 'text/html');

        const result_rows = dictcc_pg.getElementsByTagName("tr");
        let definition_count  = 0;
        let block_count = 0;
        this.dict_result_dictcc[block_count] = {};
        for(const result_row of result_rows) {
            if(result_row.id == '') {
                if(result_row.firstChild.className == "td6") {
                    block_count++;
                    this.dict_result_dictcc[block_count] = {};
                    definition_count = 0;
                    const block_header_text = result_row.firstChild.textContent;
                    this.dict_result_dictcc[block_count]["block_header"] = block_header_text;

                    dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell dict_pos">'+block_header_text+'</div></div>'));
                }    
                continue;
            }
            const lefthand_cell = result_row.getElementsByClassName('td7nl')[0];
            const righthand_cell = result_row.getElementsByClassName('td7nl')[1];
            const lefthand_text = extractText(lefthand_cell);
            const righthand_text = extractText(righthand_cell);
            this.dict_result_dictcc[block_count][definition_count] = [lefthand_text, righthand_text];
            
            dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell left">'+lefthand_text+'</div><div class="dict_cell right">'+righthand_text+'</div></div>'));

            definition_count++;
        }
        if(Object.keys(this.dict_result_dictcc).length == 1 && Object.keys(this.dict_result_dictcc[0]).length == 0) this.noResultsFound();
    };

    OE_results = [];
    MR_glossaryLookup = (query) => {
        const results = this.OE_glossary.filter(entry => entry[2].startsWith(this.wiktionariseOldEnglish(query).toLowerCase()));
        this.OE_results = results;
        const dict_body = document.getElementById("dict_body");
        if(results.length == 0) {
            this.noResultsFound("This term was not found in M&R's glossary");
            return;
        }

        results.forEach((result, i) => {
            if(result[0] == true) {
                dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell dict_pos">'+result[1] + ' <span class="MR_link">see</span> <span class="MR_clickable">'+ result[3]+'</span></div></div>'));
            }
            else {
                dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell dict_pos">'+result[1] +' <span class="MR_grammar">'+result[4]+'</span></div></div>'));
                dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell Wk">'+result[3]+'</div></div>'));
            }
        });

        document.querySelectorAll(".MR_clickable").forEach(clickable => {
            clickable.addEventListener('click', this.lookUpClick);
    });
    };


    dictOldEnglishInput = (event) => {

        let key_pressed = event.data;
        const textarea = event.target;
        const selection_start = textarea.selectionStart;
        const selection_end = textarea.selectionEnd;
    
        const digraph = (base_letter, replacement_upper, replacement_lower, input_element) => {
            event.preventDefault();
            const replacement = (base_letter == base_letter.toUpperCase()) ? replacement_upper : replacement_lower;
            input_element.value = input_element.value.slice(0, selection_start - 1) + replacement + textarea.value.slice(selection_end);
            textarea.selectionStart = selection_start; textarea.selectionEnd = selection_start;
        };
    
        if(key_pressed == ":") {
            let long_vowel = '';
            const last_letter = textarea.value.slice(selection_start - 1, selection_start);
            const upper_case = (last_letter == last_letter.toUpperCase());
            switch(last_letter.toLowerCase()) {
                case 'a':
                    long_vowel = 'ā';
                    break;
                case 'e':
                    long_vowel = 'ē';
                    break;
                case 'i':
                    long_vowel = 'ī';
                    break;
                case 'æ':
                    long_vowel = 'ǣ';
                    break;
                case 'u':
                    long_vowel = 'ū';
                    break;
                case 'o':
                    long_vowel = 'ō';
                    break;
                case 'y':
                    long_vowel = 'ȳ';
                    break;
                default:
                    ;		
            }
            if(long_vowel != '') {
                event.preventDefault();
                if(upper_case) long_vowel = long_vowel.toUpperCase();
                textarea.value = textarea.value.slice(0, selection_start - 1) + long_vowel + textarea.value.slice(selection_end);
                textarea.selectionStart = selection_start; textarea.selectionEnd = selection_start;
            }
        }
    
        else {
            const last_letter = textarea.value.slice(selection_start - 1, selection_start);
            if(key_pressed == 'e' && last_letter.toLowerCase() == 'a') {
                digraph(last_letter, 'Æ', 'æ', textarea);
            }
            else if(key_pressed == 'h' && last_letter.toLowerCase() == 't') {
                digraph(last_letter, 'Þ', 'þ', textarea);
            }
            else if(key_pressed == 'h' && last_letter.toLowerCase() == 'd') {
                digraph(last_letter, 'Ð', 'ð', textarea);
            }
            else if(key_pressed == 'j' && last_letter.toLowerCase() == 'c') {
                digraph(last_letter, 'Ċ', 'ċ', textarea);
            }
            else if(key_pressed == 'j' && last_letter.toLowerCase() == 'g') {
                digraph(last_letter, 'Ġ', 'ġ', textarea);
            }
        }
    };

    danskeOrdbogAudio = [];
    scrapeDanskeOrdbogen = (response_text) => {
        this.danskeOrdbogAudio = [];
        const dict_body = document.getElementById("dict_body");

        
        const parser = new DOMParser();
        const danskeOrdbog_pg = parser.parseFromString(response_text, 'text/html');

        const topLineHeader = danskeOrdbog_pg.querySelector(".artikel > .definitionBoxTop");
        if(topLineHeader == null) {
            this.noResultsFound();
            return;
        }

        let scraped_html = "";

        const extractToplineHeader = (topLineElement) => {
            
            topLineElement.childNodes.forEach(childNode => {
                if(childNode.className == "match") {
                    scraped_html += "<span class='ddo_topline_headword'>" + childNode.textContent + "</span> ";     
                }
                else if(childNode.className == "tekstmedium allow-glossing") {
                    scraped_html += "<span class='ddo_topline_grammar'>" + childNode.textContent + "</span>"; //the tooltips on the grammar-words are generated by javascript onmouseover so they aren't present in the base-html
                }
                else if(childNode.className == "") {
                    scraped_html += "<span class='ddo_topline_eller'>" + childNode.textContent + "</span>";
                }
            });
            scraped_html += "<br>";
        }

        const extractHeaderSections = (header_section) => {
            if(header_section == null) return;
            scraped_html += header_section.querySelector(".stempel").outerHTML + " ";

            const tekstmedium = header_section.querySelector(".tekstmedium.allow-glossing");
            tekstmedium.childNodes.forEach(childNode => {
                if(childNode.nodeType == 3) {
                    scraped_html += "<span class='ddo_header_details'>" + childNode.textContent + "</span>";
                }
                else if(childNode.className == "dividerDouble") {
                    scraped_html += "<span class='ddo_header_divider'> || </span>";
                }
                else if(childNode.className == "diskret") {
                    scraped_html += "<span class='ddo_header_grammar'>" + childNode.textContent + "</span>";
                }
                else if(childNode.className == "lydskrift") {
                    childNode.childNodes.forEach(lydskrift_node => {
                        if(lydskrift_node.nodeName == "AUDIO") {
                            this.danskeOrdbogAudio.push(new Audio(lydskrift_node.querySelector(".hiddenStructure > a").href));
                            scraped_html += "<img src='speaker.gif' class='ddo_speaker'>"
                        }
                        else {
                            scraped_html += "<span class='ddo_lydskrift'>" + lydskrift_node.textContent + "</span>";
                        }
                    });
                }
                else if(childNode.className == "ordform") {
                    scraped_html += "<span class='ordform'>" + childNode.textContent + "</span>";
                }
                else if(childNode.className == "inlineList") {
                    scraped_html += "<span class='ddo_link data-url='" + childNode.querySelector("a").href + "'>" + childNode.querySelector("a").firstChild.textContent + "</span>"; //.firstChild to ignore the possible superscript number
                }
                else if(childNode.nodeName == "A") {
                    scraped_html += "<span class='ordform'>" + childNode.textContent + "</span>";
                }
                else if(childNode.className == "dividerDot") {
                    scraped_html += "<span class='ddo_title_dot'> • </span>";
                }
            })

        }

        const bojning = danskeOrdbog_pg.getElementById("id-boj");
        const udtale = danskeOrdbog_pg.getElementById("id-udt");
        const oprindelse = danskeOrdbog_pg.getElementById("id-ety");
        const se_ogsaa = danskeOrdbog_pg.getElementById("id-bf");

        scraped_html += "<div class='dict_cell ddo_header'>";
        extractToplineHeader(topLineHeader);
        extractHeaderSections(bojning);
        scraped_html += "<br>";
        extractHeaderSections(udtale);
        scraped_html += "<br>";
        extractHeaderSections(oprindelse);
        scraped_html += "<br>";
        extractHeaderSections(se_ogsaa);
        

        scraped_html += "</div>";

        dict_body.innerHTML = "";
        dict_body.style.display = "flex";
        dict_body.appendChild(document.createRange().createContextualFragment(scraped_html));
        
        document.querySelectorAll(".ddo_speaker").forEach((speaker_icon, i) => {
            speaker_icon.addEventListener('click', () => {
                this.danskeOrdbogAudio[i].play();
            });
        });
    }

}
