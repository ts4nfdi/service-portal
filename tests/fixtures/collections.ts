import type { Collection } from "../../app/api/actions/types";

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: "collection-alpha",
    creator: "Ada Curator",
    label: "Climate Metadata Collection",
    description: "Terminologies for climate data discovery and metadata.",
    isPublic: true,
    collaborators: [],
    terminologies: [
      {
        label: "ENVO",
        source: "tib",
        type: "ontology",
        uri: "https://terminology.tib.eu/ts/ontologies/envo",
      },
      {
        label: "CF",
        source: "nerc",
        type: "vocabulary",
        uri: "https://vocab.nerc.ac.uk/collection/P07/current/",
      },
    ],
  },
  {
    id: "collection-beta",
    creator: "Ben Builder",
    label: "Chemistry Lab Collection",
    description: "Terms used in chemistry laboratory workflows.",
    isPublic: true,
    collaborators: [],
    terminologies: [
      {
        label: "CHEBI",
        source: "ebi",
        type: "ontology",
        uri: "https://www.ebi.ac.uk/ols4/ontologies/chebi",
      },
    ],
  },
  {
    id: "collection-gamma",
    creator: "Cara Curator",
    label: "Agriculture Field Collection",
    description: "Controlled vocabularies for crop and field annotations.",
    isPublic: true,
    collaborators: [],
    terminologies: [
      {
        label: "AGROVOC",
        source: "agrovoc",
        type: "thesaurus",
        uri: "https://agrovoc.fao.org/browse/agrovoc/en/",
      },
    ],
  },
  {
    id: "collection-delta",
    creator: "Dan Data",
    label: "Health Study Collection",
    description: "Terminologies for cohort and clinical study metadata.",
    isPublic: true,
    collaborators: [],
    terminologies: [
      {
        label: "SNOMEDCT",
        source: "tib",
        type: "ontology",
        uri: "https://terminology.tib.eu/ts/ontologies/snomedct",
      },
    ],
  },
  {
    id: "collection-epsilon",
    creator: "Eva Editor",
    label: "Cultural Heritage Collection",
    description: "Vocabularies for describing cultural heritage objects.",
    isPublic: true,
    collaborators: [],
    terminologies: [
      {
        label: "ICONCLASS",
        source: "iconclass",
        type: "classification",
        uri: "https://iconclass.org/",
      },
    ],
  },
  {
    id: "collection-zeta",
    creator: "Zoe Zoologist",
    label: "Marine Observation Collection",
    description: "Marine observation terms for sensor and sample records.",
    isPublic: true,
    collaborators: [],
    terminologies: [
      {
        label: "NERC",
        source: "nerc",
        type: "vocabulary",
        uri: "https://vocab.nerc.ac.uk/",
      },
    ],
  },
];
