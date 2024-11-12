
function tt_type() {
  if(tooltips_shown) {
    let lemma_tooltips = document.querySelectorAll('.lemma_tt, .mw_tt');
    lemma_tooltips.forEach(lemma_tooltip => {
      lemma_tooltip.remove();
    });
    tooltips_shown = false;
  }
  else {
    document.getElementById("tt_toggle").disabled = true;
    lemmaTooltipMW();
    tooltips_shown = true; //redundant but done incase the AJAX request in lemmaTooltips() fails
  }
}

let lang_id = 0;
let dict = Object.create(null);
function setLangId() {
  let textselect_value = document.getElementById('textselect').value;
  let post_data = "textselect=" + textselect_value;
  const httpRequest = (method, url) => {

    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, true);
    xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.setRequestHeader('Cache-Control', 'no-cache');

    xhttp.onreadystatechange = () => {

      if (xhttp.readyState == 4) {
        lang_id = Number(xhttp.responseText);
        //setWkLangName();
        console.log(lang_id);
        if(dict.bool_displayed == true) dict.remove();
        dict = new Dictionary();
        dict.display();
      }

    }

    xhttp.send(post_data);

  }

  httpRequest("POST", "get_lang_id.php");

}

function selectText() {
  if(displayWordEditor.edit_mode) {
    displayWordEditor.stopEditing();
  }
  if(display_word != null) delAnnotate();
  setLangId();  //not async safe, needs to change

  let loadingbutton = document.createElement('div');
  loadingbutton.innerHTML = "Loading...";
  loadingbutton.id = 'loadingbutton';
  document.getElementById('spoofspan').after(loadingbutton);

  let textselect_value = document.getElementById('textselect').value;
  let post_data = "textselect="+textselect_value;
  console.log(post_data);
  const httpRequest = (method, url) => {

     
      let para1 = document.getElementById('p1');

      const xhttp = new XMLHttpRequest();
      xhttp.open(method, url, true);
      xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

      xhttp.onreadystatechange = () => {
      
         
    
        if(xhttp.readyState == 4) {
          para1.innerHTML = xhttp.responseText;
         
          /*
          let tt_btns = document.querySelectorAll('.tooltip');
          tt_btns.forEach(tt_btn => {
            tt_btn.onclick = showAnnotate;
          }); */
          document.getElementById("textbody").addEventListener('click', showAnnotate);

          document.querySelectorAll('.multiword').forEach(mw => {
            mw.addEventListener('click', showMultiwordAnnotate);
            mw.addEventListener('mouseover', underlineMultiwords);
            mw.addEventListener('mouseout', removeUnderlineMultiwords);
          });
          
          if(tooltips_shown) {
            lemmaTooltipMW();
          }
          document.getElementById("textselect").blur();
          loadingbutton.remove();
          

        }
     
      }

      xhttp.send(post_data);

}

  httpRequest("POST", "retrieve_text.php");

}

const showLoadingButton = () => {
  let loadingbutton = document.createElement('div');
  loadingbutton.innerHTML = "Loading...";
  loadingbutton.id = 'loadingbutton';
  document.getElementById('spoofspan').after(loadingbutton);
};
const removeLoadingButton = () => {
  document.getElementById("loadingbutton").remove();
};

function selectText_splitup(dt_start, dt_end, page_cur) {
  if(displayWordEditor.edit_mode) {
    displayWordEditor.stopEditing();
  }
  if(display_word != null) delAnnotate();

  let highlight_pagenos = document.querySelectorAll('.current_pageno');
  highlight_pagenos.forEach(highlighted_pageno => {
    highlighted_pageno.classList.remove("current_pageno");
  });

  let loadingbutton = document.createElement('div');
  loadingbutton.innerHTML = "Loading...";
  loadingbutton.id = 'loadingbutton';
  document.getElementById('spoofspan').after(loadingbutton);

  let textselect_value = document.getElementById('textselect').value;
  let post_data = "dt_start="+dt_start+"&dt_end="+dt_end+"&page_cur="+page_cur;
  console.log(post_data);
  const httpRequest = (method, url) => {

     
      let textbody = document.getElementById('textbody');

      const xhttp = new XMLHttpRequest();
      xhttp.open(method, url, true);
      xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

      xhttp.onreadystatechange = () => {
      
         
    
        if(xhttp.readyState == 4) {
          textbody.innerHTML = xhttp.responseText;
      
          /*let tt_btns = document.querySelectorAll('.tooltip');

          tt_btns.forEach(tt_btn => {
            tt_btn.onclick = showAnnotate;
          }); */
          document.getElementById("textbody").addEventListener('click', showAnnotate);

          document.querySelectorAll('.multiword').forEach(mw => {
            //mw.onclick = showMultiwordAnnotate;
            mw.addEventListener('click', showMultiwordAnnotate);
            mw.addEventListener('mouseover', underlineMultiwords);
            mw.addEventListener('mouseout', removeUnderlineMultiwords);
          });
   
          if(tooltips_shown) {
            lemmaTooltipMW();
          }
          loadingbutton.remove();
          if(page_cur > 1) {
            let title = document.getElementById("title");
            title.scrollIntoView();
          }
          let pagenos = document.querySelectorAll('.pageno');
          pagenos.forEach(pageno => {
            if(Number(pageno.innerHTML) == page_cur) {
              pageno.classList.add("current_pageno");
            }
          });
        }
     
      }

      xhttp.send(post_data);

}

  httpRequest("POST", "retrieve_text_splitup.php");
  
 
}

/*
const highlightPageno = function (event) {
  event.target.classList.add("current_pageno");
}; */


function progressBar(word_count) {

  let loading_bar_percentage = document.getElementById("percent");

  const httpRequest = (method, url) => {

    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, true);
    xhttp.responseType = 'text';
    //xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhttp.onload = () => {

      if(xhttp.readyState == 4) {

        let words_progress = Number(xhttp.responseText);
        let percent = ((words_progress*100)/word_count).toFixed(2);
        loading_bar_percentage.innerHTML = `${percent}%`;
        //console.log("progress_bar.php triggered");
      }

    }
    xhttp.send();
  }
  httpRequest("GET", "progress_bar.php");

  setTimeout(`progressBar(${word_count})`, 100); //setTimeout() executes the function in its first argument after the number of milliseconds in its second argument, so this progressBar function gets called every 0.1 seconds forever until the page reloads when the text is fully loaded
 
} 



function loadText() {

  let newtext_raw = document.getElementById('newtext').value.replaceAll('\u00AD', '').replaceAll("’", "\'").trim();
  let text_title_raw = document.getElementById('text_title').value.replaceAll('\u00AD', '').replaceAll("’", "\'").trim(); //U+00AD is a soft-hyphen, invisible little bastard
  
  let langselect = document.getElementById('langselect').value;
  
  if(langselect == '2') {
    newtext_raw = newtext_raw.replaceAll('\u0259', '\u04D9').replaceAll('\u018F', '\u04D8'); //replace Latin schwa-letter with Cyrillic ә (they look identical)
    text_title_raw = text_title_raw.replaceAll('\u0259', '\u04D9').replaceAll('\u018F', '\u04D8');
  }

  if(text_title_raw == '' && newtext_raw == '') { return; }
  if(text_title_raw == '') { alert("Do not leave Text Title blank"); return; }
  if(newtext_raw == '') {alert("You cannot submit a blank text"); return; }

  let newtext = encodeURIComponent(newtext_raw);
 
  
  let text_title = encodeURIComponent(text_title_raw);
  

  
/*
  let loadingbutton = document.createElement('div');
  loadingbutton.innerHTML = 'Processing text: <span id="percent">0.00%</span>';
  loadingbutton.id = 'loadingbutton';
  let loading_bar_percentage = document.getElementById("percent");
  document.getElementById('spoofspan').after(loadingbutton); */

  let loadingbutton = document.createElement('div');
  loadingbutton.innerHTML = "Loading...";
  loadingbutton.id = 'loadingbutton';
  document.getElementById('spoofspan').after(loadingbutton);

    
  const httpRequest = (method, url) => {

   let send_data = "new_text="+newtext+"&text_title="+text_title+"&langselect="+langselect;

   const xhttp = new XMLHttpRequest();
   xhttp.open(method, url, true);
  // xhttp.responseType = 'json';
  xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

  xhttp.onload = () => {
    console.log("sent");
  // console.log(xhttp.responseText);
  
    if(xhttp.readyState == 4)  {
      loadingbutton.innerHTML = "&nbsp;&nbsp;Done&nbsp;&nbsp;"; //not really needed
      //location.reload(); /* window.open("update_db.php"); */
      window.location = "/text_viewer";
    }
  }
   xhttp.send(send_data);
 }

 if(Number(langselect) == 10) httpRequest("POST", "add_text_OE.php")
 else httpRequest("POST", "update_db.php");
 
}



function clearTable() {

  if(!confirm("Are you absolutely sure you want to clear the entire database and delete all your texts and saved words?")) {
    return;
  }
  
  let loadingbutton = document.createElement('div');
  loadingbutton.innerHTML = "Loading...";
  loadingbutton.id = 'loadingbutton';
  document.getElementById('spoofspan').after(loadingbutton);

  const httpRequest = (method, url) => {
 
    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, true);
   // xhttp.responseType = 'json';
   // xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    
    xhttp.onload = () => {
      console.log("sent");
     // console.log(xhttp.responseText);
     if(xhttp.readyState == 4) {
      loadingbutton.remove(); 
      location.reload();
    }
  }
    xhttp.send();
  }
 
  httpRequest("POST", "clear_table.php");
}

function deleteText() {
  
  let title_select = document.getElementById('textselect');
  let textselect_value = title_select.value;
  if(textselect_value == 0) { return;}
  let text_title = title_select.options[title_select.selectedIndex].textContent;

  if(!confirm(`Are you sure you want to delete "${text_title}"?`)) {
    title_select.selectedIndex = 0;
    title_select.dispatchEvent(new Event('input'));
    return;
  }
  
  let loadingbutton = document.createElement('div');
  loadingbutton.innerHTML = "Loading...";
  loadingbutton.id = 'loadingbutton';
  document.getElementById('spoofspan').after(loadingbutton);

  
  let post_data = "textselect="+textselect_value;

  const httpRequest = (method, url) => {
 
    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, true);
   // xhttp.responseType = 'json';
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    
    xhttp.onload = () => {
      console.log(post_data);
     // console.log(xhttp.responseText);
     if(xhttp.readyState == 4) {
      loadingbutton.remove(); 
      location.reload();
    }
  }
    xhttp.send(post_data);
  }
 
  httpRequest("POST", "delete_text.php");

}

