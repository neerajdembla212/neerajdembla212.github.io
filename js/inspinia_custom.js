class GlobalState {
  buySellData = {};
  tradeDetails = {};
  isBuySellFormValid = {
    volume: false,
    profit: false,
    loss: false
  }
  getBuySellData() {
    return this.buySellData;
  }
  setBuySellData(data) {
    if (!data) {
      return;
    }
    this.buySellData = data;
  }
  setIsBuySellFormValid(control, data) {
    if (typeof data !== 'boolean') {
      return
    }
    if (control !== '*' && !this.isBuySellFormValid.hasOwnProperty(control)) {
      return;
    }
    if (control === '*') {
      this.isBuySellFormValid.volume = data;
      this.isBuySellFormValid.profit = data;
      this.isBuySellFormValid.loss = data;
    } else {
      this.isBuySellFormValid[control] = data;
    }
  }
  getIsBuySellFormValid() {
    return this.isBuySellFormValid.volume && this.isBuySellFormValid.profit && this.isBuySellFormValid.loss;
  }
  getTradeDetails() {
    return this.tradeDetails;
  }
  setTradeDetails(data) {
    if (!data) {
      return;
    }
    this.tradeDetails = data;
  }
}
const GLOBAL_STATE = new GlobalState();
$(document).ready(function () {
  if (!checkUserLogin()) {
    window.location.href = window.origin + '/login.html'
  }
  resetBuySellData();
  registerEventHandlers();
  initData();
  validateBuySellPopupInputs();
  fetchNotifications();
  const isNavbarMini = localStorage.getItem('mini-navbar');
  if (isNavbarMini === "true") {
    $('.custom-nav-cta').click();
  }
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
  showRoleOnNav();
  // Open close watchlist right sidebar
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
    railOpacity: 0.9,
    alwaysVisible: true
  });
  // change event for global search
  $('#top-search').unbind().change(function (event) {
    const searchQuery = event.currentTarget.value;
    fetchGlobalSearch(searchQuery);
  })

  // create demo accout show toast
  $('#create-demo-modal #create-demo-account').unbind().click(function () {
    renderSuccessToast(i18n.t('body.common.demoAccountSuccess'))
  })
}

function fetchGlobalSearch(searchQuery) {
  callAjaxMethod({
    url: `https://mockapi.huatliao.com/copypip/global-search?q=${searchQuery}`,
    successCallback: (data) => {
      renderGlobalSearchResult(data.data);
    },
  });
}

function renderGlobalSearchResult(data) {
  const container = $('.global-search-container .global-dropdown-menu');
  const rowsHTML = [];
  data.forEach((result, i) => {
    const isLast = i === data.length - 1;
    rowsHTML.push(getGlobalSearchResultHTML(result, isLast))
  })
  container.removeClass('d-none').empty().append(rowsHTML.join(''))
}

function getGlobalSearchResultHTML(data, isLast) {
  const { profile_image, username, role } = data;
  return `
    <div class="option d-flex justify-content-between ${!isLast ? 'mb-3' : ''}">
      <div class="d-flex align-items-center">
        <img src="${profile_image}" class="rounded-circle img-fluid img-sm mr-3 float-left"/>
        <p class="m-0 p-0 font-weight-bold">${username}</p>
      </div>
      <p class="p-0 m-0 font-weight-light">${role}</p>
    </div>
  `
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
    url: 'https://mockapi.huatliao.com/copypip/get-user-config',
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
      let profileImageUrl = defaultAccount.profile_image
      if (!localStorage.getItem('profileImage')) {
        localStorage.setItem('profileImage', defaultAccount.profile_image);
      } else {
        profileImageUrl = localStorage.getItem('profileImage');
      }
      $('.nav-profile-img').attr('src', profileImageUrl);
      // registerBuySellModalEvents(data.data.tradeData);
      renderHideUnhideButton(); // this function will render hide/unhide stategy account button on My Portfolio page and settings page
      renderBuySellData();
    }
  })
  // set view type as grid for Strategy Provider page
  if (!localStorage.getItem('viewType')) {
    localStorage.setItem('viewType', 'grid');
  }
}

// hide unhide button start
function renderHideUnhideButton() {
  const container = $('.hide-strategy-button-container');
  const selectedAccountNo = localStorage.getItem('selectedAccountNo');
  if (!selectedAccountNo) {
    return
  }
  const hiddenStrategyAccounts = JSON.parse(localStorage.getItem('hiddenStrategyAccounts'));
  let buttonHTML = '';
  const currentRole = localStorage.getItem('currentRole');
  const selectedAccountType = localStorage.getItem('selectedAccountType');
  if (currentRole === 'follower' || selectedAccountType.toUpperCase() === 'DEMO') {
    container.empty();
    return;
  }
  if (!Array.isArray(hiddenStrategyAccounts)) {
    buttonHTML = `<button id="hide-strategy-account" class="btn btn-default btn-warning" type="button" data-toggle="modal"
    data-target="#hide-strategy-modal">${i18n.t('body.mp.hideStrategyAccount')}</button>`
  } else {
    const isHidden = hiddenStrategyAccounts.find(a => a === selectedAccountNo);
    if (isHidden) {
      buttonHTML = `<button id="unhide-strategy-account" class="btn btn-default btn-warning" type="button" data-toggle="modal"
      data-target="#unhide-strategy-modal">${i18n.t('body.mp.unhideStrategyAccount')}</button>`
    } else {
      buttonHTML = `<button id="hide-strategy-account" class="btn btn-default btn-warning" type="button" data-toggle="modal"
      data-target="#hide-strategy-modal">${i18n.t('body.mp.hideStrategyAccount')}</button>`
    }
  }
  container.empty().append(buttonHTML);
}
// hide unhide button end

