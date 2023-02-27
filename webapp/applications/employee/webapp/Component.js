// /**
//  * eslint-disable @sap/ui5-jsdocs/no-jsdoc
//  */

// sap.ui.define([
//         "sap/ui/core/UIComponent",
//         "sap/ui/Device",
//         "VASPP/employee/model/models"
//     ],
//     function (UIComponent, Device, models) {
//         "use strict";

//         return UIComponent.extend("VASPP.employee.Component", {
//             metadata: {
//                 manifest: "json"
//             },

//             /**
//              * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
//              * @public
//              * @override
//              */
//             init: function () {
//                 // call the base component's init function
//                 UIComponent.prototype.init.apply(this, arguments);

//                 // enable routing
//                 this.getRouter().initialize();

//                 // set the device model
//                 this.setModel(models.createDeviceModel(), "device");
//             }
//         });
//     }
// );
sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/f/library",
	"sap/f/FlexibleColumnLayoutSemanticHelper"
], function (UriParameters, UIComponent, JSONModel, library, FlexibleColumnLayoutSemanticHelper) {
	"use strict";

	var LayoutType = library.LayoutType;

	var Component = UIComponent.extend("VASPP.employee.Component", {
		metadata: {
			manifest: "json"
		},

		init: function () {
			UIComponent.prototype.init.apply(this, arguments);

			var oModel = new JSONModel();
			this.setModel(oModel);

			// set products demo model on this sample
			// var oProductsModel = new JSONModel(sap.ui.require.toUrl("customerdetails.json"));
			// oProductsModel.setSizeLimit(1000);
			// this.setModel(oProductsModel, "customerdetails");


			this.getRouter().initialize();
		},

		/**
		 * Returns an instance of the semantic helper
		 * @returns {sap.f.FlexibleColumnLayoutSemanticHelper} An instance of the semantic helper
		 */
		getHelper: function () {
			var oFCL = this.getRootControl().byId("fcl"),
				oParams = UriParameters.fromQuery(location.search),
				oSettings = {
					defaultTwoColumnLayoutType: LayoutType.TwoColumnsMidExpanded,
					defaultThreeColumnLayoutType: LayoutType.ThreeColumnsMidExpanded,
					mode: oParams.get("mode"),
					maxColumnsCount: oParams.get("max")
				};

			return FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings);
		}
	});
	return Component;
});