function showDeletion() {
  let spoofspan_display = document.getElementById("spoofspan").style.display;
  if(spoofspan_display == "inline") {
    document.getElementById("spoofspan").style.display = "none";
    document.getElementById("deletion").style.visibility = "visible";
  }
  else if(spoofspan_display == "none"){
    document.getElementById("spoofspan").style.display = "inline";
    document.getElementById("deletion").style.visibility = "hidden";
  }

}

const noun_pos = '<span id="pos_tag_noun" class="pos_tag" onclick="selectPoS()">noun</span>';
const verb_pos = '<span id="pos_tag_verb" class="pos_tag" onclick="selectPoS()">verb</span>';
const adj_pos = '<span id="pos_tag_adj" class="pos_tag" onclick="selectPoS()" title="adjective">adject.</span>';
const adverb_pos = '<span id="pos_tag_adverb" class="pos_tag" onclick="selectPoS()">adverb</span>';
const prep_pos = '<span id="pos_tag_prep" class="pos_tag" title="preposition" onclick="selectPoS()">prep.</span>';
const conj_pos = '<span id="pos_tag_conj" class="pos_tag" title="conjunction" onclick="selectPoS()">conj.</span>';
const part_pos = '<span id="pos_tag_part" class="pos_tag" title="particle/interjection" onclick="selectPoS()">part.</span>';
const ques_pos = '<span id="pos_tag_ques" class="pos_tag" title="interrogative" onclick="selectPoS()">ques.</span>';

const noun_pos_tt = '<span id="pos_tag_noun_tt" class="pos_tag_tt" title="noun"></span>';
const verb_pos_tt = '<span id="pos_tag_verb_tt" class="pos_tag_tt" title="verb"></span>';
const adj_pos_tt = '<span id="pos_tag_adj_tt" class="pos_tag_tt" title="adjective"></span>';
const adverb_pos_tt = '<span id="pos_tag_adverb_tt" class="pos_tag_tt" title="adverb"></span>';
const prep_pos_tt = '<span id="pos_tag_prep_tt" class="pos_tag_tt" title="preposition"></span>';
const conj_pos_tt = '<span id="pos_tag_conj_tt" class="pos_tag_tt" title="conjunction"></span>';
const part_pos_tt = '<span id="pos_tag_part_tt" class="pos_tag_tt" title="particle/interjection"></span>';
const ques_pos_tt = '<span id="pos_tag_ques_tt" class="pos_tag_tt" title="interrogative"></span>';

const tt_pos_arr = {1: noun_pos_tt, 2: verb_pos_tt, 3: adj_pos_tt, 4: adverb_pos_tt, 5: prep_pos_tt, 6: conj_pos_tt, 7: part_pos_tt, 8: ques_pos_tt,};

const smallscreen_annot_box_html = '<div id="annot_box"><div id="annot_topbar"><div id="close_button"><svg id="red_cross" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z"/></svg></div><span id="edit_button" title="Edit current text-word">Edit</span><span id="pos_tag_box"><span id="pos_tag_adj" class="pos_tag" title="adjective">adject.</span></span></div><div id="lemma_tag_row"><textarea id="lemma_tag" spellcheck="false">uigennemtrængelig</textarea></div><div id="annot"><div id="right_column"><div id="left_column"><span id="lemma_box" class="box">Lemma</span><span id="multiword_box" class="box">Multiword</span><span id="context_box" class="box" title="not yet implemented">Context translation</span><span id="morph_box" class="box" title="not yet implemented">Morphology</span><span id="accent_box" class="box" title="not yet implemented">Accentology</span></div><div id="right_body"><textarea id="lemma_textarea" autocomplete="off">impenetrable</textarea><div id="meaning_no_box"><div id="meaning_leftarrow" class="nav_arrow">&lt;</div><div id="meaning_no">Meaning <span id="number">1</span></div><div id="meaning_rightarrow" class="nav_arrow">&gt;</div></div></div><div id="right_footer"><div id="save_button">Save</div><div id="delete_lemma_button">Delete</div></div></div></div></div>';

const fullscreen_annot_box_html = '<div id="annot_box"><div id="annot_topbar" ondblclick="makeDraggable()"><span id="close_button" onclick="delAnnotate()">Close</span><span id="edit_button" title="Edit current text-word">Edit</span></div><div id="annot"><div id="left_column"><span id="lemma_box" class="box">Lemma translation</span><span id="multiword_box" class="box">Multiword</span><span id="context_box" class="box" title="not yet implemented">Context translation</span><span id="morph_box" class="box" title="not yet implemented">Morphology</span><span id="accent_box" class="box" title="not yet implemented">Accentology</span></div><div id="right_column"><div id="right_header"><textarea id="lemma_tag" spellcheck="false"></textarea></div><div id="right_body"><textarea id="lemma_textarea" autocomplete="off"></textarea></div><div id="right_footer"><span id="pos_tag_box"></span><div id="meaning_no_box"><div id="meaning_leftarrow" class="nav_arrow"><</div><div id="meaning_no">Meaning <span id="number"></span></div><div id="meaning_rightarrow" class="nav_arrow">></div></div><div id="save_and_delete_box"><div id="save_button">Save</div><div id="delete_lemma_button">Delete</div></div></div></div></div></div>';

function choosePoS(pos_number) {
  let pos_html = noun_pos;
  switch(pos_number) {
    case 1:
      pos_html = noun_pos;
      break;
    case 2:
      pos_html = verb_pos;
      break;
    case 3:
      pos_html = adj_pos;
      break;
    case 4:
      pos_html = adverb_pos;
      break;  
    case 5:
      pos_html = prep_pos;
      break;  
    case 6:
      pos_html = conj_pos;
      break;  
    case 7:
      pos_html = part_pos;
      break;
    case 8:
      pos_html = ques_pos;
      break;  
  }
  return pos_html;
}

const deadFunc = function () {
  let pos_selects = document.querySelectorAll('.pos_tag_select');
  pos_selects.forEach(pos_select => {
    pos_select.remove();
  });
  this.onclick = selectPoS;
};

const changePoS = function () {
  let pullInFunc = () => {};
  switch(annotation_mode){
    case 1:
      pullInFunc = pullInLemma;
      break;
    case 2:
      //pullInFunc = (boolean) => {}; 
      pullInFunc = pullInMultiwordByForm;
      break;
    default:
      pullInFunc = pullInLemma;
  }
  switch (this.id) {
    case "noun_pos":
      document.getElementById('pos_tag_box').innerHTML = noun_pos;
      pos = 1;
      pullInFunc(false);
      break;
    case "verb_pos":
      document.getElementById('pos_tag_box').innerHTML = verb_pos;
      pos = 2;
      pullInFunc(false);
      break;
    case "adj_pos":
      document.getElementById('pos_tag_box').innerHTML = adj_pos;
      pos = 3;
      pullInFunc(false);
      break;  
    case "adverb_pos":
      document.getElementById('pos_tag_box').innerHTML = adverb_pos;
      pos = 4;
      pullInFunc(false);
      break;
    case "prep_pos":
      document.getElementById('pos_tag_box').innerHTML = prep_pos;
      pos = 5;
      pullInFunc(false);
      break;
    case "conj_pos":
      document.getElementById('pos_tag_box').innerHTML = conj_pos;
      pos = 6;
      pullInFunc(false);
      break;  
    case "part_pos":
      document.getElementById('pos_tag_box').innerHTML = part_pos;
      pos = 7;
      pullInFunc(false);
      break;
    case "ques_pos":
      document.getElementById('pos_tag_box').innerHTML = ques_pos;
      pos = 8;
      pullInFunc(false);
      break;
  }
  pos_initial = pos;
};

const selectPoS = function () {
  let pos_tag_current_id = document.querySelector('.pos_tag').id;

  let pos_tag_select_current = "noun_pos";

  switch (pos_tag_current_id) {
    case "pos_tag_noun":
      pos_tag_select_current = "noun_pos";
      break;
    case "pos_tag_verb":
      pos_tag_select_current = "verb_pos";
      break;
    case "pos_tag_adj":
      pos_tag_select_current = "adj_pos";
      break;  
    case "pos_tag_adverb":
      pos_tag_select_current = "adverb_pos";
      break;
    case "pos_tag_prep":
      pos_tag_select_current = "prep_pos";
      break;
    case "pos_tag_conj":
      pos_tag_select_current = "conj_pos";
      break;  
    case "pos_tag_part":
      pos_tag_select_current = "part_pos";
      break;
    case "pos_tag_ques":
      pos_tag_select_current = "ques_pos";
      break;
  }

  let frag = document.createRange().createContextualFragment('<span id="noun_pos" class="pos_tag_select">noun</span><span id="verb_pos" class="pos_tag_select">verb</span><span id="adj_pos" class="pos_tag_select" title="adjective">adject.</span><span id="adverb_pos" class="pos_tag_select">adverb</span><span id="prep_pos" class="pos_tag_select" title="preposition">prep.</span><span id="conj_pos" class="pos_tag_select" title="conjunction">conj.</span><span id="part_pos" class="pos_tag_select" title="particle/interjection">part.</span><span id="ques_pos" class="pos_tag_select" title="interrogative">ques.</span>');

  document.getElementById(pos_tag_current_id).after(frag);
  document.getElementById(pos_tag_current_id).onclick = deadFunc;

  document.getElementById('noun_pos').onclick = changePoS;
  document.getElementById('verb_pos').onclick = changePoS;
  document.getElementById('adj_pos').onclick = changePoS;
  document.getElementById('adverb_pos').onclick = changePoS;
  document.getElementById('prep_pos').onclick = changePoS;
  document.getElementById('conj_pos').onclick = changePoS;
  document.getElementById('part_pos').onclick = changePoS;
  document.getElementById('ques_pos').onclick = changePoS;

  document.getElementById('pos_tag_box').removeChild(document.getElementById(pos_tag_select_current));

}; 

