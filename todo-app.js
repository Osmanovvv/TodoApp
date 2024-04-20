(function todoApp() {
  "use strict";

  // Объявляем массив для хранения списка дел
  let todoListArray = [];

  // Создание заголовка приложения
  function createAppTitle(title) {
    const appTitle = document.createElement("h2");
    appTitle.innerHTML = title;
    return appTitle;
  }

  // Функция для проверки состояния кнопки в зависимости от ввода
  function toggleButtonState(input, button) {
    button.disabled = input.value.trim() === ""; // Если значение пустое, кнопка заблокирована
  }

  // Создание формы для добавления нового дела
  function createTodoItemForm() {
    const form = document.createElement("form");
    const input = document.createElement("input");
    const buttonWrapper = document.createElement("div");
    const button = document.createElement("button");

    // Добавление классов для стилизации элементов
    form.classList.add("input-group", "mb-3");
    input.classList.add("form-control");
    input.placeholder = "Введите название нового дела";
    buttonWrapper.classList.add("input-group-append");
    button.style.backgroundColor = "#42aaff";
    button.textContent = "Добавить дело";
    button.type = "submit"; // Устанавливаем тип кнопки как "submit"

    // Установка начального состояния кнопки при загрузке страницы
    toggleButtonState(input, button);

    // Добавление обработчика события для проверки ввода при изменении
    input.addEventListener("input", () => toggleButtonState(input, button));

    // Добавление элементов в форму
    buttonWrapper.append(button);
    form.append(input);
    form.append(buttonWrapper);

    return {
      form,
      input,
      button,
    };
  }

  // Создание списка дел
  function createTodoList() {
    const list = document.createElement("ul");
    list.classList.add("list-group");
    return list;
  }

  // Создание элемента списка дел
  function createTodoItem(todo) {
    const item = document.createElement("li");
    const buttonGroup = document.createElement("div");
    const doneButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    item.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
    item.textContent = todo.name;

    buttonGroup.classList.add("btn-group", "btn-group-sm");
    doneButton.classList.add("btn", "btn-success");
    doneButton.textContent = "Готово";
    deleteButton.classList.add("btn", "btn-danger");
    deleteButton.textContent = "Удалить";

    // Установка класса в зависимости от состояния выполненности
    if (todo.done) {
      item.classList.add("list-group-item-success");
    }

    buttonGroup.append(doneButton);
    buttonGroup.append(deleteButton);
    item.append(buttonGroup);

    return {
      item,
      doneButton,
      deleteButton,
    };
  }

  // Генерация уникального id
  function generateUniqueId() {
    // Если массив пустой, возвращаем 1, иначе увеличиваем на 1 максимальный id
    const existingIds = todoListArray.map((todo) => todo.id);
    return existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
  }

  // Сохранение данных в LocalStorage
  function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Загрузка данных из LocalStorage
  function loadFromLocalStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error parsing JSON from localStorage:", error);
      return [];
    }
  }

  // Назначение обработчиков событий для кнопок "Готово" и "Удалить"
  function attachEventHandlers(todoItem, todo, listType) {
    // Обработчик для кнопки "Готово"
    todoItem.doneButton.addEventListener("click", () => {
      const todoIndex = todoListArray.findIndex((item) => item.id === todo.id);
      if (todoIndex !== -1) {
        todoListArray[todoIndex].done = !todoListArray[todoIndex].done;
        todoItem.item.classList.toggle("list-group-item-success", todoListArray[todoIndex].done);
        saveToLocalStorage(listType, todoListArray);
      }
    });

    // Обработчик для кнопки "Удалить"
    todoItem.deleteButton.addEventListener("click", () => {
      if (confirm("Вы уверены?")) {
        // Получаем родительский элемент (li) кнопки "Удалить" и удаляем его
        const listItem = todoItem.deleteButton.parentNode.parentNode;
        listItem.remove();

        // Удаляем элемент из массива todoListArray
        todoListArray = todoListArray.filter((item) => item.id !== todo.id);

        // Сохраняем измененный список в LocalStorage
        saveToLocalStorage(listType, todoListArray);
      }
    });
  }

  // Создание приложения для списка дел
  function createTodoApp(container, title = "Список дел", listType = "todoList") {
    // Загружаем данные из LocalStorage или создаем новый массив
    todoListArray = loadFromLocalStorage(listType);

    // Создаем заголовок приложения
    const todoAppTitle = createAppTitle(title);
    // Создаем форму для добавления новых дел
    const todoItemForm = createTodoItemForm();
    // Создаем список дел
    const todoList = createTodoList();

    // Добавляем элементы в контейнер
    container.append(todoAppTitle);
    container.append(todoItemForm.form);
    container.append(todoList);

    // Добавляем существующие дела из массива в список
    todoListArray.forEach((todo) => {
      const todoItem = createTodoItem(todo);
      todoList.append(todoItem.item);
      // Назначаем обработчики событий для кнопок
      attachEventHandlers(todoItem, todo, listType);
    });

    // Обработчик события для формы добавления новых дел
    todoItemForm.form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!todoItemForm.input.value) {
        return;
      }

      // Создаем новый объект дела
      const todo = {
        name: todoItemForm.input.value,
        done: false,
        id: generateUniqueId(),
      };

      // Создаем элемент списка дел
      const todoItem = createTodoItem(todo);
      // Добавляем элемент в список
      todoList.append(todoItem.item);
      // Назначаем обработчики событий для нового элемента
      attachEventHandlers(todoItem, todo, listType);

      // Добавляем дело в массив
      todoListArray.push(todo);
      // Сохраняем обновленный список в LocalStorage
      saveToLocalStorage(listType, todoListArray);

      // Очищаем поле ввода
      todoItemForm.input.value = "";
      // Проверяем состояние кнопки
      toggleButtonState(todoItemForm.input, todoItemForm.button);
    });
  }

  // Экспортируем функцию создания приложения
  window.createTodoApp = createTodoApp;
})();
