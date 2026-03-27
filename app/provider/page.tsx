import { getAllProviders } from "@/app/api/actions/providers";
import { CopyToClipboard } from "@/app/clientExports";
import { InfoAlert } from "@/app/clientExports";
import { PortalProvider } from "../concepts";
import Image from "next/image";


export default async function providers() {

  const sourcesList = await getAllProviders();
  const providers: PortalProvider[] = [];
  for (let source of sourcesList) {
    providers.push(PortalProvider.toObject(source));
  }
  // console.log(providers);

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

        {providers.map((provider: PortalProvider) => {
          return (
            <div className="card flex flex-col !p-8" key={provider.title ? provider.title : provider.name}>
              <div className="flex flex-row gap-2 mb-2" key="db-name">
                <p className="header-4 inline-block">{provider.title ? provider.title : provider.name}</p>
              </div>
              <div className="w-full p-4 m-2" key={'image'} style={{ backgroundColor: provider.logo_background_color }}>
                <Image
                  src={provider.logo}
                  width={provider.logoW}
                  height={provider.logoH}
                  alt={provider.title}
                  className="mx-auto"
                />
              </div>
              <div className="flex items-center mt-2 mb-3" key="homepage-url">
                <b className="me-2">Home Page:</b>
                <a href={provider.homePage} className="mt-1" target={"_blank"}>{provider.homePage}</a>
                <CopyToClipboard textToCopy={provider.homePage} key="copy-url-homepage" />
              </div>
              <div className="flex items-center mt-2 mb-3" key="contact-url">
                <b className="me-2">Contact:</b>
                <a href={provider.contactUrl} className="mt-1" target={"_blank"}>{provider.contactUrl}</a>
                <CopyToClipboard textToCopy={provider.contactUrl} key="copy-url-contact" />
              </div>
              <div className="flex items-center mt-2" key="db-url">
                <b className="me-2">API:</b>
                <a href={provider.url} className="mt-1" target={"_blank"}>{provider.url}</a>
                <CopyToClipboard textToCopy={provider.url} key="copy-url" />
              </div>
              <div className="flex flex-row gap-2 mt-8 text-justify" key="db-type">
                {provider.description}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
