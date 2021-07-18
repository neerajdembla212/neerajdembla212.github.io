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

  // Open close Buy/Sell right sidebar
  $(".buy-sell-right-sidebar-toggle").on("click", function (e) {
    e.preventDefault();
    $(".right-sidebar.buy-sell-right-sidebar").addClass("sidebar-open");
  });

  $(".right-sidebar .fa-close").on("click", function (e) {
    e.preventDefault();
    $(".right-sidebar").removeClass("sidebar-open");
  });

  // follower sidebar right
  $(".follower-sidebar-toggle").on("click", function (e) {
    e.preventDefault();
    $(".follower-sidebar-container").toggleClass("sidebar-open");
  });
});
