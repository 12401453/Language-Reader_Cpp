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