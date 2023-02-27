sap.ui.define(
    [
        "sap/ui/core/mvc/Controller"
    ],
    function(BaseController) {
      "use strict";
  
      return BaseController.extend("vaspp.ProjectStatisticalReport.controller.App", {
        onInit() {
          var oViewModel = new sap.ui.model.json.JSONModel({
          busy: true,
          delay: 0,
          layout: "OneColumn",
          previousLayout: "",
          actionButtonsInfo: {
            midColumn: {
              fullScreen: false
            }
                  },
                 
        });
        this.getView().setModel(oViewModel, "appView");
        }
      });
    }
  );
  