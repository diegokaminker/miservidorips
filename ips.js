const uuid = require('uuid');

function getIPS(id,patId)
{
/*
Recursos minimos para la Composition IPS-AR (1ra Entry)
+Patient
+Organization
+Author
+MedicationStatement
+Condition
+AllergyIntolerance
+Immunization
 */
// Preparamos el fullURL de cada entry
// Nos serviran como referencia entre los recursos del bundle
var MyDomain='http://www.msal.gov.ar';
var CompositionEntryId = uuid.v4();
var OrganizationEntryId = uuid.v4();
var PatientEntryId = uuid.v4();
var AuthorEntryId = uuid.v4();
var MedicationStatementEntryId = uuid.v4();
var ConditionEntryId = uuid.v4();
var AllergyIntoleranceMedicationEntryId = uuid.v4();
var AllergyIntoleranceFoodEntryId = uuid.v4();
var ImmunizationEntryId = uuid.v4();

//Populamos la organizacion
//IPS Must-Support: identifier, name, telecom, address

var org = {
    
      
            "resourceType": "Organization",
            "text": {
                "status": "generated",
                "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">DOMINIO DE PRUEBA</div>"
            },
            "identifier": [
                {
                    "system": "https://bus.msal.gov.ar/dominios",
                    "value": "2.16.840.1.113883.2.10.99"
                },
                {
                    "system": "http://argentina.gob.ar/salud/bus-interoperabilidad/dominio",
                    "value": MyDomain
                }
            ],
            "active": true,
            "name": "DOMINIO DE PRUEBA",
            "telecom": [
                {
                    "system": "phone",
                    "value": "+54-9999-9999",
                    "use": "work"
                }
            ],
            "address": [
                {
                    "use": "work",
                    "line": [
                        "Av. Dominio 9999 Piso 9 Depto 99"
                    ],
                    "city": "Prueba",
                    "postalCode": "9999",
                    "country": "Argentina"
                }
            ]
        };
    
    


org.meta = { profile: ["http://hl7.org/fhir/uv/ips/StructureDefinition/Organization-uv-ips"] };

// Setup a Reference to this Organization
orgRef = { reference: "Organization/" + OrganizationEntryId, display: org.name };

var dev = {

        "resourceType": "Device",
        "identifier": [
            {
                "system": MyDomain +"/Device",
                "value": "HCE"
            }
        ],
        "deviceName": [
            {
                "name": "Sistema HCE Dominio",
                "type": "manufacturer-name"
            }
        ],
        "type": {
            "coding": [
                {
                    "system": "http://snomed.info/sct",
                    "code": "462894001",
                    "display": "software de aplicación de sistema de información de historias clínicas de pacientes (objeto físico)"
                }
            ]
        },
        "owner": {
            "reference": orgRef
        }
    
};

dev.meta = { profile: ["http://hl7.org/fhir/uv/ips/StructureDefinition/Device-uv-ips"] };

//Setup a reference to this practitioner

var authorRef = { reference: "Device/" + AuthorEntryId, display: dev.deviceName[0].name};

//We populate the patient
//IPS Must-Support: name (family/given), telecom, gender, birthDate, address (line/city/state/postalCode
// /country) , contact (relationship,name, telecom, address, organization - ref , communication ,
// generalPractitioner
    PatientSystem=patId[0];
    PatientValue=patId[1];
    
pat = {

    resourceType: "Patient",
    identifier: [{
        use: "official",
        system: PatientSystem,
        value: PatientValue
    }],
    active: true,
    name: [{
        use: "official",
        family: "Apellido Fijo",
        given: [
            "Nombre Fijo"
        ]
        
    }]
    ,gender: "male",
    birthDate: "1999-09-09"
    
};
pat.meta = { profile: ["http://hl7.org/fhir/uv/ips/StructureDefinition/Patient-uv-ips"] };
patientDisplay = pat.name[0].family + "," + pat.name[0].given[0];
patientRef = { reference: "Patient/" + PatientEntryId, display: patientDisplay };


/*

Creamos el recurso composition
Elementos obligatorios para IPS:
identifier, status, type
author, title, confidentiality
attester, custodian
Secciones obligatorias para IPS-AR: Problemas, Medicaciones, Alergias, Vacunas

/*
Identificador unico de Documento, status
Document Type: IPS
Document Subject : el paciente
Document creado ahora
Author: dispositivo
*/
var cmp = {
    resourceType: "Composition",
    identifier: [{
        system: MyDomain,
        value: uuid.v4()
    }],
    status: "final",
    type: { coding: { system: "http://loinc.org", code: "60591-5", display: "Resumen de Paciente IPS" } },
    subject: patientRef,
    date: JSON.stringify(Date),
    author: authorRef,
    confidentiality: "N",
    title: "Resumen de Paciente " + patientDisplay,
    attester: {
        mode: "legal",
        party: orgRef,
        custodian: orgRef
    }
};

cmp.meta = { profile: ["http://hl7.org/fhir/uv/ips/StructureDefinition/Composition-uv-ips"] };
// Secciones


// Alergias

var almenarrative = {
    status: "generated",
    div: '<div xmlns="http://www.w3.org/1999/xhtml">Alergia - Medicacion - Criticalidad -ALTA -PENICILINA</div>'
};

// Entry: alergia a la penicilina
var peni = {
    resourceType: "AllergyIntolerance",
    type: "allergy",
    category: "medication",
    criticality: "high",
    patient: patientRef,
    code: { coding: { system: "http://snomed.info/sct.org", code: "373270004", display: "Substance with penicillin structure and antibacterial mechanism of action (substance)" } },
    text: almenarrative,
    meta: { profile: ["http://hl7.org/fhir/uv/ips/StructureDefinition/AllergyIntolerance-uv-ips"] }
};

var peniRef = { reference: "AllergyIntolerance/" + AllergyIntoleranceMedicationEntryId };


// No alergias alimentarias

var alfonarrative = {
    status: "generated",
    div: '<div xmlns="http://www.w3.org/1999/xhtml"> Sin alergias alimentarias</div>'
};


var nofo = {
    resourceType: "AllergyIntolerance",
    type: "allergy",
    category: "food",
    patient: patientRef,
    code: { coding: { system: "http://hl7.org/fhir/uv/ips/CodeSystem/absent-unknown-uv-ips", code: "no-known-food-allergies", display: "No Known Food Allergies" } },
    text: alfonarrative,
    meta: { profile: ["http://hl7.org/fhir/uv/ips/StructureDefinition/AllergyIntolerance-uv-ips"] }
};


var nofoRef = { reference: "AllergyIntolerance/" + AllergyIntoleranceFoodEntryId };


var alernarrative = {
    status: "generated",
    div: '<div xmlns="http://www.w3.org/1999/xhtml">Alimento: No registradas/ Medicación: Alergia a la penicilina</div>'
};

cmp.section = [];

cmp.section.push({
    code: { coding: { system: "http://loinc.org", code: "48765-2", display: "Alergias e Intolerancias" } },
    title: "Alergias e Intolerancias",
    text: alfonarrative,
    entry: [peniRef, nofoRef]
});

//Problemas
/*
     Must-Support de IPS para Condition
     clinicalStatus
     verificationStatus
     category
     severity
     code
     subject
     onsetDateTime
     asserter
     */
var cond = {
    resourceType: "Condition",
    clinicalStatus: { coding: { system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active", display: "Active" } },
    verificationStatus: { coding: { system: "http://terminology.hl7.org/CodeSystem/condition-ver-status", code: "confirmed", display: "Confirmed" } },
    category: { coding: { system: "http://loinc.org", code: "75326-9", display: "Problem" } },
    severity: { coding: { system: "http://loinc.org", code: "LA6751-7", display: "Moderate" } },
    code: { coding: { system: "http://snomed.info/sct", code: "54329005", display: "Infarto agudo de la pared anterior del miocardio" } },
    onsetDateTime: "2010-01-01",
    subject: patientRef,
    text: {
        status: "generated",
        div: '<div xmlns="http://www.w3.org/1999/xhtml">Infarto agudo de la pared anterior del miocardio, 01-Ene-2019, Activo, Confirmado</div>'
    },
    meta: { profile: ["http://hl7.org/fhir/uv/ips/StructureDefinition/Condition-uv-ips"] }
}

var condRef = { reference: "Condition/" + ConditionEntryId };


cmp.section.push({
    code: { coding: { system: "http://loinc.org", code: "11450-4", display: "Problems" } },
    title: "Problemas Activos",
    text: cond.text,
    entry: [condRef]
});

var medi = {
    resourceType: "MedicationStatement",
    status: "active",
    medication: { coding: { system: "http://snomed.info/sct", code: "1108979001", display: "Clopidogrel" } },
    subject: patientRef,
    reasonReference: condRef,
    dosage: [{
        text: "75 mg oral una vez por dia",
        route: { coding: { system: "http://standardterms.edqm.eu", code: "20053000", display: "Oral" } },
        timing: { coding: { system: "http://terminology.hl7.org/CodeSystem/v3-GTSAbbreviation", code: "QD", display: "Diario" } }
    }],
    text: {
        status: "generated",
        div: '<div xmlns="http://www.w3.org/1999/xhtml"> Clopidogrel, 75mg Oral, una vez por dia</div>'
    },
    meta: { profile: ["http://hl7.org/fhir/uv/ips/StructureDefinition/MedicationStatement-uv-ips"] }
};

var mediRef = { reference: "MedicationStatement/" + MedicationStatementEntryId };

cmp.section.push({
    code: { coding: { system: "http://loinc.org", code: "10160-9", display: "Medicación" } },
    title: "Medicación",
    text: medi.text,
    entry: [mediRef]
});

var imm=
{
"resourceType": "Immunization",
"status": "completed",
"vaccineCode": {
    "coding": [
        {
            "system": "http://hl7.org/fhir/uv/ips/CodeSystem/absent-unknown-uv-ips",
            "code": "no-immunization-info",
            "display": "no-immunization-info"
        }
    ]
},
"patient": {
    "reference": patientRef
},
"_occurrenceDateTime": {
    "extension": [
        {
            "url": "http://hl7.org/fhir/StructureDefinition/data-absent-reason",
            "valueCode": "unknown"
        }
    ]
}
};
var immRef = { reference: "Immunization/" + ImmunizationEntryId };

cmp.section.push({
    code: { coding: { system: "http://loinc.org", code: "60484-3", display: "Vacunas" } },
    title: "Vacunas",
    text: "Sin registro de Vacunas",
    entry: [immRef]
});

//Inicializamos el Bundle
var my_ips = new Object();
my_ips.resourceType = 'Bundle';
my_ips.id = id;
my_ips.type = "document"
    //Ahora que tenemos todos los recursos
    //podemos armar el bundle
my_ips.entry = [];
my_ips.entry.push({ fullUrl: CompositionEntryId, resource: cmp });
my_ips.entry.push({ fullUrl: PatientEntryId, resource: pat });
my_ips.entry.push({ fullUrl: OrganizationEntryId, resource: org });
my_ips.entry.push({ fullUrl: AuthorEntryId, resource: dev });
my_ips.entry.push({ fullUrl: ConditionEntryId, resource: cond });
my_ips.entry.push({ fullUrl: MedicationStatementEntryId, resource: medi });
my_ips.entry.push({ fullUrl: AllergyIntoleranceMedicationEntryId, resource: peni });
my_ips.entry.push({ fullUrl: AllergyIntoleranceFoodEntryId, resource: nofo });
my_ips.entry.push({ fullUrl: ImmunizationEntryId, resource: imm });

return my_ips;
}
module.exports={getIPS}