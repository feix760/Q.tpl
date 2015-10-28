var HTML_BLOCK = 'article, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section, summary'
  , INLINE = 'button, a, abbr, acronym, audio, b , basefont, bdo, big, br, canvas, cite, code, command, datalist, dfn, em, embed, font, i, img, input, keygen, kbd, label, mark, meter, output, progress, q, rp, rt, ruby, s, samp, select, small, span, strike, strong, sub, sup, textarea, time, tt, u, var, video, wbr'
  , BLOCK = 'head, title, meta, html, body, script, link, li, address, article, aside, blockquote, center, dir, div, dd, details, dl, dt, fieldset, figcaption, figure, form, footer, frameset, h1, h2, h3, h4, h5, h6, hr, header, hgroup, isindex, menu, nav, noframes, noscript, ol, p, pre, section, summary, ul'
  , W3CTAG = function () {
    var res = {};
    [HTML_BLOCK, INLINE, BLOCK]
      .join(', ').split(', ').forEach(function (tagName) {
        res[tagName] = true;
      });
    return res;
  }();

exports.isCustom = function(name) {
    return !W3CTAG[name];
};

