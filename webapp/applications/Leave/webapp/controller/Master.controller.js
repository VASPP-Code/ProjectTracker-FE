sap.ui.define([
	
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/Sorter'
], function( Controller, Filter, FilterOperator, Sorter) {
"use strict";

	return Controller.extend("vaspp.Leave.controller.Master", {
		onInit: function () {
			
			// TO REMOVE THE AUTO SELECTION FROM THE LIST
			this.oRouter = this.getOwnerComponent().getRouter();
			
			this.oRouter.getRoute("master").attachPatternMatched(function (oEvent) {
                this.getView().byId("productsTable").removeSelections(true);
                
             }, this);
			this._bDescendingSort = false;
		},
		
		onListItemPress: function (oEvent) {
			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1),
				productPath = oEvent.getSource().getSelectedItem().getBindingContext("mleave").getPath(),
				product = productPath.split("/").slice(-1).pop();
				

			this.oRouter.navTo("detail", {layout: oNextUIState.layout, product: product});
			
		},
		//SEARCH
		onSearch: function (oEvent) {
			var oTableSearchState = [],
				sQuery = oEvent.getParameter("query");

			if (sQuery && sQuery.length > 0) {
				oTableSearchState = [new Filter("Name", FilterOperator.Contains, sQuery)];
			}

			this.getView().byId("productsTable").getBinding("items").filter(oTableSearchState, "Application");
		},

		//SORT
		onSort: function (oEvent) {
			this._bDescendingSort = !this._bDescendingSort;
			var oView = this.getView(),
				oTable = oView.byId("productsTable"),
				oBinding = oTable.getBinding("items"),
				oSorter = new Sorter("Name", this._bDescendingSort);

			oBinding.sort(oSorter);
		}
	});
});