const dotenv = require("dotenv");

dotenv.config();

const emailVerifyTemplate = ({ user_id, first_name, last_name }) => {
  return `
  <!DOCTYPE html
  PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

<head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <!--[if (mso 16)]>
    <style type="text/css">
    a {text-decoration: none;}
    </style>
    <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
<xml>
    <o:OfficeDocumentSettings>
    <o:AllowPNG></o:AllowPNG>
    <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
</xml>
<![endif]--><!--[if !mso]><!-- -->
  <link href="https://fonts.googleapis.com/css?family=Roboto:400,400i,700,700i" rel="stylesheet"><!--<![endif]-->
  <style type="text/css">
    #outlook a {
      padding: 0;
    }

    .es-button {
      mso-style-priority: 100 !important;
      text-decoration: none !important;
    }

    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }

    .es-desk-hidden {
      display: none;
      float: left;
      overflow: hidden;
      width: 0;
      max-height: 0;
      line-height: 0;
      mso-hide: all;
    }

    @media only screen and (max-width:600px) {

      p,
      ul li,
      ol li,
      a {
        line-height: 150% !important
      }

      h1,
      h2,
      h3,
      h1 a,
      h2 a,
      h3 a {
        line-height: 120%
      }

      h1 {
        font-size: 36px !important;
        text-align: left
      }

      h2 {
        font-size: 26px !important;
        text-align: left
      }

      h3 {
        font-size: 20px !important;
        text-align: left
      }

      .es-header-body h1 a,
      .es-content-body h1 a,
      .es-footer-body h1 a {
        font-size: 36px !important;
        text-align: left
      }

      .es-header-body h2 a,
      .es-content-body h2 a,
      .es-footer-body h2 a {
        font-size: 26px !important;
        text-align: left
      }

      .es-header-body h3 a,
      .es-content-body h3 a,
      .es-footer-body h3 a {
        font-size: 20px !important;
        text-align: left
      }

      .es-menu td a {
        font-size: 12px !important
      }

      .es-header-body p,
      .es-header-body ul li,
      .es-header-body ol li,
      .es-header-body a {
        font-size: 14px !important
      }

      .es-content-body p,
      .es-content-body ul li,
      .es-content-body ol li,
      .es-content-body a {
        font-size: 16px !important
      }

      .es-footer-body p,
      .es-footer-body ul li,
      .es-footer-body ol li,
      .es-footer-body a {
        font-size: 14px !important
      }

      .es-infoblock p,
      .es-infoblock ul li,
      .es-infoblock ol li,
      .es-infoblock a {
        font-size: 12px !important
      }

      *[class="gmail-fix"] {
        display: none !important
      }

      .es-m-txt-c,
      .es-m-txt-c h1,
      .es-m-txt-c h2,
      .es-m-txt-c h3 {
        text-align: center !important
      }

      .es-m-txt-r,
      .es-m-txt-r h1,
      .es-m-txt-r h2,
      .es-m-txt-r h3 {
        text-align: right !important
      }

      .es-m-txt-l,
      .es-m-txt-l h1,
      .es-m-txt-l h2,
      .es-m-txt-l h3 {
        text-align: left !important
      }

      .es-m-txt-r img,
      .es-m-txt-c img,
      .es-m-txt-l img {
        display: inline !important
      }

      .es-button-border {
        display: inline-block !important
      }

      a.es-button,
      button.es-button {
        font-size: 20px !important;
        display: inline-block !important
      }

      .es-adaptive table,
      .es-left,
      .es-right {
        width: 100% !important
      }

      .es-content table,
      .es-header table,
      .es-footer table,
      .es-content,
      .es-footer,
      .es-header {
        width: 100% !important;
        max-width: 600px !important
      }

      .es-adapt-td {
        display: block !important;
        width: 100% !important
      }

      .adapt-img {
        width: 100% !important;
        height: auto !important
      }

      .es-m-p0 {
        padding: 0 !important
      }

      .es-m-p0r {
        padding-right: 0 !important
      }

      .es-m-p0l {
        padding-left: 0 !important
      }

      .es-m-p0t {
        padding-top: 0 !important
      }

      .es-m-p0b {
        padding-bottom: 0 !important
      }

      .es-m-p20b {
        padding-bottom: 20px !important
      }

      .es-mobile-hidden,
      .es-hidden {
        display: none !important
      }

      tr.es-desk-hidden,
      td.es-desk-hidden,
      table.es-desk-hidden {
        width: auto !important;
        overflow: visible !important;
        float: none !important;
        max-height: inherit !important;
        line-height: inherit !important
      }

      tr.es-desk-hidden {
        display: table-row !important
      }

      table.es-desk-hidden {
        display: table !important
      }

      td.es-desk-menu-hidden {
        display: table-cell !important
      }

      .es-menu td {
        width: 1% !important
      }

      table.es-table-not-adapt,
      .esd-block-html table {
        width: auto !important
      }

      table.es-social {
        display: inline-block !important
      }

      table.es-social td {
        display: inline-block !important
      }

      .es-m-p5 {
        padding: 5px !important
      }

      .es-m-p5t {
        padding-top: 5px !important
      }

      .es-m-p5b {
        padding-bottom: 5px !important
      }

      .es-m-p5r {
        padding-right: 5px !important
      }

      .es-m-p5l {
        padding-left: 5px !important
      }

      .es-m-p10 {
        padding: 10px !important
      }

      .es-m-p10t {
        padding-top: 10px !important
      }

      .es-m-p10b {
        padding-bottom: 10px !important
      }

      .es-m-p10r {
        padding-right: 10px !important
      }

      .es-m-p10l {
        padding-left: 10px !important
      }

      .es-m-p15 {
        padding: 15px !important
      }

      .es-m-p15t {
        padding-top: 15px !important
      }

      .es-m-p15b {
        padding-bottom: 15px !important
      }

      .es-m-p15r {
        padding-right: 15px !important
      }

      .es-m-p15l {
        padding-left: 15px !important
      }

      .es-m-p20 {
        padding: 20px !important
      }

      .es-m-p20t {
        padding-top: 20px !important
      }

      .es-m-p20r {
        padding-right: 20px !important
      }

      .es-m-p20l {
        padding-left: 20px !important
      }

      .es-m-p25 {
        padding: 25px !important
      }

      .es-m-p25t {
        padding-top: 25px !important
      }

      .es-m-p25b {
        padding-bottom: 25px !important
      }

      .es-m-p25r {
        padding-right: 25px !important
      }

      .es-m-p25l {
        padding-left: 25px !important
      }

      .es-m-p30 {
        padding: 30px !important
      }

      .es-m-p30t {
        padding-top: 30px !important
      }

      .es-m-p30b {
        padding-bottom: 30px !important
      }

      .es-m-p30r {
        padding-right: 30px !important
      }

      .es-m-p30l {
        padding-left: 30px !important
      }

      .es-m-p35 {
        padding: 35px !important
      }

      .es-m-p35t {
        padding-top: 35px !important
      }

      .es-m-p35b {
        padding-bottom: 35px !important
      }

      .es-m-p35r {
        padding-right: 35px !important
      }

      .es-m-p35l {
        padding-left: 35px !important
      }

      .es-m-p40 {
        padding: 40px !important
      }

      .es-m-p40t {
        padding-top: 40px !important
      }

      .es-m-p40b {
        padding-bottom: 40px !important
      }

      .es-m-p40r {
        padding-right: 40px !important
      }

      .es-m-p40l {
        padding-left: 40px !important
      }

      .es-desk-hidden {
        display: table-row !important;
        width: auto !important;
        overflow: visible !important;
        max-height: inherit !important
      }

      .h-auto {
        height: auto !important
      }
    }

    @media screen and (max-width:384px) {
      .mail-message-content {
        width: 414px !important
      }
    }
  </style>
</head>

<body
  style="width:100%;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
  <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#FAFAFA"><!--[if gte mso 9]>
			<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
				<v:fill type="tile" color="#fafafa"></v:fill>
			</v:background>
		<![endif]-->
    <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" role="none"
      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#FAFAFA">
      <tr>
        <td valign="top" style="padding:0;Margin:0">
          <table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none"
            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
            <tr>
              <td class="es-info-area" align="center" style="padding:0;Margin:0">
                <table class="es-content-body" align="center" cellpadding="0" cellspacing="0"
                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px"
                  bgcolor="#FFFFFF" role="none">
                  <tr>
                    <td align="left" style="padding:20px;Margin:0">
                      <table cellpadding="0" cellspacing="0" width="100%" role="none"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr>
                          <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                            <table cellpadding="0" cellspacing="0" width="100%" role="none"
                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                              <tr>
                                <td align="center" style="padding:0;Margin:0;display:none"></td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table cellpadding="0" cellspacing="0" class="es-header" align="center" role="none"
            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
            <tr>
              <td align="center" style="padding:0;Margin:0">
                <table bgcolor="#ffffff" class="es-header-body" align="center" cellpadding="0" cellspacing="0"
                  role="none"
                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px">
                  <tr>
                    <td align="left"
                      style="Margin:0;padding-top:10px;padding-bottom:10px;padding-left:20px;padding-right:20px">
                      <table cellpadding="0" cellspacing="0" width="100%" role="none"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr>
                          <td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:560px">
                            <table cellpadding="0" cellspacing="0" width="100%" role="none"
                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                              <tr>
                                <td align="center" style="padding:0;Margin:0;display:none"></td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none"
            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
            <tr>
              <td align="center" style="padding:0;Margin:0">
                <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0"
                  role="none"
                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
                  <tr>
                    <td align="left"
                      style="Margin:0;padding-bottom:10px;padding-left:20px;padding-right:20px;padding-top:30px">
                      <table cellpadding="0" cellspacing="0" width="100%" role="none"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr>
                          <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                            <table cellpadding="0" cellspacing="0" width="100%" role="presentation"
                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                              <tr>
                                <td align="center" style="padding:0;Margin:0;font-size:0px"><img class="adapt-img"
                                    src="https://femjufo.stripocdn.email/content/guids/CABINET_a5b8da6752b4ed714425abac01a0163f8b516555fb854eeaf12971d8be096ff3/images/logobanner.png"
                                    alt
                                    style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"
                                    width="560"></td>
                              </tr>
                              <tr>
                                <td align="center"
                                  style="padding:0;Margin:0;padding-top:10px;padding-bottom:10px;font-size:0px"><img
                                    src="https://femjufo.stripocdn.email/content/guids/CABINET_a3448362093fd4087f87ff42df4565c1/images/78501618239341906.png"
                                    alt
                                    style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"
                                    width="100"></td>
                              </tr>
                              <tr>
                                <td align="center" class="es-m-txt-c" style="padding:0;Margin:0;padding-bottom:10px">
                                  <h1
                                    style="Margin:0;line-height:46px;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:46px;font-style:normal;font-weight:bold;color:#333333">
                                    Your email has been verified</h1>
                                </td>
                              </tr>
                              <tr>
                                <td align="center" class="es-m-p0r es-m-p0l"
                                  style="Margin:0;padding-top:5px;padding-bottom:5px;padding-left:40px;padding-right:40px">
                                  <p
                                    style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;color:#333333;font-size:14px">
                                    Thank you for using our service. Click here to go to verify page and verify your
                                    acount!
                                  </p>
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="left"
                      style="Margin:0;padding-top:10px;padding-bottom:10px;padding-left:20px;padding-right:20px">
                      <table cellpadding="0" cellspacing="0" width="100%" role="none"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr>
                          <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                            <table cellpadding="0" cellspacing="0" width="100%"
                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-left:2px dashed #cccccc;border-right:2px dashed #cccccc;border-top:2px dashed #cccccc;border-bottom:2px dashed #cccccc;border-radius:5px"
                              role="presentation">
                              <tr>
                                <td align="center" class="es-m-txt-c"
                                  style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px">
                                  <h2
                                    style="Margin:0;line-height:31px;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:26px;font-style:normal;font-weight:bold;color:#333333">
                                    Hello, ${first_name} ${last_name}
                                  </h2>
                                </td>
                              </tr>
                              <tr>
                                <td align="left" style="padding:0;Margin:0">
                                  <p
                                    style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;color:#333333;font-size:14px">
                                    <br>
                                  </p>
                                </td>
                              </tr>
                              <tr>
                                <td align="center" class="es-m-txt-c"
                                  style="Margin:0;padding-top:10px;padding-bottom:20px;padding-left:20px;padding-right:20px">
                                  <h1
                                    style="Margin:0;line-height:40px;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:26px;font-style:normal;font-weight:bold;color:#333333">
                                    <a href="${process.env.ENDPOINT}/api/users/verify-account?id=${user_id}">
                                      Click here to verify account
                                    </a>
                                  </h1>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="left"
                      style="padding:0;Margin:0;padding-left:20px;padding-right:20px;padding-bottom:30px">
                      <table cellpadding="0" cellspacing="0" width="100%" role="none"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr>
                          <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                            <table cellpadding="0" cellspacing="0" width="100%"
                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-radius:5px"
                              role="presentation">
                              <tr>
                                <td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:10px"><span
                                    class="es-button-border"
                                    style="border-style:solid;border-color:#2CB543;background:#333333;border-width:0px;display:inline-block;border-radius:6px;width:auto"><a
                                      href="" class="es-button" target="_blank"
                                      style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:20px;padding:10px 30px 10px 30px;display:inline-block;background:#333333;border-radius:6px;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-weight:normal;font-style:normal;line-height:24px;width:auto;text-align:center;mso-padding-alt:0;mso-border-alt:10px solid #333333;padding-left:30px;padding-right:30px">Go
                                      to sign in page</a></span></td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table cellpadding="0" cellspacing="0" class="es-footer" align="center" role="none"
            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
            <tr>
              <td align="center" style="padding:0;Margin:0">
                <table class="es-footer-body" align="center" cellpadding="0" cellspacing="0"
                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:640px"
                  role="none">
                  <tr>
                    <td align="left"
                      style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px">
                      <table cellpadding="0" cellspacing="0" width="100%" role="none"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr>
                          <td align="left" style="padding:0;Margin:0;width:600px">
                            <table cellpadding="0" cellspacing="0" width="100%" role="presentation"
                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                              <tr>
                                <td align="center"
                                  style="padding:0;Margin:0;padding-top:15px;padding-bottom:15px;font-size:0">
                                  <table cellpadding="0" cellspacing="0" class="es-table-not-adapt es-social"
                                    role="presentation"
                                    style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                    <tr>
                                      <td align="center" valign="top" style="padding:0;Margin:0;padding-right:40px"><img
                                          title="Facebook"
                                          src="https://femjufo.stripocdn.email/content/assets/img/social-icons/logo-black/facebook-logo-black.png"
                                          alt="Fb" width="32"
                                          style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic">
                                      </td>
                                      <td align="center" valign="top" style="padding:0;Margin:0;padding-right:40px"><img
                                          title="Twitter"
                                          src="https://femjufo.stripocdn.email/content/assets/img/social-icons/logo-black/twitter-logo-black.png"
                                          alt="Tw" width="32"
                                          style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic">
                                      </td>
                                      <td align="center" valign="top" style="padding:0;Margin:0;padding-right:40px"><img
                                          title="Instagram"
                                          src="https://femjufo.stripocdn.email/content/assets/img/social-icons/logo-black/instagram-logo-black.png"
                                          alt="Inst" width="32"
                                          style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic">
                                      </td>
                                      <td align="center" valign="top" style="padding:0;Margin:0"><img title="Youtube"
                                          src="https://femjufo.stripocdn.email/content/assets/img/social-icons/logo-black/youtube-logo-black.png"
                                          alt="Yt" width="32"
                                          style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic">
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td align="center" style="padding:0;Margin:0;padding-bottom:35px">
                                  <p
                                    style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:18px;color:#333333;font-size:12px">
                                    SoulDev © 2024&nbsp;</p>
                                  <p
                                    style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:18px;color:#333333;font-size:12px">
                                    12 District, HCMC, Vietnam<br></p>
                                  <p
                                    style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:18px;color:#333333;font-size:12px">
                                  </p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:0;Margin:0">
                                  <table cellpadding="0" cellspacing="0" width="100%" class="es-menu"
                                    role="presentation"
                                    style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                    <tr class="links">
                                      <td align="center" valign="top" width="33.33%"
                                        style="Margin:0;padding-left:5px;padding-right:5px;padding-top:5px;padding-bottom:5px;border:0">
                                        <a target="_blank" href=""
                                          style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;display:block;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;color:#999999;font-size:12px">Visit
                                          Us </a>
                                      </td>
                                      <td align="center" valign="top" width="33.33%"
                                        style="Margin:0;padding-left:5px;padding-right:5px;padding-top:5px;padding-bottom:5px;border:0;border-left:1px solid #cccccc">
                                        <a target="_blank" href=""
                                          style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;display:block;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;color:#999999;font-size:12px">Privacy
                                          Policy</a>
                                      </td>
                                      <td align="center" valign="top" width="33.33%"
                                        style="Margin:0;padding-left:5px;padding-right:5px;padding-top:5px;padding-bottom:5px;border:0;border-left:1px solid #cccccc">
                                        <a target="_blank" href=""
                                          style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;display:block;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;color:#999999;font-size:12px">Terms
                                          of Use</a>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none"
            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
            <tr>
              <td class="es-info-area" align="center" style="padding:0;Margin:0">
                <table class="es-content-body" align="center" cellpadding="0" cellspacing="0"
                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px"
                  bgcolor="#FFFFFF" role="none">
                  <tr>
                    <td align="left" style="padding:20px;Margin:0">
                      <table cellpadding="0" cellspacing="0" width="100%" role="none"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr>
                          <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                            <table cellpadding="0" cellspacing="0" width="100%" role="presentation"
                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                              <tr>
                                <td align="center" class="es-infoblock"
                                  style="padding:0;Margin:0;line-height:14px;font-size:12px;color:#CCCCCC">
                                  <p
                                    style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:14px;color:#CCCCCC;font-size:12px">
                                    <br>
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>

</html>

  `;
};

