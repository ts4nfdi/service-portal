'use server';

import {InfoAlert, PublicationCards} from "../clientExports";


export default async function Publications() {

  return (
      <div className='col-span-3'>
          <div className="">
              <p className="header-main-1 !mt-0 inline-block">Publications</p>
          </div>
          <div className="flex flex-col md:col-span-3 w-full">
              <InfoAlert
                  title={"Peer-reviewed Publications"}
                  body={
                      `The following section presents a collection of peer-reviewed publications which where published 
                      during the project Terminology Services 4 NFDI (TS4NFDI). All publications have been evaluated 
                      through established peer-review processes. They provide a comprehensive overview of the work of 
                      TS4NFDI.`
                  }
              />
              <div className="card" key="">
                  <a className="header-main-3 !text-[#45546b]" href="https://doi.org/10.11588/heibooks.1652" target="_blank">1. Terminology
                      Services in the DACH Region Landscape – What Are the Essential Requirements? </a>
                  <br /><br />
                  <p key="contributor">
                      <b>Authors: </b>Baum, Roman, Syphax Bouazouni, Jan Fillies, et al.
                      <small className="float-right" key="created_at">
                          <span className="name-badge" key="type">conference paper</span> Published on: 2025-11-05
                      </small>
                  </p>
                  <br />
                  <p className="text-justify"><b>Abstract: </b>
                       Terminologies and terminology services play a crucial role in the National Research Data Infrastructure (NFDI) and related fields, especially in the DACH region, to ensure the generation of FAIR research (meta)data. The primary objective of the Base4NFDI basic service Terminology Services 4 NFDI (TS4NFDI) is to standardize and harmonize terminology services, establishing an interoperable and sustainable solution. This solution will be integrated into the long-term NFDI infrastructure, ensuring consistency and reusability across domains, improving terminology management, and fostering cross-domain collaboration within the NFDI community. A comprehensive requirement analysis was conducted during the initialization phase of TS4NFDI, providing insights for its future development. A survey comprising 69 participants has provided valuable insights into the current challenges and needs for terminology                       services. The analysis focused on three key groups: 1) developers (of web services), 2) managers of web services which want to interact with terminology services and 3) users working with terminologies. TS4NFDI developed work packages for the integration phase in response to survey participant feedback. The following key objectives have been identified: 1) The creation of collections and entity sets of terminologies (WP1), 2) the establishment of a NFDIwide mapping service (WP2), and 3) the provision of support for term requests (WP3). Furthermore, user requirements will be addressed in WP6, focusing on community engagement, communication, and training. This includes incubator projects to integrate terminology services into user services.

                  </p>
                  <p className="float-right" key="type">
                      <a className="name-badge text-white text-xs" href="https://doi.org/10.11588/heibooks.1652" target="_blank"><b>DOI: </b>10.11588/heibooks.1652</a>
                  </p>
                  <br />
              </div>
              <div className="card" key="">
                  <a className="header-main-3 !text-[#45546b]"  href="https://doi.org/10.1007/978-3-032-09530-5_25" target="_blank" key={"title"}>2. Federated FAIR
                      Semantic Artefacts Discovery and Search with OntoPortal Federation </a>
                  <br /><br />
                  <p key="contributor">
                      <b>Authors: </b>Jonquet, Clement, Syphax Bouazzouni, Guillaume Alviset, et al.
                      <small className="float-right" key="created_at">
                          <span className="name-badge" key="type">conference paper</span>Published on: 2025-10-29
                      </small>
                  </p>
                  <br />
                  <p className="text-justify"><b>Abstract:</b> The explosion in the number of ontologies and semantic
                      artefacts has come with the importance of developing Semantic Artefact Catalogues to support
                      diverse research communities to harvest, share and serve these artefacts as FAIR objects. However,
                      the lack of interoperability of these catalogues hampers cross disciplinary studies and make
                      semantic stakeholders work quite cumbersome juggling back and forth from one tool to another. In
                      this paper, we define Semantic Artefact Catalogues interoperability and report on three
                      approaches studied. We present the implementation of the OntoPortal Federation, i.e., the
                      technical and collaboration processes engaged to federate multiple OntoPortal-based catalogues.
                      We showcase how AgroPortal, EcoPortal, EarthPortal, and BiodivPortal, have been federated and now
                      enable federated browsing and search, facilitating seamless access to distributed semantic
                      artefacts and ontologies across their respective disciplines: agri-food, ecology, earth sciences
                      and biodiversity. We discuss technical challenges and governance decisions and conclude by
                      outlining future directions toward a sustainable and community-driven OntoPortal-based semantic
                      layer for open science data infrastructures.
                  </p>
                  <span className="float-right">
                      <a className="name-badge text-white text-xs" href="https://doi.org/10.1007/978-3-032-09530-5_25" target="_blank"><b>DOI: </b>10.1007/978-3-032-09530-5_25</a>
                  </span>
                  <br />
              </div>
          </div>

          <div className="">
              <p className="header-main-1 mt-10 inline-block">Further publications integrated from Zenodo</p>
          </div>
          <div className="md:col-span-3 p-4" key={"publications"}>
              <PublicationCards />
          </div>
      </div>
  );
}
