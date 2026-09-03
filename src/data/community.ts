/**
 * 学习社区统一数据源
 *
 * 集中定义社区所需的类型、种子用户/帖子/话题/排行榜/小队/消息数据，
 * 供 Community 布局、Feed / Explore / PostDetail / Leaderboard / Teams / Messages 等页面共享，
 * 避免各页面各自维护数据导致不一致。
 */

// ===== 用户 =====
export interface CommunityUser {
  id: string;
  name: string;
  avatar: string; // emoji 头像（种子用户）或首字母（账号用户）
  avatarBg: string; // tailwind 渐变色 class
  bio: string;
  level: number; // 学习等级 1-10
  levelTitle: string; // 等级称号
  xp: number; // 总经验
  streak: number; // 连胜天数
  followers: number;
  following: number;
  isFollowing?: boolean;
  /** 账号用户：头像背景色（hex），存在时 UserAvatar 渲染为纯色圆形 + 首字母 */
  avatarColor?: string;
  /** 账号用户：标记该用户来自邮箱账号体系 */
  isAccount?: boolean;
}

// ===== 评论（支持楼中楼） =====
export interface PostComment {
  id: string;
  author: CommunityUser;
  content: string;
  likes: number;
  time: string;
  createdAt: number;
  replies: PostComment[];
}

// ===== 帖子 =====
export type PostType = 'post' | 'question' | 'checkin';

export interface PostCard {
  icon: string;
  title: string;
  content: string;
  gradient: string;
}

export interface Post {
  id: string;
  type: PostType;
  author: CommunityUser;
  content: string;
  card?: PostCard; // 打卡/成果卡片
  topic: string; // 所属话题名
  topicColor: string;
  tags: string[];
  images: number; // 配图数量（模拟）
  likes: number;
  comments: PostComment[];
  saves: number;
  views: number;
  shares: number;
  time: string;
  createdAt: number;
  liked?: boolean;
  saved?: boolean;
  isTop?: boolean;
  isHot?: boolean;
}

// ===== 话题（板块） =====
export interface CommunityTopic {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  posts: number;
  members: number;
  subscribed?: boolean;
}

// ===== 排行榜 =====
export interface LeaderboardEntry {
  user: CommunityUser;
  xp: number;
  minutes: number;
  streak: number;
}

// ===== 学习小队 =====
export interface Team {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  members: number;
  totalMembers: number;
  goalMinutes: number;
  doneMinutes: number;
  rank: number;
  joined?: boolean;
}

// ===== 消息通知 =====
export type NotificationType = 'like' | 'comment' | 'follow' | 'system' | 'team';

export interface Notification {
  id: string;
  type: NotificationType;
  icon: string;
  text: string;
  time: string;
  read: boolean;
}

// ===== 收藏夹 =====
export interface FavoriteCollection {
  id: string;
  name: string;
  icon: string; // emoji 图标
  color: string; // 主题色（hex）
  createdAt: number;
}

// ===== 收藏记录（一条帖子可同时属于多个收藏夹） =====
export interface SavedPostRecord {
  postId: string;
  collectionIds: string[]; // 所属收藏夹；为空表示未分类
  savedAt: number; // 收藏时间（最近一次收藏）
}

// 收藏列表视图（含收藏时间与所属收藏夹）
export interface SavedPostView {
  post: Post;
  savedAt: number;
  collectionIds: string[];
}

// ===== 话题收藏记录（一条话题可同时属于多个收藏夹） =====
export interface SavedTopicRecord {
  topicId: string;
  collectionIds: string[];
  savedAt: number; // 收藏时间（最近一次收藏）
}

export interface SavedTopicView {
  topic: CommunityTopic;
  savedAt: number;
  collectionIds: string[];
}

// 收藏统一视图（帖子 + 话题 混排）
export interface SavedItemView {
  kind: 'post' | 'topic';
  post?: Post;
  topic?: CommunityTopic;
  savedAt: number;
  collectionIds: string[];
}

