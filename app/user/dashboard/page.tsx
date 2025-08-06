import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/authOptions";
import {notFound} from "next/navigation";
import {UserPrivacySection} from "@/app/user/dashboard/clientExports";


export default async function UserDashboard() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        notFound();
    }

    return (
        <div className="md:col-span-3 row-span-1 content-panel">
            <p className="header-3 !mt-0">
                <b>{`Dashboard (${session.user.username})`}</b>
            </p>
            <p>
                {"View your account details and configure global settings for your profile here."}
            </p>
            <hr/>
            <br/>
            <UserPrivacySection/>
        </div>
    );
}
