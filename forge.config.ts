import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { MakerDMG } from "@electron-forge/maker-dmg";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";

const config: ForgeConfig = {
  packagerConfig: {
    executableName: "code-ask",
    name: "CodeAsk",
    asar: true,
    icon: './images/icons/logo',
    win32metadata: {
      FileDescription: "CodeAsk - Your Code Assistant",
      ProductName: "CodeAsk",
    }
  },
  rebuildConfig: {},
  makers: [
    new MakerZIP({}, ['darwin', 'linux']),
    new MakerDMG({
      format: 'ULFO'
    }),
    new MakerDeb({
      options: {
        bin: "code-ask",
        name: "code-ask",
        productName: "CodeAsk",
        genericName: "Code Assistant",
        categories: ["Development"],
        icon: './images/icons/logo.png'
      }
    }),
    new MakerRpm({
      options: {
        bin: "code-ask",
        name: "code-ask",
        productName: "CodeAsk",
        genericName: "Code Assistant",
        categories: ["Development"],
        icon: './images/icons/logo.png'
      }
    })
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: "src/main.ts",
          config: "vite.main.config.ts",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.ts",
        },
      ],
      renderer: [{
        name: 'main_window',
        config: 'vite.renderer.config.ts',
      }],
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