// ===== 种子用户 =====
export const SEED_USERS: CommunityUser[] = [
  {
    id: 'u_amy', name: 'Amy Lee', avatar: '🦊', avatarBg: 'from-amber-400 to-orange-500',
    bio: 'IELTS 7.5 | 每天 30 分钟口语打卡', level: 8, levelTitle: '口语大师', xp: 12450, streak: 45,
    followers: 892, following: 156,
  },
  {
    id: 'u_david', name: 'David Chen', avatar: '🐼', avatarBg: 'from-slate-500 to-slate-700',
    bio: '外企打工人，专注商务英语', level: 6, levelTitle: '进阶达人', xp: 8620, streak: 23,
    followers: 431, following: 208,
  },
  {
    id: 'u_sarah', name: 'Sarah Johnson', avatar: '🦉', avatarBg: 'from-violet-500 to-purple-600',
    bio: '前雅思口语考官 | 免费答疑', level: 9, levelTitle: '社区导师', xp: 18600, streak: 120,
    followers: 2310, following: 89,
  },
  {
    id: 'u_yuki', name: 'Yuki T.', avatar: '🐱', avatarBg: 'from-pink-400 to-rose-500',
    bio: '留学生 | 从 A2 到 B2 的进阶之路', level: 5, levelTitle: '进阶达人', xp: 6480, streak: 31,
    followers: 267, following: 342,
  },
  {
    id: 'u_carlos', name: 'Carlos R.', avatar: '🐯', avatarBg: 'from-emerald-400 to-teal-600',
    bio: '备考托福中，目标 105+', level: 4, levelTitle: '勤学之星', xp: 3890, streak: 12,
    followers: 98, following: 176,
  },
  {
    id: 'u_li', name: '李老师英语', avatar: '👩‍🏫', avatarBg: 'from-indigo-400 to-blue-600',
    bio: '10 年一线教学经验 | 分享提分干货', level: 10, levelTitle: '社区导师', xp: 25000, streak: 200,
    followers: 5210, following: 45,
  },
  {
    id: 'u_mike', name: 'Mike C.', avatar: '🐻', avatarBg: 'from-blue-400 to-cyan-600',
    bio: '程序员，目标是能顺畅开英语会议', level: 3, levelTitle: '勤学之星', xp: 2140, streak: 7,
    followers: 64, following: 233,
  },
  {
    id: 'u_lisa', name: 'Lisa Wang', avatar: '🐰', avatarBg: 'from-fuchsia-400 to-pink-600',
    bio: '宝妈 | 和孩子一起学英语', level: 5, levelTitle: '进阶达人', xp: 5820, streak: 18,
    followers: 356, following: 121,
  },
];

export function getUserById(id: string): CommunityUser {
  return SEED_USERS.find((u) => u.id === id) || SEED_USERS[0];
}

// ===== 种子帖子 =====
const now = Date.now();
const h = 3600_000;
const d = 24 * h;

