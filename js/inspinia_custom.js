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
        clearLocalStorageData();
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
  $(".watchlist-right-sidebar-toggle").on("click", function (e) {
    e.preventDefault();
    $(".right-sidebar.watchlist-right-sidebar").addClass("sidebar-open");
  });

  $(".right-sidebar .close").on("click", function (e) {
    e.preventDefault();
    $(".right-sidebar").removeClass("sidebar-open");
  });
  // Read more / Read less events
  readMoreLessEventHandler();

  fetchBuySellData(registerBuySellModalEvents)
}
function readMoreLessEventHandler() {
  $(".read-more-less .btn-read-more").unbind().click(function () {
    $('.read-more-less .read-less-text').toggleClass('d-none');
    $('.read-more-less .read-more-text').toggleClass('d-none');
  })
  $('.read-more-less .btn-read-less').unbind().click(function () {
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
// fetch buy sell initial data
function fetchBuySellData(cb) {
  if (!localStorage.getItem('buySellData')) {
    callAjaxMethod({
      url: "https://copypip.free.beeceptor.com/buy-sell-data",
      successCallback: (data) => {
        localStorage.setItem('buySellData', JSON.stringify(data.data));
        if (cb && typeof cb === 'function') {
          cb(data);
        }
      },
    });
  } else {
    const buySellData = JSON.parse(localStorage.getItem('buySellData'))
    cb(buySellData);
  }
}
// Buy sell popup events 
function registerBuySellModalEvents(data) {
  if (!data) {
    return
  }
  var elem = document.querySelector('.js-switch');
  new Switchery(elem, {
    color: '#E5E5E5',
    secondaryColor: '#E5E5E5',
    jackColor: '#22D091',
    jackSecondaryColor: "#FFFFFF",
  });

  // type input dropdown
  $('#buy-sell-modal #type-input-menu.dropdown-menu').click(event => {
    const selectedItem = event.target.innerText.trim();
    const selectedButton = $('#buy-sell-modal #btn-type-input')
    selectedButton.text(selectedItem);
    if (selectedItem.toUpperCase() === 'PENDING ORDER') {
      $('#buy-sell-modal .dynamic-elements').removeClass('d-none');
    } else if (selectedItem.toUpperCase() === 'MARKET EXECUTION') {
      $('#buy-sell-modal .dynamic-elements').addClass('d-none');
    }
  })

  // order type dropdown menu
  $('#buy-sell-modal #order-type-input-menu.dropdown-menu').click(event => {
    const selectedItem = event.target.innerText.trim();
    const selectedButton = $('#buy-sell-modal #btn-order-type-input')
    selectedButton.text(selectedItem);
  })

  // expiration dropdown menu
  $('#buy-sell-modal #expiration-input-menu.dropdown-menu').click(event => {
    const selectedItem = event.target.innerText.trim();
    const selectedButton = $('#buy-sell-modal #btn-expiration-input')
    selectedButton.text(selectedItem);
    if (selectedItem.toUpperCase() === 'GOOD TILL CANCELLED (GTC)') {
      $('#buy-sell-modal #btn-expiration-date-input').attr('disabled', 'true');
    } else if (selectedItem.toUpperCase() === 'DAY ORDER') {
      const expirationDate = data.day_order_expiration_date;
      $('#buy-sell-modal #btn-expiration-date-input').datepicker('setDate', new Date(expirationDate));
    } else {
      $('#buy-sell-modal #btn-expiration-date-input').removeAttr('disabled');
    }
  })

  // expiration date picker
  $('#buy-sell-modal #expiration-date-input').datepicker({
    todayBtn: "linked",
    keyboardNavigation: true,
    forceParse: false,
    calendarWeeks: true,
    autoclose: true
  }).on('changeDate', function (e) {
    const displayDateButton = $('#buy-sell-modal #btn-expiration-date-input');
    displayDateButton.text(formatDate(e.date, "DD MMM YYYY HH:mm"));
  });
  const expirationDate = new Date(data.gtc_expiration_date);
  $('#buy-sell-modal #expiration-date-input').datepicker('setDate', expirationDate);
}

function clearLocalStorageData() {
  localStorage.clear()
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
  let da = +new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
  const mmm = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
  let mm = +new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date);
  let ye = +new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
  let hr = +new Intl.DateTimeFormat('en', { hour: '2-digit', hour12: false }).format(date);
  let min = +new Intl.DateTimeFormat('en', { minute: '2-digit' }).format(date);

  // add prefix zero if value is < 10
  da = addPrefixZero(da);
  mm = addPrefixZero(mm);
  ye = addPrefixZero(ye);
  hr = addPrefixZero(hr);
  min = addPrefixZero(min);

  switch (format) {
    case 'DD MMM YYYY': return `${da} ${mmm} ${ye}`;
    case 'DD MM YYYY HH:mm': return `${da} ${mm} ${ye} ${hr}:${min}`;
    case 'DD/MM/YYYY HH:mm': return `${da}/${mm}/${ye} ${hr}:${min}`;
    case 'HH:mm': return `${hr}:${min}`
  }
}

function addPrefixZero(number) {
  if (!number || typeof number !== "number" || isNaN(number)) {
    return number
  }
  if (number < 0) {
    return ("0" + number);
  }
  return number;

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

// activate tooltips globally (to be called by respective file after content is loaded)
function activateTooltips() {
  $("[data-toggle='tooltip']").tooltip()
}