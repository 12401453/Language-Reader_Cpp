scrapePONS(response_text) {
    this.dict_result_PONS = {
        beispielsaetze: {
        },
    };
    const parser = new DOMParser();
    const PONS_page = parser.parseFromString(response_text, "text/html");
    //this.pons_page = PONS_page;

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