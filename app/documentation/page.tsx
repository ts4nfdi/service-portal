import ExpandableImage from "../ui/commons/ExpandableImage";


export default function Documentation() {
  return (
    <div className="md:col-span-2">
      <p className="header-1">Service documentation</p>
      <p className="text-justify">
        Terminology Services 4 NFDI (TS4NFDI) aims to standardize and harmonize collaborative terminology management within the NFDI. TS4NFDI is a cross-domain basic service of the consortia Base4NFDI for the provision, curation, development, harmonization, and mapping of terminologies.
      </p>
      <br />

      <label htmlFor="list-of-content"><b>Content</b></label>
      <ol id="list-of-content" className="pl-8">
        <li><a href="#architecture">Architecture</a></li>
        <li><a href="#service-portal">Service Portal</a></li>
        <li><a href="#tss">Terminology Service Suite (TSS)</a></li>
        <li><a href="#mapping-service">Mapping Service</a></li>
        <li><a href="#gateway">API Gateway</a></li>
      </ol>

      <a href="#architecture"><p className="header-2" id="architecture">1. Architecture</p></a>
      <p className="text-justify">
        The TS4NFDI architecture is centered around a flexible, service-based approach that enables seamless integration of external terminology services,
        offering a centralized and unified access point for all TS4NFDI users via dedicated applications.
      </p>
      <p className="text-justify">
        The overall architecture is divided into four layers. The uppermost layer comprises the use cases of TS4NFDI.
        These use cases encompass independent (web)services with interfaces or (research) programs.
        The second layer from the top contains the TS4NFDI Service Portal, which comprises the
        <a href="#tss">Terminology Service Suite</a>, the
        <a href="/incubators" target="_blank">Incubator Dashboard</a>, the frontend of the TS4NFDI Mapping Service and a Configuration Panel.
        The penultimate layer is constituted by the
        <a href="#gateway">API Gateway</a>, which comprises service wrappers and the associated service sources.
        The final layer provides details on the backend of the TS4NFDI
        <a href="#mapping-service">Mapping Service</a> and multiple terminology services.
        These terminology services have the potential to be hosted by third parties or alternatively by the project institutions of TS4NFDI.
      </p>

      <br />
      <ExpandableImage
        imagePath="/img/architecture.svg"
        width={800}
        height={800}
        altText="Service Architecture image"
      />

      <a href="#service-portal"><p className="header-2" id="service-portal">2. Service Portal</p></a>
      <p className="text-justify">
        To facilitate the integration and customisation of the features of TS4NFDI into the services of the NFDI consortia,
        TS4NFDI will provide a central TS4NFDI Service Portal. The TS4NFDI Service Portal is designed to facilitate the creation
        and management of entity sets and terminology collections. This enables domain experts to configure the response of the
        centralized  API Gateway or the Terminology Service Suite (TSS) following their specific requirements. To enable customisation,
        an administrator user interface will be provided within a configuration panel, utilising the widgets provided by
        the Terminology Service Suite.  This will ensure simple access and enhance usability for administrators. The configuration panel
        will display a comprehensive list of all available terminologies from the various terminology services accessed by the API Gateway.
        Furthermore, it is possible to list terminologies that are subject to licence restrictions. Should a user meet the licence conditions,
        these terminologies can also be utilised via the widgets. Next to this, a Mapping Service will be also accessible via the TS4NFDI Service Portal.
        To implement these access-restricted areas or licenced terminologies the features of the basic service IAM4NFDI will be used.
      </p>

      <a href="#tss"><p className="header-2" id="tss">3. Terminology Service Suite (TSS)</p></a>
      <p className="text-justify">
        TS4NFDI will provide modular graphical user interface (GUI) widgets in the Terminology Service Suite (TSS)
        that facilitate the seamless integration of terminology functionalities into service interfaces.
        These widgets have been developed to facilitate the creation of service interfaces for terminology services by
        providing out-of-the-box components for tasks such as term search, ontology browsing and semantic annotation.
        The Terminology Service Suite (TSS) is thus defined as a collection of interactive, web-based widgets designed to
        facilitate the integration of terminology service functions into third-party applications.
        The widgets are built using React and TypeScript and can be used in both React and plain HTML applications.
        The functionality and arguments are the same for the React and plain HTML versions. By providing ready-to-use UI components,
        TS4NFDI reduces the complexity of integrating semantic information into NFDI platforms.
        This includes widgets for browsing ontologies, performing term lookups, and visualizing mappings between concepts.
        Furthur widget documentations and their storybook is available at:
        <a href="https://terminology.services.base4nfdi.de/tss/comp/latest/?path=/docs/overview--docs" target="_blank">TSS widgets storybook</a>
      </p>

      <a href="#mapping-service"><p className="header-2" id="mapping-service">4. Mapping Service </p></a>
      <p className="text-justify">
        The NFDI-wide Mapping Service facilitates cross-domain interoperability by enabling the alignment of terminologies
        from different disciplines. The Mapping Service allows users to create, manage, retrieve, and review mappings between
        concepts from different vocabularies and ontologies. These mappings enable the discovery of semantic equivalences and
        relationships across disciplines, fostering a more integrated understanding of domain-specific knowledge.
        The Mapping Service runs with <a href="https://github.com/gbv/cocoda" target="_blank">Cocoda</a> web application (Vue.js)
        for frontend and <a href="https://github.com/gbv/jskos-server" target="_blank">jskos-server</a> (NodeJS) for backend database
        and web service API, and <a href="https://www.npmjs.com/package/cocoda-sdk" target="_blank">cocoda-sdk</a> (NodeJS library) to
        access terminology services such as the API Gateway.
      </p>
      <p className="text-justify">
        The current development version of the Mapping Service is available at
        <a href="https://coli-conc.gbv.de/cocoda/ts4nfdi/" target="_blank">https://coli-conc.gbv.de/cocoda/ts4nfdi/</a>
      </p>

      <a href="#gateway"><p className="header-2" id="gateway">5. API Gateway</p></a>
      <p className="text-justify">
        The API Gateway serves as the principal interface between users and the connected (Web) interfaces,
        as well as the various central or federated terminology services. In this capacity, it functions as a unifying and
        centralized access point for all requests pertaining to terminology, providing a cohesive API for accessing and managing terminologies
        across diverse domains. This ensures a standardised and harmonised interface, facilitating streamlined operations.
        The functionalities offered by the API Gateway are as follows:
        <li className="p-4 list-item">
          Standardized API Access: The API Gateway abstracts the complexity of the underlying terminology services,
          enabling users to access multiple service APIs through a common one without needing to understand the specificities of
          each service. This includes operations such as searching, suggesting, and retrieving information about terms, terminologies, or mappings.
        </li>
        <li className="p-4 list-item">
          Cross-Domain Support: The API Gateway will provide access to cross-domain terminologies and mappings,
          allowing users to explore and map concepts across multiple disciplines. This supports more effective inter-disciplinary
          collaboration and data interoperability within the NFDI community.
        </li>
        <li className="p-4 list-item">
          Routing and Load Balancing: The API Gateway manages the routing of incoming requests to the appropriate services,
          including load balancing to ensure efficient resource usage and optimal performance for high-traffic requests.
        </li>
      </p>
      <p className="text-justify">
        This is the link to our API Gateway documentation:
        <a href="https://ts4nfdi.github.io/api-gateway/" target="_blank">https://ts4nfdi.github.io/api-gateway/</a>
      </p>
    </div>
  );
}
