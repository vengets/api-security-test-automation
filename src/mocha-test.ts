const Mocha = require('mocha');
const moment = require('moment-timezone');
const path = require('path')
const config = require('config');
import { OpenApiParser } from 'open-api-spec-parser';

// for reporting
const currentDateTime = moment().tz(config.get('reporting.timezone')).format(config.get('reporting.datetimeformat'));
const reportDirectory = path.resolve(__dirname, `../execution-report/${currentDateTime}`)

// mocha setup
const Test = Mocha.Test;
const suiteInstance = Mocha.Suite;

const myMocha = new Mocha({
    timeout: 200000,
    reporter: 'mochawesome',
    reporterOptions: {
        reportDir: reportDirectory,
        reportTitle: "API Security Test Automation Execution Report",
        reportPageTitle: "API Security Test Automation Report",
        charts: true
    }
});

const parentSuite = (suiteName = 'API Security Test Automation') => suiteInstance.create(myMocha.suite, suiteName);

const runMochaTests = () => {
    return new Promise((resolve, reject) => {
        myMocha.run((failures) => {
            if (failures) reject('at least one test is failed, check detailed execution report')
            resolve('success')
        });
    });
}

const expect = require('chai').expect;
const reportValue = require('mochawesome/addContext')

const defineTestSuiteAndAddTests = async () => {
    const parentSuiteName = parentSuite('sample test suite');
    const openapispec = config.get('openapispec');

    openapispec.forEach(async spec => {
        await runOpenApiSpecTests(parentSuiteName, spec.path);
    });
}

const runOpenApiSpecTests = async (parentSuite, openApiSpecPath: string) => {
    console.log(`CONT ${openApiSpecPath}`);
    const contents = await httpGet(openApiSpecPath);
    console.log(`CONTENTS = ${contents}`);
    // const parser = new OpenApiParser.OpenApiParser(JSON.stringify(JSON.parse(contents)));
    const spec = JSON.parse(contents);
    const paths = Object.keys(spec.paths);
    paths.forEach(path => {
        const methods = Object.keys(spec.paths[path]);
        let url = path;
        methods.forEach(method => {
            let requestBody = spec.paths[path][method].requestBody;
            let parameters = spec.paths[path][method].parameters;
            console.log(path);
            console.log(method);
            if(requestBody != undefined) {
                    // const body = parser.generateObjectFromSchema(requestBody.$ref);
                    console.log(`BODY = ${JSON.stringify(requestBody.$ref)}`);
            }
            if(parameters != undefined) {
                parameters.forEach(param => {
                    // const p = parser.getSingleSchemaValue(param.$ref + '/schema');
                    console.log(`PARAM = ${param.$ref} /schema `);
                });
            }
        });
    });
}

async function httpGet(theUrl) {
   let result = await fetch(theUrl)
	.then((response) => {
  		return response.text();
	})
	.then((text) => {
        return text;
	});

    return result;
}

export function runTest() {
    (async () => {
        defineTestSuiteAndAddTests();
        try {
            const result = await runMochaTests()
        }
        catch (e) { console.log(e) }
    })();
}