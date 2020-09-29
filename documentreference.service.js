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
const getDocumentReference = require('@asymmetrik/node-fhir-server-core/src/server/resources/4_0_0/schemas/documentreference');
const getBundle = require('@asymmetrik/node-fhir-server-core/src/server/resources/4_0_0/schemas/bundle');
const getOperationOutcome = require('@asymmetrik/node-fhir-server-core/src/server/resources/4_0_0/schemas/operationoutcome');
const getBundleEntry = require('@asymmetrik/node-fhir-server-core/src/server/resources/4_0_0/schemas/bundleentry');
const jsoning = require('jsoning');
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
//This is for pa searches (direct read is special, below)
module.exports.search = (args, context, logger) => new Promise((resolve, reject) => {
 
    let { base_version, _content, _format, _id, _lastUpdated, _profile, _query, _security, _tag } = args;
    let { _INCLUDE, _REVINCLUDE, _SORT, _COUNT, _SUMMARY, _ELEMENTS, _CONTAINED, _CONTAINEDTYPED } = args;

    let baseUrl = GetBaseUrl(context);
    let type = args['type'];
    let subj = args['subject'];
    PatientIden=subj.split("|");
    PatientSystem=PatientIden[0];
    PatientValue=PatientIden[1];
    
    let coun = context.req.query['_count'];
    let page = context.req.query['_page'];
    MyDomain='http://www.msal.gov.ar';
    var MyDocumentId = uuidv4();
    MyDomainName="Dominio De Prueba";
    var now = new Date();
    let jsoning = require('jsoning');
    let database = new jsoning("ips_list.json");
    database.set(MyDocumentId,PatientIden).then
    ( result =>
        {
    MyDocumentDate=dateFormat(now,'isoUtcDateTime');
    MyDocumentReference=
    {
                    "resourceType": "DocumentReference",
                    "id": MyDocumentId,
                    "meta": {
                        "versionId": "1",
                        "lastUpdated":  MyDocumentDate
                    },
                    "text": {
                        "status": "empty",
                        "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"></div>"
                    },
                    "masterIdentifier": {
                        "system": MyDomain+"/DocumentReference",
                        "value": MyDocumentId
                    },
                    "identifier": [
                        {
                            "system": MyDomain+"/DocumentReference",
                            "value": MyDocumentId
                        }
                    ],
                    "status": "current",
                    "type": {
                        "coding": [
                            {
                                "system": "http://loinc.org",
                                "code": "60591-5",
                                "display": "Resumen de Historia Clínica"
                            }
                        ]
                    },
                    "subject": {
                        "identifier": {
                            "system":  MyDomain,
                            "value": PatientValue
                        }
                    },
                    "author": [
                        {
                            "identifier": {
                                "system": MyDomain,
                                "value": "HCE"
                            },
                            "display": "Historia Clínica Electrónica"
                        }
                    ],
                    "custodian": {
                        "identifier": {
                            "value": MyDomain
                            
                        },
                        "display": MyDomainName
                    },
                    "securityLabel": [
                        {
                            "coding": [
                                {
                                    "system": "https://www.hl7.org/fhir/v3/Confidentiality/vs.html",
                                    "code": "N",
                                    "display": "Normal"
                                }
                            ]
                        }
                    ],
                    "content": [
                        {
                            "attachment": {
                                "contentType": "application/fhir+json",
                                "language": "es-AR",
                                "url": "/Bundle/"+MyDocumentId,
                                "title": "Resumen de HC",
                                "creation": MyDocumentDate
                            }
                        ,
                            "format": {
                                "system": "http://hl7.org/fhir/ValueSet/formatcodes",
                                "code": "urn:ihe:iti:xds:2017:mimeTypeSufficient",
                                "display": "mimeType Sufficient"
                            }
                        }
                    ],
                    "context": {
                        "event": [
                            {
                                "coding": [
                                    {
                                        "system": MyDomain+"/CodeSystem/tiposevento",
                                        "code": "SIN_INFORMACION"
                                    }
                                ]
                            }
                        ],
                        "period": {
                            "start":  MyDocumentDate,
                            "end":  MyDocumentDate
                        },
                        "facilityType": {
                            "coding": [
                                {
                                    "system":  MyDomain+"/CodeSystem/tipoprestador",
                                    "code": "SIN_INFORMACION"
                                }
                            ]
                        },
                        "practiceSetting": {
                            "coding": [
                                {
                                    "system": MyDomain+"/CodeSystem/especialidad",
                                    "code": "SIN_INFORMACION"
                                }
                            ]
                        }
                    }
                };
            
        
    let BundleEntry = getBundleEntry;
    let Bundle = getBundle;
    
    let entry = 
        new BundleEntry({
            fullUrl: baseUrl + '/DocumentReference/' + MyDocumentId,
            resource: MyDocumentReference
        });
        entries=[];
        entries.push(entry);

    let bundle = new Bundle
    ({
        id: uuidv4(),
        meta: {
            lastUpdated:  MyDocumentDate
        },
        type: "searchset",
        total: 1,
        entry: entries

    });
    resolve( bundle);
    })

})