export const SEED_POSTS: Post[] = [
  {
    id: 'p_1',
    type: 'post',
    author: getUserById('u_li'),
    content:
      '很多同学雅思口语 Part 2 一紧张就思路混乱。分享一个百试不爽的 4 步框架：\n① Opening——一句话概括你要讲的经历\n② When & Where——交代时间地点\n③ What happened——描述具体经过（加细节）\n④ Why special——结尾点明为什么难忘\n\n把框架练成肌肉记忆，考场上就不会卡壳了！',
    topic: '备考攻略', topicColor: '#f59e0b',
    tags: ['雅思', '口语技巧'],
    images: 0,
    likes: 356, comments: [
      {
        id: 'c_1_1', author: getUserById('u_carlos'), content: '太实用了！请问第③步怎么加细节？我总是两句话就讲完了。', likes: 12, time: '1h ago', createdAt: now - h, replies: [
          { id: 'c_1_1_1', author: getUserById('u_li'), content: '可以用 "5W1H" 追问自己：Who / What / Where / When / Why / How，每个角度补一句，内容自然就丰满了。', likes: 28, time: '50m ago', createdAt: now - 50 * 60000, replies: [] },
        ],
      },
      { id: 'c_1_2', author: getUserById('u_yuki'), content: '收藏了！下次练习就用这个框架试试。', likes: 6, time: '40m ago', createdAt: now - 40 * 60000, replies: [] },
    ],
    saves: 189, views: 3200, shares: 56, time: '3h ago', createdAt: now - 3 * h, liked: false, saved: false, isTop: true,
  },
  {
    id: 'p_2',
    type: 'question',
    author: getUserById('u_mike'),
    content: '下个月要在全英文的周会上汇报项目进度，特别紧张。想请教大家：\n1. 有哪些必会的会议开场白和结束语？\n2. 听不懂同事提问时，怎么礼貌地请对方重复？\n3. 你们一般在 VerbFlow 练哪个场景？我想针对性练一下。',
    topic: '职场英语', topicColor: '#6366f1',
    tags: ['商务会议', '求助'],
    images: 0,
    likes: 23, comments: [
      {
        id: 'c_2_1', author: getUserById('u_david'), content: '推荐几个救场神句："Could you say that again, please?"、"Just to clarify, you mean...?"、"Let me circle back to that." 会议卡壳用这些就够了。', likes: 45, time: '2h ago', createdAt: now - 2 * h, replies: [
          { id: 'c_2_1_1', author: getUserById('u_mike'), content: '感谢！"circle back" 太地道了，马上背下来。', likes: 8, time: '1h ago', createdAt: now - h, replies: [] },
        ],
      },
      { id: 'c_2_2', author: getUserById('u_sarah'), content: '建议先用 VerbFlow 的 "Job Interview" 场景热身，里面的问答节奏和会议很接近；再配合 "Phone Conversation" 练临场反应。', likes: 31, time: '90m ago', createdAt: now - 90 * 60000, replies: [] },
    ],
    saves: 45, views: 890, shares: 12, time: '5h ago', createdAt: now - 5 * h, liked: false, saved: false,
  },
  {
    id: 'p_3',
    type: 'checkin',
    author: getUserById('u_amy'),
    content: '第 45 天连续打卡达成！今天用 VerbFlow 练了 "At the Airport" 场景，拿了 92 分，比上周高了 8 分。发音一直被纠的 "boarding pass" 终于顺了。',
    card: {
      icon: '🔥', title: '45 天连胜', content: 'Airport 场景得分 92（+8）', gradient: 'from-orange-400 to-rose-500',
    },
    topic: '每日打卡', topicColor: '#10b981',
    tags: ['打卡', 'Airport'],
    images: 1,
    likes: 128, comments: [
      { id: 'c_3_1', author: getUserById('u_lisa'), content: '太自律了！向你学习，我要把连胜续上。', likes: 10, time: '30m ago', createdAt: now - 30 * 60000, replies: [] },
    ],
    saves: 23, views: 450, shares: 8, time: '6h ago', createdAt: now - 6 * h, liked: false, saved: false,
  },
  {
    id: 'p_4',
    type: 'post',
    author: getUserById('u_sarah'),
    content:
      '作为前口语考官，分享几个中国考生最常见的发音误区：\n\n1. /θ/ 和 /ð/：不要读成 /s/ 和 /z/，舌尖要轻触上齿\n2. 重音位置："DEvelopment" 重音在第二音节\n3. 尾音丢失：单词结尾的 /t/ /d/ /k/ 要发出来\n\n每天抽 5 分钟用 VerbFlow 的语音反馈练一练，一个月就能看到明显变化。',
    topic: '口语练习', topicColor: '#ec4899',
    tags: ['发音', '干货'],
    images: 0,
    likes: 512, comments: [
      { id: 'c_4_1', author: getUserById('u_yuki'), content: '老师讲得太对了，th 音我练了整整两周才找到感觉。', likes: 18, time: '2h ago', createdAt: now - 2 * h, replies: [] },
    ],
    saves: 305, views: 4100, shares: 120, time: '8h ago', createdAt: now - 8 * h, liked: false, saved: false, isHot: true,
  },
  {
    id: 'p_5',
    type: 'checkin',
    author: getUserById('u_carlos'),
    content: '今天完成 VerbFlow 的 "Doctor\'s Visit" 场景，学会怎么描述症状了。以前只会说 "I feel bad"，现在能说出 "I have a sharp pain in my chest"。每天都在进步！',
    card: {
      icon: '📈', title: '词汇 +6', content: 'Medical 场景新掌握 6 个高频词汇', gradient: 'from-emerald-400 to-teal-600',
    },
    topic: '每日打卡', topicColor: '#10b981',
    tags: ['打卡', 'Medical'],
    images: 0,
    likes: 45, comments: [
      { id: 'c_5_1', author: getUserById('u_sarah'), content: '进步肉眼可见，注意 "sharp pain" 一般形容刺痛，表达很准确！', likes: 15, time: '1h ago', createdAt: now - h, replies: [] },
    ],
    saves: 12, views: 320, shares: 3, time: '12h ago', createdAt: now - 12 * h, liked: false, saved: false,
  },
  {
    id: 'p_6',
    type: 'post',
    author: getUserById('u_david'),
    content: '整理了一份自己用下来的播客清单，适合 3 个月以上基础的学习者：\n\n🎧 6 Minute English（BBC）—— 每周 2 期，话题新鲜\n🎧 All Ears English —— 口语化，讲地道表达\n🎧 The English We Speak —— 每期 3 分钟讲一个短语\n\n建议用 0.9 倍速精听 + 影子跟读，效果最好。',
    topic: '资源分享', topicColor: '#06b6d4',
    tags: ['听力', '资源推荐'],
    images: 0,
    likes: 289, comments: [
      { id: 'c_6_1', author: getUserById('u_lisa'), content: 'All Ears English 真的强推，开车路上听很合适。', likes: 9, time: '3h ago', createdAt: now - 3 * h, replies: [] },
    ],
    saves: 176, views: 2300, shares: 88, time: '1d ago', createdAt: now - d, liked: false, saved: false,
  },
  {
    id: 'p_7',
    type: 'question',
    author: getUserById('u_yuki'),
    content: '来美国一个月了，发现上课讨论时别人说话又快又连读，我经常插不上话。想问问大家：\n1. 有没有练听力的好方法？\n2. 想发表观点但不知道怎么说，有什么万能句型吗？',
    topic: '留学申请', topicColor: '#8b5cf6',
    tags: ['留学生活', '求助'],
    images: 0,
    likes: 67, comments: [
      { id: 'c_7_1', author: getUserById('u_sarah'), content: '万能句型来了："I\'d like to add that..."、"Building on what X said..."、"From my perspective..."。加上衔接词，发言立刻专业。', likes: 40, time: '2h ago', createdAt: now - 2 * h, replies: [] },
    ],
    saves: 58, views: 760, shares: 15, time: '1d ago', createdAt: now - d, liked: false, saved: false,
  },
  {
    id: 'p_8',
    type: 'post',
    author: getUserById('u_lisa'),
    content: '带 8 岁女儿一起学英语的第 3 个月。总结几个小经验：\n\n1. 每天固定 15 分钟，比周末补 2 小时有效\n2. 用 VerbFlow 儿童向场景角色扮演，孩子以为是游戏\n3. 多鼓励少纠错，兴趣最重要\n\n欢迎宝妈宝爸们一起交流！',
    topic: '每日打卡', topicColor: '#10b981',
    tags: ['亲子英语', '经验'],
    images: 2,
    likes: 198, comments: [
      { id: 'c_8_1', author: getUserById('u_amy'), content: '同款妈妈！孩子现在每天主动要求"玩英语"。', likes: 12, time: '5h ago', createdAt: now - 5 * h, replies: [] },
    ],
    saves: 92, views: 1500, shares: 34, time: '2d ago', createdAt: now - 2 * d, liked: false, saved: false,
  },
  {
    id: 'p_9',
    type: 'checkin',
    author: getUserById('u_mike'),
    content: '第一次用 AI 面试模拟场景，紧张到手抖，但练完真的有用！AI 问的问题和真实面试差不多，而且每句都会给我纠音反馈。下次目标是敢开口说 5 分钟。',
    card: {
      icon: '🎯', title: '首次模拟面试', content: 'Job Interview 场景 · 8 轮对话', gradient: 'from-indigo-400 to-blue-600',
    },
    topic: '每日打卡', topicColor: '#10b981',
    tags: ['打卡', 'Interview'],
    images: 0,
    likes: 34, comments: [], saves: 6, views: 210, shares: 2, time: '2d ago', createdAt: now - 2 * d, liked: false, saved: false,
  },
  {
    id: 'p_10',
    type: 'post',
    author: getUserById('u_amy'),
    content: '分享一下我的每日英语日程（上班族友好版）：\n\n☀️ 早 8:00 通勤路上听 1 集播客（泛听）\n🍳 午休 12:30 VerbFlow 练 1 个场景（15 分钟）\n🌙 晚 21:00 复盘 AI 纠错 + 影子跟读（10 分钟）\n\n关键是"少食多餐"，每天加起来 30 分钟就够。坚持 45 天，口语真的有质变！',
    topic: '口语练习', topicColor: '#ec4899',
    tags: ['学习方法', '时间管理'],
    images: 0,
    likes: 421, comments: [
      { id: 'c_10_1', author: getUserById('u_carlos'), content: '照抄了，通勤听播客这个习惯太值得学。', likes: 22, time: '4h ago', createdAt: now - 4 * h, replies: [] },
    ],
    saves: 260, views: 3800, shares: 145, time: '3d ago', createdAt: now - 3 * d, liked: false, saved: false, isHot: true,
  },
];

