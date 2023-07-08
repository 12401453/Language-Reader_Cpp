let sozdik_result = Object.create(null);

const dictLookupSozdik = (word) => {
    let send_data = "url=https://sozdik.kz/translate/kk/ru/"+encodeURIComponent(word)+"/";
    const httpRequest = (method, url) => {
        const xhttp = new XMLHttpRequest();
        xhttp.open(method, url, true);
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhttp.responseType = 'text';
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState == 4) {
            sozdik_result = JSON.parse(xhttp.responseText);
            //scrapeSozdik(sozdik_result);
            console.log(sozdik_result);
            }
        };
        xhttp.send(send_data);
    };
    httpRequest("POST", "curl_lookup.php");
};
 
function details_extractor (details_elem) {
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
}

let sozdik_parsed_result = Object.create(null);
const scrapeSozdik = (sozdik_result) => {
    sozdik_parsed_result = Object.create(null);
    const parser = new DOMParser();
    let sozdikHTML = parser.parseFromString(sozdik_result.data.translation, 'text/html');

    sozdikHTML.body.querySelectorAll('body > details').forEach( (details_elem, i) => {

        let summary_text = details_extractor(details_elem);
        console.log(summary_text);
        sozdik_parsed_result[i] = {title: summary_text};

        details_elem.querySelectorAll('body > details > p').forEach( (p, x) => {
            sozdik_parsed_result[i][x] = p.innerHTML.replace("abbr data-title", "abbr title");
        });

        details_elem.querySelectorAll('details > details').forEach( (details_elem_2, j) => {
            let summary_2 = details_extractor(details_elem_2);
            sozdik_parsed_result[i][j] = {title: summary_2};

            details_elem_2.querySelectorAll('details > details > p').forEach( (p, y) => {
                sozdik_parsed_result[i][j][y] = p.innerHTML.replace("abbr data-title", "abbr title");
            });
            /* this third-level has only existed due to error on the website's part so far */
            details_elem_2.querySelectorAll('details > details').forEach( (details_elem_3, k) => {
                let summary_3 = details_extractor(details_elem_3);
                sozdik_parsed_result[i][j][k] = {title: summary_3};

                details_elem_3.querySelectorAll('details > details > p').forEach( (p, z) => {
                    sozdik_parsed_result[i][j][k][z] = p.innerHTML.replace("abbr data-title", "abbr title");
                });
            }); /* ^^^^^^^^possible bullshit^^^^^^*/
        });
        
    });

    //the only thing the above doesn't get are phrases which have no <details> tags because they are just <p> elements from the main article of an actual lemma; sozdik.kz allows these to be searched and retrieved stand-alone, so I could either deal with them in this main sozdik_scraper code, or somehow check whether we have a purely <p> result and write a different scraper for those cases
};

    /*let p_elements = sozdikHTML.getElementsByTagName("p");
    let p_length = p_elements.length;
    let prev_parent = 0;
    let first_tier = 0;
    sozdik_parsed_result[first_tier] = {};
    for(let i = 0; i < p_length; i++) {
        current_parent = p_elements[i].parentElement;
        if(prev_parent != p_elements[i].parentElement) {
            first_tier++;
            sozdik_parsed_result[first_tier] = {};
        }
        sozdik_parsed_result[f]
        prev_parent = 
    } */
