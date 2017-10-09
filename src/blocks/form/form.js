// Form
//------------------------------------------------------------------------------

// Настраиваем счетчик в фавиконке
//------------------------------------------------------------------------------

(function() {

	// Если в браузере поддерживается смена фавиконки
	if (document.createElement('canvas').getContext && !MOBILE && !CHROMEIOS && !ANDROID && !IPAD && !MSIE && !SAFARI) {
		// Показываем настройку
		SETTINGS_FORM.find('.js-choose-favicon-counter').parents('.form__group').removeClass('form__group--hidden');

		// Парсим хранилище и находим настройку счетчика в фавиконке
		var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek')),
			faviconCounter = mahoweekStorage.settings.faviconCounter;

		// Выставляем состояние чекбокса
		if (faviconCounter === true) {
			SETTINGS_FORM.find('.js-choose-favicon-counter').attr('checked', 'checked');
		} else {
			SETTINGS_FORM.find('.js-choose-favicon-counter').removeAttr('checked', 'checked');
		}

		// Меняем состояние чекбокса
		SETTINGS_FORM.find('.js-choose-favicon-counter').on('change', function() {
			// Получаем настройку счетчика в фавиконке
			faviconCounter = SETTINGS_FORM.find('.js-choose-favicon-counter').prop('checked');

			// Парсим хранилище и меняем настройку
			mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));
			mahoweekStorage.settings.faviconCounter = faviconCounter;

			// Обновляем хранилище
			updateStorage(mahoweekStorage);

			// Меняем фавиконку
			changeFavicon();
		});
	}

}());



// Настраиваем оповещения
//------------------------------------------------------------------------------

(function() {

	// Если в браузере поддерживаются оповещения
	if (('Notification' in window) && !MOBILE && !CHROMEIOS && !ANDROID && !IPAD) {
		// Показываем настройку
		SETTINGS_FORM.find('.js-choose-notify').parents('.form__group').removeClass('form__group--hidden');

		// Если время оповещения ранее выставлялось
		// и пользователь разрешил оповещения
		if (localStorage.getItem('notify') && localStorage.getItem('notify') != 'none' && Notification.permission === 'granted') {
			// Показываем выбранный пункт
			SETTINGS_FORM.find('.js-choose-notify option[value="' + localStorage.getItem('notify') + '"]').attr('selected', 'selected');
		}

		// Меняем время оповещения
		SETTINGS_FORM.find('.js-choose-notify').on('change', function() {
			// Получаем текущее значение
			var notifyValue = $(this).val();

			if (notifyValue == 'none') {
				// Выключаем оповещения
				localStorage.setItem('notify', 'none');
			} else {
				// Если пользователь ранее разрешил оповещения
				if (Notification.permission === 'granted') {
					// Если до изменения оповещения были выключены
					if (localStorage.getItem('notify') == 'none') {
						// Показываем оповещение с краткой справкой
						var notification = new Notification('Оповещения включены', {
							body: 'Теперь добавьте время выполнения делам и держите сайт открытым в браузере, чтобы оповещения приходили.',
							icon: '/img/notify.png?v=2',
							requireInteraction: true
						});
					}

					// Меняем время оповещения
					localStorage.setItem('notify', notifyValue);

				// Если пользователь еще не включал оповещения
				} else if (Notification.permission === 'default') {
					// Запрашиваем права
					Notification.requestPermission(function(permission) {
						// И если пользователь разрешил оповещения
						if (permission === 'granted') {
							// Записываем время оповещения
							localStorage.setItem('notify', notifyValue);

							// Показываем оповещение с краткой справкой
							var notification = new Notification('Оповещения включены', {
								body: 'Теперь добавьте время выполнения делам и держите сайт открытым в браузере, чтобы оповещения приходили.',
								icon: '/img/notify.png?v=2',
								requireInteraction: true
							});

						// А если пользователь заблокировал оповещения
						} else {
							// Выключаем оповещения
							localStorage.setItem('notify', 'none');

							// Делаем состояние селекта по-умолчанию
							SETTINGS_FORM.find('.js-choose-notify option').removeAttr('selected', 'selected');
						}
					});

				// Если пользователь ранее блокировал оповещения
				} else if (Notification.permission === 'denied') {
					// Показываем алерт
					alert('Ранее вы блокировали отправку вам оповещений. Пожалуйста, разрешите оповещения в настройках сайта в браузере.');

					// Делаем состояние селекта по-умолчанию
					SETTINGS_FORM.find('.js-choose-notify option').removeAttr('selected', 'selected');
				}
			}
		});
	}


}());



// Настраиваем доску
//------------------------------------------------------------------------------

(function() {

	// Отменяем отправку формы по сабмиту
	SETTINGS_FORM.on('submit', function(event) {
		event.preventDefault();
	});

	// Парсим хранилище
	var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

	// Определяем текущие параметры
	var theme = mahoweekStorage.settings.theme,
		deleteCompletedTasks = mahoweekStorage.settings.deleteCompletedTasks;

	// Выделяем текущую тему как активную
	SETTINGS_FORM.find('.js-choose-theme[value="' + theme + '"]').attr('checked', 'checked');

	// Выставляем состояние чекбокса настройки удаления выполненных дел
	if (deleteCompletedTasks === true) {
		SETTINGS_FORM.find('.js-choose-delete-completed-tasks').attr('checked', 'checked');
	} else {
		SETTINGS_FORM.find('.js-choose-delete-completed-tasks').removeAttr('checked', 'checked');
	}

	// Сохраняем параметры
	SETTINGS_FORM.find('.js-choose-theme, .js-choose-delete-completed-tasks').on('change', function() {
		// Определяем новые параметры
		theme = SETTINGS_FORM.find('.js-choose-theme[name="theme"]:checked').val();
		deleteCompletedTasks = SETTINGS_FORM.find('.js-choose-delete-completed-tasks').prop('checked');

		// Изменяем тему у доски
		THEME_BOARD.attr('class', 'board__theme  board__theme--' + theme);

		// Парсим хранилище и изменяем параметры
		mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));
		mahoweekStorage.settings.theme = theme;
		mahoweekStorage.settings.deleteCompletedTasks = deleteCompletedTasks;

		// Обновляем хранилище
		updateStorage(mahoweekStorage);
	});

}());



// Редактируем данные локального хранилища
//------------------------------------------------------------------------------

(function() {

	// Сохраняем изменения
	STORAGE_FORM.on('submit', function(event) {
		event.preventDefault();

		// Получаем содержимое текстареи
		var storageContent = STORAGE_FORM.find('.js-edit-storage').val();

		// Если значение не пусто и парсинг не вызвал ошибок
		if (storageContent != '' && JSON.parse(storageContent)) {
			// Берем и парсим отредактированные данные
			var editedMahoweekStorage = JSON.parse(storageContent);

			// Обновляем хранилище
			localStorage.setItem('mahoweek', JSON.stringify(editedMahoweekStorage));

			// Редиректим на главную
			window.location.replace('/');

		// Если содержимое пусто
		} else if (storageContent == '') {
			// Очищаем хранилище полностью
			localStorage.clear();

			// Редиректим на главную
			window.location.replace('/');
		}
	});

}());