// ===== 种子话题 =====
export const SEED_TOPICS: CommunityTopic[] = [
  {
    id: 'checkin', name: '每日打卡', icon: '🔥', color: '#10b981',
    description: '分享你的每日学习进度，用坚持见证成长', posts: 12840, members: 3260,
  },
  {
    id: 'speaking', name: '口语练习', icon: '🗣️', color: '#ec4899',
    description: '发音、流利度、口语技巧交流与答疑', posts: 9630, members: 2850,
  },
  {
    id: 'exam', name: '备考攻略', icon: '📚', color: '#f59e0b',
    description: '雅思、托福、四六级备考经验与资料', posts: 7215, members: 1980,
  },
  {
    id: 'career', name: '职场英语', icon: '💼', color: '#6366f1',
    description: '商务会议、邮件、面试等职场场景英语', posts: 5480, members: 1670,
  },
  {
    id: 'study_abroad', name: '留学申请', icon: '🎓', color: '#8b5cf6',
    description: '留学申请、海外生活、学术英语交流', posts: 3920, members: 1240,
  },
  {
    id: 'resources', name: '资源分享', icon: '📎', color: '#06b6d4',
    description: '好用的学习工具、播客、网站与书单', posts: 4610, members: 1530,
  },
];

// ===== 排行榜（周榜） =====
export const SEED_LEADERBOARD: LeaderboardEntry[] = [
  { user: getUserById('u_amy'), xp: 1280, minutes: 210, streak: 45 },
  { user: getUserById('u_david'), xp: 960, minutes: 175, streak: 23 },
  { user: getUserById('u_yuki'), xp: 850, minutes: 160, streak: 31 },
  { user: getUserById('u_lisa'), xp: 720, minutes: 140, streak: 18 },
  { user: getUserById('u_carlos'), xp: 610, minutes: 130, streak: 12 },
  { user: getUserById('u_mike'), xp: 540, minutes: 115, streak: 7 },
];

