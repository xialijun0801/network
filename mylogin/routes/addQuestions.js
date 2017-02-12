function createQuestions() {
	


var Problem = require('../models/problem');
var newProblem = new Problem({
			problemTitle: " Two Sum",
			problemContents:"Given an array of integers, return indices of the two numbers such that they add up to a specific target.\n\
\n\
You may assume that each input would have exactly one solution, and you may not use the same element twice.",
		});
newProblem.save(function(err, problem) {});

newProblem = new Problem({
			problemTitle: "Add Two Numbers",
			problemContents:"You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order and each of their nodes contain a single digit. Add the two numbers and return it as a linked list.\n\
\n\
You may assume the two numbers do not contain any leading zero, except the number 0 itself.",
		});
newProblem.save(function(err, problem) {});

newProblem = new Problem({
			problemTitle: "Longest Substring Without Repeating Characters ",
			problemContents:"Given a string, find the length of the longest substring without repeating characters.",
		});
newProblem.save(function(err, problem) {});

newProblem = new Problem({
			problemTitle: "Median of Two Sorted Array",
			problemContents:"There are two sorted arrays nums1 and nums2 of size m and n respectively.\n\
\n\
Find the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).",
		});
newProblem.save(function(err, problem) {});

newProblem = new Problem({
			problemTitle: "Longest Palindromic Substrin",
			problemContents:"Given a string s, find the longest palindromic substring in s. You may assume that the maximum length of s is 1000.",
		});
newProblem.save(function(err, problem) {});

newProblem = new Problem({
			problemTitle: "ZigZag Conversion",
			problemContents:"The string \"PAYPALISHIRING\" is written in a zigzag pattern on a given number of rows like this: (you may want to display this pattern in a fixed font for better legibility) ",
		});
newProblem.save(function(err, problem) {});

newProblem = new Problem({
			problemTitle: "Reverse Integer",
			problemContents:"Reverse digits of an integer.\n\
\n\
Example1: x = 123, return 321\n\
Example2: x = -123, return -321 ",
		});
newProblem.save(function(err, problem) {});

newProblem = new Problem({
			problemTitle: "String to Integer (atoi)",
			problemContents:"Implement atoi to convert a string to an integer.\n\
\n\
Hint: Carefully consider all possible input cases. If you want a challenge, please do not see below and ask yourself what are the possible input cases \n\
\n\
Notes: It is intended for this problem to be specified vaguely (ie, no given input specs). You are responsible to gather all the input requirements up front. ",
		});
newProblem.save(function(err, problem) {});

newProblem = new Problem({
			problemTitle: "Palindrome Number",
			problemContents:"Determine whether an integer is a palindrome. Do this without extra space.",
		});
newProblem.save(function(err, problem) {});

newProblem = new Problem({
			problemTitle: "Regular Expression Matching",
			problemContents:"Implement regular expression matching with support for '.' and '*'.",
		});
newProblem.save(function(err, problem) {});

newProblem = new Problem({
			problemTitle: "Container With Most Water",
			problemContents:"Given n non-negative integers a1, a2, ..., an, where each represents a point at coordinate (i, ai). n vertical lines are drawn such that the two endpoints of line i is at (i, ai) and (i, 0). Find two lines, which together with x-axis forms a container, such that the container contains the most water. ",
		});
newProblem.save(function(err, problem) {});

newProblem = new Problem({
			problemTitle: "Integer to Roman",
			problemContents:"Given an integer, convert it to a roman numeral.\n\
\n\
Input is guaranteed to be within the range from 1 to 3999.",
		});
newProblem.save(function(err, problem) {});

newProblem = new Problem({
			problemTitle: "Roman to Integer ",
			problemContents:"Given a roman numeral, convert it to an integer.\n\
\n\
Input is guaranteed to be within the range from 1 to 3999.",
		});
newProblem.save(function(err, problem) {});

newProblem = new Problem({
			problemTitle: "Longest Common Prefix",
			problemContents:"Write a function to find the longest common prefix string amongst an array of strings. ",
		});
newProblem.save(function(err, problem) {});

newProblem = new Problem({
			problemTitle: "3Sum",
			problemContents:"Given an array S of n integers, are there elements a, b, c in S such that a + b + c = 0? Find all unique triplets in the array which gives the sum of zero.",
		});
newProblem.save(function(err, problem) {});

newProblem = new Problem({
			problemTitle: "3Sum Closest",
			problemContents:"Given an array S of n integers, find three integers in S such that the sum is closest to a given number, target. Return the sum of the three integers. You may assume that each input would have exactly one solution.",
		});
newProblem.save(function(err, problem) {});

newProblem = new Problem({
			problemTitle: "Letter Combinations of a Phone Number",
			problemContents:"Given a digit string, return all possible letter combinations that the number could represent.\n\
\n\
A mapping of digit to letters (just like on the telephone buttons) is given below.",
		});
newProblem.save(function(err, problem) {});
}
