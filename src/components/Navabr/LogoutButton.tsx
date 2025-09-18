"use client";

import { useTranslations } from "next-intl";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { logout } from "../../store/slices/authSlice";
import { Button } from "../ui/button";

export default function LogoutButton() {
  const t = useTranslations();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <Button
      onClick={handleLogout}
      variant="ghost"
      size="icon"
      title={t("logout") || "Logout"}
      aria-label={t("logout") || "Logout"}
    >
      <ArrowLeftStartOnRectangleIcon className="h-6 w-6" />
    </Button>
  );
}
