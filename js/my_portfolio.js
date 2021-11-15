(() => {
    const spDefaultFilterItems = [{ // default filter items is the master list with default filters
        id: 1,
        displayName: 'Equity Growth',
        filterParam: 'equity_growth',
        filterOperation: "&gt;",
        filterPercentage: true,
        filterValue: 10
    },
    {
        id: 2,
        displayName: 'Total Returns',
        filterParam: 'total_returns',
        filterOperation: "&gt;",
        filterPercentage: true,
        filterValue: 5
    },
    {
        id: 3,
        displayName: 'No. Trades',
        filterParam: 'trades',
        filterOperation: "&gt;",
        filterPercentage: false,
        filterValue: 5
    },
    {
        id: 4,
        displayName: 'Max Drawdown',
        filterParam: 'max_drawdown',
        filterOperation: "&lt;",
        filterPercentage: true,
        filterValue: 15
    },
    {
        id: 5,
        displayName: 'Management Fees',
        filterParam: 'management_fee',
        filterOperation: "&lt;",
        filterPercentage: true,
        filterValue: 15
    },
    {
        id: 6,
        displayName: 'Profit Sharing',
        filterParam: 'profit_sharing',
        filterOperation: "&lt;",
        filterPercentage: true,
        filterValue: 15
    },
    {
        id: 7,
        displayName: 'Total Fees',
        filterParam: 'total_fee',
        filterOperation: "&lt;",
        filterPercentage: true,
        filterValue: 15
    }
    ];
    const sfDefaultFilterItems = [{ // default filter items is the master list with default filters
        id: 1,
        displayName: 'P/L',
        filterParam: 'p_l',
        filterOperation: "&gt;",
        filterPercentage: false,
        filterValue: 10
    },
    {
        id: 2,
        displayName: 'HWM Diffrence',
        filterParam: 'hwm_difference',
        filterOperation: "&gt;",
        filterPercentage: false,
        filterValue: 5
    },
    {
        id: 3,
        displayName: 'Balance',
        filterParam: 'balance',
        filterOperation: "&gt;",
        filterPercentage: false,
        filterValue: 58
    },
    {
        id: 4,
        displayName: 'Fee Earned',
        filterParam: 'fee_earned',
        filterOperation: "&lt;",
        filterPercentage: false,
        filterValue: 15
    },
    {
        id: 5,
        displayName: 'Com Earned',
        filterParam: 'com_earned',
        filterOperation: "&lt;",
        filterPercentage: false,
        filterValue: 15
    },
    ];
    class State {
        strategyDetails = {};
        lineChartData = {};
        userList = {}; // this will store followers or providers depending on user's role
        role = ''; // provider or follower
        strategyProviderDetails = {};
        paginationData = {
            rowsPerPage: 10,
            total: 0,
            page: 0
        }
        defaultFilterItems = [];
        selectedTableFilters = []
        dropdownFilterItems = [];
        sortData = {
            sortKey: '',
            direction: '' // asc or desc
        }

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

        getPaginationData() {
            return this.paginationData;
        }
        setPaginationData(data) {
            if (!data) {
                return;
            }
            this.paginationData = data;
        }

        getSelectedTableFilters() {
            return this.selectedTableFilters;
        }
        setSelectedTableFilters(data) {
            if (!data || !Array.isArray(data)) {
                return
            }
            this.selectedTableFilters = data;
        }
        addSelectedFilter(data) {
            if (!data) {
                return
            }
            const existingFilterIndex = this.selectedTableFilters.findIndex(filter => filter.id === data.id);
            if (existingFilterIndex > -1) {
                this.selectedTableFilters[existingFilterIndex].filterValue = data.filterValue;
                this.selectedTableFilters[existingFilterIndex].filterOperation = data.filterOperation;
            } else {
                this.selectedTableFilters.push(data);
            }
        }
        removeSelectedFilter(id) {
            if (!id) {
                return;
            }
            const filterIndexToRemove = this.selectedTableFilters.findIndex(f => f.id === id);
            if (filterIndexToRemove > -1) {
                this.selectedTableFilters.splice(filterIndexToRemove, 1)
            }
        }

        setDropdownFilterItems(data) {
            if (!data || !Array.isArray(data)) {
                return
            }
            this.dropdownFilterItems = data;
        }
        getDropdownFilterItems() {
            return this.dropdownFilterItems;
        }

        getDefaultFilterItems() {
            return this.defaultFilterItems
        }
        setDefaultFilterItems(data) {
            if (!data || !Array.isArray(data)) {
                return
            }
            this.defaultFilterItems = data;
        }

        getSortData() {
            return this.sortData
        }
        setSortData(data) {
            if (!data) {
                return
            }
            this.sortData = data;
        }
    }
    const STATE = new State();
    const DESKTOP_MEDIA = window.matchMedia("(max-width: 968px)")
    const MOBILE_MEDIA = window.matchMedia("(max-width: 480px)")
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
        setDefaulltDropdownItems();
        const tour = setupTour();
        const showTour = localStorage.getItem('showTour');
        if (showTour === "true") {
            tour.restart();
        }
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
        const userRole = STATE.getRole();
        if (userRole.toLowerCase() === 'provider') {
            // change default table filter Items
            const defaultFilter = sfDefaultFilterItems.map(f => ({ ...f }));
            STATE.setDefaultFilterItems(defaultFilter);
            // fetch followers and render followers table
            fetchStrategyFollowers();
        } else if (userRole === 'follower') {
            // change default table filter Items
            const defaultFilter = spDefaultFilterItems.map(f => ({ ...f }));
            STATE.setDefaultFilterItems(defaultFilter);
            // fetch providers and render providers table
            fetchStrategyProviders();
        }
    }

    function fetchStrategyProviders() {
        renderSeletedFilters();
        const filterQueryParams = getSelectedFiltersQueryParams(STATE.getSelectedTableFilters());
        callAjaxMethod({
            url: `https://copypip.free.beeceptor.com/get-portfolio-users/providers${filterQueryParams}`,
            successCallback: (data) => {
                const paginationData = STATE.getPaginationData();
                paginationData.total = data.total;
                STATE.setPaginationData(paginationData);
                STATE.setUserList(data.data);
                renderStrategyProviders();
                renderTableFilters();
            }
        })
    }

    function fetchStrategyFollowers() {
        renderSeletedFilters();
        const filterQueryParams = getSelectedFiltersQueryParams(STATE.getSelectedTableFilters());
        callAjaxMethod({
            url: `https://copypip.free.beeceptor.com/get-portfolio-users/followers${filterQueryParams}`,
            successCallback: (data) => {
                const paginationData = STATE.getPaginationData();
                paginationData.total = data.total;
                STATE.setPaginationData(paginationData);
                STATE.setUserList(data.data);
                renderStrategyFollowers();
                renderTableFilters();
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
    function setDefaulltDropdownItems() {
        const userRole = STATE.getRole();
        if (userRole.toLowerCase() === 'provider') {
            // change default table filter Items
            const defaultFilter = sfDefaultFilterItems.map(f => ({ ...f }));
            STATE.setDefaultFilterItems(defaultFilter);
            STATE.setDropdownFilterItems(defaultFilter);
        } else if (userRole.toLowerCase() === 'follower') {
            // change default table filter Items
            const defaultFilter = spDefaultFilterItems.map(f => ({ ...f }));
            STATE.setDefaultFilterItems(defaultFilter);
            STATE.setDropdownFilterItems(defaultFilter);
        }
    }
    // render Strategy provider table HTML start
    function renderStrategyProviders() {
        const users = STATE.getUserList();
        const container = $('.portfolio-users-table .portfolio-users-table-content');
        if (DESKTOP_MEDIA.matches) {
            // screen size is below 968px
            container.empty().append(getStrategyProviderResponsiveHTML(users));
        } else {
            // screnn size is above 968px
            container.empty().append(getStrategyProvidersTableHTML(users));
        }
        registerStrategyProviderTableEvents();
    }

    function getStrategyProvidersTableHTML(data) {
        return `<table class="table table-hover">
            ${getStrategyProvidersTableHeaders()}
            ${getStrategyProvidersTableBody(data)}
            ${getStrategyProvidersTableFooter(data.length)}
        </table>`
    }

    function getStrategyProvidersTableHeaders() {
        const selectedSort = STATE.getSortData()
        const { sortKey, direction } = selectedSort;
        let arrowClass = '';
        if (direction === 'asc') {
            arrowClass = 'up-arrow-sort';
        } else if (direction === 'desc') {
            arrowClass = 'down-arrow-sort';
        }
        return `
        <thead>
            <tr>
            <th class="align-middle">Provider</th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="total_profit_loss">
                    <p class="m-0 p-0">equity growth<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'total_profit_loss' ? 'd-none' : ''}"></i></p>
                </div>
            </th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="total_returns">
                    <p class="m-0 p-0">Total Returns<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'total_returns' ? 'd-none' : ''}"></i></p>
                </div>
            </th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="max_drawdown">
                    <p class="m-0 p-0">Max DD<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'max_drawdown' ? 'd-none' : ''}"></i></p>
                </div>
            </th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="trades">
                    <p class="m-0 p-0">Trades<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'trades' ? 'd-none' : ''}"></i></p>
                </div>
            </th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="subscription_fee">
                    <p class="m-0 p-0">Management FEEs<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'subscription_fee' ? 'd-none' : ''}"></i></p>
                </div>
            </th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="profit_share">
                    <p class="m-0 p-0">P Share %<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'profit_share' ? 'd-none' : ''}"></i></p>
                </div>
            </th>
            <th class="text-center align-middle">
            <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="total_fee">
                    <p class="m-0 p-0">Total FEEs<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'total_fee' ? 'd-none' : ''}"></i></p>
                </div>
            </th>
            <th class="align-middle text-center">Actions</th>
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
            ${total_returns}%
          </span>
        </td>
        <td class="text-center align-middle text-light-red">
          ${max_drawdown}%
        </td>
        <td class="text-center align-middle">
          ${formatWithCommas(trades)}
        </td>
        <td class="text-center font-weight-bold align-middle">
          S$${formatWithCommas(subscription_fee)}
        </td>
        <td class="text-center align-middle">
          ${profit_share}%
        </td>
        <td class="text-center font-weight-bold align-middle">
          S$${formatWithCommas(total_fee)}
        </td>
        <td class="action-tools text-center align-middle" name="actions">
            <i class="fa fa-pause mr-2 cursor-pointer pause-provider-cta extra-large-font" data-id="${id}" data-name="${name}" name="actions" data-toggle="modal"
            data-target="#pause-provider-modal"></i>
          <i class="fa fa-stop mr-2 cursor-pointer stop-provider-cta extra-large-font" data-id="${id}" data-name="${name}" name="actions" data-toggle="modal"
          data-target="#stop-provider-modal"></i>
          <i class="fa fa-gear mr-0 strategy-provider-settings cursor-pointer extra-large-font" name="actions" data-id=${id} data-toggle="modal"
          data-target="#follow-provider-modal"></i>
        </td>
      </tr>`
    }

    function getStrategyProvidersTableFooter(dataLength) {
        const { start, end, total } = getStartEndRecordCount(dataLength, STATE.getPaginationData());
        return `<tfoot>
        <tr>
          <td colspan="9">
            <div class="d-flex justify-content-between align-items-center">
                <p class="mb-0 text-dark-gray small-font">Showing <b>${start}</b> to <b>${end}</b> of <b>${total}</b> providers</p>
                <ul class="pagination d-flex justify-content-end align-items-center m-0">
                    <select class="form-control rows-per-page mr-2" name="rows-per-page" id="sp-rows-per-page">
                        <option value="10">10 Rows per page</option>
                        <option value="20">20 Rows per page</option>
                        <option value="30">30 Rows per page</option>
                        <option value="40">40 Rows per page</option>
                    </select>
                    <button class="btn btn-default border-0" type="button" id="prev-page-sp">
                        <i class="fa fa-angle-left extra-large-font font-weight-bold"></i>
                    </button>
                    <button class="btn btn-default border-0" type="button" id="next-page-sp">
                        <i class="fa fa-angle-right extra-large-font font-weight-bold"></i>
                    </button>
                </ul>
            </div>
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
            ${getStrategyProviderResponsiveFooter(data.length)}
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
                                <i class="fa fa-pause mr-2 action-tools large-font cursor-pointer extra-large-font pause-provider-cta" data-id="${id}" data-name="${name}" name="actions" data-toggle="modal"
                                data-target="#pause-provider-modal"></i>
                                <i class="fa fa-stop mr-2 action-tools large-font cursor-pointer extra-large-font stop-provider-cta" data-id="${id}" data-name="${name}" name="actions" data-toggle="modal"
                                data-target="#stop-provider-modal"></i>
                                <i class="fa fa-gear mr-2 action-tools large-font cursor-pointer extra-large-font strategy-provider-settings" name="actions" data-id=${id} data-toggle="modal"
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
    function getStrategyProviderResponsiveFooter(dataLength) {
        const { start, end, total } = getStartEndRecordCount(dataLength, STATE.getPaginationData());
        return `
        <div class="d-flex justify-content-between align-items-center p-2">
                <p class="mb-0 text-dark-gray small-font">Showing <b>${start}</b> to <b>${end}</b> of <b>${total}</b> providers</p>
                <ul class="pagination d-flex justify-content-end align-items-center m-0">
                    <select class="form-control rows-per-page mr-2" name="rows-per-page" id="sp-rows-per-page">
                        <option value="10">10 Rows per page</option>
                        <option value="20">20 Rows per page</option>
                        <option value="30">30 Rows per page</option>
                        <option value="40">40 Rows per page</option>
                    </select>
                    <button class="btn btn-default border-0" type="button" id="prev-page-sp">
                        <i class="fa fa-angle-left extra-large-font font-weight-bold"></i>
                    </button>
                    <button class="btn btn-default border-0" type="button" id="next-page-sp">
                        <i class="fa fa-angle-right extra-large-font font-weight-bold"></i>
                    </button>
                </ul>
            </div>
        `
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
            const providerName = $(event.currentTarget).data('name');
            renderStopProviderPopup(providerName);
        })
        registerStrategyProviderPaginationEvents();
        // table sort events
        tableSortEvents($('.portfolio-users-table-content'), onFollowingTableSort);
    }

    function onFollowingTableSort(key, direction) {
        const providerUsers = STATE.getUserList();
        if (!providerUsers.length) {
            return
        }
        if (!providerUsers[0].hasOwnProperty(key)) {
            return;
        }
        tableSort(providerUsers, key, direction);
        renderStrategyProviders();
        renderTableFilters();
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
    function renderStopProviderPopup(name) {
        const container = $('#stop-provider-modal .modal-body');
        container.empty().append(`
            <p class="mb-3">Are you sure you want to stop following <b>${name}</b> ?</p>
            <div class="w-100 d-flex justify-content-end">
                <button type="button" class="btn btn-outline btn-link text-navy font-weight-bold" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" data-dismiss="modal">Confirm</button>
            </div>
        `)
    }
    function registerStrategyProviderPaginationEvents() {
        const paginationData = STATE.getPaginationData();
        // strategy provider footer rows per page
        $('#sp-rows-per-page').off().on('change', function () {
            const rowsPerPage = +this.value;
            if (rowsPerPage) {
                paginationData.rowsPerPage = rowsPerPage;
                STATE.setPaginationData(paginationData)
                fetchStrategyProviders();
            }
        })
        $('#sp-rows-per-page').val(STATE.getPaginationData().rowsPerPage)

        // fetch data with updated params on click of next pagination action
        $('#next-page-sp').unbind().click(function () {
            paginationData.page++;
            fetchStrategyProviders();
        })
        // fetch data with updated params on click of previous pagination action
        $('#prev-page-sp').unbind().click(function () {
            if (paginationData.page > 0) {
                paginationData.page--;
                if (paginationData.page === 0) {
                    $(this).attr('disabled', true);
                }
                fetchStrategyProviders();
            } else {
                $(this).attr('disabled', true);
            }
        })

        // disable prev if page number is 0 or less else enable
        if (paginationData.page <= 0) {
            $('#prev-page-sp').attr('disabled', true);
        } else {
            $('#prev-page-sp').removeAttr('disabled');
        }

        // enable next if page number is max it can be else disable
        const totalPossiblePages = Math.floor(paginationData.total / paginationData.rowsPerPage);
        if (paginationData.page >= totalPossiblePages) {
            $('#next-page-sp').attr('disabled', true);
        } else {
            $('#next-page-sp').removeAttr('disabled')
        }
    }
    // render Strategy provider responsive HTML end

    // render Strategy Follower table HTML start
    function renderStrategyFollowers() {
        const users = STATE.getUserList();
        const container = $('.portfolio-users-table .portfolio-users-table-content');
        if (DESKTOP_MEDIA.matches) {
            // screen is below 968px
            container.empty().append(getStrategyFollowersResponsiveHTML(users));
        } else {
            // screen is above 968px
            container.empty().append(getStrategyFollowersTableHTML(users));
        }
        registerStrategyFollowersTableEvents();
    }

    function getStrategyFollowersTableHTML(data) {
        return `<table class="table">
            ${getStrategyFollowersTableHeaders()}
            ${getStrategyFollowersTableBody(data)}
            ${getStrategyFollowersTableFooter(data.length)}
        </table>`
    }

    function getStrategyFollowersTableHeaders() {
        const selectedSort = STATE.getSortData();
        const { sortKey, direction } = selectedSort;
        let arrowClass = '';
        if (direction === 'asc') {
            arrowClass = 'up-arrow-sort';
        } else if (direction === 'desc') {
            arrowClass = 'down-arrow-sort';
        }

        return `
        <thead>
            <tr>
            <th class="align-middle">Provider</th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="joined_on">
                    <p class="m-0 p-0">Joined<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'joined_on' ? 'd-none' : ''}"></i></p>
                </div>
            </th>
            <th class="text-center align-middle">Period</th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="profit_or_loss">
                    <p class="m-0 p-0">P/L<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'profit_or_loss' ? 'd-none' : ''}"></i></p>
                </div>
            </th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="hwm_diff">
                    <p class="m-0 p-0">HWM Difference<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'hwm_diff' ? 'd-none' : ''}"></i></p>
                </div>
            </th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="balance">
                    <p class="m-0 p-0">Balance<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'balance' ? 'd-none' : ''}"></i></p>
                </div>
            </th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="fee_earned">
                    <p class="m-0 p-0">FEE Earned<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'fee_earned' ? 'd-none' : ''}"></i></p>
                </div>
            </th>
            <th class="text-center align-middle">
                <div class="sort-header d-flex align-items-center cursor-pointer" data-sort-key="com_earned">
                    <p class="m-0 p-0">Com Earned<i class="arrow ${arrowClass} ml-1 ${sortKey !== 'com_earned' ? 'd-none' : ''}"></i></p>
                </div>
            </th>
            <th class="align-middle text-center">Actions</th>
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
            fee_mode,
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
        S$${fee_earned}/${fee_mode}
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
            return `<button class="btn btn-white text-dark-green font-bold px-1 mr-2" type="button" data-id="${id}">Accept</button> 
            <button class="btn btn-default text-bleed-red font-bold px-1" type="button" data-id="${id}">Reject</button>`
        } else if (isNew === "false") {
            return ` <i class="fa fa-pause mr-2 cursor-pointer extra-large-font pause-follower-cta" data-id="${id}" data-name="${name}" name="actions" data-toggle="modal"
            data-target="#pause-follower-modal"></i>
            <i class="fa fa-stop mr-0 cursor-pointer extra-large-font stop-follower-cta" data-id="${id}" data-name="${name}" name="actions" data-toggle="modal"
            data-target="#stop-follower-modal"></i>`
        }
    }

    function getStrategyFollowersTableFooter(dataLength) {
        const { start, end, total } = getStartEndRecordCount(dataLength, STATE.getPaginationData());

        return `<tfoot>
        <tr>
          <td colspan="9">
          <div class="d-flex justify-content-between align-items-center">
          <p class="mb-0 text-dark-gray small-font">Showing <b>${start}</b> to <b>${end}</b> of <b>${total}</b> followers</p>
          <ul class="pagination d-flex justify-content-end align-items-center m-0">
              <select class="form-control rows-per-page mr-2" name="rows-per-page" id="sf-rows-per-page">
                  <option value="10">10 Rows per page</option>
                  <option value="20">20 Rows per page</option>
                  <option value="30">30 Rows per page</option>
                  <option value="40">40 Rows per page</option>
              </select>
              <button class="btn btn-default border-0" type="button" id="prev-page-sf">
                  <i class="fa fa-angle-left extra-large-font font-weight-bold"></i>
              </button>
              <button class="btn btn-default border-0" type="button" id="next-page-sf">
                  <i class="fa fa-angle-right extra-large-font font-weight-bold"></i>
              </button>
          </ul>
        </div>
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
            ${getStrategyFollowerResponsiveFooter(data.length)}
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
                            ${getStrategyFollowersActionColumn(id, is_new, name)}
                            <i class="d-none fa fa-pause mr-2 action-tools large-font cursor-pointer extra-large-font pause-follower-cta" data-id="${id}" data-name="${name}" name="actions" data-toggle="modal"
                            data-target="#pause-follower-modal"></i>
                            <i class="d-none fa fa-stop mr-0 action-tools large-font cursor-pointer extra-large-font stop-follower-cta" data-id="${id}" data-name="${name}" name="actions" data-toggle="modal"
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
    function getStrategyFollowerResponsiveFooter(dataLength) {
        const { start, end, total } = getStartEndRecordCount(dataLength, STATE.getPaginationData());
        return `
            <div class="d-flex justify-content-between align-items-center p-2">
                <p class="mb-0 text-dark-gray small-font">Showing <b>${start}</b> to <b>${end}</b> of <b>${total}</b> providers</p>
                <ul class="pagination d-flex justify-content-end align-items-center m-0">
                    <select class="form-control rows-per-page mr-2" name="rows-per-page" id="sp-rows-per-page">
                        <option value="10">10 Rows per page</option>
                        <option value="20">20 Rows per page</option>
                        <option value="30">30 Rows per page</option>
                        <option value="40">40 Rows per page</option>
                    </select>
                    <button class="btn btn-default border-0" type="button" id="prev-page-sp">
                        <i class="fa fa-angle-left extra-large-font font-weight-bold"></i>
                    </button>
                    <button class="btn btn-default border-0" type="button" id="next-page-sp">
                        <i class="fa fa-angle-right extra-large-font font-weight-bold"></i>
                    </button>
                </ul>
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
        registerStrategyFollowerPaginationEvents()
        // table sort events
        tableSortEvents($('.portfolio-users-table-content'), onFollowersTableSort);
    }

    function onFollowersTableSort(key, direction) {
        const followerUsers = STATE.getUserList();
        if (!followerUsers.length) {
            return
        }
        if (!followerUsers[0].hasOwnProperty(key)) {
            return;
        }
        tableSort(followerUsers, key, direction);
        renderStrategyFollowers();
        renderTableFilters();
    }

    function tableSort(data, key, direction) {
        data.sort((a, b) => {
            if (direction === 'asc') {
                return a[key] - b[key]
            } else if (direction === 'desc') {
                return b[key] - a[key]
            }
        })
        const selectedSort = {
            sortKey: key,
            direction
        }
        STATE.setSortData(selectedSort);
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
    function registerStrategyFollowerPaginationEvents() {
        const paginationData = STATE.getPaginationData();
        // strategy provider footer rows per page
        $('#sf-rows-per-page').off().on('change', function () {
            const rowsPerPage = +this.value;
            if (rowsPerPage) {
                paginationData.rowsPerPage = rowsPerPage;
                STATE.setPaginationData(paginationData)
                fetchStrategyFollowers();
            }
        })
        $('#sf-rows-per-page').val(STATE.getPaginationData().rowsPerPage)

        // fetch data with updated params on click of next pagination action
        $('#next-page-sf').unbind().click(function () {
            paginationData.page++;
            fetchStrategyFollowers();
        })
        // fetch data with updated params on click of previous pagination action
        $('#prev-page-sf').unbind().click(function () {
            if (paginationData.page > 0) {
                paginationData.page--;
                if (paginationData.page === 0) {
                    $(this).attr('disabled', true);
                }
                fetchStrategyFollowers();
            } else {
                $(this).attr('disabled', true);
            }
        })

        // disable prev if page number is 0 or less else enable
        if (paginationData.page <= 0) {
            $('#prev-page-sf').attr('disabled', true);
        } else {
            $('#prev-page-sf').removeAttr('disabled');
        }

        // enable next if page number is max it can be else disable
        const totalPossiblePages = Math.floor(paginationData.total / paginationData.rowsPerPage);
        if (paginationData.page >= totalPossiblePages) {
            $('#next-page-sf').attr('disabled', true);
        } else {
            $('#next-page-sf').removeAttr('disabled')
        }
    }
    // render Strategy Follower responsive HTML end

    // render table filters start
    function renderTableFilters() {
        const container = $('.dropdown-menu.dropdown-menu-list');
        const filterItemHTML = [];
        const filterItems = STATE.getDropdownFilterItems();

        filterItems.forEach(filter => {
            filterItemHTML.push(getFilterItemHTML(filter))
        })
        container.empty().append(filterItemHTML.join(''))
        registerTableFilterEvents(onApplyFilter);

        $('.remove-filter').unbind().click(removeAppliedFilter);
    }

    function removeAppliedFilter() {
        const filterId = $(this).parent('.currency-chip').data('id');
        // remove selected filter from state 
        STATE.removeSelectedFilter(filterId);
        // update dropdowm filter list items 
        const defaultFilter = STATE.getDefaultFilterItems().find(f => f.id === filterId);
        const dropdownFilterItems = STATE.getDropdownFilterItems();
        const dropdownFilterItemIndex = dropdownFilterItems.findIndex(f => f.id === filterId);
        if (dropdownFilterItemIndex > -1 && defaultFilter) {
            dropdownFilterItems[dropdownFilterItemIndex].filterOperation = defaultFilter.filterOperation;
            dropdownFilterItems[dropdownFilterItemIndex].filterValue = defaultFilter.filterValue;
        }
        // fetch and render table based on role 
        fetchListOfUsers();
    }

    function getFilterItemHTML(filter) {
        if (!filter) {
            return
        }
        const { id, displayName, filterOperation, filterValue, filterPercentage, filterParam } = filter;
        return `
        <li class="dropdown-item d-flex justify-content-between p-3 cursor-pointer" 
        data-id="${id}"
        data-filter-name="${displayName}"
        data-filter-operation="${filterOperation}"
        data-filter-value="${filterValue}"
        data-filter-percentage=${filterPercentage}
        data-filter-param="${filterParam}">
        <p class="mb-0 medium-font mr-3">${displayName}</p>
        <p class="mb-0 medium-font text-dark-blue font-weight-bold">${filterOperation}${filterValue}${filterPercentage ? '%' : ''}</p>
      </li>
        `
    }
    function onApplyFilter(selectedFilter) {
        console.log('filter applied ', selectedFilter);
        STATE.addSelectedFilter(selectedFilter); // update filter chips
        // update filter items list 
        const filterItems = STATE.getDropdownFilterItems();
        const filterItemIndex = filterItems.findIndex(f => f.id === selectedFilter.id)
        if (filterItemIndex > -1) {
            filterItems[filterItemIndex].filterOperation = selectedFilter.filterOperation;
            filterItems[filterItemIndex].filterValue = selectedFilter.filterValue;
        }
        fetchListOfUsers();
    }

    function renderSeletedFilters() {
        const selectedFilters = STATE.getSelectedTableFilters();
        const container = $('.selected-filters-container');
        filterChipsHTML = [];
        selectedFilters.forEach(filter => {
            const { id,
                filterName,
                filterOperation,
                filterValue,
                filterPercentage
            } = filter;
            filterChipsHTML.push(`
                <div class="currency-chip d-flex align-items-center" data-id="${id}">
                    <p class="mb-0 mr-2">${filterName} &nbsp;(${filterOperation}${filterValue}${filterPercentage ? '%' : ''})</p><img src="img/ic_cross.svg" class="remove-filter"/>
                </div>
            `)
        })
        container.empty().append(filterChipsHTML.join(''))
    }
    // render table filters end
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
        if (MOBILE_MEDIA.matches) {
            // screen size is below 480px
            container.empty().append(getSparklineResponsiveHTML(strategy, role));
        } else {
            // screen size is above 480px
            container.empty().append(getSparklineHTML(strategy, role));
        }
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
                <p class="mb-0">Total Fees <i class="fa fa-question-circle cursor-pointer ml-1" data-toggle="tooltip" data-placement="right" title="Fees + Profit Shared"></i></p>
            </div>
            <div class="value white">SGD${formatWithCommas(amount_paid)}</div>
        </div>`
        }
        return `
        <div class="d-flex flex-wrap justify-content-between desktop-content">
            <div class="sparkline mr-0">
            <div class="key">Total returns <i class="fa fa-question-circle cursor-pointer ml-1" data-toggle="tooltip" data-placement="right" data-html="true" title="${role === 'provider' ? 'Strategy Age' : 'Since Inception'} </br> ${strategy_age}"></i></div>
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
                    <p class="mb-0">Total Fees</p>
                    <p class="mb-0 small-font font-weight-light">Fees + Profit Shared</p>
                </div>
                <div class="value white">SGD${formatWithCommas(amount_paid)}</div>
            </div>`
        }
        return `<div class="responsive-content">
                    <div class="d-flex justify-content-between align-items-center p-3">
                        <div class="key">
                            <p class="mb-0">Total returns <i class="fa fa-question-circle cursor-pointer ml-1" data-toggle="tooltip" data-placement="right" data-html="true" title="${role === 'provider' ? 'Strategy Age' : 'Since Inception'} </br> ${strategy_age}"></i></p>
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

        DESKTOP_MEDIA.addEventListener('change', function (event) {
            const userRole = STATE.getRole()
            if (userRole.toLowerCase() === 'provider') {
                // render followers table
                renderStrategyFollowers();
            } else if (userRole === 'follower') {
                // render providers table
                renderStrategyProviders();
            }
        })

        MOBILE_MEDIA.addEventListener('change', function (event) {
            renderSparkline();
        })
    }

    // tour start
    function setupTour() {
        return new Tour({
            framework: "bootstrap4",
            container: "#page-container",
            // smartPlacement: true,
            // backdrop: true,
            autoscroll: true,
            onStart: function (tour) {
                console.log('started ', tour)
                $('body').addClass('tour-open')
            },
            onEnd: function (tour) {
                $('body').removeClass('tour-open')
                localStorage.setItem('showTour', 'false');
            },
            template: `
            <div class='popover tour'>
                <div class='arrow'></div>
                <h3 class='popover-header'></h3>
                <div class='popover-body mt-2'></div>
                <div class='popover-navigation'>
                    <button class='btn btn-default btn-outline mr-2' data-role='prev'>Prev</button>
                    <button class='btn btn-default btn-outline ' data-role='next'>Next</button>
                    <button class='btn btn-default btn-outline ' data-role='end'>End tour</button>
                </div>
            </div>
            `,
            showProgressBar: false,
            showProgressText: false,
            steps: [
                {
                    element: ".sparkline-container",
                    title: "My Portfolio",
                    content: "See your current holdings etc on this page",
                    placement: "bottom",
                    backdropContainer: '#page-wrapper',
                },
                {
                    element: ".portfolio-line-chart",
                    title: "Trade Terminal",
                    content: "See your current holdings etc on this page",
                    placement: "top",
                    backdropContainer: '#page-wrapper',
                },
                {
                    element: ".portfolio-users-table",
                    title: "Strategy Providers",
                    content: "Find Strategy Providers here to follow.",
                    placement: "bottom",
                    backdropContainer: '#page-wrapper',
                }
            ]
        });
    }
    // tour end
})();