(function($){
    $.fn.picasaGallery = function( options ) {

        var settings = $.extend({
            'user': 'default',
            'thumb_size':'150'
        }, options);

        var $parent = this;

        var api_url = '//picasaweb.google.com/data/feed/api/user/'
                        + settings.user +
                        '?alt=json-in-script';

        var api_args = '&access=visible&thumbsize='
                        + settings.thumb_size+'c&callback=?';

        var gallery_cache = [];

        var album_cache = {};

        var $back_item = $('<li>')
            .append(
                $('<a>')
                    .attr('href','#')
            ).text('<- Back')
            .bind(function(event){
                event.preventDefault;
                getGallery()
            })

        function renderNav(album){
            if ($parent.children('.picasaGalleryNav').length < 1){
                var $nav = $('<ul>',{
                    'class': 'picasaGalleryNav',
                    }).append(
                        $('<li>').html(
                            $('<a>')
                                .attr('href','#')
                                .text('Gallery')
                                .bind('click',function(event){
                                    event.preventDefault;
                                    getGallery()
                                })
                        )
                    ).prependTo($parent)
            } else if (album) {
                $('.picasaGalleryNav')
                    .append(
                        $('<li>')
                            .text(album.title.$t)
                    )
            } else {
                $('.picasaGalleryNav li:nth-child(2)')
                    .remove()
            }
        }

        function renderPage(items){
            var $ul = $('.picasaGallery')
            $ul.children('li').detach();
            $.each(items, function(i,item){
                item.appendTo($ul);
            })
        }

        function getImage(image){
            var $dialog = $('<div>')
                .attr('title',image.title.$t);
            $('<img>')
                .attr('src',image.content.src)
                .appendTo($dialog)
                .bind('load',function(){
                    $dialog.dialog({
                        autoOpen: true,
                        width: 'auto',
                        resizable: false,
                        draggable: false,
                        modal: true,
                        close: function(){
                            $(this).remove();
                        }
                    })
                })
        }

        function getAlbum(album){
            var album_url = album.link[0].href
            if (!album_cache[album_url]){
                album_cache[album_url] = [];
                $.getJSON(album_url+api_args,function(data){
                    $.each(data.feed.entry,function(i,item){
                        var title = item.title.$t
                        var thumb_url = item.media$group.media$thumbnail[0].url
                        var $item = $('<li>')
                            .hide()
                            .append(
                                $('<img>')
                                    .attr('src',thumb_url)
                                    .bind('load',function(){
                                        $item.show()
                                    })
                            ).append(
                                $('<span>')
                                    .text(title)
                            ).bind('click',function(){
                                getImage(item)
                            })
                        album_cache[album_url].push($item)
                    })
                    renderNav(album)
                    renderPage(album_cache[album_url])
                })
            } else {
                renderNav(album)
                renderPage(album_cache[album_url])
            }
        }

        function getGallery(){
            if (gallery_cache.length < 1){
                $.getJSON(api_url+api_args+'&kind=album',function(data){
                    $.each(data.feed.entry,function(i,item){
                        var title = item.title.$t
                        var thumb_url = item.media$group.media$thumbnail[0].url
                        var $item = $('<li>')
                            .hide()
                            .append(
                                $('<img>')
                                    .attr('src',thumb_url)
                                    .bind('load',function(){
                                        $item.show()
                                    })
                            ).append(
                                $('<span>')
                                    .text(title)
                            ).bind('click',function(){
                                getAlbum(item)
                            })
                        gallery_cache.push($item)
                    })
                    var $ul = $('<ul>',{
                        'class': 'picasaGallery',
                        }).appendTo($parent)
                    renderNav()
                    renderPage(gallery_cache)
                })
            } else {
                renderNav()
                renderPage(gallery_cache)
            }
        }

        getGallery()

        return this

    }
})(jQuery)
