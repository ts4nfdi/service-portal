import {getAllDatabases} from "@/app/api/actions/databases";
import {Database} from "@/app/api/actions/types";
import {DatabaseIcon} from "@/app/ui/commons/icons";
import {CopyToClipboard} from "@/app/clientExports";
import {InfoAlert} from "@/app/clientExports";


export default async function Databases() {

    const databases = await getAllDatabases();

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

                {databases.map((database: Database) => {
                    return (
                        <div className="card flex flex-col" key={database.name}>
                            <div className="flex flex-row gap-2 mb-2" key="db-name">
                                <DatabaseIcon/>
                                <p className="header-4 inline-block">{database.name}</p>
                            </div>
                            <div className="flex flex-row gap-2 mb-3" key="db-type">
                                <b>Type:</b>
                                {database.type}
                            </div>
                            <div className="flex items-center" key="db-url">
                                <b>URL:</b>
                                {database.url}
                                <CopyToClipboard textToCopy={database.url} key="copy-url"/>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}