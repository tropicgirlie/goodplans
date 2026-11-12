import Artwork from "./Artwork";

// Keep one wordmark across the home, workspace and invitation headers.
export default function BrandLogo() {
  return <>
    <Artwork className="brand-mark" src="/images/good-plans-mark.png" alt="" />
    <span className="brand-wordmark" role="img" aria-label="Us & About">
      <span aria-hidden="true">us</span>
      <svg className="brand-ampersand" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M21 21C17.2 18 7.5 11.4 7.5 6.7C7.5 4.4 9.2 2.8 11.8 2.8C14 2.8 15.4 4.1 15.4 5.9C15.4 10.8 3.5 11.1 3.5 16.5C3.5 19.3 5.8 21.2 9.1 21.2C14.6 21.2 18.5 16.6 20.5 11.8"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span aria-hidden="true">about</span>
    </span>
  </>;
}
