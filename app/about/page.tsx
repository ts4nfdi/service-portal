import AboutPeople from "../ui/about/people";


export default function About() {
  return (
    <div className="md:col-span-3 grid grid-rows-1">
      <div className="grid grid-rows-1 mb-2" key={'goals'}>
        <p className="text-justify" key={1}>
          <b>Terminology Services 4 NFDI (TS4NFDI)</b> is a cross-domain initiative aimed at standardizing,
          harmonizing, and enhancing the management of terminologies across scientific disciplines within the
          German National Research Data Infrastructure (NFDI). Terminologies are critical for ensuring the semantic interoperability
          of research data, allowing researchers to clearly understand and reuse data across various disciplines.
          TS4NFDI addresses the complexities involved in managing diverse terminological resources by providing
          unified access to several terminology services through an integrated service architecture.
        </p>
        <p className="text-justify" key={2}>
          In the ongoing integration phase, TS4NFDI will extend features and available service components:
        </p>
        <ul>
          <li className="text-justify list-item" key={1}>
            The <a href="documentation#service-portal">Service Portal</a> offers personalized access via Integration of IAM4NFDI and enables users to
            manage terminologies, entity sets, and access to licensed terminologies.
          </li>
          <li className="text-justify list-item" key={2}>
            A <a href="documentation#mapping-service">Mapping Service</a> facilitates the creation, curation, and accessibility of terminology mappings.
          </li>
          <li className="text-justify list-item" key={4}>
            The <a href="documentation#gateway">API Gateway</a> backend architecture integrates external terminology sources and allows to store curated collections of terminologies.
          </li>
          <li className="text-justify list-item" key={5}>
            The <a href="documentation#tss">Terminology Service Suite (TSS)</a> provides GUI widgets for integration of terminologies into existing applications.
          </li>
          <li className="text-justify list-item" key={3}>
            TS4NFDI will enhance Terminology Curation Workflows to enable instant application of curated terminologies.
          </li>
        </ul>
      </div>
      <AboutPeople key={'people'} />

    </div>
  );
}