const pullInLemma = function (can_skip = true) {
  
  let lemma_form = document.getElementById('lemma_tag').value.trim();
  if (lemma_form == lemma_form_tag_initial && can_skip) {
    return;
  }
/*  if(lang_id == 5 && pos == 1) {
    lemma_form = lemma_form[0].toUpperCase().concat(lemma_form.slice(1));
  } */
  lemma_form_tag_initial = lemma_form;//TESTING

  document.getElementById('save_button').onclick = "";
  const httpRequest = (method, url) => {
    let send_data = "lemma_form=" + encodeURIComponent(lemma_form) + "&lemma_meaning_no=" + lemma_meaning_no + "&pos=";
    if(pos == pos_initial) {
      send_data += "0&lang_id=" + lang_id;
    }
    else {
      send_data += pos + "&lang_id=" + lang_id;
    }

    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, true);
    xhttp.responseType = 'json';
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhttp.onload = () => {
      if (xhttp.readyState == 4) {
        let json_response = xhttp.response;
        console.log(json_response);
        lemma_id = Number(json_response.lemma_id);
        meanings = Object.create(null);
        if(lemma_id != 0) {
          
          let new_lemma_textarea_content = json_response.lemma_textarea_content;
          if(new_lemma_textarea_content != "") {
            meanings[lemma_meaning_no] = new_lemma_textarea_content;
          }
          lemma_textarea_content_initial = new_lemma_textarea_content;
          document.getElementById("lemma_textarea").value = new_lemma_textarea_content;

          pos = Number(json_response.pos);
          //German gets case-folded when the lemma-forms are looked up, so an originally lower-case noun-form that succeeds in pulling in a capitalised lemma's definition needs to be capitalised as well 
          if(lang_id == 5 && pos == 1) {
	          lemma_form = lemma_form[0].toUpperCase().concat(lemma_form.slice(1));
            document.getElementById('lemma_tag').value = lemma_form;
	        }
          pos_initial = pos;
          document.getElementById('pos_tag_box').innerHTML = choosePoS(pos);
        }
        document.getElementById('save_button').onclick = lemmaRecord;
      }
    }
    xhttp.send(send_data);
  }
  httpRequest("POST", "pull_lemma.php");
};

function switchMeaningAJAX() {
  const httpRequest = (method, url) => {
    let send_data = "lemma_id=" + lemma_id + "&lemma_meaning_no=" + lemma_meaning_no;

    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, true);
    xhttp.responseType = 'text';
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhttp.onload = () => {
      if (xhttp.readyState == 4) {
        //let json_response = xhttp.response;
        let response_meaning = xhttp.response.trim();
        //console.log(response_meaning);
        //console.log(json_response);
        if(response_meaning != "") {
          meanings[lemma_meaning_no] = response_meaning;
        }
        document.getElementById("lemma_textarea").value = meanings[lemma_meaning_no] == undefined ? "" : meanings[lemma_meaning_no];
      }
    }
    xhttp.send(send_data);
  }
  httpRequest("POST", "retrieve_meanings.php");
}

const switchMeaning = function (event) {
  if(event.target.matches('.nav_arrow_deactiv')) return;
  let grey_arrows = document.querySelectorAll('.nav_arrow_deactiv');
  grey_arrows.forEach(grey_arrow => {
    grey_arrow.classList.add("nav_arrow");
    grey_arrow.classList.remove("nav_arrow_deactiv");
  });

  let bool_uparrow = event.target.id == "meaning_rightarrow" ? true : false;
  if (bool_uparrow && lemma_meaning_no < 10) {
    if(document.getElementById("lemma_textarea").value.trim() != "" || meanings[lemma_meaning_no] != undefined) {
      meanings[lemma_meaning_no] = document.getElementById("lemma_textarea").value;
    }
    lemma_meaning_no++;
  }
  else if (bool_uparrow == false && lemma_meaning_no > 1) {
    if(document.getElementById("lemma_textarea").value.trim() != "" || meanings[lemma_meaning_no] != undefined) {
      meanings[lemma_meaning_no] = document.getElementById("lemma_textarea").value;
    }
    lemma_meaning_no--;
  }
  document.getElementById("number").innerHTML = lemma_meaning_no;
  
  if (lemma_meaning_no == 10) {
    document.getElementById("meaning_rightarrow").classList.add("nav_arrow_deactiv");
    document.getElementById("meaning_rightarrow").classList.remove("nav_arrow");
  }
  if (lemma_meaning_no == 1) {
    document.getElementById("meaning_leftarrow").classList.add("nav_arrow_deactiv");
    document.getElementById("meaning_leftarrow").classList.remove("nav_arrow");
  }
  if (lemma_id != 0 && meanings[lemma_meaning_no] === undefined) {
    switchMeaningAJAX();
  }

  document.getElementById("lemma_textarea").value = meanings[lemma_meaning_no] == undefined ? "" : meanings[lemma_meaning_no];
  document.getElementById("lemma_textarea").focus();
  
};

const disRegard = function () {
  const httpRequest = (method, url) => {


    let send_data = "tokno_current=" + tokno_current + "&word_engine_id=" + word_engine_id;

    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, true);
    xhttp.responseType = 'json';
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhttp.onload = () => {
      console.log("sent");
      // console.log(xhttp.responseText);
      if (xhttp.readyState == 4 && xhttp.status == 204) {
        let word_element = document.querySelector("[data-tokno='"+tokno_current+"']");
        word_element.outerHTML = word_element.firstChild.textContent;

        delAnnotate();
      }
    }
    xhttp.send(send_data);
  }

  httpRequest("POST", "disregard_word.php");
};

const lemmaRecord = function () {
  if(document.getElementById("lemma_textarea").value.trim() != "" || meanings[lemma_meaning_no] != undefined) {
    meanings[lemma_meaning_no] = document.getElementById("lemma_textarea").value.trim();
  }

  let skip = true;
  for(let lemma_meaning_no in meanings) {
    if(meanings[lemma_meaning_no].trim() != "") {
      skip = false;
    }
  }
  if(skip) return;
  
  let clicked_lemma_meaning_no = lemma_meaning_no;
  let meanings_length = Object.keys(meanings).length;
  
  let lemma_form_trimmed = document.getElementById('lemma_tag').value.trim();
  //auto-capitalise German nouns (will mess up words like 'iPhone' and 'eTicket', but those are unlikely to need translations)
  if(lang_id == 5 && pos == 1) {
    lemma_form_trimmed = lemma_form_trimmed[0].toUpperCase().concat(lemma_form_trimmed.slice(1));
  }
  const lemma_form = encodeURIComponent(lemma_form_trimmed);
  
  let count = 1;

  for (let lemma_meaning_no in meanings) {
    let lemma_meaning = meanings[lemma_meaning_no];
    const httpRequest = (method, url) => {
      lemma_meaning = encodeURIComponent(lemma_meaning);

      let send_data = "word_engine_id=" + word_engine_id + "&lemma_form=" + lemma_form + "&lemma_meaning=" + lemma_meaning + "&lemma_meaning_no=" + lemma_meaning_no + "&lang_id=" + lang_id + "&tokno_current=" + tokno_current + "&pos=" + pos +"&clicked_lemma_meaning_no=" + clicked_lemma_meaning_no;

      const xhttp = new XMLHttpRequest();
      xhttp.open(method, url, true);

      xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

      xhttp.onload = () => {
        console.log("sent");
        // console.log(xhttp.responseText);
        if (xhttp.readyState == 4) {
          console.log("Lemma updated");      
        
          document.querySelector('[data-tokno="'+tokno_current+'"]').classList.add("lemma_set");
          let dataselectorstring = '[data-word_engine_id="' + word_engine_id + '"]';
          let current_words = document.querySelectorAll(dataselectorstring);
          current_words.forEach(current_word => {
            current_word.classList.add("lemma_set_unexplicit");
          });
          console.log("meanings_lengths: ", meanings_length); //remove
          console.log("count: ", count); //remove
          if(tooltips_shown == true && count == meanings_length) {
            lemmaRecordTooltipUpdate(current_words); //this being repeated for every meaning{} sometimes causes an issue with double tooltips; the lemma_record.php scripts are fired off without waiting for the previous one to return. possibly should get length of the meanings{} array and only run this on the final iteration (DONE)
          }
          count++;
        }
      }
      xhttp.send(send_data);
    }

    httpRequest("POST", "lemma_record.php");
  }
  delAnnotate();
};

const lemmaDelete = function () {
  const httpRequest = (method, url) => {

    let send_data = "lemma_id="+lemma_id+"&word_engine_id="+word_engine_id+"&tokno_current="+tokno_current;

    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.responseType = 'text';

    xhttp.onload = () => {
      if(xhttp.readyState == 4) {
        let lemma_still_set = xhttp.responseText.trim() == "0" ? false : true;

        console.log('Lemma deleted');
       /* document.getElementById('annot_box').remove();
        display_word.classList.add("tooltip");
        display_word.classList.remove("tooltip_selected"); */
        if(lemma_still_set == false) {
          let dataselectorstring = '[data-word_engine_id="' + word_engine_id + '"]';
          let current_words = document.querySelectorAll(dataselectorstring);
          current_words.forEach(current_word => {
            current_word.classList.remove("lemma_set");
            current_word.classList.remove("lemma_set_unexplicit");
          });     
        }
        else {
          document.querySelector('[data-tokno="'+tokno_current+'"]').classList.remove("lemma_set");
        }
        delAnnotate();

        if(tooltips_shown) {
          lemmaTooltip();
        }
      }
    }
    xhttp.send(send_data);
  };
  httpRequest("POST", "lemma_delete.php");
  //meanings = {};
};


const setLemmaTagSize = function () {
  let lemma_tag = document.getElementById('lemma_tag');
  let hidden_lemma_tag = document.getElementById('hidden_lemma_tag');

  hidden_lemma_tag.textContent = lemma_tag.value;

  let new_width = hidden_lemma_tag.offsetWidth+"px";
  let new_height = hidden_lemma_tag.offsetHeight+"px";
  lemma_tag.style.width = new_width;
  lemma_tag.style.height = new_height;
};

const lemmaTooltip = function () {
  let lemma_tooltips = document.querySelectorAll('.lemma_tt');
  lemma_tooltips.forEach(lemma_tooltip => {
    lemma_tooltip.remove();
  });

  let lemma_set_words = document.querySelectorAll('.lemma_set_unexplicit');
  let set_toknos = new Array();
  let set_word_eng_ids = new Array();
  lemma_set_words.forEach(lemma_set_word => {
    let lemma_set_tokno = lemma_set_word.dataset.tokno;
    let lemma_set_word_eng_id = lemma_set_word.dataset.word_engine_id;
    set_toknos.push(lemma_set_tokno);
    set_word_eng_ids.push(lemma_set_word_eng_id);
  
  });

  const httpRequest = (method, url) => {

    // let send_data = toknos_POST_data;
    let send_data = "toknos=" + set_toknos + "&word_eng_ids=" + set_word_eng_ids;
    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.responseType = 'json';

    xhttp.onload = () => {
      if(xhttp.readyState == 4) {
        tooltips_shown = true;
        const json_lemma_transes = xhttp.response;
       // console.log(json_lemma_transes);
        if(json_lemma_transes == null) {
         document.getElementById("tt_toggle").disabled = false;
         return;
        }
        let i = 0;
        lemma_set_words.forEach(lemma_set_word => {
          const json_pos = Number(json_lemma_transes[i].pos);

          let lemma_tt_box = '<span class="lemma_tt" onclick="event.stopPropagation()"><span id="tt_top"><div class="lemma_tag_tt">'+json_lemma_transes[i].lemma_form+'</div><span id="pos_tag_box_tt">'+tt_pos_arr[json_pos]+'</span></span><span id="tt_mid"><div id="tt_meaning">'+json_lemma_transes[i].lemma_trans+'</div></span><span id="tt_bottom"></span></span>';

          lemma_set_word.innerHTML = lemma_set_word.innerHTML + lemma_tt_box;
          i++;
        });
        document.getElementById("tt_toggle").disabled = false;
        setTimeout(ttPosition, 200);
      }

    }
    xhttp.send(send_data);
  };
  httpRequest("POST", "lemma_tooltip.php");

};

