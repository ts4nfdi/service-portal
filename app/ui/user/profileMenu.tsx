import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { getServerSession } from "next-auth";
import UserProfileMenuItems from "./profileMenuItems";
import "./styles.css";
import { getCodeUrl } from "@/app/libs/authUrl";
import LoginButton from "./loginButton";

export default async function UserProfileMenu() {
  const session = await getServerSession(authOptions);

  if (!session?.user.token) {
    return (
      <>
        <div className="flex items-center space-x-6 rtl:space-x-reverse pt-2">
          <LoginButton href={getCodeUrl()} />
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
