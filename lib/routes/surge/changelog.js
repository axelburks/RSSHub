const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
  const type = ctx.params.type;
  const style = ctx.params.style;
  const url = type == 'beta' ? 'https://www.nssurge.com/mac/v5/appcast-signed-beta.xml' : 'https://www.nssurge.com/mac/v5/appcast-signed.xml';
  const title = type == 'beta' ? "Surge Mac Beta" : "Surge Mac Release";

  const response = await got({
    method: 'get',
    url,
  });

  const data = response.data.replace(/<!\[CDATA\[([\s\S]*?)\]\]>(?=\s*<)/gi, "$1");
  const $ = cheerio.load(data, { xmlMode: true });
  const list = $('item');

  ctx.state.data = {
    title: `${title}'s Changelog`,
    link: url,
    description: `${title}'s Changelog`,
    item:
      list &&
      list
        .map((index, item) => {
          const itemTitle = `${title} ${$('enclosure', item).attr('sparkle:shortVersionString')}.${$('enclosure', item).attr('sparkle:version')}`;
          let originalDes, description = "";

          if (style == "tghtml") {
            if ($('markdownDescription', item).text()) {
              originalDes = $('markdownDescription', item).text();
              originalDes = originalDes
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
              originalDes = originalDes
                .replace(/### (.+)/gi, "<b>$1</b>")
                .replace(/`(.+?)`/g, "<code>$1</code>");
            } else {
              originalDes = $('description', item).html().toString();
              originalDes = originalDes
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
              originalDes = originalDes
                .replace(/<h\d>(.+?)<\/h\d>/gi, "<b>$1</b>")
                .replace(/<li>(.+?)(<\/li>)?/gi, "- $1");
            }
            description = `<a href="${$('enclosure', item).attr('url')}">${itemTitle}</a>
${originalDes}`;

          } else {
            if ($('markdownDescription', item).text()) {
              originalDes = $('markdownDescription', item).text();
              originalDes = originalDes
                .replace(/### (.+)/gi, "<br><b>$1</b><br>")
                .replace(/`(.+?)`/g, "<code>$1</code><br>")
                .replace(/\* (.+)/gi, "- $1<br>");
            } else {
              originalDes = $('description', item).html().toString();
              originalDes = originalDes
                .replace(/<h4>(.+?)<\/h4>/gi, "<br><b>$1</b><br>")
                .replace(/<li>(.+?)(<\/li>)?/gi, "- $1<br>");
            }
            description = `➤ <a href="${$('enclosure', item).attr('url')}">${$('enclosure', item).attr('url')}</a><br>${originalDes}`;
          }

          return {
            title: itemTitle,
            description,
            link: $('enclosure', item).attr('url'),
            guid: $('enclosure', item).attr('url'),
          };
        })
        .get(),
  };
};
