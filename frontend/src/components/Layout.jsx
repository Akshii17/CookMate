import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Home, Heart, User, LogOut, Menu, Leaf, ChevronLeft } from "lucide-react";
import { googleLogout } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext.jsx";


const navItems = [
  { label: "Home", to: "/home", icon: Home },
  { label: "Favorites", to: "/favourites", icon: Heart },
  { label: "Profile", to: "/profile", icon: User },
];


function NavButton({ to, icon: Icon, label, collapsed }) {
  return (
    <NavLink
      to={to}
      end={to === "/home"}
      className={({ isActive }) =>
        `mb-0.5 flex w-full items-center border-none bg-transparent py-2.5 font-sans text-[13px] transition-colors ${collapsed ? "justify-center px-2" : "gap-2.5 px-3.5 text-left"
        } ${isActive
          ? "font-medium text-[#2a3218]"
          : "font-normal text-[#8a8470] hover:text-[#4a5038]"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="size-[18px] shrink-0" strokeWidth={isActive ? 2.2 : 1.7} />
          {!collapsed && label}
        </>
      )}
    </NavLink>
  );
}

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  const handleLogout = () => {
    googleLogout();
    logout();

    toast.success("Logged out successfully");

    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-cm-bg font-sans">
      <aside
        className={`fixed top-0 bottom-0 left-0 z-20 flex flex-col border-r-[1.5px] border-[#c4bea8] bg-cm-sidebar pt-7 transition-[width,padding] duration-300 ease-in-out ${sidebarCollapsed ? "w-16 px-2" : "w-48 px-4"
          }`}
      >
        <div
          className={`mb-8 flex shrink-0 ${sidebarCollapsed ? "justify-center" : "items-center justify-between gap-2"}`}
        >
          {sidebarCollapsed ? (
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Expand sidebar"
              className="flex items-center justify-center rounded-[10px] border-[1.5px] border-[#b4ad98] bg-transparent p-1.5 text-[#585e40] transition-colors hover:bg-[#d4d0bc]"
            >
              <Menu className="size-5 shrink-0" strokeWidth={1.7} />
            </button>
          ) : (
            <>
              <div className="flex min-w-0 items-center gap-2 font-display text-lg font-bold text-[#384820]">
                <Leaf className="size-[17px] shrink-0 text-[#789a56]" strokeWidth={1.5} />
                <span className="truncate">CookMate</span>
              </div>
              <button
                type="button"
                onClick={toggleSidebar}
                aria-label="Collapse sidebar"
                className="flex shrink-0 items-center justify-center rounded-[10px] border-[1.5px] border-[#b4ad98] bg-transparent p-1.5 text-[#585e40] transition-colors hover:bg-[#d4d0bc]"
              >
                <ChevronLeft className="size-5 shrink-0" strokeWidth={1.7} />
              </button>
            </>
          )}
        </div>

        {navItems.map((n) => (
          <NavButton key={n.to} {...n} collapsed={sidebarCollapsed} />
        ))}

        <div className="flex-1" />

        <div
          className={`mt-auto shrink-0 bg-[#c8d4a8] pt-3 pb-7 ${sidebarCollapsed ? "-mx-2 px-2" : "-mx-4 px-4"
            }`}
        >
          <NavLink
            to="/profile"
            aria-label="Your profile"
            className={`mb-2 flex w-full items-center ${sidebarCollapsed ? "justify-center" : "gap-2.5 px-1"}`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cm-olive text-sm font-medium text-[#eef0e2]">
              A
            </span>
            {!sidebarCollapsed && (
              <span className="font-sans text-[13px] font-medium text-[#2a3218]">Account</span>
            )}
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            className={`flex w-full items-center border-none bg-transparent py-2 font-sans text-[13px] text-[#6a6454] transition-colors hover:text-[#2a3218] ${sidebarCollapsed ? "justify-center px-0" : "gap-2.5 px-1 text-left"
              }`}
          >
            <LogOut className="size-[18px] shrink-0" strokeWidth={1.7} />
            {!sidebarCollapsed && "Logout"}
          </button>
        </div>
      </aside>

      <div
        className={`relative flex min-h-screen min-w-0 flex-1 flex-col transition-[padding] duration-300 ease-in-out ${sidebarCollapsed ? "pl-16" : "pl-48"
          }`}
      >
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
