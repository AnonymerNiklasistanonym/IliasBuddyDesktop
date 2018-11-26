export namespace IliasPrivateRssFeed {
    interface WholeThingDeclarationAttributes {
        version: string;
        encoding: string;
    }
    interface WholeThingDeclaration {
        _attributes: WholeThingDeclarationAttributes;
    }
    interface WholeThingRssAttributes {
        version: string;
    }
    interface WholeThingRssChannel {
        title: {
            _text: string;
        };
        link: {
            _text: string;
        };
        item: WholeThingRssChannelItem[];
    }
    export interface WholeThingRssChannelItem {
        title: {
            _text: string;
        };
        link: {
            _text: string;
        };
        description: {
            _text: string;
        };
        pubDate: {
            _text: string;
        };
        guid: {
            _text: string;
        };
    }
    interface WholeThingRss {
        _attributes: WholeThingRssAttributes;
        channel: WholeThingRssChannel;
    }
    export interface WholeThing {
        _declaration: WholeThingDeclaration;
        rss: WholeThingRss;
    }
}
