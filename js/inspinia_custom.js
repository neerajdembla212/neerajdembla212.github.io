$(document).ready(function () {
  if (!checkUserLogin()) {
    window.location.href = window.origin + '/login.html'
  }
  registerEventHandlers();
});
function checkUserLogin() {
  return readCookie('accessToken')
}

function readCookie(name) {
  var dc = document.cookie;
  var prefix = name + "=";
  var begin = dc.indexOf("; " + prefix);
  if (begin == -1) {
    begin = dc.indexOf(prefix);
    if (begin != 0) return null;
  } else {
    begin += 2;
    var end = document.cookie.indexOf(";", begin);
    if (end == -1) {
      end = dc.length;
    }
  }
  // because unescape has been deprecated, replaced with decodeURI
  return decodeURI(dc.substring(begin + prefix.length, end));
}

function set_cookie(name, value) {
  document.cookie = name + '=' + value;
}
function delete_cookie(name) {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function registerEventHandlers() {
  // dropdown in navigation panel to switch accounts
  $(".dropdown-select-menu").click((event) => {
    // const selectedItem = event.innerText.trim();
    const selectButton = $("button.dropdown-toggle.dropdown-select");
    const accountNo = $('.dropdown-item .account-number .medium-font')
    const accountType = $('.dropdown-item .account-number .text-navy')
    // if (selectedItem.toUpperCase() === "LIVE") {
    //   selectButton.addClass("active");
    // } else {
    //   selectButton.removeClass("active");
    // }
    localStorage.setItem('selectedAccountNo', accountNo.textContent);
    localStorage.setItem('selectedAccountType', accountType.textContent);
    window.location.reload();
  });

  $('.nav-header .dropdown-menu').click(function (e) {
    const role = e.target.innerText;
    switch (role) {
      case 'Strategy Provider':
        localStorage.setItem('currentRole', 'provider');
        window.location.reload();
        break;
      case 'Strategy Follower':
        localStorage.setItem('currentRole', 'follower');
        window.location.reload();
        break;
      case 'Sign Out':
        delete_cookie('accessToken');
        window.location.reload();
    }
    if (role === 'Strategy Provider') {
      localStorage.setItem('currentRole', 'provider');
      window.location.reload();
    } else if (role === 'Strategy Follower') {
      localStorage.setItem('currentRole', 'follower');
      window.location.reload();
    }
  })
  // display selected role on nav header
  const storedRole = localStorage.getItem('currentRole');
  if (storedRole === 'provider') {
    $('.nav-header .role').text('Strategy Provider');
  } else {
    $('.nav-header .role').text('Strategy Follower');
    localStorage.setItem('currentRole', 'follower');
  }

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

// set init data
localStorage.setItem('selectedAccountNo', 'TA 209761M');
localStorage.setItem('selectedAccountType', 'LIVE');
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
function formatDate(date, format = "DD MMM YYYY") {
  if (!isDateValid(date)) {
    return '';
  }
  const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
  const mmm = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
  const mm = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date);
  const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
  const hr = new Intl.DateTimeFormat('en', { hour: '2-digit', hour12: false }).format(date);
  const min = new Intl.DateTimeFormat('en', { minute: '2-digit' }).format(date);
  switch (format) {
    case 'DD MMM YYYY': return `${da} ${mmm} ${ye}`;
    case 'DD MM YYYY HH:mm': return `${da} ${mm} ${ye} ${hr}:${min}`;
    case 'DD/MM/YYYY HH:mm': return `${da}/${mm}/${ye} ${hr}:${min}`;
  }
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