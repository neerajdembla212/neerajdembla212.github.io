(() => {
    class State {
        economicCalendarDetails = {};
        forexDetails = {};
        bankRateDetails = {};

        getEconomicCalendarDetails() {
            return this.economicCalendarDetails;
        }

        setEconomicCalendarDetails(data) {
            this.economicCalendarDetails = data;
        }

        getForexDetails() {
            return this.forexDetails;
        }

        setForexDetails(data) {
            this.forexDetails = data;
        }

        getBankRateDetails() {
            return this.bankRateDetails;
        }

        setBankRateDetails(data) {
            this.bankRateDetails = data;
        }
    }
    const STATE = new State();
    $(function () {
        //registerEvents();
        loadEconomicCalendar('today');
        fetchForexDetails();
        fetchBankRateDetails();

        $('#tab-link-yesterday').click(function(){
            loadEconomicCalendar('yesterday')
        })
        $('#tab-link-today').click(function(){
            loadEconomicCalendar('today')
        })
        $('#tab-link-tomorrow').click(function(){
            loadEconomicCalendar('tomorrow')
        })
        getCurrentTime();
    })

    function loadEconomicCalendar(day) {
        fetchEconomicCalendarDetails(day);
    }

    function fetchEconomicCalendarDetails(day) {
        callAjaxMethod({
            url: 'https://copypip.free.beeceptor.com/economic-calendar?date='+day,
            successCallback: (data) => {
                console.log("success", data)
                STATE.setEconomicCalendarDetails(data.data);
                renderEconomicCalendarDetails(day);
            }
        })
    }
    function fetchForexDetails() {
        callAjaxMethod({
            url: 'https://copypip.free.beeceptor.com/forex-rates',
            successCallback: (data) => {
                console.log("success", data)
                STATE.setForexDetails(data.data);
                renderForexDetails();
            }
        })
    }

    function fetchBankRateDetails() {
        callAjaxMethod({
            url: 'https://copypip.free.beeceptor.com/central-bank-rates',
            successCallback: (data) => {
                console.log("success", data)
                STATE.setBankRateDetails(data.data);
                renderBankRateDetails();
            }
        })
    }

    // render economic calendar details from api data
    function renderEconomicCalendarDetails(day) {
        const economicCalendar = STATE.getEconomicCalendarDetails();
        const economicCalendarContainer = $('#economic-calendar-table-'+day);
        economicCalendarContainer.empty().append(getEconomicCalendarDetailsHTML(economicCalendar, day));
    }
    function getEconomicCalendarDetailsHTML(economicCalendarData, day) {
        return `<table class="table">
            ${getECTableHeaders()}
            ${getECTableBody(economicCalendarData, day)}
        </table>`
    }

    function getECTableHeaders() {
        return `
        <thead>
            <tr style="background: #F9F9FB;">
                <th>TIME</th>
                <th>CURRENCY</th>
                <th>IMPT</th>
                <th>EVENT</th>
                <th>ACTUAL</th>
                <th>FORECAST</th>
                <th>PREVIOUS</th>
            </tr>
        </thead>
        `
    }

    function getECTableBody(data, day) {
        if (!data || !Array.isArray(data)) {
            return
        }
        const rowsHTML = [];
        data.forEach(user => {
            rowsHTML.push(getECTableBodyTableRow(user));
        })
        return `
          <tbody>
          <tr><td colspan="7" class="table-row-date">${getECTableRowDate(day)}</td></tr>
            ${rowsHTML.join('')}
          </tbody>
          `
    }

    function getECTableBodyTableRow(user) {
        if (!user) {
            return '';
        }
        const { actual,
            currency,
            event_name,
            forecast,
            impt,
            previous,
            time
        } = user;

        return `<tr class="table-user-bank-rates">
        <td class="padding-left-right-8">
            ${getECTableTime(time)}
        </td>
        <td class="padding-left-right-8">
          ${currency}
        </td>
        <td class="padding-left-right-8">
          ${impt}
        </td>
        <td class="padding-left-right-8">
          ${event_name}
        </td>
        <td class="padding-left-right-8">
          ${actual}
        </td>
        <td class="padding-left-right-8">
          ${forecast}
        </td>
        <td class="padding-left-right-8">
          ${previous}
        </td>
      </tr>`
    }

    //render Forex details from api data
    function renderForexDetails() {
        const forex = STATE.getForexDetails();
        const forexContainer = $('.forex-body');
        forexContainer.empty().append(getForexDetailsHtml(forex));
    }



    function getForexDetailsHtml(forexData) {
        return `<table class="table">
            ${getForexTableBody(forexData)}
        </table>`
    }

    function getForexTableBody(data) {
        if (!data || !Array.isArray(data)) {
            return
        }
        const rowsHTML = [];
        data.forEach(user => {
            rowsHTML.push(getForexTableRow(user));
        })
        return `
          <tbody>
            ${rowsHTML.join('')}
          </tbody>
          `
    }

    function getForexTableRow(user) {
        if (!user) {
            return '';
        }
        const { from_currency,
            to_currency,
            forex_rate,
            status } = user;
        return `<tr class="table-user-forex">
        <td>
          flag ${from_currency}${to_currency}
        </td>
        <td>
          ${forex_rate}
        </td>
        <td>
        ${status}
        </td>
      </tr>`
    }

    //render Forex details from api data
    function renderBankRateDetails() {
        const bankRates = STATE.getBankRateDetails();
        const bankRatesContainer = $('.cbr-body');
        bankRatesContainer.empty().append(getBankRatesDetailsHtml(bankRates));
    }

    function getBankRatesDetailsHtml(data) {
        return `<table class="table">
            ${getBankRatesTableHeaders()}
            ${getBankRatesTableBody(data)}
        </table>`
    }

    function getBankRatesTableHeaders() {
        return `
        <thead>
            <tr class="bank-rates-header-bar">
            <th>Central Banks</th>
            <th>interest RAtes</th>
            <th>Next meEting</th>
            </tr>
        </thead>
        `
    }

    function getBankRatesTableBody(data) {
        if (!data || !Array.isArray(data)) {
            return
        }
        const rowsHTML = [];
        data.forEach(user => {
            rowsHTML.push(getBankRatesTableBodyTableRow(user));
        })
        return `
          <tbody>
            ${rowsHTML.join('')}
          </tbody>
          `
    }

    function getBankRatesTableBodyTableRow(user) {
        if (!user) {
            return '';
        }
        const { bank_name,
            bank_short_code,
            country,
            interest_rates,
            next_meeting
        } = user;

        return `<tr class="table-user-bank-rates">
        <td>
            <img class="ml-1" src="${getCountryFlags(country)}" />
            <span class="bank-short-code font-bold">${bank_short_code}</span>
        </td>
        <td class="text-center">
          ${interest_rates}
        </td>
        <td class="text-center">
          ${next_meeting}
        </td>
      </tr>`
    }

    function getECTableRowDate(date) {
        let currentDate = new Date();
        switch(date) {
            case 'yesterday':
                currentDate.setDate(currentDate.getDate() - 1)
                return getFormattedECRowDate(currentDate);
            case 'today':
                return getFormattedECRowDate(currentDate);
            case 'tomorrow':
                currentDate.setDate(currentDate.getDate() + 1)
                return getFormattedECRowDate(currentDate);
        }
    }

    function getCurrentTime() {
        $('#timeBlock').empty().append(`
            <span  class="current-time font-bold">${getECTableTime(new Date())} <span class="current-time-zone">(GMT ${getTimezoneOffset()})</span></span>
        `)
    }
    function getTimezoneOffset() {
        function z(n){return (n<10? '0' : '') + n}
        var offset = new Date().getTimezoneOffset();
        var sign = offset < 0? '+' : '-';
        offset = Math.abs(offset);
        return sign + z(offset/60 | 0) + z(offset%60);
      }

    function getFormattedECRowDate(date) {
        const curDate = new Date(date);
        const weekdays = ['Sunday', 'Monday', 'Teusday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${weekdays[curDate.getDay()]}, ${curDate.getDate()} ${monthNames[curDate.getMonth()]} ${curDate.getFullYear()}`
    }

    function getECTableTime(time) {
        const currentTime = new Date(+time);
        const currentHour = currentTime.getHours() < 10 ? `0${currentTime.getHours()}` : `${currentTime.getHours()}`;
        const currentMin = currentTime.getMinutes() < 10 ? `0${currentTime.getMinutes()}` : `${currentTime.getMinutes()}`;
        return `${currentHour}:${currentMin}`;
    }
})();