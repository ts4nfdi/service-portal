import { getAllDatabases } from "@/app/api/actions/databases";
import { CopyToClipboard } from "@/app/clientExports";
import { InfoAlert } from "@/app/clientExports";
import { PortalDatabase } from "../concepts";
import Image from "next/image";


export default async function Databases() {

  const dbList = await getAllDatabases();
  const databases: PortalDatabase[] = [];
  for (let db of dbList) {
    databases.push(PortalDatabase.toObject(db));
  }
  // console.log(databases);

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

        {databases.map((database: PortalDatabase) => {
          return (
            <div className="card flex flex-col !p-8" key={database.title ? database.title : database.name}>
              <div className="flex flex-row gap-2 mb-2" key="db-name">
                <p className="header-4 inline-block">{database.title ? database.title : database.name}</p>
              </div>
              <div className="w-full p-4 m-2" key={'image'} style={{ backgroundColor: database.logo_background_color }}>
                <Image
                  src={database.logo}
                  width={database.logoW}
                  height={database.logoH}
                  alt={database.title}
                  className="mx-auto"
                />
              </div>
              <div className="flex items-center mt-2 mb-3" key="homepage-url">
                <b className="me-2">Home Page:</b>
                <a href={database.homePage} className="mt-1" target={"_blank"}>{database.homePage}</a>
                <CopyToClipboard textToCopy={database.homePage} key="copy-url-homepage" />
              </div>
              <div className="flex items-center mt-2 mb-3" key="contact-url">
                <b className="me-2">Contact:</b>
                <a href={database.contactUrl} className="mt-1" target={"_blank"}>{database.contactUrl}</a>
                <CopyToClipboard textToCopy={database.contactUrl} key="copy-url-contact" />
              </div>
              <div className="flex items-center mt-2" key="db-url">
                <b className="me-2">API:</b>
                <a href={database.url} className="mt-1" target={"_blank"}>{database.url}</a>
                <CopyToClipboard textToCopy={database.url} key="copy-url" />
              </div>
              <div className="flex flex-row gap-2 mt-8 text-justify" key="db-type">
                {database.description}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}