const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');

// 環境変数を読み込む
dotenv.config();

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('環境変数が設定されていません。');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('環境変数の読み込みが完了しました。');

const supabase = createClient(supabaseUrl, supabaseKey);

// ダミーデータの設定
const NUM_USERS = 50;
const MIN_LISTS_PER_USER = 5;
const NUM_THEMES = 30;
const THEME_TO_ORIGINAL_RATIO = 0.6; // 6:4の割合

// 過去3ヶ月以内のランダムな日付を生成
const getRandomDate = () => {
  const now = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(now.getMonth() - 3);

  const randomTimestamp = threeMonthsAgo.getTime() + Math.random() * (now.getTime() - threeMonthsAgo.getTime());
  return new Date(randomTimestamp).toISOString();
};

// ランダムな日本語の名前を生成
const generateJapaneseName = () => {
  const firstNames = [
    '翔太', '健太', '大輔', '拓也', '直樹', '裕太', '和也', '達也', '智也', '雄太',
    '美咲', '彩花', '優花', '真由', '麻衣', '愛美', '沙織', '千尋', '菜々子', '優子'
  ];
  const lastNames = [
    '佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤',
    '吉田', '山田', '佐々木', '山口', '松本', '井上', '木村', '林', '斎藤', '清水'
  ];
  return `${lastNames[Math.floor(Math.random() * lastNames.length)]} ${firstNames[Math.floor(Math.random() * firstNames.length)]}`;
};

// ランダムなテーマ名を生成
const generateThemeName = () => {
  const themes = [
    '旅行', '料理', '映画', '音楽', '本', 'アニメ', 'ゲーム', 'スポーツ', 'ファッション', '美容',
    'インテリア', 'ガジェット', 'プログラミング', '写真', '絵画', '工芸', 'ガーデニング', 'ペット', '車', 'バイク',
    '健康', 'ヨガ', '瞑想', '占い', '歴史', '科学', '宇宙', '哲学', '心理学', '言語',
    '建築', 'デザイン', '文学', '詩', '演劇', 'ダンス', '漫画', 'コスプレ', 'カフェ', 'お酒',
    '文房具', '手帳', 'DIY', 'キャンプ', '登山', '釣り', 'サーフィン', 'スキー', 'スノーボード', 'マラソン'
  ];
  return themes[Math.floor(Math.random() * themes.length)];
};

// ランダムなリストコンテンツを生成
const generateListContent = (isTaskList = false) => {
  const listTypes = ['<ul>', '<ol>'];
  const listType = isTaskList ? '<ul class="task-list">' : listTypes[Math.floor(Math.random() * listTypes.length)];
  const endTag = listType === '<ul class="task-list">' ? '</ul>' : listType === '<ul>' ? '</ul>' : '</ol>';

  const numItems = Math.floor(Math.random() * 7) + 3; // 3〜10個のアイテム
  let items = '';

  for (let i = 0; i < numItems; i++) {
    if (isTaskList) {
      const checked = Math.random() > 0.5 ? 'checked' : '';
      items += `<li class="task-list-item"><input type="checkbox" ${checked} disabled /> アイテム ${i + 1} の説明文です。</li>\n`;
    } else {
      items += `<li>リストアイテム ${i + 1} の説明文です。ここにはさまざまな内容が入ります。</li>\n`;
    }
  }

  return `${listType}\n${items}${endTag}`;
};

// ランダムなブログタイトルを生成
const generateBlogTitle = () => {
  const adjectives = ['素敵な', '面白い', '驚きの', '感動の', '魅力的な', '不思議な', '心温まる', '刺激的な', '癒される', '爽快な'];
  const nouns = ['体験', '発見', '冒険', '思い出', '瞬間', '出来事', '風景', '場所', '人々', '物語'];

  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}`;
};

// Unsplashからランダムな画像URLを取得
const getRandomUnsplashImage = (keyword = '') => {
  const width = 640;
  const height = 360;
  const searchTerm = keyword || ['nature', 'city', 'food', 'travel', 'technology', 'people'][Math.floor(Math.random() * 6)];
  return `https://source.unsplash.com/random/${width}x${height}?${searchTerm}`;
};

