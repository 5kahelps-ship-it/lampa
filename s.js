(function () {
    'use strict';

    var myServers = [
        { name: 'Google Colab', url: '34.26.198.14:8090' },
        { name: 'Hugging Face', url: 'waite1209-torrrservematrix.hf.space' }
    ];

    function startPlugin() {
        // Добавляем стили для красоты
        var style = $('<style>' +
            '.torr-list{display: flex; flex-direction: column; gap: 10px; padding: 10px;}' +
            '.torr-item{padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px; border: 2px solid transparent; cursor: pointer; transition: all 0.2s;}' +
            '.torr-item.focus{background: rgba(255,255,255,0.1); border-color: #fff; transform: scale(1.02);}' +
            '.torr-item__name{font-size: 1.2em; font-weight: bold; margin-bottom: 5px;}' +
            '.torr-item__url{font-size: 0.9em; opacity: 0.6; color: #19c37d;}' +
            '</style>');
        $('body').append(style);

        Lampa.Lang.add({
            my_torr_title: { ru: 'Мои серверы Torr', en: 'My Torr Servers' },
            my_torr_descr: { ru: 'Нажмите для выбора активного сервера', en: 'Click to select active server' }
        });

        // Пытаемся добавить кнопку именно в раздел TorrServer
        var addBtn = function() {
            Lampa.SettingsApi.addParam({
                component: 'torrserver',
                param: {
                    name: 'my_torr_switch_btn',
                    type: 'button'
                },
                field: {
                    name: Lampa.Lang.translate('my_torr_title'),
                    description: Lampa.Lang.translate('my_torr_descr')
                },
                onChange: function () {
                    openModal();
                }
            });
        };

        // Ждем чуть-чуть, чтобы раздел TorrServer успел прогрузиться в Lampa
        setTimeout(addBtn, 1000);
        Lampa.Noty.show('Плагин Мои Серверы готов!');
    }

    function openModal() {
        var modalHtml = $('<div class="torr-list"></div>');

        myServers.forEach(function (server) {
            var card = $('<div class="torr-item selector">' +
                '<div class="torr-item__name">' + server.name + '</div>' +
                '<div class="torr-item__url">' + server.url + '</div>' +
                '</div>');

            card.on('hover:enter', function () {
                Lampa.Storage.set('torrserver_url', server.url);
                Lampa.Noty.show('Выбран: ' + server.name);
                Lampa.Modal.close();
            });

            modalHtml.append(card);
        });

        Lampa.Modal.open({
            title: 'Выберите TorrServer',
            html: modalHtml,
            size: 'medium',
            select: modalHtml.find('.selector').first(),
            onBack: function () {
                Lampa.Modal.close();
                Lampa.Controller.toggle('settings_component');
            }
        });
    }

    if (window.appready) startPlugin();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
