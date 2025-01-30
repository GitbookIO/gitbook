# GitBook V2

# Middleware:

Goals:
- Route between dynamic and static routes
  - If a token is in the cookies => dynamic route
  - If a token is in the url => dynamic route
  - Else => static route
- High performances:
  - It should not rely on data fetching

# URLs to support:

Content URLs:

- `docs.company.com/page`
  - Middleware: rewrite to `/static/url/docs.company.com/page`
  - Page component renders the page
- `docs.company2.com/section/page`
  - Middleware: rewrite to `/static/url/docs.company2.com/section/page`
  - Page component renders the page
- `docs.company3.com/section/sitespace/page`
  - Middleware: rewrite to `/static/url/docs.company3.com/section/sitespace/page`
  - Page component renders the page

Content URLs (adaptive content or visitor authentication):

- `docs.company.com/page`
  - Middleware:
    - If a token is in the cookies or url => dynamic route
    - Else => rewrite to `/dynamic/url/docs.company.com/page`
  - Page component renders the page
    - Read the token from the url query params or cookies


PDF export URLs:

- `docs.company.com/page/~gitbook/pdf`
  - Middleware: rewrite to `/dynamic/pdf/docs.company.com/page`
  - Page component renders the page

Images resizing:

- `docs.company.com/~gitbook/image`
  - Middleware: rewrite to `/dynamic/image/docs.company.com`
  - Route handlers process the request

Preview URLs:

- `open.gitbook.com/sites/site_abc/page` (or `open.gitbook.com/~site/site_abc/page` to stay compatible?)
  - Middleware: no rewrite
  - Page component renders the page (dynamic?)
     - Read the token from the url query params
     - Read customizations override from the url query params


Space PDF URLs:

- `open.gitbook.com/spaces/space_abc/pdf`
  - Middleware: no rewrite
  - Page component renders the page (dynamic?)
     - Read the token from the url query params
     - Read customizations override from the url query params

Development:

- `localhost:3000/sites/site_abc/page`

# Routes:

- Content
    - [ ] `/static/url/[[...url]]/page.tsx`
    - [ ] `/dynamic/url/[[...url]]/page.tsx`
- Images resizing
    - [ ] `/dynamic/image/[hostname]/route.ts`
- PDF export
    - [ ] `/dynamic/pdf/[[...url]]/page.tsx`
    - [ ] `/spaces/[space]/pdf/page.tsx`

# Deployment

- Vercel
- Cloudflare with Opennext-js
