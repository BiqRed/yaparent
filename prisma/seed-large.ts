import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Простая функция хеширования для демо-данных
async function hashPassword(password: string): Promise<string> {
  // В продакшене используйте bcrypt, для seed данных используем простое хеширование
  return `hashed_${password}`;
}

// Списки для генерации данных
const firstNames = [
  'Анна', 'Мария', 'Елена', 'Ольга', 'Наталья', 'Татьяна', 'Ирина', 'Светлана',
  'Екатерина', 'Юлия', 'Дарья', 'Александра', 'Виктория', 'Алина', 'Полина',
  'Анастасия', 'Валентина', 'Людмила', 'Галина', 'Марина', 'Вера', 'Надежда',
  'Любовь', 'Зоя', 'Раиса', 'Нина', 'Лариса', 'Тамара', 'Инна', 'Оксана',
  'Алла', 'Евгения', 'Кристина', 'Маргарита', 'Диана', 'Софья', 'Варвара',
  'Ксения', 'Вероника', 'Алёна', 'Яна', 'Карина', 'Милана', 'Арина', 'Ева',
  'Василиса', 'Ульяна', 'Кира', 'Валерия', 'Лидия'
];

const lastNames = [
  'Иванова', 'Петрова', 'Сидорова', 'Смирнова', 'Кузнецова', 'Попова', 'Васильева',
  'Соколова', 'Михайлова', 'Новикова', 'Федорова', 'Морозова', 'Волкова', 'Алексеева',
  'Лебедева', 'Семенова', 'Егорова', 'Павлова', 'Козлова', 'Степанова', 'Николаева',
  'Орлова', 'Андреева', 'Макарова', 'Никитина', 'Захарова', 'Зайцева', 'Соловьева',
  'Борисова', 'Яковлева', 'Григорьева', 'Романова', 'Воробьева', 'Сергеева', 'Фролова',
  'Дмитриева', 'Матвеева', 'Ковалева', 'Белова', 'Комарова', 'Виноградова', 'Баранова',
  'Тарасова', 'Белоусова', 'Калинина', 'Кириллова', 'Максимова', 'Антонова', 'Жукова', 'Крылова'
];

const cities = [
  'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань',
  'Нижний Новгород', 'Челябинск', 'Самара', 'Омск', 'Ростов-на-Дону'
];

const moscowDistricts = [
  'Хамовники', 'Дорогомилово', 'Арбат', 'Тверской', 'Пресненский',
  'Таганский', 'Замоскворечье', 'Якиманка', 'Басманный', 'Красносельский'
];

const interests = [
  'Прогулки в парке', 'Развивающие игры', 'Чтение книг', 'Рисование',
  'Музыка', 'Спорт', 'Йога', 'Кулинария', 'Путешествия', 'Фотография',
  'Танцы', 'Плавание', 'Театр', 'Кино', 'Рукоделие'
];

const avatars = ['👩', '👩‍👧', '👩‍👦', '👩‍👧‍👦', '👩‍👦‍👦', '👶', '🧒', '👧', '🙋‍♀️', '💁‍♀️'];

const postTypes = [
  'need_nanny', 'can_babysit', 'playdate', 'looking_for_friends',
  'offer_help', 'need_help', 'coffee_meetup', 'other'
];

