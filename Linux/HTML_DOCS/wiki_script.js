let dict_result_Wk = Object.create(null);
const scrapeWiktionary = (Wk_html, Wk_langname) => {
  dict_result_Wk = {};

  const parser = new DOMParser();
  const Wk_page = parser.parseFromString(Wk_html, "text/html");

  if (Wk_page.getElementById(Wk_langname) == null) {
    console.log("No " + Wk_langname +" Definitions Found");
    return;
    
  }
  else {
    let pos = "";
    let langFlag = true; 
    let el = Wk_page.getElementById(Wk_langname).parentNode.nextElementSibling;
    console.log(Wk_langname + " Dictionary Entries Found:");
    
  
    while(el && langFlag) {
      if(el.nodeName != "H2") {

        flag = false;

        if (el.nodeName == "H4" || el.nodeName == "H3"){

          flag = flag || el.textContent.includes("Noun");
          flag = flag || el.textContent.includes("Verb");
          flag = flag || el.textContent.includes("Adverb");
          flag = flag || el.textContent.includes("Adjective");
          flag = flag || el.textContent.includes("Conjunction");
          flag = flag || el.textContent.includes("Preposition");
          flag = flag || el.textContent.includes("Interjection");
          flag = flag || el.textContent.includes("Particle");
          if(flag) {
            pos = el.querySelector(".mw-headline").textContent;
            console.log(pos);
          };
            
        } 

        if(el.nodeName == "OL") {
          let definition_array = new Array();
          
          el1 = el.firstElementChild;
          while (el1 != null) {
            let def = "";
    
            el1.childNodes.forEach(node => {
              if(node.nodeName == 'DL' || node.className == "nyms-toggle" || node.nodeName == 'UL' || node.className == "HQToggle" || node.nodeName == 'OL') {;}
              else if(node.className == "use-with-mention") {
                def += "[" + node.textContent + "]";
              }
              else {
                def += node.textContent;
              }
            });
            def = def.trim();
            //console.log(def);
            definition_array.push(def);
            el1 = el1.nextElementSibling;
          }
          dict_result_Wk[pos] = definition_array;       
        }
    
      }
      else { 
        langFlag = false;
      } 
      el = el.nextElementSibling;
    }
  }
};
 
