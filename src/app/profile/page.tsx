"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Sparkles, LogOut } from "lucide-react";
import NavigationTabs from "../../components/NavigationTabs";
import { logout } from "../../store/slices/authSlice";
import { Button } from "../../components/ui/button";

export default function ProfilePage() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!user) {
    return null;
  }

  const isDriver =
    user?.role?.name_en?.toLowerCase().includes("driver") || false;

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Welcome Banner - Always visible on profile page */}
      <motion.div
        className="p-3 pb-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="bg-gradient-to-br rounded-lg border border-primary-50 p-3 shadow-sm backdrop-blur-sm"
            whileHover={{
              boxShadow:
                "0 6px 20px -5px rgba(0, 0, 0, 0.1), 0 3px 8px -6px rgba(0, 0, 0, 0.1)",
              borderColor: "rgba(139, 69, 19, 0.4)",
              transition: { duration: 0.3 },
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Welcome Message */}
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <motion.div
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 shadow-md"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                  whileHover={{ scale: 1.15 }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </motion.div>
                <div className="flex flex-col">
                  <motion.h1
                    className="text-lg font-bold text-gray-900"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    {t("welcome")}, {user.first_name} {user.last_name}!
                  </motion.h1>
                  <motion.div
                    className="h-0.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  />
                </div>
              </motion.div>

              {/* User Details - ID and Role Only */}
              <motion.div
                className="flex gap-2 flex-shrink-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* User ID Badge */}
                <motion.div
                  className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg px-2 py-1.5 min-w-0 shadow-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  whileHover={{
                    scale: 1.05,
                    borderColor: "rgba(139, 69, 19, 0.4)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <motion.div
                      className="w-2 h-2 bg-emerald-500 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <span className="text-sm font-medium text-emerald-700">
                      {t("userId")}:
                    </span>
                    <span className="text-sm font-bold text-emerald-900">
                      {user.user_id}
                    </span>
                  </div>
                </motion.div>

                {/* Role Badge */}
                <motion.div
                  className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg px-2 py-1.5 min-w-0 shadow-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  whileHover={{
                    scale: 1.05,
                    borderColor: "rgba(139, 69, 19, 0.4)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <motion.div
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5,
                      }}
                    />
                    <span className="text-sm font-medium text-blue-700">
                      {t("role")}:
                    </span>
                    <span className="text-sm font-bold text-blue-900">
                      {locale === "ar" ? user.role.name_ar : user.role.name_en}
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <NavigationTabs activeTab="qualityCheckTickets" isDriver={isDriver} />

      <div className="pb-20 lg:pb-0">
        <div className="flex-1 p-3 pt-2 max-w-7xl mx-auto">
          {/* Logout Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleLogout}
              className="lg:w-auto w-full bg-primary-600 hover:bg-primary-700 text-white"
              size="lg"
            >
              <LogOut className="h-5 w-5 mr-2" />
              {t("logout")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
