let pos_selector_states = [true, true, true, true, true, true, true, true];

document.getElementById("pos_selectors").addEventListener('click', (event) => { 
  if(event.target.classList.contains("pos_sel")) {
    event.target.classList.toggle("pos_selected");
    const index = event.target.dataset.pos_code - 1;
    if(pos_selector_states[index] == false) {
      pos_selector_states[index] = true;
      event.target.classList.remove("just_turned_off");
    }
    else {
      pos_selector_states[index] = false;
      event.target.classList.add("just_turned_off");
    }

    displayLemmas();
  }
});

document.querySelectorAll(".pos_sel").forEach(pos_sel => pos_sel.addEventListener('mouseout', (event) => {event.target.classList.remove("just_turned_off")}));

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

  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("\'", "&#039;");
  //.replaceAll("\x5c", "\x5c\x5c").replaceAll("\n", "\x5c\x6e").replaceAll("\t", "\x5c\x74").replaceAll("\r", "\x5c\x72").replaceAll("\f", "\x5c\x66")
};

const showLoadingButton = () => {
  let loadingbutton = document.createElement('div');
  loadingbutton.innerHTML = "Loading...";
  loadingbutton.id = 'loadingbutton';
  document.getElementById('spoofspan').after(loadingbutton);
};
const removeLoadingButton = () => {
  document.getElementById("loadingbutton").remove();
};

const pos_names = {1:"noun", 2:"verb", 3:"adj", 4:"adverb", 5:"prep", 6:"conj", 7:"part", 8:"ques"};

const buildRowHTML = (x, html_str_arr) => {
  html_str_arr.push(`<div class="words_row"><div class="word_cell_left"><div class="pos_colour left ${pos_names[x.pos]}"></div><div class="word_cell_lemma">${htmlspecialchars(x.lemma_form)}</div><div class="pos_colour right adj"></div></div><div class="word_cell_right">`);
  
  for(let y in x.meanings) {
    let meaning_no = Object.keys(x.meanings).length > 1 ? y+".)" : "";
    html_str_arr.push(`<div class="word_cell_meaning_strip"><div class="meaning_no_box"><div class="meaning_no" title="Meaning number">${meaning_no}</div></div><div class="meaning_text">${htmlspecialchars(x.meanings[y])}</div></div>`);
  }
  
  html_str_arr.push(`</div></div>`);

  //document.getElementById("words_body").appendChild(document.createRange().createContextualFragment(html_text)); 
};

const addSubRow = (meaning_no, meaning_text) => {
  let words_rows = document.getElementById("words_body").getElementsByClassName("words_row");
  words_rows[main_row_no - 1].querySelector(".word_cell_right").appendChild(document.createRange().createContextualFragment(`<div class="word_cell_meaning_strip"><div class="meaning_no_box"><div class="meaning_no" title="Meaning number">${main_row_no}</div></div><div class="meaning_text">right side dummy meaning hahahaha you gormless wazzok</div></div>`));
};

let lemmas_object = [];
const dumpLemmas = () => {
  showLoadingButton();
  let lang_id = document.getElementById("langselect").value;

  const httpRequest = (method, url) => {
    let send_data = "lang_id="+lang_id;

    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, true);
    xhttp.responseType = 'json';
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.onload = () => {
      if(xhttp.readyState == 4) {
        lemmas_object = xhttp.response;
        displayLemmas();
        removeLoadingButton();
      }
    };
    xhttp.send(send_data);
  };
  httpRequest("POST", "dump_lemmas.php");
};
document.getElementById("langselect").addEventListener('change', dumpLemmas);

const displayLemmas = (lemmas=lemmas_object) => {
  let html_str_arr = [];
  let lemma_count = 0;
  for(let x of lemmas) {
    
    if(pos_selector_states[x.pos - 1] == true) {
      buildRowHTML(x, html_str_arr);
      lemma_count++;
    }
    
  }
  const html_str = html_str_arr.join("");
  document.getElementById("words_results").innerHTML = html_str;
  document.getElementById("left_top_title").textContent = `Lemmas (${lemma_count})`;
};

document.querySelectorAll(".pos_sel").forEach(pos_sel => pos_sel.addEventListener('click', displayLemmas));

document.getElementById("lemma_searchbox").addEventListener('input', (event) => displayLemmas(lemmas_object.filter(obj => obj.lemma_form.startsWith(event.target.value.trim()))));

dumpLemmas();