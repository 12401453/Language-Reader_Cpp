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



const addRow = () => {
    document.getElementById("words_body").appendChild(document.createRange().createContextualFragment('<div class="words_row"><div class="word_cell_left"><div class="pos_colour left adj"></div><div class="word_cell_lemma">hinanden</div><div class="pos_colour right adj"></div></div><div class="word_cell_right"></div></div>')); 
};

const addSubRow = (main_row_no) => {
    if(main_row_no < 1) return;
    let words_rows = document.getElementById("words_body").getElementsByClassName("words_row");
    if(words_rows.length < main_row_no) return;
    words_rows[main_row_no - 1].querySelector(".word_cell_right").appendChild(document.createRange().createContextualFragment(`<div class="word_cell_meaning_strip"><div class="meaning_no_box"><div class="meaning_no" title="Meaning number">${main_row_no}</div></div><div class="meaning_text">right side dummy meaning hahahaha you gormless wazzok</div></div>`));
};