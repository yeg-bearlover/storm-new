# Legal information for publication

The portfolio has five information pages: Privacy, Business details, Cookies,
Accessibility, and Enquiries & commissions. The footer links to them on every
route, including the 404 page. Contact links to privacy information before the
visitor writes an enquiry.

## Confirmed setup

- Storm Nijhuis is the named contact, based in Amsterdam, Netherlands.
- Vercel hosts the website; GitHub maintains the source repository and deployment
  integration. Browsing the website does not request images or fonts from GitHub.
- The public contact email is a Gmail address. The notice identifies Google as
  the email provider without assuming a Google Workspace contract.
- The portfolio code has no cookies, local/session storage, analytics, tracking
  pixels, social embeds, ordering form or checkout. The upcoming film uses stills.
- Vercel's deployment configuration restricts scripts and network connections to
  this origin and blocks iframes. It also suppresses outgoing referrers and sets
  basic security headers. This does not determine how Vercel processes requests
  on its infrastructure or override project-level routing/settings.

## Details the owner must supply

Edit `src/legal.js` with verified information:

1. Registered business name, trading name and KVK number. If Storm does not yet
   operate a registered business, confirm that status and revise the business
   page and publication validation to describe it accurately.
2. The business address, or confirmation that its visiting address is shielded
   in the Dutch Business Register. Do not publish an unconfirmed private address.
3. Whether VAT identification applies; if it does, use the public `btw-id`, not
   the private turnover tax number containing a sole trader's BSN.
4. Enquiry retention. Twelve months after the last contact for enquiries that
   do not become commissions is a proposed policy, not a claim about current
   Gmail deletion. Confirm the policy and put it into practice in the mailbox.
5. The log types, retention and security features actually enabled for the Vercel
   project, including any log drains or third-party monitoring recipients.
6. The transfer arrangements applicable to the actual Vercel and Google accounts,
   and how someone can obtain the relevant safeguards. Review applicable data
   processing terms; do not assume that a personal Gmail account has the same
   contractual protections as Google Workspace.
7. Verify the live deployment's cookies, storage and network requests, including
   any injected analytics, Speed Insights, security challenges and project-level
   routing. Set `deploymentPrivacyVerified` only after this review.

The relevant pages show draft notices while these fields are incomplete. Run:

```sh
pnpm build
pnpm check:publication
```

The build remains available for reviewing drafts. `check:publication` exits with
a list of missing information until it is supplied. A successful check confirms
that the fields are present and registration numbers have the expected format;
it does not verify account settings, registrations or legal compliance.

## Maintaining the notices

Update `legal.updated` when the notices change. The displayed date is derived
from that value. If providers, processing or retention change, update the page
copy and confirm that actual practices match it.

Optional tracking currently has no consent interface because it is absent. If
it is added, update the disclosures and provide prior, purpose-specific consent,
equally accessible rejection and easy withdrawal before loading it. Adapt the
Content Security Policy deliberately. Cookie-free analytics can still process
personal data and must be assessed. A YouTube privacy-enhanced URL alone is not
a substitute for that assessment or consent where required.

The Accessibility page describes available controls, known image-description
limitations and help by email. WCAG 2.2 AA is a target; no independent
conformance audit has been claimed. Review the complete experience with keyboard,
screen reader, magnification and reduced motion, including the downloadable CV.
The European Accessibility Act applies to specified services, not every private
portfolio. Reassess scope if consumer e-commerce or other covered services are
introduced, including the exemption for microenterprises providing services.

The Enquiries & commissions page is general information. For an actual consumer
distance contract, including one agreed by email, provide the specific mandatory
pre-contract information, total price, cancellation instructions and model
withdrawal form where required before acceptance, and confirm the contract on a
durable medium. Assess custom-made goods and early-started services separately.
If online ordering is added, implement the applicable checkout, delivery,
guarantee and withdrawal requirements for the products and service involved.

## Sources reviewed on 9 October 2026

- [EU website privacy guidance](https://europa.eu/youreurope/business/growing/digitalising/securing-website/index_en.htm)
- [Dutch business identification requirements](https://business.gov.nl/regulations/rules-business-correspondence/)
- [Dutch cookie guidance](https://autoriteitpersoonsgegevens.nl/themas/internet-slimme-apparaten/cookies/heldere-en-misleidende-cookiebanners)
- [European Accessibility Act](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX%3A32019L0882)
- [EU consumer distance contracts](https://europa.eu/youreurope/business/selling-in-eu/selling-goods-services/ecommerce-distance-selling/index_en.htm)
- [Vercel privacy notice](https://vercel.com/legal/privacy-notice)
- [Vercel data processing addendum](https://vercel.com/legal/dpa)
- [Vercel security headers](https://vercel.com/docs/cdn-security/security-headers)
- [Google privacy policy](https://policies.google.com/privacy)
- [GitHub privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement)
