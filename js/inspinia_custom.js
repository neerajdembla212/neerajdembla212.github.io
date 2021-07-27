$(document).ready(function () {
  registerEventHandlers();
});

$.i18n.init({
  resGetPath: 'locales/__lng__.json',
  load: 'unspecific',
  fallbackLng: false,
  lng: 'en'
}, function (t){
  $('.i18container').i18n();
  $('#side-menu').i18n();
  $('.navbar-top-links').i18n();
});
$('.i18SelectEnglish').on('click', function(){
  i18n.setLng('en', function(){
    $('.i18container').i18n();
  })
  $('.i18SelectSpanish').removeClass('selected');
  $('.i18SelectEnglish').addClass('selected');
})
$('.i18SelectSpanish').on('click', function(){
  i18n.setLng('es', function(){
    $('.i18container').i18n();
  });
  $('.i18SelectSpanish').addClass('selected');
  $('.i18SelectEnglish').removeClass('selected');
})
$('.set_en').on('click', function (){
  i18n.setLng('en', function(){
      $('.i18container').i18n();
      $('#side-menu').i18n();
      $('.navbar-top-links').i18n();

      $('.set_en').addClass('active');
      $('.set_es').removeClass('active');
  });
});

$('.set_es').on('click', function (){
  i18n.setLng('es', function(){
      $('.i18container').i18n();
      $('#side-menu').i18n();
      $('.navbar-top-links').i18n();

      $('.set_es').addClass('active');
      $('.set_en').removeClass('active');
  });
})

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

}

//generic ajax function
function callAjaxMethod({
  url,
  method = "GET",
  parameters = {},
  successCallback,
}) {
  try {
    $.ajax({
      type: method,
      url: url,
      data: parameters,
      cache: false,
      beforeSend: function () {
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