const emailResetPasswordTemplate = ({ token, first_name, last_name }) => {
  return `<!DOCTYPE html>
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
                  
                  <head>
                    <title>
                    </title>
                    <!--[if !mso]><!-->
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <!--<![endif]-->
                    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style type="text/css">
                      #outlook a {
                        padding: 0;
                      }
                  
                      body {
                        margin: 0;
                        padding: 0;
                        -webkit-text-size-adjust: 100%;
                        -ms-text-size-adjust: 100%;
                      }
                  
                      table,
                      td {
                        border-collapse: collapse;
                        mso-table-lspace: 0pt;
                        mso-table-rspace: 0pt;
                      }
                  
                      img {
                        border: 0;
                        height: auto;
                        line-height: 100%;
                        outline: none;
                        text-decoration: none;
                        -ms-interpolation-mode: bicubic;
                      }
                  
                      p {
                        display: block;
                        margin: 13px 0;
                      }
                    </style>
                    <!--[if mso]>
                          <noscript>
                          <xml>
                          <o:OfficeDocumentSettings>
                            <o:AllowPNG/>
                            <o:PixelsPerInch>96</o:PixelsPerInch>
                          </o:OfficeDocumentSettings>
                          </xml>
                          </noscript>
                          <![endif]-->
                    <!--[if lte mso 11]>
                          <style type="text/css">
                            .mj-outlook-group-fix { width:100% !important; }
                          </style>
                          <![endif]-->
                    <style type="text/css">
                      @media only screen and (min-width:480px) {
                        .mj-column-per-100 {
                          width: 100% !important;
                          max-width: 100%;
                        }
                      }
                    </style>
                    <style media="screen and (min-width:480px)">
                      .moz-text-html .mj-column-per-100 {
                        width: 100% !important;
                        max-width: 100%;
                      }
                    </style>
                    <style type="text/css">
                      @media only screen and (max-width:480px) {
                        table.mj-full-width-mobile {
  width: 100% !important;
                        }
                  
                        td.mj-full-width-mobile {
                          width: auto !important;
                        }
                      }
                    </style>
                  </head>
                  
                  <body style="word-spacing:normal;background-color:#F4F4F4;">
                    <div style="background-color:#F4F4F4;">
                      <div style="background:#000000;background-color:#000000;margin:0px auto;max-width:600px;">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#000000;background-color:#000000;width:100%;">
                          <tbody>
                            <tr>
                              <td style="direction:ltr;font-size:0px;padding:0 0 0 0;text-align:center;">
                                <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                    <tbody>
                                      <tr>
                                        <td align="center" style="font-size:0px;padding:0px 25px;padding-right:0px;padding-bottom:0px;padding-left:0px;word-break:break-word;">
                                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                                            <tbody>
                                              <tr>
                                                <td style="width:600px;">
                                                  <img height="auto" src="https://femjufo.stripocdn.email/content/guids/CABINET_a3448362093fd4087f87ff42df4565c1/images/78501618239341906.png" style="border:none;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" title="" width="600" />
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div style="background:#F5F3F2;background-color:#F5F3F2;margin:0px auto;max-width:600px;">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#F5F3F2;background-color:#F5F3F2;width:100%;">
                          <tbody>
                            <tr>
                              <td style="direction:ltr;font-size:0px;padding:0 0 0 0;text-align:center;">
                                <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                    <tbody>
                                      <tr>
                                        <td align="left" style="font-size:0px;padding:10px 25px;padding-top:25px;padding-bottom:5px;word-break:break-word;">
                                          <div style="font-family:Arial, sans-serif;font-size:13px;line-height:22px;text-align:left;color:#55575D;">
                                            <p style="line-height: 60px; text-align: center; margin: 10px 0;font-size:30px;color:#716864;font-family:'Times New Roman',Helvetica,Arial,sans-serif"><b>XIN CHÀO, ${first_name} ${last_name}</b></p>
                                          </div>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td align="left" style="font-size:0px;padding:10px 25px;padding-top:0px;padding-bottom:20px;word-break:break-word;">
                                          <div style="font-family:Arial, sans-serif;font-size:13px;line-height:22px;text-align:left;color:#55575D;">
                                            <p style="line-height: 30px; text-align: center; margin: 10px 0;color:#000000;font-size:22px;font-family:'Times New Roman',Helvetica,Arial,sans-serif"><b>Cảm ơn bạn vì đã sử dụng thương hiệu của chúng tôi</b><br /><span style="color:#000000;font-style:italic;font-size:18px;font-family:'Times New Roman',Helvetica,Arial,sans-serif">Vui lòng bấm vào link dưới đây để hoàn tất quá trình xác thực tài khoản</span></p>
                                          </div>
                                        </td>
                                      </tr>
                                    </tbody>
  </table>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div style="background:#32435F;background-color:#32435F;margin:0px auto;max-width:600px;">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#32435F;background-color:#32435F;width:100%;">
                          <tbody>
                            <tr>
                              <td style="direction:ltr;font-size:0px;padding:0 0 0 0;padding-bottom:40px;text-align:center;">
                                <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                    <tbody>
                                      <tr>
                                        <td align="center" vertical-align="middle" style="font-size:0px;padding:50px 25px;padding-bottom:30px;word-break:break-word;">
                                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;line-height:100%;">
                                            <tr>
                                              <td align="center" bgcolor="#32435F" role="presentation" style="border:none;border-radius:3px;cursor:auto;mso-padding-alt:10px 25px;background:#32435F;" valign="middle">
                                                <p style="display:inline-block;background:#32435F;color:#ffffff;font-family:Times New Roman, Helvetica, Arial, sans-serif;font-size:18px;font-weight:normal;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:10px 25px;mso-padding-alt:0px;border-radius:3px;">
                                                  <span style="color:#FFFFFF;font-weight:bold;font-size:30px">
                                                    <a href="${process.env.CLIENT_URL}/auth/reset-password/${token}">Reset Password</a>
                                                  </span>
                                                </p>
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
  </table>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </body>
                  
                  </html>`;
};

module.exports = {
  emailVerifyTemplate,
  emailResetPasswordTemplate,
};
