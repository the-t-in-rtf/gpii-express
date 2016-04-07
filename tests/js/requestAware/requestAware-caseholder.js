"use strict";
var fluid  = require("infusion");
var gpii   = fluid.registerNamespace("gpii");
var jqUnit = require("node-jqunit");

require("../lib/test-helpers");

fluid.registerNamespace("gpii.tests.express.requestAware.caseHolder");

gpii.tests.express.requestAware.caseHolder.testRequestAwareDelayedResponse = function (responseObject, response, body) {
    gpii.tests.express.helpers.isSaneResponse(response, body, 200);
    responseObject.body = body;
};

gpii.tests.express.requestAware.caseHolder.testRequestAwareTimeoutResponse = function (response, body) {
    gpii.tests.express.helpers.isSaneResponse(response, body, 500);
};

// Look at two sequential requests and confirm that they are different.
gpii.tests.express.requestAware.caseHolder.testRequestAwareIntegrity = function (firstResponseString, secondResponseString) {
    // If we can evolve the response into JSON, we do.
    var firstResponseBody  = firstResponseString;
    var secondResponseBody = secondResponseString;
    try {
        firstResponseBody  = JSON.parse(firstResponseString);
        secondResponseBody = JSON.parse(secondResponseString);
    }
    catch (e) {
        // Do nothing
    }

    jqUnit.assertDeepNeq("Two sequential requests should be different.", firstResponseBody, secondResponseBody);
};


fluid.defaults("gpii.tests.express.requestAware.caseHolder", {
    gradeNames: ["gpii.tests.express.caseHolder"],
    rawModules: [
        {
            tests: [
                {
                    name: "Testing a basic 'request aware' component...",
                    type: "test",
                    sequence: [
                        {
                            func: "{requestAwareInstrumentedRequest}.send"
                        },
                        {
                            listener: "gpii.tests.express.requestAware.caseHolder.testRequestAwareDelayedResponse",
                            event:    "{requestAwareInstrumentedRequest}.events.onComplete",
                            args:     ["{requestAwareInstrumentedRequest}", "{requestAwareInstrumentedRequest}.nativeResponse", "{arguments}.0"]
                        },
                        {
                            func: "{requestAwareSecondInstrumentedRequest}.send"
                        },
                        {
                            listener: "gpii.tests.express.requestAware.caseHolder.testRequestAwareIntegrity",
                            event:    "{requestAwareSecondInstrumentedRequest}.events.onComplete",
                            args:     ["{requestAwareInstrumentedRequest}.body", "{arguments}.0"]
                        }
                    ]
                },
                {
                    name: "Testing a slow but responsive 'request aware' component...",
                    type: "test",
                    sequence: [
                        {
                            func: "{requestAwareDelayedRequest}.send"
                        },
                        {
                            listener: "gpii.tests.express.requestAware.caseHolder.testRequestAwareDelayedResponse",
                            event:    "{requestAwareDelayedRequest}.events.onComplete",
                            args:     ["{requestAwareDelayedRequest}", "{requestAwareDelayedRequest}.nativeResponse", "{arguments}.0"]
                        },
                        {
                            func: "{requestAwareSecondDelayedRequest}.send"
                        },
                        {
                            listener: "gpii.tests.express.requestAware.caseHolder.testRequestAwareIntegrity",
                            event:    "{requestAwareSecondDelayedRequest}.events.onComplete",
                            args:     ["{requestAwareDelayedRequest}.body", "{arguments}.0"]
                        }
                    ]
                },
                {
                    name: "Testing a nonresponsive 'request aware' component...",
                    type: "test",
                    sequence: [
                        {
                            func: "{requestAwareTimeoutRequest}.send"
                        },
                        {
                            listener: "gpii.tests.express.requestAware.caseHolder.testRequestAwareTimeoutResponse",
                            event:    "{requestAwareTimeoutRequest}.events.onComplete",
                            args:     ["{requestAwareTimeoutRequest}.nativeResponse", "{arguments}.0"]
                        }
                    ]
                }
            ]
        }
    ],
    components: {
        cookieJar: {
            type: "kettle.test.cookieJar"
        },
        requestAwareInstrumentedRequest: {
            type: "gpii.tests.express.request",
            options: {
                endpoint: "instrumented"
            }
        },
        requestAwareSecondInstrumentedRequest: {
            type: "gpii.tests.express.request",
            options: {
                endpoint: "instrumented"
            }
        },
        requestAwareDelayedRequest: {
            type: "gpii.tests.express.request",
            options: {
                endpoint: "delayed"
            }
        },
        requestAwareSecondDelayedRequest: {
            type: "gpii.tests.express.request",
            options: {
                endpoint: "delayed"
            }
        },
        requestAwareTimeoutRequest: {
            type: "gpii.tests.express.request",
            options: {
                endpoint: "timeout"
            }
        }
    }
});