const postDescriptions = {
  need_nanny: [
    'Ищу няню на постоянной основе для ребенка. Опыт работы обязателен.',
    'Требуется няня с проживанием. Хорошие условия, достойная оплата.',
    'Нужна няня на несколько часов в день. График гибкий.',
    'Ищу опытную няню для двоих детей. Рекомендации приветствуются.',
  ],
  can_babysit: [
    'Опытная няня, могу посидеть с ребенком. Педагогическое образование.',
    'Предлагаю услуги няни. Большой опыт работы, есть рекомендации.',
    'Могу помочь с детьми в выходные. Ответственная, внимательная.',
    'Няня с медицинским образованием. Работаю с детьми любого возраста.',
  ],
  playdate: [
    'Ищу компанию для прогулок с детьми. Было бы здорово найти друзей!',
    'Давайте гулять вместе! У меня активный ребенок, ищем друзей.',
    'Организую игровые встречи для детей. Присоединяйтесь!',
    'Ищу семьи с детьми для совместных прогулок и игр.',
  ],
  looking_for_friends: [
    'Переехали недавно в город. Ищу друзей для общения.',
    'Хочу познакомиться с мамами из нашего района.',
    'Ищу единомышленников для общения и совместного досуга.',
    'Новенькая в городе, буду рада новым знакомствам!',
  ],
  coffee_meetup: [
    'Давайте сходим за кофе! Познакомимся, обсудим детские темы.',
    'Организую встречу мам за чашкой кофе. Приходите!',
    'Кофе и общение - что может быть лучше? Жду вас!',
    'Встреча мам в кафе. Обсудим воспитание, поделимся опытом.',
  ],
  offer_help: [
    'Могу помочь с детьми, если нужно срочно отлучиться.',
    'Предлагаю помощь молодым мамам. Есть опыт и желание помочь.',
    'Готова посидеть с ребенком в экстренной ситуации.',
    'Могу помочь с уроками, развивающими занятиями.',
  ],
  need_help: [
    'Нужна помощь на пару часов. Срочно!',
    'Ищу человека, который поможет забрать ребенка из садика.',
    'Нужна помощь с детьми на выходные.',
    'Требуется помощь с домашними заданиями для школьника.',
  ],
  other: [
    'Продаю детские вещи в отличном состоянии.',
    'Отдам детские игрушки даром. Самовывоз.',
    'Меняю детскую коляску на велосипед.',
    'Ищу репетитора по английскому для ребенка.',
  ],
};

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhone(): string {
  return `+7999${randomInt(1000000, 9999999)}`;
}

function generateEmail(firstName: string, lastName: string, index: number): string {
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');
  return `${cleanFirst}.${cleanLast}${index}@example.com`;
}

function generateBio(): string {
  const templates = [
    'Мама замечательного ребенка. Люблю активный отдых и развивающие занятия.',
    'Работаю няней уже много лет. Обожаю детей и свою работу!',
    'Молодая мама, ищу друзей и единомышленников.',
    'Педагог по образованию. Работаю с детьми с удовольствием.',
    'Люблю детей, природу и хорошую компанию.',
  ];
  return randomElement(templates);
}

