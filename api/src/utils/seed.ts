import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { logger } from './logger'

const prisma = new PrismaClient()

async function seed() {
  try {
    logger.info('🌱 Starting database seeding...')

    // Clear existing data in development
    if (process.env['NODE_ENV'] === 'development') {
      logger.info('🧹 Clearing existing data...')
      await prisma.submission.deleteMany()
      await prisma.candidateAssessment.deleteMany()
      await prisma.assessmentProblem.deleteMany()
      await prisma.assessment.deleteMany()
      await prisma.testCase.deleteMany()
      await prisma.problemSkillNode.deleteMany()
      await prisma.problem.deleteMany()
      await prisma.skillNode.deleteMany()
      await prisma.skillMap.deleteMany()
      await prisma.language.deleteMany()
      await prisma.user.deleteMany()
    }

    // 1. Create Languages
    logger.info('📝 Creating programming languages...')
    const languages = await Promise.all([
      prisma.language.create({
        data: {
          name: 'Python',
          version: '3.11',
          dockerImage: 'python:3.11-slim',
        },
      }),
      prisma.language.create({
        data: {
          name: 'JavaScript',
          version: '20',
          dockerImage: 'node:20-alpine',
        },
      }),
      prisma.language.create({
        data: {
          name: 'TypeScript',
          version: '5.0',
          dockerImage: 'node:20-alpine',
        },
      }),
      prisma.language.create({
        data: {
          name: 'Java',
          version: '21',
          dockerImage: 'openjdk:21-slim',
        },
      }),
      prisma.language.create({
        data: {
          name: 'C++',
          version: '20',
          dockerImage: 'gcc:latest',
        },
      }),
      prisma.language.create({
        data: {
          name: 'Go',
          version: '1.21',
          dockerImage: 'golang:1.21-alpine',
        },
      }),
    ])
    logger.info(`✅ Created ${languages.length} programming languages`)

    // 2. Create Users
    logger.info('👥 Creating users...')
    const passwordHash = await bcrypt.hash('password123', 12)

    await prisma.user.create({
      data: {
        name: 'System Administrator',
        email: 'admin@skillgaug.local',
        passwordHash,
        role: 'ADMIN',
      },
    })

    const creator = await prisma.user.create({
      data: {
        name: 'Problem Creator',
        email: 'creator@skillgaug.local',
        passwordHash,
        role: 'CREATOR',
      },
    })

    const recruiter = await prisma.user.create({
      data: {
        name: 'HR Recruiter',
        email: 'recruiter@skillgaug.local',
        passwordHash,
        role: 'RECRUITER',
      },
    })

    const candidates = await Promise.all([
      prisma.user.create({
        data: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          passwordHash,
          role: 'CANDIDATE',
        },
      }),
      prisma.user.create({
        data: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          passwordHash,
          role: 'CANDIDATE',
        },
      }),
      prisma.user.create({
        data: {
          name: 'Alice Johnson',
          email: 'alice.johnson@example.com',
          passwordHash,
          role: 'CANDIDATE',
        },
      }),
    ])
    logger.info(`✅ Created 1 admin, 1 creator, 1 recruiter, ${candidates.length} candidates`)

    // 3. Create Skill Map and Nodes
    logger.info('🗺️ Creating skill map...')
    const skillMap = await prisma.skillMap.create({
      data: {
        name: 'Full Stack Developer Roadmap',
        description: 'Complete roadmap for becoming a full-stack developer',
      },
    })

    const fundamentals = await prisma.skillNode.create({
      data: {
        skillMapId: skillMap.id,
        name: 'Programming Fundamentals',
        description: 'Basic programming concepts and problem solving',
      },
    })

    const dataStructures = await prisma.skillNode.create({
      data: {
        skillMapId: skillMap.id,
        name: 'Data Structures',
        description: 'Arrays, linked lists, trees, graphs',
        parentNodeId: fundamentals.id,
      },
    })

    const algorithms = await prisma.skillNode.create({
      data: {
        skillMapId: skillMap.id,
        name: 'Algorithms',
        description: 'Sorting, searching, dynamic programming',
        parentNodeId: fundamentals.id,
      },
    })

    await prisma.skillNode.create({
      data: {
        skillMapId: skillMap.id,
        name: 'Web Development',
        description: 'Frontend and backend web development',
      },
    })

    logger.info('✅ Created skill map with 4 skill nodes')

    // 4. Create Problems
    logger.info('🧩 Creating problems...')
    const twoSumProblem = await prisma.problem.create({
      data: {
        title: 'Two Sum',
        description: `# Two Sum

Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

## Example 1:
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

## Example 2:
\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

## Constraints:
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.`,
        difficulty: 'EASY',
        category: 'Algorithm',
        estimatedTimeMinutes: 15,
        authorId: creator.id,
      },
    })

    const palindromeProblem = await prisma.problem.create({
      data: {
        title: 'Longest Palindromic Substring',
        description: `# Longest Palindromic Substring

Given a string \`s\`, return the longest palindromic substring in \`s\`.

## Example 1:
\`\`\`
Input: s = "babad"
Output: "bab"
Explanation: "aba" is also a valid answer.
\`\`\`

## Example 2:
\`\`\`
Input: s = "cbbd"
Output: "bb"
\`\`\`

## Constraints:
- 1 <= s.length <= 1000
- s consist of only digits and English letters.`,
        difficulty: 'MEDIUM',
        category: 'String Manipulation',
        estimatedTimeMinutes: 25,
        authorId: creator.id,
      },
    })

    const mergeListsProblem = await prisma.problem.create({
      data: {
        title: 'Merge k Sorted Lists',
        description: `# Merge k Sorted Lists

You are given an array of \`k\` linked-lists \`lists\`, each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.

## Example 1:
\`\`\`
Input: lists = [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,3,4,4,5,6]
Explanation: The linked-lists are:
[
  1->4->5,
  1->3->4,
  2->6
]
merging them into one sorted list:
1->1->2->3->4->4->5->6
\`\`\`

## Constraints:
- k == lists.length
- 0 <= k <= 10^4
- 0 <= lists[i].length <= 500
- -10^4 <= lists[i][j] <= 10^4
- lists[i] is sorted in ascending order.`,
        difficulty: 'HARD',
        category: 'Data Structure',
        estimatedTimeMinutes: 45,
        authorId: creator.id,
      },
    })

    logger.info('✅ Created 3 problems')

    // 5. Create Test Cases
    logger.info('🧪 Creating test cases...')
    
    // Two Sum test cases
    await Promise.all([
      prisma.testCase.create({
        data: {
          problemId: twoSumProblem.id,
          name: 'Basic Case',
          input: '[2,7,11,15]\n9',
          expectedOutput: '[0,1]',
          isHidden: false,
          weight: 1.0,
        },
      }),
      prisma.testCase.create({
        data: {
          problemId: twoSumProblem.id,
          name: 'Different Order',
          input: '[3,2,4]\n6',
          expectedOutput: '[1,2]',
          isHidden: false,
          weight: 1.0,
        },
      }),
      prisma.testCase.create({
        data: {
          problemId: twoSumProblem.id,
          name: 'Hidden Case 1',
          input: '[1,2,3,4,5]\n8',
          expectedOutput: '[2,4]',
          isHidden: true,
          weight: 1.0,
        },
      }),
    ])

    // Palindrome test cases
    await Promise.all([
      prisma.testCase.create({
        data: {
          problemId: palindromeProblem.id,
          name: 'Basic Case 1',
          input: 'babad',
          expectedOutput: 'bab',
          isHidden: false,
          weight: 1.0,
        },
      }),
      prisma.testCase.create({
        data: {
          problemId: palindromeProblem.id,
          name: 'Basic Case 2',
          input: 'cbbd',
          expectedOutput: 'bb',
          isHidden: false,
          weight: 1.0,
        },
      }),
      prisma.testCase.create({
        data: {
          problemId: palindromeProblem.id,
          name: 'Hidden Case 1',
          input: 'racecar',
          expectedOutput: 'racecar',
          isHidden: true,
          weight: 1.5,
        },
      }),
    ])

    // Merge Lists test cases
    await Promise.all([
      prisma.testCase.create({
        data: {
          problemId: mergeListsProblem.id,
          name: 'Basic Case',
          input: '[[1,4,5],[1,3,4],[2,6]]',
          expectedOutput: '[1,1,2,3,4,4,5,6]',
          isHidden: false,
          weight: 1.0,
        },
      }),
      prisma.testCase.create({
        data: {
          problemId: mergeListsProblem.id,
          name: 'Empty Lists',
          input: '[]',
          expectedOutput: '[]',
          isHidden: false,
          weight: 1.0,
        },
      }),
      prisma.testCase.create({
        data: {
          problemId: mergeListsProblem.id,
          name: 'Hidden Case 1',
          input: '[[1],[2],[3]]',
          expectedOutput: '[1,2,3]',
          isHidden: true,
          weight: 1.5,
        },
      }),
    ])

    logger.info('✅ Created test cases for all problems')

    // 6. Link Problems to Skill Nodes
    logger.info('🔗 Linking problems to skill nodes...')
    await Promise.all([
      prisma.problemSkillNode.create({
        data: {
          problemId: twoSumProblem.id,
          skillNodeId: dataStructures.id,
        },
      }),
      prisma.problemSkillNode.create({
        data: {
          problemId: twoSumProblem.id,
          skillNodeId: algorithms.id,
        },
      }),
      prisma.problemSkillNode.create({
        data: {
          problemId: palindromeProblem.id,
          skillNodeId: algorithms.id,
        },
      }),
      prisma.problemSkillNode.create({
        data: {
          problemId: mergeListsProblem.id,
          skillNodeId: dataStructures.id,
        },
      }),
      prisma.problemSkillNode.create({
        data: {
          problemId: mergeListsProblem.id,
          skillNodeId: algorithms.id,
        },
      }),
    ])

    logger.info('✅ Linked problems to skill nodes')

    // 7. Create Sample Assessment
    logger.info('📋 Creating sample assessment...')
    const assessment = await prisma.assessment.create({
      data: {
        title: 'Junior Developer Assessment',
        description: 'This assessment evaluates basic programming skills for junior developer positions.',
        timeLimitMinutes: 90,
        preAssessmentGuide: `# Welcome to SkillGaug Assessment

## Before You Begin:
1. Ensure you have a stable internet connection
2. You will have 90 minutes to complete this assessment
3. You can use any programming language provided
4. You may test your code before submitting
5. Once submitted, you cannot modify your solution

## Tips:
- Read each problem carefully
- Start with the easier problems first
- Test your solutions with the provided examples
- Submit early if you finish before the time limit

**Good luck!**`,
        postAssessmentGuide: `# Assessment Complete!

Thank you for taking the time to complete this assessment.

## Next Steps:
1. Your solutions will be reviewed by our technical team
2. You will receive feedback within 3-5 business days
3. If selected, you will be contacted for the next round

## Questions?
Contact us at: hiring@company.com

Thank you for your interest in our company!`,
        createdBy: recruiter.id,
      },
    })

    // Link problems to assessment
    await Promise.all([
      prisma.assessmentProblem.create({
        data: {
          assessmentId: assessment.id,
          problemId: twoSumProblem.id,
          order: 1,
        },
      }),
      prisma.assessmentProblem.create({
        data: {
          assessmentId: assessment.id,
          problemId: palindromeProblem.id,
          order: 2,
        },
      }),
    ])

    logger.info('✅ Created sample assessment with 2 problems')

    // 8. Create Sample Candidate Assessment
    logger.info('👤 Creating sample candidate assessment...')
    await prisma.candidateAssessment.create({
      data: {
        assessmentId: assessment.id,
        candidateId: candidates[0]!.id,
        status: 'PENDING',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    })

    logger.info('✅ Created sample candidate assessment')

    // Summary
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.language.count(),
      prisma.problem.count(),
      prisma.testCase.count(),
      prisma.assessment.count(),
      prisma.skillNode.count(),
    ])

    logger.info('🎉 Database seeding completed successfully!')
    logger.info(`📊 Summary:
  - Users: ${counts[0]}
  - Languages: ${counts[1]}  
  - Problems: ${counts[2]}
  - Test Cases: ${counts[3]}
  - Assessments: ${counts[4]}
  - Skill Nodes: ${counts[5]}`)

    logger.info(`🔑 Default login credentials:
  - Admin: admin@skillgaug.local / password123
  - Creator: creator@skillgaug.local / password123  
  - Recruiter: recruiter@skillgaug.local / password123
  - Candidate: john.doe@example.com / password123`)

  } catch (error) {
    logger.error(error as Error, '❌ Database seeding failed')
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seed()
    .then(() => {
      logger.info('✨ Seeding process completed')
      process.exit(0)
    })
    .catch((error) => {
      logger.error('💥 Seeding process failed:', error)
      process.exit(1)
    })
}

export { seed }