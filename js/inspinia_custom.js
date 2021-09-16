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
  // navigating pages 
  $('nav .metismenu li a[data-href]').unbind().click(function (event) {
    const target = $(event.currentTarget).data('href');
    if (target === window.location.pathname) {
      return;
    }
    window.location.href = window.location.origin + target;
  })
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
  fetchBuySellData(registerBuySellModalEvents);
  $('.responsive-navbar-cta').click(function () {
    $('body').toggleClass('fixed-navbar');
    SmoothlyMenu();
  })
  $('.fixed-navbar-hide').click(function () {
    $('body').removeClass('fixed-navbar');
    $('#overlay').removeClass('show').addClass('d-none fade');
  })
  $('#overlay').click(function (event) {
    $(event.currentTarget).removeClass('show').addClass('d-none fade');
    $('body').removeClass('fixed-navbar');
    SmoothlyMenu();
  })

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
  var elem = document.querySelector('#buy-sell-modal .js-switch');

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
  }).off('changeDate').on('changeDate', function (e) {
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
    case 'DD MMM YYYY HH:mm': return `${da} ${mmm} ${ye} ${hr}:${min}`;
    case 'DD/MM/YYYY HH:mm': return `${da}/${mm}/${ye} ${hr}:${min}`;
    case 'HH:mm': return `${hr}:${min}`
  }
}

