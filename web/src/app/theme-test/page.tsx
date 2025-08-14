'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { useTheme } from '@/components/theme-provider'

export const dynamic = 'force-dynamic'

export default function ThemeTestPage() {
  const { theme } = useTheme()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">テーマシステムテスト</h1>
          <ThemeToggle />
        </div>

        <div className="text-sm text-muted-foreground">
          現在のテーマ: <code className="bg-muted px-2 py-1 rounded">{theme}</code>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>プライマリカラー</CardTitle>
              <CardDescription>メインのブランドカラー</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full">プライマリボタン</Button>
              <div className="h-16 bg-primary rounded flex items-center justify-center text-primary-foreground">
                Primary Background
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>セカンダリカラー</CardTitle>
              <CardDescription>補助的なカラー</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="secondary" className="w-full">セカンダリボタン</Button>
              <div className="h-16 bg-secondary rounded flex items-center justify-center text-secondary-foreground">
                Secondary Background
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>アクセントカラー</CardTitle>
              <CardDescription>アクセント用のカラー</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">アウトラインボタン</Button>
              <div className="h-16 bg-accent rounded flex items-center justify-center text-accent-foreground">
                Accent Background
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>エネルギッシュアクセント</CardTitle>
              <CardDescription>限定使用のアクセントカラー</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="h-12 bg-accent-lime rounded flex items-center justify-center text-accent-lime-foreground text-xs">
                  Lime
                </div>
                <div className="h-12 bg-accent-cyan rounded flex items-center justify-center text-accent-cyan-foreground text-xs">
                  Cyan
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>テキストとボーダー</CardTitle>
            <CardDescription>各種テキストとボーダーの色を確認</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-foreground">メインテキスト (foreground)</p>
              <p className="text-muted-foreground">サブテキスト (muted-foreground)</p>
              <p className="text-destructive">エラーテキスト (destructive)</p>
            </div>
            <div className="border rounded p-4">
              <p>ボーダー付きコンテナ</p>
            </div>
            <div className="border-dashed border-2 border-muted p-4">
              <p>ダッシュボーダー</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}