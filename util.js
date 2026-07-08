/**
 * Utility module for the project that has different functions
 * to check if object is empty or null, create float from input,
 * prepare data to be viewed in the handlebars for example showing
 * logoutButton, showing different tab title for requests i.e "My Requests"
 * in case it's a non-authenticated user or "All Requests" in case the user
 * has an admin or staff.
 *
 * It prepares data for different pages like all cars, contact dealer, add car, etc.
 *
 */


/**
 * Identify if the object is null or empty object.
 * @param input Object to be validated for null/empty.
 * @returns {boolean} True if its null or empty object
 */
export function isEmptyOrNull(input) {
    if(input == null) {
        console.log("Null Found")
        return true
    }
    if(JSON.stringify(input) === '{}'){
        console.log("Empty Found")
        return  true
    }
    return false
}

/**
 * Parse Float if input is number.
 * @param input Text that can be a number
 * @returns {number} Float representation of input in case is a number else 0.
 */
export function parseFloat(input) {
    if (Number.isNaN(Number.parseFloat(input))) {
        return 0;
    }
    return Number.parseFloat(input)
}

/**
 * Format input to show value in USD Dollar.
 * @param input Numerical value to be represented in Dollar.
 * @returns {string} Dollar representation of the input value.
 */
export function toDollar(input) {
    let USDollar = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });
    return USDollar.format(input)
}

/**
 * Prepare data for handlebars to be consumed by allCars.handlebars or
 * noCarsData.handlebars.
 *
 * which is can show list of all cars in the database for sale.
 * @param req Request Object to identify if the user role is admin or staff or none of them
 *  or access session data.
 *
 * @param result List of cars empty or non empty to be shown by allCars.handlebars
 *
 * @returns {{viewData, mainViewData, logoutData, filterViewData}}
 * viewData => to show data in car card.
 * mainViewData => Activate "All Cars" tab. Show tab title for admin or enable/disable tab that can be active.
 * logoutData => to show logout option in case the user is authenticated
 * filterViewData => filter data that is saved in the session.
 */
export function prepareAllCarData(req,result) {
    const  adminMode = isAdminMode(req)
    const staffMode = isStaffMode(req)
    const viewData = result.map((element) => {
        let data = {
            id: element._id,
            vinNumber: element.vinNumber,
            title: element.year + ' ' + element.brand.brandName + ' ' + element.carName,
            description: element.description,
            price: toDollar(element.price),
            miles: element.miles + ' miles',
            mainImage: 'carImages/'+element.mainImage,
            exteriorColor: element.exteriorColor,
            interiorColor: element.interiorColor
        }

        data.showCarQuoteBadge  = "d-none"
        data.quoteCount = 0
        if((adminMode || staffMode) && element.quotes != undefined) {
            data.quoteCount =  element.quotes.length
            if(element.quotes.length>0) {
                data.showCarQuoteBadge =  "d-block"
            }
        }
        if(adminMode) {
            // Show Delete
            data.showDelete  = "d-block"
            data.showContactDealer = "d-none"
        } else {
            // Show Contact Dealer
            data.showDelete = "d-none"
            data.showContactDealer = "d-block"
        }
        return data
    })
    return prepareTabData(viewData, tabData(req,"allCarsTab"),filterData(req),prepareLogoutData(req))
}

/**
 * Prepare data for handlebars to be consumed by contactDealerForm.handlebars
 *
 * This form can be shown to customers that are non authenticated or the one with
 * staff role.
 *
 * @param req Request Object to identify if the user role is admin or staff or none of them
 *  or access session data.
 * @param result Car Object that has car details.
 * @returns {{viewData, mainViewData, logoutData, filterViewData}}
 * viewData => to show data in contact dealer form.
 * mainViewData => Activate "All Cars". Show tab title for admin or enable/disable tab that can be active.
 * logoutData => to show logout option in case the user is authenticated
 * filterViewData => filter data that is saved in the session.
 */
