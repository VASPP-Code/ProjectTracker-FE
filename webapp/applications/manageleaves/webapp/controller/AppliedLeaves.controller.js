sap.ui.define([
   
	"sap/ui/core/mvc/Controller",
   "VASPP/manageleaves/utils/formatter",
   "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,formatter,MessageBox) {
        "use strict";
     
        return Controller.extend("VASPP.manageleaves.controller.AppliedLeaves", {
         formatter: formatter,
   
            onInit: function () {
             
            },

//NAVIGATING BACK TO LEAVE ENTRY
            handleNavBack: function () {
				sap.ui.core.UIComponent.getRouterFor(this).navTo("RouteApplyLeaves");
			},

//DELETE THE LEAVE REQUEST            
            deleteRow: function (oEvent) {
                var oTable = this.getView().byId("ItemDetailsTable");
                var oItem = oEvent.getParameter("listItem");
                MessageBox.confirm("Are you sure you want to Delete the Leave Request?", {
                    actions: ["Yes", "No"],
                    emphasizedAction: "Yes",
                    onClose: function (oEvent) {
                        if (oEvent == "Yes") {
                            oTable.removeItem(oItem);
                          //  that.getView().getModel("memployee").updateBindings(true);
                            MessageBox.success("Leave Request has been deleted");
                           
                        }
                    }
                }
                );
            },
            

        });
    });