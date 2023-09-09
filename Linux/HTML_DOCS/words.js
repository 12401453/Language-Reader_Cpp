document.getElementById("pos_selectors").addEventListener('click', (event) => { 
  if(event.target.classList.contains("pos_sel")) {
    event.target.classList.toggle("pos_selected");
  }
}
);

const setSearchboxSize = function (event) {
  let searchbox = event.target;
  let hidden_searchbox = document.getElementById('hidden_searchbox');

  hidden_searchbox.textContent = searchbox.value;

  let new_width = hidden_searchbox.offsetWidth+"px";
  let new_height = hidden_searchbox.offsetHeight+"px";
  searchbox.style.width = new_width;
  //searchbox.style.height = new_height;
};
document.getElementById("lemma_searchbox").addEventListener('input', setSearchboxSize);
document.getElementById("meaning_searchbox").addEventListener('input', setSearchboxSize);


const htmlspecialchars = (text) => {

  return text.replaceAll("<", "&lt;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("\'", "&#039;").replaceAll("\x5c", "\x5c\x5c").replaceAll("\n", "\x5c\x6e").replaceAll("\t", "\x5c\x74").replaceAll("\r", "\x5c\x72").replaceAll("\f", "\x5c\x66").replaceAll("&", "&amp;");
};


const pos_names = {1:"noun", 2:"verb", 3:"adj", 4:"adverb", 5:"prep", 6:"conj", 7:"part", 8:"ques"};
const addRow = (x) => {
  let html_text = `<div class="words_row"><div class="word_cell_left"><div class="pos_colour left ${pos_names[x.pos]}"></div><div class="word_cell_lemma">${x.lemma_form}</div><div class="pos_colour right adj"></div></div><div class="word_cell_right">`;
  
  for(let y in x.meanings) {
    html_text += `<div class="word_cell_meaning_strip"><div class="meaning_no_box"><div class="meaning_no" title="Meaning number">${y}</div></div><div class="meaning_text">${x.meanings[y]}</div></div>`;
  }
  
  html_text += `</div></div>`;

  document.getElementById("words_body").appendChild(document.createRange().createContextualFragment(html_text)); 
};

const addSubRow = (meaning_no, meaning_text) => {
  let words_rows = document.getElementById("words_body").getElementsByClassName("words_row");
  words_rows[main_row_no - 1].querySelector(".word_cell_right").appendChild(document.createRange().createContextualFragment(`<div class="word_cell_meaning_strip"><div class="meaning_no_box"><div class="meaning_no" title="Meaning number">${main_row_no}</div></div><div class="meaning_text">right side dummy meaning hahahaha you gormless wazzok</div></div>`));
};

let lemmas_object = Object.create(null);
const dumpLemmaTest = (lang_id) => {
  document.querySelectorAll(".words_row").forEach (row => row.remove());

  const httpRequest = (method, url) => {
    let send_data = "lang_id="+lang_id;

    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, true);
    xhttp.responseType = 'json';
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.onload = () => {
      if(xhttp.readyState == 4) {
        let json_response = xhttp.response;
        console.log(json_response);
        for(let i = 0; i < json_response.length; i++) {
          addRow(json_response[i]);
        }
        lemmas_object = json_response;

        


      }
    };
    xhttp.send(send_data);
  };
  httpRequest("POST", "dump_lemmas.php");
};