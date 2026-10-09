import sources from "../lib/imageSources.json";
export default function Artwork({ src, loading = "lazy", sizes = "(max-width: 700px) 90vw, 640px", ...props }) {
  const image = src?.startsWith("/images/") ? sources[src.slice(8)] : null;
  return <img {...props} src={image?.src || src} srcSet={image?.srcSet} sizes={image ? sizes : undefined} width={image?.width} height={image?.height} loading={loading} decoding="async" />;
}