// ダミーデータの生成と挿入
const generateDummyData = async () => {
  try {
    console.log('ダミーデータの生成を開始します...');

    // 1. テーマの生成
    console.log(`${NUM_THEMES}個のテーマを生成中...`);
    const themeNames = new Set();
    while (themeNames.size < NUM_THEMES) {
      themeNames.add(generateThemeName());
    }

    const themes = Array.from(themeNames).map((name) => ({
      id: uuidv4(),
      name,
      description: `${name}に関する様々なコレクションを共有しましょう。`,
      image_url: getRandomUnsplashImage(String(name)),
      created_at: getRandomDate(),
      updated_at: getRandomDate()
    }));

    // テーマをデータベースに挿入
    const { error: themesError } = await supabase
      .from('themes')
      .upsert(themes, { onConflict: 'name' });

    if (themesError) {
      console.error('テーマの挿入中にエラーが発生しました:', themesError);
      return;
    }

    console.log(`${themes.length}個のテーマを生成しました。`);

    // 2. ユーザーの生成
    console.log(`${NUM_USERS}人のユーザーを生成中...`);
    const users = [];

    // 匿名キーを使用している場合は、ユーザー作成をスキップ
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      for (let i = 0; i < NUM_USERS; i++) {
        const name = generateJapaneseName();
        const email = `user${i + 1}@example.com`;

        // ユーザーを認証テーブルに追加
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email,
          password: 'password123',
          email_confirm: true
        });

        if (authError) {
          console.error(`ユーザー ${email} の作成中にエラーが発生しました:`, authError);
          continue;
        }

        const userId = authUser.user.id;

        // プロフィールを作成
        const user = {
          id: userId,
          name,
          email,
          avatar_url: `https://i.pravatar.cc/150?u=${userId}`,
          created_at: getRandomDate(),
          updated_at: getRandomDate()
        };

        users.push(user);

        // プロフィールをデータベースに挿入
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(user);

        if (profileError) {
          console.error(`プロフィール ${name} の挿入中にエラーが発生しました:`, profileError);
        }
      }
    } else {
      console.log('SUPABASE_SERVICE_ROLE_KEYが設定されていないため、ユーザー作成をスキップします。');
      console.log('既存のユーザーIDを使用してテーマアイテムとブログを生成します。');

      // 既存のユーザーを取得
      const { data: existingUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .limit(5);

      if (usersError || !existingUsers || existingUsers.length === 0) {
        console.error('既存のユーザーの取得に失敗しました:', usersError);
        return;
      }

      users.push(...existingUsers);
    }

    console.log(`${users.length}人のユーザーを使用します。`);

    // 3. ブログ（オリジナルテーマ）とテーマアイテムの生成
    console.log('ブログとテーマアイテムを生成中...');

    // テーマIDを取得
    const { data: themeData, error: themeError } = await supabase
      .from('themes')
      .select('id, name');

    if (themeError || !themeData || themeData.length === 0) {
      console.error('テーマデータの取得に失敗しました:', themeError);
      return;
    }

    let totalBlogs = 0;
    let totalThemeItems = 0;

    // 各ユーザーに対してリストを生成
    for (const user of users) {
      // 各ユーザーが作成するリストの総数（最低5個）
      const totalLists = Math.floor(Math.random() * 5) + MIN_LISTS_PER_USER;

      // テーマアイテムの数（6:4の割合）
      const themeItemsCount = Math.round(totalLists * THEME_TO_ORIGINAL_RATIO);
      const blogsCount = totalLists - themeItemsCount;

      // テーマアイテムの生成
      for (let i = 0; i < themeItemsCount; i++) {
        // ランダムなテーマを選択
        const randomTheme = themeData[Math.floor(Math.random() * themeData.length)];
        const isTaskList = Math.random() > 0.7; // 30%の確率でタスクリスト
        const list = generateListContent(isTaskList);
        const createdAt = getRandomDate();
        const updatedAt = new Date(new Date(createdAt).getTime() + Math.random() * 86400000 * 30).toISOString(); // 作成日から最大30日後

        const themeItem = {
          theme_id: randomTheme.id,
          user_id: user.id,
          content: `${randomTheme.name}についての${i + 1}番目のリスト`,
          list,
          created_at: createdAt,
          updated_at: updatedAt
        };

        // テーマアイテムをデータベースに挿入
        const { error: themeItemError } = await supabase
          .from('theme_items')
          .insert(themeItem);

        if (themeItemError) {
          console.error('テーマアイテムの挿入中にエラーが発生しました:', themeItemError);
        } else {
          totalThemeItems++;
        }
      }

      // ブログ（オリジナルテーマ）の生成
      for (let i = 0; i < blogsCount; i++) {
        const title = generateBlogTitle();
        const isTaskList = Math.random() > 0.5; // 50%の確率でタスクリスト
        const list = generateListContent(isTaskList);
        const createdAt = getRandomDate();
        const updatedAt = new Date(new Date(createdAt).getTime() + Math.random() * 86400000 * 30).toISOString(); // 作成日から最大30日後

        const blog = {
          title,
          user_id: user.id,
          image_url: getRandomUnsplashImage(),
          list,
          created_at: createdAt,
          updated_at: updatedAt
        };

        // ブログをデータベースに挿入
        const { error: blogError } = await supabase
          .from('blogs')
          .insert(blog);

        if (blogError) {
          console.error('ブログの挿入中にエラーが発生しました:', blogError);
        } else {
          totalBlogs++;
        }
      }
    }

    console.log(`${totalBlogs}個のブログと${totalThemeItems}個のテーマアイテムを生成しました。`);
    console.log('ダミーデータの生成が完了しました！');

  } catch (error) {
    console.error('ダミーデータの生成中にエラーが発生しました:', error);
  }
};

// スクリプトの実行
generateDummyData();
