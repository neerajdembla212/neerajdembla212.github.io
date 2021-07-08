$(function () {
  $(".nav-header")
    .mouseenter(() => {
      if ($(".mini-navbar").is(":visible")) {
        $(this).find(".role-card").removeClass("d-none");
      }
    })
    .mouseleave(() => {
      $(this).find(".role-card").addClass("d-none");
    });
});
