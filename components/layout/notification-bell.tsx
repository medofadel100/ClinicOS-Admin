"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { markNotificationRead } from "@/app/actions/notifications";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";

type NotificationRecipient = {
  id: string;
  read_at: string | null;
  notifications: {
    id: string;
    title: string;
    body: string;
    link_url: string | null;
    created_at: string;
  }
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecipient[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchNotifications = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
  
      const { data: admin } = await supabase
        .from("platform_admins")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();
  
      if (!admin) return;
  
      // Fetch the 10 most recent notifications for this admin
      const { data, error } = await supabase
        .from("notification_recipients")
        .select(`
          id,
          read_at,
          notifications (
            id,
            title,
            body,
            link_url,
            created_at
          )
        `)
        .eq("admin_id", admin.id)
        .order("created_at", { ascending: false })
        .limit(10);
  
      if (error) {
        console.error(error);
        return;
      }
  
      const recs = data as unknown as NotificationRecipient[];
      setNotifications(recs);
      setUnreadCount(recs.filter(r => !r.read_at).length);
    };

    fetchNotifications();

    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (recipient: NotificationRecipient) => {
    // If unread, mark as read
    if (!recipient.read_at) {
      // Optimistic update
      setNotifications(prev => prev.map(n => n.id === recipient.id ? { ...n, read_at: new Date().toISOString() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      await markNotificationRead(recipient.id);
    }

    // Navigate if there is a link
    if (recipient.notifications.link_url) {
      router.push(recipient.notifications.link_url);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
          <div className="p-3 border-b border-slate-100 font-semibold text-sm flex justify-between items-center">
            {t("notifications") || "Notifications"}
            {unreadCount > 0 && (
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {unreadCount} {t("unread") || "unread"}
              </span>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                {t("noNotifications") || "No notifications yet."}
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((rec) => (
                  <button
                    key={rec.id}
                    onClick={() => handleNotificationClick(rec)}
                    className={`text-left p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                      !rec.read_at ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-sm font-medium ${!rec.read_at ? 'text-slate-900' : 'text-slate-700'}`}>
                        {rec.notifications.title}
                      </span>
                      {!rec.read_at && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5"></span>
                      )}
                    </div>
                    <p className={`text-xs mb-2 line-clamp-2 ${!rec.read_at ? 'text-slate-700' : 'text-slate-500'}`}>
                      {rec.notifications.body}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rec.notifications.created_at).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="p-2 border-t border-slate-100 text-center">
            <button 
              onClick={() => { setIsOpen(true); }}
              className="text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              {t("refreshNew") || "Refresh to see new"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
