
function tt_type() {
  if(tooltips_shown) {
    let lemma_tooltips = document.querySelectorAll('.lemma_tt');
    lemma_tooltips.forEach(lemma_tooltip => {
      lemma_tooltip.remove();
    });
    tooltips_shown = false;
  }
  else {
    document.getElementById("tt_toggle").disabled = true;
    lemmaTooltip();
    tooltips_shown = true; //redundant but done incase the AJAX request in lemmaTooltips() fails
  }
}

let lang_id = 0;

function setLangId() {
  let textselect_value = document.getElementById('textselect').value;
  let post_data = "textselect=" + textselect_value;
  const httpRequest = (method, url) => {

    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhttp.onreadystatechange = () => {

      if (xhttp.readyState == 4) {
        lang_id = Number(xhttp.responseText);
        console.log(lang_id);
      }

    }

    xhttp.send(post_data);

  }

  httpRequest("POST", "get_lang_id.php");

}

function selectText() {
  
  setLangId();

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
         
          //experiment
          let tt_btns = document.querySelectorAll('.tooltip');

          tt_btns.forEach(tt_btn => {
            tt_btn.onclick = showAnnotate;
          });
           //experiment
          let pagenos = document.querySelectorAll('.pageno');
          pagenos.forEach(pageno => {
            if(Number(pageno.innerHTML) == 1) {
              pageno.classList.add("current_pageno");
            }
          }); 
          if(tooltips_shown) {
            lemmaTooltip();
          }

          loadingbutton.remove();
          

        }
     
      }

      xhttp.send(post_data);

}

  httpRequest("POST", "retrieve_text.php");

}

function selectText_splitup(dt_start, dt_end, page_cur) {

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
          //experiment
          let tt_btns = document.querySelectorAll('.tooltip');

          tt_btns.forEach(tt_btn => {
            tt_btn.onclick = showAnnotate;
          });
           //experiment
          if(tooltips_shown) {
            lemmaTooltip();
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

  let newtext_raw = document.getElementById('newtext').value.trim();
  let text_title_raw = document.getElementById('text_title').value.trim();
  if(text_title_raw == '' && newtext_raw == '') { return; }
  if(text_title_raw == '') { alert("Do not leave Text Title blank"); return; }
  if(newtext_raw == '') {alert("You cannot submit a blank text"); return; }
  let words = newtext_raw.split(' ');
  let word_count = words.length;

  let newtext = encodeURIComponent(newtext_raw);
 
  
  let text_title = encodeURIComponent(text_title_raw);
  let langselect = document.getElementById('langselect').value;

  
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
      location.reload(); /* window.open("update_db.php"); */
    }
  }
   xhttp.send(send_data);
 }

 httpRequest("POST", "update_db.php"); //SHOULD BE update_db.php
 // for(let x = 150; x > 0; x--) {
 //progressBar(word_count);
 
}



