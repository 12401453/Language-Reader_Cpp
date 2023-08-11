class Dictionary {

    constructor(m_lang_id=lang_id) {
        this.m_lang_id = m_lang_id;
    }

    url = "";
    dict_name = "";
    language_name = "";

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



}