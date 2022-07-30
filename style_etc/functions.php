    <script>

 window.addEventListener("resize", ttPosition);

    var t_type = 0;

   function ttPosition() {
     if(t_type < 4) {return; }
      const tooltip5s = document.body.getElementsByClassName(`tooltiptext${t_type}`);
      const viewport_width = window.visualViewport.width;
      console.log(viewport_width);
       for (var tt_num in tooltip5s) {
        let etym_tt = tooltip5s[tt_num];
        etym_tt.style.transform = "none";
        etym_tt.style.border = "none";
        let rectRight = etym_tt.getBoundingClientRect().right;
        let right_overflow = rectRight - viewport_width + 3;
        if (right_overflow > 0) {
       etym_tt.style.transform = `translateX(-${right_overflow}px)`;
       etym_tt.style.border = "1px solid red";

        }

       console.log(etym_tt);
      console.log(rectRight);
      console.log(right_overflow);
       console.log(viewport_width);

      }

    }

    function tt_type() {
      t_type = document.getElementById("type_select").value;
      if (t_type == 0) {
        document.getElementById("tt_styles").setAttribute("href", "/style_etc/tooltip_none_style.css");
        $( ".tooltip" ).removeClass("highlighted");
      }

      else if (t_type == 1) {
       document.getElementById("tt_styles").setAttribute("href", "/style_etc/tooltip_Cyr_style.css");
       $( ".tooltip" ).removeClass("highlighted");

      }

      else if (t_type == 2) {
        document.getElementById("tt_styles").setAttribute("href", "/style_etc/tooltip_Glag_style.css");
        $( ".tooltip" ).removeClass("highlighted");

      }

      else if (t_type == 3) {
        document.getElementById("tt_styles").setAttribute("href", "/style_etc/tooltip_CS_style.css");
        $( ".tooltip" ).removeClass("highlighted");

      }

      else if (t_type == 4) {
        document.getElementById("tt_styles").setAttribute("href", "/style_etc/tooltip_eng_style.css");
        $( ".tooltip" ).removeClass("highlighted");
        $( ".tooltip" ).has(".tooltiptext4").addClass("highlighted");
        $(document).ready(ttPosition);
        window.dispatchEvent(new Event('resize'));

      }

      else if (t_type == 5) {
        document.getElementById("tt_styles").setAttribute("href", "/style_etc/tooltip_etym_style.css");
        $( ".tooltip" ).removeClass("highlighted");
        $( ".tooltip" ).has(".tooltiptext5").addClass("highlighted");
        $(document).ready(ttPosition);
        window.dispatchEvent(new Event('resize'));
      }

      else if (t_type == 6) {
        document.getElementById("tt_styles").setAttribute("href", "/style_etc/tooltip_loan_style.css");
        $( ".tooltip" ).removeClass("highlighted");
        $( ".tooltip" ).has(".tooltiptext6").addClass("highlighted");
        $(document).ready(ttPosition);
        window.dispatchEvent(new Event('resize'));
      }
    }


scrollFunction();

    </script>