function clearTable() {
  
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
  let textselect_value = document.getElementById('textselect').value;
  if(textselect_value == 0) { return;}
  
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


 function texts_link() {
   window.location = "/text_viewer";
 }
 function add_text_link() {
  window.location = "/add_texts";
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
  switch (this.id) {
    case "noun_pos":
      document.getElementById('pos_tag_box').innerHTML = noun_pos;
      pos = 1;
      pullInLemma(false);
      break;
    case "verb_pos":
      document.getElementById('pos_tag_box').innerHTML = verb_pos;
      pos = 2;
      pullInLemma(false);
      break;
    case "adj_pos":
      document.getElementById('pos_tag_box').innerHTML = adj_pos;
      pos = 3;
      pullInLemma(false);
      break;  
    case "adverb_pos":
      document.getElementById('pos_tag_box').innerHTML = adverb_pos;
      pos = 4;
      pullInLemma(false);
      break;
    case "prep_pos":
      document.getElementById('pos_tag_box').innerHTML = prep_pos;
      pos = 5;
      pullInLemma(false);
      break;
    case "conj_pos":
      document.getElementById('pos_tag_box').innerHTML = conj_pos;
      pos = 6;
      pullInLemma(false);
      break;  
    case "part_pos":
      document.getElementById('pos_tag_box').innerHTML = part_pos;
      pos = 7;
      pullInLemma(false);
      break;
    case "ques_pos":
      document.getElementById('pos_tag_box').innerHTML = ques_pos;
      pos = 8;
      pullInLemma(false);
      break;
  }
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
  document.getElementById('save_button').onclick = "";
  const httpRequest = (method, url) => {
    let send_data = "lemma_form=" + encodeURIComponent(lemma_form.replaceAll("'", "''")) + "&lemma_meaning_no=" + lemma_meaning_no + "&pos=";
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
        lemma_id = json_response.lemma_id;
        meanings = {};
        if(lemma_id != null) {
          
          let new_lemma_textarea_content = json_response.lemma_textarea_content;
          if(new_lemma_textarea_content != "") {
            meanings[lemma_meaning_no] = new_lemma_textarea_content;
          }
          lemma_textarea_content_initial = new_lemma_textarea_content;
          document.getElementById("lemma_textarea").value = new_lemma_textarea_content;

          pos = Number(json_response.pos);
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
        let response_meaning = xhttp.response;
        console.log(response_meaning);
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
 /* else if (lemma_id != 0) {  */
  document.getElementById("lemma_textarea").value = meanings[lemma_meaning_no] == undefined ? "" : meanings[lemma_meaning_no];
  // }
  
};
//this is just placeholder
const disRegard = function () {
  const httpRequest = (method, url) => {


    let send_data = "word_engine_id=" + word_engine_id + "&tokno_current=" + tokno_current;

    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, true);
    xhttp.responseType = 'json';
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhttp.onload = () => {
      console.log("sent");
      // console.log(xhttp.responseText);
      if (xhttp.readyState == 4) {
        let json_response = xhttp.response;
        console.log(json_response);
        console.log(json_response.word); //the keys in the JSON string have to be in quotes, but as members of the json object they are just retrievable as if the key-name were a variable name. It also works as json_response["word"].


      }
    }
    xhttp.send(send_data);
  }

  httpRequest("POST", "json_test.php");
};

const lemmaRecord = function () {
  if(document.getElementById("lemma_textarea").value.trim() != "" || meanings[lemma_meaning_no] != undefined) {
    meanings[lemma_meaning_no] = document.getElementById("lemma_textarea").value;
  }
  
  let clicked_lemma_meaning_no = lemma_meaning_no;
  let meanings_length = Object.keys(meanings).length;
  let count = 1;
  for (let lemma_meaning_no in meanings) {
    lemma_meaning = meanings[lemma_meaning_no];
    
    const httpRequest = (method, url) => {

    let lemma_form = encodeURIComponent(document.getElementById('lemma_tag').value.trim().replaceAll("'", "''"));
    lemma_meaning = encodeURIComponent(lemma_meaning.replaceAll("'", "''")); //the .replaceAll() here is specific to the C++ version because SQLite escapes single-quotes by doubling them

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
  document.getElementById('annot_box').remove();
  display_word.classList.add("tooltip");
  display_word.classList.remove("tooltip_selected");
  meanings = {};
};

const lemmaDelete = function () {
  const httpRequest = (method, url) => {

    let send_data = "lemma_id="+lemma_id+"&word_engine_id="+word_engine_id+"&tokno+current="+tokno_current;

    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.responseType = 'text';

    xhttp.onload = () => {
      if(xhttp.readyState == 4) {
        let lemma_still_set = xhttp.responseText.trim() == "0" ? false : true;

        console.log('Lemma deleted');
        document.getElementById('annot_box').remove();
        display_word.classList.add("tooltip");
        display_word.classList.remove("tooltip_selected");
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

        if(tooltips_shown) {
          lemmaTooltip();
        }
      }
    }
    xhttp.send(send_data);
  };
  httpRequest("POST", "lemma_delete.php");
  meanings = {};

};

const setLemmaTagSize = function () {
  let lemma_tag = document.getElementById('lemma_tag');
  let hidden_lemma_tag = document.getElementById('hidden_lemma_tag');

  hidden_lemma_tag.innerHTML = lemma_tag.value;

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
        json_lemma_transes = xhttp.response;
       // console.log(json_lemma_transes);
        if(json_lemma_transes == null) {
         return;
        }
        let i = 0;
        lemma_set_words.forEach(lemma_set_word => {
          json_pos = Number(json_lemma_transes[i].pos);

          let lemma_tt_box = '<span class="lemma_tt" onclick="event.stopPropagation()"><span id="tt_top"><div class="lemma_tag_tt">'+json_lemma_transes[i].lemma_form+'</div><span id="pos_tag_box_tt">'+tt_pos_arr[json_pos]+'</span></span><span id="tt_mid"><div id="tt_meaning">'+json_lemma_transes[i].lemma_trans+'</div></span><span id="tt_bottom"></span></span>';

          lemma_set_word.innerHTML = lemma_set_word.innerHTML + lemma_tt_box;
          i++;
        });
        document.getElementById("tt_toggle").disabled = false;
      }

    }
    xhttp.send(send_data);
  };
  httpRequest("POST", "lemma_tooltip.php");

};

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
        json_lemma_transes = xhttp.response;
       // console.log(json_lemma_transes);
        if (json_lemma_transes == null) {
          return;
        }
        let i = 0;
        current_words.forEach(current_word => {
          json_pos = Number(json_lemma_transes[i].pos);

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


let pos = 1;
let lemma_form_tag_initial = "";
let lemma_textarea_content_initial = "";
let lemma_meaning_no = 1;
let lemma_id = 0;
let meanings = {};
let tooltips_shown = false;
let pos_initial = 1;

let display_word;
let tokno_current = 0;
let word_engine_id = 0;


function showAnnotate(event) {
  meanings = {};
   
  display_word = event.target;
  tokno_current = event.target.dataset.tokno;
    
  let previous_selections = document.querySelectorAll('.tooltip_selected');
  previous_selections.forEach(previous_selection => {
    previous_selection.classList.add("tooltip");
    previous_selection.classList.remove("tooltip_selected");
  });
  display_word.classList.add("tooltip_selected");
  display_word.classList.remove("tooltip");

  word_engine_id = event.target.dataset.word_engine_id;
  console.log(word_engine_id);

  const httpRequest = (method, url) => {

    let send_data = "word_engine_id="+word_engine_id+"&tokno_current="+tokno_current+"&lang_id="+lang_id;
 
    const xhttp = new XMLHttpRequest();
    xhttp.open(method, url, true);
    xhttp.responseType = 'json';
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
 
    xhttp.onload = () => {
      console.log("sent");
    // console.log(xhttp.responseText);
      if(xhttp.readyState == 4)  {

        let json_response = xhttp.response;
        let lemma_tag_content = json_response.lemma_tag_content;
        lemma_form_tag_initial = lemma_tag_content;
        let lemma_textarea_content = json_response.lemma_textarea_content;
        lemma_textarea_content_initial = lemma_textarea_content;
        let lemma_textarea_content_html = json_response.lemma_textarea_content_html;
        lemma_meaning_no = Number(json_response.lemma_meaning_no);
        lemma_id = Number(json_response.lemma_id);
        pos = Number(json_response.pos);
        pos_initial = pos;

        if(lemma_meaning_no != 0) {
          meanings[lemma_meaning_no] = lemma_textarea_content;
        }
        else {
          lemma_meaning_no = 1;
        }
        

        if(document.getElementById('annot_box') != null) {
          let annot_box = document.getElementById('annot_box');
          annot_box.remove();
        }

        let annot_box = document.createRange().createContextualFragment('<div id="annot_box" data-word_engine_id="' + word_engine_id +'"><div id="annot_topbar" ondblclick="makeDraggable()"><span id="close_button" onclick="delAnnotate()">Close</span><span id="disregard_button" title="Make this word unannotatable and delete it from the WordEngine (DOES NOTHING ATM)">Disregard</span></div><div id="annot"><div id="left_column"><span id="lemma_box" class="box">Lemma translation</span><span id="context_box" class="box" title="not yet implemented">Context translation</span><span id="morph_box" class="box" title="not yet implemented">Morphology</span><span id="multiword_box" class="box" title="not yet implemented">Multiword</span><span id="accent_box" class="box" title="not yet implemented">Accentology</span></div><div id="right_column"><div id="right_header"><textarea id="lemma_tag">'+lemma_tag_content+'</textarea></div><div id="right_body"><textarea id="lemma_textarea" autocomplete="off">'+lemma_textarea_content_html+'</textarea></div><div id="right_footer"><span id="pos_tag_box"></span><div id="meaning_no_box"><div id="meaning_leftarrow" class="nav_arrow"><</div><div id="meaning_no">Meaning <span id="number">'+lemma_meaning_no+'</span></div><div id="meaning_rightarrow" class="nav_arrow">></div></div><div id="save_and_delete_box"><div id="save_button">Save</div><div id="delete_lemma_button">Delete</div></div></div></div></div></div>');

        document.getElementById('spoofspan').after(annot_box);
        if(lemma_meaning_no == 1) {
          document.getElementById("meaning_leftarrow").classList.add("nav_arrow_deactiv");
          document.getElementById("meaning_leftarrow").classList.remove("nav_arrow");
        }
        else if (lemma_meaning_no == 10) {
          document.getElementById("meaning_rightarrow").classList.add("nav_arrow_deactiv");
          document.getElementById("meaning_rightarrow").classList.remove("nav_arrow");
        }

        if(lemma_id == 0) {
          document.getElementById('delete_lemma_button').style.display = "none";
        }
        document.getElementById('delete_lemma_button').onclick = lemmaDelete;

        document.getElementById('disregard_button').onclick = disRegard;
        document.getElementById('save_button').onclick = lemmaRecord;
        document.getElementById('meaning_leftarrow').onclick = switchMeaning;
        document.getElementById('meaning_rightarrow').onclick = switchMeaning;
        document.getElementById('lemma_tag').onblur = pullInLemma;

        let current_box = document.getElementById('lemma_box');

        let left_column = document.getElementById('left_column');

        left_column.onclick = function (event) {
          let target = event.target;
          if (target.className != 'box') return;

          selectBox(target);
        };

        function selectBox(box) {
          if (current_box) {
            current_box.style.color = "rgb(0 255 34 / 41%)";
            current_box.style.backgroundColor = "#172136";
          }
          current_box = box;
          current_box.style.color = "rgb(0, 255, 34)";
          current_box.style.backgroundColor = "#040a16";

          if(current_box.id == "lemma_box") {
            document.getElementById("right_body").style.visibility = "visible";
            document.getElementById("right_footer").style.visibility = "visible";
            document.getElementById('lemma_textarea').focus();
          }
          else {
            document.getElementById("right_body").style.visibility = "hidden";
            document.getElementById("right_footer").style.visibility = "hidden";
          }
        }
        

        //below does the same as above but less efficiently
      /* const panelSelect = function () {

          const boxes = document.querySelectorAll('.box');
          boxes.forEach(box => {
            box.style.color = "rgb(0 255 34 / 41%)";
            box.style.backgroundColor = "#172136";
            box.style.border = "none";
          });
          document.getElementById('lemma_textarea').focus();
          this.style.color = "rgb(0, 255, 34)";
          this.style.backgroundColor = "#040a16";

        }; 

        document.getElementById('lemma_box').onclick = panelSelect;
        document.getElementById('context_box').onclick = panelSelect;
        document.getElementById('morph_box').onclick = panelSelect;
        document.getElementById('multiword_box').onclick = panelSelect;
        document.getElementById('accent_box').onclick = panelSelect;  */
        
        document.getElementById('pos_tag_box').innerHTML = choosePoS(pos);
        
        document.getElementById('lemma_tag').oninput = setLemmaTagSize;
        setLemmaTagSize();
          
      }
     
   }
    xhttp.send(send_data);
  }
 
  httpRequest("POST", "retrieve_engword.php");

}

const delAnnotate = function () {
  let annot_box = document.getElementById('annot_box');

  let previous_selections = document.querySelectorAll('.tooltip_selected');
  previous_selections.forEach(previous_selection => {
    previous_selection.classList.add("tooltip");
    previous_selection.classList.remove("tooltip_selected");
  });
  meanings = {};
  annot_box.remove();
};

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

let diff_unexplicit_annot = false;
const differentiateAnnotations = function () {
  if(diff_unexplicit_annot) {
    document.getElementById("tt_styles").href = "tooltip_prevs.css";
    diff_unexplicit_annot = false;
  }
  else {
    document.getElementById("tt_styles").href = "tooltip_prevs_diff.css";
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