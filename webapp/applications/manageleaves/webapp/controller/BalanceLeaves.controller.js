sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("VASPP.manageleaves.controller.BalanceLeaves", {
            onInit: function () {

            },

            //NAVIGATING BACK TO LEAVE ENTRY
            handleNavBackpress: function () {
				sap.ui.core.UIComponent.getRouterFor(this).navTo("RouteApplyLeaves");
			}
        });
    });