export function prepareContactDealerData(req,result) {

    let viewData = {}

    if(isEmptyOrNull(result)) {
        viewData = {}
    } else {
        const hasQuoteBeenSubmitted = isQuoteSubmittedFor(req,result.vinNumber)

            viewData =  {
                id: result._id,
                vinNumber: result.vinNumber,
                title: result.year + ' ' + result.brand.brandName + ' ' + result.carName,
                description: result.description,
                price: toDollar(result.price),
                miles: result.miles + ' miles',
                mainImage: '/carImages/'+result.mainImage,
                exteriorColor: result.exteriorColor,
                interiorColor: result.interiorColor,
                engine: result.engine,
                drive: result.drive,
                program: result.program,
                mileageCity: result.mileageCity + ' mpg',
                mileageHighway: result.mileageHighway + ' mpg',
                mileageCombined: result.mileageCombined + ' mpg',
                horsePower: result.horsePower + ' hp',
                quoteSubmittedAlertDisplayStyle: hasQuoteBeenSubmitted ? "d-block" : "d-none"
            }
    }
    return prepareTabData(viewData, tabData(req,"allCarsTab"),{}, prepareLogoutData(req))
}

/**
 * Filter Data that can be used to filter cars ex.
 * new car or certified car or max price.
 * @param req Request Object to identify if the user role is admin or staff or none of them
 *  or access session data.
 * @returns {{certifiedCarChecked: (string), newCarChecked: (string), maxPrice: *}|{certifiedCarChecked: string, newCarChecked: string, maxPrice: number}}
 * Values from session for newCar or certified car or max price filter.
 */
function filterData(req){
    let filterSessionData = req.session.sessionData.filterSelection
    if(isEmptyOrNull(filterSessionData)) {
        console.log("Util: Filter: Returning Defaults")
        return  {
            newCarChecked: "checked",
            certifiedCarChecked: "checked",
            maxPrice: 100000
        }
    } else {
        console.log("Util: Filter: Returning Non Defaults")
        let newCarChecked = ""
        if(isEmptyOrNull(filterSessionData.newCar)) {
            newCarChecked = "checked"
        } else {
            newCarChecked = filterSessionData.newCar == true ? "checked":""
        }

        let certifiedCarChecked = ""
        if(isEmptyOrNull(filterSessionData.certifiedCar)) {
            certifiedCarChecked = "checked"
        } else {
            certifiedCarChecked = filterSessionData.certifiedCar == true ? "checked":""
        }

        let maxPrice = 0
        if(isEmptyOrNull(filterSessionData.maxPrice)) {
            maxPrice = 100000
        } else {
            maxPrice = filterSessionData.maxPrice
        }
        return  {
            newCarChecked: newCarChecked,
            certifiedCarChecked: certifiedCarChecked,
            maxPrice: maxPrice
        }
    }
}

/**
 * Prepares tabData for a specified tab. It can help to set a specific tab active or de-active tab.
 * Tab data is used by all handlebars that use a default main.handlebars.
 *
 * @param req Request Object to identify if the user role is admin or staff or none of them
 *  or access session data.
 * @param tab Tab for which data is being requested.
 * @returns {{allCarsTab: (string), myRequestsTab: (string), requestTabTitle: (string), showAddACar: (string), offerCarsTab: (string), requestTabLink: (string)}}
 * Tab data with status of which are being active and which are not.
 * For admin / staff role the title changes from "My Requests" to "All Requests".
 */
function tabData(req,tab){

    const adminMode = isAdminMode(req)
    const staffMode = isStaffMode(req)
    const tabData =
         {
            allCarsTab: tab == "allCarsTab" ? "active": "",
            offerCarsTab: tab == "offerCarsTab" ? "active": "",
            myRequestsTab: tab == "myRequestsTab" ? "active": "",
            requestTabTitle: (adminMode || staffMode) ? "All Requests": "My Requests",
             requestTabLink: (adminMode || staffMode) ? "/allRequests" : "/myRequests",
             showAddACar: adminMode ? "d-block" : "d-none"
        }

    return tabData
}

