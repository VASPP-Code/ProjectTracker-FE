sap.ui.define([

	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/m/UploadCollectionParameter"

], function (Controller, MessageBox, MessageToast, UploadCollectionParameter) {
	"use strict";

	return Controller.extend("vaspp.Vendor.controller.Detail", {
		onInit: function () {

			var oExitButton = this.getView().byId("exitFullScreenBtn"),
				oEnterButton = this.getView().byId("enterFullScreenBtn");

			this.oRouter = this.getOwnerComponent().getRouter();
			this.oModel = this.getOwnerComponent().getModel();

			this.oRouter.getRoute("detail").attachPatternMatched(this._onProductMatched, this);
			//this.oRouter.getRoute("detailDetail").attachPatternMatched(this._onProductMatched, this);
			//from here
			
			//till here
			[oExitButton, oEnterButton].forEach(function (oButton) {
				oButton.addEventDelegate({
					onAfterRendering: function () {
						if (this.bFocusFullScreenButton) {
							this.bFocusFullScreenButton = false;
							oButton.focus();
						}
					}.bind(this)
				});
			}, this);
			
		},
		// handleItemPress: function (oEvent) {
		// 	var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2),
		// 		supplierPath = oEvent.getSource().getSelectedItem().getBindingContext("mvendor").getPath(),
		// 		supplier = supplierPath.split("/").slice(-1).pop();

		// 	this.oRouter.navTo("detailDetail", {layout: oNextUIState.layout,
		// 		product: this._product, supplier: supplier});
		// },
		handleFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("detail", {layout: sNextLayout, product: this._product});
		},
		handleExitFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detail", {layout: sNextLayout, product: this._product});
		},
		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oRouter.navTo("master", {layout: sNextLayout});
		},
		//EDIT VENDOR DETAILS
		onEdit :  function () {
			var that = this;
			this.getView().getModel().setProperty("/layout", "OneColumn");

			var sNextLayout = this.getView().getModel().getProperty("/actionButtonsInfo/midColumn/closeColumn");
			if(sNextLayout == null)
			sNextLayout = "OneColumn"
			this.getOwnerComponent().getRouter().navTo("AddNewVendor", { "AddCust": "Edit", "layout": sNextLayout,"listindex":this._product });
		},
		_onProductMatched: function (oEvent) {
			this._product = oEvent.getParameter("arguments").product || this._product || "0";
			this.getView().bindElement({
				path: "/VendorCollection/" + this._product,
				model: "mvendor"
			});
			var attachmentModel = new sap.ui.model.json.JSONModel(this.getView().mElementBindingContexts.mvendor.getObject().documents);
			this.getView().setModel(attachmentModel,"attachmentModel");
			this.getView().getModel("attachmentModel").updateBindings(true);
		},
// DELETE THE VENDOR DETAILS
		onDetailPageDelete: function (evt) {
			var that=this;
			var oItems = evt.getSource().getBindingContext("mvendor").getObject().id;
			var oData = that.getView().getModel("mvendor").getData().VendorCollection;
						MessageBox.confirm("Are you sure you want to Delete  ?", {
						actions: ["Yes", "No"],
						emphasizedAction: "Yes",
						onClose: function (oEvent) { 
							if (oEvent == "Yes"){
                        
								for(var i = 0; i < oData.length; i++){				
									var products = oData[i];
									//check here				
									if(products.id=== oItems){
										that.getView().getModel("mvendor").getData().VendorCollection.splice(i,1)
									}
								}				
								that.getView().getModel("mvendor").updateBindings(true);
								MessageBox.success("Vendor details has been deleted");	
								//NAVIGATE TO MASTER			
                                var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                                oRouter.navTo("master");				
							}
						}
					  }	
		    	);		
		},
		//Attachment
		onChange: function (oEvent) {
			var that=this;
			var oUploadCollection = oEvent.getSource();
			var file = oEvent.getParameter("item").getFileObject();
			that.fileName = oEvent.getParameter("item").getFileName();
			var reader = new FileReader();
			reader.onload = function (e) {
				that.getView().mElementBindingContexts.mvendor.getObject().documents.push({
					"FileName": that.fileName,
					"FileContent": e.currentTarget.result
				});

			};
			reader.readAsDataURL(file);
		},


		onFileDeleted: function (evt) {
			// var that=this;
			// that.id = evt.getParameter("arguments").id;
			// var vendorModel = that.getOwnerComponent().getModel("mvendor");
			// var vendorData = vendorModel.getData();
			// for (var c=0; c<vendorData.length; c++){
			// 	if(vendorData[c].id === that.id){
			// 		that.path = c;
			// 		break;
			// 	}
			// }
			
			// this.getView().getModel("appView").oData.RequestIdSelected = this.path;
			// var oContext = new Context(this.getOwnerComponent().getModel(), "/" + that.path);
			// // that.getView().setModel(new sap.ui.model.json.JSONModel(oContext.getObject()));
			// this.getView().setBindingContext(oContext);
			// this.getOwnerComponent().getModel("mvendor").getData()[this.path].documents;
			var that=this;
			var oItems = evt.getSource().getBindingContext("mvendor").getObject().documents;
			var oData = that.getView().getModel("mvendor").getData().VendorCollection;
			for(var i = 0; i < oData.length; i++){				
				var products = oData[i];
				//check here				
				if(products.documents === oItems){
					//that.getView().getModel("mvendor").getData().VendorCollection.splice(i,1)
					//evt.getSource().getBindingContext("mvendor").getObject().documents.slice();
					that.getView().getBindingContext("mvendor").getObject().documents.splice()
					//that.getView().getModel("mvendor").updateBindings(true);
				}
			}				
			that.getView().getModel("mvendor").updateBindings(true);
			// MessageToast.show("Event fileDeleted triggered");
			 
		},

		onFileDeleted: function (evt) {
			var that = this;
			var oModel = this.getView().byId("UploadCollection").getModel("mvendor");
			var index = evt.getSource().getBindingContext().getPath().split("/")[2];
			MessageBox.confirm(
				that.oBundle.getText("Areyousureyouwanttodeletethefile?"), {
					onClose: function (oAction) {
						if (oAction === "OK") {
							that.getView().setBusy(true);
							oModel.getData().attachments.splice(index, 1);
							// $.post("/ehs/saveAttachments", {
							// 	attachments: oModel.getData().attachments,
							// 	assmnt_id: that.assessmentId
							// }, function (data) {
							// 	that.getView().setBusy(false);
							// 	if (data == "Ok") {
							// 		oModel.updateBindings(true);
							// 		MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("savedSuccessfully"));
							// 	} else {
							// 		MessageToast.show(sap.ui.getCore().getModel("i18nModel").getProperty("errorSaving"));
							// 	}
							// });
						}
					}
				});
		},

		onFilenameLengthExceed: function (oEvent) {
			MessageToast.show("Event filenameLengthExceed triggered");
		},

		onFileSizeExceed: function (oEvent) {
			MessageToast.show("Event fileSizeExceed triggered");
		},

		onTypeMissmatch: function (oEvent) {
			MessageToast.show("Event typeMissmatch triggered");
		},

		onStartUpload: function (oEvent) {
			var oUploadCollection = this.byId("UploadCollection");
			var oTextArea = this.byId("TextArea");
			var cFiles = oUploadCollection.getItems().length;
			var uploadInfo = cFiles + " file(s)";

			if (cFiles > 0) {
				oUploadCollection.upload();

				if (oTextArea.getValue().length === 0) {
					uploadInfo = uploadInfo + " without notes";
				} else {
					uploadInfo = uploadInfo + " with notes";
				}

				MessageToast.show("Method Upload is called (" + uploadInfo + ")");
				MessageBox.information("Uploaded " + uploadInfo);
				oTextArea.setValue("");
			}
		},

		onBeforeUploadStarts: function (oEvent) {
			// Header Slug
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
			setTimeout(function () {
				MessageToast.show("Event beforeUploadStarts triggered");
			}, 4000);
		},

		onUploadComplete: function (oEvent) {
			var sUploadedFileName = oEvent.getParameter("files")[0].fileName;
			setTimeout(function () {
				var oUploadCollection = this.byId("UploadCollection");

				for (var i = 0; i < oUploadCollection.getItems().length; i++) {
					if (oUploadCollection.getItems()[i].getFileName() === sUploadedFileName) {
						oUploadCollection.removeItem(oUploadCollection.getItems()[i]);
						break;
					}
				}

				// delay the success message in order to see other messages before
				MessageToast.show("Event uploadComplete triggered");
			}.bind(this), 8000);
		},

		onSelectChange: function (oEvent) {
			var oUploadCollection = this.byId("UploadCollection");
			oUploadCollection.setShowSeparators(oEvent.getParameters().selectedItem.getProperty("key"));
		}
	});
});