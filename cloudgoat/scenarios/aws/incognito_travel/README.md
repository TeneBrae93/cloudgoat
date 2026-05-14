# Scenario: Incognito_Travel

**Size:** Medium

**Difficulty:** Moderate

**Command:** `./cloudgoat.py create incognito_travel`

## Scenario Resources

- 1 Cognito User Pool
- 1 Cognito User Pool Client
- 1 Lambda Function (Backend API)
- 1 API Gateway
- 1 S3 Bucket (Frontend Static Site)

## Scenario Start(s)

1. URL of the "Incognito Travel" website.

## Scenario Goal(s)

Gain unauthorized access to the account of `cory@hacksmarter.hsm` on the travel portal.

## Summary

In this scenario, you start as an external attacker with limited AWS credentials. Your primary target is the "Incognito Travel" portal. Through careful enumeration and exploitation of a misconfigured Cognito User Pool, you will discover a way to manipulate user attributes and bypass identity verification through email normalization inconsistencies, eventually taking over a high-value user account.

## Walkthrough - Cognito Attribute Takeover

A detailed cheat sheet & walkthrough for this route is available [here](./cheat_sheet.md). 
