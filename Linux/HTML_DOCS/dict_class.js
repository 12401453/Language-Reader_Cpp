class Dictionary {

    constructor(m_lang_id=lang_id) {
        this.m_lang_id = m_lang_id;
        //default dicts
        switch(lang_id) {
            case 1:
                this.dict_type = 2;
            case 2:
                this.dict_type = 3;
            case 3:
                this.dict_type = 1;
            case 4:
                this.dict_type = 2;
            case 6:
                this.dict_type = 1;
            case 7:
                this.dict_type = 1;
            case 8:
                this.dict_type = 1;
        }
    }

    urlMaker(word, dict_type=this.dict_type, PONS_german=this.PONS_german) {
        if(dict_type == 1) {
            let PONS_lang_dir = ""
            const PONS_target = PONS_german ? "deutsch/" : "englisch/";
            
            switch(this.m_lang_id) {
                case 1:
                    PONS_lang_dir = "russisch-";
                case 3:
                    PONS_lang_dir = "polnisch-";
                case 6:
                    PONS_lang_dir = "schwedisch-";
                case 7:
                    PONS_lang_dir = "t%C3%BCrkisch-";
                case 8:
                    PONS_lang_dir = "d%C3%A4nisch-";
            }
            PONS_lang_dir += PONS_target;

            return "https://de.pons.com/%C3%BCbersetzung/" + PONS_lang_dir + encodeURIComponent(word);
        }
        else if(dict_type == 2) {
            return "https://en.wiktionary.org/wiki/" + encodeURIComponent(word);
        }
        else if(dict_type == 3) {
            return "https://sozdik.kz/translate/kk/ru/"+ encodeURIComponent(word)+ "/";
        }
        else if(dict_type == 4) {
            return "https://sozdik.kz/translate/ru/kk/"+ encodeURIComponent(word)+ "/";
        }
    }
    dict_name = "";
    language_name = "";
    dict_type = 1;
    PONS_german = true;

    dict_body = document.getElementById("dict_body");
    dictHTML_str = "";

    display() {
        let dict_html = document.createRange().createContextualFragment('<div id="dict_outline"><div id="dict_topbar"><div id="dict_close"><div id="minimise"></div></div></div><div id="dict_body" style="display: flex;"></div><div id="dict_bottombar"><textarea id="dict_searchbox"></textarea><img id="dict_logo" src="PONS.png" title="PONS.com"></img></div></div>');
        document.getElementById("spoofspan2").after(dict_html);
    }
    remove() {
        document.getElementById("dict_outline").remove();
    }

    noResultsFound() {
        this.dict_body.innerHTML = "";
        this.dict_body.style.display = "flex";
        this.dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell Wk">No results found</div></div>'));
    }




    dictLookupSozdik = (word) => {
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

    /* Dict-type codes:
        PONS: 1
        Wiktionary : 2
        sozdikQaz: 3
        sozdikRus: 4 
    */



}