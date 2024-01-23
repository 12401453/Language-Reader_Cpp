let pos_selector_states = [true, true, true, true, true, true, true, true];
let mw_selector_state = 3;

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

    displayLemmas(filterLemmas(lemmas_object));
  }
});

document.querySelectorAll(".mw_sel").forEach(mw_sel => {
  mw_sel.addEventListener('click', (event) => {
    const button = event.target;
    const mw_code = Number(button.dataset.mw_code)

    if(button.classList.contains("mw_selected")) {
      button.classList.add("just_turned_off");
      mw_selector_state -= mw_code;
    }
    else {
      button.classList.remove("just_turned_off");
      mw_selector_state += mw_code;
    }
    button.classList.toggle("mw_selected");

    displayLemmas(filterLemmas(lemmas_object));
  })
});

document.querySelectorAll(".pos_sel").forEach(pos_sel => pos_sel.addEventListener('mouseout', (event) => {event.target.classList.remove("just_turned_off")}));
document.querySelectorAll(".mw_sel").forEach(mw_sel => mw_sel.addEventListener('mouseout', (event) => {event.target.classList.remove("just_turned_off")}));

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

let lemmas_object = [];
let filtered_lemmas = [];
const dumpLemmas = () => {
  showLoadingButton();
  document.getElementById("lemma_searchbox").value = "";
  document.getElementById("meaning_searchbox").value = "";
  let lang_id = document.getElementById("langselect").value;

  const httpRequest = (method, url) => {
    let send_data = "lang_id="+lang_id;

    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, true);
    xhttp.responseType = 'json';
    xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.setRequestHeader('Cache-Control', 'no-cache');
    xhttp.onload = () => {
      if(xhttp.readyState == 4) {
        
        lemmas_object = xhttp.response;
        displayLemmas(filterLemmas(lemmas_object));
        removeLoadingButton();
      }
    }; 
    xhttp.send(send_data);
  };
  httpRequest("POST", "dump_lemmas.php");
};

//this is just a test of using the fetch() API
const dumpLemmasFetch = () => {
  let lang_id = document.getElementById("langselect").value;
   // alert(lang_id);
  let send_data = "lang_id="+lang_id;
  const myheaders = new Headers();
  myheaders.append('Content-Type', 'application/x-www-form-urlencoded');
  myheaders.append('Cache-Control', 'no-cache');
  const options = {method: "POST", headers: myheaders, cache: "no-store", body: send_data};
  showLoadingButton();
  document.getElementById("lemma_searchbox").value = "";
  document.getElementById("meaning_searchbox").value = "";
  fetch("dump_lemmas.php", options)
  .then((response) => {
    //alert("first response");
    return response.json();
  })
  .then(response => {
    lemmas_object = response
    displayLemmas(filterLemmas(lemmas_object));
    removeLoadingButton();
  })
  .finally(() => {removeLoadingButton()});
};

document.getElementById("langselect").addEventListener('input', dumpLemmas);

const displayLemmas = (lemmas=lemmas_object) => {
  let html_str_arr = [];
  let lemma_count = 0;

  for(let i = 0; i < 2; i++) {
    for(let x of lemmas[i]) {
      
      if(pos_selector_states[x.pos - 1] == true) {
        buildRowHTML(x, html_str_arr);
        lemma_count++;
      }   
    }
  }
  const html_str = html_str_arr.join("");
  document.getElementById("words_results").innerHTML = html_str;
  document.getElementById("left_top_title").textContent = `Lemmas (${lemma_count})`;
};

const filterLemmas = (lemmas=lemmas_object) => {
  const meaning_searchbox_value = document.getElementById("meaning_searchbox").value.trim();
  //return lemmas.filter(obj => obj.lemma_form.startsWith(document.getElementById("lemma_searchbox").value.trim())).filter(obj => Object.values(obj.meanings).some(meaning => meaning.includes(meaning_searchbox_value)));

  switch(mw_selector_state) {
    case 0:
      return [[], []];
      break;
    case 1:
      return [lemmas[0].filter(obj => obj.lemma_form.startsWith(document.getElementById("lemma_searchbox").value.trim())).filter(obj => Object.values(obj.meanings).some(meaning => meaning.includes(meaning_searchbox_value))), []];
      break;
    case 2:
      return [[], lemmas[1].filter(obj => obj.lemma_form.includes(document.getElementById("lemma_searchbox").value.trim())).filter(obj => Object.values(obj.meanings).some(meaning => meaning.includes(meaning_searchbox_value)))];
      break;
    case 3:
      return [lemmas[0].filter(obj => obj.lemma_form.startsWith(document.getElementById("lemma_searchbox").value.trim())).filter(obj => Object.values(obj.meanings).some(meaning => meaning.includes(meaning_searchbox_value))), lemmas[1].filter(obj => obj.lemma_form.includes(document.getElementById("lemma_searchbox").value.trim())).filter(obj => Object.values(obj.meanings).some(meaning => meaning.includes(meaning_searchbox_value)))];
      break;
  }
}

document.getElementById("lemma_searchbox").addEventListener('input', (event) => displayLemmas(filterLemmas(lemmas_object)));
document.getElementById("meaning_searchbox").addEventListener('input', (event) => displayLemmas(filterLemmas(lemmas_object)));
//lemmas_object.filter(obj => obj.lemma_form.startsWith(event.target.value.trim()))

dumpLemmas();