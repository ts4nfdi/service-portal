import { getAllDatabases, getListOfRegistriesFromBartoc } from "@/app/api/actions/databases";
import { DatabaseIcon } from "@/app/ui/commons/icons";
import { CopyToClipboard } from "@/app/clientExports";
import { InfoAlert } from "@/app/clientExports";
import { PortalDatabase } from "../concepts";


export default async function Databases() {

  const dbList = await getAllDatabases();
  const databases: PortalDatabase[] = [];
  for (let db of dbList) {
    databases.push(PortalDatabase.toObject(db));
  }
  console.log(databases);

  return (
    <div className="flex flex-col md:col-span-3 w-full">
      <InfoAlert
        title={""}
        body={
          `
                The following backends are currently supported via the TS4NFDI API Gateway. For more information, please see:
                    <a href="https://ts4nfdi.github.io/api-gateway/" rel="noopener" target="_blank">API Gateway documentation</a>         
                `
        }
      />
      <div className="grid md:grid-cols-3 grid-cols-1 gap-4 w-full">

        {databases.map((database: PortalDatabase) => {
          return (
            <div className="card flex flex-col !p-8" key={database.title ? database.title : database.name}>
              {database.name}
              <div className="flex flex-row gap-2 mb-2" key="db-name">
                <DatabaseIcon />
                <p className="header-4 inline-block">{database.title ? database.title : database.name}</p>
              </div>

              <div className="flex flex-row gap-2 mb-3" key="db-type">
                <b>Type:</b>
                {database.type}
              </div>
              <div className="flex items-center" key="db-url">
                <b>URL:</b>
                {database.url}
                <CopyToClipboard textToCopy={database.url} key="copy-url" />
              </div>
              <div className="flex items-center mt-2 mb-3" key="bartoc-url">
                <b>Bartoc:</b>
                {database.bartocUrl}
                <CopyToClipboard textToCopy={database.bartocUrl} key="copy-url-bartoc" />
              </div>
              <hr />
              <div className="flex flex-row gap-2 mt-2 text-justify" key="db-type">
                {database.description}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}