// List
//------------------------------------------------------------------------------

// Выводим список листов на доске
//------------------------------------------------------------------------------

(function() {

	// Парсим хранилище
	var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

	// Начинаем генерировать листы
	var listBoardCreate = '';

	// Пробегаемся по каждому листу
	for (var i = 0; i < mahoweekStorage.lists.length; i ++) {
		listBoardCreate += makeList(mahoweekStorage.lists[i].id, mahoweekStorage.lists[i].name);
	}

	// Выводим листы
	LIST_BOARD.prepend(listBoardCreate);

}());



// Выводим сетку дат в шапку листов
// и в строки добавления дела
//------------------------------------------------------------------------------

LIST_BOARD.find('.list__grid').html(makeGrid('list'));
LIST_BOARD.find('.task__grid').html(makeGrid());



// // Фиксируем шапку листа
// //------------------------------------------------------------------------------

// (function() {

// 	// Если не мобилка
// 	if (!MOBILE) {
// 		// Определяем переменные
// 		var doc = $(window),
// 			docScrollTop = doc.scrollTop(),
// 			listOffsetTop = list.offset().top;

// 		// Скроллим
// 		doc.on('scroll', function() {
// 			var isThis = $(this);

// 			// Смотрим где сейчас скролл
// 			docScrollTop = isThis.scrollTop();

// 			// Если скролл больше расстояния до листа
// 			if (docScrollTop >= listOffsetTop) {
// 				// Фиксируем
// 				list.find('.list__head').addClass('list__head--fixed');

// 			// Если скролл меньше расстояния до листа
// 			} else {
// 				// Снимаем фиксирование
// 				list.find('.list__head').removeClass('list__head--fixed');
// 			}
// 		});
// 	}

// }());



// Добавляем лист
//------------------------------------------------------------------------------

(function() {

	$('.js-add-list').on('click', function() {
		// Создаем данные для листа
		var listId = makeHash(),
			listName = 'Краткосрочный план дел №' + (LIST_BOARD.find('.list').length + 1),
			listCreatedTime = new Date().getTime();

		// Парсим хранилище
		var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

		// Добавляем новый лист
		mahoweekStorage.lists.push({
			id: listId,
			name: listName,
			createdTime: listCreatedTime
		});

		// Обновляем хранилище
		localStorage.setItem('mahoweek', JSON.stringify(mahoweekStorage));

		// Выводим лист на доске
		LIST_BOARD.append(makeList(listId, listName));

		// Находим созданный лист
		var listNew = LIST_BOARD.find('.list:last-child');

		// Выводим сетку дат в шапку листа
		// и в строку добавления дела
		listNew.find('.list__grid').html(makeGrid('list'));
		listNew.find('.task__grid').html(makeGrid());

		// Ставим фокус в поле добавления дел в созданном листе
		listNew.find('.js-add-task').focus();

		// Смещаем позицию прокрутки в самый низ
		$('body').scrollTop(10000);
	});

}());



// Редактируем заголовок листа
//------------------------------------------------------------------------------

(function() {

	LIST_BOARD.on('keyup change', '.js-edit-list', function(e) {
		var isThis = $(this);

		// Получаем хеш и заголовок листа
		var listId = isThis.parents('.list').attr('data-id'),
			listName = isThis.val();

		// Парсим хранилище
		var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

		// Получаем элемент листа в хранилище
		var listElement = mahoweekStorage.lists.filter(function(value) {
			return value.id == listId;
		});

		// Получаем индекс листа в хранилище
		var listIndex = mahoweekStorage.lists.indexOf(listElement[0]);

		// Изменяем заголовок листа
		mahoweekStorage.lists[listIndex].name = listName;

		// Обновляем хранилище
		localStorage.setItem('mahoweek', JSON.stringify(mahoweekStorage));

		// Если был нажат Enter, то убираем фокус с этого поля
		if (e.keyCode == 13) {
			isThis.blur();
		}
	});

}());



// Удаляем лист
//------------------------------------------------------------------------------

