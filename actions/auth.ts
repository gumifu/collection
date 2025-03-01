"use server"

import { LoginSchema, ResetPasswordSchema, SignupSchema, PasswordSchema } from "@/schemas"
import { createClient } from "@/utils/supabase/server"
import { z } from "zod"

// アカウント作成
export const signup = async (values: z.infer<typeof SignupSchema>) => {
  try {
    // createClient は非同期関数と仮定して await で待機する
    const supabase = await createClient()

    // アカウント作成
    const { data, error: signupError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/signup/verify`,
      },
    })

    // ユーザー作成後の処理
    if (data && data.user) {
      if (data.user.identities && data.user.identities.length > 0) {
        console.log("アカウントを作成しました")
      } else {
        return {
          error:
            "このメールアドレスは既に登録されています。他のメールアドレスを使用して、アカウントを作成してください",
        }
      }
    } else if (signupError) {
      // signupError が存在する場合、エラーメッセージを返す
      return { error: signupError.message }
    }

    // プロフィールの名前を更新
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ name: values.name })
      .eq("id", data?.user?.id)

    // プロフィール更新エラーのチェック
    if (updateError) {
      return { error: updateError.message }
    }
  } catch (err) {
    console.error(err)
    return { error: "エラーが発生しました" }
  }
}

// ログイン
export const login = async (values: z.infer<typeof LoginSchema>) => {
  try {
    const supabase = await createClient()

    // ログイン
    const { error } = await supabase.auth.signInWithPassword({
      ...values,
    })

    if (error) {
      // エラーメッセージを日本語に変換
      const errorMessages: Record<string, string> = {
        "Invalid login credentials": "メールアドレスまたはパスワードが間違っています。",
        "User not found": "ユーザーが見つかりません。",
        "User already registered": "このメールアドレスは既に登録されています。",
        "Email not confirmed": "メールアドレスが確認されていません。",
        "Too many requests": "短時間での試行回数が多すぎます。しばらくしてからお試しください。",
      }

      return { error: errorMessages[error.message] || "ログインに失敗しました。" }
    }
  } catch (err) {
    console.error(err)
    return { error: "エラーが発生しました" }
  }
}

// パスワード再設定
export const resetPassword = async (
  values: z.infer<typeof ResetPasswordSchema>
) => {
  try {
    const supabase = await createClient()

    // パスワード再設定
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/confirm`,
    })

    if (error) {
      return { error: error.message }
    }
  } catch (err) {
    console.error(err)
    return { error: "エラーが発生しました" }
  }
}


// パスワード設定
export const setPassword = async (values: z.infer<typeof PasswordSchema>) => {
  try {
    const supabase = await createClient()

    // パスワード設定
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    })

    if (error) {
      return { error: error.message }
    }
  } catch (err) {
    console.error(err)
    return { error: "エラーが発生しました" }
  }
}