const lemmaTooltipMW = function () {
  let lemma_tooltips = document.querySelectorAll('.lemma_tt, .mw_tt');
  lemma_tooltips.forEach(lemma_tooltip => {
    lemma_tooltip.remove();
  });

  const lemma_set_words = Array.from(document.getElementsByClassName('lemma_set_unexplicit'));
  const mw_set_words = document.querySelectorAll(".multiword");
  
  let lemma_set_toknos = new Array();
  let lemma_set_word_eng_ids = new Array();

  //let mw_toknos = new Array();
  
  let mw_first_toknos = new Array();
  let mw_first_word_eng_ids = new Array();
  
  lemma_set_words.forEach(lemma_set_word => {
    let lemma_set_tokno = lemma_set_word.dataset.tokno;
    let lemma_set_word_eng_id = lemma_set_word.dataset.word_engine_id;
    lemma_set_toknos.push(lemma_set_tokno);
    lemma_set_word_eng_ids.push(lemma_set_word_eng_id);
  
  });

  const mw_count_set = new Set();
  mw_set_words.forEach(mw_word => {
    const mw_count = Number(mw_word.dataset.multiword);
    if(mw_count_set.has(mw_count) == false) {
        mw_count_set.add(mw_count);
        mw_first_toknos.push(mw_word.dataset.tokno);
        mw_first_word_eng_ids.push(mw_word.dataset.word_engine_id); 
    }
    //mw_toknos.push(mw_word.dataset.tokno);
  });
  
  let mw_first_words = [];
  mw_first_toknos.forEach(tokno => {
    mw_first_words.push(document.querySelector("[data-tokno='"+tokno+"']"));
  });

  const httpRequest = (method, url) => {

    // let send_data = toknos_POST_data;
    let send_data = "toknos=" + lemma_set_toknos + "&word_eng_ids=" + lemma_set_word_eng_ids + "&mw_first_toknos=" + mw_first_toknos;
    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.responseType = 'json';

    xhttp.onload = () => {
      if(xhttp.readyState == 4) {
        tooltips_shown = true;
        const json_lemma_transes = xhttp.response[0];
        const json_mw_transes = xhttp.response[1];
       // console.log(json_lemma_transes);
        if(json_lemma_transes == null) {
         document.getElementById("tt_toggle").disabled = false;
         return;
        }
        let i = 0;
        //const lemma_set_only_words = lemma_set_words.filter(x => mw_first_toknos.includes(x.dataset.tokno) == false); 
        lemma_set_words.forEach(lemma_set_word => {
          if(mw_first_toknos.includes(lemma_set_toknos[i]) == false) {
            const json_pos = Number(json_lemma_transes[i].pos);

            let lemma_tt_box = '<span class="lemma_tt" onclick="event.stopPropagation()"><span id="tt_top"><div class="lemma_tag_tt">'+json_lemma_transes[i].lemma_form+'</div><span id="pos_tag_box_tt">'+tt_pos_arr[json_pos]+'</span></span><span id="tt_mid"><div id="tt_meaning">'+json_lemma_transes[i].lemma_trans+'</div></span><span id="tt_bottom"></span></span>';
  
            lemma_set_word.innerHTML = lemma_set_word.innerHTML + lemma_tt_box;
          }
          i++;
        });
        i = 0;
        mw_first_words.forEach(mw_set_word => {
          const json_mw_pos = Number(json_mw_transes[i].mw_pos);
          
          let mw_tt_box = '<span class="mw_tt" data-mw_active="1" onclick="event.stopPropagation()">'
          //if(lemma_set_toknos.includes(mw_first_toknos[i]))mw_tt_box += '<span class="appendages append_inact append_act" id="append1">M</span>    <span class="appendages append_inact" id="append2">L</span>';
          mw_tt_box += '<span id="tt_top"><div class="lemma_tag_tt">'+json_mw_transes[i].mw_lemma_form+'</div><span id="pos_tag_box_tt">'+tt_pos_arr[json_mw_pos]+'</span></span><span id="tt_mid"><div id="tt_meaning">'+json_mw_transes[i].mw_lemma_trans+'</div></span><span id="tt_bottom"></span></span>'
            
          mw_set_word.innerHTML = mw_set_word.innerHTML + mw_tt_box;
          i++;
            
        });
        
        
        document.getElementById("tt_toggle").disabled = false;
        setTimeout(ttPosition, 200);
      }

    }
    xhttp.send(send_data);
  };
  httpRequest("POST", "lemma_tooltip_mw.php");

};

//need to write an equivalent for multiword_recording to update mw_tooltips
const lemmaRecordTooltipUpdate = function (current_words) {
  current_words.forEach(current_word => {
    let current_lemma_tt = current_word.querySelector('.lemma_tt');
    if(current_lemma_tt != null) {
      current_lemma_tt.remove();
    }
  });

  let current_toknos = new Array();
  let current_word_eng_ids = new Array();
  current_words.forEach(current_word => {
    let current_tokno = current_word.dataset.tokno;
    let current_word_eng_id = current_word.dataset.word_engine_id;
    current_toknos.push(current_tokno);
    current_word_eng_ids.push(current_word_eng_id);
  });

  const httpRequest = (method, url) => {

    // let send_data = toknos_POST_data;
    let send_data = "toknos=" + current_toknos + "&word_eng_ids=" + current_word_eng_ids;
    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.responseType = 'json';

    xhttp.onload = () => {
      if (xhttp.readyState == 4) {
        tooltips_shown = true;
        const json_lemma_transes = xhttp.response;
       // console.log(json_lemma_transes);
        if (json_lemma_transes == null) {
          return;
        }
        let i = 0;
        current_words.forEach(current_word => {
          const json_pos = Number(json_lemma_transes[i].pos);

          let lemma_tt_box = '<span class="lemma_tt" onclick="event.stopPropagation()"><span id="tt_top"><div class="lemma_tag_tt">' + json_lemma_transes[i].lemma_form + '</div><span id="pos_tag_box_tt">' + tt_pos_arr[json_pos] + '</span></span><span id="tt_mid"><div id="tt_meaning">' + json_lemma_transes[i].lemma_trans + '</div></span><span id="tt_bottom"></span></span>';

          current_word.innerHTML = current_word.innerHTML + lemma_tt_box;
          i++;
        });
      }

    }
    xhttp.send(send_data);
  };
  httpRequest("POST", "lemma_tooltip.php");
};

const singleTooltipUpdate = function (single_word) {
  
  if(!single_word.classList.contains('lemma_set_unexplicit')) return;

  let current_lemma_tt = single_word.querySelector('.lemma_tt');
  if(current_lemma_tt != null) {
    current_lemma_tt.remove();
  }

  let single_tokno = single_word.dataset.tokno;
  let single_word_eng_id = single_word.dataset.word_engine_id;

  const httpRequest = (method, url) => {

    // let send_data = toknos_POST_data;
    let send_data = "toknos=" + single_tokno + "&word_eng_ids=" + single_word_eng_id;
    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.responseType = 'json';

    xhttp.onload = () => {
      if (xhttp.readyState == 4) {
        tooltips_shown = true;
        const json_lemma_transes = xhttp.response;
       // console.log(json_lemma_transes);
        if (json_lemma_transes == null) {
          return;
        }
        let i = 0;
        const json_pos = Number(json_lemma_transes[i].pos);
        let lemma_tt_box = '<span class="lemma_tt" onclick="event.stopPropagation()"><span id="tt_top"><div class="lemma_tag_tt">' + json_lemma_transes[i].lemma_form + '</div><span id="pos_tag_box_tt">' + tt_pos_arr[json_pos] + '</span></span><span id="tt_mid"><div id="tt_meaning">' + json_lemma_transes[i].lemma_trans + '</div></span><span id="tt_bottom"></span></span>';
        single_word.innerHTML = single_word.innerHTML + lemma_tt_box;
      }

    }
    xhttp.send(send_data);
  };
  httpRequest("POST", "lemma_tooltip.php");
};


let pos = 1;
let lemma_form_tag_initial = "";
let lemma_textarea_content_initial = "";
let lemma_meaning_no = 1;
let lemma_id = 0;
let meanings = Object.create(null);

let multiword_meanings = Object.create(null);
let multiword_indices = Object.create(null);
let multiword_id = 0;
let multiword_meaning_no = 1;
//let multiword_tag_initial = "";

let tooltips_shown = false;
let pos_initial = 1;

let display_word = null;
let tokno_current = 0;
let word_engine_id = 0;

let annotation_mode = 0;
///////////////////////////////

function showAnnotate(event) {
  if(window.innerWidth < 769) return;

  if(event.target.classList.contains("tooltip") == false || event.target.classList.contains("multiword") || event.target.classList.contains("tooltip_selected") || event.target.classList.contains("mw_selectable") || displayWordEditor.edit_mode) return;

  if(display_word != null) delAnnotate();
  display_word = event.target;
  //display_word.onclick = "";
  display_word.classList.add("tooltip_selected");
  display_word.classList.remove("tooltip");
  tokno_current = display_word.dataset.tokno;
  word_engine_id = display_word.dataset.word_engine_id;
  
  fetchLemmaData(false);
};


