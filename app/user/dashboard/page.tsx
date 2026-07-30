import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { UserPrivacySection } from "@/app/clientExports";
import LoginFormWrapper from "../login/page";
import { getRequestLocale } from "@/app/libs/locale";
import { userPageMessages } from "../messages";


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
      <hr />
      <br />
      <UserPrivacySection />
    </div>
  );
}
