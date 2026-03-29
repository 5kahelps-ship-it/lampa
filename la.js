(function () {
    'use strict';

    var myServers = [
        { name: 'Google Colab', url: '34.26.198.14:8090' },
        { name: 'Hugging Face', url: 'waite1209-torrrservematrix.hf.space' }
    ];

    function startPlugin() {
        console.log('TorrManager: Plugin starting...');
        
        Lampa.Lang.add({
            my_torr_title: { ru: 'Мои серверы Torr', en: 'My Torr Servers' },
            my_torr_descr: { ru: 'Быстрое переключение адресов TorrServer', en: 'Switch TorrServer addresses' }
        });

        // Добавляем сразу в два раздела для надежности
        var components = ['interface', 'torrserver'];

        components.forEach(function (comp) {
            Lampa.SettingsApi.addParam({
                component: comp,
                param: {
                    name: 'my_torr_switch_btn_' + comp,
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
        });
        
        // Всплывающее окно при загрузке (чтобы ты понял, что плагин подхватился)
        Lampa.Noty.show('Плагин Мои Серверы загружен!');
    }

    function openModal() {
        var html = $('<div class="category-full"></div>');

        myServers.forEach(function (server) {
            var item = $('<div class="navigation-card selector">' +
                '<div class="navigation-card__title">' + server.name + '</div>' +
                '<div class="navigation-card__description">' + server.url + '</div>' +
                '</div>');

            item.on('hover:enter', function () {
                Lampa.Storage.set('torrserver_url', server.url);
                Lampa.Noty.show('Установлен адрес: ' + server.url);
                Lampa.Modal.close();
            });

            html.append(item);
        });

        Lampa.Modal.open({
            title: 'Выберите TorrServer',
            html: html,
            size: 'medium',
            select: html.find('.selector').first(),
            onBack: function() {
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