const fetchLemmaData = function (box_present = true) {
  delAnnotate(false);
  annotation_mode = 1;
  meanings = Object.create(null);
  const httpRequest = (method, url) => {
    let send_data = "word_engine_id="+word_engine_id+"&tokno_current="+tokno_current+"&lang_id="+lang_id;
 
    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, true);
    xhttp.responseType = 'json';
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.onload = () => {
      console.log("sent");
      //setTimeout(() => {
      if(xhttp.readyState == 4)  {
       
        if(!box_present) boxFunction(annotation_mode);
        let json_response = xhttp.response;
        pos = Number(json_response.pos);
        pos_initial = pos;
        lemma_id = Number(json_response.lemma_id);
        lemma_meaning_no = Number(json_response.lemma_meaning_no);
        let lemma_textarea_content = json_response.lemma_textarea_content;
        lemma_textarea_content_initial = lemma_textarea_content;  
        
        show_delete_button = false;
        if(lemma_meaning_no != 0) {
          meanings[lemma_meaning_no] = lemma_textarea_content;
          show_delete_button = true;
        }
        else {
          lemma_meaning_no = 1;
        }

        let lemma_tag_content = json_response.lemma_tag_content;
        //capitalise German nouns which aren't annotated but whose casefolded forms match existing noun lemmas
        if(lang_id == 5 && lemma_id != 0 && pos == 1 && show_delete_button == false) {
          lemma_tag_content = lemma_tag_content[0].toUpperCase().concat(lemma_tag_content.slice(1));
        }

        lemma_form_tag_initial = lemma_tag_content;
        
        //let lemma_textarea_content_html = json_response.lemma_textarea_content_html;
        
        document.getElementById('pos_tag_box').innerHTML = choosePoS(pos);
        document.getElementById("number").innerHTML = lemma_meaning_no;     
        document.getElementById('lemma_tag').value = lemma_tag_content;
        setLemmaTagSize();
        document.getElementById('lemma_textarea').value = lemma_textarea_content; //might be able to get rid of _html versions on back and frontend doing it this way

        document.getElementById('lemma_tag').focus();

        reactivateArrows(lemma_meaning_no, 10);

        if(lemma_id == 0 || show_delete_button == false) {
          document.getElementById('delete_lemma_button').style.display = "none";
        }
        else {
          document.getElementById('delete_lemma_button').style.display = "";
        }
        
        document.getElementById('delete_lemma_button').onclick = lemmaDelete;  
        document.getElementById('edit_button').onclick = displayWordEditor.startEditing;
        toggleSave(true, lemmaRecord);
        //document.getElementById('save_button').onclick = lemmaRecord;
        document.getElementById('meaning_leftarrow').onclick = switchMeaning;
        document.getElementById('meaning_rightarrow').onclick = switchMeaning;
        document.getElementById('lemma_tag').onblur = pullInLemma;

        document.getElementById("lemma_tag").addEventListener("keydown", dict.lookUpMouseSelection); //DELETE
      } //}, 1300);
    }
    xhttp.send(send_data);
  }
  httpRequest("POST", "retrieve_engword.php");
};

const htmlSpecialChars = (unescaped) => {
  let escaped = "";
  for(const c of unescaped) {
    switch(c) {
      case '<':
          escaped += "&lt;";
          break;
      case '>':
          escaped += "&gt;";
          break;
      case '"':
          escaped += "&quot;";
          break;
      case '\'':
          escaped += "&#039;";
          break;
      case '&':
          escaped += "&amp;";
          break;
      default:
        escaped += c;
    }
  }
  return escaped;
};

const recordMultiword = function () {
  if(document.getElementById("lemma_textarea").value.trim() != "" || multiword_meanings[multiword_meaning_no] != undefined) {
    multiword_meanings[multiword_meaning_no] = document.getElementById("lemma_textarea").value.trim();
  }
  
  //let clicked_meaning_no = multiword_meaning_no;
  let mw_meanings_length = Object.keys(multiword_meanings).length;
  let prev_mw_count = display_word.dataset.multiword;
  let count = 1;
 
  let mw_meaning = multiword_meanings[multiword_meaning_no];
  if(mw_meaning == undefined) {
    mw_meaning = "";
  }
  const tt_mw_lemma_form = htmlSpecialChars(document.getElementById('lemma_tag').value.trim());
  const tt_mw_meaning = htmlSpecialChars(mw_meaning);

  const httpRequest = (method, url) => {

    let multiword_lemma_form = encodeURIComponent(document.getElementById('lemma_tag').value.trim());
    mw_meaning = encodeURIComponent(mw_meaning);
    let word_eng_ids = Object.values(multiword_indices).toString();
    let toknos = Object.keys(multiword_indices).toString();

    let send_data = "word_eng_ids="+word_eng_ids +"&toknos="+toknos+ "&multiword_lemma_form=" + multiword_lemma_form + "&multiword_lemma_meaning=" + mw_meaning + "&multiword_meaning_no=" + multiword_meaning_no + "&pos="+pos + "&lang_id="+lang_id + "&anchor_tokno=" + tokno_current;

    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, true);

    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.responseType = 'text';
    xhttp.onload = () => {  
      console.log("sent");
      // console.log(xhttp.responseText);
      if (xhttp.readyState == 4) {
        console.log("Multiword updated");
        let response_numbers = xhttp.response.trim().split(",");
        console.log(response_numbers);
        let new_mw_count = response_numbers[0];
        let new_mw_id = response_numbers[1];

        for (let mw_meaning_no in multiword_meanings) {
          if(mw_meaning_no == multiword_meaning_no) continue;
          let eng_trans = multiword_meanings[mw_meaning_no];
          updateMultiwordTranslations(new_mw_id, mw_meaning_no, eng_trans);
          console.log(mw_meaning_no, ": ", eng_trans);
        }

        let dataselectorstring = '[data-multiword="' + prev_mw_count + '"]';
        const prev_multiwords = document.querySelectorAll(dataselectorstring);
        prev_multiwords.forEach(prev_mw => {
          prev_mw.removeAttribute('data-multiword');
          prev_mw.classList.remove("multiword");
        });

        document.querySelectorAll('.mw_current_select').forEach(mwc => {  
          mwc.classList.add("multiword");
          mwc.setAttribute("data-multiword", new_mw_count);
        });
        console.log("mw_meanings_lengths: ", mw_meanings_length); //remove
        console.log("count: ", count); //remove

        const new_multiwords = document.querySelectorAll(`[data-multiword="${new_mw_count}"`);
        new_multiwords.forEach(multiword => {
          multiword.addEventListener('click', showMultiwordAnnotate);
          multiword.addEventListener('mouseover', underlineMultiwords);
          multiword.addEventListener('mouseout', removeUnderlineMultiwords);
        });
        if(tooltips_shown == true) {
          if(prev_multiwords[0] != undefined) prev_multiwords[0].querySelector('.mw_tt').remove();
          
          let mw_tt_box = '<span class="mw_tt" data-mw_active="1" onclick="event.stopPropagation()">'
          mw_tt_box += '<span id="tt_top"><div class="lemma_tag_tt">'+tt_mw_lemma_form+'</div><span id="pos_tag_box_tt">'+tt_pos_arr[pos]+'</span></span><span id="tt_mid"><div id="tt_meaning">'+tt_mw_meaning+'</div></span><span id="tt_bottom"></span></span>';

          new_multiwords[0].innerHTML = new_multiwords[0].innerHTML + mw_tt_box;
        }
        delAnnotate();
      }
    }
    xhttp.send(send_data);
  };

  httpRequest("POST", "record_multiword.php");
};

const updateMultiwordTranslations = (new_mw_id, mw_meaning_no, eng_trans) => {
  const httpRequest = (method, url) => {
    let send_data = "multiword_id="+new_mw_id + "&multiword_meaning_no="+mw_meaning_no + "&mw_meaning="+encodeURIComponent(eng_trans);
    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhttp.onload = () => {
      if (xhttp.readyState == 4) {
        console.log(`updated mw_trans${mw_meaning_no}`);
      }
    }
    xhttp.send(send_data);
  }
  httpRequest("POST", "update_MW_translations.php");
};

const deleteMultiword = function () {
  const httpRequest = (method, url) => {
    let prev_mw_count = display_word.dataset.multiword;

    let send_data = "multiword_id="+multiword_id+"&word_eng_ids="+Object.values(multiword_indices).toString()+"&toknos="+Object.keys(multiword_indices).toString()+"&lang_id="+lang_id;
    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhttp.onload = () => {
      if(xhttp.readyState == 4) {

        delAnnotate();

        let dataselectorstring = '[data-multiword="' + prev_mw_count + '"]';
        const prev_multiwords = document.querySelectorAll(dataselectorstring);
        prev_multiwords.forEach(prev_mw => {
          prev_mw.removeAttribute('data-multiword');
          prev_mw.classList.remove("multiword");
          //prev_mw.onclick = showAnnotate;
          prev_mw.removeEventListener('click', showMultiwordAnnotate);
        });
        if(tooltips_shown && prev_multiwords[0] != undefined) {
          prev_multiwords[0].querySelector('.mw_tt').remove();
          singleTooltipUpdate(prev_multiwords[0]);
        }

      }
    }
    xhttp.send(send_data);
  };
  httpRequest("POST", "delete_multiword.php");
};

const switchMultiwordMeanings = function(event) {
  if(event.target.matches('.nav_arrow_deactiv')) return;
  let grey_arrows = document.querySelectorAll('.nav_arrow_deactiv');
  grey_arrows.forEach(grey_arrow => {
    grey_arrow.classList.add("nav_arrow");
    grey_arrow.classList.remove("nav_arrow_deactiv");
  });

  let bool_uparrow = event.target.id == "meaning_rightarrow" ? true : false;
  if (bool_uparrow && multiword_meaning_no < 5) {
    if(document.getElementById("lemma_textarea").value.trim() != "" || multiword_meanings[multiword_meaning_no] != undefined) {
      multiword_meanings[multiword_meaning_no] = document.getElementById("lemma_textarea").value;
    }
    multiword_meaning_no++;
  }
  else if (bool_uparrow == false && multiword_meaning_no > 1) {
    if(document.getElementById("lemma_textarea").value.trim() != "" || multiword_meanings[multiword_meaning_no] != undefined) {
      multiword_meanings[multiword_meaning_no] = document.getElementById("lemma_textarea").value;
    }
    multiword_meaning_no--;
  }
  document.getElementById("number").innerHTML = multiword_meaning_no;
  
  if (multiword_meaning_no == 5) {
    document.getElementById("meaning_rightarrow").classList.add("nav_arrow_deactiv");
    document.getElementById("meaning_rightarrow").classList.remove("nav_arrow");
  }
  if (multiword_meaning_no == 1) {
    document.getElementById("meaning_leftarrow").classList.add("nav_arrow_deactiv");
    document.getElementById("meaning_leftarrow").classList.remove("nav_arrow");
  }
  if (multiword_id != 0 && multiword_meanings[multiword_meaning_no] === undefined) {
    switchMultiwordMeaningAJAX();
  }

  document.getElementById("lemma_textarea").value = multiword_meanings[multiword_meaning_no] == undefined ? "" : multiword_meanings[multiword_meaning_no];
  document.getElementById("lemma_textarea").focus();
};

