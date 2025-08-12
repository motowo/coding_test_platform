'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Save,
  TestTube,
  Plus,
  Trash2
} from 'lucide-react'

interface Problem {
  id: number
  title: string
  description: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  category: string | null
  estimatedTimeMinutes: number | null
  testCases: Array<{
    id: number
    name: string | null
    input: string | null
    expectedOutput: string | null
    isHidden: boolean
    weight: number
  }>
}

interface TestCaseFormData {
  id?: number
  name?: string
  input?: string
  expectedOutput?: string
  isHidden?: boolean
  weight?: number
  isNew?: boolean
  isDeleted?: boolean
}

export default function EditProblemPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [problem, setProblem] = useState<Problem | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'MEDIUM' as 'EASY' | 'MEDIUM' | 'HARD',
    category: '',
    estimatedTimeMinutes: ''
  })
  const [testCases, setTestCases] = useState<TestCaseFormData[]>([])

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
        throw new Error('Failed to fetch problem')
      }

      const data = await response.json()
      const problemData = data.problem
      
      setProblem(problemData)
      setFormData({
        title: problemData.title,
        description: problemData.description,
        difficulty: problemData.difficulty,
        category: problemData.category || '',
        estimatedTimeMinutes: problemData.estimatedTimeMinutes?.toString() || ''
      })
      setTestCases(problemData.testCases.map((tc: any) => ({
        ...tc,
        name: tc.name || '',
        input: tc.input || '',
        expectedOutput: tc.expectedOutput || ''
      })))
    } catch (error) {
      console.error('Error fetching problem:', error)
      alert('問題の読み込みに失敗しました')
      router.push('/dashboard/problems')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addTestCase = () => {
    setTestCases(prev => [...prev, {
      name: `テストケース${prev.length + 1}`,
      input: '',
      expectedOutput: '',
      isHidden: false,
      weight: 1.0,
      isNew: true
    }])
  }

  const removeTestCase = (index: number) => {
    const testCase = testCases[index]
    if (testCase.isNew) {
      // 新しいテストケースは単純に削除
      setTestCases(prev => prev.filter((_, i) => i !== index))
    } else {
      // 既存のテストケースは削除マークを付ける
      setTestCases(prev => prev.map((tc, i) => 
        i === index ? { ...tc, isDeleted: true } : tc
      ))
    }
  }

  const restoreTestCase = (index: number) => {
    setTestCases(prev => prev.map((tc, i) => 
      i === index ? { ...tc, isDeleted: false } : tc
    ))
  }

  const updateTestCase = (index: number, field: keyof TestCaseFormData, value: string | number | boolean) => {
    setTestCases(prev => prev.map((testCase, i) => 
      i === index ? { ...testCase, [field]: value } : testCase
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('タイトルと説明は必須です')
      return
    }

    setSaving(true)
    
    try {
      const token = localStorage.getItem('token')
      
      // Update basic problem info
      const response = await fetch(`http://localhost:4000/api/v1/problems/${params.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          difficulty: formData.difficulty,
          category: formData.category || null,
          estimatedTimeMinutes: formData.estimatedTimeMinutes ? parseInt(formData.estimatedTimeMinutes) : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update problem')
      }

      // Handle test cases
      for (const testCase of testCases) {
        const problemId = Array.isArray(params.id) ? params.id[0] : params.id
        if (testCase.isDeleted && testCase.id) {
          // Delete existing test case
          await fetch(`http://localhost:4000/api/v1/problems/${problemId}/test-cases/${testCase.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
        } else if (testCase.isNew) {
          // Create new test case
          await fetch(`http://localhost:4000/api/v1/problems/${problemId}/test-cases`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: testCase.name,
              input: testCase.input,
              expectedOutput: testCase.expectedOutput,
              isHidden: testCase.isHidden,
              weight: testCase.weight,
            }),
          })
        } else if (testCase.id && !testCase.isDeleted) {
          // Update existing test case
          await fetch(`http://localhost:4000/api/v1/problems/${problemId}/test-cases/${testCase.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: testCase.name,
              input: testCase.input,
              expectedOutput: testCase.expectedOutput,
              isHidden: testCase.isHidden,
              weight: testCase.weight,
            }),
          })
        }
      }

      const problemId = Array.isArray(params.id) ? params.id[0] : params.id
      router.push(`/dashboard/problems/${problemId}`)
    } catch (error) {
      console.error('Error updating problem:', error)
      alert('問題の更新に失敗しました')
    } finally {
      setSaving(false)
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

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/problems/${params.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              問題詳細に戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">問題を編集</h1>
            <p className="text-muted-foreground">
              問題 #{problem.id} の情報を更新
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
            <CardDescription>
              問題の基本的な情報を編集してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">問題タイトル *</Label>
              <Input
                id="title"
                placeholder="例: 配列の最大値を求める"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">問題説明 *</Label>
              <Textarea
                id="description"
                placeholder="問題の詳細な説明を入力してください..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="min-h-32"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">難易度</Label>
                <select
                  id="difficulty"
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="EASY">簡単</option>
                  <option value="MEDIUM">中級</option>
                  <option value="HARD">上級</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">カテゴリ</Label>
                <Input
                  id="category"
                  placeholder="例: 配列操作"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedTime">推定時間 (分)</Label>
                <Input
                  id="estimatedTime"
                  type="number"
                  placeholder="例: 30"
                  value={formData.estimatedTimeMinutes}
                  onChange={(e) => handleInputChange('estimatedTimeMinutes', e.target.value)}
                  min="1"
                />
              </div>
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
                  テストケース
                </CardTitle>
                <CardDescription>
                  問題の正解を判定するためのテストケースを編集
                </CardDescription>
              </div>
              <Button type="button" onClick={addTestCase} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                テストケース追加
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {testCases.filter(tc => !tc.isDeleted).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                テストケースがありません
              </div>
            ) : (
              testCases.map((testCase, index) => {
                if (testCase.isDeleted) return null
                
                return (
                  <div key={testCase.id || `new-${index}`} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <Input
                          placeholder="テストケース名"
                          value={testCase.name || ''}
                          onChange={(e) => updateTestCase(index, 'name', e.target.value)}
                          className="w-48"
                        />
                        {testCase.isNew && (
                          <Badge variant="secondary" className="text-xs">
                            新規
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={testCase.isHidden || false}
                            onChange={(e) => updateTestCase(index, 'isHidden', e.target.checked)}
                          />
                          隠しテストケース
                        </label>
                        <Input
                          type="number"
                          placeholder="重み"
                          value={testCase.weight || 1.0}
                          onChange={(e) => updateTestCase(index, 'weight', parseFloat(e.target.value))}
                          className="w-20"
                          min="0.1"
                          step="0.1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTestCase(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`input-${index}`}>入力</Label>
                        <Textarea
                          id={`input-${index}`}
                          placeholder="テストケースの入力データ"
                          value={testCase.input || ''}
                          onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                          className="min-h-24"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`output-${index}`}>期待される出力</Label>
                        <Textarea
                          id={`output-${index}`}
                          placeholder="期待される出力結果"
                          value={testCase.expectedOutput || ''}
                          onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                          className="min-h-24"
                        />
                      </div>
                    </div>
                  </div>
                )
              })
            )}

            {/* Deleted Test Cases */}
            {testCases.some(tc => tc.isDeleted) && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Trash2 className="h-4 w-4" />
                  削除予定のテストケース
                </div>
                {testCases.map((testCase, index) => {
                  if (!testCase.isDeleted) return null
                  
                  return (
                    <div key={testCase.id} className="border-2 border-dashed border-red-200 rounded-lg p-4 opacity-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-red-600">削除予定</Badge>
                          <span className="text-sm">{testCase.name || `テストケース ${index + 1}`}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => restoreTestCase(index)}
                          className="text-green-600 hover:text-green-700"
                        >
                          復元
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <Link href={`/dashboard/problems/${params.id}`}>
            <Button type="button" variant="outline">
              キャンセル
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? '保存中...' : '変更を保存'}
          </Button>
        </div>
      </form>
    </div>
  )
}