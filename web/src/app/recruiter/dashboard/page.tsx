import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  UserCheck,
  UserX,
  TrendingUp,
  Calendar,
  Clock,
  Mail,
  FileText,
  BarChart3,
  Filter
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Recruiter Dashboard',
  description: 'Recruiter dashboard for SkillGaug',
}

export default function RecruiterDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">採用担当者ダッシュボード</h1>
          <p className="text-muted-foreground">
            候補者の評価管理と採用プロセスの監視
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Users className="mr-1 h-3 w-3" />
          採用担当者
        </Badge>
      </div>

      {/* Recruiter Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アクティブ候補者</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67</div>
            <p className="text-xs text-muted-foreground">
              +12 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">評価完了</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              今週完了分
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均スコア</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">74.8</div>
            <p className="text-xs text-muted-foreground">
              +2.3 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">合格率</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Assessments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>最新の評価結果</CardTitle>
              <CardDescription>
                候補者の評価結果と推奨アクション
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-1 h-3 w-3" />
              フィルター
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">田中 太郎</h4>
                  <Badge variant="secondary">JavaScript評価</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  スコア: 87/100
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <UserCheck className="h-3 w-3 text-green-500" />
                  推奨: 次の面接に進める
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs text-muted-foreground">2時間前</p>
                <Button size="sm" variant="outline">詳細</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">佐藤 花子</h4>
                  <Badge variant="secondary">React評価</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  スコア: 92/100
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <UserCheck className="h-3 w-3 text-green-500" />
                  推奨: 優秀候補者
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs text-muted-foreground">4時間前</p>
                <Button size="sm" variant="outline">詳細</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">鈴木 次郎</h4>
                  <Badge variant="secondary">フルスタック評価</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  スコア: 58/100
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <UserX className="h-3 w-3 text-red-500" />
                  推奨: 再評価を検討
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs text-muted-foreground">6時間前</p>
                <Button size="sm" variant="outline">詳細</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>採用アクション</CardTitle>
            <CardDescription>
              候補者管理のためのクイックアクション
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Button variant="outline" className="justify-start">
                <Mail className="mr-2 h-4 w-4" />
                候補者を招待
              </Button>
              
              <Button variant="outline" className="justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                評価をスケジュール
              </Button>
              
              <Button variant="outline" className="justify-start">
                <FileText className="mr-2 h-4 w-4" />
                評価テンプレート作成
              </Button>
              
              <Button variant="outline" className="justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                採用レポート生成
              </Button>
              
              <Button variant="outline" className="justify-start">
                <Users className="mr-2 h-4 w-4" />
                候補者プール管理
              </Button>
            </div>

            {/* Statistics Summary */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium mb-3">今月の採用統計</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">評価実施</span>
                  <span className="font-medium">89件</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">合格者</span>
                  <span className="font-medium">61件 (68%)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">面接進出</span>
                  <span className="font-medium">34件 (38%)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">採用決定</span>
                  <span className="font-medium">12件 (13%)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Assessments */}
      <Card>
        <CardHeader>
          <CardTitle>予定された評価</CardTitle>
          <CardDescription>
            今後実施予定の評価セッション
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">フロントエンド開発者採用評価</h4>
                  <Badge variant="outline">3名予定</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  React, TypeScript, CSS設計
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  2025-01-16 10:00-12:00
                  <Clock className="h-3 w-3" />
                  120分
                </div>
              </div>
              <div className="text-right space-y-1">
                <Button size="sm">候補者確認</Button>
                <p className="text-xs text-muted-foreground">明日</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">Python開発者スキル評価</h4>
                  <Badge variant="outline">2名予定</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Django, FastAPI, データ分析
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  2025-01-18 14:00-16:00
                  <Clock className="h-3 w-3" />
                  120分
                </div>
              </div>
              <div className="text-right space-y-1">
                <Button size="sm" variant="outline">準備中</Button>
                <p className="text-xs text-muted-foreground">3日後</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}