async function main() {
  console.log('🚀 Начинаем заполнение базы данных...');

  // Очищаем базу данных
  console.log('🗑️  Очищаем существующие данные...');
  await prisma.messageReaction.deleteMany();
  await prisma.message.deleteMany();
  await prisma.match.deleteMany();
  await prisma.boardResponse.deleteMany();
  await prisma.savedPost.deleteMany();
  await prisma.boardPost.deleteMany();
  await prisma.userReaction.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await hashPassword('password123');

  // Создаем 100 пользователей
  console.log('👥 Создаем пользователей...');
  const users = [];
  
  for (let i = 0; i < 100; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const fullName = `${firstName} ${lastName}`;
    const email = generateEmail(firstName, lastName, i);
    const city = randomElement(cities);
    const userType = Math.random() > 0.3 ? 'parent' : 'nanny';
    
    const selectedInterests: string[] = [];
    for (let j = 0; j < randomInt(2, 5); j++) {
      const interest = randomElement(interests);
      if (!selectedInterests.includes(interest)) {
        selectedInterests.push(interest);
      }
    }

    const user = await prisma.user.create({
      data: {
        email,
        phone: generatePhone(),
        password: hashedPassword,
        name: fullName,
        avatar: randomElement(avatars),
        online: Math.random() > 0.7,
        karma: randomInt(0, 200),
        rating: parseFloat((Math.random() * 5).toFixed(1)),
        userType,
        location: city,
        birthDate: `${randomInt(1980, 2000)}-${String(randomInt(1, 12)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`,
        bio: generateBio(),
        interests: JSON.stringify(selectedInterests),
        latitude: 55.7558 + (Math.random() - 0.5) * 0.5,
        longitude: 37.6173 + (Math.random() - 0.5) * 0.5,
      },
    });
    users.push(user);
  }
  console.log(`✅ Создано ${users.length} пользователей`);

  // Создаем тестового пользователя для входа
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      phone: '+79991234567',
      password: hashedPassword,
      name: 'Тестовый Пользователь',
      avatar: '🙋‍♀️',
      online: true,
      karma: 50,
      rating: 4.5,
      userType: 'parent',
      location: 'Москва',
      birthDate: '1990-05-15',
      bio: 'Тестовый аккаунт для демонстрации',
      interests: JSON.stringify(['Прогулки в парке', 'Чтение книг', 'Спорт']),
      latitude: 55.7558,
      longitude: 37.6173,
    },
  });
  users.push(testUser);
  console.log('✅ Создан тестовый пользователь: test@example.com / password123');

  // Создаем матчи (связи между пользователями)
  console.log('🤝 Создаем связи между пользователями...');
  const matches = [];
  const matchCount = 50;
  
  for (let i = 0; i < matchCount; i++) {
    const user1 = randomElement(users);
    const user2 = randomElement(users.filter(u => u.id !== user1.id));
    
    // Проверяем, нет ли уже такого матча
    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          { user1Id: user1.id, user2Id: user2.id },
          { user1Id: user2.id, user2Id: user1.id },
        ],
      },
    });

    if (!existingMatch) {
      const match = await prisma.match.create({
        data: {
          user1Id: user1.id,
          user2Id: user2.id,
          matchedAt: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000),
          active: true,
        },
      });
      matches.push(match);
    }
  }
  console.log(`✅ Создано ${matches.length} связей`);

  // Создаем сообщения для некоторых матчей
  console.log('💬 Создаем сообщения...');
  let messageCount = 0;
  
  for (const match of matches.slice(0, 30)) {
    const numMessages = randomInt(1, 10);
    
    for (let i = 0; i < numMessages; i++) {
      const sender = Math.random() > 0.5 ? match.user1Id : match.user2Id;
      const receiver = sender === match.user1Id ? match.user2Id : match.user1Id;
      
      const messages = [
        'Привет! Как дела?',
        'Отлично, спасибо! А у тебя?',
        'Тоже хорошо!',
        'Может встретимся на этой неделе?',
        'Да, конечно! Когда тебе удобно?',
        'Давай в субботу?',
        'Отлично! До встречи!',
        'Спасибо за помощь!',
        'Всегда пожалуйста 😊',
        'Как прошла встреча?',
      ];
      
      await prisma.message.create({
        data: {
          matchId: match.id,
          senderId: sender,
          receiverId: receiver,
          content: randomElement(messages),
          createdAt: new Date(Date.now() - randomInt(0, 7) * 24 * 60 * 60 * 1000 - randomInt(0, 24) * 60 * 60 * 1000),
          read: Math.random() > 0.3,
        },
      });
      messageCount++;
    }
  }
  console.log(`✅ Создано ${messageCount} сообщений`);

  // Создаем объявления на доске
  console.log('📋 Создаем объявления...');
  const posts = [];
  
  for (let i = 0; i < 30; i++) {
    const author = randomElement(users);
    const type = randomElement(postTypes);
    const city = author.location || randomElement(cities);
    const district = city === 'Москва' ? randomElement(moscowDistricts) : null;
    
    const post = await prisma.boardPost.create({
      data: {
        authorId: author.id,
        type,
        title: type === 'other' ? 'Разное' : undefined,
        description: randomElement(postDescriptions[type as keyof typeof postDescriptions]),
        city,
        district,
        status: Math.random() > 0.2 ? 'active' : 'closed',
        viewCount: randomInt(0, 100),
        createdAt: new Date(Date.now() - randomInt(0, 14) * 24 * 60 * 60 * 1000),
      },
    });
    posts.push(post);
  }
  console.log(`✅ Создано ${posts.length} объявлений`);

  // Создаем отклики на объявления
  console.log('📝 Создаем отклики...');
  let responseCount = 0;
  
  for (const post of posts.filter(p => p.status === 'active')) {
    const numResponses = randomInt(0, 5);
    
    for (let i = 0; i < numResponses; i++) {
      const responder = randomElement(users.filter(u => u.id !== post.authorId));
      
      const responseMessages = [
        'Здравствуйте! Меня заинтересовало ваше объявление.',
        'Добрый день! Хотел бы узнать подробнее.',
        'Привет! Давайте обсудим детали.',
        'Здравствуйте! У меня есть опыт в этом.',
        'Добрый день! Готов помочь!',
      ];
      
      await prisma.boardResponse.create({
        data: {
          postId: post.id,
          responderId: responder.id,
          message: randomElement(responseMessages),
          contacted: Math.random() > 0.5,
          createdAt: new Date(post.createdAt.getTime() + randomInt(1, 48) * 60 * 60 * 1000),
        },
      });
      responseCount++;
    }
  }
  console.log(`✅ Создано ${responseCount} откликов`);

  // Создаем реакции пользователей (лайки)
  console.log('❤️  Создаем реакции...');
  let reactionCount = 0;
  
  for (let i = 0; i < 80; i++) {
    const fromUser = randomElement(users);
    const toUser = randomElement(users.filter(u => u.id !== fromUser.id));
    
    const existingReaction = await prisma.userReaction.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId: fromUser.id,
          toUserId: toUser.id,
        },
      },
    });

    if (!existingReaction) {
      await prisma.userReaction.create({
        data: {
          fromUserId: fromUser.id,
          toUserId: toUser.id,
          type: Math.random() > 0.9 ? 'block' : 'like',
        },
      });
      reactionCount++;
    }
  }
  console.log(`✅ Создано ${reactionCount} реакций`);

  // Создаем отзывы
  console.log('⭐ Создаем отзывы...');
  let reviewCount = 0;
  
  for (let i = 0; i < 40; i++) {
    const user = randomElement(users.filter(u => u.userType === 'nanny'));
    const fromUser = randomElement(users.filter(u => u.id !== user.id));
    
    const comments = [
      'Отличная няня! Очень ответственная и внимательная.',
      'Рекомендую! Ребенок в восторге.',
      'Профессионал своего дела. Спасибо!',
      'Очень довольны работой. Будем обращаться еще.',
      'Замечательный человек и специалист!',
    ];
    
    await prisma.review.create({
      data: {
        userId: user.id,
        fromUserId: fromUser.id,
        fromUserName: fromUser.name,
        rating: randomInt(3, 5),
        comment: randomElement(comments),
        createdAt: new Date(Date.now() - randomInt(0, 60) * 24 * 60 * 60 * 1000),
      },
    });
    reviewCount++;
  }
  console.log(`✅ Создано ${reviewCount} отзывов`);

  console.log('\n🎉 База данных успешно заполнена!');
  console.log('📊 Статистика:');
  console.log(`   👥 Пользователей: ${users.length}`);
  console.log(`   🤝 Связей: ${matches.length}`);
  console.log(`   💬 Сообщений: ${messageCount}`);
  console.log(`   📋 Объявлений: ${posts.length}`);
  console.log(`   📝 Откликов: ${responseCount}`);
  console.log(`   ❤️  Реакций: ${reactionCount}`);
  console.log(`   ⭐ Отзывов: ${reviewCount}`);
  console.log('\n🔑 Тестовый аккаунт:');
  console.log('   Email: test@example.com');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });