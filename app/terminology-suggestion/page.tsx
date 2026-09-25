import { getPublicCollectionList, getUserCollectionList } from "@/app/api/actions/collections";
import { ActionResponse } from "@/app/api/actions/types";
import { PortalCollectionJsonData } from "@/app/concepts";
import { getUserToken } from "@/app/libs/auth";
import LoginFormWrapper from "@/app/user/login/page";
import TerminologySuggestion from "./terminologySuggestion";

export default async function TerminologySuggestionPage() {
  const token = await getUserToken();
  if (!token && process.env.NEXT_DEBUG_MODE !== "true") {
    return <LoginFormWrapper />;
  }
  const publicResponse: ActionResponse = await getPublicCollectionList();
  const userResponse: ActionResponse = await getUserCollectionList();
  const collections = [
    ...(publicResponse.status ? publicResponse.content : []),
    ...(userResponse.status ? userResponse.content : []),
  ] as PortalCollectionJsonData[];
  const uniqueCollections = Array.from(
    new Map(collections.map((collection) => [collection.id, collection])).values(),
  );

  return (
    <div className="relative md:col-span-3 content-panel">
      <TerminologySuggestion collections={uniqueCollections} />
    </div>
  );
}
