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

  // Read more / Read less events
  $(".read-more-less .btn-read-more").click(function () {
    $('.read-more-less .read-less-text').toggleClass('d-none');
    $('.read-more-less .read-more-text').toggleClass('d-none');
  })
  $('.read-more-less .btn-read-less').click(function () {
    $('.read-more-less .read-more-text').toggleClass('d-none');
    $('.read-more-less .read-less-text').toggleClass('d-none');
  })
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

// utility method to format date eg output : 1 Feb 2021
function formatDate(date) {
  if (!isDateValid(date)) {
    return '';
  }
  let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
  let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
  let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
  return `${da} ${mo} ${ye}`;
}

// utility function to check valid date object
function isDateValid(d) {
  return d instanceof Date && !isNaN(d)
}
// utility method to calculate date difference between two dates eg output : x Years y Months z days
function calculateDateDiff(a, b) {
  if (!isDateValid(a) || !isDateValid(b)) {
    return ''
  }
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  const days = Math.floor((utc2 - utc1) / _MS_PER_DAY);
  const months = Math.floor(days / 31);
  const years = Math.floor(months / 12);
  if (years > 0) {
    return `${years} Years`;
  }
  if (months > 0) {
    return `${months} Months`;
  }
  if (days <= 31) {
    return `${days} Days`
  }
}