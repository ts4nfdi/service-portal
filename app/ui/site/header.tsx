import NavBarOptions, { NavBarOptionsMobile } from "./navbar";
import UserProfileMenu from "../user/profileMenu";
import HamburgerBtn from "./hamburgerBtn";
import './styles.css';

export default function Header() {

  return (
    <nav className="bg-ts4nfdi-brand-color md:min-h-[70px] min-h-[120px]" key={"site-header"}>
      <div className="mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between" key={"1"}>
          <NavBarOptions key={"navbar"} />
          <UserProfileMenu key={"user-menu"} />
        </div>
        <HamburgerBtn />
      </div>
      <NavBarOptionsMobile />
    </nav >

  );
}
