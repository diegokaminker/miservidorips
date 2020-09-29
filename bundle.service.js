/*eslint no-unused-vars: "warn"*/
//We only support one resource type
//DocumentReference
//And only search by patient identifier or subject
//UID generator for bundles
const uuidv4 = require('uuid').v4;
//FHIR specific stuff: Server, resources: Patient, Bundle, OperationOutcome and Entry
var dateFormat = require('dateformat');
const { RESOURCES } = require('@asymmetrik/node-fhir-server-core').constants;
const FHIRServer = require('@asymmetrik/node-fhir-server-core');
const getBundle =    require('@asymmetrik/node-fhir-server-core/src/server/resources/4_0_0/schemas/bundle');
const ips=require('./ips');
//Meta data for FHIR R4
let getMeta = (base_version) => {
    return require(FHIRServer.resolveFromVersion(base_version, RESOURCES.META));
};
//How to search the address of our server, so we can return it in the fullURL for each Patient entry
function GetBaseUrl(context) {
    var baseUrl = "";
    const FHIRVersion = "/4_0_0/";
    var protocol = "http://";
    if (context.req.secure) { protocol = "https://"; }
    baseUrl = protocol + context.req.headers.host + FHIRVersion;
    return baseUrl;

};

module.exports.searchById = (args, context, logger) => new Promise((resolve, reject) => {
    let { base_version, id } = args;
    console.log(id);
    let jsoning = require('jsoning');
    let database = new jsoning("ips_list.json");
    PatientIden=database.get(id).then
    (
        PatientIden=>{
        MyIPS=ips.getIPS    (id,PatientIden);
        resolve(MyIPS);
    });


})