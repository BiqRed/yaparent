import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Создаем пользователей
  const user1 = await prisma.user.upsert({
    where: { email: 'maria@example.com' },
    update: { karma: 95 },
    create: {
      email: 'maria@example.com',
      phone: '+79991234567',
      name: 'Мария',
      avatar: '👩‍👧',
      online: true,
      karma: 95,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'anna@example.com' },
    update: { karma: 120 },
    create: {
      email: 'anna@example.com',
      phone: '+79997654321',
      name: 'Анна',
      avatar: '👩‍👦',
      online: false,
      karma: 120,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'elena@example.com' },
    update: { karma: 150 },
    create: {
      email: 'elena@example.com',
      phone: '+79995551234',
      name: 'Елена',
      avatar: '👩‍👦‍👦',
      online: false,
      karma: 150,
    },
  });

  const user4 = await prisma.user.upsert({
    where: { email: 'olga@example.com' },
    update: { karma: 110 },
    create: {
      email: 'olga@example.com',
      phone: '+79994445566',
      name: 'Ольга',
      avatar: '👩‍👧',
      online: true,
      karma: 110,
    },
  });

  const currentUser = await prisma.user.upsert({
    where: { email: 'me@example.com' },
    update: { karma: 0 },
    create: {
      email: 'me@example.com',
      phone: '+79991111111',
      name: 'Я',
      avatar: '🙋',
      online: true,
      karma: 0,
    },
  });

  // Тестовый пользователь - Няня
  const nannyUser = await prisma.user.upsert({
    where: { email: 'nanny@test.com' },
    update: { karma: 85 },
    create: {
      email: 'nanny@test.com',
      phone: '+79998887766',
      name: 'Светлана Петрова',
      avatar: '👶',
      online: true,
      karma: 85,
    },
  });

  // Создаем матчи (связи между пользователями) - только если они еще не существуют
  let match1 = await prisma.match.findFirst({
    where: {
      OR: [
        { user1Id: currentUser.id, user2Id: user1.id },
        { user1Id: user1.id, user2Id: currentUser.id },
      ],
    },
  });
  if (!match1) {
    match1 = await prisma.match.create({
      data: {
        user1Id: currentUser.id,
        user2Id: user1.id,
        matchedAt: new Date('2024-11-01T10:00:00'),
      },
    });
  }

  let match2 = await prisma.match.findFirst({
    where: {
      OR: [
        { user1Id: currentUser.id, user2Id: user2.id },
        { user1Id: user2.id, user2Id: currentUser.id },
      ],
    },
  });
  if (!match2) {
    match2 = await prisma.match.create({
      data: {
        user1Id: currentUser.id,
        user2Id: user2.id,
        matchedAt: new Date('2024-10-31T15:00:00'),
      },
    });
  }

  let match3 = await prisma.match.findFirst({
    where: {
      OR: [
        { user1Id: currentUser.id, user2Id: user3.id },
        { user1Id: user3.id, user2Id: currentUser.id },
      ],
    },
  });
  if (!match3) {
    match3 = await prisma.match.create({
      data: {
        user1Id: currentUser.id,
        user2Id: user3.id,
        matchedAt: new Date('2024-10-30T12:00:00'),
      },
    });
  }

  let match4 = await prisma.match.findFirst({
    where: {
      OR: [
        { user1Id: currentUser.id, user2Id: user4.id },
        { user1Id: user4.id, user2Id: currentUser.id },
      ],
    },
  });
  if (!match4) {
    match4 = await prisma.match.create({
      data: {
        user1Id: currentUser.id,
        user2Id: user4.id,
        matchedAt: new Date('2024-10-29T09:00:00'),
      },
    });
  }

  // Создаем сообщения для первого чата (с Марией)
  const message1 = await prisma.message.create({
    data: {
      matchId: match1.id,
      senderId: user1.id,
      receiverId: currentUser.id,
      content: 'Привет! Как дела?',
      createdAt: new Date('2024-11-01T10:00:00'),
      read: true,
    },
  });

  const message2 = await prisma.message.create({
    data: {
      matchId: match1.id,
      senderId: currentUser.id,
      receiverId: user1.id,
      content: 'Отлично! А у тебя?',
      createdAt: new Date('2024-11-01T10:02:00'),
      read: true,
    },
  });

  const message3 = await prisma.message.create({
    data: {
      matchId: match1.id,
      senderId: user1.id,
      receiverId: currentUser.id,
      content: 'Тоже хорошо! Планируешь пойти на встречу завтра?',
      createdAt: new Date('2024-11-01T10:05:00'),
      read: true,
    },
  });

  const message4 = await prisma.message.create({
    data: {
      matchId: match1.id,
      senderId: currentUser.id,
      receiverId: user1.id,
      content: 'Да, конечно! Во сколько начало?',
      createdAt: new Date('2024-11-01T10:10:00'),
      read: true,
    },
  });

  const message5 = await prisma.message.create({
    data: {
      matchId: match1.id,
      senderId: user1.id,
      receiverId: currentUser.id,
      content: 'В 15:00 в парке Горького',
      createdAt: new Date('2024-11-01T10:12:00'),
      read: true,
    },
  });

  const message6 = await prisma.message.create({
    data: {
      matchId: match1.id,
      senderId: currentUser.id,
      receiverId: user1.id,
      content: 'Отлично! До встречи завтра 😊',
      createdAt: new Date('2024-11-01T10:30:00'),
      read: true,
    },
  });

  // Добавляем реакции на некоторые сообщения
  await prisma.messageReaction.create({
    data: {
      messageId: message1.id,
      userId: currentUser.id,
      emoji: '❤️',
    },
  });

  await prisma.messageReaction.create({
    data: {
      messageId: message5.id,
      userId: currentUser.id,
      emoji: '👍',
    },
  });

  // Создаем сообщения для других чатов
  await prisma.message.create({
    data: {
      matchId: match2.id,
      senderId: user2.id,
      receiverId: currentUser.id,
      content: 'Подтверждаю участие!',
      createdAt: new Date('2024-10-31T15:30:00'),
      read: false,
    },
  });

  await prisma.message.create({
    data: {
      matchId: match3.id,
      senderId: user3.id,
      receiverId: currentUser.id,
      content: 'Спасибо за помощь вчера! 🙏',
      createdAt: new Date('2024-10-30T18:00:00'),
      read: true,
    },
  });

  await prisma.message.create({
    data: {
      matchId: match4.id,
      senderId: user4.id,
      receiverId: currentUser.id,
      content: 'Привет! Как дела?',
      createdAt: new Date('2024-10-29T11:00:00'),
      read: true,
    },
  });

  // Создаем объявления на доске
  const post1 = await prisma.boardPost.create({
    data: {
      authorId: user2.id,
      type: 'need_nanny',
      description: 'Ищу няню на постоянной основе для дочки 3 лет. Будни с 9 до 18. Опыт работы обязателен.',
      city: 'Москва',
      district: 'Хамовники',
      status: 'active',
      createdAt: new Date('2024-11-01T08:30:00'),
    },
  });

  const post2 = await prisma.boardPost.create({
    data: {
      authorId: user1.id,
      type: 'can_babysit',
      description: 'Опытная няня, могу посидеть с ребенком в выходные. Педагогическое образование, рекомендации.',
      city: 'Москва',
      district: 'Дорогомилово',
      status: 'active',
      createdAt: new Date('2024-11-01T09:00:00'),
    },
  });

  const post3 = await prisma.boardPost.create({
    data: {
      authorId: user3.id,
      type: 'coffee_meetup',
      description: 'Давайте сходим за кофе в районе Дорогомилово! Познакомимся, обсудим детские темы. У меня дочка 4 года.',
      city: 'Москва',
      district: 'Дорогомилово',
      status: 'active',
      createdAt: new Date('2024-11-01T07:00:00'),
    },
  });

  const post4 = await prisma.boardPost.create({
    data: {
      authorId: user4.id,
      type: 'playdate',
      description: 'Ищу компанию для прогулок с детьми. Сыну 5 лет, очень активный. Было бы здорово найти друзей!',
      city: 'Москва',
      district: 'Хамовники',
      status: 'active',
      createdAt: new Date('2024-10-31T16:00:00'),
    },
  });

  const post5 = await prisma.boardPost.create({
    data: {
      authorId: currentUser.id,
      type: 'looking_for_friends',
      description: 'Переехали недавно в город. Ищу друзей для дочки 6 лет и общения для себя.',
      city: 'Санкт-Петербург',
      district: 'Центральный',
      status: 'active',
      createdAt: new Date('2024-10-31T12:00:00'),
    },
  });

  // Объявление от няни
  const post6 = await prisma.boardPost.create({
    data: {
      authorId: nannyUser.id,
      type: 'can_babysit',
      description: 'Опытная няня с педагогическим образованием. Работаю с детьми от 1 года до 7 лет. Могу помочь с развивающими занятиями, прогулками. График гибкий. Есть рекомендации от предыдущих семей.',
      city: 'Москва',
      district: 'Хамовники',
      status: 'active',
      createdAt: new Date('2024-11-01T08:00:00'),
    },
  });

  // Создаем отклики на объявления
  await prisma.boardResponse.create({
    data: {
      postId: post1.id,
      responderId: currentUser.id,
      message: 'Добрый день! У меня опыт работы 5 лет, есть рекомендации. Когда можем встретиться?',
      createdAt: new Date('2024-11-01T09:00:00'),
    },
  });

  await prisma.boardResponse.create({
    data: {
      postId: post1.id,
      responderId: user1.id,
      message: 'Здравствуйте! Работала няней в семье с детьми 2-4 лет. Могу начать со следующей недели.',
      createdAt: new Date('2024-11-01T10:30:00'),
    },
  });

  await prisma.boardResponse.create({
    data: {
      postId: post3.id,
      responderId: user2.id,
      message: 'Отличная идея! У меня тоже дочка 4 года. Может встретимся в субботу?',
      createdAt: new Date('2024-11-01T08:00:00'),
    },
  });

  await prisma.boardResponse.create({
    data: {
      postId: post3.id,
      responderId: user4.id,
      message: 'Мы тоже из Дорогомилово! Дочке 5 лет. Присоединимся 😊',
      createdAt: new Date('2024-11-01T09:30:00'),
    },
  });

  await prisma.boardResponse.create({
    data: {
      postId: post4.id,
      responderId: currentUser.id,
      message: 'Здравствуйте! У меня дочка того же возраста. Мы часто гуляем в парке Горького. Давайте знакомиться!',
      createdAt: new Date('2024-10-31T17:00:00'),
    },
  });

  console.log('✅ База данных заполнена тестовыми данными');
  console.log('👥 Создано пользователей:', 6);
  console.log('📝 Создано объявлений:', 6);
  console.log('💬 Создано откликов:', 5);
  console.log('👶 Тестовая няня: nanny@test.com');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

