import { getAllSources } from "@/app/api/actions/sources";
import { CopyToClipboard } from "@/app/clientExports";
import { InfoAlert } from "@/app/clientExports";
import { PortalSource } from "../concepts";
import Image from "next/image";


export default async function Sources() {

    const scList = await getAllSources();
    const sources: PortalSource[] = [];
    for (let sc of scList) {
        sources.push(PortalSource.toObject(sc));
    }

    return (
        <div className="flex flex-col md:col-span-3 w-full">
            <InfoAlert
                title={""}
                body={
                    `
                The following Terminology Services are currently supported via the TS4NFDI API Gateway. For more information, please see:
                    <a href="https://ts4nfdi.github.io/api-gateway/" rel="noopener" target="_blank">API Gateway documentation</a>         
                `
                }
            />
            <div className="grid md:grid-cols-3 grid-cols-1 gap-4 w-full">

                {sources.map((source: PortalSource) => {
                    return (
                        <div className="card flex flex-col !p-8" key={source.title ? source.title : source.name}>
                            <div className="flex flex-row gap-2 mb-2" key="db-name">
                                <p className="header-4 inline-block">{source.title ? source.title : source.name}</p>
                            </div>
                            <div className="w-full p-4 m-2" key={'image'}
                                style={{ backgroundColor: source.logo_background_color }}>
                                <Image
                                    src={source.logo}
                                    width={source.logoW}
                                    height={source.logoH}
                                    alt={source.title}
                                    className="mx-auto"
                                />
                            </div>
                            <div className="flex items-center mt-2 mb-3" key="homepage-url">
                                <b className="me-2">Home Page:</b>
                                <a href={source.homePage} className="mt-1" target={"_blank"}>{source.homePage}</a>
                                <CopyToClipboard textToCopy={source.homePage} key="copy-url-homepage" />
                            </div>
                            <div className="flex items-center mt-2 mb-3" key="contact-url">
                                <b className="me-2">Contact:</b>
                                <a href={source.contactUrl} className="mt-1"
                                    target={"_blank"}>{source.contactUrl}</a>
                                <CopyToClipboard textToCopy={source.contactUrl} key="copy-url-contact" />
                            </div>
                            <div className="flex items-center mt-2" key="db-url">
                                <b className="me-2">API:</b>
                                <a href={source.url} className="mt-1" target={"_blank"}>{source.url}</a>
                                <CopyToClipboard textToCopy={source.url} key="copy-url" />
                            </div>
                            <div className="flex flex-row gap-2 mt-8 text-justify" key="db-type">
                                {source.description}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
