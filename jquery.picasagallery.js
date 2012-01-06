(function($){
    $.fn.picasaGallery = function( options ) {

        var settings = $.extend({
            'user': 'default',
            'thumb_size':'150',
            'show_nav': true
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

        function renderBack(){
            var $ul = $('ul.picasaGallery')
            var dummy_img = $ul.children('li:first').children('img').attr('src')
            $ul.prepend(
                $('<li>')
                    .addClass('back')
                    .bind('click',function(event){
                        getGallery()
                    })
                    .append(
                        $('<img>')
                            .attr('src',dummy_img)
                            .css('opacity','0.0')
                    ).append(
                        $('<span>')
                            .text('<- Back')
                    )
            )
        }

        function renderNav(title){
            if (settings.show_nav == true){
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
                } else if (title) {
                    $('.picasaGalleryNav')
                        .append(
                            $('<li>')
                                .text(title)
                        )
                } else {
                    $('.picasaGalleryNav li:nth-child(2)')
                        .remove()
                }
            } else if (title){
                renderBack()
            }
        }

        function renderPage(items){
            var $ul = $('.picasaGallery')
            $ul.children('li').detach()
            $.each(items, function(i,item){
                item.appendTo($ul);
            })
        }

        function getImage(url,title){
            var $dialog = $('<div>')
                .attr('title',title);
            $('<img>')
                .attr('src',url)
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

        function getAlbum(url,title){
            if (!album_cache[url]){
                album_cache[url] = [];
                $.getJSON(url+api_args,function(data){
                    $.each(data.feed.entry,function(i,item){
                        var title = item.title.$t
                        var thumb_url = item.media$group.media$thumbnail[0].url
                        var image_url = item.content.src
                        var $item = $('<li>')
                            .hide()
                            .addClass('thumb')
                            .append(
                                $('<img>')
                                    .attr('src',thumb_url)
                                    .bind('load',function(){
                                        $item.show()
                                    })
                            ).append(
                                $('<span>')
                                    .text(title)
                            ).data({
                                'type': 'image',
                                'title': title,
                                'url': image_url
                            })
                        album_cache[url].push($item)
                    })
                    renderPage(album_cache[url])
                    renderNav(title)
                })
            } else {
                renderPage(album_cache[url])
                renderNav(title)
            }
        }

        function getGallery(){
            if (gallery_cache.length < 1){
                $.getJSON(api_url+api_args+'&kind=album',function(data){
                    $.each(data.feed.entry,function(i,item){
                        var title = item.title.$t
                        var thumb_url = item.media$group.media$thumbnail[0].url
                        var album_url = item.link[0].href
                        var $item = $('<li>')
                            .hide()
                            .addClass('thumb')
                            .append(
                                $('<img>')
                                    .attr('src',thumb_url)
                                    .bind('load',function(){
                                        $item.show()
                                    })
                            ).append(
                                $('<span>')
                                    .text(title)
                            )
                            .data({
                                'type': 'album',
                                'title': title,
                                'url': album_url
                            })
                        gallery_cache.push($item)
                    })
                    var $ul = $('<ul>',{
                        'class': 'picasaGallery',
                        }).appendTo($parent)
                    renderPage(gallery_cache)
                    renderNav()
                    $('ul.picasaGallery').on('click','li',function(){
                        var type = $(this).data()['type']
                        var title = $(this).data()['title']
                        var url = $(this).data()['url']
                        if (type == 'album'){
                            getAlbum(url,title)
                        } else if (type == 'image'){
                            getImage(url,title)
                        }
                    })
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
