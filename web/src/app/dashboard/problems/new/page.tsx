'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  TestTube
} from 'lucide-react'

interface TestCase {
  name?: string
  input?: string
  expectedOutput?: string
  isHidden?: boolean
  weight?: number
}

export default function NewProblemPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'MEDIUM' as 'EASY' | 'MEDIUM' | 'HARD',
    category: '',
    estimatedTimeMinutes: ''
  })
  const [testCases, setTestCases] = useState<TestCase[]>([
    { name: 'テストケース1', input: '', expectedOutput: '', isHidden: false, weight: 1.0 }
  ])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addTestCase = () => {
    setTestCases(prev => [...prev, {
      name: `テストケース${prev.length + 1}`,
      input: '',
      expectedOutput: '',
      isHidden: false,
      weight: 1.0
    }])
  }

  const removeTestCase = (index: number) => {
    if (testCases.length > 1) {
      setTestCases(prev => prev.filter((_, i) => i !== index))
    }
  }

  const updateTestCase = (index: number, field: keyof TestCase, value: string | number | boolean) => {
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

    setLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:4000/api/v1/problems', {
        method: 'POST',
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
          testCases: testCases.filter(tc => tc.input?.trim() || tc.expectedOutput?.trim())
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create problem')
      }

      const data = await response.json()
      router.push(`/dashboard/problems/${data.problem.id}`)
    } catch (error) {
      console.error('Error creating problem:', error)
      alert('問題の作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

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
            <h1 className="text-3xl font-bold">新しい問題を作成</h1>
            <p className="text-muted-foreground">
              コーディング問題の詳細情報とテストケースを設定
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
              問題の基本的な情報を入力してください
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
                  問題の正解を判定するためのテストケースを設定
                </CardDescription>
              </div>
              <Button type="button" onClick={addTestCase} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                テストケース追加
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {testCases.map((testCase, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <Input
                      placeholder="テストケース名"
                      value={testCase.name || ''}
                      onChange={(e) => updateTestCase(index, 'name', e.target.value)}
                      className="w-48"
                    />
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
                    {testCases.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTestCase(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
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
            ))}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/dashboard/problems">
            <Button type="button" variant="outline">
              キャンセル
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? '作成中...' : '問題を作成'}
          </Button>
        </div>
      </form>
    </div>
  )
}