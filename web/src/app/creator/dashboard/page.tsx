import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Plus,
  Edit,
  Eye,
  ThumbsUp,
  Users,
  BookOpen,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Creator Dashboard',
  description: 'Problem creator dashboard for SkillGaug',
}

export default function CreatorDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">問題作成者ダッシュボード</h1>
          <p className="text-muted-foreground">
            問題の作成・管理と利用状況の監視
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <BookOpen className="mr-1 h-3 w-3" />
          問題作成者
        </Badge>
      </div>

      {/* Creator Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">作成した問題</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">27</div>
            <p className="text-xs text-muted-foreground">
              +5 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">公開中</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              85% published rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総利用回数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground">
              +89 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均評価</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.6</div>
            <p className="text-xs text-muted-foreground">
              out of 5.0 stars
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* My Problems */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>最近の問題</CardTitle>
              <CardDescription>
                あなたが作成した問題の管理
              </CardDescription>
            </div>
            <Button size="sm">
              <Plus className="mr-1 h-3 w-3" />
              新規作成
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">JavaScript配列メソッド</h4>
                  <Badge variant="secondary">公開中</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  map, filter, reduce の応用問題
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  127回利用
                  <ThumbsUp className="h-3 w-3" />
                  4.8/5.0
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline">
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline">
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">React Hooks実践</h4>
                  <Badge variant="secondary">公開中</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  useEffect, useContext の実装問題
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  89回利用
                  <ThumbsUp className="h-3 w-3" />
                  4.5/5.0
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline">
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline">
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg opacity-60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">Node.js非同期処理</h4>
                  <Badge variant="outline">下書き</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Promise, async/await の応用
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertCircle className="h-3 w-3" />
                  テストケース未完成
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline">
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>問題の利用統計</CardTitle>
            <CardDescription>
              あなたの問題の利用状況と傾向
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">今月の利用回数</span>
                <span className="font-medium">89回</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">平均完了時間</span>
                <span className="font-medium">23分</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">平均正答率</span>
                <span className="font-medium">72%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">候補者満足度</span>
                <span className="font-medium">4.6/5.0</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">人気の問題 Top 3</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">JavaScript配列メソッド</span>
                  <Badge variant="secondary">127回</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">React Hooks実践</span>
                  <Badge variant="secondary">89回</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">CSS Flexbox レイアウト</span>
                  <Badge variant="secondary">76回</Badge>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">改善提案</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>• 「Node.js非同期処理」のテストケースを完成させて公開しましょう</p>
                <p>• より高難易度の問題を作成すると上級者からの需要が見込めます</p>
                <p>• Python関連の問題が不足しています</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>最新のフィードバック</CardTitle>
          <CardDescription>
            候補者からの問題に対するコメントと評価
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">JavaScript配列メソッド</h4>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }, (_, i) => (
                      <ThumbsUp key={i} className={`h-3 w-3 ${i < 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  「実践的で分かりやすい問題でした。実際の開発でよく使う場面を想定した内容で勉強になりました。」
                </p>
              </div>
              <p className="text-xs text-muted-foreground">3時間前</p>
            </div>

            <div className="flex items-start justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">React Hooks実践</h4>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }, (_, i) => (
                      <ThumbsUp key={i} className={`h-3 w-3 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  「useEffectの依存配列について理解が深まりました。もう少しヒントがあるとよかったです。」
                </p>
              </div>
              <p className="text-xs text-muted-foreground">1日前</p>
            </div>

            <div className="flex items-start justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">CSS Flexbox レイアウト</h4>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }, (_, i) => (
                      <ThumbsUp key={i} className={`h-3 w-3 ${i < 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  「視覚的に分かりやすく、段階的に難易度が上がっていて良かったです。レスポンシブ対応も含まれていて実践的でした。」
                </p>
              </div>
              <p className="text-xs text-muted-foreground">2日前</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}