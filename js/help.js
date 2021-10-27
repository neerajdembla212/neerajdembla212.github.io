import { FAQ } from './faq.js';
(function () {
    // document ready function
    $(function () {
        plotStrategyFollowerFAQ();
        plotStrategyProviderFAQ();
        registerEvents();
    })
    function registerEvents() {
        $('.faq .accordion-title').off().on('click', function (event) {
            const icon = $(this).find('.fa');
            if (icon.hasClass('fa-chevron-up')) {
                icon.removeClass('fa-chevron-up').addClass('fa-chevron-down');
            } else if(icon.hasClass('fa-chevron-down')) {
                icon.removeClass('fa-chevron-down').addClass('fa-chevron-up');
            }
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
                <h5 class="m-0 mr-1">${question}</h5>
                <i class="fa fa-chevron-up"></i>
            </div>
            <div class="px-3 border-0 collapse mb-3" id="${section}-answer-${index}">
                ${answer}
            </div>
        </div>
        <!-- accordion end -->
        `
    }
})()