(function() {

	LIST_BOARD.on('click', '.js-remove-list', function() {
		var isThis = $(this);

		// Получаем хеш листа и кол-во дел в нем
		var listId = isThis.parents('.list').attr('data-id'),
			taskTotal = isThis.parents('.list').find('.task:not(.task--add)').length;

		// Если в удаляемом листе были дела
		if (taskTotal) {
			// Задаем вопрос
			var question = confirm('При удалении листа, все дела, находящиеся в нем, так же будут удалены.');
		}

		// Если ответом на вопрос было «Да»
		if (!taskTotal || question) {
			// Парсим хранилище
			var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

			// Получаем элемент листа в хранилище
			var listElement = mahoweekStorage.lists.filter(function(value) {
				return value.id == listId;
			});

			// Получаем индекс листа в хранилище
			var listIndex = mahoweekStorage.lists.indexOf(listElement[0]);

			// Удаляем лист
			mahoweekStorage.lists.splice(listIndex, 1);

			// Если в удаляемом листе были дела
			if (taskTotal) {
				// Готовим новый массив для дел
				var tasksNew = [];

				// Помещаем в него те дела, которые не надо удалять
				for (var i = 0; i < mahoweekStorage.tasks.length; i ++) {
					if (mahoweekStorage.tasks[i].listId != listId) {
						tasksNew.push(mahoweekStorage.tasks[i]);
					}
				}

				// Заменяем старый массив дел на новый с удаленными делами
				mahoweekStorage.tasks = tasksNew;
			}

			// Обновляем хранилище
			localStorage.setItem('mahoweek', JSON.stringify(mahoweekStorage));

			// Удаляем лист из доски
			isThis.parents('.list').remove();
		}
	});

}());



// Сортируем вручную листы
//------------------------------------------------------------------------------

(function() {

	Sortable.create(document.querySelector('.board__lists'), {
		delay: 200,
		animation: 0,
		handle: '.list__name',
		filter: '.list__input',
		preventOnFilter: false,
		ghostClass: 'list--ghost',
		chosenClass: 'list--chosen',
		dragClass: 'list--drag',
		scrollSensitivity: 80,
		onChoose: function() {
			// Добавляем класс сортировки
			LIST_BOARD.addClass('board__lists--drag');
		},
		onEnd: function(evt) {
			if (Number.isInteger(evt.oldIndex) && Number.isInteger(evt.newIndex) && evt.oldIndex != evt.newIndex) {
				// Парсим хранилище
				var mahoweekStorage = JSON.parse(localStorage.getItem('mahoweek'));

				// Получаем удаленный элемент
				var listRemove = mahoweekStorage.lists.splice(evt.oldIndex, 1)[0];

				// Если элемент существует
				if (listRemove !== undefined) {
					// Сортируем
					mahoweekStorage.lists.splice(evt.newIndex, 0, listRemove);

					// Обновляем хранилище
					localStorage.setItem('mahoweek', JSON.stringify(mahoweekStorage));

				// Если не существует
				} else {
					// Перезагружаем страницу
					// во избежание ошибок
					location.reload();
				}
			}

			// Удаляем класс сортировки
			LIST_BOARD.removeClass('board__lists--drag');
		}
	});

}());



// Генерируем прогресс листа
//------------------------------------------------------------------------------

function makeProgress(id) {

	// Считаем общее кол-во дел
	var taskTotal = LIST_BOARD.find('.list[data-id="' + id + '"] .task:not(.task--add)').length;

	// Считаем кол-во выполненных дел
	var taskCompleted = LIST_BOARD.find('.list[data-id="' + id + '"] .task--completed').length;

	// Высчитываем прогресс
	if (taskTotal > 0) {
		var progress = taskCompleted * 100 / taskTotal / 100;
	} else {
		var progress = 0;
	}

	// Выводим прогресс
	LIST_BOARD.find('.list[data-id="' + id + '"] .list__progress').css({
		'-webkit-transform': 'scaleX(' + progress + ')',
		'transform': 'scaleX(' + progress + ')'
	});

}



// Генерируем список листов
//------------------------------------------------------------------------------

function makeList(id, name) {

	// Генерируем код
	return '' +
	'<div class="list" data-id="' + id + '">' +
		'<div class="list__head">' +
			'<div class="list__wrap">' +
				'<div class="list__name  js-name">' +
					name +
				'</div>' +
				'<div class="list__options">' +
					'<div class="list__trash  js-remove-list">' +
						'<svg>' +
							'<use xlink:href="#icon-trash"></use>' +
						'</svg>' +
					'</div>' +
				'</div>' +
				'<div class="list__progress"></div>' +
			'</div>' +
			'<div class="list__grid  grid"></div>' +
		'</div>' +
		'<div class="list__tasks">' +
			'<label class="task  task--add">' +
				'<div class="task__wrap">' +
					'<div class="task__status">' +
						'<div class="task__plus">' +
							'<svg>' +
								'<use xlink:href="#icon-plus"></use>' +
							'</svg>' +
						'</div>' +
					'</div>' +
					'<div class="task__name">' +
						'<input class="task__input  js-add-task" type="text">' +
					'</div>' +
				'</div>' +
				'<div class="task__grid  grid"></div>' +
			'</label>' +
		'</div>' +
	'</div>';

}
