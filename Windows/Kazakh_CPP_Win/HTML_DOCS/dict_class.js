class Dictionary {

    constructor(m_lang_id=lang_id) {
        this.m_lang_id = m_lang_id;
    }

    url = "";
    dict_name = "";
    language_name = "";

    dict_body = document.getElementById("dict_body");
    dictHTML_str = "";

    noResultsFound() {
        this.dict_body.innerHTML = "";
        this.dict_body.style.display = "flex";
        this.dict_body.appendChild(document.createRange().createContextualFragment('<div class="dict_row"><div class="dict_cell Wk">No results found</div></div>'));
    }



}