const mw_ttPosition = function () {

    const mw_tooltips = document.body.querySelectorAll(`.multiword`);
    const viewport_width = window.visualViewport.width;
  
    mw_tooltips.forEach(mw_tooltip => {

        mw_tooltip.style.transform = "none";
        mw_tooltip.style.border = "none";
        let rectRight = mw_tooltip.getBoundingClientRect().right;
        let right_overflow = rectRight - viewport_width + 3;
        console.log("right overflow: "+right_overflow);
        if(right_overflow > 0) {
        mw_tooltip.style.transform = `translateX(-${right_overflow}px)`;
        
        mw_tooltip.style.border = "1px solid red"; //remove after testing
        }
      

    });

  };
  
  window.addEventListener("resize", mw_ttPosition); 
