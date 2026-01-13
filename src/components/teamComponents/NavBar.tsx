"use client";

import React, { Suspense, lazy } from 'react';
// lazy-load notifier to avoid circular runtime deps
const CallNotifier = lazy(() => import('./CallNotifier'));
import { NavLink, useNavigate } from "react-router-dom";
import { Users, Settings, UserPlus } from "lucide-react";
import logo from '../../assets/logo-clean.png'
import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";

export default function Navbar() {
    const linkClasses = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-2 px-2 py-1 rounded-md transition-colors ${
            isActive
                ? "bg-neutral-800 text-white"
                : "text-gray-100 hover:text-gray-300"
        }`;

    const navigate = useNavigate();

    return (
        <div className="border-b border-neutral-800 bg-neutral-900 text-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-6 py-3">
                {/* Logo */}
                <div className="flex items-center gap-2 text-lg font-semibold cursor-pointer" 
                    onClick={() => navigate("/home")}
                >
                    <img src={logo} alt="StudyFlow logo" className="h-6 w-auto" />
                    <span>StudyFlow</span>
                </div>

                {/* Menubar */}
                <Menubar className="bg-neutral-900 border-none">
                    <MenubarMenu>
                        <NavLink to="/study-teams" className={linkClasses}>
                            <MenubarTrigger className="flex items-center gap-2">
                                <Users className="h-4 w-4" /> Teams
                            </MenubarTrigger>
                        </NavLink>
                    </MenubarMenu>

                    <MenubarMenu>
                        <NavLink to="/friends" className={linkClasses}>
                            <MenubarTrigger className="flex items-center gap-2">
                                <UserPlus className="h-4 w-4" /> Friends
                            </MenubarTrigger>
                        </NavLink>
                    </MenubarMenu>

                    <MenubarMenu>
                        <NavLink to="/settings" className={linkClasses}>
                            <MenubarTrigger className="flex items-center gap-2">
                                <Settings className="h-4 w-4" /> Settings
                            </MenubarTrigger>
                        </NavLink>
                    </MenubarMenu>
                </Menubar>
                                {/* Global call notifier (shows incoming private call on any page) */}
                                <div>
                                    {typeof window !== 'undefined' && (
                                        <Suspense fallback={null}>
                                            <CallNotifier />
                                        </Suspense>
                                    )}
                                </div>
            </div>
        </div>
    );
}
