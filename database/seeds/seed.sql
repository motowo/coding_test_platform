-- =================================================================
-- SkillGaug Development Seed Data
-- =================================================================
-- Initial data for development and testing purposes
-- Run with: psql -d skillgaug -f database/seeds/seed.sql

BEGIN;

-- =================================================================
-- Programming Languages
-- =================================================================

INSERT INTO languages (name, version, docker_image) VALUES
('Python', '3.11', 'python:3.11-slim'),
('JavaScript', '20', 'node:20-alpine'),
('TypeScript', '5.0', 'node:20-alpine'),
('Java', '21', 'openjdk:21-slim'),
('C++', '20', 'gcc:latest'),
('Go', '1.21', 'golang:1.21-alpine'),
('Rust', '1.75', 'rust:1.75'),
('C#', '8.0', 'mcr.microsoft.com/dotnet/sdk:8.0')
ON CONFLICT (name, version) DO NOTHING;

-- =================================================================
-- Users (Admin and Sample Users)
-- =================================================================

-- Admin User (password: admin123)
INSERT INTO users (name, email, password_hash, role) VALUES
('System Administrator', 'admin@skillgaug.local', '$2b$10$rX8kZN5zN5XZsQqZgU5zEuY9K9vJ8wH5kY5xZ8.8Z8H5Y8.8Z8H5Y', 'ADMIN');

-- Sample Creator (password: creator123)
INSERT INTO users (name, email, password_hash, role) VALUES
('Problem Creator', 'creator@skillgaug.local', '$2b$10$rX8kZN5zN5XZsQqZgU5zEuY9K9vJ8wH5kY5xZ8.8Z8H5Y8.8Z8H5Y', 'CREATOR');

-- Sample Recruiter (password: recruiter123)  
INSERT INTO users (name, email, password_hash, role) VALUES
('HR Recruiter', 'recruiter@skillgaug.local', '$2b$10$rX8kZN5zN5XZsQqZgU5zEuY9K9vJ8wH5kY5xZ8.8Z8H5Y8.8Z8H5Y', 'RECRUITER');

-- Sample Candidates (password: candidate123)
INSERT INTO users (name, email, password_hash, role) VALUES
('John Doe', 'john.doe@example.com', '$2b$10$rX8kZN5zN5XZsQqZgU5zEuY9K9vJ8wH5kY5xZ8.8Z8H5Y8.8Z8H5Y', 'CANDIDATE'),
('Jane Smith', 'jane.smith@example.com', '$2b$10$rX8kZN5zN5XZsQqZgU5zEuY9K9vJ8wH5kY5xZ8.8Z8H5Y8.8Z8H5Y', 'CANDIDATE'),
('Alice Johnson', 'alice.johnson@example.com', '$2b$10$rX8kZN5zN5XZsQqZgU5zEuY9K9vJ8wH5kY5xZ8.8Z8H5Y8.8Z8H5Y', 'CANDIDATE');

-- =================================================================
-- Sample Problems
-- =================================================================

INSERT INTO problems (title, description, difficulty, category, estimated_time_minutes, author_id) VALUES
(
  'Two Sum',
  '# Two Sum

Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

## Example 1:
```
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
```

## Example 2:
```
Input: nums = [3,2,4], target = 6
Output: [1,2]
```

## Constraints:
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.',
  'EASY',
  'Algorithm',
  15,
  2
),
(
  'Longest Palindromic Substring',
  '# Longest Palindromic Substring

Given a string `s`, return the longest palindromic substring in `s`.

## Example 1:
```
Input: s = "babad"
Output: "bab"
Explanation: "aba" is also a valid answer.
```

## Example 2:
```
Input: s = "cbbd"
Output: "bb"
```

## Constraints:
- 1 <= s.length <= 1000
- s consist of only digits and English letters.',
  'MEDIUM',
  'String Manipulation',
  25,
  2
),
(
  'Merge k Sorted Lists',
  '# Merge k Sorted Lists

You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.

## Example 1:
```
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
```

## Constraints:
- k == lists.length
- 0 <= k <= 10^4
- 0 <= lists[i].length <= 500
- -10^4 <= lists[i][j] <= 10^4
- lists[i] is sorted in ascending order.',
  'HARD',
  'Data Structure',
  45,
  2
);

-- =================================================================
-- Test Cases for Problems
-- =================================================================

