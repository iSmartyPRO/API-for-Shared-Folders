# Краткое описание
Приложение для управления сетевыми папками

# Как установить
```
git clone https://github.com/iSmartyPRO/API-for-Shared-Folders.git shared-folder-api
cd shared-folder-api
npm install
```

Скопируйте файл конфигурации из шаблона и заполните своими данными:
```
./config/index-sample.js ./config/index.js
```

# Запукс проекта

В режиме разработки:
```
npm run dev
```

Запуск в качестве службы на Windows:
```
npm run install
```

Остановка и удаление службы Windows:
```
npm run uninstall
```