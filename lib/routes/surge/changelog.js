const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const url = type == 'beta' ? 'https://www.nssurge.com/mac/v3/appcast-signed-beta.xml' : 'https://www.nssurge.com/mac/v3/appcast-signed.xml';
    const title = type == 'beta' ? "Surge Mac Beta" : "Surge Mac";

    const response = await got({
        method: 'get',
        url: url,
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
                    const description = $('markdownDescription', item).text() ? `${$('markdownDescription', item).text().replace(/### (.+)/gi, "<br><b>$1</b><br>").replace(/\* (.+)/gi, "- $1<br>")}<br>Download: <a href="${$('enclosure', item).attr('url')}">${$('enclosure', item).attr('url')}</a>` : `${$('description', item).html().toString().replace(/<h4>(.+)<\/h4>/gi, "<br><b>$1</b><br>").replace(/<li>(.+)(<\/li>)?/gi, "- $1<br>")}<br>Download: <a href="${$('enclosure', item).attr('url')}">${$('enclosure', item).attr('url')}</a>`;
                    return {
                        title: `${title} ${$('enclosure', item).attr('sparkle:shortVersionString')}.${$('enclosure', item).attr('sparkle:version')}`,
                        description: description,
                        link: $('enclosure', item).attr('url'),
                    };
                })
                .get(),
    };
};
