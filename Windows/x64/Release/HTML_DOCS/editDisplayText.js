const makeRegex = () => {
    if(lang_id == 10) return new RegExp(/^(\p{L}|:)$/u);
    else return new RegExp(/^\p{L}$/u);
  };
  
  const editDisplayTextWord = () => {
    edit_mode = true;
    const wordElement = document.querySelector("[data-tokno='"+tokno_current+"']");
    delAnnotate(true);
    wordElement.classList.remove("tooltip");
    wordElement.classList.add("tooltip_selected");
    //wordElement.onclick = "";
  
    wordElement.classList.add("edit-displayWord");
    let wordContent = wordElement.childNodes[0].textContent;
    const originalWordContent = wordContent;
    const letterRegex = makeRegex();    
    let cursor_position = wordContent.length;
  
    const flashBorder = (on) => {
        if(on == true) wordElement.style.animation = "border-left-flash 0.9s steps(1, jump-start) infinite";
        else wordElement.style.animation = "";
    };
  
    const flashLetter = () => {
        if(cursor_position == 0) {
            wordElement.childNodes[0].remove();
            wordElement.prepend(wordContent.slice(cursor_position, wordContent.length));
        }
        else {
            const flashingLetterNode = document.createRange().createContextualFragment("<span id=\"edit-letter\">"+wordContent.slice(cursor_position - 1, cursor_position)+"</span>");
            
            if(cursor_position == 1) {
                wordElement.childNodes[0].remove();
                wordElement.prepend(flashingLetterNode);
                wordElement.childNodes[0].after(wordContent.slice(cursor_position, wordContent.length));
            }
            else {
                wordElement.childNodes[0].textContent = wordContent.slice(0, cursor_position - 1);
                wordElement.childNodes[0].after(flashingLetterNode);
                if(wordContent.length - cursor_position > 0) wordElement.childNodes[1].after(wordContent.slice(cursor_position, wordContent.length)); //probably dont need the if
            }
        }       
    };
  
    const unflashLetter = () => {
        let newWordContent = "";
        //make an Array to hold references to the childNodes and iterate through that instead of the actual NodeList, because we are changing the length of the NodeList by calling remove() and thus messing up any for-loops
        Array.from(wordElement.childNodes).forEach(childNode => {
            if(childNode.className != "lemma_tt") {
                newWordContent += childNode.textContent;
                childNode.remove();
            }
        });
        wordElement.prepend(newWordContent);
    };
  
    const insertChar = (character) => {
        //if(character == "") return;
        unflashLetter();
        wordContent = wordContent.slice(0, cursor_position)+character+wordContent.slice(cursor_position)
        cursor_position++;
        flashLetter();
    };
  
    flashLetter();
    const moveCursor = (event) => {
        if(event.type == 'keydown') {
            if(event.key == 'Enter' || event.key == ' ' || event.key == 'Tab' || event.key == 'Spacebar') {
                event.preventDefault();
                return;
            }
            else {
                if(event.key == 'Delete' && cursor_position < wordContent.length) {
                    unflashLetter();
                    wordContent = wordContent.slice(0, cursor_position)+wordContent.slice(cursor_position + 1);
                    flashLetter();
                }
                else if(event.key == 'Backspace' && cursor_position > 0) {
                    
                    unflashLetter();
                    wordContent = wordContent.slice(0, cursor_position - 1)+wordContent.slice(cursor_position);
                    cursor_position--;
                    flashLetter();
                }
                else if(event.key == 'ArrowLeft' && cursor_position > 0) {
                    unflashLetter();
                    cursor_position--;
                    flashLetter();
                }
                else if(event.key == 'ArrowRight') {
                    if(cursor_position == wordContent.length) return;
                    unflashLetter();
                    cursor_position++;
                    flashLetter();
                }
                else if(letterRegex.test(event.key)) {
                    //console.log(event.key);
                    let character = event.key
                    if(lang_id == 10) {
                        const OE_array = oldEnglishify(cursor_position, character, wordContent);
                        if(OE_array[0] == true) window.dispatchEvent(new KeyboardEvent('keydown', {key: 'Backspace'}));
                        character = OE_array[1];
                    }
                    if(character == "") return;
                    insertChar(character);
                }
            }
        }
        if(cursor_position == 0) flashBorder(true);
        else flashBorder(false);
    };
  
    window.addEventListener('keydown', moveCursor);
    
    const stopEditing = (event) => {
        if((event.type == 'dblclick' && event.target.classList.contains("edit-displayWord") == false) || (event.type == 'keydown' && event.key == 'Enter')) {
            
            window.removeEventListener('keydown', moveCursor);
            unflashLetter();
            window.removeEventListener('keydown', stopEditing);
            window.removeEventListener('dblclick', stopEditing);
            wordElement.classList.remove("edit-displayWord");
  
            wordElement.classList.add("tooltip");
            wordElement.classList.remove("tooltip_selected");
            //wordElement.onclick = showAnnotate;
            flashBorder(false);
            edit_mode = false;
        }
    }
    window.addEventListener('keydown', stopEditing);
    window.addEventListener('dblclick', stopEditing);
  };
  
  
  const oldEnglishify = (cursor_position, key_pressed, wordContent) => {
    const last_letter = wordContent.slice(cursor_position -1, cursor_position);
  
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
  