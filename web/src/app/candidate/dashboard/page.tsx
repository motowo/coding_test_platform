import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  Award,
  BookOpen,
  Play,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Candidate Dashboard',
  description: 'Candidate dashboard for SkillGaug',
}

export default function CandidateDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">受験者ダッシュボード</h1>
          <p className="text-muted-foreground">
            あなたの評価状況と次のステップ
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <BookOpen className="mr-1 h-3 w-3" />
          受験者
        </Badge>
      </div>

      {/* Candidate Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完了した評価</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均スコア</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82.3</div>
            <p className="text-xs text-muted-foreground">
              +4.2 from last assessment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総学習時間</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5h</div>
            <p className="text-xs text-muted-foreground">
              +3.2h this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ランキング</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#47</div>
            <p className="text-xs text-muted-foreground">
              Top 15% of candidates
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Available Assessments */}
        <Card>
          <CardHeader>
            <CardTitle>利用可能な評価</CardTitle>
            <CardDescription>
              受験可能な評価の一覧
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">JavaScript基礎スキル評価</h4>
                <p className="text-sm text-muted-foreground">
                  ES6+、非同期処理、DOM操作
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  60分
                  <Badge variant="outline">初級</Badge>
                </div>
              </div>
              <Button size="sm">
                <Play className="mr-1 h-3 w-3" />
                開始
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">React開発者評価</h4>
                <p className="text-sm text-muted-foreground">
                  コンポーネント設計、Hooks、状態管理
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  90分
                  <Badge variant="outline">中級</Badge>
                </div>
              </div>
              <Button size="sm">
                <Play className="mr-1 h-3 w-3" />
                開始
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg opacity-60">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Node.js バックエンド評価</h4>
                <p className="text-sm text-muted-foreground">
                  API設計、データベース、認証
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  120分
                  <Badge variant="outline">上級</Badge>
                </div>
              </div>
              <Button size="sm" disabled>
                <AlertCircle className="mr-1 h-3 w-3" />
                要承認
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle>最近の結果</CardTitle>
            <CardDescription>
              最新の評価結果とフィードバック
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">CSS & HTML スキル評価</h4>
                  <Badge variant="secondary">完了</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  スコア: 89/100
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  優秀な結果
                </div>
              </div>
              <p className="text-xs text-muted-foreground">2日前</p>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">アルゴリズム & データ構造</h4>
                  <Badge variant="secondary">完了</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  スコア: 76/100
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                  改善の余地あり
                </div>
              </div>
              <p className="text-xs text-muted-foreground">1週間前</p>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">SQL データベース設計</h4>
                  <Badge variant="secondary">完了</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  スコア: 92/100
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  優秀な結果
                </div>
              </div>
              <p className="text-xs text-muted-foreground">2週間前</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>今後の予定</CardTitle>
          <CardDescription>
            スケジュールされた評価と締切
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">TypeScript実践評価</h4>
                  <Badge variant="outline">予定済み</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  型安全性、ジェネリクス、高度な機能
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  2025-01-20 14:00
                  <Clock className="h-3 w-3" />
                  90分
                </div>
              </div>
              <Button variant="outline" size="sm">
                詳細を見る
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">フルスタック開発総合評価</h4>
                  <Badge variant="outline">招待待ち</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  総合的な開発スキルの評価
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  日程調整中
                  <Clock className="h-3 w-3" />
                  150分
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                招待待ち
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}