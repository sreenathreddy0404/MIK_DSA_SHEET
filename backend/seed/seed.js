import "dotenv/config";
import mongoose from "mongoose";
import { Topic } from "../models/Topic.js";
import { Question } from "../models/Question.js";

const topics = [
  {
    name: "Arrays",
    description: "Fundamentals of array manipulation and two-pointer techniques.",
    position: 1,
  },
  {
    name: "Strings",
    description: "String processing, hashing and sliding window.",
    position: 2,
  },
  {
    name: "Linked List",
    description: "Pointer manipulation and list traversal patterns.",
    position: 3,
  },
  {
    name: "Binary Search",
    description: "Search on sorted arrays and on answer space.",
    position: 4,
  },
  {
    name: "Trees",
    description: "Traversals, recursion and binary search trees.",
    position: 5,
  },
  {
    name: "Dynamic Programming",
    description: "Memoization, tabulation and classic DP patterns.",
    position: 6,
  },
];

const questionsByTopic = {
  Arrays: [
    [
      "Two Sum",
      "https://leetcode.com/problems/two-sum/",
      "https://github.com/",
      "https://www.geeksforgeeks.org/two-sum/",
      "https://www.youtube.com/watch?v=KLlXCFG5TnA",
      "KLlXCFG5TnA",
    ],
    [
      "Best Time to Buy and Sell Stock",
      "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
      "https://github.com/",
      null,
      "https://www.youtube.com/watch?v=1pkOgXD63yU",
      "1pkOgXD63yU",
    ],
    [
      "Maximum Subarray",
      "https://leetcode.com/problems/maximum-subarray/",
      null,
      null,
      "https://www.youtube.com/watch?v=5WZl3MMT0Eg",
      "5WZl3MMT0Eg",
    ],
    [
      "Merge Sorted Array",
      "https://leetcode.com/problems/merge-sorted-array/",
      null,
      null,
      null,
      null,
    ],
    ["Rotate Array", "https://leetcode.com/problems/rotate-array/", null, null, null, null],
  ],
  Strings: [
    [
      "Valid Anagram",
      "https://leetcode.com/problems/valid-anagram/",
      null,
      null,
      "https://www.youtube.com/watch?v=9UtInBqnCgA",
      "9UtInBqnCgA",
    ],
    [
      "Longest Substring Without Repeating Characters",
      "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
      null,
      null,
      "https://www.youtube.com/watch?v=wiGpQwVHdE0",
      "wiGpQwVHdE0",
    ],
    ["Valid Palindrome", "https://leetcode.com/problems/valid-palindrome/", null, null, null, null],
    [
      "Longest Palindromic Substring",
      "https://leetcode.com/problems/longest-palindromic-substring/",
      null,
      null,
      null,
      null,
    ],
  ],
  "Linked List": [
    [
      "Reverse Linked List",
      "https://leetcode.com/problems/reverse-linked-list/",
      null,
      null,
      "https://www.youtube.com/watch?v=G0_I-ZF0S38",
      "G0_I-ZF0S38",
    ],
    [
      "Linked List Cycle",
      "https://leetcode.com/problems/linked-list-cycle/",
      null,
      null,
      "https://www.youtube.com/watch?v=gBTe7lFR3vc",
      "gBTe7lFR3vc",
    ],
    [
      "Merge Two Sorted Lists",
      "https://leetcode.com/problems/merge-two-sorted-lists/",
      null,
      null,
      null,
      null,
    ],
    [
      "Remove Nth Node From End of List",
      "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
      null,
      null,
      null,
      null,
    ],
  ],
  "Binary Search": [
    [
      "Binary Search",
      "https://leetcode.com/problems/binary-search/",
      null,
      null,
      "https://www.youtube.com/watch?v=s4DPM8ct1pI",
      "s4DPM8ct1pI",
    ],
    [
      "Search in Rotated Sorted Array",
      "https://leetcode.com/problems/search-in-rotated-sorted-array/",
      null,
      null,
      null,
      null,
    ],
    [
      "Find Minimum in Rotated Sorted Array",
      "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
      null,
      null,
      null,
      null,
    ],
    [
      "Koko Eating Bananas",
      "https://leetcode.com/problems/koko-eating-bananas/",
      null,
      null,
      null,
      null,
    ],
  ],
  Trees: [
    [
      "Maximum Depth of Binary Tree",
      "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
      null,
      null,
      null,
      null,
    ],
    [
      "Invert Binary Tree",
      "https://leetcode.com/problems/invert-binary-tree/",
      null,
      null,
      "https://www.youtube.com/watch?v=OnSn2XEQ4MY",
      "OnSn2XEQ4MY",
    ],
    [
      "Binary Tree Level Order Traversal",
      "https://leetcode.com/problems/binary-tree-level-order-traversal/",
      null,
      null,
      null,
      null,
    ],
    [
      "Validate Binary Search Tree",
      "https://leetcode.com/problems/validate-binary-search-tree/",
      null,
      null,
      null,
      null,
    ],
  ],
  "Dynamic Programming": [
    [
      "Climbing Stairs",
      "https://leetcode.com/problems/climbing-stairs/",
      null,
      null,
      "https://www.youtube.com/watch?v=Y0lT9Fck7qI",
      "Y0lT9Fck7qI",
    ],
    ["House Robber", "https://leetcode.com/problems/house-robber/", null, null, null, null],
    ["Coin Change", "https://leetcode.com/problems/coin-change/", null, null, null, null],
    [
      "Longest Increasing Subsequence",
      "https://leetcode.com/problems/longest-increasing-subsequence/",
      null,
      null,
      null,
      null,
    ],
  ],
};

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }

  await mongoose.connect(uri);

  const existing = await Topic.countDocuments();
  if (existing > 0) {
    console.log("Database already seeded, skipping.");
    await mongoose.disconnect();
    return;
  }

  for (const topicData of topics) {
    const topic = await Topic.create(topicData);
    const questions = questionsByTopic[topicData.name] ?? [];
    for (let i = 0; i < questions.length; i++) {
      const [name, problem_url, github_url, resource_url, youtube_url, youtube_video_id] =
        questions[i];
      await Question.create({
        topic_id: topic._id,
        name,
        item_type: "problem",
        problem_url,
        github_url,
        resource_url,
        youtube_url,
        youtube_video_id,
        position: i + 1,
      });
    }
  }

  console.log("Seed completed successfully.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
