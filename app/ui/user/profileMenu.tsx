import {authOptions} from "@/app/api/auth/[...nextauth]/authOptions";
import {getServerSession} from "next-auth";
import UserProfileMenuItems from "./profileMenuItems";
import Link from "next/link";
import './style.css';


export default async function UserProfileMenu() {

    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return (
            <>
                <div className="flex items-center space-x-6 rtl:space-x-reverse pt-2">
                    <Link href="/api/auth/signin" className="btn !bg-[#F8F8F8] !text-[#445669]">Login</Link>
                </div>
            </>
        );
    }

    return (
        <UserProfileMenuItems username={session?.user.username} email={session?.user.email}/>
    );
}





