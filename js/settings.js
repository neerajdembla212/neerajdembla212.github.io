(() => {
    class State {
        role = ''; // follower or provider
        profileDetails = {};
        tradingAccounts = [];

        getRole() {
            return this.role;
        }
        setRole(data) {
            if (!data) {
                return
            }
            this.role = data;
        }

        getProfileDetails() {
            return this.profileDetails;
        }
        setProfileDetails(data) {
            if (!data) {
                return;
            }
            this.profileDetails = data;
        }

        getTradingAccounts() {
            return this.tradingAccounts;
        }
        setTradingAccounts(data) {
            if (!data || !Array.isArray(data)) {
                return
            }
            this.tradingAccounts = data;
        }
    }

    const STATE = new State();
    const MOBILE_MEDIA = window.matchMedia("(max-width: 575px)");

    // document ready
    $(function () {
        // role has to be set first before callig other methods as they depend upon this value
        STATE.setRole(localStorage.getItem('currentRole')); // provider or follower
        registerGlobalEvents();
        fetchProfileDetails();
        fetchTradingAccounts();
    })

    function registerGlobalEvents() {
        MOBILE_MEDIA.addEventListener('change', function (event) {
            if (event.matches) {
                // screen is below 480px
                renderResponsiveTradingAccountsTable();
            } else {
                // screen is above 480px
                renderTradingAccountsTable();
            }
        })
        // add switchery radio button in modal
        var elem = document.querySelector('#become-strategy-provider-modal .js-switch');
        new Switchery(elem, {
            color: '#E5E5E5',
            secondaryColor: '#E5E5E5',
            jackColor: '#22D091',
            jackSecondaryColor: "#FFFFFF",
        });
        // start date picker
        $('#become-strategy-provider-modal .start-date-input').datepicker({
            todayBtn: "linked",
            keyboardNavigation: true,
            forceParse: false,
            calendarWeeks: true,
            autoclose: true
        }).off('changeDate').on('changeDate', function (e) {
            const displayDateButton = $('#become-strategy-provider-modal .start-date-input .btn-dropdown');
            displayDateButton.text(formatDate(e.date, "DD MMM YYYY HH:mm"));
        });
        // end date picker
        $('#become-strategy-provider-modal .end-date-input').datepicker({
            todayBtn: "linked",
            keyboardNavigation: true,
            forceParse: false,
            calendarWeeks: true,
            autoclose: true
        }).off('changeDate').on('changeDate', function (e) {
            const displayDateButton = $('#become-strategy-provider-modal .end-date-input .btn-dropdown');
            displayDateButton.text(formatDate(e.date, "DD MMM YYYY HH:mm"));
        });
    }
    // data fetch functions start
    function fetchProfileDetails() {
        const role = STATE.getRole();
        if (role === 'provider') {
            callAjaxMethod({
                url: 'https://copypip.free.beeceptor.com/strategy-provider-details?id=123',
                successCallback: (data) => {
                    STATE.setProfileDetails(data.data);
                    renderBasicProfileCard();
                    fillFormWithProfileDetails();
                }
            })
        } else if (role === 'follower') {
            callAjaxMethod({
                url: 'https://copypip.free.beeceptor.com/strategy-follower-details?id=123',
                successCallback: (data) => {
                    STATE.setProfileDetails(data.data);
                    renderBasicProfileCard(role);
                    fillFormWithProfileDetails();
                }
            })
        }
    }

    function fetchTradingAccounts() {
        callAjaxMethod({
            url: 'https://copypip.free.beeceptor.com/get-trading-accounts',
            successCallback: (data) => {
                STATE.setTradingAccounts(data.data);
                if (MOBILE_MEDIA.matches) {
                    renderResponsiveTradingAccountsTable();
                } else {
                    renderTradingAccountsTable();
                }
            }
        })
    }

    // data fetch functions end

    // render basic profile start
    function renderBasicProfileCard() {
        const profileDetails = STATE.getProfileDetails();
        const container = $('.settings-page .basic-profile-settings');
        container.append(getBasicProfileSettingsHTML(profileDetails))
        const role = STATE.getRole();
        if (role === 'follower') {
            container.addClass('mh-sm')
        } else {
            container.removeClass('mh-sm')
        }
    }

    function getBasicProfileSettingsHTML(data) {
        if (!data) {
            return
        }
        const { profile_image,
            username,
            name,
            strategy_philosophy,
            joined_date,
            strategy_age,
            follower_age,
            cumulative_returns,
            avg_growth_per_month,
            avg_pips,
            trade_count,
            max_drawdown
        } = data;
        const role = STATE.getRole();

        const strategyPhilosophyHTML = role === 'provider' ? `<div class="py-3">
        <p class="mb-2 small-font font-bold text-dark-black">Strategy Philosophy</p>
        <p class="mb-2 text-dark-gray">${strategy_philosophy}</p>
        <p class="mb-0 text-dark-gray small-font font-bold">Joined ${formatDate(new Date(joined_date))}
        </div> 
        <div class="divider"></div>` : '';

        const settingsButton = role === 'provider' ? `<button id="strategy" class="btn btn-default mt-3" type="button" data-toggle="modal"
        data-target="#strategy-settings-modal"><i class="fa fa-gear"></i>&nbsp;&nbsp;Strategy</button>` : '';

        const roleBasedCTA = role === 'provider' ? `<button id="stop-strategy" class="btn btn-default btn-warning mt-3" type="button">Stop Providing
        Strategy</button>` : `<button id="stop-strategy" class="btn btn-default btn-warning mt-3" type="button" data-toggle="modal" data-target="#become-strategy-provider-modal">Apply to be a Strategy Provider</button>`

        return `
        <div class="mb-3">
            <img alt="image" class="rounded-circle img-fluid img-sm float-left" src="${profile_image}">
            <div class="ml-2 float-left">
                <p class="font-bold medium-font mb-0">${username}</p>
                <p class="text-light-black medium-font mb-0">${name}</p>
            </div>
        </div>
        <div class="divider"></div>
        <!-- strategy philosophy start -->
        ${strategyPhilosophyHTML}
        <!-- strategy philosophy end -->
        
        <!-- strategy age start -->
        <div class="py-3 d-flex justify-content-between align-items-center">
            <p class="mb-0 font-bold small-font text-dark-black">Strategy Age</p>
            <p class="mb-0 medium-font font-bold text-dark-black">${role === 'provider' ? strategy_age : follower_age}</p>
        </div>
        <!-- strategy age end -->
        <div class="divider"></div>
        <!-- Cumulative returns start -->
        <div class="py-3 d-flex justify-content-between align-items-center">
            <div>
                <p class="mb-0 font-bold mall-font text-dark-black">Cumulative returns </p>
                <p class="mb-0 small-font text-dark-black font-weight-light">since Inception 1
                    Jul 2021</p>
            </div>
            <p class="mb-0 super-large-font text-dark-green font-bold">${cumulative_returns}%</p>
        </div>
        <!-- Cumulative returns end -->
        <div class="divider"></div>
        <!-- Average growth start -->
        <div class="py-3 d-flex justify-content-between align-items-center">
            <div>
                <p class="mb-0 font-bold small-font text-dark-black">Average Growth per Month
                </p>
            </div>
            <p class="mb-0 extra-large-font text-dark-green font-bold">${avg_growth_per_month}%</p>
        </div>
        <!-- Average growth end -->
        <div class="divider"></div>
        <!-- Average pips start -->
        <div class="py-3 d-flex justify-content-between align-items-center">
            <div>
                <p class="mb-0 font-bold small-font text-dark-black">Average Pips </p>
            </div>
            <p class="mb-0 extra-large-font text-dark-black font-bold">${avg_pips}</p>
        </div>
        <!-- Average pips end -->
        <div class="divider"></div>
        <!-- Trades start -->
        <div class="py-3 d-flex justify-content-between align-items-center">
            <div>
                <p class="mb-0 font-bold small-font text-dark-black">Trades </p>
            </div>
            <p class="mb-0 extra-large-font text-dark-black font-bold">${trade_count}</p>
        </div>
        <!-- Trades end -->
        <div class="divider"></div>
        <!-- Max Drawdown start -->
        <div class="pt-3 d-flex justify-content-between align-items-center mb-2">
            <div>
                <p class="mb-0 font-bold small-font text-dark-black">Max Drawdown </p>
            </div>
            <p class="mb-0 extra-large-font text-light-red font-bold">${max_drawdown}%</p>
        </div>
        <!-- Max Drawdown end -->
        <div class="divider"></div>
        <!-- CTA -->
        <div class="d-flex justify-content-between flex-wrap">
            ${roleBasedCTA}
            ${settingsButton}
            <button type="button" class="btn btn-default text-blue font-bold mt-3">Refer a Friend</button>
        </div>
        `
    }
    // render basic profile end

    // render trading accounts start
    function renderTradingAccountsTable() {
        const tradingAccounts = STATE.getTradingAccounts();
        const container = $('.settings-page .trading-accounts .trading-accounts-content');
        container.empty().append(getTradingAccountsTableHTML(tradingAccounts))
    }

    function getTradingAccountsTableHTML(data) {
        return `<table class="table">
        ${getTradingAccountsTableHeaders()}
        ${getTradingAccountsTableBody(data)}
        </table>
        `
    }

    function getTradingAccountsTableHeaders() {
        return `
        <thead>
            <tr>
            <th class="align-middle">Name</th>
            <th class="text-center align-middle">Type</th>
            <th class="text-center align-middle">Role</th>
            <th class="text-center align-middle">Server</th>
            <th class="text-center align-middle">Date Created</th>
            <th class="text-center align-middle">Demo Leverage</th>
            <th class="text-center align-middle">Status</th>
            </tr>
        </thead>
        `
    }

    function getTradingAccountsTableBody(data) {
        if (!data || !Array.isArray(data)) {
            return
        }
        const rowsHTML = [];
        data.forEach(account => {
            rowsHTML.push(getTradingAccountsTableRow(account));
        })
        return `
          <tbody>
            ${rowsHTML.join('')}
          </tbody>
          `
    }

    function getTradingAccountsTableRow(account) {
        if (!account) {
            return;
        }
        const { account_name,
            account_type,
            role,
            server,
            date_created,
            demo_leverage,
            status } = account;
        return `<tr>
                <td class="font-bold medium-font">
                    <p class="mb-0">${account_name}</p>
                </td>
                <td>
                    <p class="mb-0 text-center p-1 extra-small-font ${account_type.toUpperCase() === 'LIVE' ? 'live-account' : 'demo-account'}">${account_type}</p>
                </td>
                <td>
                    <p class="mb-0 text-center">${role}</p>
                </td>
                <td>
                    <p class="mb-0 text-center">${server}</p>
                </td>
                <td>
                    <p class="mb-0 text-center">${formatDate(new Date(date_created))}</p>
                </td>
                <td>
                    <p class="mb-0 text-center">${demo_leverage}</p>
                </td>
                <td>
                    <p class="mb-0 text-center p-1 ${status.toUpperCase() === 'ONLINE' ? 'online' : ''}">${status}</p>
                </td>
            </tr>
            `
    }
    // render trading accounts end

    // render responsive trading accounts start
    function renderResponsiveTradingAccountsTable() {
        const tradingAccounts = STATE.getTradingAccounts();
        const container = $('.settings-page .trading-accounts .trading-accounts-content');
        const rowsHTML = [];
        tradingAccounts.forEach(account => {
            rowsHTML.push(getResponsiveRowTradingAccount(account))
        })
        container.empty().append(rowsHTML.join(''))
    }

    function getResponsiveRowTradingAccount(account) {
        if (!account) {
            return '';
        }
        const { account_name,
            account_type,
            role,
            server,
            date_created,
            demo_leverage,
            status } = account;

        return `
                <div class="divider"></div>
                <div class="p-3">
                    <div class="d-flex justify-content-between">
                        <div class="d-flex">
                            <p class="mb-0 font-bold medium-font mr-1">${account_name}</p>
                            <p class="mb-0 text-center p-1 extra-small-font ${account_type.toUpperCase() === 'LIVE' ? 'live-account' : 'demo-account'}">${account_type}</p>
                        </div>
                        <p class="mb-0 text-center">${formatDate(new Date(date_created))}</p>
                    </div>
                    <div class="d-flex justify-content-between mt-2">
                        <p class="mb-0 text-center">${role}</p>
                        <p class="mb-0 text-center">${server}</p>
                        <p class="mb-0 text-center p-1 ${status.toUpperCase() === 'ONLINE' ? 'online' : ''}">${status}</p>
                    </div>
                </div>
            `
    }
    // render responsive trading accounts end

    // fill profile settings start
    function fillFormWithProfileDetails() {
        const profileDetails = STATE.getProfileDetails();
        const {
            email,
            name,
            phone,
            country,
            strategy_philosophy
        } = profileDetails;
        const container = $('.profile-settings');
        const role = STATE.getRole();
        if (role === 'provider') {
            container.find('#strategy_philosophy_container').removeClass('invisible');
            container.find('#strategy_philosophy').val(strategy_philosophy);
        } else if (role === 'follower') {
            container.find('#strategy_philosophy_container').addClass('invisible');
            container.find('#strategy_philosophy').val('');
        }
        container.find('#email_address').val(email);
        container.find('#first_name').val(name.split(' ')[0]);
        container.find('#last_name').val(name.split(' ')[1]);
        container.find('#mobile').val(phone);
        container.find('#country').val(country.toUpperCase());
    }
    // fill profile settings end

})();