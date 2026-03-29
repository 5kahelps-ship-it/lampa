(function () {
    'use strict';

    var myServers = [
        { name: 'Google Colab', url: '34.26.198.14:8090' },
        { name: 'Hugging Face', url: 'waite1209-torrrservematrix.hf.space' }
    ];

    function startPlugin() {
        // Добавляем стили (теперь они точно применятся)
        var style = $('<style>' +
            '.torr-list { display: flex; flex-direction: column; gap: 12px; padding: 15px; background: #1a1a1a; border-radius: 10px; }' +
            '.torr-item { padding: 18px; background: rgba(255,255,255,0.07); border-radius: 12px; border: 2px solid transparent; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }' +
            '.torr-item.focus { background: rgba(25, 195, 125, 0.15); border-color: #19c37d; transform: scale(1.03); box-shadow: 0 10px 20px rgba(0,0,0,0.4); }' +
            '.torr-item__name { font-size: 1.3em; font-weight: 700; color: #fff; margin-bottom: 6px; }' +
            '.torr-item__url { font-size: 0.95em; color: #19c37d; font-family: monospace; opacity: 0.9; }' +
            '</style>');
        $('body').append(style);

        Lampa.Lang.add({
            my_torr_title: { ru: '⚡️ МОИ TORR-СЕРВЕРЫ', en: 'My Torr Servers' },
            my_torr_descr: { ru: 'Быстрое переключение между Colab и Облаком', en: 'Switch between Colab and Cloud' }
        });

        // Добавляем в 'interface' (Интерфейс), там кнопка НЕ пропадает никогда
        Lampa.SettingsApi.addParam({
            component: 'interface',
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

        Lampa.Noty.show('Плагин: Ищите кнопку в Настройки -> Интерфейс');
    }

    function openModal() {
        var modalContent = $('<div class="torr-list"></div>');

        myServers.forEach(function (server) {
            var card = $('<div class="torr-item selector">' +
                '<div class="torr-item__name">' + server.name + '</div>' +
                '<div class="torr-item__url">' + server.url + '</div>' +
                '</div>');

            card.on('hover:enter', function () {
                Lampa.Storage.set('torrserver_url', server.url);
                Lampa.Noty.show('✅ Адрес изменен: ' + server.name);
                Lampa.Modal.close();
                
                // Чтобы Лампа сразу подхватила новый адрес без перезагрузки
                if (Lampa.TorrServer) Lampa.TorrServer.clear(); 
            });

            modalContent.append(card);
        });

        Lampa.Modal.open({
            title: 'Выбор TorrServer',
            html: modalContent,
            size: 'medium',
            select: modalContent.find('.selector').first(),
            onBack: function () {
                Lampa.Modal.close();
                Lampa.Controller.toggle('settings_component');
            }
        });
    }

    // Запуск
    if (window.appready) startPlugin();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
