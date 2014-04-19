define([
  "jQuery",
  "utils/storage"
  ], function($, storage) {
  var fontState, toggle,bookBody,dropdown, book;

  var togglePopover = function(e) {
    dropdown.toggleClass("open");
    e.stopPropagation();
    e.preventDefault();
  };
  
  var closePopover = function(e) {
    dropdown.removeClass("open");
  }

  var enlargeFontSize = function(e){
    if (fontState.size < 4){
      bookBody.toggleClass("font-size-"+fontState.size);
      fontState.size++;
      bookBody.toggleClass("font-size-"+fontState.size);
      fontState.save();
    }
  };
  
  var reduceFontSize = function(e){
    if (fontState.size > 0){
      bookBody.toggleClass("font-size-"+fontState.size);
      fontState.size--;
      bookBody.toggleClass("font-size-"+fontState.size);
      fontState.save();
    }
  };

  var changeFontFamily = function(index,el){
      bookBody.toggleClass("font-family-"+fontState.family);
      $($(".font-settings .font-family-list li:nth-child("+(fontState.family+1)+")")[0])
        .removeClass("active");
  
      fontState.family = index;
      bookBody.toggleClass("font-family-"+fontState.family);
      el.addClass("active");
      fontState.save();
  }

  var changeColorTheme = function(index){
      if (fontState.theme !== 0)
        book.removeClass("color-theme-"+fontState.theme);
      fontState.theme = index;
      if (fontState.theme !== 0)
        book.addClass("color-theme-"+fontState.theme);
      fontState.save();
  }

  var init = function() {
    //Find and save DOM elements.
    book = $($(".book")[0]);
    toggle = $(book.find(".book-header .toggle-font-settings")[0]);
    dropdown = $(book.find("#font-settings-wrapper .dropdown-menu")[0]);
    bookBody = $(book.find(".book-body")[0]);
    //Instantiate font state object 
    fontState = storage.get("fontState", {size:1,family:0,theme:0});
    bookBody.addClass("font-size-"+fontState.size);
    bookBody.addClass("font-family-"+fontState.family);
    $($(".font-settings .font-family-list li:nth-child("+(fontState.family+1)+")")[0])
        .addClass("active");
    if(fontState.theme !== 0)
      book.addClass("color-theme-"+fontState.theme);
    fontState.save = function(){
      storage.set("fontState",fontState);
    };
    //Add event listeners
    $("#enlarge-font-size").on("click", enlargeFontSize);
    $("#reduce-font-size").on("click", reduceFontSize);
    $(dropdown.find(".font-family-list li")).each(function(i){
      $(this).on("click",function(){changeFontFamily(i,$(this))});
    });
    $(dropdown.find(".color-theme-list button")).each(function(i){
      $(this).on("click",function(){changeColorTheme(i)});
    });
    toggle.on("click", togglePopover);
    dropdown.on("click",function(e){e.stopPropagation();});
    $(document).on("click", closePopover);
  };
  
  return {
    init: init
  }
});