/**
 * Prepare data when car deletion is success , used by carDeletionSuccess.handlebars.
 *
 * Helps to show vin number of the deleted car.
 *
 * @param vinNumber VIN number to be displayed on the page.
 * @param req Request Object to identify if the user role is admin or staff or none of them
 *  or access session data.
 * @returns {{viewData, mainViewData, logoutData, filterViewData}}
 * viewData => to show vin number on car deletion success page.
 * mainViewData => Activate "All Cars" tab. Show tab title for admin or enable/disable tab that can be active.
 * logoutData => to show logout option in case the user is authenticated
 * filterViewData => filter data that is saved in the session.
 */
export function prepareDeleteCarSuccessData(vinNumber,req) {
    return prepareTabData({
        vinNumber: vinNumber
    }, tabData(req,"allCarsTab"),filterData(req), prepareLogoutData(req))
}

/**
 * Prepare data when car deletion is failure, used by carDeletionFailed.handlebars.
 *
 * @param req Request Object to identify if the user role is admin or staff or none of them
 *  or access session data.
 * @returns {{viewData, mainViewData, logoutData, filterViewData}}
 * viewData => show car deletion failed page.
 * mainViewData => Activate "All Cars" tab. Show tab title for admin or enable/disable tab that can be active.
 * logoutData => to show logout option in case the user is authenticated
 * filterViewData => filter data that is saved in the session.
 */
export function prepareDeleteCarFailedData(req) {
    return prepareTabData({}, tabData(req,"allCarsTab"),filterData(req),prepareLogoutData(req))
}

/**
 * Helps to show content while adding car or while deleting the car.
 * While adding a car the page will help empty data while deleting
 * car it will help to show alert at the top asking for confirmation
 * ane will also prepopulate the form with existing values, however editing
 * will be disabled while deleting a car.
 *
 * Data is used by addCar.handlebar.
 *
 * @param req Request Object to identify if the user role is admin or staff or none of them
 *  or access session data.
 * @param result Car Data object if its about deleting a car or empty object if prepare
 * data is to add a new car.
 * @param mode "add" or "delete"
 * @returns {{viewData, mainViewData, logoutData, filterViewData}}
 * viewData => Data to be used while adding or deleting a car.
 * mainViewData => Activate "All Cars" tab. Show tab title for admin or enable/disable tab that can be active.
 * logoutData => to show logout option in case the user is authenticated
 * filterViewData => filter data that is saved in the session.
 */
export function prepareAddCarData(req, result,mode) {
    let viewData = {}

    if(isEmptyOrNull(result)) {
        viewData = {}
    } else {

        let updatedBrandData = result.allBrands
        let updatedEngineData = result.allEngineOptions
        let updatedDriveOptionsData = result.allDriveOptions
        let updatedCarCategoriesData = result.allCarCategories
        let updatedCarProgramsData = result.allCarPrograms
        let udpatedCarData =  result.carData
        if(!isEmptyOrNull(udpatedCarData)) {
            updatedBrandData = result.allBrands.map((element) => {
                return {
                    brandName: element.brandName,
                    id: element._id,
                    selected: result.carData.brand._id == element._id ? "selected" : ""
                }
            })

            updatedEngineData = result.allEngineOptions.map((element) => {
                return {
                    name: element.name,
                    id: element.id,
                    selected: result.carData.engine == element.id ? "selected" : ""
                }
            })

            updatedDriveOptionsData = result.allDriveOptions.map((element) => {
                return {
                    name: element.name,
                    id: element.id,
                    selected: result.carData.drive == element.id ? "selected" : ""
                }
            })

            updatedCarCategoriesData = result.allCarCategories.map((element) => {
                return {
                    name: element.name,
                    id: element.id,
                    selected: result.carData.category == element.id ? "selected" : ""
                }
            })

            updatedCarProgramsData = result.allCarPrograms.map((element) => {
                return {
                    name: element.name,
                    id: element.id,
                    selected: result.carData.program == element.id ? "selected" : ""
                }
            })
        } else {
            udpatedCarData = {
                mainImage : "blankImage.jpg"
            }
        }

        viewData ={
            allBrands: updatedBrandData,
            allEngineOptions: updatedEngineData,
            allDriveOptions: updatedDriveOptionsData,
            allCarCategories: updatedCarCategoriesData,
            allCarPrograms: updatedCarProgramsData,
            carData: udpatedCarData
        }

        console.log("Default Image Path 1",viewData)

        let modeData = {}
        modeData.showDeleteAlert = "d-none"
        modeData.buttonTitle = "Add Car"
        modeData.showSubmitButton = "d-block"
        modeData.inputDisabled = ""
        if(!isEmptyOrNull(mode)) {
            if(mode == "edit") {
                modeData.buttonTitle = "Save Car"
            }else if(mode == "delete") {
                modeData.showDeleteAlert = "d-block"
                modeData.showSubmitButton = "d-none"
                modeData.inputDisabled = "disabled"
            }
        }
        viewData.modeData = modeData
    }
    return prepareTabData(viewData, tabData(req,"allCarsTab"),filterData(req),prepareLogoutData(req))
}

