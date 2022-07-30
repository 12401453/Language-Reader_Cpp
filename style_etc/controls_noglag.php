<div id="top_buttons"><button type="button" onclick="myFunction1(); ttPosition();">Switch to Cyrillic</button>
<button type="button" onclick="myFunction3(); ttPosition();">Switch to Common Slavic</button><br>

<input type="checkbox" id="morph_highlight" name="morph_highlight" disabled="disabled">
  <label for="morph_highlight">Highlight morphologically conditioned or other non-etymological development</label><br>
<input type="checkbox" id="loan_place" name="loan_place" disabled="disabled">
  <label for="loan_place">Show loanword origin</label></div>

  <input type="radio" id="undone" name="undone" onclick="undoFunction()" style="display: none">
    <label for="undone" id="undo_label" style="display: none">Undo morphologically conditioned or other non-etymological changes</label><br>
    <input type="radio" id="redone" name="undone" onclick="redoFunction()" style="display: none">
      <label for="redone" id="redo_label" style="display: none">Keep morphologically conditioned or other non-etymological changes</label>

<div id="tt_button"><label for="type_select" style="font-weight: bold">Tooltip:</label>
    <select id="type_select" name="tooltip_data" onchange="tt_type()">
      <option value="0">None</option>
      <option value="1">Cyrillic</option>

      <option value="3" selected="selected">Common Slavic</option>
      <option value="4">English</option>
      <option value="5">Etymology discussion</option>
      <option value="6">Loanword source</option>
    </select></div>