const switchMultiwordMeaningAJAX = function() {
  const httpRequest = (method, url) => {
    let send_data = "multiword_id=" + multiword_id + "&multiword_meaning_no=" + multiword_meaning_no;

    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, true);
    xhttp.responseType = 'text';
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhttp.onload = () => {
      if (xhttp.readyState == 4) {
        //let json_response = xhttp.response;
        let response_meaning = xhttp.response.trim();
        //console.log(response_meaning);
        //console.log(json_response);
        if(response_meaning != "") {
          multiword_meanings[multiword_meaning_no] = response_meaning;
        }
        document.getElementById("lemma_textarea").value = multiword_meanings[multiword_meaning_no] == undefined ? "" : multiword_meanings[multiword_meaning_no];
      }
    }
    xhttp.send(send_data);
  }
  httpRequest("POST", "retrieve_MW_meanings.php");
};

const pullInMultiword = function(can_skip = true, word_eng_ids) {
 
  const httpRequest = (method, url) => {
    let send_data = "word_eng_ids="+word_eng_ids+"&lang_id="+lang_id;
    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, true);
    xhttp.responseType = 'json';
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.onload = () => {
      if(xhttp.readyState == 4) {
        let json_response = xhttp.response;

        multiword_id = Number(json_response.multiword_id);
        
        if(multiword_id == 0) {
          //Add in call to pullInMultiwordByForm here to ensure that it runs once to check that you havent selected the lemma-form of a multiword which has only previously been recorded in an inflected form
          pullInMultiwordByForm();
          //lemma_form_tag_initial gets set by the above function
          return;
        }
        let multiword_tag_content = json_response.multiword_tag_content;
        let multiword_textarea_content = json_response.multiword_textarea_content;
        pos = Number(json_response.pos);
        pos_initial = pos;
        multiword_meaning_no = 1;
        
        multiword_meanings = Object.create(null);
        multiword_meanings[multiword_meaning_no] = multiword_textarea_content;

        document.getElementById('pos_tag_box').innerHTML = choosePoS(pos);
        document.getElementById("number").innerHTML = multiword_meaning_no;
        reactivateArrows(multiword_meaning_no, 5);
        document.getElementById('lemma_tag').value = multiword_tag_content;
        lemma_form_tag_initial = multiword_tag_content;
        setLemmaTagSize();
        document.getElementById('lemma_textarea').value = multiword_textarea_content;

      }
    }
    xhttp.send(send_data);
  }

  httpRequest("POST", "pull_multiword.php");

};

const toggleSave = (on, recordFunc) => {
  if(on == false) {
    document.getElementById("save_button").classList.add("save_button_deactiv");
    document.getElementById("save_button").onclick = "";
    console.log("toggleSave off");
  }
  else {
    document.getElementById("save_button").classList.remove("save_button_deactiv");
    document.getElementById("save_button").onclick = recordFunc;
    console.log("toggleSave on");
  }
};

const selectMultiword = (event) => {
  let mw_candidate = event.target;
  let mw_tokno = mw_candidate.dataset.tokno;
  let no_of_mwc = Object.keys(multiword_indices).length;

  if(mw_candidate.matches('.mw_current_select')) {
    mw_candidate.classList.remove("mw_current_select");
    let mw_candidate_text = "";
    document.querySelectorAll('.mw_current_select').forEach(mwc => {
      mw_candidate_text = mw_candidate_text + mwc.firstChild.textContent.trim() + " ";
    });
    document.getElementById("lemma_tag").value = mw_candidate_text.trim();
    setLemmaTagSize();
    document.getElementById("lemma_tag").focus();
    if(no_of_mwc == 2) toggleSave(false, recordMultiword);    
    delete multiword_indices[mw_tokno];

    let word_eng_ids = Object.values(multiword_indices);
    pullInMultiword(false, word_eng_ids);
  }
  else if(no_of_mwc < 10) {
    mw_candidate.classList.add("mw_current_select");
    let mw_candidate_text = "";
    document.querySelectorAll('.mw_current_select').forEach(mwc => {
      mw_candidate_text = mw_candidate_text + mwc.firstChild.textContent.trim() + " ";
    });
    document.getElementById("lemma_tag").value = mw_candidate_text.trim();
    setLemmaTagSize();
    document.getElementById("lemma_tag").focus();
    if(no_of_mwc == 1) toggleSave(true, recordMultiword);
    multiword_indices[mw_tokno] = mw_candidate.dataset.word_engine_id;

    let word_eng_ids = Object.values(multiword_indices);
    pullInMultiword(false, word_eng_ids);
  }
};

const showMultiwordAnnotate = (event) => {
  if(window.innerWidth < 769) return;
  if(event.target.classList.contains("tooltip_selected") || event.target.classList.contains("mw_selectable") || displayWordEditor.edit_mode) return;
  if(display_word != null) delAnnotate();
  display_word = event.target;
  //display_word.onclick = "";
  display_word.classList.add("tooltip_selected");
  display_word.classList.remove("tooltip");
  tokno_current = display_word.dataset.tokno;
  word_engine_id = display_word.dataset.word_engine_id;
  fetchMultiwordData(false);
};

const boxFunction = function (annotation_mode = 1) {
  displayAnnotBox();
  switch(annotation_mode) {
    case(1):
      document.getElementById("lemma_box").classList.add("current_box");
      break;
    case(2):
      document.getElementById("multiword_box").classList.add("current_box");
      break;
    case(3):
      document.getElementById("context_box").classList.add("current_box");
      break;
    case(4):
      document.getElementById("morph_box").classList.add("current_box");
      break;
    case(5):
      document.getElementById("accent_box").classList.add("current_box");
      break;
  }   
  let current_box = document.querySelector('.current_box');
  let left_column = document.getElementById('left_column');

  function selectBox(box) {
    if(current_box) {
      current_box.classList.remove("current_box");
    }
    current_box = box;
    current_box.classList.add("current_box");
    if(current_box.id == "lemma_box") {
      document.getElementById("right_body").style.visibility = "visible";
      document.getElementById("right_footer").style.visibility = "visible";
      document.getElementById('lemma_textarea').focus();
      fetchLemmaData();
    }
    else if(current_box.id == "multiword_box") {
      document.getElementById("right_body").style.visibility = "visible";
      document.getElementById("right_footer").style.visibility = "visible";
      document.getElementById('lemma_textarea').focus();
      fetchMultiwordData();
    }
    else {
      document.getElementById("right_body").style.visibility = "hidden";
      document.getElementById("right_footer").style.visibility = "hidden";
    }
  }
  left_column.onclick = function (event) {
    let target = event.target;
    if (target.className != 'box') return;
    selectBox(target);
  };
  document.getElementById('lemma_tag').oninput = setLemmaTagSize;
  setLemmaTagSize();
};

const fetchMultiwordData = function (box_present = true) {
  if(document.getElementById('annot_box') != null) delAnnotate(false);
  annotation_mode = 2;
  meanings = Object.create(null);
  multiword_meanings = Object.create(null);
  multiword_indices = Object.create(null);

  let current_mw_number = display_word.dataset.multiword;
 
  const httpRequest = (method, url) => {

    let send_data = "word_engine_id="+word_engine_id+"&tokno_current="+tokno_current+"&lang_id="+lang_id;
 
    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, true);
    xhttp.responseType = 'json';
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.onload = () => {
      console.log("sent");
      if(xhttp.readyState == 4)  {
        if(!box_present) boxFunction(annotation_mode);

        let json_response = xhttp.response;
        let multiword_tag_content = json_response.multiword_tag_content;
        if(multiword_tag_content == "") multiword_tag_content = display_word.firstChild.textContent.trim();
        lemma_form_tag_initial = multiword_tag_content;
        let multiword_textarea_content = json_response.multiword_textarea_content;

        //multiword_tag_initial = multiword_tag_content;
        
        multiword_meaning_no = Number(json_response.multiword_meaning_no);
        multiword_id = Number(json_response.multiword_id);
        pos = Number(json_response.pos);
        pos_initial = pos;
        let adjacent_toknos = json_response.adjacent_toknos;
        //console.log(adjacent_toknos);

        if(current_mw_number != undefined) {
          document.querySelectorAll('[data-multiword="'+current_mw_number+'"]').forEach(current_mw => {
            multiword_indices[current_mw.dataset.tokno] = current_mw.dataset.word_engine_id;
            current_mw.classList.add("mw_current_select");
            current_mw.style.borderBottom = "";
            current_mw.removeEventListener('click', showMultiwordAnnotate);
            current_mw.removeEventListener('mouseover', underlineMultiwords);
            current_mw.removeEventListener('mouseout', removeUnderlineMultiwords);
          });
          toggleSave(true, recordMultiword);
        }
        else {
          display_word.classList.add("mw_current_select");
          multiword_indices[display_word.dataset.tokno] = display_word.dataset.word_engine_id;
          toggleSave(false, recordMultiword);
        }

        for(let adjacent_tokno of adjacent_toknos) {
          let wrd = document.querySelector('[data-tokno="'+adjacent_tokno+'"]');
          //the adjacent_toknos could include words from the next page which will make the querySelector return null
          if(wrd != null && (wrd.dataset.multiword == undefined || wrd.dataset.multiword == current_mw_number)) {
            wrd.classList.add("mw_selectable");
            //wrd.onclick = selectMultiword;
            wrd.addEventListener('click', selectMultiword);
          }
        }

        document.getElementById('pos_tag_box').innerHTML = choosePoS(pos);
        if(multiword_meaning_no != 0) {
          multiword_meanings[multiword_meaning_no] = multiword_textarea_content;
        }
        else {
          multiword_meaning_no = 1;
        }
        document.getElementById("number").innerHTML = multiword_meaning_no;     
        document.getElementById('lemma_tag').value = multiword_tag_content;
        setLemmaTagSize();
        document.getElementById('lemma_textarea').value = multiword_textarea_content;

        document.getElementById('lemma_tag').focus();

        reactivateArrows(multiword_meaning_no, 5);

        if(multiword_id == 0) {
          document.getElementById('delete_lemma_button').style.display = "none";
        }
        else {
          document.getElementById('delete_lemma_button').style.display = "";
        }

        document.getElementById('delete_lemma_button').onclick = deleteMultiword;

        //document.getElementById('save_button').onclick = recordMultiword;
        document.getElementById('meaning_leftarrow').onclick = switchMultiwordMeanings;
        document.getElementById('meaning_rightarrow').onclick = switchMultiwordMeanings;
        document.getElementById('lemma_tag').onblur = "";
        document.getElementById('lemma_tag').onblur = pullInMultiwordByForm;

        document.getElementById("lemma_tag").addEventListener("keydown", dict.lookUpMouseSelection);
      }
    }
    xhttp.send(send_data);
  }
  
  httpRequest("POST", "retrieve_multiword.php");
   
};

