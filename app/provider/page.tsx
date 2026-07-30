import { getAllProviders } from "@/app/api/actions/providers";
import { InfoAlert, ProviderList } from "@/app/clientExports";
import { PortalProvider } from "../concepts";
import { getRequestLocale } from "../libs/locale";
import { providerMessages } from "./messages";

export default async function providers() {
  const locale = await getRequestLocale();
  const t = providerMessages[locale];
  const sourcesList = await getAllProviders(locale);
  const providers: PortalProvider[] = [];
  for (let source of sourcesList) {
    providers.push(PortalProvider.toObject(source));
  }
  // console.log(providers);

  return (
    <div className="flex flex-col md:col-span-3 w-full">
      <InfoAlert
        title={""}
        body={t.intro}
      />
      <ProviderList
        providers={providers.map((provider) => provider.toJson())}
      />
    </div>
  );
}
