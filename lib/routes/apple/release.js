const parser = require('@/utils/rss-parser');
const url = 'https://developer.apple.com/news/releases/rss/releases.rss';

module.exports = async (ctx) => {
    const feed = await parser.parseURL(url);
    const items = await Promise.all(
        feed.items.map(async (item) => {
            const single = {
                title: item.title,
                guid: item.title,
                link: item.link,
                description: item.description,
                pubDate: item.pubDate,
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: 'Releases - Apple Developer',
        link: 'https://developer.apple.com/news/',
        description: 'Apple Developer News and Updates feed provided by Apple, Inc.',
        item: items,
    };
};
