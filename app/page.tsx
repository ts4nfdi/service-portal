import Image from 'next/image';


export default function Home() {
    return (
        <div className='col-span-3'>
            <div className='grid md:grid-cols-9 md:gap-4'>
                <div className='md:col-span-9 h1-service-portal'>
                    <h1 className='header-main-1 float-right'>
                        <Image
                            width={255}
                            height={255}
                            alt="TS4NFDI"
                            src={'img/TS4NFDI-small-grey.svg'}
                        />
                        Service Portal
                    </h1>
                </div>
                <div className='md:col-span-5 card-background min-h-[50px]'>
                    <h3 className='header-main-3'>What is TS4NFDI?</h3>
                    <p className='text-justify my-5'>
                        An overarching research data management across all domains is built upon metadata describing
                        research data and their generation. To make sure that disciplines can create and share a common
                        understanding of the concepts and relations used to describe data, we need terminologies as a
                        formal representation of domain knowledge.
                    </p><p className='text-justify my-5'>
                        Terminology Services 4 NFDI (TS4NFDI) is a cross-domain service for the provision, curation,
                        development, harmonization, and mapping of terminologies. It aims to facilitate
                        consensus-building and interoperability of services across disciplines to achieve a shared
                        knowledge representation and knowledge engineering framework. The service seeks to integrate
                        and converge individual solutions into a standardized, interoperable, and sustainable
                        architecture.
                    </p>
                    <p className='text-justify my-5'>
                        In order to accomplish these objectives, TS4NFDI provides the following tools: the TS4NFDI
                        Service Portal, a Terminology Service Suite (TSS), an centralised API Gateway, and a mapping
                        service.
                    </p>
                </div>
                <div className='md:col-span-4 card-background float-right'>
                    <iframe
                        className="w-full aspect-video self-stretch md:min-h-96"
                        src="https://www.youtube.com/embed/OT4YUTvqKRI"
                        frameBorder="0"
                        title="TS4NFDI quickly explained"
                        aria-hidden="true"
                        allow="fullscreen"
                        allowFullScreen
                    />
                </div>
                <div className='md:col-span-9'>
                    <br /><br />
                </div>
                <div className='card-background md:col-span-9 grid md:grid-cols-9'>
                    <div className='md:col-span-3'>
                        <Image
                            src={"img/TS4NFDI-Service-Portal-Hexagon-Dark.svg"}
                            width={350}
                            height={350}
                            alt="Logo TS4NFDI Service Portal"
                            placeholder="blur"
                            blurDataURL="/blur.webp"
                            style={{ margin: 'auto' }}
                        />
                    </div>
                    <div className='md:col-span-6'>
                        <h3 className='header-main-3 text-right'>About the TS4NFDI Service Portal</h3>
                        <p className='text-justify my-5'>
                            The basic service TS4NFDI provides a centralised access point in the form of the
                            TS4NFDI Service Portal. The purpose of the portal is to facilitate the integration, usage
                            and customisation of the TS4NFDI tools into the services of NFDI consortia.
                        </p>
                        <p className='text-justify my-5'>
                            This feature empowers domain experts to tailor the response of the centralised API Gateway
                            or the Terminology Service Suite (TSS) to meet their exact requirements. To enable
                            customisation, an administrator user interface is provided within a dashboard, including a
                            configuration panel.
                        </p>
                        <p className='text-justify my-5'>
                            The configuration panel displays a comprehensive list of all available terminologies from
                            the various terminology services accessed by the API Gateway. These terminologies could be
                            combined and published in<a className='text-base' href="/collection/collections">terminology
                                collections</a>which are provided by and hosted at the TS4NFDI Service Portal.
                        </p>

                    </div>
                </div>
                <div className='md:col-span-9'>
                    <h2 className='header-main-2'>Tools</h2>
                </div>
                <div className='md:col-span-3 card-background'>
                    <Image
                        src={"img/TS4NFDI-Terminology-Service-Suite-Hexagon-Dark.svg"}
                        width={350}
                        height={350}
                        alt="TS4NFDI Terminology Service Suite"
                        placeholder="blur"
                        blurDataURL="/blur.webp"
                        style={{ margin: 'auto' }}
                    />
                    <p className='text-justify my-5'>
                        Integrating terminology data into other web services, such as annotation services or data
                        repositories, is crucial for generating and handling FAIR data. The Terminology Service Suite
                        (TSS) is a collection of interactive web components (widgets) designed to ease the integration
                        of terminology service functions into third-party applications.
                    </p>
                    <p className='text-justify my-5'>
                        The widgets are built using React and TypeScript and can be used in both React and plain HTML
                        applications. The functionality and arguments are the same for the React and plain HTML versions.
                    </p>
                    <p className='text-right'>
                        <a className='text-base' href="/documentation#tss">{">>> Read more"}</a>
                    </p>
                </div>
                <div className='md:col-span-3 card-background'>
                    <Image
                        src={"img/TS4NFDI-API-Gateway-Hexagon-Dark.svg"}
                        width={350}
                        height={350}
                        alt="TS4NFDI API Gateway"
                        placeholder="blur"
                        blurDataURL="/blur.webp"
                        style={{ margin: 'auto' }}
                    />
                    <p className='text-justify my-5'>
                        For the acceptance and use of terminology data, it is essential that the data is easily
                        accessible. The TS4NFDI API Gateway is a sophisticated, flexible solution that can make
                        federated calls across multiple terminology services within the NFDI and beyond. It can query
                        all terminology services based on the technology of Ontology Lookup Service (OLS), OntoPortal
                        and Skosmos.
                    </p>
                    <p className='text-justify my-5'>
                        The API output is provided in MOD (Metadata for Ontology Description and Publication) format.
                        In future, the TS4NFDI API Gateway will also provide output in the formats of the OLS,
                        OntoPortal and Skosmos APIs.
                    </p>
                    <p className='text-right'>
                        <a className='text-base' href="/sources">{">>> Read more"}</a>
                    </p>
                </div>
                <div className='md:col-span-3 card-background'>
                    <Image
                        src={"img/TS4NFDI-Mapping-Service-Hexagon-Dark.svg"}
                        width={350}
                        height={350}
                        alt="TS4NFDI Mapping Service"
                        placeholder="blur"
                        blurDataURL="/blur.webp"
                        style={{ margin: 'auto' }}
                    />
                    <p className='text-justify my-5'>
                        Mappings between terminologies are crucial for interoperability within NFDI consortia. The
                        TS4NFDI Mapping service acts as a mapping registry and is based on the software Cocoda.
                        Cocoda is a web application to manage and create mappings between knowledge organization
                        systems, such as classifications, authority files, and thesauri.
                    </p>
                    <p className='text-justify my-5'>
                        Mappings between terminologies are crucial for interoperability within NFDI consortia. The
                        TS4NFDI Mapping service acts as a mapping registry and is based on the software Cocoda.
                        Cocoda is a web application to manage and create mappings between knowledge organization
                        systems, such as classifications, authority files, and thesauri.
                    </p>
                    <p className='text-right'>
                        <a className='text-base' href="/documentation#mapping-service">{">>> Read more"}</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
