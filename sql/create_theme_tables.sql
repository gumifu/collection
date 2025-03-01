-- テーマテーブルの作成
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- テーマアイテムテーブルの作成
CREATE TABLE theme_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  list TEXT,
  theme_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLSポリシーの設定
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_items ENABLE ROW LEVEL SECURITY;

-- テーマの読み取りポリシー（全ユーザー）
CREATE POLICY "テーマは誰でも閲覧可能" ON themes
  FOR SELECT USING (true);

-- テーマの作成ポリシー（認証済みユーザー）
CREATE POLICY "テーマは認証済みユーザーが作成可能" ON themes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- テーマの更新ポリシー（認証済みユーザー）
CREATE POLICY "テーマは認証済みユーザーが更新可能" ON themes
  FOR UPDATE USING (auth.role() = 'authenticated');

-- テーマの削除ポリシー（認証済みユーザー）
CREATE POLICY "テーマは認証済みユーザーが削除可能" ON themes
  FOR DELETE USING (auth.role() = 'authenticated');

-- テーマアイテムの読み取りポリシー（全ユーザー）
CREATE POLICY "テーマアイテムは誰でも閲覧可能" ON theme_items
  FOR SELECT USING (true);

-- テーマアイテムの作成ポリシー（認証済みユーザー）
CREATE POLICY "テーマアイテムは認証済みユーザーのみ作成可能" ON theme_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- テーマアイテムの更新ポリシー（自分のアイテムのみ）
CREATE POLICY "テーマアイテムは自分のみ更新可能" ON theme_items
  FOR UPDATE USING (auth.uid() = user_id);

-- テーマアイテムの削除ポリシー（自分のアイテムのみ）
CREATE POLICY "テーマアイテムは自分のみ削除可能" ON theme_items
  FOR DELETE USING (auth.uid() = user_id);

-- 更新時のタイムスタンプを自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- テーマテーブルの更新時にタイムスタンプを更新するトリガー
CREATE TRIGGER update_themes_timestamp
BEFORE UPDATE ON themes
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- テーマアイテムテーブルの更新時にタイムスタンプを更新するトリガー
CREATE TRIGGER update_theme_items_timestamp
BEFORE UPDATE ON theme_items
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- サンプルデータの挿入
INSERT INTO themes (name, description) VALUES
('映画10選', '好きな映画を10個選んで共有しましょう'),
('好きなお店(東京)', '東京で好きなお店を紹介してください'),
('好きなお店(福岡)', '福岡で好きなお店を紹介してください'),
('おすすめの本', 'あなたのおすすめの本を教えてください'),
('行ってみたい国', '行ってみたい国とその理由を教えてください'),
('趣味のコレクション', 'あなたのコレクションを紹介してください');
