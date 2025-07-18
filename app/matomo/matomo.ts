export function createMatomoScript(): string {
    return `
           let _paq = window._paq = window._paq || [];
          _paq.push(['trackPageView']);
          _paq.push(['enableLinkTracking']);
          var u = '${process.env.NEXT_PUBLIC_MATOMO_TRACKER_URL}';
            _paq.push(['setTrackerUrl', u + 'matomo.php']);
            _paq.push(['setSiteId', '${process.env.NEXT_PUBLIC_MATOMO_TRACKER_ID}']);
            var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
            g.async = true; g.src = u + 'matomo.js'; s.parentNode.insertBefore(g, s);
          `;
}


