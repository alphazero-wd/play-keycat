import Image from "next/image";

const LightThemeLogo = () => (
  <Image
    src="/logos/light-logo.svg"
    alt="Light theme logo"
    className="hidden md:block dark:md:hidden"
    width={128}
    height={48}
  />
);

const DarkThemeLogo = () => (
  <Image
    src="/logos/dark-logo.svg"
    className="hidden dark:md:block"
    alt="Dark theme logo"
    width={128}
    height={48}
  />
);

const MobileLogo = () => (
  <Image
    src="/logos/mobile-logo.svg"
    className="md:hidden"
    alt="Mobile logo"
    width={48}
    height={48}
  />
);
export const Logo = () => (
  <>
    <DarkThemeLogo />
    <LightThemeLogo />
    <MobileLogo />
  </>
);
