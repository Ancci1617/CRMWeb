$(function () {
  $("#sortable").sortable({axis : "y",cancel: '.locked',items : "li",handle : ".details"} );
  $("#sortable").disableSelection();
});

//favorite heart like/unlike
document.querySelectorAll(".material-icons").
  forEach(function (el) {
    el.addEventListener("click",
      function () {
        if (this.classList.contains("unlike"))
          this.classList.toggle("like");
        else
          this.classList.toggle("unlike");
      });
  });