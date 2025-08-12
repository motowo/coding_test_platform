'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  Edit3,
  Trash2,
  Clock,
  User,
  TestTube,
  BarChart3,
  Eye,
  EyeOff,
  Calendar
} from 'lucide-react'

interface Problem {
  id: number
  title: string
  description: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  category: string | null
  estimatedTimeMinutes: number | null
  author: {
    id: number
    name: string
    email: string
  }
  testCases: Array<{
    id: number
    name: string | null
    input: string | null
    expectedOutput: string | null
    isHidden: boolean
    weight: number
  }>
  _count: {
    submissions: number
  }
  createdAt: string
  updatedAt: string
}

const difficultyColors = {
  EASY: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HARD: 'bg-red-100 text-red-800'
}

const difficultyLabels = {
  EASY: '簡単',
  MEDIUM: '中級',
  HARD: '上級'
}

export default function ProblemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)
  const [showHiddenTestCases, setShowHiddenTestCases] = useState(false)

  useEffect(() => {
    const problemId = Array.isArray(params.id) ? params.id[0] : params.id
    if (problemId) {
      fetchProblem(problemId)
    }
  }, [params.id])

  const fetchProblem = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:4000/api/v1/problems/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          router.push('/dashboard/problems')
          return
        }
        throw new Error('Failed to fetch problem')
      }

      const data = await response.json()
      setProblem(data.problem)
    } catch (error) {
      console.error('Error fetching problem:', error)
      alert('問題の読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const deleteProblem = async () => {
    if (!problem || !confirm('この問題を削除してもよろしいですか？')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:4000/api/v1/problems/${problem.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete problem')
      }

      router.push('/dashboard/problems')
    } catch (error) {
      console.error('Error deleting problem:', error)
      alert('問題の削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">読み込み中...</div>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">問題が見つかりませんでした</div>
      </div>
    )
  }

  const visibleTestCases = showHiddenTestCases 
    ? problem.testCases 
    : problem.testCases.filter(tc => !tc.isHidden)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/problems">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              問題一覧に戻る
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold">{problem.title}</h1>
              <Badge className={difficultyColors[problem.difficulty]}>
                {difficultyLabels[problem.difficulty]}
              </Badge>
              {problem.category && (
                <Badge variant="outline">{problem.category}</Badge>
              )}
            </div>
            <p className="text-muted-foreground">問題 #{problem.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/problems/${problem.id}/edit`}>
            <Button variant="outline">
              <Edit3 className="mr-2 h-4 w-4" />
              編集
            </Button>
          </Link>
          <Button variant="outline" onClick={deleteProblem} className="text-red-600 hover:text-red-700">
            <Trash2 className="mr-2 h-4 w-4" />
            削除
          </Button>
        </div>
      </div>

      {/* Problem Details */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>問題説明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {problem.description}
              </div>
            </CardContent>
          </Card>

          {/* Test Cases */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    テストケース ({problem.testCases.length})
                  </CardTitle>
                  <CardDescription>
                    問題の正解を判定するためのテストケース
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHiddenTestCases(!showHiddenTestCases)}
                  className="flex items-center gap-2"
                >
                  {showHiddenTestCases ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showHiddenTestCases ? '隠しケースを非表示' : '隠しケースを表示'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {visibleTestCases.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  {showHiddenTestCases ? 'テストケースがありません' : '表示可能なテストケースがありません'}
                </p>
              ) : (
                visibleTestCases.map((testCase, index) => (
                  <div key={testCase.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">
                          {testCase.name || `テストケース ${index + 1}`}
                        </span>
                        {testCase.isHidden && (
                          <Badge variant="secondary" className="text-xs">
                            隠し
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        重み: {testCase.weight}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">入力</Label>
                        <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                          {testCase.input || '(入力なし)'}
                        </pre>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">期待される出力</Label>
                        <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                          {testCase.expectedOutput || '(出力なし)'}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Problem Info */}
          <Card>
            <CardHeader>
              <CardTitle>問題情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">作成者:</span>
                <span>{problem.author.name}</span>
              </div>
              
              {problem.estimatedTimeMinutes && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">推定時間:</span>
                  <span>{problem.estimatedTimeMinutes}分</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <TestTube className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">テストケース:</span>
                <span>{problem.testCases.length}個</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">提出数:</span>
                <span>{problem._count.submissions}件</span>
              </div>
              
              <Separator />
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">作成日:</span>
                <span>{new Date(problem.createdAt).toLocaleDateString('ja-JP')}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">更新日:</span>
                <span>{new Date(problem.updatedAt).toLocaleDateString('ja-JP')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>アクション</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/dashboard/problems/${problem.id}/edit`} className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <Edit3 className="mr-2 h-4 w-4" />
                  問題を編集
                </Button>
              </Link>
              
              <Button variant="outline" className="w-full justify-start">
                <TestTube className="mr-2 h-4 w-4" />
                テストケースを追加
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                提出履歴を確認
              </Button>
              
              <Separator />
              
              <Button 
                variant="outline" 
                onClick={deleteProblem}
                className="w-full justify-start text-red-600 hover:text-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                問題を削除
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Label({ children, className, ...props }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={`text-sm font-medium ${className || ''}`} {...props}>
      {children}
    </label>
  )
}