const reactivateArrows = (meaning_no, max_meaning_no) => {
  let leftarrow = document.getElementById("meaning_leftarrow");
  let rightarrow = document.getElementById("meaning_rightarrow");
  leftarrow.classList.add("nav_arrow");
  rightarrow.classList.add("nav_arrow");
  leftarrow.classList.remove("nav_arrow_deactiv");
  rightarrow.classList.remove("nav_arrow_deactiv");
  if(meaning_no == 1) {
    document.getElementById("meaning_leftarrow").classList.add("nav_arrow_deactiv");
    document.getElementById("meaning_leftarrow").classList.remove("nav_arrow");
  }
  else if (meaning_no == max_meaning_no) {
    document.getElementById("meaning_rightarrow").classList.add("nav_arrow_deactiv");
    document.getElementById("meaning_rightarrow").classList.remove("nav_arrow");
  }
};

const displayAnnotBox = function () {
  const annot_box = document.createRange().createContextualFragment(/*'<div id="annot_box"><div id="annot_topbar" ondblclick="makeDraggable()"><span id="close_button" onclick="delAnnotate()">Close</span><span id="edit_button" title="Edit current text-word">Edit</span></div><div id="annot"><div id="left_column"><span id="lemma_box" class="box">Lemma translation</span><span id="multiword_box" class="box">Multiword</span><span id="context_box" class="box" title="not yet implemented">Context translation</span><span id="morph_box" class="box" title="not yet implemented">Morphology</span><span id="accent_box" class="box" title="not yet implemented">Accentology</span></div><div id="right_column"><div id="right_header"><textarea id="lemma_tag" spellcheck="false"></textarea></div><div id="right_body"><textarea id="lemma_textarea" autocomplete="off"></textarea></div><div id="right_footer"><span id="pos_tag_box"></span><div id="meaning_no_box"><div id="meaning_leftarrow" class="nav_arrow"><</div><div id="meaning_no">Meaning <span id="number"></span></div><div id="meaning_rightarrow" class="nav_arrow">></div></div><div id="save_and_delete_box"><div id="save_button">Save</div><div id="delete_lemma_button">Delete</div></div></div></div></div></div>'*/fullscreen_annot_box_html);

  if(lang_id == 10) {
    annot_box.getElementById("lemma_tag").addEventListener('beforeinput', oldEnglishInput);
  }
  if(display_word.dataset.multiword !== undefined) {
    annot_box.getElementById("edit_button").style.visibility = "hidden";
  }
  document.getElementById('spoofspan').after(annot_box);
};

const delAnnotate = function (total = true) {
  display_word.classList.remove("mw_current_select");
  if(total){
    let annot_box = document.getElementById('annot_box');
    display_word.classList.add("tooltip");
    display_word.classList.remove("tooltip_selected");
    //display_word.onclick = showAnnotate;
    display_word = null;
    //tokno_current and word_engine_id are not set to zero by delAnnotate() because certain AJAX requests which require these values can run after delAnnotate() (e.g. lemmaRecordTooltipUpdate, which runs after the lemmaRecord AJAX request resolves), or code to add/remove event-listeners from elements with data-attributes of these numbers is only run after AJAX requests return, whereas delAnnotate() is often run immediately to prevent the poor user-experience of having the annotation-box hang around for the brief period during which the network-request completes (though on localhost on a modern computer with an SSD this is always sub 30ms)
    annot_box.remove();
  }

  lemma_id = 0;
  lemma_meaning_no = 1;
  multiword_id = 0;
  multiword_meaning_no = 1;

  meanings = Object.create(null);
  multiword_meanings = Object.create(null);
  multiword_indices = Object.create(null);

  document.querySelectorAll('.mw_selectable').forEach(mws => {
    mws.classList.remove("mw_selectable", "mw_current_select");
    mws.removeEventListener('click', selectMultiword);
  });
  document.querySelectorAll('.multiword').forEach(mw => {
    //mw.onclick = showMultiwordAnnotate;
    mw.addEventListener('click', showMultiwordAnnotate);
    mw.addEventListener('mouseover', underlineMultiwords);
    mw.addEventListener('mouseout', removeUnderlineMultiwords);
  });
  annotation_mode = 0;
  pos = 1;
  pos_initial = 1;

};

//this is stolen
const makeDraggable = function () {
  dragAnnotBox(document.getElementById("annot_box"));

  function dragAnnotBox(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById("annot_topbar")) {
      /* if present, the header is where you move the DIV from:*/
      document.getElementById("annot_topbar").onmousedown = dragMouseDown;
    } else {
      /* otherwise, move the DIV from anywhere inside the DIV:*/
      elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
      elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  document.getElementById('annot_topbar').style.cursor = 'move';

};

let diff_unexplicit_annot = true;
const differentiateAnnotations = function () {
  if(diff_unexplicit_annot) {
    document.getElementById("lemma_set_style").href = "lemma_set.css";
    diff_unexplicit_annot = false;
  }
  else {
    document.getElementById("lemma_set_style").href = "lemma_set_unexplicit.css";
    diff_unexplicit_annot = true;
  }

};


/*
  window.addEventListener("keydown", event => {
    if (event.repeat) {return;}
    if (event.key == "c") {
      document.getElementById("tt_styles").href = "tooltip_edit.css";
    }
  });

  window.addEventListener("keyup", event => {
    var spanDisplay = spoofspan.style.display;
    if (event.key == "c") {

      if(spanDisplay == 'inline') { document.getElementById("tt_styles").href = "tooltip_eng_style_2.css"; }
      else { document.getElementById("tt_styles").href = "tooltip_none_style_2.css";}
    }
  }); */

const keyboard_tt = (event) => {
  if(display_word != null || displayWordEditor.edit_mode) return;
  if(event.key == "T") {
    if(document.getElementById("tt_toggle").checked == false) document.getElementById("tt_toggle").checked = true;
    else document.getElementById("tt_toggle").checked = false;
    tt_type();
    //console.log("shit and T down");
  }

};
window.addEventListener("keydown", event1 => {
  if(event1.key == "Shift") {
    window.addEventListener("keydown", keyboard_tt);
    //console.log("shift down");
  }
});
window.addEventListener("keyup", event1 => {
  if(event1.key == "Shift") {
    window.removeEventListener("keydown", keyboard_tt);
    //console.log("shift up");
  }
});

const underlineMultiwords = function (event) {
  (document.querySelectorAll('[data-multiword="'+event.target.dataset.multiword+'"]').forEach(multiword =>  {multiword.style.borderBottom = "2px solid rgb(0, 255, 186)";})); 
};

const removeUnderlineMultiwords = function (event) {
  (document.querySelectorAll('[data-multiword="'+event.target.dataset.multiword+'"]').forEach(multiword =>  {multiword.style.borderBottom = "2px dotted rgb(0, 255, 186, 0.5)";})); 
};

document.querySelectorAll('.multiword').forEach(multiword => {
  //multiword.onclick = showMultiwordAnnotate;
  multiword.addEventListener('click', showMultiwordAnnotate);
  multiword.addEventListener('mouseover', underlineMultiwords);
  multiword.addEventListener('mouseout', removeUnderlineMultiwords);
});

if(document.getElementById("textbody") !== null) document.getElementById("textbody").addEventListener('click', showAnnotate);

const ttPosition = function () {
  const viewport_width = window.visualViewport.width;
  if(viewport_width > 768) return;

  const tooltips = document.body.querySelectorAll(".lemma_tt, .mw_tt");
  
  tooltips.forEach(tooltip => {

    tooltip.style.transform = "none";
    tooltip.style.border = "none";
    
    let rectRight = tooltip.getBoundingClientRect().right;
    let right_overflow = rectRight - viewport_width;
    let rectLeft = tooltip.getBoundingClientRect().left;
    let left_overflow = -1*rectLeft;


    //console.log("right overflow: "+right_overflow);
    if(right_overflow > 0) {
    tooltip.style.transform = `translateX(${-1*right_overflow - 1}px)`;
    //tooltip.style.border = "1px solid red";
    }
    else if(left_overflow > 0) {
      tooltip.style.transform = `translateX(${left_overflow + 1}px)`;
    }
    
      /* console.log(tooltip);
      console.log(rectRight);
      console.log(right_overflow);
      console.log(viewport_width); */

  });

};

window.addEventListener("resize", ttPosition);


const pullInMultiwordByForm = (can_skip = true) => {
  const candidate_mw_lemma_form = document.getElementById('lemma_tag').value.trim();
  const mw_length = Object.keys(multiword_indices).length;

  if(candidate_mw_lemma_form == lemma_form_tag_initial && can_skip) return;

  let send_data = "mw_length="+mw_length+"&mw_lemma_form="+encodeURIComponent(candidate_mw_lemma_form)+"&lang_id="+lang_id;
  if(pos == pos_initial) {
    send_data += "&pos=0";
  }
  else {
    send_data += "&pos=" + pos;
  }
 
  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", "pull_mw_by_form.php", true);
  xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhttp.responseType = 'json';
  
  xhttp.onreadystatechange = () => {
    if (xhttp.readyState == 4) {
      lemma_form_tag_initial = candidate_mw_lemma_form;

      const returned_multiword_id = xhttp.response.multiword_id;

      
      if(returned_multiword_id == 0) {
        return;
      }
      multiword_id = returned_multiword_id;
      console.log(xhttp.response);
      pos = xhttp.response.pos; //I've omitted the quotes round the numbers in the JSON-response so I reckon it should come through as an int type already
      pos_initial = pos;
      const multiword_textarea_content = xhttp.response.multiword_textarea_content;
      
      multiword_meaning_no = 1;      
      multiword_meanings = Object.create(null);
      multiword_meanings[multiword_meaning_no] = multiword_textarea_content;

      document.getElementById('pos_tag_box').innerHTML = choosePoS(pos);
      document.getElementById("number").innerHTML = multiword_meaning_no;
      reactivateArrows(multiword_meaning_no, 5);
      document.getElementById('lemma_textarea').value = multiword_textarea_content;

    }
  }
  xhttp.send(send_data);  
};

const removePoSMenu = () => {
  document.querySelectorAll('.pos_tag_select').forEach(pos_select => {
    pos_select.remove();
  });        
};
const setPoSEventListenersClosedMenu = () => {
  const pos_tag_box = document.getElementById('pos_tag_box');
  pos_tag_box.removeEventListener('click', changePoS);
  pos_tag_box.removeEventListener('touchstart', changePoS); //remove both events to be on the safeside incase someone has changed their screen-width
  pos_tag_box.addEventListener('click', selectPoS);
  pos_tag_box.addEventListener('touchstart', selectPoS);
};
const setPoSEventListenersOpenedMenu = (event_type) => {
  const pos_tag_box = document.getElementById('pos_tag_box');
  pos_tag_box.removeEventListener('click', selectPoS);
  pos_tag_box.removeEventListener('touchstart', selectPoS);
  pos_tag_box.addEventListener(event_type, changePoS); //we need to prevent changePoS from firing due to the click-event which happens after you release the touch-event
};











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
  setLemmaTagSize();
};





