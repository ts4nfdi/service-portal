import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { UserPrivacySection } from "@/app/clientExports";
import LoginFormWrapper from "../login/page";
import { getRequestLocale } from "@/app/libs/locale";
import { userPageMessages } from "../messages";
import OrcidProfile from "@/app/ui/user/orcidProfile";
import { getUserOrcids } from "@/app/api/auth/orcid";
import { getUserRors } from "@/app/api/auth/ror";


export default async function UserDashboard() {
  const t = userPageMessages[await getRequestLocale()];
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return <LoginFormWrapper />;
  }
  const [orcids, rors] = session.user.token
    ? await Promise.all([getUserOrcids(session.user.token), getUserRors(session.user.token)])
    : [[], []];

  return (
    <div className="md:col-span-3 row-span-1 content-panel">
      <p className="header-3 !mt-0">
        <b>{`${t.dashboard} (${session.user.username})`}</b>
      </p>
      <p>
        {t.dashboardIntro}
      </p>
      <hr />
      <br />
      <p className="header-4">{t.userInfo}</p>
      <p>{t.username}: {session.user.username}</p>
      <OrcidProfile orcids={orcids} rors={rors} />
      <hr />
      <br />
      <UserPrivacySection />
    </div>
  );
}
