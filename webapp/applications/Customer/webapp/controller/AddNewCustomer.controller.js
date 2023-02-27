sap.ui.define([
    "sap/ui/core/mvc/Controller",
   "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
                ],function (Controller, MessageBox, JSONModel) {
            "use strict";
        return Controller.extend("vaspp.Customer.controller.AddNewCustomer", {
          onInit: function () {
            this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            this.getOwnerComponent().getRouter().getRoute("AddNewCustomer").attachPatternMatched(this.onObjectMatched, this);
        },
          onObjectMatched: function (oEvent) {
                var that = this;
                var task = oEvent.getParameter("arguments").AddCust;
                that.isAdd = task;
                if (task !== "Edit") {
                that.getView().setModel(new JSONModel({}));
                } else {
                  var prodd = oEvent.getParameter("arguments").listindex;
                  var EditModel=that.getView().getModel("mcustomer").getData().CustomerCollection[prodd];
                  var data={
                  "customerName":EditModel.customerName,
                  "id":EditModel.id,
               
                  "email":EditModel.email,
                  "contact":EditModel.contact,
                  "country":EditModel.country,
                  "city":EditModel.city,
                  "region1":EditModel.region1,
                 "zipCode":EditModel.zipCode,
                  "contactPerson":EditModel.contactPerson,
                  "contactPhone":EditModel.contactPhone,
                  "contactEmail":EditModel.contactEmail
                 };
                  this.getView().setModel(new JSONModel(data));
                  this.getView().getModel("mcustomer").getData().CustomerCollection.splice(prodd, 1, data);
    
                  this.getView().getModel("mcustomer").updateBindings(true);
                        }
                    },
                    //ADDING AND UPDATING CUSTOMER DETAILS
            handleAddUserOkPress: function (oEvent) {
                        var that = this;
                        var Err = this.ValidateCreateCust();
                            if (Err == 0) {
                                if (that.isAdd == "Edit") {
                                this.getOwnerComponent().getModel("mcustomer").updateBindings(true);
                                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                                    oRouter.navTo("master", {"AddCust": "Edit"});
                                } else {
                                    that.getView().getModel("mcustomer").getData().CustomerCollection.push(this.getView().getModel().getData());
                                    that.getView().getModel("mcustomer").updateBindings(true);
                                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                                    oRouter.navTo("master", {"AddCust": "Add"});
                                }
                            } 
                        else {
                                this.getView().setBusy(false);
                                var text = "Mandatory Fields are Required";
                                MessageBox.error(text);
                            }
                        },
                        //TO CHECK DATA VALIDATION
            ValidateCreateCust: function () {
                            var Err = 0;
                            var thisView = this.getView();
                   if (thisView.byId("idProjectId1").getValue() === "") {
                   thisView.byId("idProjectId1").setValueState("None");
                   Err++;	
                      }
                      if (thisView.byId("idProjectId4").getValue() === "") {
                    	thisView.byId("idProjectId4").setValueState("None");
                      Err++;
                      }
                      if (thisView.byId("idProjectId5").getValue() === "") {
                    	thisView.byId("idProjectId5").setValueState("None");
                      Err++;
                      }
                      if (thisView.byId("idProjectId6").getValue() === "") {
                    	thisView.byId("idProjectId6").setValueState("None");
                      Err++;
                      }
                      if (thisView.byId("idProjectId11").getValue() === "") {
                    	thisView.byId("idProjectId11").setValueState("None");
                      Err++;
                      }
                      if (thisView.byId("idProjectId12").getValue() === "") {
                    	thisView.byId("idProjectId12").setValueState("None");
                      Err++;
                      }
                      if (thisView.byId("idProjectId13").getValue() === "") {
                    	thisView.byId("idProjectId13").setValueState("None");
                      Err++;
                      }
                      return Err;
                        },
                        //CANCELING THE DATA GETTING ADDED OR UPDATED 
                        handleWizardCancel: function () {
                            var that=this;
                           MessageBox.confirm("Do you want to Cancel",
                   {
                    actions: ["Yes", "No"],
                    emphasizedAction: "Yes",
                    onClose: function (oEvent) { 
                        if (oEvent == "Yes"){
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                            oRouter.navTo("master");
                        }
                    }
                    });
                        },		                        
});

});