/**
 * Prepare data to be shown to the user for their submitted request, these
 * are the ones that are store in session or in case there are no my requests
 * show empty page.
 *
 * Data is used by myRequests.handlebars and noRequestsFound.handlebars.
 *
 * @param req Request Object to identify if the user role is admin or staff or none of them
 *  or access session data.
 * @param result List of my requests that needs to be shown in the "My Requests" tab.
 * @returns {{viewData, mainViewData, logoutData, filterViewData}}
 * viewData => Data to be used while showing my requests that were in the session.
 * mainViewData => Activate "My Requests" tab. Show tab title for admin or enable/disable tab that can be active.
 * logoutData => to show logout option in case the user is authenticated
 * filterViewData => filter data that is saved in the session.
 */
export function prepareMyRequestsData(req, result) {
    let viewData = {}

    if(isEmptyOrNull(result)) {
        viewData = {}
    } else {
        viewData = result.map((element) => {
            return {
                id: element._id,
                title: element.car.year + ' ' + element.car.brand.brandName + ' ' + element.car.carName,
                email: element.email,
                note: element.note,
                vinNumber: element.vinNumber,
                mainImage: '/carImages/'+element.car.mainImage,
            }
        })
    }


    return prepareTabData(viewData, tabData(req,"myRequestsTab"),filterData(req),prepareLogoutData(req))
}

/**
 * Prepare data to be shown for all the requests submitted to the dealership.
 * It used to display data in allRequests.handlebars.
 * @param req Request Object to identify if the user role is admin or staff or none of them
 *  or access session data.
 * @param result list of Car Quotes submitted to the dealership.
 * @returns {{viewData, mainViewData, logoutData, filterViewData}}
 * viewData => Data to be used while showing all requests that were submitted to the dealership.
 * mainViewData => Activate "My Requests" tab. Show tab title for admin or enable/disable tab that can be active.
 * Tab title will be "All Requests" in such case and will have link to "/allRequests".
 * logoutData => to show logout option in case the user is authenticated
 * filterViewData => filter data that is saved in the session.
 */
export function prepareAllRequestsData(req, result) {
    let viewData = {}

    if(isEmptyOrNull(result)) {
        viewData = {}
    } else {
        viewData = result.map((element) => {
            return {
                id: element._id,
                title: element.car.year + ' ' + element.car.brand.brandName + ' ' + element.car.carName,
                email: element.email,
                note: element.note,
                price: toDollar(element.car.price),
                markButtonEnabled: element.reached ? "disabled" : "",
                markLeftIconColor: element.reached ? "green": "gray"
            }
        })
    }


    return prepareTabData(viewData, tabData(req,"myRequestsTab"),filterData(req), prepareLogoutData(req))
}

