import React from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  NavigationMenu as NavigationMenuBase,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";

export default function NavigationMenu() {
  const { t } = useTranslation();

  return (
    <NavigationMenuBase className="px-2 font-mono text-muted-foreground">
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link to="/">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              {t("titleHomePage")}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/second-page">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              {t("titleSecondPage")}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenuBase>
  );
}
