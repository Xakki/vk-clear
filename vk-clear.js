function forgetVk() {
    var pBox;
    var init = function() {
        if (confirm('Удалить все фото из альбома?'))
            albumsDelete();
        // Todo - удаление отмеченных фото
        return;
        // TODO диалоговое окно для запроса и отображение статуса
        var сt = 'Тут кнопочки удаления';
        pBox = new MessageBox({
            title: 'Удаление данных из ВК'
        }).content(сt).setButtons('Кнопка', function(btn) {
            alert('Что то делаем');
        }, getLang("global_cancel"), r).show();
        return;
    };


    // Albumdelete
    var albumsDelete = function() {
        // кликаем назад в альбом
        if (!ge('photos_container_albums'))
            clickToMainAlbum();
        // Ожидаем что это страница альбомов
        var it = setInterval(function() {
            if (!ge('photos_container_albums')) return waiter(it);
            clearInterval(it);
            // покажем больше альбомов и ждем загрузки
            photos.loadMoreButtonClick('albums');
            var it2 = setInterval(function() {
                var mb = ge('ui_albums_load_more');
                if (mb && mb.getAttribute('style')==='') return waiter(it2);
                clearInterval(it2);
                //Выбираем все альбомы и удаляем по одному
                var d = geByClass("_photos_album");
                for (var i = 0; i < d.length; i++) {
                    if (albumDeleteItem(d[i])) {
                        return true;
                    }
                }
                console.log('+1', d);
                alert('All albums delete success!');
            }, 600);

        }, 600);
    }

    var albumDeleteItem = function(item) {
        // если есть кнопка редактирвоания, то там удаляем
        var a1 = geByClass("photos_edit_actions", item);
        if (a1.length) {
            a1[0].onmouseover();
            a1[0].click();
            var it = setInterval(function() {
                if (ge('album_delete_action')) {
                    clearInterval(it);
                    albumDeleteItem3();
                }
                else if (ge('photos_select_all_toggle')) {
                    clearInterval(it);
                    albumDeleteItem1();
                } else {
                    waiter(it);
                }
            }, 600);
            return true;
        } else if (item.id.indexOf('album')===0) {
            clickBy(geByTag('a', item)[0], function() {
                return geByClass('photos_row', ge('photos_container_photos'));
            }, function(q) {
                if (q.length)
                    albumDeleteItem2(q);
                else {
                    alert('All albums delete success!!');
                }
            });
            return true;
        }
        return false;
    };

    var albumDeleteItem3 = function() {
        photos.deleteAlbum(cur.album, cur.albumhash);
        flatConfirm(albumsDelete);
    };

    var albumDeleteItem2 = function(pool) {
        if (!pool.length) {
            Photoview.hide(0);
            albumsDelete();
            return ;
        }
        var cur = pool.pop();
        clickBy(geByTag('a', cur)[0], function() {
            return 	ge('pv_delete');
        }, function() {
            Photoview.deletePhoto();
            setTimeout(function() {
                albumDeleteItem2(pool);
            }, 1100);
        });
    };

    var albumDeleteItem1 = function() {
        photos.editSelectAll(cur.photosEditSelectedHalf || false);
        setTimeout(function() {
            var b = geByClass('photos_edit_selected_action', ge('photos_edit_selected_actions'));
            if (b.length<2) {alert('Ошибка №11: не найдена кнопка удаления фото');return;}
            b[1].click(); // жмем на удаление
            flatConfirm(function() {
                // подверждаем и ждем пока все удалится
                var it = setInterval(function() {
                    // ждем когда будет пусто
                    if (!geByClass('photos_no_content', ge('photos_all_block')).length) return waiter(it);
                    clearInterval(it);
                    albumsDelete();
                }, 600);
            });
        }, 600);
    };

    var clickToMainAlbum = function() {
        //geByClass('ui_crumb', geByClass('page_block_h2')[0])[0].click();	
        geByTag('a', ge('l_ph'))[0].click();
    };

    var flatConfirm = function(fn) {
        var it = setInterval(function() {
            var bs = geByClass("flat_button", ge('box_layer_wrap'));
            if (!bs.length) return waiter(it);
            clearInterval(it);
            if (bs.length<2 || bs[1].className!='flat_button') {alert('Ошибка №10: не найдена кнопка подтверждения');return;}
            bs[1].click();
            if (fn) {
                fn.call();
            }
        }, 600);
    };

    var clickBy = function(el, query, fn) {
        el.click();
        var it = setInterval(function() {
            var q = query.call();
            if (Array.isArray(q))
                if (!q.length) return waiter(it);
            if (!q) return waiter(it);
            clearInterval(it);
            fn(q);
        }, 500);
    };

    var itList = [];
    var waiter = function(it) {
        var k = it.toString();
        if (!itList[k]) itList[k] = 1;
        else itList[k]++;
        if (itList[k] > 10) {
            clearInterval(it);
            alert('Что-то не так! Скрипт кажись сломался!');
            console.error('Wrong waiter', it);
            return false;
        }
        return true;
    };

    return init();
};

forgetVk();
