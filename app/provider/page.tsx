import { getAllProviders } from "@/app/api/actions/providers";
import { InfoAlert, ProviderList } from "@/app/clientExports";
import { PortalProvider } from "../concepts";

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
        body={`
                The following Terminology Services are currently supported via the TS4NFDI API Gateway. For more information, please see:
                    <a href="https://ts4nfdi.github.io/api-gateway/" rel="noopener" target="_blank">API Gateway documentation</a>         
                `}
      />
      <ProviderList
        providers={providers.map((provider) => provider.toJson())}
      />
    </div>
  );
}
