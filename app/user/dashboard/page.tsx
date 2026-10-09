import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { UserPrivacySection } from "@/app/clientExports";
import LoginFormWrapper from "../login/page";
import { getRequestLocale } from "@/app/libs/locale";
import { userPageMessages } from "../messages";
import OrcidProfile from "@/app/ui/user/orcidProfile";


export default async function UserDashboard() {
  const t = userPageMessages[await getRequestLocale()];
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return <LoginFormWrapper />;
  }

  return (
    <div className="md:col-span-3 row-span-1 content-panel">
      <p className="header-3 !mt-0">
        <b>{`${t.dashboard} (${session.user.username})`}</b>
      </p>
      <p>
        {t.dashboardIntro}
      </p>
      {session.user.orcid ? (
        <p>{t.orcid}: <a href={`https://orcid.org/${session.user.orcid}`} target="_blank" rel="noopener noreferrer">{session.user.orcid}</a></p>
      ) : <OrcidProfile />}
      <hr />
      <br />
      <UserPrivacySection />
    </div>
  );
}