// account switcher start
function renderAccountSwitcher(userAccounts) {
  if (!userAccounts || !Array.isArray(userAccounts)) {
    return
  }
  const selectedLanguage = localStorage.getItem('selectedLanguage');
  let createDemoAccountLabel = '';
  switch (selectedLanguage) {
    case 'en': createDemoAccountLabel = 'Create Demo Account'; break;
    case 'cn': createDemoAccountLabel = '??????????????????'; break;
    case 'id': createDemoAccountLabel = 'Buat Akun Demo'; break;
    case 'my': createDemoAccountLabel = 'Buka Akaun Demo'; break;
    case 'th': createDemoAccountLabel = '??????????????????????????????????????????'; break;
    case 'vn': createDemoAccountLabel = 'T???o t??i kho???n demo'; break;
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
                class="mr-2 text-navy live extra-small-font font-bold ${accountType === 'DEMO' ? 'demo' : ''}">${i18n.t(`body.common.${accountType.toLowerCase()}`)}</span><span
                class="medium-font font-bold small-font">${accountNo}</span>
            </div>
            ${selectedAccountNo === accountNo ? '<img class="ml-2" src="img/ic_tick.svg" />' : ''}
        </li>
    `)
  })
  rowsHTML.unshift(`
    <li class="dropdown-item font-bold text-navy py-2 cursor-pointer px-3" data-account-no="create" data-toggle="modal"
    data-target="#create-demo-modal" data-i18="nav.createDemoAccount">
      ${createDemoAccountLabel}
    </li>
  `)
  container.empty().append(rowsHTML.join(''))
  const accountSwitcherCTA = $('.account-switcher-cta');
  accountSwitcherCTA.find('.text').text(i18n.t(`body.common.${selectedAccountType.toLowerCase()}`));
  if (selectedAccountType.toUpperCase() === 'LIVE') {
    accountSwitcherCTA.addClass('active');
    accountSwitcherCTA.children('.down-arrow').removeClass('down-arrow-gray').addClass('down-arrow-green');
  } else {
    accountSwitcherCTA.removeClass('active').addClass('demo');
    accountSwitcherCTA.children('.down-arrow').removeClass('down-arrow-green').addClass('down-arrow-gray');
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
    const expirationDateInput = $('#buy-sell-modal #expiration-date-input');
    expirationDateInput.removeAttr('disabled');
    if (selectedItem.toUpperCase() === 'GOOD TILL CANCELLED (GTC)') {
      expirationDateInput.attr('disabled', 'true');
    } else if (selectedItem.toUpperCase() === 'DAY ORDER') {
      const expirationDate = data.day_order_expiration_date;
      expirationDateInput.val(formatDate(new Date(expirationDate), 'DD MMM YYYY HH:mm'))
    }
  })

  $('#buy-sell-modal #expiration-date-input').val(formatDate(new Date(data.day_order_expiration_date), 'DD MMM YYYY HH:mm'));
  // expiration date picker
  $('#buy-sell-modal #expiration-date-input').datetimepicker({
    todayBtn: true,
    minuteStep: 1,
    autoclose: true,
    pickerPosition: 'bottom-left'
  });
}
// fetch buy sell initial data end

// fetch notifications start
function fetchNotifications() {
  callAjaxMethod({
    url: "https://mockapi.huatliao.com/copypip/notifications",
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
  const { profile_image, message, timestamp, user_name, reverse } = notification;
  const displayMessage = reverse ? `${user_name} ${i18n.t(message)}` : `${i18n.t(message)} ${user_name}`;
  return `
  <li class="d-flex m-0 justify-content-between p-2">
      <div class="m-0 d-flex">
          <img alt="image" class="rounded-circle img-fluid img-sm float-left ml-0 mr-2" src="${profile_image}" />
          <p class="m-0 font-weight-light medium-font w-75">${displayMessage}</p>
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
function formatDate(date, format = "DD MMM YYYY", resetTime = false) {
  if (!isDateValid(date)) {
    return '';
  }
  let da = +new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
  const mmm = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
  let mm = +new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date);
  let ye = +new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
  let hr = +new Intl.DateTimeFormat('en', { hour: '2-digit', hour12: false }).format(date);
  let min = +new Intl.DateTimeFormat('en', { minute: '2-digit' }).format(date);
  let initialHr = +new Intl.DateTimeFormat('en', { hour: 'numeric', hourCycle: 'h23' }).format(date);
  let initialMin = +new Intl.DateTimeFormat('en', { minute: 'numeric', hourCycle: 'h23' }).format(date);
  // add prefix zero if value is < 10
  da = addPrefixZero(da);
  mm = addPrefixZero(mm);
  ye = addPrefixZero(ye);
  hr = addPrefixZero(hr);
  min = addPrefixZero(min);
  initialHr = addPrefixZero(initialHr)
  initialMin = addPrefixZero(initialMin)

  switch (format) {
    case 'DD MMM YYYY': return `${da} ${mmm} ${ye}`;
    case 'DD MM YYYY HH:mm': return `${da} ${mm} ${ye} ${resetTime ? initialHr : hr}:${resetTime ? initialMin : min}`;
    case 'DD MMM YYYY HH:mm': return `${da} ${mmm} ${ye} ${resetTime ? initialHr : hr}:${resetTime ? initialMin : min}`;
    case 'DD/MM/YYYY HH:mm': return `${da}/${mm}/${ye} ${resetTime ? initialHr : hr}:${resetTime ? initialMin : min}`;
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
    durationStr += `${years} ${short ? `${i18n.t('body.common.yr')} ` : `${i18n.t('body.common.years')} `}`
  }
  if (months > 0) {
    durationStr += `${months} ${short ? `${i18n.t('body.common.mths')} ` : `${i18n.t('body.common.months')} `}`;
  }
  if (days <= 31) {
    durationStr += `${days} ${i18n.t('body.common.days')}`;
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
  return `<b>${i18n.t('body.common.byNumberOfTrades')}</b> ${i18n.t('body.common.noOfTradesTooltipText')}`
}

function getLevelOfEquityTooltipText() {
  return `<b>${i18n.t('body.common.byLevelOfEquity')}</b> ${i18n.t('body.common.levelOfEquityTooltipText')}`
}
// render follow provider start
function renderFollowProviderPopup(strategyProviderDetails) {
  const bodyContainer = $('#follow-provider-modal .modal-body');
  bodyContainer.empty().append(getFollowProviderPopupBody(strategyProviderDetails));
  const footerContainer = $('#follow-provider-modal .modal-footer');
  footerContainer.empty().append(getFollowProviderPopupFooter())
  registerFollowProviderPopupEvents();
  validateFollowProviderPopupInputs($('#follow-provider-modal'));
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
              <div class="uppercase-label">${i18n.t('body.mp.totalReturns')}</div>
              <div class="text-dark-green d-flex align-items-center"><span class="up-arrow-green mr-1"></span><span
                  class="font-bold">${cumulative_returns}%</span></div>
            </div>
            <div class="w-50 d-flex justify-content-between align-items-center">
              <div class="uppercase-label">${i18n.t('body.sp.advisedMin')}</div>
              <div class="text-light-gray medium-font font-bold">$${formatWithCommas(advised_min)}</div>
            </div>
          </div>
    <!-- Data display Row 1 end -->
    <!-- Data display Row 2 start -->
    <div class="d-flex justify-content-between mb-2">
      <div class="w-50 d-flex justify-content-between mr-3 align-items-center">
        <div class="uppercase-label">${i18n.t('body.common.avgLotSize')}</div>
        <div class="font-bold medium-font">${avg_lot_size}</div>
      </div>
      <div class="w-50 d-flex justify-content-between align-items-center">
        <div class="uppercase-label">${i18n.t('body.sp.drawdown')}</div>
        <div class="text-light-red medium-font">${max_drawdown}%</div>
      </div>
    </div>
    <!-- Data display Row 2 end -->
    <!-- Data display Row 3 start -->
      <div class="d-flex justify-content-between mb-2">
        <div class="w-50 d-flex justify-content-between mr-3 align-items-center">
          <div class="uppercase-label">${i18n.t('body.sp.age')}</div>
          <div class="font-bold medium-font">${translateYearMonths(strategy_age)}</div>
        </div>
        <div class="w-50 d-flex justify-content-between align-items-center">
          <div class="uppercase-label">${i18n.t('body.mp.pShare%')}</div>
          <div class="medium-font">${profit_sharing}%</div>
        </div>
      </div>
      <!-- Data display Row 3 end -->
      <!-- tabs header start -->
      <div>
        <ul class="nav nav-tabs flex-nowrap py-3" role="tablist">
          <li class="mr-2">
            <a class="nav-link active" data-toggle="tab" href="#automatic">${i18n.t('body.common.automatic')}</a>
          </li>
          <li class="mr-2">
            <a class="nav-link" data-toggle="tab" href="#percentage">${i18n.t('body.common.percentage')}</a>
          </li>
          <li class="mr-2">
            <a class="nav-link" data-toggle="tab" href="#fixed">${i18n.t('body.common.fixed')}</a>
          </li>
          <li>
            <a class="nav-link" data-toggle="tab" href="#proportional">${i18n.t('body.common.proportional')}</a>
          </li>
        </ul>
      </div>
      <!-- tabs header end -->
      <div class="tab-content py-3">
      <!-- Automatic Tab content -->
      <!-- For Read more/less to function the parent must have "read-more-less" class -->
        <div role="tabpanel" id="automatic" class="tab-pane active read-more-less">
          <p class="font-bold medium-font text-modal-black mb-2">${i18n.t('body.common.automaticTabHeading')}
          </p>
          <p class="text-modal-gray extra-large-font mb-2">${i18n.t('body.common.automaticTabP1')}</p>
          <p class="small-font read-less-text mb-0"><button type="button"
              class="btn btn-outline btn-link font-bold p-0 text-navy btn-read-more">${i18n.t('body.common.learnMore')}</button> ${i18n.t('body.common.about')}
            <b>${i18n.t('body.common.automaticSettingsAdjustments')}</b>
          </p>
          <div class="read-more-text d-none m-0">
            <p class="m-0">${i18n.t('body.common.automaticTabP2')}</p>
            <p class="d-flex justify-content-end m-0">
              <button type="button"
                class="btn btn-outline btn-link font-bold p-0 float-right text-navy small-font btn-read-less">${i18n.t('body.common.showLess')}</button>
            </p>
          </div>
        </div>
        <!-- Percentage Tab content -->
        <div role="tabpanel" id="percentage" class="tab-pane read-more-less">
          <p class="font-bold medium-font text-modal-black mb-2">${i18n.t('body.common.percentageTabHeading')}
          </p>
          <p class="mb-2 text-light-red">${i18n.t('body.common.percentageTabP1')}</p>
          <div class="d-flex align-items-center mb-3">
            <div class="btn-group mr-3">
              <button data-toggle="dropdown" class="btn btn-default dropdown-toggle">
                ${i18n.t('body.common.percentage')}
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item">${i18n.t('body.common.percentage')}</a></li>
                <li>
                  <a class="dropdown-item">${i18n.t('body.common.absoluteValue')}</a>
                </li>
              </ul>
            </div>
            <div class="position-relative w-25 mr-3">
              <input type="text" class="form-control" id="percentage-input">
            </div>
            <span class="font-bold medium-font text-dark-black">%</span>
          </div>
          <p class="small-font read-less-text mb-0"><button type="button"
              class="btn btn-outline btn-link font-bold p-0 text-navy btn-read-more">${i18n.t('body.common.learnMore')}</button> ${i18n.t('body.common.about')}
            <b>${i18n.t('body.common.percentageOfTotalBalance')}</b>
          </p>
          <div class="read-more-text d-none m-0">
            <p class="m-0">${i18n.t('body.common.percentageTabP2')}</p>
            <p class="d-flex justify-content-end m-0">
              <button type="button"
                class="btn btn-outline btn-link font-bold p-0 float-right text-navy small-font btn-read-less">${i18n.t('body.common.showLess')}</button>
            </p>
          </div>
        </div>

        <!-- fixed Tab content -->
        <div role="tabpanel" id="fixed" class="tab-pane read-more-less">
          <p class="font-bold medium-font text-modal-black mb-2">${i18n.t('body.common.fixedTabHeading')}
          </p>
          <p class="mb-2 text-light-red">${i18n.t('body.common.fixedTabP1')}</p>
          <div class="d-flex align-items-center mb-3">
            <label class="col-form-label mr-3 font-bold text-dark-black">${i18n.t('body.common.fixedTradeSize')}</label>
            <div class="position-relative w-25 mr-3">
              <input type="text" class="form-control" id="fixed-trade-size">
            </div>
            <span class="font-bold medium-font text-dark-black">${i18n.t('body.common.lot')}</span>
          </div>
          <p class="small-font read-less-text mb-0"><button type="button"
              class="btn btn-outline btn-link font-bold p-0 text-navy btn-read-more">${i18n.t('body.common.learnMore')}</button> ${i18n.t('body.common.about')}
            <b>${i18n.t('body.common.fixedLotSize')}</b>
          </p>
          <div class="read-more-text d-none m-0">
            <p class="m-0">${i18n.t('body.common.fixedTabP2')}</p>
            <p class="d-flex justify-content-end m-0">
              <button type="button"
                class="btn btn-outline btn-link font-bold p-0 float-right text-navy small-font btn-read-less">${i18n.t('body.common.showLess')}</button>
            </p>
          </div>
        </div>

        <!-- Proportional tab content -->
        <div role="tabpanel" id="proportional" class="tab-pane read-more-less">
          <p class="font-bold medium-font text-modal-black mb-2">${i18n.t('body.common.proportionalTabHeading')}
          </p>
          <p class="mb-2 text-light-red">${i18n.t('body.common.proportionalTabP1')}</p>
          <div class="d-flex align-items-center mb-3">
            <label class="col-form-label mr-3 font-bold text-dark-black">${i18n.t('body.common.ratioOfTradeSize')}</label>
            <div class="position-relative w-25 mr-3">
              <input type="text" class="form-control" id="trade-size-ratio">
            </div>
            <span class="font-bold medium-font text-dark-black">${i18n.t('body.common.ratio')}</span>
          </div>
          <p class="small-font read-less-text mb-0"><button type="button"
              class="btn btn-outline btn-link font-bold p-0 text-navy btn-read-more">${i18n.t('body.common.learnMore')}</button> ${i18n.t('body.common.about')}
            <b>${i18n.t('body.common.proportionalTradeSize')}</b>
          </p>
          <div class="read-more-text d-none m-0">
            <p class="m-0">${i18n.t('body.common.proportionalTabP2')}</p>
            <p class="d-flex justify-content-end m-0">
              <button type="button"
                class="btn btn-outline btn-link font-bold p-0 float-right text-navy small-font btn-read-less">${i18n.t('body.common.showLess')}</button>
            </p>
          </div>
        </div>

    </div>
    <section class="risk-mangement py-3">
    <p class="font-bold medium-font">${i18n.t('body.common.riskManagement')} </p>
    <!-- Lot size input start -->
    <div class="d-flex justify-content-between mb-3">
      <div class="w-75 mr-3">
        <p class="text-gray medium-font mb-1">${i18n.t('body.common.minimumLotSize')}</p>
        <div class="d-flex align-items-center">
          <div class="position-relative w-50 mr-3">
            <input type="text" class="form-control" id="min-lot-size">
          </div>
          <span class="font-bold medium-font text-dark-black">${i18n.t('body.common.lot')}</span>
        </div>
      </div>
      <div>
        <p class="text-gray medium-font mb-1">${i18n.t('body.common.maximumLotSize')}</p>
        <div class="d-flex align-items-center">
        <div class="position-relative w-75 mr-3">
          <input type="text" class="form-control" id="max-lot-size">
        </div>
          <span class="font-bold medium-font text-dark-black">${i18n.t('body.common.lot')}</span>
        </div>
      </div>
    </div>
    <!-- Lot size input end -->
    <!-- Fix profit/loss input start -->
    <div class="d-flex justify-content-between mb-3">
      <div class="w-75 mr-3">
        <p class="text-gray medium-font mb-1">${i18n.t('body.common.fixTakeProfit')}</p>
        <div class="d-flex align-items-center">
        <div class="position-relative w-50 mr-3">
          <input type="text" class="form-control" id="take-profit-input">
        </div>
          <span class="font-bold medium-font text-dark-black">${i18n.t('body.common.pips')}</span>
        </div>
      </div>
      <div>
        <p class="text-gray medium-font mb-1">${i18n.t('body.common.fixStopLoss')}</p>
        <div class="d-flex align-items-center">
          <div class="position-relative w-75 mr-3">
            <input type="text" class="form-control" id="stop-loss-input">
          </div>
          <span class="font-bold medium-font text-dark-black">${i18n.t('body.common.pips')}</span>
        </div>
      </div>
    </div>
    <!-- Fix profit/loss input end -->
    <!-- Limit quantity input start -->
    <div class="form-check abc-checkbox form-check-inline">
      <input id="limit-quantity-checkbox" class="form-check-input mr-3" type="checkbox" value="checked">
      <label class="form-check-label text-gray medium-font"> ${i18n.t('body.common.limitQuantityOfSimultaneousTrades')}
      </label>
    </div>
    <!-- No of trades input start -->
    <section id="limit-quantity-input" class="d-none">
      <div class="d-flex justify-content-between mt-2">
        <div class="w-50">
          <p class="text-gray medium-font mb-1">${i18n.t('body.common.byNumberOfTrades')} <i class="fa fa-question-circle cursor-pointer ml-1" data-toggle="tooltip" data-placement="left" data-html="true" title="${getNoOfTradesTooltipText()}"></i></p>
          <div class="position-relative w-50">
            <input type="text" class="form-control" id="no-of-trades">
          </div>
        </div>
        <div>
          <p class="text-gray medium-font mb-1">${i18n.t('body.common.byLevelOfEquity')} <i class="fa fa-question-circle cursor-pointer ml-1" data-toggle="tooltip" data-html="true" data-placement="right" title="${getLevelOfEquityTooltipText()}"></i></p>
          <div class="d-flex align-items-center">
            <div class="position-relative w-75 mr-3">
              <input type="text" class="form-control" id="level-of-equity">
            </div>
            <span class="font-bold medium-font text-dark-black">%</span>
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
  const accountType = localStorage.getItem('selectedAccountType').toLowerCase();
  return `
    <div class="account-number p-1"><span class="mr-1 text-navy live">${i18n.t(`body.common.${accountType}`)}</span><span class="medium-font font-bold">${accountNo}</span></div>
    <button type="button" class="btn btn-primary" id="follow-provider">${i18n.t('body.sp.followProvider')}</button>
    `
}

function validateFollowProviderPopupInputs(container) {
  const numberOnlyMessage = i18n.t('body.common.numberOnly');
  // validate Minimum lot size input
  validateTextInput(container.find('#min-lot-size'), validateNumber, numberOnlyMessage)

  // validate Maximum lot size input
  validateTextInput(container.find('#max-lot-size'), validateNumber, numberOnlyMessage)

  // validate Take profit input
  validateTextInput(container.find('#take-profit-input'), validateNumber, numberOnlyMessage)

  // validate Stop loss input
  validateTextInput(container.find('#stop-loss-input'), validateNumber, numberOnlyMessage)

  // validate number of trades
  validateTextInput(container.find('#no-of-trades'), validateNumber, numberOnlyMessage)

  // validate level of equity
  validateTextInput(container.find('#level-of-equity'), validateNumber, numberOnlyMessage)

  // validate percentage input
  validateTextInput(container.find('#percentage-input'), validatePercentage, numberOnlyMessage);

  // validate fixed trade size input
  validateTextInput(container.find('#fixed-trade-size'), validatePercentage, numberOnlyMessage);

  // validate Trade size ratio input
  validateTextInput(container.find('#trade-size-ratio'), validatePercentage, numberOnlyMessage);
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
    const filterName = i18n.t($(this).data('filter-name'));
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

function registerSelectedFilterEvents() {
  $('.selected-filters-container .currency-chip').unbind().click(function () {
    const filterId = $(this).data('id');
    if (filterId) {
      $(`.btn-group-more-filter .dropdown-menu>li.dropdown-item[data-id="${filterId}"]`).click();
    }
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
    <div class="d-flex mb-3 align-items-center">
        <img src="img/ic_chevron-left.svg" class="mr-3 go-back cursor-pointer" />
        <p class="mb-0 font-bold medium-font">${filterName}</p>
    </div>
  <!-- Header end -->
  <!-- Content start -->
  <div class="content">
    <div class="d-flex justify-content-between mb-3">
      <button type="button" class="btn btn-outline btn-default mr-2 ${filterOperation === '>' ? 'active' : ''}" data-filter-operation="&gt;">&gt; ${i18n.t('body.common.moreThan')}</button>
      <button type="button" class="btn btn-outline btn-default ${filterOperation === '<' ? 'active' : ''}" data-filter-operation="&lt;">&lt; ${i18n.t('body.common.lessThan')}</button>
    </div>
    <div class="position-relative">
      <input type="text" class="form-control" value="${filterValue}">
      <p class="mb-0 percent medium-font">${percentage ? '%' : ''}</p>
    </div>
  </div>
  <!-- Content end -->
  <!-- Footer start -->
  <div class="d-flex justify-content-end">
    <button type="button" class="close-cta btn btn-outline btn-link font-bold text-navy">${i18n.t('body.common.apply')}</button>
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
function validateTextInput(target, test = () => { }, errorMessage = i18n.t('body.common.invalidInput')) {
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
  }, i18n.t('body.common.numberOnly'))
  // validate take profit input
  validateTextInput($('#buy-sell-modal #profit-input'), validateNumber, i18n.t('body.common.numberOnly'))

  // validate stop loss input
  validateTextInput($('#buy-sell-modal #loss-input'), validateNumber, i18n.t('body.common.numberOnly'))

  // validate price input
  validateTextInput($('#buy-sell-modal #price-input'), validateNumber, i18n.t('body.common.numberOnly'))
}

// render toast start
function renderSuccessToast(message) {
  const toastBox = $('.toast');
  toastBox.addClass('success').find('.toast-body').text(message);
  toastBox.toast('show');
}

function renderErrorToast(message) {
  const toastBox = $('.toast');
  toastBox.addClass('error').find('.toast-body').text(message);
  toastBox.toast('show');
}

function renderNeutralToast(message) {
  const toastBox = $('.toast');
  toastBox.addClass('neutral').find('.toast-body').text(message);
  toastBox.toast('show');
}
// render toast end

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

function initI18nPlugin() {
  const language = localStorage.getItem('selectedLanguage')
  language && $('.language-container .selected-language').text(language.toUpperCase());

  $('.language-switcher li').unbind().click(function () {
    const language = $(this).data('value');
    localStorage.setItem('selectedLanguage', language);
    $('.language-container .selected-language').text(language.toUpperCase())
    i18n.setLng(language, function () {
      $('#wrapper').i18n();
      window.reloadElementsOnLanguageChange();
      showRoleOnNav();
      const userAccounts = JSON.parse(localStorage.getItem('userAccounts'));
      renderAccountSwitcher(userAccounts);
      $('.navbar-static-top .search-copypip').attr('placeholder', i18n.t('topnav.searchCopypip'));
      fetchNotifications();
    })
  })

  return $.i18n.init({
    resGetPath: 'locales/__lng__.json',
    load: 'unspecific',
    fallbackLng: false,
    lng: language || 'en',
  }, function (t) {
    $('#wrapper').i18n();
    $('.navbar-static-top .search-copypip').attr('placeholder', i18n.t('topnav.searchCopypip'));
  });
}

function showRoleOnNav() {
  // display selected role on nav header
  const storedRole = localStorage.getItem('currentRole');
  const selectedLanguage = localStorage.getItem('selectedLanguage') ? localStorage.getItem('selectedLanguage') : 'en';
  let roleText = '';
  if (storedRole === 'provider') {
    switch (selectedLanguage) {
      case 'en': roleText = 'Strategy Provider'; break;
      case 'cn': roleText = '????????????'; break;
      case 'id': roleText = 'Penyedia Strategi'; break;
      case 'my': roleText = 'Penyedia Strategi'; break;
      case 'th': roleText = '?????????????????????????????????????????????????????????'; break;
      case 'vn': roleText = 'Nh?? cung c???p chi???n l?????c'; break;
    }
    $('.nav-header .role').text(roleText);
    $(`.nav-header .dropdown-menu .dropdown-item[data-role="${storedRole}"]`).append('<img src="img/ic_tick.svg" class="ml-2" />')
  } else {
    switch (selectedLanguage) {
      case 'en': roleText = 'Strategy Follower'; break;
      case 'cn': roleText = '?????????'; break;
      case 'id': roleText = 'Pengikut Strategi'; break;
      case 'my': roleText = 'Pengikut Strategi'; break;
      case 'th': roleText = '????????????????????????????????????????????????'; break;
      case 'vn': roleText = 'Ng?????i theo d??i chi???n l?????c'; break;
    }
    $('.nav-header .role').text(roleText);
    localStorage.setItem('currentRole', 'follower');
    $(`.nav-header .dropdown-menu .dropdown-item[data-role="${storedRole}"]`).append('<img src="img/ic_tick.svg" class="ml-2" />')
  }
}

function resetBuySellData() {
  GLOBAL_STATE.setBuySellData({})
  GLOBAL_STATE.setIsBuySellFormValid('*', false);
  const tradeData = localStorage.getItem('tradeData');
  GLOBAL_STATE.setBuySellData({
    ...JSON.parse(tradeData),
    status: 'NEW'
  })
}
function renderBuySellData() {
  const buySellData = GLOBAL_STATE.getBuySellData();
  const container = $('#buy-sell-modal .modal-body');
  const footerContainer = $('#buy-sell-modal .footer-modal');
  $('#buy-sell-modal .modal-title').text(i18n.t('body.common.buySell'));
  container.empty().append(getBuySellDataHTML(buySellData));
  footerContainer.empty().append(getBuySellDataFooterHTML(buySellData));
  // buySellSectionAdjustHeight();
  registerBuySellEvents();
}

function getBuySellDataHTML(data) {
  if (!data) {
    return;
  }
  let {
    status,
    order_number,
    order_type,
    order_time,
    type,
    profit,
    loss,
    volume,
    one_click_trading } = data;

  const selectedAccountType = localStorage.getItem('selectedAccountType');
  const selectedAccountNo = localStorage.getItem('selectedAccountNo');

  const typeValue = type === 'pending_order' ? i18n.t('body.common.pendingOrder') : i18n.t('body.common.marketExecution');
  const orderDetailsHTML = status !== 'NEW' ? `
  <div class="d-flex justify-content-between mb-3">
      <p class="mb-0 font-weight-bold text-dark-gray">${order_type} ORDER #${order_number}</p>
      <p class="mb-0">${formatDate(new Date(order_time), 'DD/MM/YYYY HH:mm')}</p>
  </div>
      ` : '';

  const profitInputHTML = status !== 'NEW' ? `<input type="text" disabled class="form-control" id="profit-input" value=${profit}>` : `<input type="text" class="form-control" id="profit-input" value="0">`;
  const lossInputHTML = status !== 'NEW' ? `<input type="text" disabled class="form-control" id="loss-input" value="${loss}">` : `<input type="text" class="form-control" id="loss-input" value="0">`;
  const volumeInputHTML = status !== 'NEW' ? `<input type="text" disabled class="form-control" id="volume-input" value="${volume}">` : `<input type="text" class="form-control" id="volume-input">`;
  return `
  <!-- order by account start -->
  <div class="d-flex justify-content-between mb-3">
    <p class="mb-0 font-bold">${i18n.t('body.common.orderByAccount')}</p>
    <div class="account-number p-1 ${selectedAccountType === 'DEMO' ? 'demo-account' : ''}"><span class="mr-1 text-navy live small-font ${selectedAccountType === 'DEMO' ? 'demo' : ''}">${i18n.t(`body.common.${selectedAccountType.toLowerCase()}`)}</span><span
        class="medium-font font-bold small-font">${selectedAccountNo}</span>
    </div>
  </div>
  <!-- order by account end -->
  <!-- order details start -->
  ${orderDetailsHTML}
 <!-- order details end -->
  <!-- Currency exchange input start -->
  <div class="d-flex justify-content-between mb-3 align-items-center">
    <div class="line-height-md">
      <p class="mb-0 extra-large-font font-bold text-modal-black">EURUSD</p>
      <p class="mb-0 medium-font font-weight-light text-gray">${i18n.t('body.common.volume')}</p>
    </div>
    <div class="w-50 position-relative">
      ${volumeInputHTML}
    </div>
  </div>
  <!-- Currency exchange input end -->
  <div class="divider mb-3"></div>
  <!-- Type input start -->
  <div class="d-flex justify-content-between mb-3 align-items-center">
      <p class="mb-0 font-weight-light medium-font">${i18n.t('body.common.type')}</p>
      <button id="btn-type-input" data-toggle="dropdown" class="btn dropdown-toggle btn-dropdown font-bold" aria-expanded="false">
          ${typeValue}
      </button>
      <ul id="type-input-menu" class="dropdown-menu" data-value="${type}">
          <li data-value="market_execution"><a class="dropdown-item" href="#">${i18n.t('body.common.marketExecution')}</a></li>
          <li data-value="pending_order"><a class="dropdown-item" href="#">${i18n.t('body.common.pendingOrder')}</a></li>
      </ul>
  </div>
  <!-- Type input end -->
  <div class="divider mb-3"></div>
  <div class="dynamic-elements">
  ${type === 'pending_order' ? getPendingOrderControls() : ''}
  </div>
  <!-- Profit loss display start -->
  ${getProfitLossDisplayHTML()}
  <!-- Profit loss display end -->
  <!-- Profit loss input start -->
  <div class="d-flex justify-content-between mb-2">
      <p class="mb-0 font-weight-light medium-font">${i18n.t('body.common.takeProfit')}</p>
      <p class="mb-0 font-weight-light medium-font">${i18n.t('body.common.stopLoss')}</p>
  </div>
  <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="position-relative w-40">
          ${profitInputHTML}
     </div>
      <span class="font-bold medium-font text-dark-black">${i18n.t('body.common.price')}</span>
      <div class="position-relative w-40">
          ${lossInputHTML}
      </div>
  </div>
  <!-- Profit loss input end -->
  `
}

function getPendingOrderControls() {
  const buySellData = GLOBAL_STATE.getBuySellData();
  const { gtc_expiration_date, day_order_expiration_date } = buySellData;
  let priceInput = `
   <!-- Price input start -->
  <div class="d-flex justify-content-between mb-3 align-items-center">
      <p class="mb-0 font-weight-light medium-font">${i18n.t('body.common.price')}</p>
      <div class="position-relative w-40">
          <input type="text" class="form-control" id="price-input">
      </div>
  </div>
  <!-- Price input end -->
  `
  return ` <!-- Order Type input start -->
  <div class="d-flex justify-content-between mb-3 align-items-center">
      <p class="mb-0 font-weight-light medium-font">${i18n.t('body.common.orderType')}</p>
      <button id="btn-order-type-input" data-toggle="dropdown" class="btn dropdown-toggle btn-dropdown font-bold" aria-expanded="false" data-value="buy_limit">
          ${i18n.t('body.common.buyLimit')}
      </button>
      <ul id="order-type-input-menu" class="dropdown-menu">
          <li data-value="buy_limit"><a class="dropdown-item" href="#">${i18n.t('body.common.buyLimit')}</a></li>
          <li data-value="sell_limit"><a class="dropdown-item" href="#">${i18n.t('body.common.sellLimit')}</a></li>
          <li data-value="buy_stop"><a class="dropdown-item" href="#">${i18n.t('body.common.buyStop')}</a></li>
          <li data-value="sell_stop"><a class="dropdown-item" href="#">${i18n.t('body.common.sellStop')}</a></li>
      </ul>
  </div>
  <!-- Order Type input end -->
  <div class="divider mb-3"></div>
  <!-- Expiration input start -->
  <div class="d-flex justify-content-between mb-3 align-items-center">
      <p class="mb-0 font-weight-light medium-font">${i18n.t('body.common.expiration')}</p>
      <button id="btn-expiration-input" data-toggle="dropdown" class="btn dropdown-toggle btn-dropdown font-bold" aria-expanded="false">
          ${i18n.t('body.common.dayOrder')}
      </button>
      <ul id="expiration-input-menu" class="dropdown-menu">
          <li><a class="dropdown-item" href="#">${i18n.t('body.common.goodTillCancelled')}</a></li>
          <li><a class="dropdown-item" href="#">${i18n.t('body.common.dayOrder')}</a></li>
          <li><a class="dropdown-item" href="#">${i18n.t('body.common.specific')}</a></li>
      </ul>
  </div>
  <!-- Expiration input end -->
  <div class="divider mb-3"></div>
  <!-- Expiration Date input start -->
  <div class="d-flex justify-content-between mb-3 align-items-center">
      <p class="mb-0 font-weight-light medium-font">${i18n.t('body.common.expirationDate')}</p>
      <div class="date d-flex align-items-center">
          <input type="text" value="${formatDate(new Date(day_order_expiration_date), 'DD MMM YYYY HH:mm')}" id="expiration-date-input" data-date-format="dd M yyyy hh:ii" class="border-0 font-bold cursor-pointer" />
          <i class="down-arrow-black"></i>
      </div>
  </div>
  <!-- Expiration Date input end -->
  <div class="divider mb-3"></div>
  ${priceInput}
  `
}

function getBuySellDataFooterHTML(data) {
  const { one_click_trading } = data;
  return `
  <!-- Buy Sell CTA start -->
  ${getBuySellSectionCTA()}
  <!-- Buy Sell CTA end -->
  <!-- one Click trading start-->
  <div class="d-flex justify-content-between align-items-center">
      <p class="mb-0 text-gray font-weight-light">${i18n.t('body.common.oneClickTrading')}</p>
      <input id="one-click-trading-input" type="checkbox" class="js-switch" ${one_click_trading ? 'checked' : ''} />
  </div>
  <!-- one Click trading end-->`
}
function getProfitLossDisplayHTML() {
  let { status,
    from_currency_rate,
    from_currency_delta,
    to_currency_rate,
    to_currency_delta,
    from_currency,
    to_currency,
    volume,
    order_number,
    order_type } = GLOBAL_STATE.getBuySellData();

  switch (status) {
    case 'NEW':
      return `
          <div class="d-flex justify-content-between mb-3 align-items-center">
          <div>
              <p class="mb-0 super-extra-large-font font-bold text-modal-black">${from_currency_rate}</p>
              <p class="mb-0 small-font text-dark-green d-flex align-items-center"><span
                    class="up-arrow-green mr-1"></span>+${from_currency_delta}
              </p>
          </div>
          <div>
              <p class="mb-0 super-extra-large-font font-bold text-modal-black">${to_currency_rate}</p>
              <p class="mb-0 small-font text-dark-green d-flex align-items-center"><span
                    class="up-arrow-green mr-1"></span>+${to_currency_delta}
          </div>
      </div>
          `
    case 'TRADE_OPEN_SUCCESS':
      return `
      <div class="mb-2 d-flex">
          <p class="mb-0 font-bold extra-large-font">#${order_number}</p>
      </div>
      <p class="mb-3 text-light-green super-extra-large-font font-bold">Trade Open Success</p>
      `;
    case 'TRADE_ORDER_PLACED':
      return `
          <div class="mb-2 d-flex">
              <p class="mb-0">#${order_number} <p class="mb-0 text-lowercase">&nbsp;${order_type}&nbsp;</p>${volume} ${from_currency}${to_currency} at ${to_currency_rate}</p>
          </div>
          <p class="mb-3 super-extra-large-font font-bold text-light-green">Order Placed</p>
          `;
    case 'NO_CONNECTION':
      return `
      <div class="mb-2 d-flex">
          <p class="mb-0 font-bold extra-large-font">#${order_number}</p>
      </div>
      <p class="mb-3 text-light-brown super-extra-large-font font-bold">No Connection</p>
      `
    case 'TRADE_CLOSED':
      return `
      <div class="mb-2 d-flex">
          <p class="mb-0">#${order_number} <p class="mb-0 text-lowercase">&nbsp;${order_type}&nbsp;</p>${volume} ${from_currency}${to_currency} at ${to_currency_rate}</p>
      </div>
      <p class="mb-3 super-extra-large-font font-bold">Closed ${volume} at ${to_currency_rate}</p>
      `
    case 'CANCELLED':
      return `
      <div class="mb-2 d-flex">
          <p class="mb-0">#${order_number} <p class="mb-0 text-lowercase">&nbsp;${order_type}&nbsp;</p>${volume} ${from_currency}${to_currency} at ${to_currency_rate}</p>
      </div>
      <p class="mb-3 text-blur-gray super-extra-large-font font-bold">${i18n.t('body.tt.cancelled')}</p>
      `
    default: return ``;
  }
}

function getBuySellSectionCTA() {
  return `<div class="d-flex justify-content-between mb-3 buy-sell-footer">
      <button id="sell-trade" type="button" class="btn btn-w-m btn-default btn-bleed-red w-45 text-white">
      ${i18n.t('body.common.sell')}
      </button>
      <button id="buy-trade" type="button" class="btn btn-w-m btn-primary w-45">
      ${i18n.t('body.common.buy')}
      </button>
      <button id="place-order" type="button" class="btn btn-w-m btn-default btn-medium-blue btn-block text-white d-none">
      ${i18n.t('body.tt.placeOrder')}
      </button>
      </div>`
}

function registerBuySellEvents() {
  const container = $('#buy-sell-modal');
  // switchery radio button
  var elem = document.querySelector('#buy-sell-modal .js-switch');
  new Switchery(elem, {
    color: '#E5E5E5',
    secondaryColor: '#E5E5E5',
    jackColor: '#22D091',
    jackSecondaryColor: "#FFFFFF",
  });

  // change status on click of buy CTA
  container.find('#buy-trade').unbind().click(() => handleClickBuySellTrade('BUY'));

  // change status on click of sell CTA
  container.find('#sell-trade').unbind().click(() => handleClickBuySellTrade('SELL'));

  container.find('#place-order').unbind().click(() => {
    const orderType = container.find('#btn-order-type-input').data('value');
    if (orderType === 'buy_limit' || orderType === 'buy_stop') {
      handleClickBuySellTrade('BUY');
    } else if (orderType === 'sell_limit' || orderType === 'sell_stop') {
      handleClickBuySellTrade('SELL');
    }
  });

  // type input dropdown
  container.find('#type-input-menu.dropdown-menu li').click(event => {
    const selectedValue = $(event.currentTarget).data('value');
    const selectedButton = container.find('#btn-type-input');
    const dropdownMenu = container.find('#type-input-menu.dropdown-menu');
    if (selectedValue === 'market_execution') {
      selectedButton.text(i18n.t('body.common.marketExecution'));
      container.find('.dynamic-elements').addClass('d-none');
      // update footer cta section to sell and buy
      container.find('.buy-sell-footer #sell-trade').removeClass('d-none');
      container.find('.buy-sell-footer #buy-trade').removeClass('d-none');
      container.find('.buy-sell-footer #place-order').addClass('d-none');
    } else if (selectedValue === 'pending_order') {
      selectedButton.text(i18n.t('body.common.pendingOrder'));
      container.find('.dynamic-elements').removeClass('d-none');
      renderPendingOrderFormControls();
      // update footer cta section to place order
      container.find('.buy-sell-footer #sell-trade').addClass('d-none');
      container.find('.buy-sell-footer #buy-trade').addClass('d-none');
      container.find('.buy-sell-footer #place-order').removeClass('d-none');
    }
    dropdownMenu.data('value', selectedValue)
    validateBuySellInputs($('#buy-sell-modal'));
    // buySellSectionAdjustHeight();
  })

  container.find('#one-click-trading-input').off().on('change', function (event) {
    const buySellData = GLOBAL_STATE.getBuySellData();
    GLOBAL_STATE.setBuySellData({
      ...buySellData,
      one_click_trading: event.currentTarget.checked
    })
  })
  validateBuySellInputs($('#buy-sell-modal'));
}

function validateBuySellInputs(container) {
  // validate volume input
  validateTextInput(container.find('#volume-input'), function (val) {
    let isValid = false;
    if (isNaN(val)) {
      isValid = false;
    } else if (val === '') {
      isValid = false;
    } else {
      const numVal = Number(val);
      if (numVal >= 0.01 && numVal <= 100) {
        isValid = true;
      }
    }
    GLOBAL_STATE.setIsBuySellFormValid('volume', isValid);
    return isValid;
  })

  // validate take profit input
  // validateTextInput(container.find('#profit-input'), function (val) {
  //     let isValid = false;
  //     if (isNaN(val)) {
  //         isValid = false;
  //     } else if (val === '') {
  //         isValid = false;
  //     } else {
  //         const numVal = Number(val);
  //         if (numVal >= 0) {
  //             isValid = true;
  //             const allowedDecimalCount = STATE.getBuySellData().decimalCount;
  //             fixDecimals(container.find('#profit-input'), numVal, allowedDecimalCount);
  //         }
  //     }
  //     STATE.setIsBuySellFormValid('profit', isValid);
  //     return isValid;
  // }, '')

  // validate stop loss input
  // validateTextInput(container.find('#loss-input'), function (val) {
  //     let isValid = false;
  //     if (isNaN(val)) {
  //         isValid = false;
  //     } else if (val === '') {
  //         isValid = false;
  //     } else {
  //         const numVal = Number(val);
  //         if (numVal >= 0) {
  //             isValid = true;
  //             const allowedDecimalCount = STATE.getBuySellData().decimalCount;
  //             fixDecimals(container.find('#loss-input'), numVal, allowedDecimalCount);
  //         }
  //     }
  //     STATE.setIsBuySellFormValid('loss', isValid);
  //     return isValid;
  // }, 'Number only')

  // validate price input
  validateTextInput(container.find('#price-input'), function (val) {
    let isValid = false;
    if (isNaN(val)) {
      isValid = false;
    }
    if (val === '') {
      isValid = false;
    } else {
      const numVal = Number(val);
      if (numVal >= 0) {
        isValid = true;
      }
    }
    return isValid;
  }, i18n.t('body.common.numberOnly'))
}

function handleClickBuySellTrade(status) {
  const container = $('#buy-sell-modal');
  container.find('#volume-input').blur();
  container.find('#profit-input').blur();
  container.find('#loss-input').blur();
  validateProfitLossInputs(status);
  if (!GLOBAL_STATE.getIsBuySellFormValid()) {
    // play bad sound and return
    var audioElement = document.querySelector('#error-sound');
    audioElement.play();
    return;
  }
  const buySellData = GLOBAL_STATE.getBuySellData();
  buySellData.order_number = buySellData.order_number ? +buySellData.order_number + 1 : 10796400
  buySellData.order_type = status;
  buySellData.type = $('#buy-sell-modal #type-input-menu.dropdown-menu').data('value');
  buySellData.profit = $('#profit-input').val();
  buySellData.loss = $('#loss-input').val();
  buySellData.volume = $('#volume-input').val();
  // check internet connection
  if (!navigator.onLine) {
    handleBuySellTradeError(buySellData)
    return;
  }
  if (buySellData.type === 'market_execution') {
    // call an api here and on success render buy sell data
    callAjaxMethod({
      url: 'https://mockapi.huatliao.com/copypip/initiate-trade',
      method: 'POST',
      successCallback: () => {
        handleBuySellTradeSuccess(buySellData);
      },
      errorCallback: () => {
        handleBuySellTradeError(buySellData)
      }
    })
  } else if (buySellData.type === 'pending_order') {
    callAjaxMethod({
      url: 'https://mockapi.huatliao.com/copypip/place-order',
      method: 'POST',
      successCallback: () => {
        handleBuySellTradeSuccess(buySellData);
      },
      errorCallback: () => {
        handleBuySellTradeError(buySellData)
      }
    })
  }
}

function handleBuySellTradeSuccess(buySellData) {
  let toastMessage = '';
  if (buySellData.type === 'market_execution') {
    buySellData.status = 'TRADE_OPEN_SUCCESS';
    toastMessage = 'Trade open success';
  } else if (buySellData.type === 'pending_order') {
    buySellData.status = 'TRADE_ORDER_PLACED';
    toastMessage = 'Trade order placed';
  }
  GLOBAL_STATE.setBuySellData(buySellData);
  renderBuySellData();
  // play success sound
  var audioElement = document.querySelector('#success-sound');
  audioElement.play();
  // show toast message
  renderSuccessToast(toastMessage);
  // render buy sell data to new state after 0.5 seconds
  setTimeout(() => {
    resetBuySellData();
    renderBuySellData()
  }, 500)
}

function handleBuySellTradeError(buySellData) {
  buySellData.status = 'NO_CONNECTION';
  GLOBAL_STATE.setBuySellData(buySellData);
  renderBuySellData();
  // play error sound
  var audioElement = document.querySelector('#error-sound');
  audioElement.play();
  // render buy sell data to new state after 2 seconds
  setTimeout(() => {
    resetBuySellData();
    renderBuySellData();
  }, 2000)
}

function validateProfitLossInputs(action) {
  const { from_currency_rate, to_currency_rate } = GLOBAL_STATE.getBuySellData();
  const container = $('#buy-sell-modal');
  const profitInput = container.find('#profit-input');
  const lossInput = container.find('#loss-input');
  const profitVal = Number(profitInput.val());
  const lossVal = Number(lossInput.val());

  function addError(element, errorMessage) {
    element.addClass('error');
    $(`<p class="mb-0 position-absolute error-message text-error-red d-flex"><img src="img/ic_error.svg" class="mr-2"/>${errorMessage}</p>`).insertAfter(element);
  }

  function removeError(element) {
    element.removeClass('error');
    element.siblings('.error-message').remove();
  }

  if (action === 'BUY') {
    targetValue = Math.min(from_currency_rate, to_currency_rate);
    // checking profit value
    if (profitVal >= targetValue) {
      removeError(profitInput);
      GLOBAL_STATE.setIsBuySellFormValid('profit', true);
    } else {
      const errorMessage = i18n.t('body.common.invalidTP');
      addError(profitInput, errorMessage);
      GLOBAL_STATE.setIsBuySellFormValid('profit', false);
    }
    // checking loss value
    if (lossVal <= targetValue) {
      removeError(lossInput);
      GLOBAL_STATE.setIsBuySellFormValid('loss', true);
    } else {
      const errorMessage = i18n.t('body.common.invalidSL');
      addError(lossInput, errorMessage);
      GLOBAL_STATE.setIsBuySellFormValid('loss', false);
    }
  } else if (action === 'SELL') {
    targetValue = Math.max(from_currency_rate, to_currency_rate);
    // checking profit value
    if (profitVal <= targetValue) {
      removeError(profitInput);
      GLOBAL_STATE.setIsBuySellFormValid('profit', true);
    } else {
      const errorMessage = i18n.t('body.common.invalidTP');
      addError(profitInput, errorMessage);
      GLOBAL_STATE.setIsBuySellFormValid('profit', false);
    }
    // checking loss value
    if (lossVal >= targetValue) {
      removeError(lossInput);
      GLOBAL_STATE.setIsBuySellFormValid('loss', true);
    } else {
      const errorMessage = i18n.t('body.common.invalidSL');
      addError(lossInput, errorMessage);
      GLOBAL_STATE.setIsBuySellFormValid('loss', false);
    }
  }
}
function renderPendingOrderFormControls(mode) {
  const container = $('#buy-sell-modal .dynamic-elements')
  container.empty().append(getPendingOrderControls())
  registerPendingOrderEvents(container);
}

function registerPendingOrderEvents(container) {
  // order type dropdown menu
  container.find('#order-type-input-menu.dropdown-menu li').click(event => {
    const selectedItem = $(event.currentTarget);
    const selectedValue = selectedItem.data('value');
    const selectedItemText = event.currentTarget.innerText.trim();
    const selectedButton = container.find('#btn-order-type-input');
    selectedButton.text(selectedItemText);
    selectedButton.attr('data-value', selectedValue);
  })

  // expiration dropdown menu
  container.find('#expiration-input-menu.dropdown-menu').click(event => {
    const selectedItem = event.target.innerText.trim();
    const selectedButton = container.find('#btn-expiration-input');
    selectedButton.text(selectedItem);
    const expirationDateInput = container.find('#expiration-date-input');
    expirationDateInput.removeAttr('disabled');
    if (selectedItem.toUpperCase() === 'GOOD TILL CANCELLED (GTC)') {
      expirationDateInput.attr('disabled', 'true');
    } else if (selectedItem.toUpperCase() === 'DAY ORDER') {
      const expirationDate = GLOBAL_STATE.getBuySellData().day_order_expiration_date;
      expirationDateInput.val(formatDate(new Date(expirationDate), 'DD MMM YYYY HH:mm'))
    }
  })

  // expiration date picker
  container.find('#expiration-date-input').datetimepicker({
    todayBtn: true,
    minuteStep: 1,
    autoclose: true,
    pickerPosition: 'bottom-left'
  });
}

function translateYearMonths(data) {
  if (!data) {
    return '';
  }
  const yr = i18n.t('body.common.yr');
  const mths = i18n.t('body.common.mths');
  return data.replace('Yr', yr).replace('Mths', mths);
}
function translatePopupMessage(message, name) {
  return message.replace('<spname>', name);
}