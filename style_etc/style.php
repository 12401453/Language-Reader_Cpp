
    <style>
      @font-face { font-family: Bukyvede; src: url('/Fonts/BukyVede-Regular.ttf'); }
      @font-face { font-family: Menaion; src: url('/Fonts/MenaionUnicode.otf'); }

      body {
        background-color: #f0c36dbd;
      }

      .non_latin {
        font-family: Bukyvede;
        display: inline-block;
        margin-left: 7.3%;
        margin-right: 7.3%;
        margin-bottom: 21px;
        padding-left: 6%;
        padding-right: 6%;
        border-radius: 6px;
        background-color: white;
    /*    border: 1px solid red; */
      }
      .latin {
        font-family: Calibri;
        line-height: 1.63;
        margin-left: 7.3%;
        margin-right: 7.3%;
        margin-bottom: 21px;
        padding-left: 6%;
        padding-right: 6%;
        border-radius: 6px;
        background-color: white;
      /*  border: 1px solid red; */
      }
.highlighted {
  color: red;
}

.go_green{
  background-color: #b3f7a6;
}
.latin_colour {
  background-color: #fff67d;
}
.germanic_colour {
  background-color: #ff6b66;
}
.greek_colour {
  background-color: #69d686;
}
.greek_hebrew_colour {
  background-color: #a1d669;
}
.germanic_latin_colour {
  background-color: #f76143;
}
.latin_hebrew_colour {
  background-color: #ffd27d;
}
.hebrew_colour {
  background-color: #fc8a58;
}
.turkic_colour {
  background-color: #ff82e4;
}
.germanic_greek_colour {
  background-color: #ff597a;
}
.finnic_colour {
  background-color: cyan;
}
.germanic_hebrew_colour {
  background-color: #ff3700;
}
.germanic_slavic_colour {
  background-color: #ff9591;
}
.turkic_mongol_colour {
  background-color: #f769ff;
}
.greek_latin_colour {
  background-color: #b2e312;
}

#tt_button {
  position: fixed;
  background-color: rgba(104,255,10,0.9);
  border-style: solid;
  border-radius: 2px;
  padding: 3px;
  right: 20%;
  bottom: 0;
  z-index: 1;

}




    </style>
    <script>
    function myFunction1() {
      var x = document.getElementById("cyr_kv");
      var y = document.getElementById("glag_kv");
      var z = document.getElementById("cs_kv");
      var undone = document.getElementById("undone");
      var undo_label = document.getElementById("undo_label");
      var redone = document.getElementById("redone");
      var redo_label = document.getElementById("redo_label");
          x.style.display = "inline-block";
        y.style.display = "none";
        z.style.display = "none";
        undone.style.display = "none";
        undo_label.style.display = "none";
        redone.style.display = "none";
        redo_label.style.display = "none";

    }
    function myFunction2() {
      var x = document.getElementById("cyr_kv");
      var y = document.getElementById("glag_kv");
      var z = document.getElementById("cs_kv");
      var undone = document.getElementById("undone");
      var undo_label = document.getElementById("undo_label");
      var redone = document.getElementById("redone");
      var redo_label = document.getElementById("redo_label");
          x.style.display = "none";
        y.style.display = "inline-block";
        z.style.display = "none";
        undone.style.display = "none";
        undo_label.style.display = "none";
        redone.style.display = "none";
        redo_label.style.display = "none";
      }

    function myFunction3() {
      var x = document.getElementById("cyr_kv");
      var y = document.getElementById("glag_kv");
      var z = document.getElementById("cs_kv");
      var undone = document.getElementById("undone");
      var undo_label = document.getElementById("undo_label");
      var redone = document.getElementById("redone");
      var redo_label = document.getElementById("redo_label");
          x.style.display = "none";
        y.style.display = "none";
        z.style.display = "inline-block";
        undone.style.display = "inline";
        undo_label.style.display = "inline";
        redone.style.display = "inline";
        redo_label.style.display = "inline";
      }

      function undoFunction() {
        var x = document.getElementsByClassName("undoneclass");
        var y = document.getElementsByClassName("redoneclass");
        var i;
        for (i = 0; i < x.length; i++) {
          x[i].style.display = "none";
        }
      for (i = 0; i < x.length; i++) {
      y[i].style.display = "inline";
      }
        }

  function redoFunction() {
    var x = document.getElementsByClassName("undoneclass");
    var y = document.getElementsByClassName("redoneclass");
    var i;
    for (i = 0; i < x.length; i++) {
      x[i].style.display = "inline";
    }
  for (i = 0; i < x.length; i++) {
  y[i].style.display = "none";
  }
    }

    $(document).ready(function(){
    $("#morph_highlight").prop('disabled', false);
     $("#morph_highlight").click(function(){
       $(".morph_replace").toggleClass("go_green");
     });
    });

    $(document).ready(function(){
      $("#loan_place").prop('disabled', false);
     $("#loan_place").click(function(){
       $(".loan_place3").toggleClass("latin_colour");
       $(".loan_place1").toggleClass("germanic_colour");
       $(".loan_place13").toggleClass("germanic_latin_colour");
       $(".loan_place2").toggleClass("greek_colour");
       $(".loan_place25").toggleClass("greek_hebrew_colour");
       $(".loan_place35").toggleClass("latin_hebrew_colour");
       $(".loan_place5").toggleClass("hebrew_colour");
       $(".loan_place7").toggleClass("turkic_colour");
       $(".loan_place12").toggleClass("germanic_greek_colour");
       $(".loan_place8").toggleClass("finnic_colour");
       $(".loan_place15").toggleClass("germanic_hebrew_colour");
       $(".loan_place10").toggleClass("germanic_slavic_colour");
       $(".loan_place79").toggleClass("turkic_mongol_colour");
       $(".loan_place23").toggleClass("greek_latin_colour");
     });
    });




    </script>
