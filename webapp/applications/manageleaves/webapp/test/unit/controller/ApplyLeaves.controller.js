/*global QUnit*/

sap.ui.define([
	"VASPP/manageleaves/controller/ApplyLeaves.controller"
], function (Controller) {
	"use strict";

	QUnit.module("ApplyLeaves Controller");

	QUnit.test("I should test the ApplyLeaves controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
