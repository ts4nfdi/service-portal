Task:
- Use ts4nfdi widtets to build a lookup service

Details:
- There must be a new tab on the site main navbar  named "Lookup Service"
- On click, it must mount a new component named "Lookup Service"
- inside this component:
  - First, use this widget from ts4nfdi:
  ```
<SearchResultsListWidget
  api="https://terminology.services.base4nfdi.de/api-gateway/ols4/api/"
  initialItemsPerPage={10}
  itemsPerPageOptions={[
    10,
    25,
    50,
    100
  ]}
  onNavigateToOntology={function Pge(){}}
  parameter="fieldList=description,label,iri,ontology_name,type,short_form"
  preselected={[]}
  query="*"
  targetLink=""
/>
  ```

- the base url for the api endpoint comes from `NEXT_PUBLIC_API_GATEWAY_ENDPOINT` var in the .env file. add `/ols4/api/` to it.
- add a fallback that if the api endpoint is dows, swtich to "https://api.terminology.tib.eu/api/" and inform the user with a warning message.