// ===== 学习小队 =====
export const SEED_TEAMS: Team[] = [
  {
    id: 't_1', name: '早起打卡组', icon: '🌅', color: 'from-amber-400 to-orange-500',
    description: '每天 7:30 前完成 15 分钟口语练习，互相监督', members: 23, totalMembers: 30,
    goalMinutes: 450, doneMinutes: 382, rank: 1,
  },
  {
    id: 't_2', name: '雅思冲 7 分队', icon: '🎯', color: 'from-indigo-400 to-blue-600',
    description: '备考雅思，每日分享口语题库练习与心得', members: 18, totalMembers: 25,
    goalMinutes: 360, doneMinutes: 296, rank: 2,
  },
  {
    id: 't_3', name: '职场英语互助会', icon: '💼', color: 'from-violet-400 to-purple-600',
    description: '商务场景角色扮演，每周一次线上模拟会议', members: 15, totalMembers: 20,
    goalMinutes: 300, doneMinutes: 218, rank: 3,
  },
  {
    id: 't_4', name: '零基础起步班', icon: '🌱', color: 'from-emerald-400 to-teal-600',
    description: '适合入门学习者，从日常对话场景一点点进步', members: 12, totalMembers: 15,
    goalMinutes: 225, doneMinutes: 141, rank: 4,
  },
];