class DisplayWordEditor {
    
  edit_mode = false;
  wordElement = null;
  wordContent = "";
  originalWordContent = "";
  cursor_position = 0;

  //class methods have to be arrow functions to ensure that 'this' is always bound to their parent class-instance, otherwise when calling these methods from an eventListener the 'this' gets bound instead to the element which received the event
  startEditing = () => {
    this.wordElement = display_word;
    if(this.wordElement.dataset.multiword !== undefined) {
      this.wordElement = null;
      return;
    }
    delAnnotate();
    this.edit_mode = true;
    this.wordElement.classList.remove("tooltip");
    this.wordElement.classList.add("tooltip_selected");
    document.getElementById("dict_searchbox").disabled = true;

    this.wordElement.classList.add("edit-displayWord");
    this.wordContent = this.wordElement.firstChild.textContent;
    this.originalWordContent = this.wordContent;    
    this.cursor_position = this.wordContent.length;

    this.flashLetter();
    window.addEventListener('keydown', this.moveCursor);
    window.addEventListener('keydown', this.saveEdit);
    window.addEventListener('dblclick', this.saveEdit);
  };

  stopEditing = () => {
    
    this.edit_mode = false;
    document.getElementById("dict_searchbox").disabled = false;
    this.wordContent = "";
    this.originalWordContent = "";
    this.cursor_position = 0;

    window.removeEventListener('keydown', this.moveCursor);
    window.removeEventListener('keydown', this.saveEdit);
    window.removeEventListener('dblclick', this.saveEdit);
    
    this.unflashLetter();
    this.flashBorder(false);

    this.wordElement.classList.remove("edit-displayWord");
    this.wordElement.classList.add("tooltip");
    this.wordElement.classList.remove("tooltip_selected");
    this.wordElement = null;
    
    
  };

  saveEdit = (event) => {
    if((event.type == 'dblclick' && event.target.classList.contains("edit-displayWord") == false) || (event.type == 'keydown' && event.key == 'Enter')) {
      if(this.wordContent.trim() == "") return;
      if(this.wordContent == this.originalWordContent) {
        this.stopEditing();
        return;
      }
      else {
        this.updateDisplayWord(this.getWordEngForm(this.wordContent));
        //this.stopEditing(); //needs to move to updateDisplayWord() because I need access to this.wordElement upon completion of the request
      }
    }
  };

  updateDisplayWord = (new_wordEngWord) => {
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", "update_displayWord.php", true)
    xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.responseType = 'json';
    let post_data = "edit_tokno="+tokno_current+"&current_word_eng_id="+word_engine_id+"&lang_id="+lang_id+"&new_displayWord="+encodeURIComponent(this.wordContent.trim())+"&new_wordEngWord="+encodeURIComponent(new_wordEngWord.trim());
    
    xhttp.onreadystatechange = () => {     
      if(xhttp.readyState == 4) {
        const json_response = xhttp.response;
        this.wordElement.dataset.word_engine_id = json_response.new_word_eng_id;
        const new_first_lemma_id = json_response.new_first_lemma_id;
        
        if(tooltips_shown && this.wordElement.classList.contains("lemma_set_unexplicit")) {
          this.wordElement.lastChild.remove();
        };
        this.wordElement.classList.remove("lemma_set", "lemma_set_unexplicit");
        //only for when tooltips_shown and when the word has lemma_set_unexplicit class 
        if(new_first_lemma_id != 0) {
          this.wordElement.classList.add("lemma_set_unexplicit");
          if(tooltips_shown) {
            const lemma_tt_box = document.createRange().createContextualFragment('<span class="lemma_tt" onclick="event.stopPropagation()"><span id="tt_top"><div class="lemma_tag_tt">'+json_response.lemma_tt_data[0]+'</div><span id="pos_tag_box_tt">'+tt_pos_arr[json_response.lemma_tt_data[2]]+'</span></span><span id="tt_mid"><div id="tt_meaning">'+json_response.lemma_tt_data[1]+'</div></span><span id="tt_bottom"></span></span>');

            this.wordElement.append(lemma_tt_box);
          }
        }
        this.stopEditing();
      }
    }
    xhttp.send(post_data);

    //console.log("updateDisplayWord() called with post_data: ", post_data);
  };

  moveCursor = (event) => {
    if(event.type == 'keydown') {
      if(event.key == 'Enter' || event.key == ' ' || event.key == 'Tab' || event.key == 'Spacebar') {
        event.preventDefault();
        return;
      }
      else {
        if(event.key == 'Delete' && this.cursor_position < this.wordContent.length) {
          this.unflashLetter();
          this.wordContent = this.wordContent.slice(0, this.cursor_position)+this.wordContent.slice(this.cursor_position + 1);
          this.flashLetter();
        }
        else if(event.key == 'Backspace' && this.cursor_position > 0) {
          
          this.unflashLetter();
          this.wordContent = this.wordContent.slice(0, this.cursor_position - 1)+this.wordContent.slice(this.cursor_position);
          this.cursor_position--;
          this.flashLetter();
        }
        else if(event.key == 'ArrowLeft' && this.cursor_position > 0) {
          this.unflashLetter();
          this.cursor_position--;
          this.flashLetter();
        }
        else if(event.key == 'ArrowRight') {
          if(this.cursor_position == this.wordContent.length) return;
          this.unflashLetter();
          this.cursor_position++;
          this.flashLetter();
        }
        else if(this.makeRegex().test(event.key)) {
          //console.log(event.key);
          let character = event.key
          if(lang_id == 10) {
              const OE_array = this.oldEnglishify(character);
              if(OE_array[0] == true) window.dispatchEvent(new KeyboardEvent('keydown', {key: 'Backspace'}));
              character = OE_array[1];
          }
          if(character == "") return;
          this.insertChar(character);
        }
      }
      if(this.cursor_position == 0) this.flashBorder(true);
      else this.flashBorder(false);
    }
  };

  insertChar = (character) => {
    this.unflashLetter();
    this.wordContent = this.wordContent.slice(0, this.cursor_position)+character+this.wordContent.slice(this.cursor_position);
    this.cursor_position++;
    this.flashLetter();
  };

  flashBorder = (on) => {
    if(on == true) this.wordElement.style.animation = "border-left-flash 0.9s steps(1, jump-start) infinite";
    else this.wordElement.style.animation = "";
  };

  flashLetter = () => {
    if(this.cursor_position == 0) {
      this.wordElement.firstChild.remove();
      this.wordElement.prepend(this.wordContent.slice(this.cursor_position, this.wordContent.length));
    }
    else {
      const flashingLetterNode = document.createRange().createContextualFragment("<span id=\"edit-letter\">"+this.wordContent.slice(this.cursor_position - 1, this.cursor_position)+"</span>");
      
      if(this.cursor_position == 1) {
        this.wordElement.firstChild.remove();
        this.wordElement.prepend(flashingLetterNode);
        this.wordElement.firstChild.after(this.wordContent.slice(this.cursor_position, this.wordContent.length));
      }
      else {
        this.wordElement.firstChild.textContent = this.wordContent.slice(0, this.cursor_position - 1);        
        this.wordElement.firstChild.after(flashingLetterNode);
        
          if(this.wordContent.length - this.cursor_position > 0) {
            this.wordElement.childNodes[1].after(this.wordContent.slice(this.cursor_position, this.wordContent.length));
          }
      }
    }
  };

  unflashLetter = () => {
    let newWordContent = "";
    Array.from(this.wordElement.childNodes).forEach(childNode => {
      if(childNode.className != "lemma_tt") {
        newWordContent += childNode.textContent;
        childNode.remove();
      }
    });
    this.wordElement.prepend(newWordContent);
  };

  oldEnglishify = (key_pressed) => {
    console.log("oldEnglishify() called");
    const last_letter = this.wordContent.slice(this.cursor_position -1, this.cursor_position);
  
    const digraph = (base_letter, replacement_upper, replacement_lower) => {
      return (base_letter == base_letter.toUpperCase()) ? replacement_upper : replacement_lower;
    };
  
    if(key_pressed == 'w' || key_pressed == 'W' || key_pressed == 'g' || key_pressed == 'G') {
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
      return [false, new_letter];
    }
    else if(key_pressed == ":") {
      let long_vowel = '';
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
          return [false, ""];		
      }
      if(long_vowel != '') {
        return (upper_case) ? [true, long_vowel.toUpperCase()] : [true, long_vowel];
      }
    }
  
    else {
      let digraph_letter = "";
      if(key_pressed == 'e' && last_letter.toLowerCase() == 'a') {
        digraph_letter = digraph(last_letter, 'Æ', 'æ');
      }
      else if(key_pressed == 'h' && last_letter.toLowerCase() == 't') {
        digraph_letter = digraph(last_letter, 'Þ', 'þ');
      }
      else if(key_pressed == 'h' && last_letter.toLowerCase() == 'd') {
        digraph_letter = digraph(last_letter, 'Ð', 'ð');
      }
      else if(key_pressed == 'j' && last_letter.toLowerCase() == 'c') {
        digraph_letter = digraph(last_letter, 'Ċ', 'ċ');
      }
      else if(key_pressed == 'j' && last_letter.toLowerCase() == 'g') {
        digraph_letter = digraph(last_letter, 'Ġ', 'ġ');
      }
  
      if(digraph_letter == "") return [false, key_pressed];
      else return [true, digraph_letter];
    }
  };

  makeRegex = () => {
    if(lang_id == 10) return new RegExp(/^(\p{L}|:)$/u);
    else return new RegExp(/^\p{L}$/u);
  };

  makeLocale = () => {
    if(lang_id == 7) return "tr";
    else if(lang_id == 12) return "az";
    else return "en-US";
  };

  getWordEngForm = (display_word_form) => {
    let word_eng_form = "";
    if(lang_id == 10) {
      word_eng_form = display_word_form.toLowerCase().replaceAll('þ', 'ð');
      if(word_eng_form.startsWith('ð')) word_eng_form = 'þ'+word_eng_form.slice(1);
      return word_eng_form;
    }
    else return display_word_form.toLocaleLowerCase(this.makeLocale());
  };

}
const displayWordEditor = new DisplayWordEditor();