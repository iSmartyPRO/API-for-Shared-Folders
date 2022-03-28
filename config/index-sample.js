module.exports = {
  APP_PORT: 3000,
  APP_NAME: "Folder Share API",
  api: [
    {
      name: "ilias-test",
      token: "Te8xd4FPw9S48mCVWv7qna" // длина торкена должна быть равна 22
    }
  ],
  shares: [
    {
      name: "PC001Share",
      computername: "PC-001",
      shareName: "shara",
      path: "D:\\share",
      FullAccess: "DOMAIN\\Пользователи домена",
      description: "Тестовая шара"
    },
    {
      name: "PC038Projects",
      computername: "PC-038",
      shareName: "projects$",
      path: "D:\\Projects",
      FullAccess: "DOMAIN\\Пользователи домена",
      description: "Шара проектов"
    }
  ]
}