// ===== 消息通知 =====
export const SEED_NOTIFICATIONS: Notification[] = [
  { id: 'n_1', type: 'like', icon: '❤️', text: 'Sarah Johnson 赞了你的帖子《45 天连胜打卡》', time: '10m ago', read: false },
  { id: 'n_2', type: 'comment', icon: '💬', text: 'Carlos R. 回复了你的评论：太实用了，谢谢！', time: '1h ago', read: false },
  { id: 'n_3', type: 'follow', icon: '👥', text: 'Lisa Wang 关注了你', time: '3h ago', read: false },
  { id: 'n_4', type: 'team', icon: '🏆', text: '你的小队「早起打卡组」本周达成 85% 目标，继续保持！', time: '5h ago', read: true },
  { id: 'n_5', type: 'system', icon: '🎉', text: '恭喜获得「连续打卡 7 天」徽章，继续加油！', time: '1d ago', read: true },
  { id: 'n_6', type: 'system', icon: '📅', text: '今日学习计划已生成：Airport 场景 · 词汇复习 · 纠错复盘', time: '2d ago', read: true },
];

// ===== 我的关注（种子） =====
export const SEED_FOLLOWING = ['u_sarah', 'u_li', 'u_amy'];

// ===== 我的收藏夹（种子） =====
export const SEED_FAVORITE_COLLECTIONS: FavoriteCollection[] = [
  { id: 'fc_speaking', name: '口语素材', icon: '🎙️', color: '#6366f1', createdAt: now - 30 * d },
  { id: 'fc_exam', name: '备考资料', icon: '📚', color: '#f59e0b', createdAt: now - 20 * d },
  { id: 'fc_life', name: '灵感收藏', icon: '💡', color: '#ec4899', createdAt: now - 10 * d },
];

// ===== 我的收藏（种子，指向帖子 id + 收藏夹 + 时间） =====
export const SEED_SAVED_RECORDS: SavedPostRecord[] = [
  { postId: 'p_1', collectionIds: ['fc_speaking'], savedAt: now - 2 * d },
  { postId: 'p_4', collectionIds: ['fc_speaking', 'fc_exam'], savedAt: now - 3 * d },
  { postId: 'p_6', collectionIds: ['fc_exam', 'fc_life'], savedAt: now - 1 * d },
];

// ===== 收藏的话题（种子） =====
export const SEED_SAVED_TOPIC_RECORDS: SavedTopicRecord[] = [
  { topicId: 'exam', collectionIds: ['fc_exam'], savedAt: now - 5 * d },
  { topicId: 'career', collectionIds: ['fc_speaking', 'fc_life'], savedAt: now - 2 * d },
];
