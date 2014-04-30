/* global $, _ */

function FlickrPost(options) {
    'use strict';

    this.options = options || {};
    this.options.data = options.data || {};

    this.author = this.options.data.author || null;
    this.authorId = this.options.data.author_id || null;
    this.dateTaken = this.options.data.date_taken || null;
    this.description = this.options.data.description || null;
    this.url = this.options.data.link || null;
    this.imageUrl = this.options.data.media ? this.options.data.media.m : null;
    this.published = this.options.data.published || null;
    if (this.published) {
        this.published = Date.parse(this.published);
    }
    this.tags = this.options.data.tags === '' ? [] : this.options.data.tags.split(/\s+/);
    this.title = this.options.data.title || null;
}

function FlickrFeedReader(options) {
    'use strict';

    var self = this;

    this.options = options || {};

    this.updateInterval = this.options.updateInterval || 5000;
    this.autoUpdateTemplate = this.options.autoUpdateTemplate || false;
    this.templateUrl = this.options.templateUrl || 'post.html';
    this.flickrTag = this.options.flickTag || 'kitten';
    this.flickrBaseUrl =
        this.options.flickBaseUrl ||
        'https://api.flickr.com/services/feeds/photos_public.gne?format=json&jsoncallback=?&tags=';
    this.parent = $(this.options.parentSelector || 'body');
    this.template = null;
    this.posts = [];

    this.update();
    setInterval(function () {
        self.update();
    }, this.updateInterval);
}

FlickrFeedReader.prototype.updateTemplate = function (callback) {
    'use strict';

    var self = this;

    $.get(this.templateUrl, function (html) {
        self.template = _.template(html);
        callback();
    });
};

FlickrFeedReader.prototype.update = function () {
    'use strict';

    var self = this;

    function getData(callback) {
        $.getJSON(self.flickrBaseUrl + self.flickrTag, function (data) {
            if (data && Array.isArray(data.items)) {
                self.posts = data.items.map(function (item) {
                    return new FlickrPost({ data: item });
                });
            }

            callback();
        });
    }

    if (!this.template || this.autoUpdateTemplate) {
        this.updateTemplate(function () {
            getData(function () { self.render(); });
        });
    } else {
        getData(function () { self.render(); });
    }
};

FlickrFeedReader.prototype.render = function () {
    'use strict';

    var self = this,
        feedList = $('<div>');

    this.posts.forEach(function (post) {
        feedList.append(self.template(post));
    });

    this.parent.empty().append(feedList);
};
