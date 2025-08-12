import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  FileText, 
  Shield,
  Settings,
  Activity,
  TrendingUp,
  AlertTriangle,
  Database
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Administrator dashboard for SkillGaug',
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">管理者ダッシュボード</h1>
          <p className="text-muted-foreground">
            システム全体の管理と監視
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Shield className="mr-1 h-3 w-3" />
          管理者
        </Badge>
      </div>

      {/* Admin Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総ユーザー数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              +89 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総問題数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">
              +23 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">システム稼働率</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.8%</div>
            <p className="text-xs text-muted-foreground">
              +0.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今月の評価数</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">856</div>
            <p className="text-xs text-muted-foreground">
              +142 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>システムアラート</CardTitle>
            <CardDescription>
              注意が必要なシステムの状況
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div className="flex-1">
                <p className="text-sm font-medium">データベース使用量警告</p>
                <p className="text-xs text-muted-foreground">
                  データベースの使用量が80%を超えています
                </p>
              </div>
              <Badge variant="secondary">警告</Badge>
            </div>

            <div className="flex items-center space-x-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <p className="text-sm font-medium">高負荷検出</p>
                <p className="text-xs text-muted-foreground">
                  API サーバーの応答時間が平均より遅くなっています
                </p>
              </div>
              <Badge variant="secondary">情報</Badge>
            </div>

            <div className="flex items-center space-x-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <p className="text-sm font-medium">セキュリティ更新完了</p>
                <p className="text-xs text-muted-foreground">
                  全システムコンポーネントが最新版に更新されました
                </p>
              </div>
              <Badge variant="secondary">完了</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Admin Actions */}
        <Card>
          <CardHeader>
            <CardTitle>管理者アクション</CardTitle>
            <CardDescription>
              システム管理のためのクイックアクション
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Button variant="outline" className="justify-start">
                <Users className="mr-2 h-4 w-4" />
                ユーザー管理
              </Button>
              
              <Button variant="outline" className="justify-start">
                <FileText className="mr-2 h-4 w-4" />
                問題ライブラリ管理
              </Button>
              
              <Button variant="outline" className="justify-start">
                <Database className="mr-2 h-4 w-4" />
                データベース管理
              </Button>
              
              <Button variant="outline" className="justify-start">
                <Activity className="mr-2 h-4 w-4" />
                システム監視
              </Button>
              
              <Button variant="outline" className="justify-start">
                <Settings className="mr-2 h-4 w-4" />
                システム設定
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Admin Activities */}
      <Card>
        <CardHeader>
          <CardTitle>最近の管理活動</CardTitle>
          <CardDescription>
            システム管理に関する最新のアクティビティ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">新規ユーザー承認</h4>
                  <Badge variant="secondary">承認済み</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  採用担当者アカウント「hr@company.com」を承認しました
                </p>
              </div>
              <p className="text-xs text-muted-foreground">2時間前</p>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">システムメンテナンス</h4>
                  <Badge variant="outline">完了</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  定期メンテナンスを実行し、パフォーマンスを最適化しました
                </p>
              </div>
              <p className="text-xs text-muted-foreground">4時間前</p>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">問題ライブラリ更新</h4>
                  <Badge variant="secondary">更新済み</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  15個の新しい問題をライブラリに追加しました
                </p>
              </div>
              <p className="text-xs text-muted-foreground">1日前</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}