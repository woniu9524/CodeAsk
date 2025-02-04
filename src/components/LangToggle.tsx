import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Globe } from "lucide-react";
import langs from "@/localization/langs";
import { useTranslation } from "react-i18next";
import { setAppLanguage } from "@/helpers/language_helpers";
import { cn } from "@/utils/tailwind";
export default function LangToggle() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const currentLangData = langs.find((l) => l.key === currentLang);

  function onValueChange(value: string) {
    setAppLanguage(value, i18n);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 w-8 px-0"
        >
          <Globe className="h-4 w-4" />
          <span className="ml-2 text-xs">{currentLangData?.prefix}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        className="w-[150px] animate-in slide-in-from-top-2"
      >
        {langs.map((lang) => (
          <DropdownMenuItem
            key={lang.key}
            onClick={() => onValueChange(lang.key)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              currentLang === lang.key && "bg-accent"
            )}
          >
            <span className="text-base">{lang.prefix}</span>
            <span className="text-sm">{lang.nativeName}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
