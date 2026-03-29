(function () {
    'use strict';

    var myServers = [
        { name: 'Google Colab', url: '34.26.198.14:8090' },
        { name: 'Hugging Face', url: 'waite1209-torrrservematrix.hf.space' },
        { name: 'Локальный ПК', url: '192.168.31.167:8090' } // Замени на свой локальный IP
    ];

    function startPlugin() {
        var style = $('<style>' +
            '.torr-list { display: flex; flex-direction: column; gap: 12px; padding: 15px; }' +
            '.torr-item { position: relative; padding: 18px; background: rgba(255,255,255,0.07); border-radius: 12px; border: 2px solid transparent; transition: all 0.3s; cursor: pointer; }' +
            '.torr-item.focus { background: rgba(25, 195, 125, 0.15); border-color: #19c37d; transform: scale(1.02); }' +
            '.torr-item__name { font-size: 1.2em; font-weight: bold; color: #fff; }' +
            '.torr-item__url { font-size: 0.85em; color: #aaa; font-family: monospace; margin-top: 4px; }' +
            '.torr-status { position: absolute; top: 18px; right: 18px; font-size: 0.8em; font-weight: bold; padding: 2px 8px; border-radius: 4px; }' +
            '.status-online { color: #19c37d; }' +
            '.status-offline { color: #ff4d4f; }' +
            '.status-checking { color: #f5a623; }' +
            '</style>');
        $('body').append(style);

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { name: 'my_torr_v5', type: 'button' },
            field: {
                name: '⚡️ TORR-МЕНЕДЖЕР V5',
                description: 'Проверка пинга и переключение серверов'
            },
            onChange: openModal
        });
    }

    function checkServer(url, callback) {
        var start = Date.now();
        var protocol = url.indexOf('http') === 0 ? '' : 'http://';
        
        // Используем пустой запрос для проверки связи
        $.ajax({
            url: protocol + url + '/echo',
            type: 'GET',
            timeout: 3000,
            success: function() {
                var ms = Date.now() - start;
                callback('online', ms + ' ms');
            },
            error: function() {
                callback('offline', 'Ошибка сети');
            }
        });
    }

    function openModal() {
        var modalContent = $('<div class="torr-list"></div>');

        myServers.forEach(function (server, index) {
            var id = 'torr_srv_' + index;
            var card = $('<div class="torr-item selector" id="'+id+'">' +
                '<div class="torr-item__name">' + server.name + '</div>' +
                '<div class="torr-item__url">' + server.url + '</div>' +
                '<div class="torr-status status-checking">Проверка...</div>' +
                '</div>');

            card.on('hover:enter', function () {
                Lampa.Storage.set('torrserver_url', server.url);
                Lampa.Noty.show('✅ Выбран: ' + server.name);
                Lampa.Modal.close();
            });

            modalContent.append(card);

            // Запускаем проверку пинга для каждой карточки
            checkServer(server.url, function(status, text) {
                var statusEl = card.find('.torr-status');
                statusEl.removeClass('status-checking').addClass('status-' + status).text(text);
            });
        });

        Lampa.Modal.open({
            title: 'Состояние серверов',
            html: modalContent,
            size: 'medium',
            select: modalContent.find('.selector').first(),
            onBack: function () {
                Lampa.Modal.close();
                Lampa.Controller.toggle('settings_component');
            }
        });
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') startPlugin(); });
})();
