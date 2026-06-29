# TS4NFDI Service Portal

The TS4NFDI Service Portal is available via https://terminology.services.base4nfdi.de.

Terminology Services 4 NFDI (TS4NFDI) is a cross-domain initiative
aimed at standardizing, harmonizing, and enhancing the management
of terminologies across scientific disciplines within the
German National Research Data Infrastructure (NFDI).
Terminologies are critical for ensuring the semantic
interoperability of research data, allowing researchers to clearly
understand and reuse data across various disciplines.
TS4NFDI addresses the complexities involved in managing diverse
terminological resources by providing unified access to several
terminology services through an integrated service architecture.

To facilitate the integration and customisation of
the features of TS4NFDI into the services of the NFDI consortia,
TS4NFDI will provide a central **TS4NFDI Service Portal**.
The TS4NFDI Service Portal is designed to facilitate the
creation and management of entity sets and terminology collections.
This enables domain experts to configure the response of the centralized
API Gateway or the Terminology Service Suite (TSS)
following their specific requirements. To enable customisation,
an administrator user interface will be provided within a
configuration panel, utilising the widgets provided by the
Terminology Service Suite. This will ensure simple access and enhance
usability for administrators. The configuration panel will display a
comprehensive list of all available terminologies from the various
terminology services accessed by the API Gateway.
Furthermore, it is possible to list terminologies that are subject
to licence restrictions. Should a user meet the licence conditions,
these terminologies can also be utilised via the widgets.
Next to this, a Mapping Service will be also accessible via the T
S4NFDI Service Portal. To implement these access-restricted areas or
licenced terminologies the features of the basic service IAM4NFDI will be used.

## Development

### Run TS4NFDI Service Portal for development

To start the development server, install the dependencies with
`npm install` and start the
application with this command:

```
npm run dev
```

### Run Test

Playwright have been used for testing this application. To run test for Firefox:

```
npx playwright test --project=firefox

or 

npm test
```

you can also use **chromium** and **webkit** for Chrome and Safari. 

