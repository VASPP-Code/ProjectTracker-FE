sap.ui.define([
	
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/Sorter'
], function ( Controller, Filter, FilterOperator, Sorter) {
	"use strict";

	return Controller.extend("vaspp.Vendor.controller.Master", {
		onInit: function () {
			
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.getRoute("master").attachPatternMatched(function (oEvent) {
                this.getView().byId("productsTable").removeSelections(true);
                
             }, this);
			this._bDescendingSort = false;

			
		},
		onListItemPress: function (oEvent) {
			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1),
				productPath = oEvent.getSource().getSelectedItem().getBindingContext("mvendor").getPath(),
				product = productPath.split("/").slice(-1).pop();

			this.oRouter.navTo("detail", {layout: oNextUIState.layout, product: product});
		},
		//SEARCH THE VENDOR DETAILS USING ID
		onSearch: function (oEvent) {
			var oTableSearchState = [],
				sQuery = oEvent.getParameter("query");

			if (sQuery && sQuery.length > 0) {
				oTableSearchState = [new Filter("VendorName", FilterOperator.Contains, sQuery)];
			}

			this.getView().byId("productsTable").getBinding("items").filter(oTableSearchState, "Application");
		},
		//TO ADD NEW VENDOR
		onAddNewVendor: function () {
			var that = this;
			this.getView().getModel().setProperty("/layout", "OneColumn");

			var sNextLayout = this.getView().getModel().getProperty("/actionButtonsInfo/midColumn/closeColumn");
			if(sNextLayout == null)
			sNextLayout = "OneColumn"
			//NAVIGATE TO THE AddNewVendor 
			this.getOwnerComponent().getRouter().navTo("AddNewVendor", { "AddCust": "Add", "layout": sNextLayout,"listindex":"add" });
		},
		//SORT THE VENDOR DETAILS USING NAME
		onSort: function (oEvent) {
			this._bDescendingSort = !this._bDescendingSort;
			var oView = this.getView(),
				oTable = oView.byId("productsTable"),
				oBinding = oTable.getBinding("items"),
				oSorter = new Sorter("VendorName", this._bDescendingSort);

			oBinding.sort(oSorter);
		}
	});
});