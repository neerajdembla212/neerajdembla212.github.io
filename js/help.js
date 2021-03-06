import { FAQ } from './faq.js';
(function () {
    // document ready function
    $(function () {
        // global function
        initI18nPlugin();
        // this function will be called by language switcher event from insipnia_custom.js file when language has been set successfully
        // each page has to add respective function on window to reload the translations on their page
        window.reloadElementsOnLanguageChange = function () {
            renderBuySellData(); // global function
            plotStrategyFollowerFAQ();
            plotStrategyProviderFAQ();
        }
        i18n.setLng(localStorage.getItem('selectedLanguage'), function () {
            $('#wrapper').i18n();
            window.reloadElementsOnLanguageChange();
        })
        registerEvents();
    })

    function registerEvents() {
        $('.faq .accordion-title').off().on('click', function (event) {
            const icon = $(this).find('.fa');
            if (icon.hasClass('fa-chevron-up')) {
                icon.removeClass('fa-chevron-up').addClass('fa-chevron-down');
            } else if (icon.hasClass('fa-chevron-down')) {
                icon.removeClass('fa-chevron-down').addClass('fa-chevron-up');
            }
        })

        $('#reset-demo').off().on('click', function (event) {
            localStorage.setItem('showTour', 'true');
            renderSuccessToast();
        })
    }

    function plotStrategyFollowerFAQ() {
        const strategyFollowerFAQ = FAQ.strategy_follower;
        if (!Array.isArray(strategyFollowerFAQ)) {
            return ``
        }
        const container = $('.strategy-follower-faq');
        const FAQHTML = [];
        strategyFollowerFAQ.forEach((faq, i) => {
            FAQHTML.push(getFAQHTML(faq, i, 'sf'))
        })
        container.empty().append(FAQHTML.join(''))
    }

    function plotStrategyProviderFAQ() {
        const strategyProviderFAQ = FAQ.strategy_provider;
        if (!Array.isArray(strategyProviderFAQ)) {
            return ``
        }
        const container = $('.strategy-provider-faq');
        const FAQHTML = [];
        strategyProviderFAQ.forEach((faq, i) => {
            FAQHTML.push(getFAQHTML(faq, i, 'sp'))
        })
        container.empty().append(FAQHTML.join(''))
    }

    function getFAQHTML(faq, index, section) {
        const { question, answer } = faq;
        return `
        <!-- accordion start -->
        <div class="col question-accordion p-0">
            <div class="p-3 border-0 cursor-pointer d-flex justify-content-between accordion-title" data-toggle="collapse" data-target="#${section}-answer-${index}" aria-expanded="false" aria-controls="${section}-answer-${index}">
                <h5 class="m-0 mr-1">${i18n.t(question)}</h5>
                <i class="fa fa-chevron-down"></i>
            </div>
            <div class="px-3 border-0 collapse mb-3" id="${section}-answer-${index}">
                ${i18n.t(answer)}
            </div>
        </div>
        <!-- accordion end -->
        `
    }

    function renderSuccessToast() {
        const toastBox = $('.toast');
        toastBox.addClass('success').toast('show');
    }
})()