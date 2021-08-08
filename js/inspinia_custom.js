$(document).ready(function () {
  registerEventHandlers();
});

function registerEventHandlers() {
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
        $(".role-card").removeClass("d-none");
      }
    })
    .mouseleave(() => {
      $(".role-card").addClass("d-none");
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
}

//generic ajax function
function callAjaxMethod({
  url,
  method = "GET",
  parameters = {},
  successCallback,
  beforeSend
}) {
  try {
    $.ajax({
      type: method,
      url: url,
      data: parameters,
      cache: false,
      beforeSend: beforeSend ? beforeSend : function () {
        //enable loader
        console.log("sending request");
        // $(".loader").fadeIn();
      },
      success: successCallback,
      error: function (xhr, textStatus, errorThrown) {
        console.log(errorThrown);
        // $(".loader").fadeOut();
      },
      complete: function () {
        //disable loader
        console.log("request complete");
        // $(".loader").fadeOut();
      },
    });
  } catch (e) {
    console.log(e);
  }
}

// utility method to format number with commas before displaying
function formatWithCommas(number) {
  internationalNumberFormat = new Intl.NumberFormat("en-US");
  return internationalNumberFormat.format(number);
}

// utility method to get country flag using country code
function getCountryFlags(country) {
  switch (country) {
    case 'us': return 'img/flags/16/United-States.png'
    default: return '';
  }
}