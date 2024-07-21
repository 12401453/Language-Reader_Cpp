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
};

let lemmas_object = [];
let filtered_lemmas = [];
let lang_id = document.getElementById("langselect").value;
const dumpLemmas = () => {
  showLoadingButton();
  document.getElementById("lemma_searchbox").value = "";
  document.getElementById("meaning_searchbox").value = "";
  lang_id = document.getElementById("langselect").value;
  document.getElementById("lemma_searchbox").removeEventListener('beforeinput', oldEnglishInput);
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
        shuffleArray(lemmas_object[0]);
        shuffleArray(lemmas_object[1]);
        displayLemmas(filterLemmas(lemmas_object));
        if(lang_id == 10) document.getElementById("lemma_searchbox").addEventListener('beforeinput', oldEnglishInput);
        removeLoadingButton();
      }
    }; 
    xhttp.send(send_data);
  };
  httpRequest("POST", "dump_lemmas.php");
};

//this is just a test of using the fetch() API
const dumpLemmasFetch = () => {
  lang_id = document.getElementById("langselect").value;
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
    if(lang_id == 10) document.getElementById("lemma_searchbox").addEventListener('beforeinput', oldEnglishInput);
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
      if(lemma_count < 501) {
        buildRowHTML(x, html_str_arr);
      }
      lemma_count++;      
    }
  }
  const html_str = html_str_arr.join("");
  document.getElementById("words_results").innerHTML = html_str;
  document.getElementById("left_top_title").textContent = `Lemmas (${lemma_count})`;
};

const includesWordThatStartsWith = (haystack_string, needle_string) => {
  if(needle_string == "") return true;
  return haystack_string.split(" ").some(haystack_chunk => haystack_chunk.startsWith(needle_string));
};

const spaceBoundarySearch = (haystack_string, needle_string) => {  
  haystack_string = haystack_string.trim().replaceAll(/\s+/g, " ");
  if(haystack_string.startsWith(needle_string)) return true;
  let space_index = haystack_string.indexOf(" ");
  while(space_index != -1) {
    if(haystack_string.startsWith(needle_string, space_index + 1)) return true;
    space_index = haystack_string.indexOf(" ", space_index + 1); 
  }
  return false;
};

const normaliseOEChunk = (chunk) => {
  chunk = chunk.replaceAll('þ', 'ð');
  if(chunk.startsWith('ð')) chunk = 'þ'+ chunk.slice(1);
  return chunk;
};

const filterLemmas = (lemmas=lemmas_object) => {
  const meaning_searchbox_value = document.getElementById("meaning_searchbox").value.trim().replaceAll(/\s+/g, " ");
  let lemma_searchbox_value_initial = document.getElementById("lemma_searchbox").value.trim().replaceAll(/\s+/g, " ");
  if(lang_id == 10) {
      //const normalised_OE_chunks = lemma_searchbox_value_initial.split(" ").map(chunk => normaliseOEChunk(chunk));
      normalised_OE_string = "";
      lemma_searchbox_value_initial.split(" ").forEach(chunk => normalised_OE_string += normaliseOEChunk(chunk) + ' ');
      lemma_searchbox_value_initial = normalised_OE_string.trim();
  }
  const lemma_searchbox_value = lemma_searchbox_value_initial;

  const filterSingleLemmas = (lemma_obj_half) => {
    return lemma_obj_half.filter(lemma => pos_selector_states[lemma.pos - 1] == true).filter(lemma => lemma.lemma_form.startsWith(lemma_searchbox_value)).filter(lemma => Object.values(lemma.meanings).some(meaning => spaceBoundarySearch(meaning, meaning_searchbox_value)));
  }
  const filterMultiwordLemmas = (lemma_obj_half) => {
    return lemma_obj_half.filter(lemma => pos_selector_states[lemma.pos - 1] == true).filter(lemma => spaceBoundarySearch(lemma.lemma_form, lemma_searchbox_value)).filter(lemma => Object.values(lemma.meanings).some(meaning => spaceBoundarySearch(meaning, meaning_searchbox_value)));
  }

  switch(mw_selector_state) {
    case 0:
      return [[], []];
      break;
    case 1:
      return [filterSingleLemmas(lemmas[0]), []];
      break;
    case 2:
      return [[], filterMultiwordLemmas(lemmas[1])];
      break;
    case 3:
      return [filterSingleLemmas(lemmas[0]), filterMultiwordLemmas(lemmas[1])];
      break;
  }
};

const shuffleArray = (arr) => {
  const arr_length = arr.length;
  for (let i = 0; i < arr_length; i++) {
    const j = Math.floor(Math.random() * arr.length);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
};

document.getElementById("lemma_searchbox").addEventListener('input', () => displayLemmas(filterLemmas(lemmas_object)));
document.getElementById("meaning_searchbox").addEventListener('input', () => displayLemmas(filterLemmas(lemmas_object)));
//lemmas_object.filter(obj => obj.lemma_form.startsWith(event.target.value.trim()))

const oldEnglishInput = (event) => {

	const key_pressed = event.data;
	const textarea = event.target;
	const selection_start = textarea.selectionStart;
	const selection_end = textarea.selectionEnd;

	const digraph = (base_letter, replacement_upper, replacement_lower, input_element) => {
		event.preventDefault();
		const replacement = (base_letter == base_letter.toUpperCase()) ? replacement_upper : replacement_lower;
		input_element.value = input_element.value.slice(0, selection_start - 1) + replacement + textarea.value.slice(selection_end);
		textarea.selectionStart = selection_start; textarea.selectionEnd = selection_start;
	};

	if(key_pressed == 'w' || key_pressed == 'W' || key_pressed == 'g' || key_pressed == 'G') {
		event.preventDefault();
		let new_letter = '';

		switch(key_pressed) {
			case 'w':
				new_letter = 'ƿ';
				break;
			case 'W':
				new_letter = 'Ƿ';
				break;
			case 'g':
				new_letter = 'ᵹ';
				break;
			case 'G':
				new_letter = 'Ᵹ';
				break;
		}
		const insertPos = selection_start + 1;
		textarea.value = textarea.value.slice(0, selection_start) + new_letter + textarea.value.slice(selection_end);
		textarea.selectionStart = insertPos; textarea.selectionEnd = insertPos;
	}
  else if(key_pressed == ":") {
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
  textarea.dispatchEvent(new Event('input')); //needed to trigger the displayLemmas() function
};

dumpLemmas();