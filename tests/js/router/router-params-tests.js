/* Test environment for the "router" grade and "wrapper" modules for common Express routers. */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

// Load all of the components to be tested and our test cases
require("../includes.js");
require("./fixtures");
require("./router-params-caseholder");

fluid.registerNamespace("gpii.tests.express.router.params.deepParamHandler");
gpii.tests.express.router.params.deepParamHandler.handleRequest = function (that) {
    that.sendResponse(200, { ok: true, params: that.request.params});
};

fluid.defaults("gpii.tests.express.router.params.deepParamHandler", {
    gradeName: ["gpii.express.handler"],
    invokers: {
        handleRequest: {
            funcName: "gpii.tests.express.router.params.deepParamHandler.handleRequest",
            args: ["{that}"]
        }
    }
});

fluid.defaults("gpii.tests.express.router.params.testEnvironment", {
    gradeNames: ["gpii.tests.express.testEnvironment"],
    port:   7512,
    components: {
        express: {
            options: {
                components: {
                    params: {
                        type: "gpii.tests.express.router.params",
                        options: {
                            path: "/params/:myVar",
                            components: {
                                deepRouter: {
                                    type: "gpii.express.requestAware.router",
                                    options: {
                                        path: "/deep",
                                        routerOptions: {
                                            mergeParams: true
                                        },
                                        handlerGrades: ["gpii.tests.express.router.params.deepParamHandler"]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        testCaseHolder: {
            type: "gpii.tests.express.router.params.caseHolder"
        }
    }
});

gpii.tests.express.router.params.testEnvironment();
