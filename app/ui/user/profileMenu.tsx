import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { getServerSession } from "next-auth";
import UserProfileMenuItems from "./profileMenuItems";
import Link from "next/link";
import "./styles.css";
import { getCodeUrl } from "@/app/libs/authUrl";

export default async function UserProfileMenu() {
  const session = await getServerSession(authOptions);

  if (!session?.user.token) {
    return (
      <>
        <div className="flex items-center space-x-6 rtl:space-x-reverse pt-2">
          <Link
            href={getCodeUrl()}
            className="btn !bg-[#F8F8F8] !text-[#445669]"
          >
            Login
          </Link>
        </div>
      </>
    );
  }

  return (
    <UserProfileMenuItems
      username={session?.user.username}
      email={session?.user.email}
    />
  );
}
