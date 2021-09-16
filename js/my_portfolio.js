(() => {
    class State {
        strategyDetails = {};
        lineChartData = {};
        userList = {}; // this will store followers or providers depending on user's role
        role = ''; // provider or follower
        strategyProviderDetails = {};

        getStrategyDetails() {
            return this.strategyDetails;
        }

        setStrategyDetails(data) {
            this.strategyDetails = data;
        }

        getLineChartData() {
            return this.lineChartData;
        }

        setLineChartData(data) {
            this.lineChartData = data;
        }

        getUserList() {
            return this.userList;
        }

        setUserList(data) {
            if (!data || !Array.isArray(data)) {
                return
            }
            this.userList = data;
        }

        getRole() {
            return this.role;
        }
        setRole(role) {
            this.role = role;
        }

        getStrategyProviderDetails() {
            return this.strategyProviderDetails;
        }
        setStrategyProviderDetails(data) {
            if (!data) {
                return
            }
            this.strategyProviderDetails = data;
        }
    }
    const STATE = new State();
    // document ready function
    $(function () {
        // role has to be set first before callig other methods as they depend upon this value
        STATE.setRole(localStorage.getItem('currentRole')); // provider or follower
        showRoleWiseElements();
        // register events must be called after showRoleWiseElements() as few elements need to be present in dom before add event listeners on them
        registerEvents();
        // role wise elements on sub header
        // sparkline section
        fetchStrategyDetails();
        // render table section based on role
        fetchListOfUsers();
        fetchLineData();
    })
    // Fetching data function start
    // This function fetch strategy details and render sparkline
    function fetchStrategyDetails() {
        callAjaxMethod({
            url: `https://copypip.free.beeceptor.com/get-strategy-details/${STATE.getRole()}`,
            successCallback: (data) => {
                STATE.setStrategyDetails(data.data);
                renderSparkline(STATE.getRole());
                // activate dynamic Tooltips 
                activateTooltips();
            }
        })
    }

    // This function will fetch line data and plot line chart
    function fetchLineData() {
        callAjaxMethod({
            url: "https://copypip.free.beeceptor.com/portfolio-line-data",
            successCallback: (data) => {
                STATE.setLineChartData(data.data);
                plotLineChart()
            }
        });
    }

    // this function will fetch strategy providers or followers based on user's role and render the table accordingly
    function fetchListOfUsers() {
        const userRole = STATE.getRole()
        if (userRole.toLowerCase() === 'provider') {
            // fetch followers and render followers table
            fetchStrategyFollowers();
        } else if (userRole === 'follower') {
            // fetch providers and render providers table
            fetchStrategyProviders();
        }
    }

    function fetchStrategyProviders() {
        callAjaxMethod({
            url: 'https://copypip.free.beeceptor.com/get-portfolio-users/providers',
            successCallback: (data) => {
                STATE.setUserList(data.data);
                renderStrategyProviders();
            }
        })
    }

    function fetchStrategyFollowers() {
        callAjaxMethod({
            url: 'https://copypip.free.beeceptor.com/get-portfolio-users/followers',
            successCallback: (data) => {
                STATE.setUserList(data.data);
                renderStrategyFollowers();
            }
        })
    }

    function fetchStrategyProviderDetails(id) {
        callAjaxMethod({
            url: `https://copypip.free.beeceptor.com/strategy-provider-details?id=${id}`,
            successCallback: (data) => {
                STATE.setStrategyProviderDetails(data.data)
                renderFollowProviderPopup(data.data);
            }
        });
    }
    // fetch data functions end
    // render Strategy provider table HTML start
    function renderStrategyProviders() {
        const users = STATE.getUserList();
        const container = $('.portfolio-users-table');
        container.append(getStrategyProvidersTableHTML(users));
        container.append(getStrategyProviderResponsiveHTML(users));
        registerStrategyProviderTableEvents();
    }

    function getStrategyProvidersTableHTML(data) {
        return `<table class="table">
            ${getStrategyProvidersTableHeaders()}
            ${getStrategyProvidersTableBody(data)}
            ${getStrategyProvidersTableFooter()}
        </table>`
    }

    function getStrategyProvidersTableHeaders() {
        return `
        <thead>
            <tr>
            <th class="align-middle">Provider</th>
            <th class="text-center align-middle">equity growth</th>
            <th class="text-center align-middle">Total Returns</th>
            <th class="text-center align-middle">Max DD</th>
            <th class="text-center align-middle">Trades</th>
            <th class="text-center align-middle">Management FEEs</th>
            <th class="text-center align-middle">P share %</th>
            <th class="text-center align-middle">TOTAL FEEs</th>
            <th class="align-middle">Actions</th>
            </tr>
        </thead>
        `
    }

    function getStrategyProvidersTableBody(data) {
        if (!data || !Array.isArray(data)) {
            return
        }
        const rowsHTML = [];
        data.forEach(user => {
            rowsHTML.push(getStrategyProvidersTableRow(user));
        })
        return `
          <tbody>
            ${rowsHTML.join('')}
          </tbody>
          `
    }

    function getStrategyProvidersTableRow(user) {
        if (!user) {
            return '';
        }
        const { id,
            profile_image,
            name,
            username,
            country,
            total_profit_loss,
            total_returns,
            max_drawdown,
            trades,
            subscription_fee,
            profit_share,
            total_fee } = user;
        return `<tr id="table-user-${id}" class="sp-details-cta cursor-pointer" data-id="${id}">
        <td class="d-flex">
          <img alt="image" class="rounded-circle img-fluid img-sm float-left" src="${profile_image}" />
          <div class="ml-2 float-left">
            <p class="font-bold font-size-12 mb-0">
              ${username}
            </p>
            <p class="text-light-black font-size-12 mb-0">
              ${name}
              <img class="ml-1" src="${getCountryFlags(country)}" />
            </p>
          </div>
        </td>
        <td class="font-bold font-size-16 text-center align-middle">
          $${formatWithCommas(total_profit_loss)}
        </td>
        <td class="text-center align-middle">
          <span class="text-dark-green font-weight-bold">
            <i class="fa fa-play fa-rotate-270 font-size-12"></i>
            ${total_returns}
          </span>
        </td>
        <td class="text-center align-middle text-light-red">
          ${max_drawdown}
        </td>
        <td class="text-center align-middle">
          ${formatWithCommas(trades)}
        </td>
        <td class="text-center font-weight-bold align-middle">
          S$${formatWithCommas(subscription_fee)}
        </td>
        <td class="text-center align-middle">
          ${profit_share}
        </td>
        <td class="text-center font-weight-bold align-middle">
          S$${formatWithCommas(total_fee)}
        </td>
        <td class="action-tools text-center align-middle" name="actions">
          <i class="fa fa-pause mr-1 cursor-pointer pause-provider-cta" data-id="${id}" data-name="${name}" name="actions" data-toggle="modal"
          data-target="#pause-provider-modal"></i>
          <i class="fa fa-stop mr-1 cursor-pointer stop-provider-cta" data-id="${id}" data-name="${name}" name="actions" data-toggle="modal"
          data-target="#stop-provider-modal"></i>
          <i class="fa fa-gear mr-1 strategy-provider-settings cursor-pointer" name="actions" data-id=${id} data-toggle="modal"
          data-target="#follow-provider-modal"></i>
        </td>
      </tr>`
    }

    function getStrategyProvidersTableFooter() {
        return `<tfoot>
        <tr>
          <td colspan="9" class="pb-0">
            <ul class="pagination w-100 d-flex justify-content-end align-items-center m-0">
              <select class="form-control rows-per-page mr-2" name="rows-per-page">
                <option>10 Rows per page</option>
                <option>20 Rows per page</option>
                <option>30 Rows per page</option>
                <option>40 Rows per page</option>
              </select>
              <i class="fa fa-angle-left mx-2"></i>
              <i class="fa fa-angle-right mx-2"></i>
            </ul>
          </td>
        </tr>
      </tfoot>`
    }
    // render Strategy provider table HTML end

    // render Strategy provider responsive HTML start
    function getStrategyProviderResponsiveHTML(data) {
        const rowsHTML = [];
        data.forEach(user => {
            rowsHTML.push(getStrategyProviderResponsiveRow(user))
        })
        return `<div class="responsive-providers">
            ${rowsHTML.join('')}
        </div>`
    }

    function getStrategyProviderResponsiveRow(user) {
        const { id,
            profile_image,
            name,
            username,
            country,
            total_profit_loss,
            total_returns,
            max_drawdown,
            trades,
            subscription_fee,
            profit_share,
            total_fee } = user;

        return `<div class="p-3 sp-details-cta cursor-pointer" data-id="${id}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <img alt="image" class="rounded-circle img-fluid img-sm float-left" src="${profile_image}" />
                            <div class="ml-2 float-left">
                                <p class="font-bold font-size-12 mb-0">
                                    ${username}
                                </p>
                                <p class="text-light-black font-size-12 mb-0">
                                    ${name}
                                    <img class="ml-1" src="${getCountryFlags(country)}" />
                                </p>
                            </div>
                        </div>
                        <div class="d-flex align-items-center">
                            <span class="text-dark-green font-weight-bold mr-3">
                                <i class="fa fa-play fa-rotate-270 font-size-12"></i>
                                ${total_returns}
                            </span>
                            <div name="actions">
                                <i class="fa fa-pause mr-2 action-tools large-font cursor-pointer pause-provider-cta" data-id="${id}" data-name="${name}" name="actions" data-toggle="modal"
                                data-target="#pause-provider-modal"></i>
                                <i class="fa fa-stop mr-2 action-tools large-font cursor-pointer stop-provider-cta" data-id="${id}" data-name="${name}" name="actions" data-toggle="modal"
                                data-target="#stop-provider-modal"></i>
                                <i class="fa fa-gear mr-2 action-tools large-font cursor-pointer strategy-provider-settings" name="actions" data-id=${id} data-toggle="modal"
                                data-target="#follow-provider-modal"></i>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between mt-2">
                        <div class="mr-3">
                            <p class="mb-0 responsive-label">EQ growth</p>
                            <p class="mb-0 font-bold responsive-value">$${formatWithCommas(total_profit_loss)}</p>
                        </div>
                        <div class="mr-3">
                            <p class="mb-0 responsive-label">Max DD</p>
                            <p class="mb-0 font-bold responsive-value text-light-red">${max_drawdown}</p>
                        </div>
                        <div class="mr-3">
                            <p class="mb-0 responsive-label">Trades</p>
                            <p class="mb-0 font-bold responsive-value">${formatWithCommas(trades)}</p>
                        </div>
                        <div class="mr-3">
                            <p class="mb-0 responsive-label">M Fees</p>
                            <p class="mb-0 font-bold responsive-value">S$${formatWithCommas(subscription_fee)}</p>
                        </div>
                        <div class="mr-3">
                            <p class="mb-0 responsive-label">P share</p>
                            <p class="mb-0 font-bold responsive-value">${profit_share}</p>
                        </div>
                        <div class="mr-3">
                            <p class="mb-0 responsive-label">Total fees</p>
                            <p class="mb-0 font-bold responsive-value">S$${formatWithCommas(total_fee)}</p>
                        </div>
                    </div>
                </div>`
    }

    function registerStrategyProviderTableEvents() {
        // click on row and go to provider details page
        $('.sp-details-cta').unbind().click(event => {
            const id = $(event.currentTarget).data('id');
            const targetName = $(event.target).attr('name')
            if (targetName === 'actions') {
                return;
            }
            localStorage.setItem('selectedProviderId', id);
            window.location.href = window.location.origin + '/strategy-provider-details.html';
        })

        // click on gear icon (settings) on any strategy provider table row and open FP popup
        $('.strategy-provider-settings').unbind().click(event => {
            const id = $(event.currentTarget).data('id');
            fetchStrategyProviderDetails(id);
        })
        // click on pause icon on any strategy provider tabls row and open pause provider popup
        $('.pause-provider-cta').unbind().click(event => {
            const id = $(event.currentTarget).data('id');
            const providerName = $(event.currentTarget).data('name');
            renderPauseProviderPopup(id, providerName);
        })

        // click on stop icon on any strategy provider tabls row and open stop provider popup
        $('.stop-provider-cta').unbind().click(event => {
            const id = $(event.currentTarget).data('id');
            const providerName = $(event.currentTarget).data('name');
            renderStopProviderPopup(id, providerName);
        })
    }
    function renderPauseProviderPopup(id, name) {
        const container = $('#pause-provider-modal .modal-body');
        container.empty().append(`
            <p class="mb-3">Are you sure you want to pause following <b>${name}</b> ?</p>
            <div class="w-100 d-flex justify-content-end">
                <button type="button" class="btn btn-outline btn-link text-navy font-weight-bold" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" data-dismiss="modal">Confirm</button>
            </div>
        `)
    }
    function renderStopProviderPopup(id, name) {
        const container = $('#stop-provider-modal .modal-body');
        container.empty().append(`
            <p class="mb-3">Are you sure you want to stop following <b>${name}</b> ?</p>
            <div class="w-100 d-flex justify-content-end">
                <button type="button" class="btn btn-outline btn-link text-navy font-weight-bold" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" data-dismiss="modal">Confirm</button>
            </div>
        `)
    }
    // render Strategy provider responsive HTML end

    // render Strategy Follower table HTML start
    function renderStrategyFollowers() {
        const users = STATE.getUserList();
        const container = $('.portfolio-users-table');
        container.append(getStrategyFollowersTableHTML(users));
        container.append(getStrategyFollowersResponsiveHTML(users));
        registerStrategyFollowersTableEvents();
    }

    function getStrategyFollowersTableHTML(data) {
        return `<table class="table">
            ${getStrategyFollowersTableHeaders()}
            ${getStrategyFollowersTableBody(data)}
            ${getStrategyFollowersTableFooter()}
        </table>`
    }

    function getStrategyFollowersTableHeaders() {
        return `
        <thead>
            <tr>
            <th class="align-middle">Provider</th>
            <th class="text-center align-middle">joined</th>
            <th class="text-center align-middle">Period</th>
            <th class="text-center align-middle">P/L</th>
            <th class="text-center align-middle">HWM Difference</th>
            <th class="text-center align-middle">BALANCE</th>
            <th class="text-center align-middle">FEE earned</th>
            <th class="text-center align-middle">com earned</th>
            <th class="align-middle">Actions</th>
            </tr>
        </thead>
        `
    }

    function getStrategyFollowersTableBody(data) {
        if (!data || !Array.isArray(data)) {
            return
        }
        const rowsHTML = [];
        data.forEach(user => {
            rowsHTML.push(getStrategyFollowersTableRow(user));
        })
        return `
          <tbody>
            ${rowsHTML.join('')}
          </tbody>
          `
    }

    function getStrategyFollowersTableRow(user) {
        if (!user) {
            return '';
        }
        const { id,
            profile_image,
            name,
            username,
            country,
            joined_on,
            hwm_diff,
            profit_or_loss,
            balance,
            com_earned,
            fee_earned,
            is_new
        } = user;
        const newUSerChip = is_new === "true" ? `<span class="new-chip px-1 ml-2">New</span>` : '';

        return `<tr id="table-user-${id}">
        <td>
          <img alt="image" class="rounded-circle img-fluid img-sm float-left" src="${profile_image}" />
          <div class="ml-2 float-left">
            <p class="font-bold font-size-12 mb-0">
              ${username}
              ${newUSerChip}
            </p>
            <p class="text-light-black font-size-12 mb-0">
              ${name}
              <img class="ml-1" src="${getCountryFlags(country)}" />
            </p>
          </div>
        </td>
        <td class="font-bold text-center align-middle">
          ${formatDate(new Date(+joined_on))}
        </td>
        <td class="text-center align-middle">
          ${calculateDateDiff(new Date(+joined_on), new Date())}
        </td>
        <td class="text-center font-bold text-dark-green align-middle">
        S$${formatWithCommas(profit_or_loss)}
        </td>
        <td class="text-center align-middle">
        S$${formatWithCommas(hwm_diff)}
        </td>
        <td class="font-bold text-center align-middle">
        S$${formatWithCommas(balance)}
        </td>
        <td class="text-center align-middle">
        S$${fee_earned}
        </td>
        <td class="font-bold text-center align-middle">
        S$${formatWithCommas(com_earned)}
        </td>
      
        <td class="action-tools align-middle">
         ${getStrategyFollowersActionColumn(id, is_new, name)}
        </td>
      </tr>`
    }

    function getStrategyFollowersActionColumn(id, isNew, name) {
        if (isNew === "true") {
            return `<button class="btn btn-white text-dark-green font-bold px-1" type="button" data-id="${id}">Accept</button> 
            <button class="btn btn-default text-bleed-red font-bold px-1" type="button" data-id="${id}">Reject</button>`
        } else if (isNew === "false") {
            return ` <i class="fa fa-pause mr-1 cursor-pointer pause-follower-cta" data-id="${id}" data-name="${name}" name="actions" data-toggle="modal"
            data-target="#pause-follower-modal"></i>
            <i class="fa fa-stop mr-1 cursor-pointer stop-follower-cta" data-id="${id}" data-name="${name}" name="actions" data-toggle="modal"
            data-target="#stop-follower-modal"></i>`
        }
    }

    function getStrategyFollowersTableFooter() {
        return `<tfoot>
        <tr>
          <td colspan="9" class="pb-0">
            <ul class="pagination w-100 d-flex justify-content-end align-items-center m-0">
              <select class="form-control rows-per-page mr-2" name="rows-per-page">
                <option>10 Rows per page</option>
                <option>20 Rows per page</option>
                <option>30 Rows per page</option>
                <option>40 Rows per page</option>
              </select>
              <i class="fa fa-angle-left mx-2"></i>
              <i class="fa fa-angle-right mx-2"></i>
            </ul>
          </td>
        </tr>
      </tfoot>`
    }
    // render Strategy Follower table HTML end

    // render Strategy Follower responsive HTML start
    function getStrategyFollowersResponsiveHTML(data) {
        const rowsHTML = [];
        data.forEach(user => {
            rowsHTML.push(getStrategyFollowerResponsiveRow(user))
        })
        return `<div class="responsive-providers">
            ${rowsHTML.join('')}
        </div>`
    }

    function getStrategyFollowerResponsiveRow(user) {
        if (!user) {
            return '';
        }
        const { id,
            profile_image,
            name,
            username,
            country,
            joined_on,
            hwm_diff,
            profit_or_loss,
            balance,
            com_earned,
            fee_earned,
            is_new
        } = user;
        const newUSerChip = is_new === "true" ? `<span class="new-chip px-1 ml-2">New</span>` : '';
        return `<div class="p-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <img alt="image" class="rounded-circle img-fluid img-sm float-left" src="${profile_image}" />
                            <div class="ml-2 float-left">
                                <p class="font-bold font-size-12 mb-0">
                                    ${username}
                                    ${newUSerChip}
                                </p>
                                <p class="text-light-black font-size-12 mb-0">
                                    ${name}
                                    <img class="ml-1" src="${getCountryFlags(country)}" />
                                </p>
                            </div>
                        </div>
                        <div class="d-flex align-items-center">
                            <span class="text-dark-green font-weight-bold mr-3">
                                <i class="fa fa-play fa-rotate-270 font-size-12"></i>
                                S$${formatWithCommas(profit_or_loss)}
                            </span>
                            <i class="fa fa-pause mr-2 action-tools large-font cursor-pointer pause-follower-cta" data-id="${id}" data-name="${name}" name="actions" data-toggle="modal"
                            data-target="#pause-follower-modal"></i>
                            <i class="fa fa-stop mr-2 action-tools large-font cursor-pointer stop-follower-cta" data-id="${id}" data-name="${name}" name="actions" data-toggle="modal"
                            data-target="#stop-follower-modal"></i>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between mt-2">
                        <div class="mr-3">
                            <p class="mb-0 responsive-label">Joined</p>
                            <p class="mb-0 font-bold responsive-value">${formatDate(new Date(+joined_on))}</p>
                        </div>
                        <div class="mr-3">
                            <p class="mb-0 responsive-label">Period</p>
                            <p class="mb-0 font-bold responsive-value">${calculateDateDiff(new Date(+joined_on), new Date())}</p>
                        </div>
                        <div class="mr-3">
                            <p class="mb-0 responsive-label">HWM Diff</p>
                            <p class="mb-0 font-bold responsive-value">S$${formatWithCommas(hwm_diff)}</p>
                        </div>
                        <div class="mr-3">
                            <p class="mb-0 responsive-label">Balance</p>
                            <p class="mb-0 font-bold responsive-value">S$${formatWithCommas(balance)}</p>
                        </div>
                        <div class="mr-3">
                            <p class="mb-0 responsive-label">FEE</p>
                            <p class="mb-0 font-bold responsive-value">S$${fee_earned}</p>
                        </div>
                        <div class="mr-3">
                            <p class="mb-0 responsive-label">COM</p>
                            <p class="mb-0 font-bold responsive-value">S$${formatWithCommas(com_earned)}</p>
                        </div>
                    </div>
                </div>`
    }

    function registerStrategyFollowersTableEvents() {
        // click on pause icon on any strategy provider tabls row and open pause provider popup
        $('.pause-follower-cta').unbind().click(event => {
            const id = $(event.currentTarget).data('id');
            const providerName = $(event.currentTarget).data('name');
            renderPauseFollowerPopup(id, providerName);
        })

        // click on stop icon on any strategy provider tabls row and open stop provider popup
        $('.stop-follower-cta').unbind().click(event => {
            const id = $(event.currentTarget).data('id');
            const providerName = $(event.currentTarget).data('name');
            renderStopFollowerPopup(id, providerName);
        })
    }
    function renderPauseFollowerPopup(id, name) {
        const container = $('#pause-follower-modal .modal-body');
        container.empty().append(`
            <p class="mb-3">Are you sure you want to pause follower <b>${name}</b> ?</p>
            <div class="w-100 d-flex justify-content-end">
                <button type="button" class="btn btn-outline btn-link text-navy font-weight-bold" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" data-dismiss="modal">Confirm</button>
            </div>
        `)
    }
    function renderStopFollowerPopup(id, name) {
        const container = $('#stop-follower-modal .modal-body');
        container.empty().append(`
            <p class="mb-3">Are you sure you want to stop follower <b>${name}</b> ?</p>
            <div class="w-100 d-flex justify-content-end">
                <button type="button" class="btn btn-outline btn-link text-navy font-weight-bold" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" data-dismiss="modal">Confirm</button>
            </div>
        `)
    }
    // render Strategy Follower responsive HTML end

    // function to display role chip in sub header
    function showRoleWiseElements() {
        const role = STATE.getRole()
        if (role.toLowerCase() === 'provider') {
            $('.role-chip-follower').addClass('d-none');
            $('.role-chip-provider').removeClass('d-none');

            $('#stop-strategy').removeClass('d-none');
            $('#strategy').removeClass('d-none');
            $('.portfolio-users-table .table-title').text('Followers')
        }
        else if (role.toLowerCase() === 'follower') {
            $('.role-chip-follower').removeClass('d-none');
            $('.role-chip-provider').addClass('d-none');

            $('#stop-strategy').addClass('d-none');
            $('#strategy').addClass('d-none');
            $('.portfolio-users-table .table-title').text('Following')
        }
    }

    // Plot Line chart 
    function plotLineChart() {
        const canvas = document.getElementById("line-chart");
        const lineData = STATE.getLineChartData();
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

    // render strategy details sparkline start
    function renderSparkline(role) {
        const strategy = STATE.getStrategyDetails();
        const container = $('.sparkline-container');
        container.empty().append(getSparklineHTML(strategy, role));
        container.append(getSparklineResponsiveHTML(strategy, role));
    }

    function getSparklineHTML(strategy, role) {
        const { cumulative_returns,
            strategy_age,
            deposits,
            current_balance,
            withdrawals,
            fees_earned,
            followers,
            trades,
            max_drawdown,
            amount_paid } = strategy;

        let roleSpecificData;
        if (role === 'provider') {
            roleSpecificData = ` <div class="sparkline">
                <div class="key">Fees Earned</div>
                <div class="value white">SGD${formatWithCommas(fees_earned)}</div>
            </div>`
        } else if (role === 'follower') {
            roleSpecificData = `<div class="sparkline">
            <div class="key">
                <p class="mb-0">Total Paid <i class="fa fa-question-circle cursor-pointer ml-1" data-toggle="tooltip" data-placement="right" data-html="true" title="Fees + Profit Shared"></i></p>
            </div>
            <div class="value white">SGD${formatWithCommas(amount_paid)}</div>
        </div>`
        }
        return `
        <div class="d-flex flex-wrap justify-content-between desktop-content">
            <div class="sparkline mr-0">
            <div class="key tooltip-demo">Cumulative returns <i class="fa fa-question-circle cursor-pointer ml-1" data-toggle="tooltip" data-placement="right" data-html="true" title="${role === 'provider' ? 'Strategy Age' : 'Since Inception'} </br> ${strategy_age}"></i></div>
            <div class="d-flex justify-content-between">
                <div class="value green highlight">${cumulative_returns}<sup class="ml-1 font-weight-normal">%</sup></div>
                <div class="ml-3 mt-2 light-white">
                    <p class="mb-0 font-weight-light"></p>
                </div>
            </div>
            </div>
            <div class="divider mx-2"></div>
            <div class="sparkline">
            <div class="key">Current Balance</div>
            <div class="value white">SGD${formatWithCommas(current_balance)}</div>
            </div>
            <div class="sparkline">
            <div class="key">Deposits</div>
            <div class="value white">SGD${formatWithCommas(deposits)}</div>
            </div>
            <div class="sparkline">
            <div class="key">Withdrawals</div>
            <div class="value white">SGD${formatWithCommas(withdrawals)}</div>
            </div>
        ${roleSpecificData}
            <div class="sparkline">
                <div class="key">Followers</div>
            <div class="value white">SGD${formatWithCommas(followers)}</div>
            </div>
            <div class="sparkline">
            <div class="key">Trades</div>
            <div class="value green">${formatWithCommas(trades)}</div>
            </div>
            <div class="sparkline">
            <div class="key">Max Drawdown</div>
            <div class="value dark-red">${max_drawdown}</div>
        </div>
      </div>`
    }

    function getSparklineResponsiveHTML(strategy, role) {
        const { cumulative_returns,
            strategy_age,
            deposits,
            current_balance,
            withdrawals,
            fees_earned,
            followers,
            trades,
            max_drawdown,
            amount_paid } = strategy;

        let roleSpecificData;
        if (role === 'provider') {
            roleSpecificData = ` <div class="d-flex justify-content-between align-items-center p-3">
                    <div class="key">Fees Earned</div>
                    <div class="value white">SGD${formatWithCommas(fees_earned)}</div>
                </div>`
        } else if (role === 'follower') {
            roleSpecificData = `<div class="d-flex justify-content-between align-items-center p-3">
                <div class="key">
                    <p class="mb-0">Total Paid</p>
                    <p class="mb-0 small-font font-weight-light">Fees + Profit Shared</p>
                </div>
                <div class="value white">SGD${formatWithCommas(amount_paid)}</div>
            </div>`
        }
        return `<div class="responsive-content">
                    <div class="d-flex justify-content-between align-items-center p-3">
                        <div class="key">
                            <p class="mb-0">Cumulative returns <i class="fa fa-question-circle cursor-pointer ml-1" data-toggle="tooltip" data-placement="right" data-html="true" title="${role === 'provider' ? 'Strategy Age' : 'Since Inception'} </br> ${strategy_age}"></i></p>
                        </div>
                        <div class="value green highlight">${cumulative_returns}<sup class="ml-1 font-weight-normal">%</sup></div>
                    </div>
                    <div class="horizontal-divider mx-2"></div>
                    <div class="d-flex justify-content-between align-items-center p-3">
                        <div class="key">Current Balance</div>
                        <div class="value white">SGD${formatWithCommas(current_balance)}</div>
                    </div>
                    <div class="horizontal-divider mx-2"></div>
                    <div class="d-flex justify-content-between align-items-center p-3">
                        <div class="key">Deposits</div>
                        <div class="value white">SGD${formatWithCommas(deposits)}</div>
                    </div>
                    <div class="horizontal-divider mx-2"></div>
                    <div class="d-flex justify-content-between align-items-center p-3">
                        <div class="key">Withdrawals</div>
                        <div class="value white">SGD${formatWithCommas(withdrawals)}</div>
                    </div>
                    <div class="horizontal-divider mx-2"></div>
                    ${roleSpecificData}
                    <div class="horizontal-divider mx-2"></div>
                    <div class="row px-3">
                        <div class="p-3 col d-flex justify-content-between border-right">
                            <div class="key">Trades</div>
                            <div class="value green">${formatWithCommas(trades)}</div>
                        </div>
                        <div class="p-3 col d-flex justify-content-between">
                            <div class="key">Max Drawdown</div>
                            <div class="value dark-red">${max_drawdown}</div>
                        </div>
                    </div>
            </div>`

    }
    // render strategy details sparkline end

    // register events on the page i.e click of time filter on line chart
    function registerEvents() {
        $('.chart-filter .btn').click(event => {
            const target = $(event.currentTarget);
            $('.chart-filter .btn').removeClass('active');
            target.addClass('active');
            const value = target.text();
            console.log(value);
        })
        var elem = document.querySelector('#strategy-settings-modal .js-switch');
        new Switchery(elem, {
            color: '#E5E5E5',
            secondaryColor: '#E5E5E5',
            jackColor: '#22D091',
            jackSecondaryColor: "#FFFFFF",
        });
    }

})();