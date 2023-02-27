sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("vaspp.ProjectStatisticalReport.controller.View1", {
            onInit: function () {
				var sampleDatajson = new sap.ui.model.json.JSONModel("model/report.json");
				this.getView().setModel(sampleDatajson);
              
                // for charts
             //  sap.ui.core.UIComponent.getRouterFor(this).getRoute("drilldown").attachPatternMatched(this._objMatched, this);
                var that=this;
               // that.serviceCall();
                var chartIds = ["chartContainer0", "chartContainer1", "chartContainer2", "chartContainer3","chartContainer4","chartContainer5","chartContainer6","chartContainer7","chartContainer8"];
			for (var i = 0; i < chartIds.length; i++) {
				this.getView().byId(chartIds[i])._oChartTitle.attachBrowserEvent("click", function (evt) {
					that.getView().setBusy(true);
					var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
					oRouter.navTo("drilldown", {
						selectedKPI: evt.target.textContent
					});
					that.getView().setBusy(false);
				});
			}

             },
            //  serviceCall: function () {
            //     var that = this;
            //     // var service = "ehs/getProjectsCount?status=New,In Progress,Delayed";
            //     var dataModel = new sap.ui.model.json.JSONModel(service);
            //     dataModel.attachRequestCompleted(function () {
            //         if (dataModel.getData().status == "Success") {
            //             that.getView().setBusy(false);
            //             that.getView().byId("totalCalls").setModel(dataModel);
            //             that.getView().byId("totalCalls").getModel().updateBindings(true);
            //         }
            //     });
            //     // var service1 = "ehs/getProjectsCountByMonth?status=New,In Progress,Delayed";
            //     var dataModel1 = new sap.ui.model.json.JSONModel(service1);
            //     dataModel1.attachRequestCompleted(function (OData) {
            //         if (dataModel1.getData().status == "Success") {
            //             that.getView().setBusy(false);
            //             that.getView().setModel(dataModel1, "ProjectByMonthModel");
            //         }
            //     });
            //     var newAndInProgChartData = [];
            //     // var service2 = "ehs/getProjectCountByStatus?status=New,In Progress,Delayed,Approved,Rejected,Completed";
            //     var dataCountByStatus = new sap.ui.model.json.JSONModel(service2);
            //     dataCountByStatus.attachRequestCompleted(function (oData) {
            //         if (dataCountByStatus.getData().status == "Success") {
            //             that.getView().setBusy(false);
            //             that.getView().setModel(dataCountByStatus, "ProjectCountByStatus");
            //             that.getView().getModel("ProjectCountByStatus").getData().data.forEach(function (Data) {
            //                 if (Data._id === "Delayed")
            //                     that.getView().setModel(new sap.ui.model.json.JSONModel(Data), "ProjectsDelayed");
            //                 else if (Data._id === "Submitted")
            //                     that.getView().setModel(new sap.ui.model.json.JSONModel(Data), "ProjectsSubmitted");
            //                 else if (Data._id === "New" || Data._id === "In Progress") {
            //                     newAndInProgChartData.push(Data);
            //                 }
            //             });
    
            //             that.getView().byId("idVizFrame0").setModel(new sap.ui.model.json.JSONModel(JSON.parse(JSON.stringify(newAndInProgChartData))),
            //                 "NewAndInProgProjects");
            //         }
            //     });
            //     // var service3 = "ehs/getInspectionsCountByStatus?status=New,In Progress,Delayed";
            //     var dataInspectionsModel = new sap.ui.model.json.JSONModel(service3);
            //     dataInspectionsModel.attachRequestCompleted(function (oData) {
            //         if (dataInspectionsModel.getData().status == "Success") {
            //             that.getView().setBusy(false);
            //             that.getView().setModel(dataInspectionsModel, "ProjectInspectionsByStatus");
            //         }
            //     });
    
            // },
		
          
            
            onKpiLinkPress: function (evt) {
              
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var pressedLinkText = evt.getSource().getText();
            oRouter.navTo("drilldown", {
                        selectedKPI: pressedLinkText
                    }
                    );
        },
        attachPersonalizationPress:function() {
		console.log("a");	
		},
        personalizationPress:function() {
            console.log("a");	
		},
        on:function() {
            console.log("a");	
		}

        
        });
    });

    
