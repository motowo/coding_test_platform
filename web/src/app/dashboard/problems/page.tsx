'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus,
  Search,
  Eye,
  Edit3,
  Trash2,
  Clock,
  User,
  TestTube,
  BarChart3
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

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchProblems()
  }, [page, searchTerm, selectedDifficulty, selectedCategory])

  const fetchProblems = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (searchTerm) params.append('search', searchTerm)
      if (selectedDifficulty) params.append('difficulty', selectedDifficulty)
      if (selectedCategory) params.append('category', selectedCategory)
      params.append('page', page.toString())
      params.append('limit', '10')

      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:4000/api/v1/problems?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch problems')
      }

      const data = await response.json()
      setProblems(data.problems)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching problems:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteProblem = async (problemId: number) => {
    if (!confirm('この問題を削除してもよろしいですか？')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:4000/api/v1/problems/${problemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete problem')
      }

      // Refresh the problems list
      fetchProblems()
    } catch (error) {
      console.error('Error deleting problem:', error)
      alert('問題の削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">問題管理</h1>
        </div>
        <div className="text-center py-8">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">問題管理</h1>
          <p className="text-muted-foreground">
            コーディング問題の作成・編集・管理
          </p>
        </div>
        <Link href="/dashboard/problems/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新しい問題を作成
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="問題を検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">すべての難易度</option>
              <option value="EASY">簡単</option>
              <option value="MEDIUM">中級</option>
              <option value="HARD">上級</option>
            </select>
            <Input
              placeholder="カテゴリでフィルター"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Problems List */}
      <div className="grid gap-4">
        {problems.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">問題が見つかりませんでした</p>
              <Link href="/dashboard/problems/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  新しい問題を作成
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          problems.map((problem) => (
            <Card key={problem.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{problem.title}</h3>
                      <Badge className={difficultyColors[problem.difficulty]}>
                        {difficultyLabels[problem.difficulty]}
                      </Badge>
                      {problem.category && (
                        <Badge variant="outline">{problem.category}</Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground line-clamp-2">
                      {problem.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {problem.author.name}
                      </div>
                      {problem.estimatedTimeMinutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {problem.estimatedTimeMinutes}分
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <TestTube className="h-3 w-3" />
                        {problem.testCases.length}個のテストケース
                      </div>
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        {problem._count.submissions}件の提出
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/dashboard/problems/${problem.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/problems/${problem.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteProblem(problem.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                ページ {page} / {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  前へ
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  次へ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}