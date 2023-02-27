
/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

// sap.ui.define([
//         "sap/ui/core/UIComponent",
//         "sap/ui/Device",
//         "vaspp/ProjectStatisticalReport/model/models"
//     ],
//     function (UIComponent, Device, models) {
//         "use strict";

//         return UIComponent.extend("vaspp.ProjectStatisticalReport.Component", {
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

// sap.ui.define([
// 	"sap/base/util/UriParameters",
// 	"sap/ui/core/UIComponent",
// 	"sap/ui/model/json/JSONModel",
// 	"sap/f/library"
// ], function (UriParameters, UIComponent, JSONModel, library) {
// 	"use strict";

// 	var LayoutType = library.LayoutType;

// 	var Component = UIComponent.extend("vaspp.ProjectStatisticalReport.Component", {
// 		metadata: {
// 			manifest: "json"
// 		},

// 		init: function () {
// 			UIComponent.prototype.init.apply(this, arguments);

// 			var oModel = new JSONModel();
// 			this.setModel(oModel);

// 			// set products demo model on this sample
// 			var oProductsModel = new JSONModel(sap.ui.require.toUrl("report.json"));
// 			oProductsModel.setSizeLimit(1000);
// 			this.setModel(oProductsModel, "report");


// 			this.getRouter().initialize();
         
// 		},

// 		/**
// 		 * Returns an instance of the semantic helper
// 		 * @returns {sap.f.FlexibleColumnLayoutSemanticHelper} An instance of the semantic helper
// 		 */
		
// 	});
// 	return Component;
// });
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"vaspp/ProjectStatisticalReport/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("vaspp.ProjectStatisticalReport.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
            var mConfig = this.getMetadata().getConfig();
			var oRootPath = jQuery.sap.getModulePath("");
			// set i18n model
			var Language = navigator.language;
			var resourceBundle = "i18n/i18n.properties";
			var i18nModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl: [oRootPath, resourceBundle].join("/"),
				locale: Language
			});
			// this.setModel(i18nModel, "i18nModel");
			sap.ui.getCore().setModel(i18nModel, "i18nModel");
			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		}
	});
});
