# Moving tobie.io to zerobie.com

This package holds two folders:

- `zerobie-website/` - the full website, renamed to ZEROBiE, for https://zerobie.com
- `tobie-io-redirect/` - a tiny site that sends every tobie.io link to the same page on zerobie.com

## 1. Put the new website on GitHub

1. Open github.com/zerobim/tobie-website -> Settings -> General. Rename the repository to `zerobie-website`.
   (GitHub forwards the old repository address automatically.)
2. In the repository, delete these old files (an upload does not delete anything):
   `assets/brand/tobie-logo-dark.svg`, `assets/brand/tobie-logo-light.svg`,
   `assets/brand/tobie-mark-dark.svg`, `assets/brand/tobie-mark-light.svg`.
3. Upload everything inside `zerobie-website/` (Add file -> Upload files), replacing the existing files. Commit.
   The `CNAME` file now says `zerobie.com`.

## 2. Verify zerobie.com for the organisation (protects against domain takeover)

1. github.com/organizations/zerobim/settings/pages -> Add a domain -> `zerobie.com`.
2. GitHub shows a TXT record. Add it at your domain registrar exactly as shown
   (name `_github-pages-challenge-zerobim`, value as given). Click Verify once it resolves.

## 3. Point zerobie.com at GitHub Pages (DNS at your registrar)

| Type | Name | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |
| CNAME | www | zerobim.github.io |

Delete any parking-page or forwarding records the registrar created for zerobie.com.

No email is sent from zerobie.com, so lock it against spoofing:

| Type | Name | Value |
|---|---|---|
| TXT | @ | `v=spf1 -all` |
| TXT | _dmarc | `v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s;` |

## 4. Switch the repository to the new domain

1. zerobie-website -> Settings -> Pages. Custom domain: `zerobie.com` -> Save.
2. Wait for "DNS check successful" (minutes to a few hours), then tick **Enforce HTTPS**.
3. Test: https://zerobie.com, https://www.zerobie.com (should land on zerobie.com), and the
   Legal, Privacy and Cookie pages.

## 5. Keep tobie.io working (after step 4, never before)

1. Create a new public repository `zerobim/tobie-io-redirect`. Upload the contents of `tobie-io-redirect/`
   (`index.html`, `404.html`, `CNAME`, `.nojekyll`, `README.md`).
2. Settings -> Pages -> deploy from the `main` branch. Custom domain: `tobie.io`. Enforce HTTPS.
   The tobie.io DNS at GoDaddy already points at GitHub Pages, so nothing changes there.
3. Test https://tobie.io and https://tobie.io/privacy.html - both should open zerobie.com.
4. Keep tobie.io registered for at least a year.

## 6. Search and the rest

- Google Search Console: add `zerobie.com` as a Domain property (DNS TXT), submit
  `https://zerobie.com/sitemap.xml`.
- The digital office already links to https://zerobie.com (separate office package).
- Still to update elsewhere: the TOBiE button and logo on zerobim.eu, LinkedIn and other social profiles
  (brand kit folder `02-social`), email signatures, and anything printed.
