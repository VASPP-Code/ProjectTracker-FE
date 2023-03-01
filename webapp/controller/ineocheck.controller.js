sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"VASPP/AuRiSystem/util/formatter",
	"VASPP/AuRiSystem/util/utils",
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer"
], function (Controller, MessageToast, MessageBox, Fragment, formatter, utils, Component, ComponentContainer) {
	"use strict";

	return Controller.extend("VASPP.AuRiSystem.controller.App", {
		formatter: formatter,

		onInit: function () {
			var that = this;

			// sap.ui.core.UIComponent.getRouterFor(that).getRoute("RouteApp").attachPatternMatched(function () {}, that);

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
				launchpadRoot: this
			});
			that.attachments = [];
			that.getView().setModel(oViewModel, "appView");
			var i18nModel = that.getOwnerComponent().getModel("i18n")
			that.oResourceBundle = i18nModel.getResourceBundle();
			this.getOwnerComponent().setModel(i18nModel, "i18nModel");
			window.location.hash = ""; // For preventing it from self re-rendering on browser refresh.
		},

		onAfterRendering: function () {
			var that = this,
				userData = JSON.parse(window.localStorage.getItem("loggedOnUserData"));
			if (!userData) {
				this.openLoginFragment();
			} else {
				this.getView().removeStyleClass("coverImage");
				this.byId("app").setVisible(true);
				this.getView().setBusy(true);

				utils.runService("/IMS", "getPagePermissions", {}, "get", that.oResourceBundle, function (response) {
					that.getView().setBusy(false);
					if (response.status === "success") {
						// Updating the user permissions and the related local storage data i.e. loggedOnUserData
						userData.pagepermission = response.data;

						var loggedOnUserModel = new sap.ui.model.json.JSONModel(userData);
						that.getOwnerComponent().setModel(loggedOnUserModel, "loggedOnUserModel");
						window.localStorage.setItem("loggedOnUserData", JSON.stringify(userData));
						that.loadLaunchpadMenu();
						if (that.userDetailsFragment) {
							that.userDetailsFragment.setModel(loggedOnUserModel);
						}
					} else if (response.message === "invalid session") {
						MessageBox.information(that.oResourceBundle.getText("sessionExpiredErrorMsg"), {
							title: that.oResourceBundle.getText("sessionExpiredMsgBoxTitle"),
							actions: [MessageBox.Action.OK, MessageBox.Action.CLOSE],
							emphasizedAction: MessageBox.Action.OK,
							initialFocus: MessageBox.Action.OK,
							onClose: function (oAction) {
								if (oAction === "OK") {
									that.performLogout();
								} else {
									// Providing the user profile data
									var userDataTrimmed = {};
									userDataTrimmed.firstname = userData.firstname;
									userDataTrimmed.lastname = userData.lastname;
									userDataTrimmed.intro = userData.intro;
									userDataTrimmed.user_emailid = userData.user_emailid;
									userDataTrimmed.role = userData.role;
									userDataTrimmed.organisation = userData.organisation;
									userDataTrimmed = JSON.parse(JSON.stringify(userDataTrimmed));
									var userDataTrimmedModel = new sap.ui.model.json.JSONModel(userDataTrimmed);
									that.getOwnerComponent().setModel(userDataTrimmedModel, "loggedOnUserModel");
								}
							}
						});
					} else {
						MessageBox.error(response.message + "\n\n" + that.oResourceBundle.getText("getPermissionsFailureMsg") + "\n\n" + that.oResourceBundle
							.getText("reportErrorToAdmin"));
					}
				});
			}
		},

		onExit: function () {
			if (this.userDetailsFragment) {
				this.userDetailsFragment.destroy();
			}
			if (this.LoginFragment) {
				this.LoginFragment.destroy();
			}
		},

		openLoginFragment: function () {
			if (!this.LoginFragment) {
				this.LoginFragment = new sap.ui.xmlfragment("VASPP.AuRiSystem.fragment.loginFragment", this);
				this.LoginFragment.setModel(this.getOwnerComponent().getModel("i18n"), "i18n");
				this.LoginFragment.open();
			} else {
				this.LoginFragment.getContent()[0].getItems()[2].getItems()[1].setValue();
				this.LoginFragment.getContent()[0].getItems()[2].getItems()[3].setValue();
				this.LoginFragment.open();
			}
			this.LoginFragment.getContent()[0].getItems()[0].setVisible(false);
		},
		OnUserSettingPress: function (evt) {
			var launchView = this;
			var userData = JSON.parse(window.localStorage.getItem("loggedOnUserData"));
			if (!launchView.userFragment) {
				launchView.userFragment = new sap.ui.xmlfragment("VASPP.AuRiSystem.fragment.user", this);
				launchView.userFragment.setModel(this.getOwnerComponent().getModel("i18n"), "i18n");
			}
			launchView.userFragment.getContent()[0].getItems()[0].getItems()[1].setValue(userData.user_emailid);
			launchView.userFragment.getContent()[0].getItems()[0].getItems()[3].setValue(userData.password);
			if (userData.roleKey == "manager") {
				launchView.userFragment.getContent()[0].getItems()[0].getItems()[4].setVisible(false);
				launchView.userFragment.getContent()[0].getItems()[0].getItems()[5].setVisible(false);
				launchView.userFragment.setContentHeight("16rem");
			} else {
				launchView.userFragment.getContent()[0].getItems()[0].getItems()[4].setVisible(true);
				launchView.userFragment.getContent()[0].getItems()[0].getItems()[5].setVisible(true);
				launchView.userFragment.setContentHeight("18rem");
				// 	var attachmentsModel = new sap.ui.model.json.JSONModel([]);
				// launchView.userFragment.getContent()[0].getItems()[0].getItems()[4].setNoDataDescription(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("nofilesDescription"));
				// launchView.userFragment.getContent()[0].getItems()[0].getItems()[4].setModel(attachmentsModel, "Attachments");
			}

			launchView.userDetailsFragment.close();
			launchView.userFragment.open();
		},
		handleFileUpload: function (evt) {
			var that = this;
			// var dataObj = that.getView().getModel().getData();
			var file = evt.getParameters().files[0];

			//var attachmentsModel = that.userFragment.getContent()[0].getItems()[0].getItems()[4].getModel("Attachments");
			var reader = new FileReader();
			reader.onload = function () {
				var fileContent = reader.result; //reader.result.substr(reader.result.indexOf(",") + 1, reader.result.length);
				var fileObj = {

					"FileData": fileContent,
					"FileName": file.name

				};
				that.attachments.push(fileObj);
				//attachmentsModel.getData().push(fileObj);
				//attachmentsModel.updateBindings(true);

			};
			reader.readAsDataURL(file);
			// reader.readAsBinaryString(file);

		},
		CancelPasswordChange: function (evt) {
			var that = this;
			that.attachments = [];
			that.userFragment.close();
		},
		ChangePassword: function (evt) {
			var that = this,
				email = this.userFragment.getContent()[0].getItems()[0].getItems()[1].getValue(),
				password = this.userFragment.getContent()[0].getItems()[0].getItems()[3].getValue();
			if (that.attachments.length > 0) {
				var stamp = that.attachments[0].FileData;
			} else {
				var stamp = "";
			}
			if (email && password) {
				this.userFragment.setBusy(true);
				var inputData = {
					"_id": JSON.parse(window.localStorage.getItem("loggedOnUserData"))._id,
					"user_email": email,
					"password": password,
					"Stamp": stamp
				};
				console.log(inputData);
				//	that.userFragment.close();
				utils.runService("/IMS", "editProfile", inputData, "post", that.oResourceBundle, function (response) {
					that.userFragment.setBusy(false);
					if (response.status === "success") {
						that.userFragment.close();
						that.userFragment.setBusy(false);
						that.performLogout();
					} else if (response.message.includes("Invalid Credentials")) {
						errMsg.setVisible(true);
					} else {
						MessageBox.error(response.message + "\n\n" + that.oResourceBundle.getText("loginFailureErrorMsg") + "\n\n" + that.oResourceBundle
							.getText("reportErrorToAdmin"));
					}
				});
			} else {
				var errorMsg,
					errorsCount = 0;
				if (!email) {
					errorMsg = this.oResourceBundle.getText("enterEmailPrompt");
					this.userFragment.getContent()[0].getItems()[0].getItems()[1].setValueStateText(errorMsg).setValueState("Error");
					++errorsCount;
				}
				if (!password) {
					errorMsg = this.oResourceBundle.getText("enterPasswordPrompt");
					this.userFragment.getContent()[0].getItems()[0].getItems()[3].setValueStateText(errorMsg).setValueState("Error");
					++errorsCount;
				}
				if (errorsCount > 0) {
					if (errorsCount === 1) {
						MessageToast.show(errorMsg);
					} else {
						MessageToast.show(this.oResourceBundle.getText("enterEmailAndPasswordPrompt"));
					}
				}
			}
		},

		performLogin: function () {
			var that = this,
				errMsg = this.LoginFragment.getContent()[0].getItems()[0],
				email = this.LoginFragment.getContent()[0].getItems()[2].getItems()[1].getValue(),
				password = this.LoginFragment.getContent()[0].getItems()[2].getItems()[3].getValue(),
				keepRemembered = this.LoginFragment.getContent()[0].getItems()[2].getItems()[4].getItems()[0].getSelected();

			if (email && password) {
				this.LoginFragment.setBusy(true);
				var inputData = {
					"user_email": email,
					"password": password
				};
				utils.runService("/IMS", "loginuser", inputData, "post", that.oResourceBundle, function (response) {
					that.LoginFragment.setBusy(false);
					if (response.status === "success") {
						that.getView().removeStyleClass("coverImage");
						that.LoginFragment.getContent()[0].getItems()[2].getItems()[1].setValue("");
						that.LoginFragment.getContent()[0].getItems()[2].getItems()[3].setValue("");
						that.LoginFragment.close();
						that.byId("app").setVisible(true);
						that.getView().setBusy(true);

						var userData = response.data[0];
						userData.profilePhotoInfo = null;
						userData.roles = userData.role; //role is coming as an array from backend

						if (userData.role !== "Anonymous User") {
							if (userData.roles.type) {
								userData.role = userData.roles.type;
							} else {
								userData.role = userData.roles[0].type;
							}
						} else {
							userData.pagepermission = [{
								"applicationname": "My Surveys",
								"applicationid": "APP100033",
								"createid": true,
								"readid": true,
								"updateid": true,
								"deleteid": true,
								"shareid": false
							}];
							userData.user_emailid = email;
						}

						// Detecting the role key (role key tells the actual role to programmers).
						// A role can be in English, German etc. but the role key is always in english with lowercase letters.
						// Role key is served by the launchpad application and it is used for programming purpose in different applications.
						if (userData.role.toLowerCase().includes("manager") || userData.role.toLocaleLowerCase().includes(
								"leiter") || userData.role.toLocaleLowerCase().includes(
								"geschäftsführer") || userData.role.toLocaleLowerCase().includes("direktor")) {
							userData.roleKey = "manager";
						} else if (userData.role.toLowerCase().includes("auditor") || userData.role.toLocaleLowerCase().includes(
								"prüfer") || userData.role.toLocaleLowerCase().includes("prüfender")) {
							userData.roleKey = "auditor";
						} else {
							userData.roleKey = userData.role.toLocaleLowerCase();
						}

						userData.lastLogonTimestamp = new Date().toISOString(); // Can be used for session management
						var loggedOnUserModel = new sap.ui.model.json.JSONModel(userData);
						that.getOwnerComponent().setModel(loggedOnUserModel, "loggedOnUserModel");
						if (keepRemembered) {
							delete userData.Stamp;
							window.localStorage.setItem("loggedOnUserData", JSON.stringify(userData));
						} else {
							window.localStorage.setItem("loggedOnUserData", null);
						}
						that.loadLaunchpadMenu();
						if (that.userDetailsFragment) {
							that.userDetailsFragment.setModel(loggedOnUserModel);
						}
						that.getView().setBusy(false);
					} else if (response.message.includes("Invalid Credentials")) {
						errMsg.setVisible(true);
					} else {
						MessageBox.error(response.message + "\n\n" + that.oResourceBundle.getText("loginFailureErrorMsg") + "\n\n" + that.oResourceBundle
							.getText("reportErrorToAdmin"));
					}
				});
			} else {
				var errorMsg,
					errorsCount = 0;
				if (!email) {
					errorMsg = this.oResourceBundle.getText("enterEmailPrompt");
					this.LoginFragment.getContent()[0].getItems()[2].getItems()[1].setValueStateText(errorMsg).setValueState("Error");
					++errorsCount;
				}
				if (!password) {
					errorMsg = this.oResourceBundle.getText("enterPasswordPrompt");
					this.LoginFragment.getContent()[0].getItems()[2].getItems()[3].setValueStateText(errorMsg).setValueState("Error");
					++errorsCount;
				}
				if (errorsCount > 0) {
					if (errorsCount === 1) {
						MessageToast.show(errorMsg);
					} else {
						MessageToast.show(this.oResourceBundle.getText("enterEmailAndPasswordPrompt"));
					}
				}
			}
		},
		getOTP: function () {
			var that = this;
			this.LoginFragment.close();
			if (!this.EnterOTP) {
				this.EnterOTP = new sap.ui.xmlfragment("VASPP.AuRiSystem.fragment.EnterOTP", this);
				this.EnterOTP.setModel(this.getOwnerComponent().getModel("i18n"), "i18n");

			}
			this.EnterOTP.open();
sap.ui.getCore().byId("timer").setVisible(false);
	sap.ui.getCore().byId("onSend").setVisible(true);
	sap.ui.getCore().byId("onSub").setVisible(true);
		},
		onSend: function (evt) {
			var that =this;
			var email = this.EnterOTP.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[2].getValue();
			var TimerText = that.oResourceBundle.getText("OTPTimer");
			if (email) {
				var currentLocale = sap.ui.getCore().getConfiguration().getLanguage();
				sap.ui.getCore().byId("timer").setVisible(true);
				sap.ui.getCore().byId("onSub").setVisible(true);
				sap.ui.getCore().byId("onSend").setVisible(false);
				var time = sap.ui.getCore().byId("timer");
				var fiveMinutesLater = new Date();
				var scs = fiveMinutesLater.setMinutes(fiveMinutesLater.getMinutes() + 5);
				var countdowntime = scs;
				var x = setInterval(function () {
					var now = new Date().getTime();
					var cTime = countdowntime - now;
					var minutes = Math.floor((cTime % (1000 * 60 * 60)) / (1000 * 60));
					var second = Math.floor((cTime % (1000 * 60)) / 1000);
					var ExpText = that.oResourceBundle.getText("ExpText");
					var Minutes = that.oResourceBundle.getText("Minutes")
					time.setText(ExpText +" " + minutes + ":" + second +" "  +Minutes);

					if (cTime < 0) {
						clearInterval(x);
						time.setText(TimerText);
						sap.ui.getCore().byId("onSub").setVisible(false);
						sap.ui.getCore().byId("timer").setVisible(false);
						sap.ui.getCore().byId("onSend").setVisible(true);
						sap.ui.getCore().byId("onSend").setText("Resend OTP");
					}
				});
			//	sap.m.MessageBox.information("An OTP is send to your registred Mail-Id please check.")

				var inputData = {
					"emailid": email,
					"lang": currentLocale

				};
				console.log(inputData);
				utils.runService("/IMS", "sendOtp_FP", inputData, "post",that.oResourceBundle, function (response) {
					//	$.post("/IMS", "sendOtp_FP", inputData, function (response) {
					if (response.status === "success") {
						MessageBox.information(that.oResourceBundle.getText("OTPRequestSuccessMsg", [email]), {
						//	onClose: function () {
								//that.LoginFragment.getContent()[0].getItems()[2].getItems()[3].setValue("").setValueState("None");
								//	that.LoginFragment.getContent()[0].getItems()[0].setVisible(false);
					//		}
						});
					} else {
						MessageBox.error(response.message + "\n\n" + that.oResourceBundle.getText("OTPRequestFailureErrorMsg") + "\n\n" + that.oResourceBundle
							.getText("reportErrorToAdmin"));
					}
				});
			}else {
					var errorMsg = this.oResourceBundle.getText("enterEmailPrompt");
					this.EnterOTP.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[2].setValueStateText(errorMsg).setValueState("Error");
				
				}

		},
		onSubmit: function () {
			var that = this,

				email = this.EnterOTP.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[2].getValue(),
				OTP = this.EnterOTP.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[4].getValue();

			if (email && OTP) {
				this.EnterOTP.setBusy(true);
				var inputData = {
					"emailid": email,
					"otp": OTP
				};
				utils.runService("/IMS", "loginuser_with_otp", inputData, "post", that.oResourceBundle, function (response) {
					that.EnterOTP.setBusy(false);
					var errMsg = that.EnterOTP.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0];
					if (response.status === "success") {

						that.EnterOTP.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[2].setValue("");
						that.EnterOTP.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[4].setValue("");
						that.EnterOTP.close();
						that.byId("app").setVisible(true);
						that.getView().setBusy(true);

						var userData = response.data[0];
						userData.profilePhotoInfo = null;
						userData.roles = userData.role; //role is coming as an array from backend

						if (userData.role !== "Anonymous User") {
							if (userData.roles.type) {
								userData.role = userData.roles.type;
							} else {
								userData.role = userData.roles[0].type;
							}
						} else {
							userData.pagepermission = [{
								"applicationname": "My Surveys",
								"applicationid": "APP100033",
								"createid": true,
								"readid": true,
								"updateid": true,
								"deleteid": true,
								"shareid": false
							}];
							userData.user_emailid = email;
						}

						// Detecting the role key (role key tells the actual role to programmers).
						// A role can be in English, German etc. but the role key is always in english with lowercase letters.
						// Role key is served by the launchpad application and it is used for programming purpose in different applications.
						if (userData.role.toLowerCase().includes("manager") || userData.role.toLocaleLowerCase().includes(
								"leiter") || userData.role.toLocaleLowerCase().includes(
								"geschäftsführer") || userData.role.toLocaleLowerCase().includes("direktor")) {
							userData.roleKey = "manager";
						} else if (userData.role.toLowerCase().includes("auditor") || userData.role.toLocaleLowerCase().includes(
								"prüfer") || userData.role.toLocaleLowerCase().includes("prüfender")) {
							userData.roleKey = "auditor";
						} else {
							userData.roleKey = userData.role.toLocaleLowerCase();
						}

						userData.lastLogonTimestamp = new Date().toISOString(); // Can be used for session management
						var loggedOnUserModel = new sap.ui.model.json.JSONModel(userData);
						var keepRemembered = true;
						that.getOwnerComponent().setModel(loggedOnUserModel, "loggedOnUserModel");
						if (keepRemembered) {
							window.localStorage.setItem("loggedOnUserData", JSON.stringify(userData));
						} else {
							window.localStorage.setItem("loggedOnUserData", null);
						}
						that.loadLaunchpadMenu();
						if (that.userDetailsFragment) {
							that.userDetailsFragment.setModel(loggedOnUserModel);
						}
						that.getView().setBusy(false);
					} else if (response.message.includes("Invalid Credentials")) {
						errMsg.setVisible(true);
					} else {
						MessageBox.error(response.message + "\n\n" + that.oResourceBundle.getText("loginFailureErrorMsg") + "\n\n" + that.oResourceBundle.getText("reportErrorToAdmin"));
					}
				});
			} else {
				var errorMsg,
					errorsCount = 0;
				if (!email) {
					errorMsg = this.oResourceBundle.getText("enterEmailPrompt");
					this.EnterOTP.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[2].setValueStateText(errorMsg).setValueState(
						"Error");
					++errorsCount;
				}
				if (!OTP) {
					errorMsg = this.oResourceBundle.getText("enterOTPPrompt");
					that.EnterOTP.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[4].setValueStateText(errorMsg).setValueState(
						"Error");
					++errorsCount;
				}
				if (errorsCount > 0) {
					if (errorsCount === 1) {
						MessageToast.show(errorMsg);
					} else {
						MessageToast.show(this.oResourceBundle.getText("enterEmailAndPasswordPrompt"));
					}
				}
			}
		},
		getOTP1: function () {
			var that = this,
				email = this.LoginFragment.getContent()[0].getItems()[2].getItems()[1].getValue();

			if (email) {
				this.LoginFragment.setBusy(true);
				var currentLocale = sap.ui.getCore().getConfiguration().getLanguage();
				// if (currentLocale.includes("en") || currentLocale.includes("EN")) {
				// 	currentLocale = "en";
				// } else if (currentLocale.includes("de") || currentLocale.includes("DE")) {
				// 	currentLocale = "de";
				// }

				var inputData = {
					"surveyUsers": email,
					"lang": currentLocale
				};
				utils.runService("/IMS", "sendOTP", inputData, "post", that.oResourceBundle, function (response) {
					that.LoginFragment.setBusy(false);
					if (response.status === "success") {
						MessageBox.information(that.oResourceBundle.getText("OTPRequestSuccessMsg", [email]), {
							onClose: function () {
								that.LoginFragment.getContent()[0].getItems()[2].getItems()[3].setValue("").setValueState("None");
								that.LoginFragment.getContent()[0].getItems()[0].setVisible(false);
							}
						});
					} else {
						MessageBox.error(response.message + "\n\n" + that.oResourceBundle.getText("OTPRequestFailureErrorMsg") + "\n\n" + that.oResourceBundle
							.getText("reportErrorToAdmin"));
					}
				});
			} else {
				var errorMsg = this.oResourceBundle.getText("enterEmailPrompt");
				MessageToast.show(errorMsg);
				this.LoginFragment.getContent()[0].getItems()[2].getItems()[1].setValueStateText(errorMsg).setValueState("Error");
			}
		},

		loadLaunchpadMenu: function () {
			var that = this;
			window.onload = function () {
				$(document).ready(function () {
					window.history.pushState(null, "", window.location.href);
					window.onpopstate = function () {
						window.history.pushState(null, "", window.location.href);
					};
				});
			};

			var sideBarMenuModel = new sap.ui.model.json.JSONModel();
			sideBarMenuModel.loadData(jQuery.sap.getModulePath("VASPP.AuRiSystem.model", "/sideBarMenu.json"));
			sideBarMenuModel.attachRequestCompleted(function () {
				that.byId("sideBarMenu").setModel(sideBarMenuModel);
				that.byId("sideBarMenu").setSelectedItem(that.byId("sideBarMenu").getItem().getItems()[0]);
				that.setPermissions();
			});
		},

		setPermissions: function () {
			var sideBarMenuData = this.byId("sideBarMenu").getModel().getData().navigation,
				userData = this.getOwnerComponent().getModel("loggedOnUserModel").getData(),
				permissionData = userData.pagepermission,
				userRole = userData.role,
				permittedAppName;
			for (var appIndex = 0; appIndex < permissionData.length; appIndex++) {
				permittedAppName = permissionData[appIndex].applicationname.split(" ")[0] + permissionData[appIndex].applicationname.split(" ")[1];
				// Manipulating permissions for main menu items
				for (var itemIndex = 0; itemIndex < sideBarMenuData.length; itemIndex++) {
					// if (sideBarMenuData[itemIndex].id === permissionData[appIndex].applicationid) {
					if (sideBarMenuData[itemIndex].id === permissionData[appIndex].applicationid || sideBarMenuData[itemIndex].title ===
						permittedAppName) {
						sideBarMenuData[itemIndex].permissions.create = permissionData[appIndex].createid === "true" || permissionData[appIndex].createid ===
							true;
						sideBarMenuData[itemIndex].permissions.read = permissionData[appIndex].readid === "true" || permissionData[appIndex].readid ===
							true;
						sideBarMenuData[itemIndex].permissions.update = permissionData[appIndex].updateid === "true" || permissionData[appIndex].updateid ===
							true;
						sideBarMenuData[itemIndex].permissions.delete = permissionData[appIndex].deleteid === "true" || permissionData[appIndex].deleteid ===
							true;
					}

					// Manipulating permissions for sub menu items
					if (sideBarMenuData[itemIndex].items.length) {
						for (var subItemIndex = 0; subItemIndex < sideBarMenuData[itemIndex].items.length; subItemIndex++) {
							// if (sideBarMenuData[itemIndex].items[subItemIndex].id === permissionData[appIndex].applicationid) {
							if (sideBarMenuData[itemIndex].items[subItemIndex].id === permissionData[appIndex].applicationid || sideBarMenuData[itemIndex].items[
									subItemIndex].title === permittedAppName) {
								sideBarMenuData[itemIndex].items[subItemIndex].permissions.create = permissionData[appIndex].createid === "true" ||
									permissionData[appIndex].createid === true;
								sideBarMenuData[itemIndex].items[subItemIndex].permissions.read = permissionData[appIndex].readid === "true" || permissionData[
									appIndex].readid === true;
								sideBarMenuData[itemIndex].items[subItemIndex].permissions.update = permissionData[appIndex].updateid === "true" ||
									permissionData[appIndex].updateid === true;
								sideBarMenuData[itemIndex].items[subItemIndex].permissions.delete = permissionData[appIndex].deleteid === "true" ||
									permissionData[appIndex].deleteid === true;
							}
						}
					}
				}
			}

			// If the super admin has logged on then giving all the permissions for the Users Management app
			if (userRole.toLowerCase() === "superadmin") {
				for (var itemIndex = 0; itemIndex < sideBarMenuData.length; itemIndex++) {
					if (sideBarMenuData[itemIndex].key === "UsersManagement") { // Specially setting permissions for the Users Management app
						sideBarMenuData[itemIndex].permissions.create = true;
						sideBarMenuData[itemIndex].permissions.read = true;
						sideBarMenuData[itemIndex].permissions.update = true;
						sideBarMenuData[itemIndex].permissions.delete = true;
						break;
					}
				}
			} else if (permissionData.length === 0) { // If no application is given access to the user yet (except super admin)
				MessageBox.information(this.oResourceBundle.getText("notAppPermitted"));
			}

			this.byId("sideBarMenu").getModel().updateBindings(true);
		},

		performLogout: function () {
			var that = this;
			this.getView().setBusy(true);
			this.getView().addStyleClass("coverImage");
			this.byId("app").setVisible(false);
			this.goToHomePage();
			window.localStorage.setItem("loggedOnUserData", null);
			this.getOwnerComponent().setModel(null, "loggedOnUserModel");
			this.getOwnerComponent().setModel(null, "permissions");
			this.byId("sideBarMenu").setModel(null);
			this.getView().setBusy(false);
			setTimeout(function () {
				that.openLoginFragment();
			}, 100);
			// Prevent the user from going back
			$(document).ready(function () {
				window.history.pushState(null, "", window.location.href);
				window.onpopstate = function () {
					window.history.pushState(null, "", window.location.href);
				};
			});
		},

		hideErrMsgs: function (event) {
			this.LoginFragment.getContent()[0].getItems()[0].setVisible(false);
			if (event.getSource().getType() === "Email")
				this.LoginFragment.getContent()[0].getItems()[2].getItems()[1].setValueState("None");
			else
				this.LoginFragment.getContent()[0].getItems()[2].getItems()[3].setValueState("None");
		},
		hideErrMsgsShow: function (event) {
			//this.LoginFragment.getContent()[0].getItems()[0].setVisible(false);
			var re =
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			var email = event.getSource().getValue();
			if (re.test(String(email).toLowerCase()))
				this.EnterOTP.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[2].setValueState("None");
			else
				this.EnterOTP.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[2].setValueState("Error");
		},
		launchApp: function (oEvent) {
			window.location.hash = "";
			var that = this,
				selectedItem = oEvent.getSource(),
				subItemsCount = selectedItem.getItems().length,
				selectedItemObj = selectedItem.getBindingContext().getObject(),
				componentName = selectedItemObj.componentName,
				selectedItemKey = selectedItemObj.key;
			if (selectedItemObj.permissions.read) {
				if (selectedItemKey !== "Home") {
					if (!componentName && subItemsCount > 0) //If an expandable list item is selected which has no target app then toggle exapnd/collapse
						selectedItem.setExpanded(!selectedItem.getExpanded());
					else if (!componentName && subItemsCount === 0) {
						console.error("The menu item \"" + selectedItem.getText() + "\" has no target. Component name is missing.");
						if (!that.byId("app").getSideExpanded()) {
							that.byId("app").setSideExpanded(true);
							that.byId("sideNavigationToggleButton").setTooltip(that.oResourceBundle.getText("collapseMenu"));
						}
						return;
					} else {
						//that.glowControl("logo", true);
						var permissionsModel = new sap.ui.model.json.JSONModel(selectedItemObj.permissions);
						permissionsModel.setDefaultBindingMode("OneWay");
						that.getOwnerComponent().setModel(permissionsModel, "permissions"); //This model is accessed by the apps loaded in the launchpad

						if (that.byId("app").getSideExpanded()) {
							that.byId("app").setSideExpanded(false);
							that.byId("sideNavigationToggleButton").setTooltip(that.oResourceBundle.getText("expandMenu"));
						}

						var appComponentContainer;
						if (selectedItemObj.appUrl) {
							// var appUrl = window.location.origin + "\/" + selectedItemObj.projectName;
							appComponentContainer = new ComponentContainer({
								url: selectedItemObj.appUrl,
								height: "100%",
								name: componentName,
								propagateModel: true
							});
						} else {
							appComponentContainer = new ComponentContainer({
								height: "100%",
								name: componentName,
								propagateModel: true
							});
						}
						var aMainContents = that.byId("app").getMainContents();
						if (aMainContents.length === 2)
							that.byId("app").removeMainContent(1);
						aMainContents[0].setVisible(false);
						that.byId("app").addMainContent(appComponentContainer);

						appComponentContainer.attachComponentCreated(function () {
							// MessageToast.show("Component Created!");
							//that.glowControl("logo", false);
						});
						appComponentContainer.attachComponentFailed(function () {
							//	that.glowControl("logo", false);
							// MessageToast.show("Failed to load the application");
							console.error("Failed to load the application from the component " + componentName);
						});
					}
				} else {
					this.goToHomePage();
				}
			} else {
				MessageBox.information(this.oResourceBundle.getText("readingAppContentNotPermitted"));
				if (!that.byId("app").getSideExpanded()) {
					that.byId("app").setSideExpanded(true);
					that.byId("sideNavigationToggleButton").setTooltip(that.oResourceBundle.getText("collapseMenu"));
				}
			}
		},

		/*setWaitBlinker: function (bValue, sBlinkerControlId) {
			if (bValue == true) {
				var that = this;

				function startBlinker() {
					that.byId(sBlinkerControlId).addStyleClass("glow");
					setTimeout(function () {
						that.byId(sBlinkerControlId).removeStyleClass("glow");
					}, 800);
				}
				startBlinker();
				this.blinkerTimerId = setInterval(startBlinker, 1200);
			} else {
				clearInterval(this.blinkerTimerId); // Stopping the interval timer
			}
		},*/

		// glowControl: function (sBlinkerControlId, bGlow) {
		// 	if (bGlow) {
		// 		this.byId(sBlinkerControlId).addStyleClass("glow");
		// 	} else {
		// 		this.byId(sBlinkerControlId).removeStyleClass("glow");
		// 	}
		// },

		goToHomePage: function () {
			if (!this.byId("app").getSideExpanded()) {
				this.byId("app").setSideExpanded(true);
				this.byId("sideNavigationToggleButton").setTooltip(this.oResourceBundle.getText("collapseMenu"));
			}
			if (this.byId("sideBarMenu").getItem().getItems().length) {
				this.byId("sideBarMenu").setSelectedItem(this.byId("sideBarMenu").getItem().getItems()[0]);
			}
			window.location.hash = "";
			var aMainContents = this.byId("app").getMainContents();
			if (aMainContents.length === 2)
				this.byId("app").removeMainContent(1);
			aMainContents[0].setVisible(true);
		},

		toggleSideMenuExpandCollapse: function () {
			var bSideExpanded = this.byId("app").getSideExpanded();
			//this._setToggleButtonTooltip(bSideExpanded);
			this.byId("app").setSideExpanded(!bSideExpanded);
			bSideExpanded ? this.byId("sideNavigationToggleButton").setTooltip(this.oResourceBundle.getText("expandMenu")) : this.byId(
				"sideNavigationToggleButton").setTooltip(this.oResourceBundle.getText("collapseMenu"));
		},

		showUserDetails: function (oEvent) {
			var userPhotoIcon = oEvent.getSource(),
				that = this;
			if (!this.userDetailsFragment) {
				this.userDetailsFragment = new sap.ui.xmlfragment("VASPP.AuRiSystem.fragment.userDetailsFragment", this);
				this.userDetailsFragment.setModel(this.getOwnerComponent().getModel("i18n"), "i18n");
				this.userDetailsFragment.setModel(this.getOwnerComponent().getModel("loggedOnUserModel"));
				that.userDetailsFragment.openBy(userPhotoIcon);
			} else {
				this.userDetailsFragment.openBy(userPhotoIcon);
			}
		},

		/* Formatter Functions */

		// All apps permitted from the Users Management application will be allowed for use.
		// All the premitted apps should come in the pagepermission array while the user logs on.
		// You can find the pagepermission array in the data received after each successful log on.
		isAppVisible: function (oMenuItem) {
			if (oMenuItem) {
				var userRole = this.getOwnerComponent().getModel("loggedOnUserModel").getData().role;
				if (oMenuItem.key === "Home") {
					return true;
				} else if (oMenuItem.key === "UsersManagement" && userRole.toLowerCase() === "superadmin") {
					return true;
				}

				// Proceeds below only if both of the above condintions are false

				var appId = oMenuItem.id,
					appName = oMenuItem.title,
					returnValue = false;
				var permissionData = this.getOwnerComponent().getModel("loggedOnUserModel").getData().pagepermission,
					permittedAppName,
					subMenuItems = oMenuItem.items;
				for (var appIndex = 0; appIndex < permissionData.length; appIndex++) {
					permittedAppName = permissionData[appIndex].applicationname.split(" ")[0] + permissionData[appIndex].applicationname.split(" ")[1];
					if (subMenuItems && subMenuItems.length) {
						for (var itemIndex = 0; itemIndex < subMenuItems.length; itemIndex++) {
							// if (subMenuItems[itemIndex].id === permissionData[appIndex].applicationid) { //If an app inside the submenu is assigned to the user
							if (subMenuItems[itemIndex].id === permissionData[appIndex].applicationid || subMenuItems[itemIndex].title === permittedAppName) { //If an app inside the submenu is assigned to the user
								returnValue = true;
								break;
							}
						}
					} else {
						// if (appId === permissionData[appIndex].applicationid) { //If the app is assigned to the user
						if (appId === permissionData[appIndex].applicationid || appName === permittedAppName) { //If the app is assigned to the user
							returnValue = true;
							break;
						}
					}
				}
				return returnValue;
			}
		}
	});
});