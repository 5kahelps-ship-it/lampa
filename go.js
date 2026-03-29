(function () {
    'use strict';

    var myServers = [
        { name: 'Google Colab', url: '34.26.198.14:8090' },
        { name: 'Hugging Face', url: 'waite1209-torrrservematrix.hf.space' }
    ];

    // ТВОЯ ПОДСЕТЬ (по умолчанию 31, как ты просил)
    var USER_SUBNET = "192.168.31."; 

    function startPlugin() {
        var style = $('<style>' +
            '.torr-list { display: flex; flex-direction: column; gap: 10px; padding: 15px; }' +
            '.torr-item { position: relative; padding: 15px; background: rgba(255,255,255,0.08); border-radius: 10px; border: 2px solid transparent; }' +
            '.torr-item.focus { background: rgba(25, 195, 125, 0.2); border-color: #19c37d; }' +
            '.scan-btn { margin-bottom: 15px; padding: 15px; background: #19c37d; color: #fff; text-align: center; border-radius: 10px; font-weight: bold; cursor: pointer; border: none; }' +
            '.scan-btn.focus { background: #1ed760; box-shadow: 0 0 20px rgba(31, 215, 96, 0.5); }' +
            '.torr-item__url { font-family: monospace; color: #19c37d; font-size: 0.9em; }' +
            '</style>');
        $('body').append(style);

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { name: 'my_torr_v7', type: 'button' },
            field: { name: '🚀 TORR-SCANNER (31.X)', description: 'Поиск серверов в сети 192.168.31.X' },
            onChange: openModal
        });
    }

    function probeIp(ip, callback) {
        var timeout = 600; 
        var found = false;
        var img = new Image();
        
        var timer = setTimeout(function() {
            if (!found) {
                img.src = "";
                callback(false);
            }
        }, timeout);

        img.onerror = function() {
            if (!found) {
                found = true;
                clearTimeout(timer);
                callback(true);
            }
        };
        
        // Стучимся на спец-ручку TorrServer
        img.src = "http://" + ip + ":8090/echo?t=" + Date.now();
    }

    function runScan(container) {
        Lampa.Noty.show('Сканирую сеть ' + USER_SUBNET + '0/24...');
        
        var foundAny = false;
        // Запускаем пачку запросов
        for (var i = 1; i < 255; i++) {
            (function(lastByte) {
                var targetIp = USER_SUBNET + lastByte;
                probeIp(targetIp, function(exists) {
                    if (exists) {
                        foundAny = true;
                        var card = $('<div class="torr-item selector">' +
                            '<div style="font-weight:bold">🖥 Найден сервер: ' + targetIp + '</div>' +
                            '<div class="torr-item__url">' + targetIp + ':8090</div>' +
                            '</div>');
                        
                        card.on('hover:enter', function() {
                            Lampa.Storage.set('torrserver_url', targetIp + ':8090');
                            Lampa.Noty.show('Подключено к ' + targetIp);
                            Lampa.Modal.close();
                        });
                        
                        container.append(card);
                        // Обновляем список, чтобы новые элементы стали кликабельными
                        Lampa.Controller.set('modal'); 
                    }
                });
            })(i);
        }
        
        setTimeout(function() {
            if(!foundAny) Lampa.Noty.show('Локальных серверов не найдено');
        }, 3000);
    }

    function openModal() {
        var modalContent = $('<div class="torr-list"></div>');
        var scanBtn = $('<div class="scan-btn selector">🔍 НАЧАТЬ ПОИСК В СЕТИ .31.X</div>');

        // Сначала добавляем кнопку скана
        modalContent.append(scanBtn);

        // Затем облачные серверы
        myServers.forEach(function (server) {
            var card = $('<div class="torr-item selector">' +
                '<div>' + server.name + '</div>' +
                '<div class="torr-item__url">' + server.url + '</div>' +
                '</div>');
            card.on('hover:enter', function () {
                Lampa.Storage.set('torrserver_url', server.url);
                Lampa.Modal.close();
            });
            modalContent.append(card);
        });

        scanBtn.on('hover:enter', function() {
            // Очищаем старые результаты скана перед новым (если были)
            runScan(modalContent);
        });

        Lampa.Modal.open({
            title: 'TorrServer Manager',
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
