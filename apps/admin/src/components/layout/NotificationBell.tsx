"use client";

import { useState, useEffect, useRef } from "react";
import {
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Typography,
    Box,
    Divider,
    CircularProgress,
    Button
} from "@mui/material";
import { Notifications } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { tokens } from "@/lib/theme";

type Notification = {
    id: string;
    type: string;
    title: string;
    message: string;
    link: string;
    isRead: boolean;
    createdAt: string;
};

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/proxy/admin/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        pollingRef.current = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        setOpen(true);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setOpen(false);
    };

    const handleMarkAsRead = async (id: string, link?: string) => {
        try {
            await fetch(`/api/proxy/admin/notifications/${id}/read`, { method: "PUT" });
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            handleClose();
            if (link) {
                router.push(link);
            }
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const unreadCount = notifications.length;

    return (
        <>
            <IconButton color="inherit" onClick={handleClick}>
                <Badge badgeContent={unreadCount} color="warning">
                    <Notifications sx={{ color: tokens.colors.grey[600] }} />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        width: 320,
                        maxHeight: 480,
                        mt: 1.5,
                        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                        borderRadius: 2
                    }
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
                <Box sx={{ px: 2, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                        Notifications
                    </Typography>
                    <Button size="small" onClick={fetchNotifications} sx={{ minWidth: 0, p: 0.5 }}>
                        Refresh
                    </Button>
                </Box>
                <Divider />
                {notifications.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                            No new notifications
                        </Typography>
                    </Box>
                ) : (
                    notifications.map((notification) => (
                        <MenuItem
                            key={notification.id}
                            onClick={() => handleMarkAsRead(notification.id, notification.link)}
                            sx={{
                                flexDirection: "column",
                                alignItems: "flex-start",
                                gap: 0.5,
                                py: 1.5,
                                borderBottom: `1px solid ${tokens.colors.grey[100]}`,
                                whiteSpace: "normal"
                            }}
                        >
                            <Typography variant="subtitle2" fontWeight={600} color="primary.main">
                                {notification.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.80rem" }}>
                                {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>
                                {new Date(notification.createdAt).toLocaleString()}
                            </Typography>
                        </MenuItem>
                    ))
                )}
            </Menu>
        </>
    );
}