/**
 * Prepares the data to be used by different handlebars with a default layout provided by main.handlebars
 * @param viewData Data corresponding to each specific page shown under the tab.
 * @param mainViewData Tab data to highlight tab, change tab title and change link when clicked on the tab.
 * @param filterViewData Filter data that is available in the session.
 * @param logoutData Logout data to show or hide logout button, depending on whether the user is authenticated
 * or not.
 * @returns {{viewData, mainViewData, logoutData, filterViewData}}
 * Data to be show in handle bars with a default layout provided by main.handlebars.
 */
export function prepareTabData(viewData, mainViewData, filterViewData, logoutData) {
    return {
        viewData: viewData,
        mainViewData: mainViewData,
        filterViewData: filterViewData,
        logoutData: logoutData
    }
}

/**
 * Helps to create data that is used by main.handlebar to show or hide logout button.
 * @param req Request object to identify if request was authenticate or not.
 * @returns {{showLogoutStyle: (string)}} showLogoutStyle with show or hide style for logout button.
 */
export function prepareLogoutData(req) {
    return {
        showLogoutStyle: req.isAuthenticated() ? "d-block" : "d-none"
    }
}

/**
 * Save filter data in session, so that when page is refreshed it can be referenced again
 * if the session is still available.
 *
 * @param req Request object to access session and store filter data in "filterSelection".
 * @param newCarSelected true if user selected newCar for filtering
 * @param certifiedCarSelected true if user selected certified for filtering
 * @param maxPrice Max price value if user has selected it with the help of slider.
 */
export function saveFilterToSession(req,newCarSelected,certifiedCarSelected,maxPrice) {
    req.session.sessionData.filterSelection = {
        newCar: newCarSelected,
        certifiedCar: certifiedCarSelected,
        maxPrice: maxPrice
    }
    console.log("Filter Saved", req.session.sessionData.filterSelection)
}

/**
 * To save submitted requests by a customer used this function.
 * It stores in session. Multiple submitted requested Id's can be
 * saved in session.
 *
 * Later on "My Requests" tab can be used to show these request ids
 * from the session.
 * @param req Request object to access session
 * @param quoteId Quote id after submitted the request by the user.
 * @param vinNumber VIN number for which a quote was submitted. This can be
 * used to show a warning to the user that quote for this VIN number has already
 * been submitted.
 */
export function saveMySubmittedQuote(req,quoteId, vinNumber) {
    req.session.sessionData.mySubmittedRequestIds.push( {
        quoteId: quoteId,
        vinNumber: vinNumber
    })
    console.log("Utility: saveMySubmittedQuote: Current SubmittedRequestIds", req.session.sessionData.mySubmittedRequestIds)
}

/**
 * Helps to identify if the quote for the VIN was already submitted.
 *
 * @param req Request object to access session
 * @param vinNumber VIN number for which quote submission has to be identified.
 * @returns {boolean} True if quote was submitted for a given number and is available in
 * the session.
 */
export function isQuoteSubmittedFor(req,vinNumber){
    let result = req.session.sessionData.mySubmittedRequestIds.filter((element) => {
        return element.vinNumber == vinNumber
    })
    if(result.length>0){
        return true
    }
    return false
}

/**
 * Fetch all the request id's from session that were submitted by the user.
 * @param req Request object to access session
 * @returns {*[]} List of submitted quote id that can be used to fetch Quotes and
 * can be shown in "My Request".
 */
export function getSubmittedQuoteIds(req){
    return req.session.sessionData.mySubmittedRequestIds.map((element) => {
        return element.quoteId
    })
}

/**
 * Check if the authenticated user is an Admin.
 * @param req Request object to fetch deserialized user.This user has a role property.
 * @returns {boolean} true if the logged-in user has an admin role.
 */
export function isAdminMode(req){
    const user = req.user
    if(user?.role == "admin"){
        return true
    }
    return false
}

/**
 * Check if the authenticated user is an Staff.
 * @param req Request object to fetch deserialized user. This user has a role property.
 * @returns {boolean} true if the logged-in user has a staff role.
 */
export function isStaffMode(req){
    const user = req.user
    if(user?.role == "staff"){
        return true
    }
    return false
}