function showAnnotate(event) {
    meanings = {};
     
    display_word = event.target;
    tokno_current = event.target.dataset.tokno;
  
    let mw_page_index = event.target.dataset.multiword;
    if(mw_page_index != undefined) { box_no = 2;}
    else {box_no = 1;}
      
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
  
          let annot_box = document.createRange().createContextualFragment('<div id="annot_box" data-word_engine_id="' + word_engine_id +'"><div id="annot_topbar" ondblclick="makeDraggable()"><span id="close_button" onclick="delAnnotate()">Close</span><span id="disregard_button" title="Make this word unannotatable and delete it from the WordEngine (DOES NOTHING ATM)">Disregard</span></div><div id="annot"><div id="left_column"><span id="lemma_box" class="box">Lemma translation</span><span id="multiword_box" class="box" title="not yet implemented">Multiword</span><span id="context_box" class="box" title="not yet implemented">Context translation</span><span id="morph_box" class="box" title="not yet implemented">Morphology</span><span id="accent_box" class="box" title="not yet implemented">Accentology</span></div><div id="right_column"><div id="right_header"><textarea id="lemma_tag"></textarea></div><div id="right_body"><textarea id="lemma_textarea" autocomplete="off"></textarea></div><div id="right_footer"><span id="pos_tag_box"></span><div id="meaning_no_box"><div id="meaning_leftarrow" class="nav_arrow"><</div><div id="meaning_no">Meaning <span id="number">'+lemma_meaning_no+'</span></div><div id="meaning_rightarrow" class="nav_arrow">></div></div><div id="save_and_delete_box"><div id="save_button">Save</div><div id="delete_lemma_button">Delete</div></div></div></div></div></div>');

          document.getElementById('lemma_tag').value = lemma_tag_content;
          document.getElementById('lemma_textarea').value = lemma_textarea_content; //might be able to get rid of _html versions on back and frontend doing it this way
          

  
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
              box_no = 1;
              document.getElementById("right_body").style.visibility = "visible";
              document.getElementById("right_footer").style.visibility = "visible";
              document.getElementById('lemma_textarea').focus();
            }
            else if(current_box.id == "multiword_box") {
              box_no = 2;
              document.getElementById("right_body").style.visibility = "visible";
              document.getElementById("right_footer").style.visibility = "visible";
              document.getElementById('lemma_textarea').focus();
            }
            else {
              box_no = 0;
              document.getElementById("right_body").style.visibility = "hidden";
              document.getElementById("right_footer").style.visibility = "hidden";
            }
          }
                
          document.getElementById('pos_tag_box').innerHTML = choosePoS(pos);
          
          document.getElementById('lemma_tag').oninput = setLemmaTagSize;
          setLemmaTagSize();
            
        }
       
     }
      xhttp.send(send_data);
    }
    
    httpRequest("POST", "retrieve_engword.php");
  
  }