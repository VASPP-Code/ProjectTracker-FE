/*global QUnit*/

sap.ui.define([
	"vaspp/project31/controller/view21.controller"
], function (Controller) {
	"use strict";

	QUnit.module("view21 Controller");

	QUnit.test("I should test the view21 controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
