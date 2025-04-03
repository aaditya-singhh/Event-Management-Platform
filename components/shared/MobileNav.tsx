import React from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"
import { Separator } from '@radix-ui/react-separator'
import NavItems from "./NavItems"
  

const MobileNav = () => {
  return (
    <nav className="md:hidden">
        <Sheet>
            <SheetTrigger className="align-middle">
                <img
                    src="/assets/icons/menu.svg"
                    alt="menu"
                    width={24}
                    height={24}
                    className="cursor-pointer"
                />
            </SheetTrigger>
            <SheetContent className="flex flex-col gap-6 bg-white">
                <img
                    src="/assets/images/logo.svg"
                    alt="logo"
                    width={128}
                    height={38}
                />
                <Separator className="border border-gray-50"/>
                <NavItems/>
            </SheetContent>
        </Sheet>

    </nav>
  )
}

export default MobileNav