-- Test cases for Two Sum (Problem ID: 1)
INSERT INTO test_cases (problem_id, name, input, expected_output, is_hidden, weight) VALUES
(1, 'Basic Case', '[2,7,11,15]\n9', '[0,1]', false, 1.0),
(1, 'Different Order', '[3,2,4]\n6', '[1,2]', false, 1.0),
(1, 'Negative Numbers', '[-1,-2,-3,-4,-5]\n-8', '[2,4]', false, 1.0),
(1, 'Hidden Case 1', '[1,2,3,4,5]\n8', '[2,4]', true, 1.0),
(1, 'Hidden Case 2', '[5,5,5,5]\n10', '[0,1]', true, 1.0);

-- Test cases for Longest Palindromic Substring (Problem ID: 2)
INSERT INTO test_cases (problem_id, name, input, expected_output, is_hidden, weight) VALUES
(2, 'Basic Case 1', 'babad', 'bab', false, 1.0),
(2, 'Basic Case 2', 'cbbd', 'bb', false, 1.0),
(2, 'Single Character', 'a', 'a', false, 1.0),
(2, 'Hidden Case 1', 'racecar', 'racecar', true, 1.5),
(2, 'Hidden Case 2', 'abcdef', 'a', true, 1.0);

-- Test cases for Merge k Sorted Lists (Problem ID: 3)
INSERT INTO test_cases (problem_id, name, input, expected_output, is_hidden, weight) VALUES
(3, 'Basic Case', '[[1,4,5],[1,3,4],[2,6]]', '[1,1,2,3,4,4,5,6]', false, 1.0),
(3, 'Empty Lists', '[]', '[]', false, 1.0),
(3, 'Single List', '[[1,2,3]]', '[1,2,3]', false, 1.0),
(3, 'Hidden Case 1', '[[1],[2],[3]]', '[1,2,3]', true, 1.5),
(3, 'Hidden Case 2', '[[-1,0,1],[2,3,4]]', '[-1,0,1,2,3,4]', true, 1.5);

-- =================================================================
-- Sample Assessment
-- =================================================================

INSERT INTO assessments (title, description, time_limit_minutes, pre_assessment_guide, post_assessment_guide, created_by) VALUES
(
  'Junior Developer Assessment',
  'This assessment evaluates basic programming skills for junior developer positions.',
  90,
  '# Welcome to SkillGaug Assessment

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

**Good luck!**',
  '# Assessment Complete!

Thank you for taking the time to complete this assessment.

## Next Steps:
1. Your solutions will be reviewed by our technical team
2. You will receive feedback within 3-5 business days
3. If selected, you will be contacted for the next round

## Questions?
Contact us at: hiring@company.com

Thank you for your interest in our company!',
  3
);

-- Link problems to assessment
INSERT INTO assessment_problems (assessment_id, problem_id, "order") VALUES
(1, 1, 1),
(1, 2, 2);

-- =================================================================
-- Sample Skill Map (Future Enhancement)
-- =================================================================

INSERT INTO skill_maps (name, description) VALUES
('Full Stack Developer Roadmap', 'Complete roadmap for becoming a full-stack developer');

INSERT INTO skill_nodes (skill_map_id, name, description, parent_node_id) VALUES
(1, 'Programming Fundamentals', 'Basic programming concepts and problem solving', NULL),
(1, 'Data Structures', 'Arrays, linked lists, trees, graphs', 1),
(1, 'Algorithms', 'Sorting, searching, dynamic programming', 1),
(1, 'Web Development', 'Frontend and backend web development', NULL),
(1, 'Frontend', 'HTML, CSS, JavaScript, frameworks', 4),
(1, 'Backend', 'Server-side programming, databases, APIs', 4);

-- Link problems to skill nodes
INSERT INTO problem_skill_nodes (problem_id, skill_node_id) VALUES
(1, 2), -- Two Sum -> Data Structures
(1, 3), -- Two Sum -> Algorithms  
(2, 3), -- Longest Palindromic -> Algorithms
(3, 2), -- Merge k Sorted Lists -> Data Structures
(3, 3); -- Merge k Sorted Lists -> Algorithms

COMMIT;

-- =================================================================
-- Verification Queries
-- =================================================================

-- Uncomment these to verify the seed data after running
-- SELECT 'Languages:', count(*) FROM languages;
-- SELECT 'Users:', count(*) FROM users;
-- SELECT 'Problems:', count(*) FROM problems;
-- SELECT 'Test Cases:', count(*) FROM test_cases;
-- SELECT 'Assessments:', count(*) FROM assessments;
-- SELECT 'Skill Nodes:', count(*) FROM skill_nodes;