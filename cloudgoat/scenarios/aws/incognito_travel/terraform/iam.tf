resource "aws_iam_user" "attacker" {
  name = "attacker-${var.cgid}"
}

resource "aws_iam_access_key" "attacker_key" {
  user = aws_iam_user.attacker.name
}

resource "aws_iam_user_policy" "attacker_policy" {
  name = "attacker-policy"
  user = aws_iam_user.attacker.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:List%",
          "cognito-idp:Describe%",
          "cognito-idp:AdminGetUser",
          "cognito-idp:UpdateUserAttributes",
          "cognito-idp:GetUser"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetObject"
        ]
        Resource = "*"
      }
    ]
  })
}
