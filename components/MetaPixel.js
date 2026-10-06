import Script from "next/script";

// ID do Meta Pixel (Facebook/Instagram Ads) desta loja.
const PIXEL_ID = "2298809294201137";

// Pixel de rastreamento para campanhas no Facebook/Instagram Ads.
// Carregado com next/script (estratégia "afterInteractive"): o script oficial
// recomenda <head>, mas essa estratégia é a indicada pelo Next.js para
// scripts de analytics/ads — ele baixa logo após a página ficar interativa,
// sem atrasar a primeira renderização. Renderizado uma vez no layout raiz
// (app/layout.js), então vale para todas as páginas do site, inclusive /admin.
export default function MetaPixel() {
  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          alt=""
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
