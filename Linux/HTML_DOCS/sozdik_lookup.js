let sozdik_result = Object.create(null);

const dictLookupSozdik = (word) => {
    document.getElementById("dict_body").innerHTML = "";
    document.getElementById("dict_body").style.display = "flex";

    let send_data = "url=https://sozdik.kz/translate/kk/ru/"+encodeURIComponent(word)+"/";
    const httpRequest = (method, url) => {
        const xhttp = new XMLHttpRequest();
        xhttp.open(method, url, true);
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhttp.responseType = 'text';
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState == 4) {
            sozdik_result = JSON.parse(xhttp.responseText);
            scrapeSozdik(sozdik_result);
            console.log(sozdik_result);
            }
        };
        xhttp.send(send_data);
    };
    httpRequest("POST", "curl_lookup.php");
};
 
//let sozdik_parsed_result = Object.create(null);
let html_str = "";
const scrapeSozdik = (sozdik_result) => {
    //sozdik_parsed_result = Object.create(null);
    const parser = new DOMParser();
    let sozdikHTML = parser.parseFromString(sozdik_result.data.translation, 'text/html');

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

    html_str = "";

    sozdikHTML.body.querySelectorAll('body > details').forEach( (details_elem, i) => {

        let summary_text = details_extractor(details_elem);
        console.log(summary_text);
        //sozdik_parsed_result[i] = {title: summary_text};

        html_str += '<div class="dict_row"><div class="dict_cell sozdik_title">'+summary_text+'</div></div>';

        details_elem.querySelectorAll('body > details > p').forEach( (p, x) => {
            //sozdik_parsed_result[i][x] 
            let bilingual_phrase = p.innerHTML.replace("abbr data-title", "abbr title").split("→").map(x => x.trim());
            console.log(bilingual_phrase);
            html_str += '<div class="dict_row"><div class="dict_cell left">'+bilingual_phrase[0]+'</div><div class="dict_cell right">'+bilingual_phrase[1]+'</div></div>';
        });

        details_elem.querySelectorAll('details > details').forEach( (details_elem_2, j) => {
            let summary_2 = details_extractor(details_elem_2);
            //sozdik_parsed_result[i][j] = {title: summary_2};
            console.log(summary_2);

            html_str += '<div class="dict_row"><div class="dict_cell sozdik_title">'+summary_2+'</div></div>';

            details_elem_2.querySelectorAll('details > details > p').forEach( (p, y) => {
                //sozdik_parsed_result[i][j][y] = 
                let bilingual_phrase = p.innerHTML.replace("abbr data-title", "abbr title").split("→").map(x => x.trim());
                console.log(bilingual_phrase);
                html_str += '<div class="dict_row"><div class="dict_cell left">'+bilingual_phrase[0]+'</div><div class="dict_cell right">'+bilingual_phrase[1]+'</div></div>';
            });
            /* this third-level has only existed due to error on the website's part so far */
            details_elem_2.querySelectorAll('details > details').forEach( (details_elem_3, k) => {
                let summary_3 = details_extractor(details_elem_3);
                //sozdik_parsed_result[i][j][k] = {title: summary_3};
                console.log(summary_3);

                html_str += '<div class="dict_row"><div class="dict_cell sozdik_title">'+summary_3+'</div></div>';

                details_elem_3.querySelectorAll('details > details > p').forEach( (p, z) => {
                    //sozdik_parsed_result[i][j][k][z] 
                    let bilingual_phrase = p.innerHTML.replace("abbr data-title", "abbr title").split("→").map(x => x.trim());
                    console.log(bilingual_phrase);
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

    let dict_body = document.getElementById("dict_body");
    dict_body.appendChild(document.createRange().createContextualFragment(html_str));
};
