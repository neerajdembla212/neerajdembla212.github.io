$(document).ready(function () {
  // dropdown in navigation panel to switch accounts 
    $(".dropdown-select-menu").click((event) => {
    const selectedItem = event.target.innerText.trim();
    const selectButton = $("button.dropdown-toggle.dropdown-select");
    if (selectedItem.toUpperCase() === "LIVE") {
      selectButton.addClass("active");
    } else {
      selectButton.removeClass("active");
    }
    selectButton.text(selectedItem);
  });

// to display role card on hover of profile image on retracted menu
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
