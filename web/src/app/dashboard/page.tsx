import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  FileText, 
  Clock, 
  TrendingUp, 
  BookOpen,
  Award,
  Calendar,
  Activity
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your SkillGaug dashboard',
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <p className="text-muted-foreground">
          あなたの活動状況とプラットフォームの概要
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今月の評価</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完了率</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均スコア</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.5</div>
            <p className="text-xs text-muted-foreground">
              +3.2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アクティブユーザー</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>最近のアクティビティ</CardTitle>
            <CardDescription>
              プラットフォーム上での最新の活動
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  新しい問題「JavaScript Array Methods」が作成されました
                </p>
                <p className="text-sm text-muted-foreground">
                  2時間前
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  15名の受験者が「React基礎」評価を完了しました
                </p>
                <p className="text-sm text-muted-foreground">
                  4時間前
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  新しい受験者アカウントが3件作成されました
                </p>
                <p className="text-sm text-muted-foreground">
                  6時間前
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  システムメンテナンスが完了しました
                </p>
                <p className="text-sm text-muted-foreground">
                  1日前
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>クイックアクション</CardTitle>
            <CardDescription>
              よく使用される機能への素早いアクセス
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Button variant="outline" className="justify-start">
                <FileText className="mr-2 h-4 w-4" />
                新しい問題を作成
              </Button>
              
              <Button variant="outline" className="justify-start">
                <Users className="mr-2 h-4 w-4" />
                受験者を招待
              </Button>
              
              <Button variant="outline" className="justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                評価をスケジュール
              </Button>
              
              <Button variant="outline" className="justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                問題ライブラリを参照
              </Button>
              
              <Button variant="outline" className="justify-start">
                <Award className="mr-2 h-4 w-4" />
                結果レポートを表示
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Assessments */}
      <Card>
        <CardHeader>
          <CardTitle>今後の評価</CardTitle>
          <CardDescription>
            スケジュールされている評価の一覧
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">フルスタック開発者採用評価</h4>
                <p className="text-sm text-muted-foreground">
                  React, Node.js, データベース設計
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  90分
                  <Badge variant="outline">中級</Badge>
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm font-medium">2025-01-15</p>
                <p className="text-xs text-muted-foreground">10:00 AM</p>
                <Badge variant="secondary">準備中</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Python開発者スキル評価</h4>
                <p className="text-sm text-muted-foreground">
                  アルゴリズム、データ構造、Web API
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  60分
                  <Badge variant="outline">上級</Badge>
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm font-medium">2025-01-18</p>
                <p className="text-xs text-muted-foreground">2:00 PM</p>
                <Badge variant="secondary">準備中</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}