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
    // document ready
    $(function () {
        // role has to be set first before callig other methods as they depend upon this value
        STATE.setRole(localStorage.getItem('currentRole')); // provider or follower
        fetchProfileDetails();
        fetchTradingAccounts();
    })
    // data fetch functions start
    function fetchProfileDetails() {
        const role = STATE.getRole();
        if (role === 'provider') {
            callAjaxMethod({
                url: 'https://copypip.free.beeceptor.com/strategy-provider-details?id=123',
                successCallback: (data) => {
                    STATE.setProfileDetails(data.data);
                    renderBasicProfileCard();
                }
            })
        }
    }

    function fetchTradingAccounts() {
        callAjaxMethod({
            url: 'https://copypip.free.beeceptor.com/get-trading-accounts',
            successCallback: (data) => {
                STATE.setTradingAccounts(data.data);
                renderTradingAccountsTable();
            }
        })
    }

    // data fetch functions end

    // render basic profile start
    function renderBasicProfileCard() {
        const profileDetails = STATE.getProfileDetails();
        const container = $('.settings-page .basic-profile-settings');
        container.append(getBasicProfileSettingsHTML(profileDetails))
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
            cumulative_returns,
            avg_growth_per_month,
            avg_pips,
            trade_count,
            max_drawdown
        } = data;

        return `
        <div class="mb-3">
            <img alt="image" class="rounded-circle img-fluid img-sm float-left" src="${profile_image}">
            <div class="ml-2 float-left">
                <p class="font-bold extra-large-font mb-0">${username}</p>
                <p class="text-light-black extra-large-font mb-0">${name}</p>
            </div>
        </div>
        <div class="divider"></div>
        <!-- strategy philosophy start -->
        <div class="py-3">
            <p class="mb-2 small-font font-bold text-dark-black">Strategy Philosophy</p>
            <p class="mb-2 text-dark-gray">${strategy_philosophy}</p>
            <p class="mb-0 text-dark-gray small-font font-bold">Joined ${formatDate(new Date(joined_date))}
        </div>
        <!-- strategy philosophy end -->
        <div class="divider"></div>
        <!-- strategy age start -->
        <div class="py-3 d-flex justify-content-between align-items-center">
            <p class="mb-0 font-bold small-font text-dark-black">Strategy Age</p>
            <p class="mb-0 medium-font font-bold text-dark-black">${strategy_age}</p>
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
        <div class="pt-3 d-flex justify-content-between align-items-center">
            <div>
                <p class="mb-0 font-bold small-font text-dark-black">Max Drawdown </p>
            </div>
            <p class="mb-0 extra-large-font text-light-red font-bold">${max_drawdown}%</p>
        </div>
        <!-- Max Drawdown end -->
        `
    }
    // render basic profile end

    // render trading accounts start
    function renderTradingAccountsTable() {
        const tradingAccounts = STATE.getTradingAccounts();
        const container = $('.settings-page .trading-accounts');
        container.append(getTradingAccountsTableHTML(tradingAccounts))
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
                <td >
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

})();