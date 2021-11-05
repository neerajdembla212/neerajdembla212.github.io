$(document).ready(function () {
  if (!checkUserLogin()) {
    window.location.href = window.origin + '/login.html'
  }
  registerEventHandlers();
  initData();
  validateBuySellPopupInputs();
  fetchNotifications();
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

  // account switcher event
  $(".account-switcher .dropdown-item").click((event) => {
    const accountNumber = $(event.currentTarget).data('account-no');
    const accountType = $(event.currentTarget).data('account-type');
    localStorage.setItem('selectedAccountNo', accountNumber);
    localStorage.setItem('selectedAccountType', accountType);
    // window.location.reload();
  });

  // role switcher event
  $('.nav-header .dropdown-menu').click(function (e) {
    const role = $(e.target).data('role');
    switch (role) {
      case 'provider':
        localStorage.setItem('currentRole', 'provider');
        window.location.reload();
        break;
      case 'follower':
        localStorage.setItem('currentRole', 'follower');
        window.location.reload();
        break;
      case 'signout':
        clearLocalStorageData();
        delete_cookie('accessToken');
        window.location.reload();
    }
  })

  // display selected role on nav header
  const storedRole = localStorage.getItem('currentRole');
  if (storedRole === 'provider') {
    $('.nav-header .role').text('Strategy Provider');
    $(`.nav-header .dropdown-menu .dropdown-item[data-role="${storedRole}"]`).append('<img src="img/ic_tick.svg" class="ml-2" />')
  } else {
    $('.nav-header .role').text('Strategy Follower');
    localStorage.setItem('currentRole', 'follower');
    $(`.nav-header .dropdown-menu .dropdown-item[data-role="${storedRole}"]`).append('<img src="img/ic_tick.svg" class="ml-2" />')
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

  // navbar events
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
  $('.scrollable-content').slimScroll({
    height: '100%',
    railOpacity: 0.9
  });

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
function initData() {
  callAjaxMethod({
    url: 'https://copypip.free.beeceptor.com/get-user-config',
    successCallback: (data) => {
      localStorage.setItem('userAccounts', JSON.stringify(data.data.userAccounts));
      const defaultAccount = data.data.defaultAccount;
      if (!localStorage.getItem('selectedAccountType') && !localStorage.getItem('selectedAccountNo')) {
        localStorage.setItem('selectedAccountNo', defaultAccount.accountNo);
        localStorage.setItem('selectedAccountType', defaultAccount.accountType);
      }
      renderAccountSwitcher(data.data.userAccounts);
      const decimalCount = countDecimals(data.data.tradeData.from_currency_rate);
      data.data.tradeData.decimalCount = decimalCount;
      localStorage.setItem('tradeData', JSON.stringify(data.data.tradeData))
      registerBuySellModalEvents(data.data.tradeData);
    }
  })
  // set view type as grid for Strategy Provider page
  if (!localStorage.getItem('viewType')) {
    localStorage.setItem('viewType', 'grid');
  }
}
// account switcher start
function renderAccountSwitcher(userAccounts) {
  if (!userAccounts || !Array.isArray(userAccounts)) {
    return
  }
  const container = $('.account-switcher');
  const rowsHTML = []
  const selectedAccountType = localStorage.getItem('selectedAccountType');
  userAccounts.forEach((account, i) => {
    const { accountNo, accountType } = account;
    const selectedAccountNo = localStorage.getItem('selectedAccountNo');
    rowsHTML.push(`
        <li class="dropdown-item py-2 cursor-pointer px-3 d-flex align-items-center" data-account-no="${accountNo}" data-account-type="${accountType}">
            <div class="account-number px-2 d-flex align-items-center ${accountType === 'DEMO' ?
        'demo-account' : ''}"><span
                class="mr-2 text-navy live extra-small-font font-bold ${accountType === 'DEMO' ? 'demo' : ''}">${accountType}</span><span
                class="medium-font font-bold small-font">${accountNo}</span>
            </div>
            ${selectedAccountNo === accountNo ? '<img class="ml-2" src="img/ic_tick.svg" />' : ''}
        </li>
    `)
  })
  rowsHTML.unshift(`
    <li class="dropdown-item font-bold text-navy py-2 cursor-pointer px-3" data-account-no="create" data-toggle="modal"
    data-target="#create-demo-modal">
      Create Demo Account
    </li>
  `)
  container.empty().append(rowsHTML.join(''))
  const accountSwitcherCTA = $('.account-switcher-cta');
  accountSwitcherCTA.find('.text').text(selectedAccountType);
  if (selectedAccountType.toUpperCase() === 'LIVE') {
    accountSwitcherCTA.addClass('active');
  } else {
    accountSwitcherCTA.removeClass('active');
  }
  registerAccountSwitcherEvents();
}

function registerAccountSwitcherEvents() {
  $('.account-switcher li.dropdown-item').unbind().click(function (evemt) {
    const accountNo = $(evemt.currentTarget).data("account-no");
    const accountType = $(evemt.currentTarget).data("account-type");
    console.log('accountNo ', accountNo, 'accountType ', accountType);
    if (accountNo === 'create') {
      return;
    }
    localStorage.setItem('selectedAccountNo', accountNo);
    localStorage.setItem('selectedAccountType', accountType);
    window.location.reload();
  })
}
// account switcher end

//generic ajax function
function callAjaxMethod({
  url,
  method = "GET",
  parameters = {},
  successCallback,
  beforeSend,
  errorCallback = function (xhr, textStatus, errorThrown) {
    console.log(errorThrown);
  }
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
      error: errorCallback,
    });
  } catch (e) {
    console.log(e);
  }
}
// fetch buy sell initial data start
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
// fetch buy sell initial data end

// fetch notifications start
function fetchNotifications() {
  callAjaxMethod({
    url: "https://copypip.free.beeceptor.com/notifications",
    successCallback: (data) => {
      renderNotifications(data.data);
      $('.notifications-container .label-notification').text(data.newNotificationCount)
    },
  });
}
function renderNotifications(notifications) {
  if (!notifications || !Array.isArray(notifications)) {
    return
  }
  const container = $('.notifications-container .dropdown-menu');
  const rowsHTML = [];
  notifications.forEach(notification => {
    rowsHTML.push(getNotificationRowHTML(notification))
  })
  container.empty().append(rowsHTML.join(''))
}

function getNotificationRowHTML(notification) {
  const { profile_image, message, timestamp } = notification;
  return `
  <li class="d-flex m-0 justify-content-between p-2">
      <div class="m-0 d-flex">
          <img alt="image" class="rounded-circle img-fluid img-sm float-left ml-0 mr-2" src="${profile_image}" />
          <p class="m-0 font-weight-light medium-font w-75">${message}</p>
      </div>
      <p class="m-0 text-modal-gray medium-font">${formatDate(new Date(timestamp), 'DD MMM YYYY HH:mm')}</p>
  </li>
  `
}
// fetch notifications end

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
function calculateDateDiff(a, b, short = false) {
  let durationStr = '';
  if (!isDateValid(a) || !isDateValid(b)) {
    return durationStr;
  }
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  const days = Math.floor((utc2 - utc1) / _MS_PER_DAY);
  const months = Math.floor(days / 31);
  const years = Math.floor(months / 12);
  if (years > 0) {
    durationStr += `${years} ${short ? 'Yr ' : 'Years '}`
  }
  if (months > 0) {
    durationStr += `${months} ${short ? 'Mths ' : 'Months '}`;
  }
  if (days <= 31) {
    durationStr += `${days} Days`;
  }
  return durationStr;
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
  $("[data-toggle='tooltip']").tooltip({ container: 'body' })
}
function getNoOfTradesTooltipText() {
  return '<b>By Number of Trades</b> This option blocks the opening of new trades / pending orders, if the current number of open trades / pending orders (in the given trading strategy) in the brokerage account exceeds or is equal to the value specified in the field.'
}

function getLevelOfEquityTooltipText() {
  return '<b>By Level of Equity</b> This option blocks the opening of new trades, if the current equity in the brokerage account is less than the set amount.'
}
// render follow provider start
function renderFollowProviderPopup(strategyProviderDetails) {
  const bodyContainer = $('#follow-provider-modal .modal-body');
  bodyContainer.empty().append(getFollowProviderPopupBody(strategyProviderDetails));
  const footerContainer = $('#follow-provider-modal .modal-footer');
  footerContainer.empty().append(getFollowProviderPopupFooter())
  registerFollowProviderPopupEvents();
  validateFollowProviderPopupInputs();
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
          <div class="d-flex align-items-center mb-3">
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
            <div class="position-relative w-25 mr-3">
              <input type="text" class="form-control" id="percentage-input">
            </div>
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
          <div class="d-flex align-items-center mb-3">
            <label class="col-form-label mr-3 font-bold text-dark-black">Fixed Trade Size</label>
            <div class="position-relative w-25 mr-3">
              <input type="text" class="form-control" id="fixed-trade-size">
            </div>
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
          <div class="d-flex align-items-center mb-3">
            <label class="col-form-label mr-3 font-bold text-dark-black">Ratio of Trade Size</label>
            <div class="position-relative w-25 mr-3">
              <input type="text" class="form-control" id="trade-size-ratio">
            </div>
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
          <div class="position-relative w-50 mr-3">
            <input type="text" class="form-control" id="min-lot-size">
          </div>
          <span class="font-bold medium-font text-dark-black">LOT</span>
        </div>
      </div>
      <div>
        <p class="text-gray medium-font mb-1">Maximum Lot Size</p>
        <div class="d-flex align-items-center">
        <div class="position-relative w-75 mr-3">
          <input type="text" class="form-control" id="max-lot-size">
        </div>
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
        <div class="position-relative w-50 mr-3">
          <input type="text" class="form-control" id="take-profit-input">
        </div>
          <span class="font-bold medium-font text-dark-black">Pips</span>
        </div>
      </div>
      <div>
        <p class="text-gray medium-font mb-1">Fix Stop Loss</p>
        <div class="d-flex align-items-center">
          <div class="position-relative w-75 mr-3">
            <input type="text" class="form-control" id="stop-loss-input">
          </div>
          <span class="font-bold medium-font text-dark-black">Pips</span>
        </div>
      </div>
    </div>
    <!-- Fix profit/loss input end -->
    <!-- Limit quantity input start -->
    <div class="form-check abc-checkbox form-check-inline">
      <input id="limit-quantity-checkbox" class="form-check-input mr-3" type="checkbox" value="checked">
      <label class="form-check-label text-gray medium-font"> Limit Quantity of Simultaneous Trades
      </label>
    </div>
    <!-- No of trades input start -->
    <section id="limit-quantity-input" class="d-none">
      <div class="d-flex justify-content-between mt-2">
        <div class="w-50">
          <p class="text-gray medium-font mb-1">By Number of Trades <i class="fa fa-question-circle cursor-pointer ml-1" data-toggle="tooltip" data-placement="left" data-html="true" title="${getNoOfTradesTooltipText()}"></i></p>
          <div class="position-relative w-50">
            <input type="text" class="form-control" id="no-of-trades">
          </div>
        </div>
        <div>
          <p class="text-gray medium-font mb-1">By level of Equity <i class="fa fa-question-circle cursor-pointer ml-1" data-toggle="tooltip" data-html="true" data-placement="right" title="${getLevelOfEquityTooltipText()}"></i></p>
          <div class="position-relative w-75">
            <input type="text" class="form-control" id="level-of-equity">
          </div>
        </div>
      </div>
    </section>
    <!-- No of trades input end -->
    <!-- Limit quantity input end -->
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

function validateFollowProviderPopupInputs() {
  // validate Minimum lot size input 
  validateTextInput($('#follow-provider-modal #min-lot-size'), validateNumber, 'Number only')

  // validate Maximum lot size input 
  validateTextInput($('#follow-provider-modal #max-lot-size'), validateNumber, 'Number only')

  // validate Take profit input 
  validateTextInput($('#follow-provider-modal #take-profit-input'), validateNumber, 'Number only')

  // validate Stop loss input 
  validateTextInput($('#follow-provider-modal #stop-loss-input'), validateNumber, 'Number only')

  // validate number of trades
  validateTextInput($('#follow-provider-modal #no-of-trades'), validateNumber, 'Number only')

  // validate level of equity
  validateTextInput($('#follow-provider-modal #level-of-equity'), validateNumber, 'Number only')

  // validate percentage input
  validateTextInput($('#follow-provider-modal #percentage-input'), validatePercentage, 'Number only');

  // validate fixed trade size input
  validateTextInput($('#follow-provider-modal #fixed-trade-size'), validatePercentage, 'Number only');

  // validate Trade size ratio input
  validateTextInput($('#follow-provider-modal #trade-size-ratio'), validatePercentage, 'Number only');
}

function registerFollowProviderPopupEvents() {
  readMoreLessEventHandler();
  // show hide number of trades and by level equity on check of limit quantuty checkbox
  $('#limit-quantity-checkbox').unbind().click(function () {
    if ($(this).is(':checked')) {
      // show limit quantity input section
      $('#limit-quantity-input').removeClass('d-none');
    } else {
      // hide limit quantity input section
      $('#limit-quantity-input').addClass('d-none');
    }
  })
  // activate tooltips
  activateTooltips();
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

function getStartEndRecordCount(dataLength, paginationData) {
  const { page, rowsPerPage, total } = paginationData;
  let start = page * rowsPerPage + 1;
  if (start >= total) {
    start = total - rowsPerPage + 1;
  }
  let end = start + rowsPerPage - 1;
  if (end > total) {
    end = dataLength
  }
  return {
    start,
    end,
    total
  }
}

function plotLineChart(lineData) {
  const canvas = document.getElementById("line-chart");
  if (!lineData || !Array.isArray(lineData) || !canvas) {
    return;
  }
  const lineDataPoints = lineData.reduce((acc, curr) => {
    acc.push(curr.data);
    return acc;
  }, []);
  canvas.height = 330;
  const ctx = canvas.getContext("2d");
  const positiveColor = "#22D091";
  const negativColor = "#C00000"
  const labels = lineData.map(d => d.time);
  const data = {
    labels: labels,
    datasets: [{
      label: "",
      data: lineDataPoints,
      cubicInterpolationMode: 'monotone',
      tension: 0.1
    }]
  };
  const config = {
    type: "line",
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [
          {
            gridLines: {
              display: false,
              tickMarkLength: 0,
            },
            ticks: {
              maxTicksLimit: 10,
              padding: 10
            },
          },
        ],
        yAxes: [
          {
            gridLines: {
              display: true,
              tickMarkLength: 0,
              drawBorder: false,
            },
            ticks: {
              display: true,
              tickMarkLength: 1,
              maxTicksLimit: 5,
              callback: function (value) {
                return value + '%'
              }
            },
          },
        ],
      },
      legend: {
        display: false,
      },
      elements: {
        point: {
          radius: 0,
        },
        line: {
          tension: 0,
          borderWidth: 2,
        },
      },
      layout: {
        padding: {
          bottom: 20,
          left: 10,
        },
      },
    },
    plugins: [{
      beforeRender: function (c) {
        const dataset = c.data.datasets[0];
        const yScale = c.scales['y-axis-0'];
        const yPos = yScale.getPixelForValue(0);

        const gradientFill = c.ctx.createLinearGradient(0, 0, 0, c.height);
        gradientFill.addColorStop(0, positiveColor);
        gradientFill.addColorStop(yPos / c.height, "#D9F7E6");
        gradientFill.addColorStop(yPos / c.height, "#F1C7C7");
        gradientFill.addColorStop(1, negativColor);

        const model = c.data.datasets[0]._meta[Object.keys(dataset._meta)[0]].$filler.el._model;
        model.backgroundColor = gradientFill;
      }
    }]
  };
  new Chart(ctx, config);
  ctx.globalCompositeOperation = 'destination-over';
}

function registerTableFilterEvents(onApplyFilter) {
  // show dropdown menu on click of more filters button
  $('.btn-group-more-filter .btn-more-filter').unbind().click(function () {
    $(this).siblings('.dropdown-menu-list').toggle()
    $('.btn-group-more-filter .dropdown-menu-input').hide();
  })
  // on click of dropdown menu item hide menu and show dropdown menu input
  $('.btn-group-more-filter .dropdown-menu>li.dropdown-item').unbind().click(function () {
    const filterName = $(this).data('filter-name');
    const id = $(this).data('id');
    const filterOperation = $(this).data('filter-operation');
    const filterValue = $(this).data('filter-value');
    const filterParam = $(this).data('filter-param');
    const filterPercentage = $(this).data('filter-percentage');
    $('.btn-group-more-filter .dropdown-menu-list').hide();
    renderDropdownMenuInput({
      filterName,
      filterOperation,
      filterValue,
      filterPercentage,
      filterParam,
      id
    }, onApplyFilter);
    $('.btn-group-more-filter .dropdown-menu-input').show();
  })
}

function renderDropdownMenuInput(filter, onApplyFilter) {
  if (!filter) {
    return
  }
  const container = $('.btn-group-more-filter .dropdown-menu-input');
  container.empty().append(getDropdownMenuInputHTML(filter))
  registerDropdownMenuInputEvents(filter, onApplyFilter);
}

function getDropdownMenuInputHTML(filter) {
  const { filterName, filterOperation, filterValue, percentage } = filter;
  return `
  <!-- Header start -->
    <div class="d-flex mb-3">
        <img src="img/ic_chevron-left.svg" class="mr-3 go-back cursor-pointer" />
        <p class="mb-0 font-bold medium-font">${filterName}</p>
    </div>
  <!-- Header end -->
  <!-- Content start -->
  <div class="content">
    <div class="d-flex justify-content-between mb-3">
      <button type="button" class="btn btn-outline btn-default mr-2 ${filterOperation === '>' ? 'active' : ''}" data-filter-operation="&gt;">&gt; More Than</button>
      <button type="button" class="btn btn-outline btn-default ${filterOperation === '<' ? 'active' : ''}" data-filter-operation="&lt;">&lt; Less Than</button>
    </div>
    <div class="position-relative">
      <input type="text" class="form-control" value="${filterValue}">
      <p class="mb-0 percent medium-font">${percentage ? '%' : ''}</p>
    </div>
  </div>
  <!-- Content end -->
  <!-- Footer start -->
  <div class="d-flex justify-content-end">
    <button type="button" class="close-cta btn btn-outline btn-link font-bold text-navy">Apply</button>
  </div>
  <!-- Footer end -->
  `
}

function registerDropdownMenuInputEvents(filter, onApplyFilter) {
  // in dropdown menu input toggle active class on buttons
  $('.btn-group-more-filter .dropdown-menu-input .content .btn').click(function () {
    $('.btn-group-more-filter .dropdown-menu-input .content .btn').removeClass('active');
    $(this).addClass('active');
  })

  // close dropdown menu input
  $('.close-cta').unbind().click(function () {
    const container = $('.btn-group-more-filter .dropdown-menu-input');
    const filterOperation = $(container).find('.content .btn.active').data('filter-operation');
    const filterValue = $(container).find('input[type="text"]').val()
    const selectedFilter = {
      ...filter,
      filterOperation,
      filterValue
    }
    container.hide();
    onApplyFilter(selectedFilter)
  })

  // go back to dropdown menu list on click of chevron
  $('.dropdown-menu-input .go-back').unbind().click(function () {
    $('.btn-group-more-filter .dropdown-menu-input').hide();
    $('.btn-group-more-filter .dropdown-menu-list').show();
  })
}

// process selected filters and create query params 
function getSelectedFiltersQueryParams(selectedFilters) {
  if (!selectedFilters || !Array.isArray(selectedFilters)) {
    return '';
  }
  let queryParamString = '?';
  selectedFilters.forEach((filter, index) => {
    queryParamString = queryParamString + filter.filterParam + filter.filterOperation + filter.filterValue;
    if (index < selectedFilters.length - 1) {
      queryParamString += '&'
    }
  })
  return queryParamString;
}

// register table sort events
function tableSortEvents(container, onTableSort = () => { }) {
  container.find('thead th .sort-header').unbind().click(function () {
    const sortKey = $(this).data('sort-key');
    const arrow = $(this).find('.arrow');
    let direction; // desc or asc
    const isArrowHidden = arrow.hasClass('d-none');
    if (isArrowHidden) {
      // showing arrow down, hence descending
      // container.find('thead th .sort-header .arrow').addClass('d-none');
      // arrow.removeClass('d-none');
      direction = 'desc';
    } else {
      const isArrowUp = arrow.hasClass('up-arrow-sort');
      // if up arrow is present remove and add down arrow
      if (isArrowUp) {
        // adding arrow down, hence descending
        arrow.removeClass('up-arrow-sort').addClass('down-arrow-sort');
        direction = 'desc';
      } else {
        // if down arrow remove and add up arrow, hence ascending
        direction = 'asc';
        arrow.removeClass('down-arrow-sort').addClass('up-arrow-sort');
      }
    }
    onTableSort(sortKey, direction);
  })
}

// validate text inputs
function validateTextInput(target, test = () => { }, errorMessage = 'Invalid input') {
  $(target).off().on('blur', function (event) {
    if (!test(event.target.value)) {
      // show error
      $(this).addClass('error');
      $(`<p class="mb-0 position-absolute error-message text-error-red d-flex"><img src="img/ic_error.svg" class="mr-2"/>${errorMessage}</p>`).insertAfter($(this));
    } else {
      // remove error
      $(this).removeClass('error');
      $(this).siblings('.error-message').remove();
    }
  })
}

// validate buy sell popup inputs
function validateBuySellPopupInputs() {
  // validate volume input 
  validateTextInput($('#buy-sell-modal #volume-input'), function (val) {
    if (isNaN(val)) {
      return false;
    }
    if (val === '') {
      return true;
    }
    const numVal = Number(val);
    if (numVal >= 0.01 && numVal <= 100) {
      return true
    }
    return false
  }, 'Number only')
  // validate take profit input
  validateTextInput($('#buy-sell-modal #profit-input'), validateNumber, 'Number only')

  // validate stop loss input
  validateTextInput($('#buy-sell-modal #loss-input'), validateNumber, 'Number only')

  // validate price input
  validateTextInput($('#buy-sell-modal #price-input'), validateNumber, 'Number only')
}

function validateNumber(val) {
  if (isNaN(val)) {
    return false;
  }
  if (val === '') {
    return true;
  }
  const numVal = Number(val);
  if (numVal >= 0) {
    return true
  }
  return false
}

function validatePercentage(val) {
  if (isNaN(val)) {
    return false;
  }
  if (val === '') {
    return true;
  }
  const numVal = Number(val);
  if (numVal >= 0 && numVal <= 100) {
    return true
  }
  return false
}

function countDecimals(num) {
  if (isNaN(num)) {
    return 0;
  }
  if (Math.floor(num) === num) return 0;
  return num.toString().split(".")[1].length || 0;
}

function fixDecimals(element, numVal, allowedDecimalCount) {
  const enteredDecimalCount = countDecimals(numVal);
  if (enteredDecimalCount < allowedDecimalCount) {
    const diff = allowedDecimalCount - enteredDecimalCount;
    let numValString = numVal.toString();
    [integral, decimal] = numValString.split('.');
    if (!decimal) {
      decimal = '';
    }
    for (let i = 0; i < diff; i++) {
      decimal += '0';
    }
    element.val(`${integral}.${decimal}`)
  } else if (enteredDecimalCount > allowedDecimalCount) {
    const numValString = numVal.toFixed(allowedDecimalCount);
    element.val(numValString)
  }
}