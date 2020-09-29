const { initialize, loggers, constants } = require('@asymmetrik/node-fhir-server-core');
const { VERSIONS } = constants;
//We only support patient
let config = {
    profiles: {
        documentreference: {
            service: './documentreference.service.js',
            versions: [
                VERSIONS['4_0_0']
            ]
        },
        bundle: {
            service: './bundle.service.js',
            versions: [
                VERSIONS['4_0_0']
            ]
        },
        
    }
};
let server = initialize(config);
let logger = loggers.get('default');
let jsoning = require('jsoning');
let database = new jsoning("ips_list.json");
server.listen(3000, () => {
    logger.info('Starting the FHIR Server at localhost:3000');
});