function addPrefixZero(number) {
  if (typeof number !== "number" || isNaN(number)) {
    return number
  }
  if (number < 10) {
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
// utility to add timezone
function getTimezoneOffset() {
  var timezone_offset_min = new Date().getTimezoneOffset(),
    offset_hrs = parseInt(Math.abs(timezone_offset_min / 60)),
    offset_min = Math.abs(timezone_offset_min % 60),
    timezone_standard;

  if (offset_hrs < 10)
    offset_hrs = '0' + offset_hrs;

  if (offset_min < 10)
    offset_min = '0' + offset_min;

  // Add an opposite sign to the offset
  // If offset is 0, it means timezone is UTC
  if (timezone_offset_min < 0)
    timezone_standard = '+' + offset_hrs + ':' + offset_min;
  else if (timezone_offset_min > 0)
    timezone_standard = '-' + offset_hrs + ':' + offset_min;
  else if (timezone_offset_min == 0)
    timezone_standard = 'Z';
  return timezone_standard;
}
// activate tooltips globally (to be called by respective file after content is loaded)
function activateTooltips() {
  $("[data-toggle='tooltip']").tooltip()
}

// render follow provider start
function renderFollowProviderPopup(strategyProviderDetails) {
  const bodyContainer = $('#follow-provider-modal .modal-body');
  bodyContainer.empty().append(getFollowProviderPopupBody(strategyProviderDetails));
  const footerContainer = $('#follow-provider-modal .modal-footer');
  footerContainer.empty().append(getFollowProviderPopupFooter())
  registerFollowProviderPopupEvents();
}

function getFollowProviderPopupBody(data) {
  if (!data) {
    return ''
  }
  const { username,
    name,
    profile_image,
    country,
    cumulative_returns,
    advised_min,
    avg_lot_size,
    max_drawdown,
    strategy_age,
    profit_sharing } = data;
  return `
          <!-- name, profile image details start -->
          <div class="d-flex justify-content-between">
                <div class="mb-2">
                  <img alt="image" class="rounded-circle img-fluid img-sm float-left" src=${profile_image}>
                  <div class="username-container">
                    <p class="font-bold font-size-12 mb-0">
                      ${username}
                    </p>
                    <p class="text-light-black font-size-12 mb-0">
                      ${name}
                      <img class="ml-1" src=${getCountryFlags(country)}>
                    </p>
                  </div>
                </div>
          </div>
    <!-- name, profile image details end -->
    <!-- Data display Row 1 start -->
          <div class="d-flex justify-content-between mb-2">
            <div class="w-50 d-flex justify-content-between mr-3 align-items-center">
              <div class="uppercase-label">TOTAL RETURNS</div>
              <div class="text-dark-green d-flex align-items-center"><span class="up-arrow-green mr-1"></span><span
                  class="font-bold">${cumulative_returns}%</span></div>
            </div>
            <div class="w-50 d-flex justify-content-between align-items-center">
              <div class="uppercase-label">advised min</div>
              <div class="text-light-gray medium-font font-bold">$${formatWithCommas(advised_min)}</div>
            </div>
          </div>
    <!-- Data display Row 1 end -->
    <!-- Data display Row 2 start -->
    <div class="d-flex justify-content-between mb-2">
      <div class="w-50 d-flex justify-content-between mr-3 align-items-center">
        <div class="uppercase-label">Avg Lot Size</div>
        <div class="font-bold medium-font">${avg_lot_size}</div>
      </div>
      <div class="w-50 d-flex justify-content-between align-items-center">
        <div class="uppercase-label">draw down</div>
        <div class="text-light-red medium-font">${max_drawdown}%</div>
      </div>
    </div>
    <!-- Data display Row 2 end -->
    <!-- Data display Row 3 start -->
      <div class="d-flex justify-content-between mb-2">
        <div class="w-50 d-flex justify-content-between mr-3 align-items-center">
          <div class="uppercase-label">Age</div>
          <div class="font-bold medium-font">${strategy_age}</div>
        </div>
        <div class="w-50 d-flex justify-content-between align-items-center">
          <div class="uppercase-label">P share %</div>
          <div class="medium-font">${profit_sharing}%</div>
        </div>
      </div>
      <!-- Data display Row 3 end -->
      <!-- tabs header start -->
      <div>
        <ul class="nav nav-tabs flex-nowrap py-3" role="tablist">
          <li>
            <a class="nav-link active" data-toggle="tab" href="#automatic">Automatic</a>
          </li>
          <li>
            <a class="nav-link" data-toggle="tab" href="#percentage">Percentage</a>
          </li>
          <li>
            <a class="nav-link" data-toggle="tab" href="#fixed">Fixed</a>
          </li>
          <li>
            <a class="nav-link" data-toggle="tab" href="#proportional">Proportional</a>
          </li>
        </ul>
      </div>
      <!-- tabs header end -->
      <div class="tab-content py-3">
      <!-- Automatic Tab content -->
      <!-- For Read more/less to function the parent must have "read-more-less" class -->
        <div role="tabpanel" id="automatic" class="tab-pane active read-more-less">
          <p class="font-bold medium-font text-modal-black mb-2">Automatic Settings Adjustment Fund Allocation
          </p>
          <p class="text-modal-gray extra-large-font mb-2">This process is automatic.</p>
          <p class="small-font read-less-text mb-0"><button type="button"
              class="btn btn-outline btn-link font-bold p-0 text-navy btn-read-more">Learn More</button> about
            <b>Automatic
              Setting
              Adjustments</b>
          </p>
          <div class="read-more-text d-none m-0">
            <p class="m-0">The system will choose the favourable lot size for your trading
              account
              based on your account usage and available funds. No input from you is necessary.</p>
            <p class="d-flex justify-content-end m-0">
              <button type="button"
                class="btn btn-outline btn-link font-bold p-0 float-right text-navy small-font btn-read-less">Show
                Less</button>
            </p>
          </div>
        </div>
        <!-- Percentage Tab content -->
        <div role="tabpanel" id="percentage" class="tab-pane read-more-less">
          <p class="font-bold medium-font text-modal-black mb-2">Percentage of Total Balance Fund Allocation
          </p>
          <p class="mb-2 text-light-red">Set a percentage or fixed value for this Strategy Provider.</p>
          <div class="d-flex align-items-center mb-2">
            <div class="btn-group mr-3">
              <button data-toggle="dropdown" class="btn btn-default dropdown-toggle">
                Percentage
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#">Action</a></li>
                <li>
                  <a class="dropdown-item" href="#">Another action</a>
                </li>
                <li>
                  <a class="dropdown-item" href="#">Something else here</a>
                </li>
                <li class="dropdown-divider"></li>
              </ul>
            </div>
            <input type="text" class="form-control w-25 mr-3">
            <span class="font-bold medium-font text-dark-black">%</span>
          </div>
          <p class="small-font read-less-text mb-0"><button type="button"
              class="btn btn-outline btn-link font-bold p-0 text-navy btn-read-more">Learn More</button> about
            <b>Percentage of Total Balance</b>
          </p>
          <div class="read-more-text d-none m-0">
            <p class="m-0">Enter a percentage of the total balance that you want to allocate to this trading
              strategy. E.g. if you enter “10%”, this means that 1/10 of your balance will be used to trade
              according to this strategy. You may also set the value higher than 100% depending on your risk
              tolerance.

              You can also set absolute values in which case the system will calculate the percentage
              depending
              on your balance. E.g. if you enter “USD 1000” with a balance of “USD 3000”, our trading server
              will execute a trade size 3 times smaller.

              The trade size (no. of lots) will be calculated automatically. Please note that this allocation
              does not limit your losses to the percentage of your account chosen. This only affects the size
              that is opened.</p>
            <p class="d-flex justify-content-end m-0">
              <button type="button"
                class="btn btn-outline btn-link font-bold p-0 float-right text-navy small-font btn-read-less">Show
                Less</button>
            </p>
          </div>
        </div>

        <!-- fixed Tab content -->
        <div role="tabpanel" id="fixed" class="tab-pane read-more-less">
          <p class="font-bold medium-font text-modal-black mb-2">Fixed Lot Size Fund Allocation
          </p>
          <p class="mb-2 text-light-red">Set a specific trade size you want to follow for this Strategy
            Provider.</p>
          <div class="d-flex align-items-center mb-2">
            <label class="col-form-label mr-3 font-bold text-dark-black">Fixed Trade Size</label>
            <input type="text" class="form-control w-25 mr-3" >
            <span class="font-bold medium-font text-dark-black">LOT</span>
          </div>
          <p class="small-font read-less-text mb-0"><button type="button"
              class="btn btn-outline btn-link font-bold p-0 text-navy btn-read-more">Learn More</button> about
            <b>Fixed Lot Size</b>
          </p>
          <div class="read-more-text d-none m-0">
            <p class="m-0">Enter the fixed trade size that you want to execute in your brokerage account.
              Please
              note that if a strategy provider works with a dynamic/floating trade size, your trading results
              may differ.

              It is recommended to use this option only if you can see two increasing parallel lines on the
              chart “Percentage vs Pips” of the trading strategy statistics page. In other words, this option
              can be effectively used if a trading strategy generates profits in Pips. E.g. “0.10” means that
              our trading server will always execute trades of a fixed size of 0.1 lot (10 000 units of the
              base
              currency) in your account.</p>
            <p class="d-flex justify-content-end m-0">
              <button type="button"
                class="btn btn-outline btn-link font-bold p-0 float-right text-navy small-font btn-read-less">Show
                Less</button>
            </p>
          </div>
        </div>

        <!-- Proportional tab content -->
        <div role="tabpanel" id="proportional" class="tab-pane read-more-less">
          <p class="font-bold medium-font text-modal-black mb-2">Proportional Trade Size Fund Allocation
          </p>
          <p class="mb-2 text-light-red">Set a specific trade size you want to follow for this Strategy
            Provider.</p>
          <div class="d-flex align-items-center mb-2">
            <label class="col-form-label mr-3 font-bold text-dark-black">Ratio of Trade Size</label>
            <input type="text" class="form-control w-25 mr-3" >
            <span class="font-bold medium-font text-dark-black">Ratio</span>
          </div>
          <p class="small-font read-less-text mb-0"><button type="button"
              class="btn btn-outline btn-link font-bold p-0 text-navy btn-read-more">Learn More</button> about
            <b>Proportional Trade Size</b>
          </p>
          <div class="read-more-text d-none m-0">
            <p class="m-0">This feature allows setting up dynamic, proportional trade size coefficient in
              percentage relation.

              If you want to open positions 5 times smaller than the strategy provider, you need to input
              “0.20”.

              If you want to open positions 5 times bigger than the strategy provider, input “5.00”.

              To meet the lot quantity values of the strategy provider input “1.00”.</p>
            <p class="d-flex justify-content-end m-0">
              <button type="button"
                class="btn btn-outline btn-link font-bold p-0 float-right text-navy small-font btn-read-less">Show
                Less</button>
            </p>
          </div>
        </div>

    </div>
    <section class="risk-mangement py-3">
    <p class="font-bold medium-font">Risk Management </p>
    <!-- Lot size input start -->
    <div class="d-flex justify-content-between mb-3">
      <div class="w-75 mr-3">
        <p class="text-gray medium-font mb-1">Minimum Lot Size</p>
        <div class="d-flex align-items-center">
          <input type="text" class="form-control w-50 mr-3">
          <span class="font-bold medium-font text-dark-black">LOT</span>
        </div>
      </div>
      <div>
        <p class="text-gray medium-font mb-1">Maximum Lot Size</p>
        <div class="d-flex align-items-center">
          <input type="text" class="form-control w-50 mr-3">
          <span class="font-bold medium-font text-dark-black">LOT</span>
        </div>
      </div>
    </div>
    <!-- Lot size input end -->
    <!-- Fix profit/loss input start -->
    <div class="d-flex justify-content-between mb-3">
      <div class="w-75 mr-3">
        <p class="text-gray medium-font mb-1">Fix Take Profit</p>
        <div class="d-flex align-items-center">
          <input type="text" class="form-control w-50 mr-3">
          <span class="font-bold medium-font text-dark-black">Pips</span>
        </div>
      </div>
      <div>
        <p class="text-gray medium-font mb-1">Fix Stop Loss</p>
        <div class="d-flex align-items-center">
          <input type="text" class="form-control w-50 mr-3">
          <span class="font-bold medium-font text-dark-black">Pips</span>
        </div>
      </div>
    </div>
    <!-- Fix profit/loss input end -->
    <div class="form-check abc-checkbox form-check-inline mb-2">
      <input class="form-check-input mr-3" type="checkbox" value="option1">
      <label class="form-check-label text-gray medium-font"> Copy Open Trades & Pending Orders </label>
    </div>
    <div class="form-check abc-checkbox form-check-inline">
      <input class="form-check-input mr-3" type="checkbox" value="option1">
      <label class="form-check-label text-gray medium-font"> Limit Quantity of Simultaneous Trades
      </label>
    </div>
  </section>
    `
}
function getFollowProviderPopupFooter() {
  const accountNo = localStorage.getItem('selectedAccountNo');
  return `
    <div class="account-number p-1"><span class="mr-1 text-navy live">LIVE</span><span class="medium-font font-bold">${accountNo}</span></div>
    <button type="button" class="btn btn-primary" id="follow-provider">Follow Provider</button>
    `
}

function registerFollowProviderPopupEvents() {
  readMoreLessEventHandler();
}

function readMoreLessEventHandler() {
  // read more less event handlers
  $(".read-more-less .btn-read-more").unbind().click(function () {
    $('.read-more-less .read-less-text').toggleClass('d-none');
    $('.read-more-less .read-more-text').toggleClass('d-none');
  })
  $('.read-more-less .btn-read-less').unbind().click(function () {
    $('.read-more-less .read-more-text').toggleClass('d-none');
    $('.read-more-less .read-less-text').toggleClass('d-none');
  })
}
  // render follow provider end