# ✨ Magic Login Form 

[![<MagicLabs>](https://circleci.com/gh/magiclabs/magic-js.svg?style=shield)](https://circleci.com/gh/magiclabs/magic-js)

> `pnp == plug n' play`: A lightweight connector that wraps Magic JS authentication with a beautiful, functional out-of-the-box login form.

<p align="center">
  <a href="https://github.com/magiclabs/magic-js/blob/master/packages/@magic-sdk/pnp/LICENSE">License</a> ·
  <a href="https://github.com/magiclabs/magic-js/blob/master/packages/@magic-sdk/pnp/CHANGELOG.md">Changelog</a> ·
  <a href="https://github.com/magiclabs/magic-js/blob/master/CONTRIBUTING.md">Contributing Guide</a>
</p>

## 📖 Documentation

See the [developer documentation](https://magic.link/docs/login-form) to learn how you can build with Magic Login Form in a matter of minutes.

## ⚡️ Quick Start (using `<script>` tags)

Sign up or log in to the [developer dashboard](https://dashboard.magic.link) to receive API keys that will allow your application to interact with Magic's authentication APIs.

1. Add the login form script

Create a new login page and add the script tag below. Your API key can be found on the Home page of your Magic Dashboard.

```html
<!-- /login.html -->
<script
  src="https://auth.magic.link/pnp/login"
  data-magic-publishable-api-key="[YOUR_PUBLISHABLE_API_KEY_HERE]"
  data-terms-of-service-uri="/path/to/your/terms-of-service"
  data-privacy-policy-uri="/path/to/your/privacy-policy"
  data-redirect-uri="/callback"> <!-- Replace with the location of your callback.html -->
</script>
```

This will generate a pre-built login form based on the branding and login methods you’ve enabled via Dashboard. Users will automatically be redirected to the URI provided in data-redirect-uri upon authorization. If no data-redirect-uri is specified, a relative path — /callback — is automatically used as a fallback.

2. Add the callback script

Next, create a page containing the script tag below to handle the authentication callback. 

```html
<!-- /callback.html -->
<script
  src="https://auth.magic.link/pnp/callback"
  data-magic-publishable-api-key="[YOUR_PUBLISHABLE_API_KEY_HERE]">
</script>
```

Voila!

_(Really, though, that's it!)_
