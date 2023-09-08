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