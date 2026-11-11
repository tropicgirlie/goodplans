import Artwork from "./Artwork";

// Keep one wordmark across the home, workspace and invitation headers.
export default function BrandLogo() {
  return <>
    <Artwork className="brand-mark" src="/images/good-plans-mark.png" alt="" />
    <span className="brand-wordmark">us & about</span>
  </>;
}
