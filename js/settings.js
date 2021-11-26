(() => {
    class State {
        role = ''; // follower or provider
        profileDetails = {};
        tradingAccounts = [];
        isProfileDetailsValid = {
            email: false,
            firstName: false,
            lastName: false,
            mobile: false
        }
        hiddenStrategyAccounts = []

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

        getIsProfileDetailsValid() {
            return this.isProfileDetailsValid.email && this.isProfileDetailsValid.firstName && this.isProfileDetailsValid.lastName && this.isProfileDetailsValid.mobile;
        }

        setIsProfileDetailsValid(control, data) {
            if (typeof data !== "boolean") {
                return
            }
            this.isProfileDetailsValid[control] = data;
            if (!data) {
                $('#update-profile-details').attr('disabled', 'true');
            } else {
                $('#update-profile-details').removeAttr('disabled');
            }
        }

        getHiddenStrategyAccounts() {
            return this.hiddenStrategyAccounts;
        }
        setHiddenStrategyAccounts(data) {
            if (!Array.isArray(data)) {
                return;
            }
            this.hiddenStrategyAccounts = data;
            localStorage.setItem('hiddenStrategyAccounts', JSON.stringify(this.hiddenStrategyAccounts));
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
        const hiddenStrategyAccounts = localStorage.getItem('hiddenStrategyAccounts');
        STATE.setHiddenStrategyAccounts(JSON.parse(hiddenStrategyAccounts));
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

        // enabling slect 2 theme on dropdown
        $('.country_select_dropdown').select2({
            theme: 'bootstrap4',
        });

        // init toast notification
        $('.toast').toast({
            delay: 2000,
            animation: true
        })

        $('#submit-provider-application').unbind().click(function () {
            renderSuccessToast('Application submitted');
        })
        $('#update-profile-details').unbind().click(function () {
            const container = $('.profile-settings');
            container.find('#email_address').blur();
            container.find('#first_name').blur();
            container.find('#last_name').blur();
            container.find('#mobile').blur();
            if (STATE.getIsProfileDetailsValid()) {
                renderSuccessToast('Profile details updated')
            }
        })

        // country flags with prefixes
        var input = document.querySelector("#mobile");
        window.intlTelInput(input, {
            separateDialCode: true
        });
        hideUnhideStrategyAccountEvents();
    }

    function hideUnhideStrategyAccountEvents() {
        // events to show correct account number on hide and unhide SP modals
        const accountType = localStorage.getItem('selectedAccountType');
        const accountNo = localStorage.getItem('selectedAccountNo');
        const selectedAccountType = $('.selected-account-type');
        if (accountType && accountNo) {
            if (accountType.toUpperCase() === 'DEMO') {
                selectedAccountType.addClass('demo');
                $('.account-number').addClass('demo-account');
            } else {
                selectedAccountType.removeClass('demo').addClass('live');
                $('.account-number').removeClass('demo-account');
            }
            selectedAccountType.text(accountType);
            $('.selected-account-number').text(accountNo);
        }

        // on hide cta store the data in state , localstorage and re-render button
        $('#hide-strategy-modal #hide-account-cta').unbind().click(function () {
            const selectedAccountNo = localStorage.getItem('selectedAccountNo');
            const hiddenStrategyAccounts = STATE.getHiddenStrategyAccounts();
            hiddenStrategyAccounts.push(selectedAccountNo);
            STATE.setHiddenStrategyAccounts(hiddenStrategyAccounts);
            renderHideUnhideButton()
        })

        // on unhide cta remove the data in state, localstorage and re-render button
        $('#unhide-strategy-modal #unhide-account-cta').unbind().click(function () {
            const selectedAccountNo = localStorage.getItem('selectedAccountNo');
            const hiddenStrategyAccounts = STATE.getHiddenStrategyAccounts();
            const index = hiddenStrategyAccounts.findIndex(a => a === selectedAccountNo)
            if (index > -1) {
                hiddenStrategyAccounts.splice(index, 1);
                STATE.setHiddenStrategyAccounts(hiddenStrategyAccounts);
            }
            renderHideUnhideButton()
        })
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
                    validateBasicProfileEvents();
                    fillFormWithProfileDetails();
                }
            })
        } else if (role === 'follower') {
            callAjaxMethod({
                url: 'https://copypip.free.beeceptor.com/strategy-follower-details?id=123',
                successCallback: (data) => {
                    STATE.setProfileDetails(data.data);
                    renderBasicProfileCard(role);
                    validateBasicProfileEvents();
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
        registerBasicProfileEvents();
        renderHideUnhideButton(); // global function
    }

    function getBasicProfileSettingsHTML(data) {
        if (!data) {
            return
        }
        const {
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

        const profile_image = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon&f=y';

        const strategyPhilosophyHTML = role === 'provider' ? `<div class="py-3">
        <p class="mb-2 small-font font-bold text-dark-black">Strategy Philosophy</p>
        <p class="mb-2 text-dark-gray">${strategy_philosophy}</p>
        <p class="mb-0 text-dark-gray small-font font-bold">Joined ${formatDate(new Date(joined_date))}
        </div> 
        <div class="divider"></div>` : '';

        const settingsButton = role === 'provider' ? `<button id="strategy" class="btn btn-default mt-3 mr-3" type="button" data-toggle="modal"
        data-target="#strategy-settings-modal"><i class="fa fa-gear"></i>&nbsp;&nbsp;Strategy</button>` : '';

        const roleBasedCTA = role === 'provider' ? `<div class="hide-strategy-button-container mt-3 mr-3"></div>` : `<button class="btn btn-default btn-warning mt-3" type="button" data-toggle="modal" data-target="#become-strategy-provider-modal">Apply to be a Strategy Provider</button>`

        return `
        <div class="mb-3">
            <div class="position-relative">
                <img alt="image" class="profile-img rounded-circle img-fluid img-sm float-left" src="${profile_image}">
                <img alt="camera" class="camera-img rounded-circle cursor-pointer" src="img/ic_camera.svg" />
                <input id="imageUpload" type="file" name="profile_photo" placeholder="Photo" required="" capture class="d-none"/>
            </div>
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
            <p class="mb-0 font-bold small-font text-dark-black">Age</p>
            <p class="mb-0 medium-font font-bold text-dark-black">${role === 'provider' ? strategy_age : follower_age}</p>
        </div>
        <!-- strategy age end -->
        <div class="divider"></div>
        <!-- Total returns start -->
        <div class="py-3 d-flex justify-content-between align-items-center">
            <div>
                <p class="mb-0 font-bold mall-font text-dark-black">Total Returns </p>
                <p class="mb-0 small-font text-dark-black font-weight-light">since Inception 1
                    Jul 2021</p>
            </div>
            <p class="mb-0 super-large-font text-dark-green font-bold">${cumulative_returns}%</p>
        </div>
        <!-- Total returns end -->
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
        <div class="d-flex flex-wrap">
            ${roleBasedCTA}
            ${settingsButton}
            <a href="${window.location.origin}/refer-a-friend.html" ><button type="button" class="btn btn-default text-blue font-bold mt-3">Refer a Friend</button></a>
        </div>
        `
    }

    function registerBasicProfileEvents() {
        const container = $('.basic-profile-settings');
        // show file upload dialog on camera click
        container.find('.camera-img').unbind().click(function () {
            container.find('#imageUpload').click();
        })
        const profileImageUrl = localStorage.getItem('profileImage');
        container.find('.profile-img').attr('src', profileImageUrl);
        // on select pic
        container.find('#imageUpload').unbind().change(function () {
            showPreview(this);
        })

        function showPreview(uploader) {
            if (uploader.files && uploader.files[0]) {
                const file = uploader.files[0];
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function () {
                    container.find('.profile-img').attr('src', reader.result);
                    $('.nav-profile-img').attr('src', reader.result);
                    localStorage.setItem('profileImage', reader.result);
                };
            }
        }
    }

    function validateBasicProfileEvents() {
        const profileDetails = STATE.getProfileDetails();
        const container = $('.profile-settings');
        // validate first name
        validateTextInput(container.find('#first_name'), function (val) {
            let isValid = false;
            if (val.length > 20) {
                isValid = false;
            } else {
                isValid = true;
            }
            STATE.setIsProfileDetailsValid('firstName', isValid);
            return isValid;
        }, 'Max length 20')

        // validate last name
        validateTextInput(container.find('#last_name'), function (val) {
            let isValid = false;
            if (val.length > 20) {
                isValid = false;
            } else {
                isValid = true;
            }
            STATE.setIsProfileDetailsValid('lastName', isValid);
            return isValid;
        }, 'Max length 20')

        // validate mobile number
        validateTextInput(container.find('#mobile'), function (val) {
            let isValid = false;
            if (!isNaN(val)) {
                isValid = true;
            }
            STATE.setIsProfileDetailsValid('mobile', isValid);
            return isValid;
        }, 'Invalid phone number');

        // validate email address
        validateTextInput(container.find('#email_address'), function (val) {
            const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            const isValid = pattern.test(val)
            STATE.setIsProfileDetailsValid('email', isValid);
            return isValid
        }, 'Invalid email')
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
                <td class="font-bold medium-font align-middle">
                    <p class="mb-0">${account_name}</p>
                </td>
                <td>
                    <p class="mb-0 text-center p-1 m-auto extra-small-font ${account_type.toUpperCase() === 'LIVE' ? 'live-account' : 'demo-account'}">${account_type}</p>
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